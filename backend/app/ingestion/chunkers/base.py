import re
import hashlib
from typing import List, Optional
from pydantic import BaseModel
from app.config import settings

SENTENCE_SPLIT_REGEX = re.compile(r"(?<=[.!?…])\s+(?=[A-ZÀ-Ỹ0-9])")

def count_syllables(text: str) -> int:
    """Đếm số âm tiết tiếng Việt (khoảng trắng phân cách)"""
    return len(text.strip().split())

def compute_content_hash(text: str) -> str:
    """sha1 của text chuẩn hoá chữ thường"""
    norm = " ".join(text.lower().split())
    return hashlib.sha1(norm.encode("utf-8")).hexdigest()

def split_into_sentences(text: str) -> List[str]:
    sentences = SENTENCE_SPLIT_REGEX.split(text)
    return [s.strip() for s in sentences if s.strip()]

class RawChunk(BaseModel):
    ordinal: int
    breadcrumb: str
    text_display: str
    doc_type: str
    category: Optional[str] = None
    parent_id: Optional[str] = None
    parent_text: Optional[str] = None
    page: Optional[int] = None
    table_json: Optional[str] = None
    content_hash: str = ""

    def model_post_init(self, __context):
        if not self.content_hash:
            self.content_hash = compute_content_hash(self.text_display)
