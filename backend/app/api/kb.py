import json
import shutil
import hashlib
import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.config import settings, BASE_DIR
from app.core.security import verify_admin_token
from app.core.schemas import DocumentItem, IngestJobResponse, ChunkPreview, SearchRequest, SearchResultItem
from app.store.db import get_db
from app.store.models import DocumentModel, IngestJobModel, ChunkModel
from app.ingestion.jobs import enqueue_ingest_job
from app.ingestion.pipeline import update_kb_version, rebuild_bm25_from_db
from app.retrieval.hybrid import hybrid_retrieve
from app.retrieval.vector_store import vector_store

router = APIRouter(dependencies=[Depends(verify_admin_token)])

UPLOAD_DIR = BASE_DIR / "data" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".xlsx", ".csv", ".md", ".txt", ".html", ".htm"}

@router.post("/documents", status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    file: UploadFile = File(...),
    doc_type: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    force: bool = Form(False),
    db: Session = Depends(get_db)
):
    embedding_error = settings.embedding_configuration_error()
    if embedding_error:
        raise HTTPException(status_code=503, detail=embedding_error)

    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Định dạng {suffix} không được hỗ trợ. Chỉ chấp nhận: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    safe_filename = Path(file.filename).name
    if not safe_filename or safe_filename in {".", ".."}:
        raise HTTPException(status_code=400, detail="Tên tệp không hợp lệ.")
    # Do not let queued uploads with the same client filename overwrite one
    # another before the single ingestion worker has read them.
    temp_path = UPLOAD_DIR / f"{uuid.uuid4().hex}_{safe_filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if temp_path.stat().st_size == 0:
        temp_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Tệp tải lên rỗng (0 byte). Vui lòng chọn lại tệp gốc.")

    if temp_path.stat().st_size > settings.MAX_UPLOAD_MB * 1024 * 1024:
        temp_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=f"Kích thước file vượt quá {settings.MAX_UPLOAD_MB}MB.")

    with open(temp_path, "rb") as uploaded:
        file_sha256 = hashlib.sha256(uploaded.read()).hexdigest()
    duplicate = db.query(DocumentModel).filter(
        DocumentModel.sha256 == file_sha256,
        DocumentModel.active == 1,
    ).first()
    if duplicate and not force:
        temp_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=409,
            detail={"message": "Tài liệu trùng lặp đang hoạt động.", "doc_id": duplicate.doc_id},
        )

    job_id, doc_id = enqueue_ingest_job(
        file_path=temp_path,
        filename=safe_filename,
        doc_type=doc_type,
        title=title
    )

    return {"job_id": job_id, "doc_id": doc_id, "status": "queued"}

@router.get("/documents", response_model=List[DocumentItem])
def list_documents(db: Session = Depends(get_db)):
    docs = db.query(DocumentModel).filter(DocumentModel.active == 1).order_by(DocumentModel.uploaded_at.desc()).all()
    results = []
    for d in docs:
        try:
            warns = json.loads(d.warnings_json or "[]")
        except:
            warns = []
        results.append(DocumentItem(
            doc_id=d.doc_id,
            filename=d.filename,
            title=d.title,
            doc_type=d.doc_type,
            version=d.version,
            status=d.status,
            size_bytes=d.size_bytes,
            uploaded_at=d.uploaded_at,
            n_chunks=d.n_chunks,
            warnings=warns,
            active=d.active
        ))
    return results

@router.get("/jobs/{job_id}", response_model=IngestJobResponse)
def get_job_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(IngestJobModel).filter(IngestJobModel.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        warns = json.loads(job.warnings_json or "[]")
    except:
        warns = []
    return IngestJobResponse(
        job_id=job.job_id,
        doc_id=job.doc_id,
        filename=job.filename,
        status=job.status,
        stage=job.stage,
        progress=job.progress,
        error=job.error,
        warnings=warns,
        n_chunks=job.chunks_total or 0,
        chunks_embedded=job.chunks_embedded or 0,
        chunks_indexed=job.chunks_indexed or 0,
    )

@router.get("/documents/{doc_id}/chunks", response_model=List[ChunkPreview])
def get_document_chunks(doc_id: str, limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    chunks = db.query(ChunkModel).filter(ChunkModel.doc_id == doc_id, ChunkModel.active == 1).order_by(ChunkModel.ordinal.asc()).offset(offset).limit(limit).all()
    res = []
    for c in chunks:
        try:
            q = json.loads(c.questions_json or "[]")
        except:
            q = []
        try:
            kw = json.loads(c.keywords_json or "[]")
        except:
            kw = []
        res.append(ChunkPreview(
            chunk_id=c.chunk_id,
            doc_id=c.doc_id,
            ordinal=c.ordinal,
            breadcrumb=c.breadcrumb or "",
            text_display=c.text_display,
            doc_type=c.doc_type,
            questions=q,
            keywords=kw
        ))
    return res

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(DocumentModel).filter(DocumentModel.doc_id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if not doc.active:
        return {"status": "ok", "message": "Tài liệu đã được xóa trước đó."}
    doc.active = 0
    doc.status = "deleted"
    db.query(ChunkModel).filter(ChunkModel.doc_id == doc_id).update({"active": 0})
    db.commit()
    warnings = []
    try:
        vector_store.delete_by_doc_id(doc_id)
    except Exception as exc:
        warnings.append(f"Vector store sẽ được làm sạch khi khởi động lại: {exc}")
    try:
        rebuild_bm25_from_db(db)
        update_kb_version(db)
    except Exception as exc:
        warnings.append(f"Chỉ mục tìm kiếm sẽ được dựng lại khi khởi động lại: {exc}")
    return {"status": "ok", "message": f"Tài liệu {doc.title} đã được xóa.", "warnings": warnings}

@router.post("/search", response_model=List[SearchResultItem])
def search_knowledge_base(req: SearchRequest, db: Session = Depends(get_db)):
    candidates = hybrid_retrieve(
        query=req.query,
        top_candidates=req.top_k,
        db=db
    )
    results: List[SearchResultItem] = []
    for cand in candidates:
        results.append(SearchResultItem(
            chunk_id=cand.chunk_id,
            doc_id=cand.doc_id,
            doc_title=cand.doc_title,
            breadcrumb=cand.breadcrumb,
            text_display=cand.text_display,
            dense_score=cand.dense_score,
            bm25_score=cand.bm25_score,
            rrf_score=cand.rrf_score
        ))
    return results
