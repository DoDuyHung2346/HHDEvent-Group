import re
from typing import List, Dict, Any
from app.ingestion.chunkers.base import RawChunk, count_syllables
from app.config import settings, company_info

INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(?:all\s+)?(?:previous\s+)?instructions", re.I),
    re.compile(r"bỏ\s+qua\s+(?:mọi\s+)?hướng\s+dẫn", re.I),
    re.compile(r"system\s+prompt", re.I),
    re.compile(r"you\s+are\s+now\s+dan", re.I),
    re.compile(r"nói\s+rằng\s+.*miễn\s+phí", re.I),
]

PHONE_PATTERN = re.compile(r"(?:\+84|0)(?:3|5|7|8|9)\d{8}\b")
URL_PATTERN = re.compile(r"https?://[^\s/$.?#].[^\s]*")

def inspect_quality(
    text: str,
    chunks: List[RawChunk],
    doc_type: str,
    metadata: Dict[str, Any]
) -> List[str]:
    warnings: List[str] = []

    # 1. Kiểm tra heading
    if not re.search(r"^#{1,3}\s+", text, re.MULTILINE):
        warnings.append("Tài liệu không có cấu trúc Heading rõ ràng (#, ##, ###).")

    # 2. Kiểm tra độ dài chunk
    too_large = 0
    too_small = 0
    for c in chunks:
        syl = count_syllables(c.text_display)
        if syl > settings.CHUNK_MAX_SYLLABLES:
            too_large += 1
        elif syl < settings.CHUNK_MIN_SYLLABLES:
            too_small += 1

    if too_large > 0:
        warnings.append(f"Có {too_large} đoạn vượt quá giới hạn tối đa ({settings.CHUNK_MAX_SYLLABLES} âm tiết).")
    if too_small > len(chunks) * 0.4 and len(chunks) > 3:
        warnings.append("Có nhiều đoạn ngắn dưới ngưỡng tối thiểu, có thể ảnh hưởng đến ngữ cảnh.")

    # 3. Tài liệu giá thiếu effective_date
    if doc_type == "package" and not metadata.get("effective_date"):
        warnings.append("Tài liệu bảng giá dịch vụ thiếu trường ngày hiệu lực (effective_date).")

    # 4. Kiểm tra Prompt Injection trong nội dung tài liệu
    for pattern in INJECTION_PATTERNS:
        if pattern.search(text):
            warnings.append("Phát hiện cụm từ đáng ngờ có thể là tấn công prompt injection trong tài liệu.")
            break

    # 5. Kiểm tra SĐT và URL ngoài allowlist
    allowed_phones = set(company_info.get("allowed_phones", []))
    allowed_urls = set(company_info.get("allowed_urls", []))

    found_phones = PHONE_PATTERN.findall(text)
    for p in found_phones:
        if p not in allowed_phones and not any(p in a for a in allowed_phones):
            warnings.append(f"Số điện thoại '{p}' trong tài liệu không nằm trong danh sách cho phép (company.yaml).")
            break

    return warnings
