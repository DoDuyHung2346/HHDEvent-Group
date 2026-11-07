from abc import ABC, abstractmethod
from typing import List, Tuple, Type, TypeVar, Optional, Any, Dict
import math
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

class LLMClient(ABC):
    @abstractmethod
    def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Type[T],
        temperature: float = 0.2,
        max_tokens: int = 700
    ) -> Tuple[T, Dict[str, Any]]:
        """Trả về (parsed_object, usage_dict)"""
        pass

    @abstractmethod
    def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        pass

class Embedder(ABC):
    @property
    @abstractmethod
    def dim(self) -> int:
        pass

    @abstractmethod
    def embed_texts(self, texts: List[str], task_type: str = "RETRIEVAL_DOCUMENT") -> List[List[float]]:
        pass

    @abstractmethod
    def embed_query(self, query: str) -> List[float]:
        pass


class EmbeddingError(RuntimeError):
    """Raised when an embedding provider returns unusable vectors.

    This must be surfaced to ingestion/retrieval instead of silently mixing a
    different embedding space into an existing index.
    """


def validate_and_normalize_embeddings(
    vectors: List[List[float]], expected_count: int, expected_dim: int
) -> List[List[float]]:
    """Validate provider output and return L2-normalized float vectors."""
    if len(vectors) != expected_count:
        raise EmbeddingError(
            f"Embedding provider returned {len(vectors)} vectors for {expected_count} inputs."
        )

    normalized: List[List[float]] = []
    for index, vector in enumerate(vectors):
        if len(vector) != expected_dim:
            raise EmbeddingError(
                f"Embedding vector {index} has dim={len(vector)}, expected {expected_dim}. "
                "Update EMBED_DIM or reindex the knowledge base."
            )
        try:
            values = [float(value) for value in vector]
        except (TypeError, ValueError) as exc:
            raise EmbeddingError(f"Embedding vector {index} contains a non-numeric value.") from exc
        if not all(math.isfinite(value) for value in values):
            raise EmbeddingError(f"Embedding vector {index} contains NaN or infinity.")
        norm = math.sqrt(sum(value * value for value in values))
        if norm <= 1e-12:
            raise EmbeddingError(f"Embedding vector {index} is zero-length.")
        normalized.append([value / norm for value in values])
    return normalized

class Reranker(ABC):
    @abstractmethod
    def rerank(self, query: str, candidate_texts: List[str]) -> List[Tuple[int, float]]:
        """Trả về list (index, score_in_0_1)"""
        pass
