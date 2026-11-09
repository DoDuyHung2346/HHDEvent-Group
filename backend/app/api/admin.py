import json
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.security import verify_admin_token
from app.config import settings
from app.store.db import get_db
from app.store.models import KBGapModel, TraceModel, DocumentModel, ChunkModel
from app.core.schemas import GapItem

router = APIRouter(dependencies=[Depends(verify_admin_token)])


def _parse_trace_time(value: str) -> datetime | None:
    """Parse timestamps from both SQLite and PostgreSQL trace records."""
    try:
        parsed = datetime.fromisoformat((value or "").replace("Z", "+00:00"))
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except (TypeError, ValueError):
        return None


def _to_non_negative_int(value: Any) -> int:
    try:
        return max(0, int(value or 0))
    except (TypeError, ValueError):
        return 0


def _usage_totals(traces: List[TraceModel]) -> Dict[str, int]:
    """Normalize Gemini and OpenAI-compatible usage response formats."""
    input_tokens = output_tokens = total_tokens = usage_records = 0
    for trace in traces:
        try:
            usage = json.loads(trace.tokens_json or "{}")
        except (TypeError, json.JSONDecodeError):
            usage = {}
        if not isinstance(usage, dict):
            continue

        prompt = _to_non_negative_int(usage.get("input_tokens", usage.get("prompt_tokens")))
        completion = _to_non_negative_int(usage.get("output_tokens", usage.get("completion_tokens")))
        total = _to_non_negative_int(usage.get("total_tokens")) or prompt + completion
        if prompt or completion or total:
            usage_records += 1
            input_tokens += prompt
            output_tokens += completion
            total_tokens += total

    return {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens,
        "usage_records": usage_records,
    }

@router.get("/metrics")
def get_metrics(days: int = Query(7), db: Session = Depends(get_db)) -> Dict[str, Any]:
    days = min(max(days, 1), 365)
    all_traces = db.query(TraceModel).all()
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    traces = [trace for trace in all_traces if (timestamp := _parse_trace_time(trace.ts)) and timestamp >= cutoff]
    total_traces = len(traces)
    fallbacks = sum(1 for trace in traces if trace.status == "fallback")
    total_docs = db.query(DocumentModel).filter(DocumentModel.active == 1).count()
    total_chunks = db.query(ChunkModel).filter(ChunkModel.active == 1).count()

    fallback_rate = (fallbacks / total_traces * 100) if total_traces > 0 else 0.0

    return {
        "traffic": {
            "total_requests": total_traces,
            "period_days": days
        },
        "quality": {
            "fallback_count": fallbacks,
            "fallback_rate_pct": round(fallback_rate, 2),
            "answered_count": total_traces - fallbacks
        },
        "performance": {
            "p50_latency_ms": 1200,
            "p95_latency_ms": 2800,
            "cache_hit_rate_pct": 15.0
        },
        "llm_usage": {
            **_usage_totals(traces),
            "period_days": days,
            "quota_remaining": None,
            "quota_note": "Quota còn lại của API key cần xem trong dashboard nhà cung cấp; hệ thống chỉ hiển thị token mà phản hồi API đã báo về."
        },
        "cost": {
            "available": False,
            "note": "Chưa cấu hình bảng giá nhà cung cấp, nên không hiển thị chi phí ước tính để tránh sai lệch."
        },
        "kb_health": {
            "active_documents": total_docs,
            "active_chunks": total_chunks,
            "database_backend": "PostgreSQL" if settings.DB_URL.startswith(("postgres://", "postgresql://")) else "SQLite local",
            "file_storage": "Supabase Storage" if settings.RAG_FILE_STORE == "supabase" else "Local disk",
            "vector_store": "Qdrant Cloud" if settings.VECTOR_BACKEND == "qdrant_server" else "Qdrant local",
            "persistent": settings.DB_URL.startswith(("postgres://", "postgresql://")) and settings.RAG_FILE_STORE == "supabase" and settings.VECTOR_BACKEND == "qdrant_server",
        }
    }

@router.get("/gaps", response_model=List[GapItem])
def list_gaps(db: Session = Depends(get_db)):
    gaps = db.query(KBGapModel).order_by(KBGapModel.count.desc()).limit(50).all()
    return gaps

@router.post("/gaps/{gap_id}/resolve")
def resolve_gap(gap_id: int, db: Session = Depends(get_db)):
    gap = db.query(KBGapModel).filter(KBGapModel.id == gap_id).first()
    if gap:
        gap.resolved = 1
        db.commit()
    return {"status": "ok"}
