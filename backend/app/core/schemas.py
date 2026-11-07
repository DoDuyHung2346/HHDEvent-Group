from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

# Health
class HealthResponse(BaseModel):
    status: str
    llm: str
    embedder: str
    reranker: str
    vector_count: int
    bm25_chunks: int
    kb_version: str
    embed_dim_ok: bool
    embedding_config_error: Optional[str] = None
    uptime_seconds: float

# Chat
class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class StaffContextItem(BaseModel):
    """Thông tin nhân viên được truyền từ frontend để LLM chỉ đề xuất đúng danh sách"""
    id: str
    name: str
    phone: str
    roleLabel: str
    shift: str = "all_day"
    status: str = "active"

class ChatRequest(BaseModel):
    session_id: str
    message: str
    history: List[ChatMessage] = Field(default_factory=list)
    locale: str = "vi"
    staff_context: Optional[List[StaffContextItem]] = None  # Danh sách nhân viên từ frontend

class Citation(BaseModel):
    index: int
    doc_id: str
    chunk_id: str
    doc_title: str
    section: str
    snippet: str

class ActionPrefill(BaseModel):
    note: Optional[str] = None

class Action(BaseModel):
    type: Literal["none", "open_booking", "call_hotline"] = "none"
    prefill: Optional[ActionPrefill] = None
    hotline: Optional[str] = None

class ChatMeta(BaseModel):
    intent: str
    cache: str
    latency_ms: int
    kb_version: str
    debug: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    trace_id: str
    status: Literal[
        "answered",
        "answered_with_caution",
        "fallback",
        "handoff",
        "degraded",
        "smalltalk",
        "out_of_scope",
        "error"
    ]
    answer: str
    citations: List[Citation] = Field(default_factory=list)
    follow_ups: List[str] = Field(default_factory=list)
    action: Action = Field(default_factory=Action)
    meta: ChatMeta

# Ingestion & Documents
class DocumentItem(BaseModel):
    doc_id: str
    filename: str
    title: str
    doc_type: str
    version: int
    status: str
    size_bytes: int
    uploaded_at: str
    n_chunks: int
    warnings: List[str] = Field(default_factory=list)
    active: int

class IngestJobResponse(BaseModel):
    job_id: str
    doc_id: str
    filename: str
    status: str
    stage: str
    progress: float
    error: Optional[str] = None
    warnings: List[str] = Field(default_factory=list)
    n_chunks: int = 0
    chunks_embedded: int = 0
    chunks_indexed: int = 0

class ChunkPreview(BaseModel):
    chunk_id: str
    doc_id: str
    ordinal: int
    breadcrumb: str
    text_display: str
    doc_type: str
    questions: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)

# Search
class SearchRequest(BaseModel):
    query: str
    top_k: int = 5

class SearchResultItem(BaseModel):
    chunk_id: str
    doc_id: str
    doc_title: str
    breadcrumb: str
    text_display: str
    dense_score: Optional[float] = None
    bm25_score: Optional[float] = None
    rrf_score: float
    rerank_score: Optional[float] = None

# Feedback
class FeedbackRequest(BaseModel):
    trace_id: str
    rating: int = Field(..., ge=-1, le=1)
    comment: Optional[str] = None

# Gaps
class GapItem(BaseModel):
    id: int
    query_norm: str
    first_seen: str
    last_seen: str
    count: int
    resolved: int
