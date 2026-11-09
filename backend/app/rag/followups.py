from typing import List, Set
from app.rag.templates import POPULAR_QUESTIONS
from app.retrieval.hybrid import RetrievedCandidate

def select_followups(
    current_query: str,
    candidates: List[RetrievedCandidate],
    history_queries: List[str] = None
) -> List[str]:
    seen: Set[str] = set()
    norm_cur = current_query.lower().strip()
    seen.add(norm_cur)

    if history_queries:
        for h in history_queries:
            seen.add(h.lower().strip())

    selected: List[str] = []

    # Breadcrumb của DOCX thường là tiêu đề kỹ thuật như "Q2" hoặc
    # "KNOWLEDGE BASE", không phải câu hỏi khách hàng tự nhiên. Chỉ trả về
    # câu hỏi đã được kiểm duyệt; frontend sẽ cá nhân hoá tiếp theo history.
    for pq in POPULAR_QUESTIONS:
        if len(selected) >= 3:
            break
        if pq.lower() not in seen:
            selected.append(pq)
            seen.add(pq.lower())

    # Đảm bảo luôn đúng 3 câu
    while len(selected) < 3:
        idx = len(selected) % len(POPULAR_QUESTIONS)
        selected.append(POPULAR_QUESTIONS[idx])

    return selected[:3]
