from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.schemas import FeedbackRequest
from app.store.db import get_db
from app.store.models import FeedbackModel

router = APIRouter()

@router.post("/feedback")
def submit_feedback(req: FeedbackRequest, db: Session = Depends(get_db)):
    fb = FeedbackModel(
        trace_id=req.trace_id,
        rating=req.rating,
        comment=req.comment,
        ts=datetime.utcnow().isoformat()
    )
    db.add(fb)
    db.commit()
    return {"status": "ok"}
