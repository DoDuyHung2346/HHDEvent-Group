from app.rag.gating import decide_gating
from app.retrieval.hybrid import RetrievedCandidate

def create_cand(doc_id: str, conf: float) -> RetrievedCandidate:
    return RetrievedCandidate(
        chunk_id=f"{doc_id}:v1:0001",
        doc_id=doc_id,
        doc_title="Doc",
        doc_type="faq",
        breadcrumb="Doc > Title",
        text_display="Text",
        conf=conf
    )

def test_gating_empty_candidates():
    gate = decide_gating("faq", [])
    assert gate.decision == "fallback"
    assert gate.reason == "no_results"

def test_gating_low_score():
    cands = [create_cand("doc1", conf=0.15)]
    gate = decide_gating("faq", cands)
    assert gate.decision == "fallback"
    assert gate.reason == "low_score"

def test_gating_pricing_always_caution():
    cands = [create_cand("doc1", conf=0.8)]
    gate = decide_gating("pricing", cands)
    assert gate.decision == "answered_with_caution"

def test_gating_high_score_answered():
    cands = [create_cand("doc1", conf=0.75)]
    gate = decide_gating("faq", cands)
    assert gate.decision == "answered"
