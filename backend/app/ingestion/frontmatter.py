import re
import yaml
from typing import Dict, Any, Tuple

FRONTMATTER_REGEX = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)

def extract_frontmatter(text: str) -> Tuple[Dict[str, Any], str]:
    """Tách frontmatter YAML (nếu có) và trả về (metadata, clean_content)"""
    match = FRONTMATTER_REGEX.match(text)
    if not match:
        return {}, text
    raw_yaml = match.group(1)
    clean_text = text[match.end():]
    try:
        data = yaml.safe_load(raw_yaml) or {}
        if isinstance(data, dict):
            return data, clean_text
    except Exception:
        pass
    return {}, text

def detect_doc_type(text: str, filename: str = "") -> str:
    """Tự động phát hiện doc_type: faq | package | policy | scenario | company | generic"""
    lower = text.lower()
    fn_lower = filename.lower()

    if "faq" in fn_lower or "hoi-dap" in fn_lower or "cau-hoi" in fn_lower:
        return "faq"
    if "bang-gia" in fn_lower or "bao-gia" in fn_lower or "goi" in fn_lower:
        return "package"
    if "quy-dinh" in fn_lower or "chinh-sach" in fn_lower or "dieu-khoan" in fn_lower:
        return "policy"
    if "tinh-huong" in fn_lower or "kich-ban" in fn_lower:
        return "scenario"
    if "gioi-thieu" in fn_lower or "cong-ty" in fn_lower:
        return "company"

    # Kiểm tra theo cấu trúc nội dung
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    headings = [l for l in lines if l.startswith("#")]

    if headings:
        q_headings = [h for h in headings if h.endswith("?") or "hỏi:" in h.lower() or "q:" in h.lower()]
        if len(q_headings) / len(headings) >= 0.4:
            return "faq"

    if any(k in lower for k in ["bảng giá", "đơn giá", "combo", "gói gold", "gói silver", "gói tiệc"]):
        return "package"
    if any(k in lower for k in ["điều 1", "điều 2", "khoản 1", "hoàn tiền", "chính sách hủy", "đặt cọc"]):
        return "policy"
    if any(k in lower for k in ["tình huống", "cách xử lý", "nếu trời mưa", "bối cảnh"]):
        return "scenario"
    if any(k in lower for k in ["giới thiệu chung", "về chúng tôi", "năm thành lập", "sứ mệnh"]):
        return "company"

    return "generic"
