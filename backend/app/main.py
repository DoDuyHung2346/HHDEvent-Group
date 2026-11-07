from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.core.logging import logger
from app.store.db import init_db
from app.api.health import router as health_router
from app.api.chat import router as chat_router
from app.api.feedback import router as feedback_router
from app.api.kb import router as kb_router
from app.api.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo DB
    logger.info("Initializing database...")
    init_db()
    # BM25 is in-memory. Rebuild it after every process restart so dense and
    # sparse retrieval remain consistent for documents already on disk.
    from app.store.db import SessionLocal
    from app.ingestion.pipeline import rebuild_bm25_from_db
    db = SessionLocal()
    try:
        rebuild_bm25_from_db(db)
    finally:
        db.close()
    logger.info("Application startup completed successfully.")
    yield
    logger.info("Application shutting down...")

app = FastAPI(
    title="EventViet RAG Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Hệ thống đang gặp sự cố tạm thời. Vui lòng thử lại sau.", "status": "error"}
    )

# Include Routers
app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(feedback_router, prefix="/api", tags=["Feedback"])
app.include_router(kb_router, prefix="/api/kb", tags=["Knowledge Base"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
