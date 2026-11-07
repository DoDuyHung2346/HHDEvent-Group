from pathlib import Path
from typing import List, Optional, Dict, Any
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import yaml

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[str(BASE_DIR.parent / ".env"), str(BASE_DIR / ".env")],
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_ENV: str = "dev"
    ADMIN_TOKEN: str = "eventviet-admin-secret-token-2026"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    RATE_LIMIT_CHAT: str = "20/minute"
    RATE_LIMIT_UPLOAD: str = "10/hour"
    MAX_UPLOAD_MB: int = 20
    MAX_PDF_PAGES: int = 200
    MAX_QUERY_CHARS: int = 500
    HISTORY_TURNS: int = 4

    # LLM
    LLM_PROVIDER: str = "gemini"  # gemini | fake
    LLM_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gemini-3.8-flash"
    LLM_BASE_URL: Optional[str] = None
    LLM_TEMPERATURE: float = 0.2
    LLM_MAX_OUTPUT_TOKENS: int = 700
    LLM_TIMEOUT_S: int = 20

    # Embedding
    EMBED_PROVIDER: str = "gemini"  # gemini | local_st | fake
    EMBED_MODEL: str = "gemini-embedding-001"
    EMBED_DIM: int = 768
    EMBED_BATCH: int = 64

    # Rerank
    RERANK_PROVIDER: str = "none"  # local_bge | llm | none
    RERANK_MODEL: str = "BAAI/bge-reranker-v2-m3"
    RERANK_CANDIDATES: int = 15

    # Vector store
    VECTOR_BACKEND: str = "qdrant_local"  # qdrant_local | qdrant_server | memory
    QDRANT_PATH: str = "./backend/data/qdrant"
    QDRANT_URL: Optional[str] = None
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION: str = "kb_chunks"

    # DB / Cache
    DB_URL: str = "sqlite:///./backend/data/app.db"
    CACHE_BACKEND: str = "memory"
    REDIS_URL: Optional[str] = None
    EXACT_CACHE_TTL_S: int = 21600
    SEMANTIC_CACHE_THRESHOLD: float = 0.96

    # Retrieval
    TOPK_DENSE: int = 20
    TOPK_BM25: int = 20
    RRF_K: int = 60
    CONTEXT_TOPK: int = 5
    DOC_TYPE_BOOST: float = 0.15

    # Gating
    GATE_ANSWER_MIN: float = 0.3
    GATE_CAUTION_MIN: float = 0.1
    GATE_MARGIN_MIN: float = 0.03

    # Ingestion
    ENRICH: bool = False
    ENRICH_CONCURRENCY: int = 4
    CHUNK_TARGET_SYLLABLES: int = 350
    CHUNK_MAX_SYLLABLES: int = 550
    CHUNK_MIN_SYLLABLES: int = 40
    CHUNK_OVERLAP_RATIO: float = 0.12
    SEED_ON_EMPTY: bool = True

    # Observability
    LOG_LEVEL: str = "INFO"
    LOG_PII_MASK: bool = True

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    def embedding_configuration_error(self) -> Optional[str]:
        """Validate embedding credentials before creating an ingest job."""
        if self.EMBED_PROVIDER != "gemini":
            return None
        key = (self.GEMINI_API_KEY or "").strip()
        if not key or "PASTE_" in key or "YOUR_" in key:
            return "Thiếu GEMINI_API_KEY cho Gemini Embedding."
        if not key.startswith("AIza"):
            return (
                "GEMINI_API_KEY không phải Google Gemini API key hợp lệ (thường bắt đầu bằng 'AIza'). "
                "Key Vilao/proxy phải đặt tại LLM_API_KEY; embedding cần Google key hoặc EMBED_PROVIDER=local_st."
            )
        return None

    def load_company_info(self) -> Dict[str, Any]:
        company_path = BASE_DIR / "data" / "company.yaml"
        if company_path.exists():
            with open(company_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f) or {}
        return {
            "business_name": "EventViet Demo",
            "bot_name": "EventViet AI",
            "hotline": "1900 6886",
            "email": "contact@eventviet.demo",
            "working_hours": "08:00–18:00, T2–T7",
            "allowed_phones": ["1900 6886"],
            "allowed_urls": ["http://localhost:3000"]
        }

settings = Settings()
company_info = settings.load_company_info()
