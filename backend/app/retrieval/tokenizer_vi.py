import re
import unicodedata
import yaml
from pathlib import Path
from typing import List, Dict, Set
from pyvi import ViTokenizer
from unidecode import unidecode
from app.config import BASE_DIR

SYNONYMS_FILE = BASE_DIR / "data" / "synonyms.yaml"

def load_synonyms() -> Dict[str, List[str]]:
    if SYNONYMS_FILE.exists():
        with open(SYNONYMS_FILE, "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    return {}

SYNONYMS_MAP = load_synonyms()

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize("NFC", text)
    return text.lower().strip()

def tokenize_vi(text: str) -> List[str]:
    """Tách từ tiếng Việt chuẩn: 'tổ chức sự kiện' -> ['tổ_chức', 'sự_kiện']"""
    norm = normalize_text(text)
    if not norm:
        return []
    segmented = ViTokenizer.tokenize(norm)
    raw_tokens = segmented.split()
    tokens = [re.sub(r"[^\w_]", "", t) for t in raw_tokens]
    # Chỉ giữ token có ít nhất 1 ký tự chữ cái hoặc số
    return [t for t in tokens if any(c.isalnum() for c in t)]

def tokenize_ascii(text: str) -> List[str]:
    """Tách từ không dấu: 'tổ chức sự kiện' -> ['to', 'chuc', 'su', 'kien']"""
    norm = normalize_text(text)
    if not norm:
        return []
    ascii_text = unidecode(norm)
    tokens = re.findall(r"\b\w+\b", ascii_text)
    return tokens

def expand_synonyms(text: str) -> str:
    """Mở rộng câu hỏi với các từ đồng nghĩa đã cấu hình"""
    norm = normalize_text(text)
    expanded = norm
    for key, syns in SYNONYMS_MAP.items():
        if key in norm:
            for s in syns:
                if s not in expanded:
                    expanded += f" {s}"
    return expanded
