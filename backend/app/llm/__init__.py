from app.config import settings
from app.llm.base import LLMClient, Embedder, Reranker
from app.llm.fakes import FakeLLM, FakeEmbedder, FakeReranker
from app.llm.gemini import GeminiLLM, GeminiEmbedder, LocalSTEmbedder

def get_llm_client() -> LLMClient:
    if settings.LLM_PROVIDER == "fake":
        return FakeLLM()
    return GeminiLLM()

def get_embedder() -> Embedder:
    if settings.EMBED_PROVIDER == "fake":
        return FakeEmbedder(dim=settings.EMBED_DIM)
    if settings.EMBED_PROVIDER == "local_st":
        return LocalSTEmbedder(model_name=settings.EMBED_MODEL, dim=settings.EMBED_DIM)
    # gemini provider
    return GeminiEmbedder(dim=settings.EMBED_DIM)

def get_reranker() -> Reranker:
    if settings.RERANK_PROVIDER == "fake":
        return FakeReranker()
    # Khi none hoặc local_bge
    return FakeReranker()
