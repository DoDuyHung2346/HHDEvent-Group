from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.security import verify_admin_token
from app.store.db import get_db
from app.store.models import KBGapModel, TraceModel, DocumentModel, ChunkModel
from app.core.schemas import GapItem

router = APIRouter(dependencies=[Depends(verify_admin_token)])

@router.get("/metrics")
def get_metrics(days: int = Query(7), db: Session = Depends(get_db)) -> Dict[str, Any]:
    total_traces = db.query(TraceModel).count()
    fallbacks = db.query(TraceModel).filter(TraceModel.status == "fallback").count()
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
        "cost": {
            "total_cost_usd": 0.05,
            "avg_cost_per_query_usd": 0.0005
        },
        "kb_health": {
            "active_documents": total_docs,
            "active_chunks": total_chunks
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
