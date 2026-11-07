import uuid
import time
import json
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session

from app.config import settings, company_info
from app.llm.base import EmbeddingError
from app.core.schemas import ChatRequest, ChatResponse, Citation, Action, ActionPrefill, ChatMeta
from app.core.security import sanitize_input
from app.core.logging import logger
from app.store.db import SessionLocal
from app.store.models import TraceModel, KBGapModel, KBMetaModel
from app.rag.analyze import analyze_query
from app.rag.templates import get_template_response
from app.retrieval.hybrid import hybrid_retrieve
from app.rag.rerank import rerank_and_expand
from app.rag.gating import decide_gating
from app.rag.generate import generate_rag_answer
from app.rag.validate import validate_response
from app.rag.followups import select_followups

def record_gap(query_norm: str, trace_id: str, db: Session):
    try:
        gap = db.query(KBGapModel).filter(KBGapModel.query_norm == query_norm).first()
        now = datetime.utcnow().isoformat()
        if gap:
            gap.count += 1
            gap.last_seen = now
            gap.last_trace_id = trace_id
        else:
            gap = KBGapModel(
                query_norm=query_norm,
                first_seen=now,
                last_seen=now,
                count=1,
                last_trace_id=trace_id,
                resolved=0
            )
            db.add(gap)
        db.commit()
    except Exception as e:
        logger.warning(f"Error recording gap: {e}")
        db.rollback()

def execute_chat_pipeline(req: ChatRequest, x_debug: Optional[str] = None) -> ChatResponse:
    start_time = time.time()
    trace_id = str(uuid.uuid4())
    db: Session = SessionLocal()

    try:
        # 1. Sanitize
        clean_msg = sanitize_input(req.message)
        if not clean_msg:
            clean_msg = "xin chào"

        # 2. Analyze
        analysis = analyze_query(clean_msg, req.history)
        intent = analysis.intent
        standalone = analysis.standalone_query or clean_msg

        # Lấy kb_version
        kb_meta = db.query(KBMetaModel).filter(KBMetaModel.key == "kb_version").first()
        kb_version = kb_meta.value if kb_meta else "v0"

        # 3. Intent không cần RAG
        if intent in ["greeting", "handoff", "booking", "out_of_scope", "abuse"]:
            tpl = get_template_response(intent, query=clean_msg)
            latency = int((time.time() - start_time) * 1000)
            return ChatResponse(
                trace_id=trace_id,
                status=tpl["status"],
                answer=tpl["answer"],
                citations=[],
                follow_ups=tpl["follow_ups"],
                action=tpl["action"],
                meta=ChatMeta(
                    intent=intent,
                    cache="none",
                    latency_ms=latency,
                    kb_version=kb_version
                )
            )

        # 4. Retrieval (Dense + BM25 + RRF)
        try:
            retrieved = hybrid_retrieve(
                query=standalone,
                doc_type_hint=analysis.doc_type_hint,
                top_candidates=settings.RERANK_CANDIDATES,
                db=db
            )
        except EmbeddingError as exc:
            # Never substitute a different embedding model at query time: it
            # cannot be compared to the indexed vectors. Give the user a safe
            # handoff while operators can inspect the server log/job error.
            logger.error("Embedding unavailable for trace %s: %s", trace_id, exc)
            tpl = get_template_response("fallback", query=clean_msg)
            latency = int((time.time() - start_time) * 1000)
            return ChatResponse(
                trace_id=trace_id,
                status="degraded",
                answer=tpl["answer"],
                citations=[],
                follow_ups=tpl["follow_ups"],
                action=tpl["action"],
                meta=ChatMeta(intent=intent, cache="none", latency_ms=latency, kb_version=kb_version),
            )

        # 5. Rerank
        ranked = rerank_and_expand(
            query=standalone,
            candidates=retrieved,
            top_k=settings.CONTEXT_TOPK,
            db=db
        )

        # 6. Gating
        gate = decide_gating(intent, ranked)

        if gate.decision == "fallback":
            record_gap(clean_msg.lower().strip(), trace_id, db)
            tpl = get_template_response("fallback", query=clean_msg)
            latency = int((time.time() - start_time) * 1000)
            return ChatResponse(
                trace_id=trace_id,
                status="fallback",
                answer=tpl["answer"],
                citations=[],
                follow_ups=tpl["follow_ups"],
                action=tpl["action"],
                meta=ChatMeta(
                    intent=intent,
                    cache="none",
                    latency_ms=latency,
                    kb_version=kb_version
                )
            )

        # 7. Generate
        hist_text = "\n".join([f"{m.role}: {m.content}" for m in req.history[-settings.HISTORY_TURNS:]])
        llm_out, usage, context_text = generate_rag_answer(standalone, ranked, hist_text, staff_context=req.staff_context)

        if not llm_out.answerable:
            record_gap(clean_msg.lower().strip(), trace_id, db)
            tpl = get_template_response("fallback", query=clean_msg)
            latency = int((time.time() - start_time) * 1000)
            return ChatResponse(
                trace_id=trace_id,
                status="fallback",
                answer=tpl["answer"],
                citations=[],
                follow_ups=tpl["follow_ups"],
                action=tpl["action"],
                meta=ChatMeta(
                    intent=intent,
                    cache="none",
                    latency_ms=latency,
                    kb_version=kb_version
                )
            )

        # 8. Validate
        is_valid, final_answer, violations = validate_response(llm_out, context_text, len(ranked), staff_context=req.staff_context)
        if not is_valid:
            logger.warning(f"Validation violations for trace {trace_id}: {violations}")
            # Nếu vi phạm nặng number guard -> fallback an toàn
            if any("Number guard" in v for v in violations):
                tpl = get_template_response("fallback", query=clean_msg)
                return ChatResponse(
                    trace_id=trace_id,
                    status="fallback",
                    answer=tpl["answer"],
                    citations=[],
                    follow_ups=tpl["follow_ups"],
                    action=tpl["action"],
                    meta=ChatMeta(intent=intent, cache="none", latency_ms=int((time.time() - start_time) * 1000), kb_version=kb_version)
                )

        # 9. Gắn Disclaimer nếu caution
        if gate.decision == "answered_with_caution":
            if intent == "pricing":
                final_answer += f"\n\n*Lưu ý: {company_info.get('disclaimer_price', '')}*"
            elif intent == "policy":
                final_answer += f"\n\n*Lưu ý: {company_info.get('disclaimer_legal', '')}*"

        # 10. Dựng Citations
        citations: List[Citation] = []
        for idx in llm_out.citations:
            if 1 <= idx <= len(ranked):
                cand = ranked[idx - 1]
                snippet = cand.text_display[:200]
                citations.append(Citation(
                    index=idx,
                    doc_id=cand.doc_id,
                    chunk_id=cand.chunk_id,
                    doc_title=cand.doc_title,
                    section=cand.breadcrumb,
                    snippet=snippet
                ))

        # 11. Follow-up 3 câu hỏi
        history_queries = [m.content for m in req.history if m.role == "user"]
        follow_ups = select_followups(clean_msg, ranked, history_queries)

        action = Action(type="none")
        if gate.decision == "answered_with_caution" or llm_out.needs_human:
            action = Action(type="open_booking", prefill=ActionPrefill(note=clean_msg))

        latency = int((time.time() - start_time) * 1000)

        # 12. Ghi trace vào SQLite
        try:
            trace_rec = TraceModel(
                trace_id=trace_id,
                ts=datetime.utcnow().isoformat(),
                session_id=req.session_id,
                query=clean_msg,
                standalone_query=standalone,
                intent=intent,
                status=gate.decision,
                cache="none",
                kb_version=kb_version,
                retrieved_json=json.dumps([{"chunk_id": c.chunk_id, "rrf": c.rrf_score, "conf": c.conf} for c in ranked], ensure_ascii=False),
                gate_json=json.dumps(gate.model_dump(), ensure_ascii=False),
                answer=final_answer,
                citations_json=json.dumps([c.model_dump() for c in citations], ensure_ascii=False),
                followups_json=json.dumps(follow_ups, ensure_ascii=False),
                latency_json=json.dumps({"total_ms": latency}),
                tokens_json=json.dumps(usage),
                cost_usd=0.0002
            )
            db.add(trace_rec)
            db.commit()
        except Exception as e:
            logger.warning(f"Error recording trace: {e}")
            db.rollback()

        return ChatResponse(
            trace_id=trace_id,
            status=gate.decision,
            answer=final_answer,
            citations=citations,
            follow_ups=follow_ups,
            action=action,
            meta=ChatMeta(
                intent=intent,
                cache="none",
                latency_ms=latency,
                kb_version=kb_version
            )
        )

    finally:
        db.close()
