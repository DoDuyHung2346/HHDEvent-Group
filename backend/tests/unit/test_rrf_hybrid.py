from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.retrieval.hybrid import rrf, hybrid_retrieve
from app.store.db import SessionLocal, init_db
from app.store.models import DocumentModel, ChunkModel
from app.retrieval.bm25_index import bm25_holder
from app.retrieval.vector_store import vector_store

def test_rrf_scoring():
    # Rank list 1: [A, B, C]
    # Rank list 2: [B, A, D]
    rank_lists = [
        ["A", "B", "C"],
        ["B", "A", "D"]
    ]
    scores = rrf(rank_lists, k=60)
    # A có rank 1 ở list 1, rank 2 ở list 2: 1/(60+1) + 1/(60+2) = 1/61 + 1/62
    # B có rank 2 ở list 1, rank 1 ở list 2: 1/(60+2) + 1/(60+1) = 1/62 + 1/61
    assert abs(scores["A"] - scores["B"]) < 1e-6
    assert scores["A"] > scores["C"]
    assert scores["A"] > scores["D"]

def test_hybrid_search_api():
    init_db()
    db = SessionLocal()

    # Thêm chunk test
    doc_id = "doc_test_search"
    chunk_id = f"{doc_id}:v1:0001"

    doc = DocumentModel(
        doc_id=doc_id,
        filename="test.md",
        title="Bảng giá tiệc cưới",
        doc_type="package",
        version=1,
        status="ready",
        sha256="testsha",
        uploaded_at="2026-11-01",
        active=1
    )
    db.merge(doc)

    chunk = ChunkModel(
        chunk_id=chunk_id,
        doc_id=doc_id,
        ordinal=1,
        breadcrumb="Bảng giá > Tiệc cưới Gold",
        text_display="Gói tiệc cưới Gold 25 triệu đồng bao gồm âm thanh ánh sáng.",
        text_index="Bảng giá > Tiệc cưới Gold\nGói tiệc cưới Gold 25 triệu đồng bao gồm âm thanh ánh sáng.",
        tokens_vi="gói tiệc_cưới gold 25 triệu đồng",
        content_hash="hash123",
        doc_type="package",
        active=1
    )
    db.merge(chunk)
    db.commit()

    # Index vào BM25 & Qdrant
    from app.llm import get_embedder
    embedder = get_embedder()
    vec = embedder.embed_texts([chunk.text_index])[0]
    vector_store.upsert_chunks([chunk_id], [vec], [{"active": 1, "doc_id": doc_id, "doc_type": "package"}])
    bm25_holder.build_and_swap([chunk_id], [["gói", "tiệc_cưới", "gold"]], [["goi", "tiec", "cuoi", "gold"]])

    client = TestClient(app)
    headers = {"Authorization": f"Bearer {settings.ADMIN_TOKEN}"}
    res = client.post(
        "/api/kb/search",
        headers=headers,
        json={"query": "Gói tiệc cưới Gold giá bao nhiêu?", "top_k": 5}
    )
    assert res.status_code == 200
    results = res.json()
    assert len(results) > 0
    top = results[0]
    assert top["chunk_id"] == chunk_id
    assert top["rrf_score"] > 0
    assert "25 triệu" in top["text_display"]

    db.close()
