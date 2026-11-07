from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.llm import get_embedder
from app.llm.base import validate_and_normalize_embeddings
from app.store.db import SessionLocal
from app.store.models import ChunkModel, DocumentModel
from app.retrieval.tokenizer_vi import tokenize_vi, tokenize_ascii, expand_synonyms
from app.retrieval.bm25_index import bm25_holder
from app.retrieval.vector_store import vector_store

class RetrievedCandidate(BaseModel):
    chunk_id: str
    doc_id: str
    doc_title: str
    doc_type: str
    breadcrumb: str
    text_display: str
    parent_id: Optional[str] = None
    dense_score: float = 0.0
    bm25_score: float = 0.0
    rrf_score: float = 0.0
    conf: float = 0.0  # sau khi rerank

def rrf(rank_lists: List[List[str]], k: int = 60) -> Dict[str, float]:
    scores: Dict[str, float] = {}
    for ranks in rank_lists:
        for r, cid in enumerate(ranks, 1):
            scores[cid] = scores.get(cid, 0.0) + 1.0 / (k + r)
    return scores

def hybrid_retrieve(
    query: str,
    doc_type_hint: Optional[str] = None,
    top_candidates: int = settings.RERANK_CANDIDATES,
    db: Optional[Session] = None
) -> List[RetrievedCandidate]:
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # 1. Chuẩn bị query tokens
        expanded_q = expand_synonyms(query)
        q_vi = tokenize_vi(expanded_q)
        q_ascii = tokenize_ascii(query)

        # 2. Dense search
        embedder = get_embedder()
        q_vec = validate_and_normalize_embeddings(
            [embedder.embed_query(query)], expected_count=1, expected_dim=settings.EMBED_DIM
        )[0]
        dense_hits = vector_store.search(q_vec, top_k=settings.TOPK_DENSE, active_only=True)
        dense_cids = [cid for cid, _ in dense_hits]
        dense_score_map = {cid: score for cid, score in dense_hits}

        # 3. BM25 Search
        bm25_vi_hits = bm25_holder.search_vi(q_vi, top_k=settings.TOPK_BM25)
        bm25_vi_cids = [cid for cid, _ in bm25_vi_hits]

        bm25_ascii_hits = bm25_holder.search_ascii(q_ascii, top_k=settings.TOPK_BM25)
        bm25_ascii_cids = [cid for cid, _ in bm25_ascii_hits]

        bm25_all_map: Dict[str, float] = {}
        for cid, s in bm25_vi_hits + bm25_ascii_hits:
            bm25_all_map[cid] = max(bm25_all_map.get(cid, 0.0), s)

        # 4. RRF Fusion
        rank_lists = [dense_cids, bm25_vi_cids, bm25_ascii_cids]
        rrf_scores = rrf(rank_lists, k=settings.RRF_K)

        if not rrf_scores:
            return []

        # Lấy metadata từ DB để boost và lọc ngày hiệu lực
        all_cids = list(rrf_scores.keys())
        chunks = db.query(ChunkModel).filter(ChunkModel.chunk_id.in_(all_cids), ChunkModel.active == 1).all()
        chunk_map = {c.chunk_id: c for c in chunks}

        # Lấy tên document
        doc_ids = list(set(c.doc_id for c in chunks))
        docs = db.query(DocumentModel).filter(DocumentModel.doc_id.in_(doc_ids)).all()
        doc_title_map = {d.doc_id: d.title for d in docs}

        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        candidates: List[RetrievedCandidate] = []

        max_bm25 = max(bm25_all_map.values()) if bm25_all_map and max(bm25_all_map.values()) > 0 else 1.0

        for cid, raw_rrf in rrf_scores.items():
            chunk = chunk_map.get(cid)
            if not chunk:
                continue

            # Lọc ngày hiệu lực
            if chunk.effective_date and chunk.effective_date > today_str:
                continue
            if chunk.expires_date and chunk.expires_date < today_str:
                continue

            # Boost doc_type_hint
            boosted_rrf = raw_rrf
            if doc_type_hint and chunk.doc_type == doc_type_hint:
                boosted_rrf *= (1.0 + settings.DOC_TYPE_BOOST)

            d_score = dense_score_map.get(cid, 0.0)
            b_norm = bm25_all_map.get(cid, 0.0) / max_bm25

            # Default confidence ban đầu
            init_conf = 0.7 * max(0.0, d_score) + 0.3 * b_norm

            candidates.append(RetrievedCandidate(
                chunk_id=cid,
                doc_id=chunk.doc_id,
                doc_title=doc_title_map.get(chunk.doc_id, "Tài liệu"),
                doc_type=chunk.doc_type,
                breadcrumb=chunk.breadcrumb or "",
                text_display=chunk.text_display,
                parent_id=chunk.parent_id,
                dense_score=round(d_score, 4),
                bm25_score=round(b_norm, 4),
                rrf_score=round(boosted_rrf, 4),
                conf=round(init_conf, 4)
            ))

        # Sắp xếp theo rrf_score giảm dần
        candidates.sort(key=lambda x: x.rrf_score, reverse=True)
        return candidates[:top_candidates]

    finally:
        if close_db:
            db.close()
