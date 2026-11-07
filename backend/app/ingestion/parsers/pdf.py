from pathlib import Path
from typing import Tuple, List
import unicodedata
import fitz  # PyMuPDF

def parse_pdf_file(path: Path) -> Tuple[str, List[str]]:
    warnings = []
    text_content = ""
    try:
        import pymupdf4llm
        text_content = pymupdf4llm.to_markdown(str(path))
    except Exception:
        # Fallback PyMuPDF native
        doc = fitz.open(path)
        pages = []
        for i, page in enumerate(doc):
            p_text = page.get_text()
            if not p_text.strip():
                warnings.append(f"Trang {i+1} có thể là ảnh quét (scan), không có văn bản số.")
            pages.append(f"## Trang {i+1}\n\n{p_text}")
        text_content = "\n\n".join(pages)

    if not text_content.strip():
        warnings.append("Tài liệu PDF không có nội dung văn bản khả dụng (có thể là file scan hoàn toàn).")

    return unicodedata.normalize("NFC", text_content), warnings
