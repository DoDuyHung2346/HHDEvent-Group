from app.ingestion.frontmatter import extract_frontmatter, detect_doc_type

def test_extract_frontmatter():
    text = """---
title: "Bảng giá gói tiệc 2026"
doc_type: package
effective_date: 2026-10-01
---
# Nội dung chính
Gói Gold: 25.000.000đ
"""
    meta, clean = extract_frontmatter(text)
    assert meta["title"] == "Bảng giá gói tiệc 2026"
    assert meta["doc_type"] == "package"
    assert meta["effective_date"] == "2026-10-01" or str(meta["effective_date"]) == "2026-10-01"
    assert "# Nội dung chính" in clean
    assert "---" not in clean

def test_detect_doc_type_rules():
    faq_text = """
## EventViet có nhận tổ chức tiệc cưới không?
Có, chúng tôi nhận tổ chức tiệc cưới trọn gói.

## Chi phí đặt cọc là bao nhiêu?
Đặt cọc 30% giá trị hợp đồng.
"""
    assert detect_doc_type(faq_text, filename="faq-demo.md") == "faq"

    pkg_text = """
# Bảng giá dịch vụ
Gói Silver: 15.000.000 đ
Gói Gold: 25.000.000 đ
"""
    assert detect_doc_type(pkg_text, filename="bang-gia.xlsx") == "package"

    pol_text = """
# Chính sách hoàn hủy
Điều 1. Hủy trước 7 ngày được hoàn tiền 70% tiền cọc.
Điều 2. Hủy sát ngày không được hoàn tiền.
"""
    assert detect_doc_type(pol_text, filename="quy-dinh.docx") == "policy"
