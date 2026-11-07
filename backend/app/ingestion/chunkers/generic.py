import re
from typing import List, Dict, Any
from app.ingestion.chunkers.base import RawChunk, count_syllables
from app.config import settings

def chunk_generic(text: str, metadata: Dict[str, Any], doc_title: str, doc_type: str = "generic") -> List[RawChunk]:
    chunks: List[RawChunk] = []
    sections = re.split(r"\n(?=#{1,3}\s+)", text)
    ordinal = 1

    cur_sec = ""
    cur_title = ""

    for sec in sections:
        sec = sec.strip()
        if not sec:
            continue
        first_line = sec.split("\n")[0].strip("# ")
        syl_count = count_syllables(sec)

        # Nếu section quá ngắn, gộp với section trước nếu có
        if syl_count < settings.CHUNK_MIN_SYLLABLES:
            cur_sec = (cur_sec + "\n\n" + sec).strip()
            if not cur_title:
                cur_title = first_line
            continue

        if cur_sec:
            breadcrumb = f"{doc_title} > {cur_title or 'Chung'}"
            chunks.append(RawChunk(
                ordinal=ordinal,
                breadcrumb=breadcrumb,
                text_display=cur_sec,
                doc_type=doc_type,
                category=metadata.get("category")
            ))
            ordinal += 1
            cur_sec = ""
            cur_title = ""

        breadcrumb = f"{doc_title} > {first_line}"
        chunks.append(RawChunk(
            ordinal=ordinal,
            breadcrumb=breadcrumb,
            text_display=sec,
            doc_type=doc_type,
            category=metadata.get("category")
        ))
        ordinal += 1

    if cur_sec:
        breadcrumb = f"{doc_title} > {cur_title or 'Chung'}"
        chunks.append(RawChunk(
            ordinal=ordinal,
            breadcrumb=breadcrumb,
            text_display=cur_sec,
            doc_type=doc_type,
            category=metadata.get("category")
        ))

    return chunks
