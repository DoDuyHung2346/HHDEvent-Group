import yaml
from pathlib import Path
from typing import List, Dict, Any
from app.config import company_info, BASE_DIR
from app.core.schemas import Action, ActionPrefill

POPULAR_QUESTIONS_FILE = BASE_DIR / "data" / "popular_questions.yaml"

def load_popular_questions() -> List[str]:
    if POPULAR_QUESTIONS_FILE.exists():
        with open(POPULAR_QUESTIONS_FILE, "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or []
    return [
        "EventViet Demo cung cấp những dịch vụ tổ chức sự kiện gì?",
        "Bảng giá tham khảo các gói sự kiện tại EventViet như thế nào?",
        "Chính sách hủy sự kiện và hoàn tiền cọc quy định ra sao?"
    ]

POPULAR_QUESTIONS = load_popular_questions()

def get_template_response(template_name: str, query: str = "") -> Dict[str, Any]:
    b_name = company_info.get("business_name", "EventViet Demo")
    bot_name = company_info.get("bot_name", "EventViet AI")
    hotline = company_info.get("hotline", "1900 6886")
    hours = company_info.get("working_hours", "08:00–18:00, T2–T7")

    if template_name == "greeting":
        return {
            "status": "smalltalk",
            "answer": f"Xin chào bạn! Mình là {bot_name}, trợ lý tư vấn tổ chức sự kiện tại {b_name}. Mình có thể giúp gì cho bạn hôm nay?",
            "action": Action(type="none"),
            "follow_ups": POPULAR_QUESTIONS[:3]
        }
    elif template_name == "handoff":
        return {
            "status": "handoff",
            "answer": f"Để được tư vấn và giải đáp trực tiếp, bạn vui lòng liên hệ hotline **{hotline}** ({hours}) hoặc đặt lịch hẹn để chuyên viên liên hệ lại ngay.",
            "action": Action(type="call_hotline", hotline=hotline),
            "follow_ups": POPULAR_QUESTIONS[:3]
        }
    elif template_name == "booking":
        return {
            "status": "handoff",
            "answer": "Rất vui được hỗ trợ bạn đặt lịch tư vấn. Bạn có thể chọn thời gian và để lại thông tin theo biểu mẫu bên dưới nhé.",
            "action": Action(type="open_booking", prefill=ActionPrefill(note=query)),
            "follow_ups": POPULAR_QUESTIONS[:3]
        }
    elif template_name == "out_of_scope":
        return {
            "status": "out_of_scope",
            "answer": f"Dạ, mình là trợ lý chuyên trách tư vấn tổ chức sự kiện tại {b_name} nên chưa thể hỗ trợ câu hỏi ngoài phạm vi này. Bạn có thể tham khảo các chủ đề sự kiện bên dưới nhé!",
            "action": Action(type="none"),
            "follow_ups": POPULAR_QUESTIONS[:3]
        }
    elif template_name == "abuse":
        return {
            "status": "smalltalk",
            "answer": f"Mình là trợ lý AI của {b_name}. Mình luôn sẵn sàng hỗ trợ các thông tin về dịch vụ và kế hoạch tổ chức sự kiện một cách lịch sự và chu đáo.",
            "action": Action(type="none"),
            "follow_ups": POPULAR_QUESTIONS[:3]
        }
    elif template_name == "fallback":
        return {
            "status": "fallback",
            "answer": f"Hiện mình chưa có đủ thông tin chính xác để trả lời câu này từ tài liệu. Để được tư vấn đúng nhất, bạn có thể **đặt lịch với nhân viên** hoặc gọi hotline **{hotline}** ({hours}). Trong lúc chờ, bạn có thể tham khảo các câu hỏi bên dưới.",
            "action": Action(type="open_booking", prefill=ActionPrefill(note=query)),
            "follow_ups": POPULAR_QUESTIONS[:3]
        }
    elif template_name == "degraded":
        return {
            "status": "degraded",
            "answer": f"Hệ thống phân tích đang xử lý chậm hơn bình thường. Bạn vui lòng liên hệ hotline **{hotline}** ({hours}) hoặc đặt lịch hẹn để nhân viên hỗ trợ ngay nhé.",
            "action": Action(type="open_booking", prefill=ActionPrefill(note=query)),
            "follow_ups": POPULAR_QUESTIONS[:3]
        }

    return {
        "status": "fallback",
        "answer": f"Vui lòng liên hệ hotline **{hotline}** để được tư vấn chi tiết.",
        "action": Action(type="open_booking"),
        "follow_ups": POPULAR_QUESTIONS[:3]
    }
