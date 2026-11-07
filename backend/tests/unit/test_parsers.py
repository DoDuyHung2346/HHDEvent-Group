import tempfile
from pathlib import Path
from app.ingestion.parsers import parse_file

def test_parse_markdown():
    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as f:
        f.write("# Tiêu đề\nNội dung văn bản tiếng Việt.")
        f_path = Path(f.name)

    try:
        clean_text, meta, warns, tables = parse_file(f_path)
        assert "# Tiêu đề" in clean_text
        assert meta["doc_type"] in ["generic", "company"]
    finally:
        f_path.unlink(missing_ok=True)

def test_parse_html():
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write("<html><body><h1>Giới thiệu EventViet</h1><p>Công ty tổ chức sự kiện chuyên nghiệp.</p></body></html>")
        f_path = Path(f.name)

    try:
        clean_text, meta, warns, tables = parse_file(f_path)
        assert "Giới thiệu EventViet" in clean_text
        assert "Công ty tổ chức sự kiện" in clean_text
    finally:
        f_path.unlink(missing_ok=True)

def test_parse_docx():
    import docx
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as f:
        doc = docx.Document()
        doc.add_heading("Quy định chung", level=1)
        doc.add_paragraph("Nội dung điều khoản bảo mật.")
        doc.save(f.name)
        f_path = Path(f.name)

    try:
        clean_text, meta, warns, tables = parse_file(f_path)
        assert "Quy định chung" in clean_text
        assert "Nội dung điều khoản bảo mật" in clean_text
    finally:
        f_path.unlink(missing_ok=True)
