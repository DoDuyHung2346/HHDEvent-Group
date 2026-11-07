import uuid
from typing import List, Dict, Any, Tuple, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from app.config import settings
from app.core.logging import logger

class VectorStore:
    def __init__(self):
        backend = settings.VECTOR_BACKEND
        if backend == "memory":
            self.client = QdrantClient(":memory:")
        elif backend == "qdrant_server" and settings.QDRANT_URL:
            self.client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
        else:
            self.client = QdrantClient(path=settings.QDRANT_PATH)

        self.collection_name = settings.QDRANT_COLLECTION
        self._ensure_collection()

    def _ensure_collection(self):
        collections = [c.name for c in self.client.get_collections().collections]
        if self.collection_name in collections:
            try:
                info = self.client.get_collection(self.collection_name)
                current_size = getattr(getattr(info.config.params, "vectors", None), "size", None)
                if current_size and current_size != settings.EMBED_DIM:
                    raise RuntimeError(
                        f"Qdrant collection '{self.collection_name}' has dim={current_size}, "
                        f"expected dim={settings.EMBED_DIM}. Reindex is required; refusing to delete existing vectors."
                    )
            except Exception as e:
                logger.warning(f"Error checking Qdrant collection vector size: {e}")

        if self.collection_name not in collections:
            logger.info(f"Creating Qdrant collection '{self.collection_name}' (dim={settings.EMBED_DIM}, Cosine)...")
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=qmodels.VectorParams(
                    size=settings.EMBED_DIM,
                    distance=qmodels.Distance.COSINE
                )
            )

    def upsert_chunks(self, chunk_ids: List[str], vectors: List[List[float]], payloads: List[Dict[str, Any]]):
        points = []
        for cid, vec, payload in zip(chunk_ids, vectors, payloads):
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, cid))
            payload["chunk_id"] = cid
            points.append(qmodels.PointStruct(
                id=point_id,
                vector=vec,
                payload=payload
            ))
        if points:
            self.client.upsert(collection_name=self.collection_name, points=points)

    def search(self, query_vector: List[float], top_k: int = 20, active_only: bool = True) -> List[Tuple[str, float]]:
        query_filter = None
        if active_only:
            query_filter = qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="active",
                        match=qmodels.MatchValue(value=1)
                    )
                ]
            )

        # qdrant-client search
        try:
            hits = self.client.query_points(
                collection_name=self.collection_name,
                query=query_vector,
                limit=top_k,
                query_filter=query_filter
            ).points
        except Exception:
            # Fallback search method for older client API
            hits = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=top_k,
                query_filter=query_filter
            )

        results: List[Tuple[str, float]] = []
        for hit in hits:
            cid = hit.payload.get("chunk_id")
            score = float(hit.score)
            if cid:
                results.append((cid, score))
        return results

    def delete_by_doc_id(self, doc_id: str):
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=qmodels.FilterSelector(
                filter=qmodels.Filter(
                    must=[
                        qmodels.FieldCondition(
                            key="doc_id",
                            match=qmodels.MatchValue(value=doc_id)
                        )
                    ]
                )
            )
        )

    def verify_chunks(self, chunk_ids: List[str]) -> None:
        """Ensure Qdrant has accepted every point before a job becomes ready."""
        point_ids = [str(uuid.uuid5(uuid.NAMESPACE_DNS, cid)) for cid in chunk_ids]
        points = self.client.retrieve(
            collection_name=self.collection_name,
            ids=point_ids,
            with_vectors=False,
        )
        found = {point.payload.get("chunk_id") for point in points if point.payload}
        missing = set(chunk_ids) - found
        if missing:
            raise RuntimeError(f"Qdrant chưa xác nhận {len(missing)} vector chunk.")

vector_store = VectorStore()
