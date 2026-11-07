from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.llm import get_reranker
from app.store.db import SessionLocal
from app.store.models import ParentModel
from app.retrieval.hybrid import RetrievedCandidate

def rerank_and_expand(
    query: str,
    candidates: List[RetrievedCandidate],
    top_k: int = settings.CONTEXT_TOPK,
    db: Optional[Session] = None
) -> List[RetrievedCandidate]:
    if not candidates:
        return []

    texts = [c.text_display for c in candidates]
    reranker = get_reranker()
    try:
        ranked_scores = reranker.rerank(query, texts)
        score_map = {idx: s for idx, s in ranked_scores}
        for i, c in enumerate(candidates):
            c.conf = round(score_map.get(i, c.conf), 4)
        candidates.sort(key=lambda x: x.conf, reverse=True)
    except Exception:
        # Nếu rerank lỗi, dùng thứ hạng rrf hiện tại
        for c in candidates:
            c.conf = c.rrf_score

    selected = candidates[:top_k]

    # Parent expansion nếu có parent_id
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        seen_parents = set()
        for c in selected:
            if c.parent_id and c.parent_id not in seen_parents:
                parent = db.query(ParentModel).filter(ParentModel.parent_id == c.parent_id).first()
                if parent:
                    c.text_display = parent.text
                    seen_parents.add(c.parent_id)
        return selected
    finally:
        if close_db:
            db.close()
