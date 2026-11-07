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

    # 1. Lấy từ breadcrumb / tiêu đề của các candidate
    for c in candidates:
        if len(selected) >= 3:
            break
        # Tạo câu hỏi gợi ý từ breadcrumb
        if " > " in c.breadcrumb:
            topic = c.breadcrumb.split(" > ")[-1].strip()
            q = f"Chi tiết hơn về {topic} như thế nào?"
            if q.lower() not in seen:
                selected.append(q)
                seen.add(q.lower())

    # 2. Bù từ popular questions nếu chưa đủ 3 câu
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
