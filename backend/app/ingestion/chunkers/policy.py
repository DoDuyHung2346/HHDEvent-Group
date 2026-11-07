import re
import uuid
from typing import List, Dict, Any
from app.ingestion.chunkers.base import RawChunk, count_syllables, split_into_sentences
from app.config import settings

def chunk_policy(text: str, metadata: Dict[str, Any], doc_title: str) -> List[RawChunk]:
    chunks: List[RawChunk] = []
    # Tách theo Heading cấp 1, 2, hoặc "Điều X."
    sections = re.split(r"\n(?=#{1,3}\s+|Điều\s+\d+[\.:])", text)
    ordinal = 1

    for sec in sections:
        sec = sec.strip()
        if not sec:
            continue
        first_line = sec.split("\n")[0].strip("# ")
        breadcrumb = f"{doc_title} > {first_line}"
        syl_count = count_syllables(sec)

        parent_id = f"parent_{uuid.uuid4().hex[:12]}"
        parent_text = sec if syl_count <= 1200 else sec[:2500]

        if syl_count <= settings.CHUNK_MAX_SYLLABLES:
            chunks.append(RawChunk(
                ordinal=ordinal,
                breadcrumb=breadcrumb,
                text_display=sec,
                doc_type="policy",
                category=metadata.get("category"),
                parent_id=parent_id,
                parent_text=parent_text
            ))
            ordinal += 1
        else:
            # Chia nhỏ theo câu có overlap
            sentences = split_into_sentences(sec)
            cur_sents = []
            cur_syl = 0

            for sent in sentences:
                s_syl = count_syllables(sent)
                if cur_syl + s_syl > settings.CHUNK_TARGET_SYLLABLES and cur_sents:
                    chunk_text = " ".join(cur_sents)
                    chunks.append(RawChunk(
                        ordinal=ordinal,
                        breadcrumb=breadcrumb,
                        text_display=chunk_text,
                        doc_type="policy",
                        category=metadata.get("category"),
                        parent_id=parent_id,
                        parent_text=parent_text
                    ))
                    ordinal += 1
                    # Overlap khoảng 1-2 câu cuối
                    overlap_sents = cur_sents[-2:] if len(cur_sents) >= 2 else cur_sents[-1:]
                    cur_sents = list(overlap_sents)
                    cur_syl = sum(count_syllables(s) for s in cur_sents)

                cur_sents.append(sent)
                cur_syl += s_syl

            if cur_sents:
                chunk_text = " ".join(cur_sents)
                chunks.append(RawChunk(
                    ordinal=ordinal,
                    breadcrumb=breadcrumb,
                    text_display=chunk_text,
                    doc_type="policy",
                    category=metadata.get("category"),
                    parent_id=parent_id,
                    parent_text=parent_text
                ))
                ordinal += 1

    return chunks
