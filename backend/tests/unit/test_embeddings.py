import math
import pytest

from app.llm.base import EmbeddingError, validate_and_normalize_embeddings
from app.llm.fakes import FakeEmbedder


def test_embedding_vectors_are_l2_normalized():
    embedder = FakeEmbedder(dim=8)
    vectors = validate_and_normalize_embeddings(
        embedder.embed_texts(["gói gold", "chính sách hoàn tiền"]),
        expected_count=2,
        expected_dim=8,
    )

    assert all(math.isclose(sum(v * v for v in vector), 1.0, rel_tol=1e-6) for vector in vectors)


@pytest.mark.parametrize(
    ("vectors", "expected_count", "expected_dim"),
    [
        ([[1.0, 0.0]], 2, 2),  # partial provider response
        ([[1.0, 0.0, 0.0]], 1, 2),  # configuration/model mismatch
        ([[0.0, 0.0]], 1, 2),  # unusable vector
        ([[float("nan"), 0.0]], 1, 2),  # corrupt provider output
    ],
)
def test_invalid_embedding_output_fails_closed(vectors, expected_count, expected_dim):
    with pytest.raises(EmbeddingError):
        validate_and_normalize_embeddings(vectors, expected_count, expected_dim)
