"""Seed existing source documents into the persistent cloud RAG stores.

Run from repository root after `.env` is configured for Supabase PostgreSQL,
Supabase Storage, and Qdrant Cloud:

    python backend/scripts/seed_rag_cloud.py --source "C:\\path\\to\\documents" --dry-run
    python backend/scripts/seed_rag_cloud.py --source "C:\\path\\to\\documents"

The script deliberately requires an explicit source directory. It never reads
or commits a local SQLite/Qdrant cache, and it skips an already active document
with the same SHA-256 unless `--force` is supplied.
"""

from __future__ import annotations

import argparse
import hashlib
import re
import sys
import uuid
from datetime import datetime
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import settings
from app.store.db import SessionLocal, init_db
from app.store.models import DocumentModel, IngestJobModel

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".xlsx", ".csv", ".md", ".txt", ".html", ".htm"}
TEMP_UPLOAD_PREFIX = re.compile(r"^[a-f0-9]{32}_", re.IGNORECASE)


def sha256_of(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def validate_cloud_configuration() -> None:
    error = settings.persistence_configuration_error()
    if error:
        raise SystemExit(f"Không thể seed RAG cloud: {error}")
    if not settings.DB_URL.startswith(("postgres://", "postgresql://")):
        raise SystemExit("Không thể seed RAG cloud: DB_URL phải là PostgreSQL Supabase, không phải SQLite local.")
    if settings.VECTOR_BACKEND != "qdrant_server":
        raise SystemExit("Không thể seed RAG cloud: VECTOR_BACKEND phải là qdrant_server.")


def source_files(source: Path) -> list[Path]:
    return sorted(
        path for path in source.rglob("*")
        if path.is_file() and path.suffix.lower() in ALLOWED_EXTENSIONS
    )


def display_filename(path: Path) -> str:
    """Strip the temporary UUID prefix produced by the local upload endpoint."""
    return TEMP_UPLOAD_PREFIX.sub("", path.name)


def seed_one(path: Path, force: bool) -> str:
    # Import only for a real run. Importing the pipeline initializes Qdrant,
    # whereas --dry-run must remain usable offline.
    from app.ingestion.pipeline import run_ingest_pipeline

    file_hash = sha256_of(path)
    filename = display_filename(path)
    db = SessionLocal()
    try:
        existing = db.query(DocumentModel).filter(
            DocumentModel.sha256 == file_hash,
            DocumentModel.active == 1,
        ).first()
        if existing and not force:
            return f"SKIP  {filename} (đã có: {existing.title}, {existing.doc_id})"

        job_id = f"job_{uuid.uuid4().hex[:12]}"
        doc_id = f"doc_{uuid.uuid4().hex[:12]}"
        db.add(IngestJobModel(
            job_id=job_id,
            doc_id=doc_id,
            filename=filename,
            status="queued",
            stage="validate",
            progress=0.0,
            created_at=datetime.utcnow().isoformat(),
        ))
        db.commit()
    finally:
        db.close()

    # Run sequentially so each completed file has fully committed metadata,
    # vectors and sparse index before the next file starts.
    run_ingest_pipeline(
        job_id=job_id,
        doc_id=doc_id,
        file_path=path,
        filename=filename,
    )

    db = SessionLocal()
    try:
        job = db.query(IngestJobModel).filter(IngestJobModel.job_id == job_id).first()
        if job and job.status == "ready":
            return f"READY {filename} ({job.chunks_indexed or 0} chunks)"
        return f"FAIL  {filename}: {(job.error if job else 'không tìm thấy trạng thái job')}"
    finally:
        db.close()


def main() -> None:
    # Windows terminals may default to a legacy code page; preserve Vietnamese
    # filenames/messages instead of aborting an otherwise valid seed run.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    parser = argparse.ArgumentParser(description="Nạp file nguồn vào Supabase + Qdrant Cloud RAG.")
    parser.add_argument("--source", required=True, type=Path, help="Thư mục chứa file nguồn DOCX/PDF/XLSX/CSV/MD/TXT/HTML.")
    parser.add_argument("--dry-run", action="store_true", help="Chỉ liệt kê file sẽ xử lý, không kết nối hoặc ghi dữ liệu.")
    parser.add_argument("--force", action="store_true", help="Nạp lại file có SHA-256 đã tồn tại.")
    args = parser.parse_args()

    source = args.source.expanduser().resolve()
    if not source.is_dir():
        raise SystemExit(f"Không tìm thấy thư mục nguồn: {source}")
    files = source_files(source)
    if not files:
        raise SystemExit("Không tìm thấy file được hỗ trợ trong thư mục nguồn.")

    print(f"Tìm thấy {len(files)} file trong: {source}")
    for file_path in files:
        print(f" - {file_path.relative_to(source)}")
    if args.dry_run:
        print("Dry run hoàn tất. Không có dữ liệu nào được ghi.")
        return

    validate_cloud_configuration()
    init_db()
    print("Bắt đầu nạp RAG cloud tuần tự...")
    results = [seed_one(file_path, args.force) for file_path in files]
    print("\n".join(results))
    failed = sum(result.startswith("FAIL") for result in results)
    if failed:
        raise SystemExit(f"Có {failed} file không nạp được. Xem dòng FAIL phía trên.")


if __name__ == "__main__":
    main()
