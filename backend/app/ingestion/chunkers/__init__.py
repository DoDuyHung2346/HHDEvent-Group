from typing import List, Dict, Any
from app.ingestion.chunkers.base import RawChunk
from app.ingestion.chunkers.faq import chunk_faq
from app.ingestion.chunkers.package import chunk_package
from app.ingestion.chunkers.policy import chunk_policy
from app.ingestion.chunkers.generic import chunk_generic

def chunk_document(
    text: str,
    doc_type: str,
    metadata: Dict[str, Any],
    doc_title: str,
    tables_json: List[Dict[str, Any]] = None
) -> List[RawChunk]:
    d_type = doc_type.lower()
    if d_type == "faq":
        raw_chunks = chunk_faq(text, metadata, doc_title)
    elif d_type == "package":
        raw_chunks = chunk_package(text, metadata, doc_title, tables_json)
    elif d_type == "policy":
        raw_chunks = chunk_policy(text, metadata, doc_title)
    elif d_type in ["scenario", "company", "generic"]:
        raw_chunks = chunk_generic(text, metadata, doc_title, doc_type=d_type)
    else:
        raw_chunks = chunk_generic(text, metadata, doc_title, doc_type="generic")

    # Khử trùng lặp nội dung bằng content_hash và loại chunk rỗng
    unique_chunks: List[RawChunk] = []
    seen_hashes = set()
    ord_counter = 1

    for c in raw_chunks:
        if not c.text_display.strip():
            continue
        if c.content_hash in seen_hashes:
            continue
        seen_hashes.add(c.content_hash)
        c.ordinal = ord_counter
        ord_counter += 1
        unique_chunks.append(c)

    return unique_chunks
