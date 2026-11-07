import threading
from typing import List, Tuple, Dict, Optional
import bm25s
from app.core.logging import logger

class BM25Holder:
    def __init__(self):
        self._lock = threading.Lock()
        self.chunk_ids: List[str] = []
        self.retriever_vi: Optional[bm25s.BM25] = None
        self.retriever_ascii: Optional[bm25s.BM25] = None

    def is_ready(self) -> bool:
        return self.retriever_vi is not None and len(self.chunk_ids) > 0

    def build_and_swap(
        self,
        chunk_ids: List[str],
        corpus_vi_tokens: List[List[str]],
        corpus_ascii_tokens: List[List[str]]
    ):
        if not chunk_ids:
            with self._lock:
                self.chunk_ids = []
                self.retriever_vi = None
                self.retriever_ascii = None
            return

        logger.info(f"Building BM25 indexes for {len(chunk_ids)} chunks...")
        # Build bm25_vi
        ret_vi = bm25s.BM25()
        ret_vi.index(corpus_vi_tokens)

        # Build bm25_ascii
        ret_ascii = bm25s.BM25()
        ret_ascii.index(corpus_ascii_tokens)

        with self._lock:
            self.chunk_ids = list(chunk_ids)
            self.retriever_vi = ret_vi
            self.retriever_ascii = ret_ascii
        logger.info("BM25 indexes built and atomically swapped.")

    def search_vi(self, query_tokens: List[str], top_k: int = 20) -> List[Tuple[str, float]]:
        with self._lock:
            if not self.retriever_vi or not self.chunk_ids or not query_tokens:
                return []
            k = min(top_k, len(self.chunk_ids))
            docs, scores = self.retriever_vi.retrieve([query_tokens], k=k)
            results = []
            for doc_idx, score in zip(docs[0], scores[0]):
                cid = self.chunk_ids[doc_idx]
                results.append((cid, float(score)))
            return results

    def search_ascii(self, query_tokens: List[str], top_k: int = 20) -> List[Tuple[str, float]]:
        with self._lock:
            if not self.retriever_ascii or not self.chunk_ids or not query_tokens:
                return []
            k = min(top_k, len(self.chunk_ids))
            docs, scores = self.retriever_ascii.retrieve([query_tokens], k=k)
            results = []
            for doc_idx, score in zip(docs[0], scores[0]):
                cid = self.chunk_ids[doc_idx]
                results.append((cid, float(score)))
            return results

bm25_holder = BM25Holder()
