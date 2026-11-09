from sqlalchemy import Column, String, Integer, Float, Text, LargeBinary, ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class DocumentModel(Base):
    __tablename__ = "documents"

    doc_id = Column(String, primary_key=True)
    filename = Column(String, nullable=False)
    title = Column(String, nullable=False)
    doc_type = Column(String, nullable=False)
    version = Column(Integer, default=1)
    status = Column(String, default="queued")  # queued|processing|ready|failed|deleted
    sha256 = Column(String, nullable=False)
    size_bytes = Column(Integer, default=0)
    storage_backend = Column(String, default="local")
    storage_path = Column(String, nullable=True)
    uploaded_at = Column(String, nullable=False)
    effective_date = Column(String, nullable=True)
    expires_date = Column(String, nullable=True)
    n_chunks = Column(Integer, default=0)
    warnings_json = Column(Text, default="[]")
    active = Column(Integer, default=1)

class ChunkModel(Base):
    __tablename__ = "chunks"

    chunk_id = Column(String, primary_key=True)
    doc_id = Column(String, ForeignKey("documents.doc_id"), nullable=False)
    ordinal = Column(Integer, nullable=False)
    parent_id = Column(String, nullable=True)
    breadcrumb = Column(String, default="")
    text_display = Column(Text, nullable=False)
    text_index = Column(Text, nullable=False)
    tokens_vi = Column(Text, default="")
    content_hash = Column(String, nullable=False)
    doc_type = Column(String, nullable=False)
    category = Column(String, nullable=True)
    effective_date = Column(String, nullable=True)
    expires_date = Column(String, nullable=True)
    page = Column(Integer, nullable=True)
    table_json = Column(Text, nullable=True)
    questions_json = Column(Text, default="[]")
    keywords_json = Column(Text, default="[]")
    context_summary = Column(Text, nullable=True)
    enriched = Column(Integer, default=0)
    active = Column(Integer, default=1)

class ChunkQuestionModel(Base):
    __tablename__ = "chunk_questions"

    qid = Column(String, primary_key=True)
    chunk_id = Column(String, ForeignKey("chunks.chunk_id"), nullable=False)
    question = Column(String, nullable=False)
    embedding = Column(LargeBinary, nullable=True)  # float32 bytes

class ParentModel(Base):
    __tablename__ = "parents"

    parent_id = Column(String, primary_key=True)
    doc_id = Column(String, ForeignKey("documents.doc_id"), nullable=False)
    text = Column(Text, nullable=False)

class IngestJobModel(Base):
    __tablename__ = "ingest_jobs"

    job_id = Column(String, primary_key=True)
    doc_id = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    status = Column(String, default="queued")  # queued|processing|ready|failed
    stage = Column(String, default="validate")
    progress = Column(Float, default=0.0)
    error = Column(Text, nullable=True)
    warnings_json = Column(Text, default="[]")
    chunks_total = Column(Integer, default=0)
    chunks_embedded = Column(Integer, default=0)
    chunks_indexed = Column(Integer, default=0)
    created_at = Column(String, nullable=False)
    finished_at = Column(String, nullable=True)

class KBMetaModel(Base):
    __tablename__ = "kb_meta"

    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)

class TraceModel(Base):
    __tablename__ = "traces"

    trace_id = Column(String, primary_key=True)
    ts = Column(String, nullable=False)
    session_id = Column(String, nullable=False)
    query = Column(Text, nullable=False)
    standalone_query = Column(Text, nullable=True)
    intent = Column(String, nullable=True)
    status = Column(String, nullable=False)
    cache = Column(String, default="none")
    kb_version = Column(String, default="")
    retrieved_json = Column(Text, default="[]")
    gate_json = Column(Text, default="{}")
    answer = Column(Text, nullable=True)
    citations_json = Column(Text, default="[]")
    followups_json = Column(Text, default="[]")
    latency_json = Column(Text, default="{}")
    tokens_json = Column(Text, default="{}")
    cost_usd = Column(Float, default=0.0)
    error = Column(Text, nullable=True)

class FeedbackModel(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, autoincrement=True)
    trace_id = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    ts = Column(String, nullable=False)

class KBGapModel(Base):
    __tablename__ = "kb_gaps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    query_norm = Column(String, unique=True, nullable=False)
    first_seen = Column(String, nullable=False)
    last_seen = Column(String, nullable=False)
    count = Column(Integer, default=1)
    last_trace_id = Column(String, nullable=True)
    resolved = Column(Integer, default=0)
