import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.config import settings
from app.core.schemas import HealthResponse
from app.store.db import get_db
from app.store.models import ChunkModel, KBMetaModel

router = APIRouter()
START_TIME = time.time()

@router.get("/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    active_chunks = db.query(ChunkModel).filter(ChunkModel.active == 1).count()
    
    kb_meta_ver = db.query(KBMetaModel).filter(KBMetaModel.key == "kb_version").first()
    kb_version = kb_meta_ver.value if kb_meta_ver else "v0"

    kb_meta_dim = db.query(KBMetaModel).filter(KBMetaModel.key == "embed_dim").first()
    kb_meta_model = db.query(KBMetaModel).filter(KBMetaModel.key == "embed_model").first()
    try:
        embed_dim_ok = not kb_meta_dim or int(kb_meta_dim.value) == settings.EMBED_DIM
    except ValueError:
        embed_dim_ok = False
    if kb_meta_model and kb_meta_model.value != settings.EMBED_MODEL:
        embed_dim_ok = False

    uptime = time.time() - START_TIME

    return HealthResponse(
        status="ok" if embed_dim_ok and not settings.embedding_configuration_error() else "degraded",
        llm=settings.LLM_PROVIDER,
        embedder=settings.EMBED_PROVIDER,
        reranker=settings.RERANK_PROVIDER,
        vector_count=active_chunks,
        bm25_chunks=active_chunks,
        kb_version=kb_version,
        embed_dim_ok=embed_dim_ok,
        embedding_config_error=settings.embedding_configuration_error(),
        uptime_seconds=round(uptime, 2)
    )
