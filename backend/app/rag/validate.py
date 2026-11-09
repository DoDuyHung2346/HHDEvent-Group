import re
from typing import List, Set, Tuple, Optional, Any
from pydantic import BaseModel
from app.config import company_info
from app.core.logging import logger

class LLMOut(BaseModel):
    answerable: bool
    answer: str
    citations: List[int]
    needs_human: bool

MONEY_REGEX = re.compile(
    r"(?P<n>\d+(?:[.,]\d+)*)\s*(?P<u>triệu|tr|nghìn|ngàn|k|đ|vnđ|vnd|%)?",
    re.IGNORECASE
)

def normalize_numbers(text: str) -> Set[float]:
    """Trích xuất và chuẩn hóa tất cả các con số, tiền tệ, phần trăm trong đoạn văn"""
    numbers: Set[float] = set()
    for m in MONEY_REGEX.finditer(text):
        raw_num = m.group("n").strip()
        unit = (m.group("u") or "").lower()

        # Xử lý số thập phân tiếng Việt kết hợp đơn vị (ví dụ: 1.5 triệu, 1,5 triệu, 2.7 tỷ)
        if unit in ["triệu", "tr", "tỷ", "ty"] and re.match(r"^\d+[.,]\d{1,2}$", raw_num):
            cleaned = raw_num.replace(",", ".")
        elif "." in raw_num and "," in raw_num:
            cleaned = raw_num.replace(".", "").replace(",", ".")
        elif "." in raw_num:
            parts = raw_num.split(".")
            if all(len(p) == 3 for p in parts[1:]):
                cleaned = raw_num.replace(".", "")
            elif len(parts) == 2 and len(parts[1]) in (1, 2) and unit in ["triệu", "tr", "tỷ"]:
                cleaned = raw_num
            else:
                cleaned = raw_num.replace(".", "")
        elif "," in raw_num:
            parts = raw_num.split(",")
            if all(len(p) == 3 for p in parts[1:]):
                cleaned = raw_num.replace(",", "")
            else:
                cleaned = raw_num.replace(",", ".")
        else:
            cleaned = raw_num

        try:
            val = float(cleaned)
            if unit in ["triệu", "tr"]:
                val *= 1_000_000
            elif unit in ["tỷ", "ty"]:
                val *= 1_000_000_000
            elif unit in ["nghìn", "ngàn", "k"]:
                val *= 1_000
            numbers.add(val)
        except ValueError:
            continue

    # Các số nguyên độc lập (ngày, phần trăm, số lượng)
    for raw in re.findall(r"\b\d+\b", text):
        try:
            numbers.add(float(raw))
        except ValueError:
            pass

    return numbers

def validate_response(
    llm_out: LLMOut,
    context_text: str,
    num_docs: int,
    staff_context: Optional[List[Any]] = None
) -> Tuple[bool, str, List[str]]:
    """
    Trả về (is_valid, cleaned_answer, violations)
    """
    violations: List[str] = []

    if not llm_out.answerable:
        return True, "", []

    # 1. Citation Guard
    for c in llm_out.citations:
        if c < 1 or c > num_docs:
            violations.append(f"Citation index [{c}] ngoài phạm vi [1..{num_docs}].")
    # Chỉ cảnh báo thiếu citations nếu không phải tư vấn nhân viên và có tài liệu
    if not llm_out.citations and num_docs > 0 and not staff_context:
        violations.append("Câu trả lời thiếu trích dẫn nguồn [citations].")

    # 2. Number Guard: kiểm tra số trong answer có thuộc context không
    ctx_numbers = normalize_numbers(context_text)
    # Bổ sung các mốc giờ làm việc tiêu chuẩn (8h, 12h, 13h, 18h, 24/7)
    ctx_numbers.update({0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0, 18.0, 24.0})

    # Chỉ hotline công ty được phép xuất hiện; số cá nhân của nhân viên không
    # bao giờ được cấp quyền hiển thị trong câu trả lời khách hàng.
    allowed_phones = set(company_info.get("allowed_phones", []))

    ans_numbers = normalize_numbers(llm_out.answer)

    suspicious_numbers = []
    for num in ans_numbers:
        if num in ctx_numbers:
            continue
        # Kiểm tra xem có xấp xỉ không
        if not any(abs(num - cn) < 1e-4 for cn in ctx_numbers):
            suspicious_numbers.append(num)

    if suspicious_numbers:
        violations.append(f"Number guard: Phát hiện số lạ không có trong tài liệu: {suspicious_numbers}")

    # 3. Prompt Leakage Guard
    leak_keywords = ["<documents>", "<user_question>", "<staff_list>", "system prompt", "bạn là eventviet ai"]
    lower_ans = llm_out.answer.lower()
    for kw in leak_keywords:
        if kw in lower_ans:
            violations.append(f"Prompt leakage: Chứa từ khóa nhạy cảm '{kw}'.")

    # 4. Contact Guard
    for p in re.findall(r"(?:\+84|0)(?:3|5|7|8|9)\d{8}\b", llm_out.answer):
        if p not in allowed_phones and not any(p in ap for ap in allowed_phones):
            violations.append(f"Contact guard: Số điện thoại lạ {p} không thuộc allowlist.")

    is_valid = len(violations) == 0
    return is_valid, llm_out.answer, violations
