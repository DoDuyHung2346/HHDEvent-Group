import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional, List
from sqlalchemy.orm import Session
from app.config import settings
from app.core.logging import logger
from app.llm import get_embedder
from app.llm.base import EmbeddingError, validate_and_normalize_embeddings
from app.store.db import SessionLocal
from app.store.models import DocumentModel, ChunkModel, ParentModel, IngestJobModel, KBMetaModel
from app.ingestion.parsers import parse_file
from app.ingestion.chunkers import chunk_document
from app.ingestion.quality import inspect_quality
from app.retrieval.vector_store import vector_store
from app.retrieval.bm25_index import bm25_holder
from app.retrieval.tokenizer_vi import tokenize_vi, tokenize_ascii

def update_job_progress(
    job_id: str,
    stage: str,
    progress: float,
    error: Optional[str] = None,
    warnings: Optional[List[str]] = None,
    chunks_total: Optional[int] = None,
    chunks_embedded: Optional[int] = None,
    chunks_indexed: Optional[int] = None,
):
    db: Session = SessionLocal()
    try:
        job = db.query(IngestJobModel).filter(IngestJobModel.job_id == job_id).first()
        if job:
            if error:
                # Preserve the last real stage so the UI can accurately show
                # whether parse/chunk/embed/index failed.
                job.error = error
                job.status = "failed"
                job.finished_at = datetime.utcnow().isoformat()
            else:
                job.stage = stage
                job.progress = progress
                if stage == "done":
                    job.status = "ready"
                    job.finished_at = datetime.utcnow().isoformat()
                else:
                    job.status = "running"

            if warnings is not None:
                job.warnings_json = json.dumps(warnings, ensure_ascii=False)
            if chunks_total is not None:
                job.chunks_total = chunks_total
            if chunks_embedded is not None:
                job.chunks_embedded = chunks_embedded
            if chunks_indexed is not None:
                job.chunks_indexed = chunks_indexed
            db.commit()
    finally:
        db.close()

def update_kb_version(db: Session, commit: bool = True) -> str:
    docs = db.query(DocumentModel).filter(DocumentModel.active == 1).order_by(DocumentModel.doc_id.asc()).all()
    digest_str = "-".join([f"{d.doc_id}:v{d.version}:{d.sha256}" for d in docs])
    kb_version = hashlib.sha1(digest_str.encode("utf-8")).hexdigest()[:12] if docs else "v0"

    meta = db.query(KBMetaModel).filter(KBMetaModel.key == "kb_version").first()
    if not meta:
        meta = KBMetaModel(key="kb_version", value=kb_version)
        db.add(meta)
    else:
        meta.value = kb_version
    if commit:
        db.commit()
    return kb_version


def update_embedding_metadata(db: Session, commit: bool = True) -> None:
    """Record the embedding space that produced the currently active index."""
    for key, value in {
        "embed_provider": settings.EMBED_PROVIDER,
        "embed_model": settings.EMBED_MODEL,
        "embed_dim": str(settings.EMBED_DIM),
    }.items():
        meta = db.query(KBMetaModel).filter(KBMetaModel.key == key).first()
        if meta is None:
            db.add(KBMetaModel(key=key, value=value))
        else:
            meta.value = value
    if commit:
        db.commit()

def rebuild_bm25_from_db(db: Session):
    chunks = db.query(ChunkModel).filter(ChunkModel.active == 1).all()
    if not chunks:
        bm25_holder.build_and_swap([], [], [])
        return
    cids = [c.chunk_id for c in chunks]
    corpus_vi = [tokenize_vi(c.text_index) for c in chunks]
    corpus_ascii = [tokenize_ascii(c.text_index) for c in chunks]
    bm25_holder.build_and_swap(cids, corpus_vi, corpus_ascii)

def run_ingest_pipeline(job_id: str, doc_id: str, file_path: Path, filename: str, doc_type_override: Optional[str] = None, title_override: Optional[str] = None):
    logger.info(f"Starting ingestion pipeline for job {job_id}, file {filename}")
    db: Session = SessionLocal()
    vectors_published = False
    try:
        # Stage 1: Validate
        update_job_progress(job_id, stage="validate", progress=0.1)
        if not file_path.exists():
            raise FileNotFoundError(f"File {file_path} không tồn tại.")
        file_size = file_path.stat().st_size
        with open(file_path, "rb") as f:
            file_sha256 = hashlib.sha256(f.read()).hexdigest()

        # Stage 2: Parse
        update_job_progress(job_id, stage="parse", progress=0.25)
        markdown_text, metadata, parse_warns, tables_json = parse_file(file_path)

        doc_type = doc_type_override or metadata.get("doc_type") or "generic"
        title = title_override or metadata.get("title") or Path(filename).stem

        # Stage 3: Chunk
        update_job_progress(job_id, stage="chunk", progress=0.4)
        raw_chunks = chunk_document(
            text=markdown_text,
            doc_type=doc_type,
            metadata=metadata,
            doc_title=title,
            tables_json=tables_json
        )

        if not raw_chunks:
            raise ValueError("Tài liệu không tạo được chunk hợp lệ nên không thể index.")
        update_job_progress(job_id, stage="chunk", progress=0.5, chunks_total=len(raw_chunks))

        # Stage 4: Quality Check
        update_job_progress(job_id, stage="quality", progress=0.55)
        quality_warns = inspect_quality(markdown_text, raw_chunks, doc_type, metadata)
        all_warnings = parse_warns + quality_warns

        # Stage 5: Embed
        update_job_progress(
            job_id, stage="embed", progress=0.55, warnings=all_warnings,
            chunks_total=len(raw_chunks), chunks_embedded=0, chunks_indexed=0,
        )
        embedder = get_embedder()
        chunk_texts_to_embed = [f"{c.breadcrumb}\n{c.text_display}" for c in raw_chunks]
        vectors: List[List[float]] = []

        batch_size = settings.EMBED_BATCH
        for i in range(0, len(chunk_texts_to_embed), batch_size):
            batch = chunk_texts_to_embed[i:i + batch_size]
            vecs = embedder.embed_texts(batch, task_type="RETRIEVAL_DOCUMENT")
            vectors.extend(validate_and_normalize_embeddings(vecs, len(batch), settings.EMBED_DIM))
            completed = len(vectors)
            update_job_progress(
                job_id,
                stage="embed",
                progress=0.55 + (0.25 * completed / len(raw_chunks)),
                chunks_total=len(raw_chunks),
                chunks_embedded=completed,
            )

        # Do not rely on zip(): a provider bug must never silently produce a
        # partial document that appears ready to users.
        if len(vectors) != len(raw_chunks):
            raise EmbeddingError("Số embedding không khớp số chunk; đã hủy index tài liệu.")

        # Stage 6: Store to SQLite & Qdrant
        update_job_progress(
            job_id, stage="index", progress=0.82, chunks_total=len(raw_chunks),
            chunks_embedded=len(vectors), chunks_indexed=0,
        )

        existing_doc = db.query(DocumentModel).filter(DocumentModel.filename == filename, DocumentModel.active == 1).first()
        version = (existing_doc.version + 1) if existing_doc else 1

        doc_record = DocumentModel(
            doc_id=doc_id,
            filename=filename,
            title=title,
            doc_type=doc_type,
            version=version,
            status="processing",
            sha256=file_sha256,
            size_bytes=file_size,
            uploaded_at=datetime.utcnow().isoformat(),
            effective_date=metadata.get("effective_date"),
            expires_date=metadata.get("expires_date"),
            n_chunks=len(raw_chunks),
            warnings_json=json.dumps(all_warnings, ensure_ascii=False),
            active=1
        )
        db.add(doc_record)

        chunk_ids: List[str] = []
        payloads: List[dict] = []

        for c, vec in zip(raw_chunks, vectors):
            chunk_id = f"{doc_id}:v{version}:{c.ordinal:04d}"
            chunk_ids.append(chunk_id)

            payload = {
                "chunk_id": chunk_id,
                "doc_id": doc_id,
                "doc_type": c.doc_type,
                "category": c.category,
                "active": 1,
                "effective_date": metadata.get("effective_date"),
                "expires_date": metadata.get("expires_date")
            }
            payloads.append(payload)

            chunk_record = ChunkModel(
                chunk_id=chunk_id,
                doc_id=doc_id,
                ordinal=c.ordinal,
                parent_id=c.parent_id,
                breadcrumb=c.breadcrumb,
                text_display=c.text_display,
                text_index=f"{c.breadcrumb}\n{c.text_display}",
                tokens_vi=c.text_display,
                content_hash=c.content_hash,
                doc_type=c.doc_type,
                category=c.category,
                effective_date=metadata.get("effective_date"),
                expires_date=metadata.get("expires_date"),
                table_json=c.table_json,
                questions_json="[]",
                keywords_json="[]",
                active=1
            )
            db.add(chunk_record)

            if c.parent_id and c.parent_text:
                existing_parent = db.query(ParentModel).filter(ParentModel.parent_id == c.parent_id).first()
                if not existing_parent:
                    db.add(ParentModel(parent_id=c.parent_id, doc_id=doc_id, text=c.parent_text))

        db.flush()

        # Publish the new vectors before retiring the previous version.  This
        # keeps the old version searchable if the vector database is unavailable.
        vector_store.upsert_chunks(chunk_ids, vectors, payloads)
        vectors_published = True
        vector_store.verify_chunks(chunk_ids)

        if existing_doc:
            existing_doc.active = 0
            db.query(ChunkModel).filter(ChunkModel.doc_id == existing_doc.doc_id).update({"active": 0})

        # Build the sparse index before publishing the new document in SQLite.
        # Queries cannot see a ready document until dense and BM25 retrieval are
        # both available.
        rebuild_bm25_from_db(db)
        if not bm25_holder.is_ready():
            raise RuntimeError("BM25 chưa sẵn sàng sau khi rebuild index.")
        # Include KB metadata in the same publish transaction. A document is
        # never visible as ready while any part of indexing is incomplete.
        update_kb_version(db, commit=False)
        update_embedding_metadata(db, commit=False)
        doc_record.status = "ready"

        # Atomically switch the relational source of truth only after all new
        # vectors are accepted and both retrieval indexes are ready.
        db.commit()

        # The transaction has committed, so it is now safe to use the separate
        # job-progress session. Calling it earlier caused two SQLite writers.
        update_job_progress(
            job_id, stage="index", progress=0.97, chunks_total=len(raw_chunks),
            chunks_embedded=len(vectors), chunks_indexed=len(chunk_ids),
        )

        if existing_doc:
            vector_store.delete_by_doc_id(existing_doc.doc_id)

        # Stage 7: Signal completion only after SQLite, Qdrant and BM25 are ready.
        update_job_progress(
            job_id, stage="done", progress=1.0, warnings=all_warnings,
            chunks_total=len(raw_chunks), chunks_embedded=len(vectors), chunks_indexed=len(chunk_ids),
        )
        logger.info(f"Ingestion successful for {filename}: {len(raw_chunks)} chunks embedded and indexed.")

    except Exception as e:
        logger.exception(f"Ingestion failed for job {job_id}: {str(e)}")
        db.rollback()
        if vectors_published:
            try:
                vector_store.delete_by_doc_id(doc_id)
            except Exception as cleanup_error:
                logger.error("Không thể dọn vector của job thất bại %s: %s", job_id, cleanup_error)
        # Restore the sparse index from the persisted DB if an uncommitted
        # rebuild failed midway through the publish transaction.
        restore_db = SessionLocal()
        try:
            rebuild_bm25_from_db(restore_db)
        finally:
            restore_db.close()
        update_job_progress(job_id, stage="failed", progress=1.0, error=str(e))
    finally:
        db.close()
