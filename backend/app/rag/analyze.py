import re
from typing import List, Optional
from pydantic import BaseModel
from app.core.schemas import ChatMessage
from app.llm import get_llm_client
from app.rag.prompts import ANALYZE_PROMPT

class AnalyzeOut(BaseModel):
    intent: str
    standalone_query: str
    doc_type_hint: Optional[str] = None
    language: str = "vi"

GREETING_REGEX = re.compile(r"^(xin\s+chào|chào|hello|hi|alo|chao\s+ban)\b", re.IGNORECASE)
BOOKING_REGEX = re.compile(r"(đặt\s+lịch|hẹn\s+(?:gặp|tư\s+vấn)|book\b|đăng\s+ký\s+tư\s+vấn|dat\s+lich)", re.IGNORECASE)
HANDOFF_REGEX = re.compile(r"(gọi\s+hotline|số\s+điện\s+thoại|nói\s+chuyện\s+trực\s+tiếp|gặp\s+(?:nhân\s+viên|người)|tư\s+vấn\s+viên)", re.IGNORECASE)
OOS_REGEX = re.compile(r"(thời\s+tiết|giải\s+toán|chứng\s+khoán|bài\s+thơ|viết\s+code)", re.IGNORECASE)

def analyze_query(message: str, history: List[ChatMessage] = None) -> AnalyzeOut:
    msg_clean = message.strip()
    words = msg_clean.split()

    # Rule-first check
    if GREETING_REGEX.search(msg_clean) and len(words) <= 6:
        return AnalyzeOut(intent="greeting", standalone_query=msg_clean)

    if BOOKING_REGEX.search(msg_clean):
        return AnalyzeOut(intent="booking", standalone_query=msg_clean, doc_type_hint="package")

    if HANDOFF_REGEX.search(msg_clean):
        return AnalyzeOut(intent="handoff", standalone_query=msg_clean)

    if OOS_REGEX.search(msg_clean):
        return AnalyzeOut(intent="out_of_scope", standalone_query=msg_clean)

    # Nếu không có history và câu tương đối rõ ràng
    if not history and len(words) >= 4:
        # Tự suy luận doc_type_hint đơn giản
        lower = msg_clean.lower()
        hint = None
        intent = "faq"
        if any(k in lower for k in ["giá", "chi phí", "bao nhiêu", "báo giá", "gói"]):
            hint = "package"
            intent = "pricing"
        elif any(k in lower for k in ["hủy", "hoàn tiền", "đặt cọc", "quy định", "chính sách"]):
            hint = "policy"
            intent = "policy"
        elif any(k in lower for k in ["mưa", "tình huống", "xử lý"]):
            hint = "scenario"
        return AnalyzeOut(intent=intent, standalone_query=msg_clean, doc_type_hint=hint)

    # Nếu có history hoặc câu ngắn/mơ hồ -> gọi LLM
    try:
        hist_text = ""
        if history:
            recent_turns = history[-4:]
            hist_text = "\n".join([f"{m.role}: {m.content}" for m in recent_turns])

        user_content = f"<history>\n{hist_text}\n</history>\n<message>\n{msg_clean}\n</message>"
        llm = get_llm_client()
        out, _ = llm.generate_structured(
            system_prompt=ANALYZE_PROMPT,
            user_prompt=user_content,
            response_schema=AnalyzeOut,
            temperature=0.1
        )
        return out
    except Exception:
        # Fallback an toàn
        return AnalyzeOut(
            intent="faq",
            standalone_query=msg_clean,
            doc_type_hint=None
        )
