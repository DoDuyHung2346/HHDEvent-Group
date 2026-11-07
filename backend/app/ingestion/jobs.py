import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.store.db import SessionLocal
from app.store.models import IngestJobModel
from app.ingestion.pipeline import run_ingest_pipeline

executor = ThreadPoolExecutor(max_workers=1)

def enqueue_ingest_job(
    file_path: Path,
    filename: str,
    doc_type: Optional[str] = None,
    title: Optional[str] = None
) -> Tuple[str, str]:
    job_id = f"job_{uuid.uuid4().hex[:12]}"
    doc_id = f"doc_{uuid.uuid4().hex[:12]}"

    db: Session = SessionLocal()
    try:
        job = IngestJobModel(
            job_id=job_id,
            doc_id=doc_id,
            filename=filename,
            status="queued",
            stage="validate",
            progress=0.0,
            created_at=datetime.utcnow().isoformat()
        )
        db.add(job)
        db.commit()
    finally:
        db.close()

    # Đưa vào queue thực thi tuần tự
    executor.submit(
        run_ingest_pipeline,
        job_id=job_id,
        doc_id=doc_id,
        file_path=file_path,
        filename=filename,
        doc_type_override=doc_type,
        title_override=title
    )

    return job_id, doc_id
