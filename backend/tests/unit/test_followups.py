from app.rag.followups import select_followups
from app.retrieval.hybrid import RetrievedCandidate

def test_followups_always_returns_three():
    cands = [
        RetrievedCandidate(
            chunk_id="c1",
            doc_id="d1",
            doc_title="Doc",
            doc_type="package",
            breadcrumb="Bảng giá > Gói tiệc tất niên",
            text_display="text",
            conf=0.8
        )
    ]
    cur_q = "Giá gói tiệc cuối năm là bao nhiêu?"
    followups = select_followups(cur_q, cands, history_queries=[])

    assert len(followups) == 3
    # Không được trùng câu hỏi hiện tại
    for f in followups:
        assert f.lower().strip() != cur_q.lower().strip()
    # Mỗi câu phải có nội dung
    assert all(len(f.strip()) > 5 for f in followups)
