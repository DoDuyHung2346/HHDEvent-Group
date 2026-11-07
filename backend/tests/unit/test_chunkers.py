from app.ingestion.chunkers.faq import chunk_faq
from app.ingestion.chunkers.package import chunk_package
from app.ingestion.chunkers.policy import chunk_policy
from app.ingestion.chunkers import chunk_document

def test_chunk_faq():
    faq_md = """
# Câu hỏi thường gặp

## Công ty có hỗ trợ sự kiện ngoài trời không?
Có, chúng tôi triển khai sự kiện ngoài trời và luôn có phương án che chắn dự phòng.

## Cần đặt cọc bao nhiêu?
Đặt cọc 30% giá trị hợp đồng khi ký kết.
"""
    chunks = chunk_faq(faq_md, {}, "FAQ EventViet")
    assert len(chunks) == 2
    assert "ngoài trời" in chunks[0].text_display
    assert "Câu hỏi:" in chunks[0].text_display
    assert "30%" in chunks[1].text_display

def test_chunk_package():
    pkg_md = """
# Bảng giá gói tiệc 2026

## Gói Gold
- Giá: 25.000.000 đ
- Bao gồm: Âm thanh, ánh sáng, MC.

## Gói Silver
- Giá: 15.000.000 đ
- Bao gồm: Âm thanh cơ bản.
"""
    chunks = chunk_package(pkg_md, {}, "Bảng giá")
    assert len(chunks) == 2
    assert "Gói Gold" in chunks[0].breadcrumb
    assert "25.000.000" in chunks[0].text_display

def test_chunk_policy_parent_child():
    pol_md = """
# Quy định hoàn tiền

## Điều 3. Hủy sự kiện
3.1. Hủy trước 14 ngày: hoàn 100% tiền cọc.
3.2. Hủy từ 7-13 ngày: hoàn 70% tiền cọc.
3.3. Hủy dưới 7 ngày: không hoàn cọc.
"""
    chunks = chunk_policy(pol_md, {}, "Chính sách")
    assert len(chunks) >= 1
    assert chunks[0].parent_id is not None
    assert chunks[0].parent_text is not None

def test_chunk_deduplication():
    # Nội dung trùng lặp
    dup_md = """
## Câu 1?
Nội dung trả lời A.

## Câu 2?
Nội dung trả lời A.
"""
    chunks = chunk_document(dup_md, "faq", {}, "Doc")
    # Câu 2 có câu hỏi khác câu 1 -> text_display khác nhau -> không bị dedupe
    assert len(chunks) == 2

    # Nếu trùng lặp hoàn toàn
    identical_md = """
## Câu 1?
Nội dung giống nhau.

## Câu 1?
Nội dung giống nhau.
"""
    chunks_ident = chunk_document(identical_md, "faq", {}, "Doc")
    assert len(chunks_ident) == 1
