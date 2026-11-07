from typing import List, Optional
from pydantic import BaseModel
from app.config import settings
from app.retrieval.hybrid import RetrievedCandidate

class GateDecision(BaseModel):
    decision: str  # answered | answered_with_caution | fallback
    reason: str
    s1: float = 0.0
    s2: float = 0.0

def decide_gating(
    intent: str,
    ranked: List[RetrievedCandidate]
) -> GateDecision:
    if not ranked:
        return GateDecision(decision="fallback", reason="no_results")

    s1 = ranked[0].conf
    s2 = ranked[1].conf if len(ranked) > 1 else 0.0

    if s1 < settings.GATE_CAUTION_MIN:
        return GateDecision(decision="fallback", reason="low_score", s1=s1, s2=s2)

    caution = (s1 < settings.GATE_ANSWER_MIN)
    if len(ranked) > 1 and ranked[0].doc_id != ranked[1].doc_id:
        if (s1 - s2) < settings.GATE_MARGIN_MIN:
            caution = True

    if intent in ["pricing", "policy"]:
        caution = True

    return GateDecision(
        decision="answered_with_caution" if caution else "answered",
        reason="ok",
        s1=s1,
        s2=s2
    )
