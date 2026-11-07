from pathlib import Path
from typing import Tuple, Dict, Any, List
from app.ingestion.parsers.text import parse_text_file
from app.ingestion.parsers.docx import parse_docx_file
from app.ingestion.parsers.xlsx import parse_excel_or_csv
from app.ingestion.parsers.html import parse_html_file
from app.ingestion.parsers.pdf import parse_pdf_file
from app.ingestion.frontmatter import extract_frontmatter, detect_doc_type

def parse_file(path: Path) -> Tuple[str, Dict[str, Any], List[str], List[Dict[str, Any]]]:
    """
    Trả về:
    - clean_markdown: text markdown sau khi tách frontmatter
    - metadata: dict từ frontmatter (hoặc rỗng)
    - warnings: danh sách cảnh báo parse
    - tables_json: dữ liệu bảng cấu trúc (từ excel/csv nếu có)
    """
    suffix = path.suffix.lower()
    warnings: List[str] = []
    tables_json: List[Dict[str, Any]] = []

    if suffix in [".md", ".txt"]:
        raw_text = parse_text_file(path)
    elif suffix in [".docx"]:
        raw_text = parse_docx_file(path)
    elif suffix in [".xlsx", ".csv"]:
        raw_text, tables_json = parse_excel_or_csv(path)
    elif suffix in [".html", ".htm"]:
        raw_text = parse_html_file(path)
    elif suffix == ".pdf":
        raw_text, pdf_warns = parse_pdf_file(path)
        warnings.extend(pdf_warns)
    else:
        raise ValueError(f"Định dạng tệp {suffix} không được hỗ trợ.")

    metadata, clean_markdown = extract_frontmatter(raw_text)

    # Nếu frontmatter chưa có doc_type thì tự động phát hiện
    if "doc_type" not in metadata:
        metadata["doc_type"] = detect_doc_type(clean_markdown, filename=path.name)

    if not clean_markdown.strip():
        warnings.append("Tài liệu không có nội dung văn bản.")

    return clean_markdown, metadata, warnings, tables_json
