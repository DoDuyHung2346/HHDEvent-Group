import numpy as np
from pydantic import BaseModel
from typing import List
from app.llm.fakes import FakeEmbedder, FakeLLM, FakeReranker

class DummyOut(BaseModel):
    answerable: bool
    answer: str
    citations: List[int]
    needs_human: bool

def test_fake_embedder():
    embedder = FakeEmbedder(dim=768)
    assert embedder.dim == 768

    v1 = embedder.embed_query("chi phí tổ chức sự kiện")
    v2 = embedder.embed_query("báo giá tổ chức sự kiện")
    v3 = embedder.embed_query("thời tiết hôm nay mưa to")

    assert len(v1) == 768
    # Kiểm tra L2-norm xấp xỉ 1.0
    assert abs(np.linalg.norm(v1) - 1.0) < 1e-4

    # Cosine similarity giữa 2 câu cùng domain sự kiện phải cao hơn câu thời tiết
    cos_12 = np.dot(v1, v2)
    cos_13 = np.dot(v1, v3)
    assert cos_12 > cos_13

def test_fake_llm_structured():
    llm = FakeLLM()
    out, usage = llm.generate_structured(
        system_prompt="system",
        user_prompt="Chi phí bao nhiêu?",
        response_schema=DummyOut
    )
    assert isinstance(out, DummyOut)
    assert out.answerable is True
    assert len(out.citations) > 0
    assert "input_tokens" in usage

def test_fake_reranker():
    reranker = FakeReranker()
    scores = reranker.rerank("gói tiệc cuối năm", [
        "Chi tiết gói tiệc cuối năm cho doanh nghiệp",
        "Quy định thời tiết khi trời mưa",
        "Gói tiệc gala dinner cuối năm"
    ])
    assert len(scores) == 3
    # Đoạn văn bản có từ khóa trùng phải đứng đầu
    top_idx, top_score = scores[0]
    assert top_idx in [0, 2]
    assert 0.0 <= top_score <= 1.0
