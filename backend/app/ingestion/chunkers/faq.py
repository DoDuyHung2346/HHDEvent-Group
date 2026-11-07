import re
from typing import List, Dict, Any
from app.ingestion.chunkers.base import RawChunk, count_syllables

HEADING_REGEX = re.compile(r"^(#{1,4}\s+|(?:\*\*)?(?:hỏi|q|câu\s+\d+)[:.]\s*(?:\*\*)?)(.*)$", re.IGNORECASE | re.MULTILINE)

def chunk_faq(text: str, metadata: Dict[str, Any], doc_title: str) -> List[RawChunk]:
    chunks: List[RawChunk] = []
    lines = text.split("\n")
    current_q = ""
    current_lines = []
    ordinal = 1

    def flush_chunk():
        nonlocal ordinal, current_q, current_lines
        ans = "\n".join(current_lines).strip()
        if current_q and ans:
            display_text = f"Câu hỏi: {current_q}\nTrả lời: {ans}"
            chunks.append(RawChunk(
                ordinal=ordinal,
                breadcrumb=f"{doc_title} > {current_q}",
                text_display=display_text,
                doc_type="faq",
                category=metadata.get("category")
            ))
            ordinal += 1
        current_lines = []

    for line in lines:
        match = HEADING_REGEX.match(line.strip())
        if match:
            # Gặp câu hỏi mới
            flush_chunk()
            current_q = match.group(2).strip().strip("*# ")
        else:
            if line.strip():
                current_lines.append(line)

    flush_chunk()
    return chunks
