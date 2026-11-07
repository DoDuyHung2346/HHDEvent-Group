import hashlib
import numpy as np
from typing import List, Tuple, Type, TypeVar, Optional, Dict, Any
from pydantic import BaseModel
from app.llm.base import LLMClient, Embedder, Reranker

T = TypeVar("T", bound=BaseModel)

class FakeEmbedder(Embedder):
    def __init__(self, dim: int = 768):
        self._dim = dim

    @property
    def dim(self) -> int:
        return self._dim

    def _hash_to_vec(self, text: str) -> List[float]:
        tokens = text.lower().split()
        if not tokens:
            vec = np.zeros(self._dim, dtype=np.float32)
            vec[0] = 1.0
            return vec.tolist()
        vec = np.zeros(self._dim, dtype=np.float32)
        for token in tokens:
            h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
            idx = h % self._dim
            sign = 1.0 if (h % 2 == 0) else -1.0
            vec[idx] += sign
        norm = np.linalg.norm(vec)
        if norm > 1e-6:
            vec = vec / norm
        else:
            vec[0] = 1.0
        return vec.tolist()

    def embed_texts(self, texts: List[str], task_type: str = "RETRIEVAL_DOCUMENT") -> List[List[float]]:
        return [self._hash_to_vec(t) for t in texts]

    def embed_query(self, query: str) -> List[float]:
        return self._hash_to_vec(query)

class FakeLLM(LLMClient):
    def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Type[T],
        temperature: float = 0.2,
        max_tokens: int = 700
    ) -> Tuple[T, Dict[str, Any]]:
        # Phục vụ mock test cho schemas: AnalyzeOut hoặc LLMOut
        schema_name = response_schema.__name__
        usage = {"input_tokens": 100, "output_tokens": 50, "total_tokens": 150}

        if schema_name == "AnalyzeOut":
            data = {
                "intent": "faq",
                "standalone_query": "Chi phí tổ chức sự kiện là bao nhiêu?",
                "doc_type_hint": "package",
                "language": "vi"
            }
            return response_schema.model_validate(data), usage

        # Default LLMOut: trích xuất câu đầu tiên nếu có trong prompt
        answer_text = "EventViet Demo cung cấp các dịch vụ tổ chức sự kiện chuyên nghiệp [1]."
        data = {
            "answerable": True,
            "answer": answer_text,
            "citations": [1],
            "needs_human": False
        }
        return response_schema.model_validate(data), usage

    def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        return '{"context_summary": "Tóm tắt đoạn văn bản", "questions": ["Câu hỏi 1?", "cau hoi 2 khong dau?"], "keywords": ["su kien", "gia"]}'

class FakeReranker(Reranker):
    def rerank(self, query: str, candidate_texts: List[str]) -> List[Tuple[int, float]]:
        q_tokens = set(query.lower().split())
        scored: List[Tuple[int, float]] = []
        for i, text in enumerate(candidate_texts):
            t_tokens = set(text.lower().split())
            intersect = len(q_tokens & t_tokens)
            score = intersect / (len(q_tokens | t_tokens) + 1e-6)
            # Chuẩn hoá sigmoid-like hoặc min-max để điểm trong khoảng [0.2, 0.95]
            norm_score = min(0.95, max(0.1, score * 2.0 + 0.3))
            scored.append((i, float(norm_score)))
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored
