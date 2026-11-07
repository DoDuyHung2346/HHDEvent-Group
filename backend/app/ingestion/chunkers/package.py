import re
import json
from typing import List, Dict, Any
from app.ingestion.chunkers.base import RawChunk, count_syllables

def chunk_package(text: str, metadata: Dict[str, Any], doc_title: str, tables_json: List[Dict[str, Any]] = None) -> List[RawChunk]:
    chunks: List[RawChunk] = []
    sections = re.split(r"\n(?=#{1,3}\s+)", text)
    ordinal = 1

    tbl_str = None
    if tables_json:
        tbl_str = json.dumps(tables_json, ensure_ascii=False)

    for sec in sections:
        sec = sec.strip()
        if not sec:
            continue
        lines = [l.strip() for l in sec.split("\n") if l.strip()]
        # Nếu chỉ có 1 dòng tiêu đề cấp 1 (ví dụ "# Bảng giá gói tiệc") mà không có nội dung gói thì bỏ qua
        if len(lines) == 1 and lines[0].startswith("# "):
            continue

        first_line = lines[0].strip("# ")
        breadcrumb = f"{doc_title} > {first_line}"

        chunks.append(RawChunk(
            ordinal=ordinal,
            breadcrumb=breadcrumb,
            text_display=sec,
            doc_type="package",
            category=metadata.get("category"),
            table_json=tbl_str
        ))
        ordinal += 1

    return chunks
