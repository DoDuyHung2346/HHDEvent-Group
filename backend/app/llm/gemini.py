import json
import httpx
from typing import List, Tuple, Type, TypeVar, Optional, Dict, Any
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import settings
from app.core.logging import logger
from app.llm.base import LLMClient, Embedder, EmbeddingError, validate_and_normalize_embeddings

T = TypeVar("T", bound=BaseModel)

# ─── Local SentenceTransformer Embedder ─────────────────────────────────────

class LocalSTEmbedder(Embedder):
    """
    Local sentence-transformers embedder – không cần API key.
    Hỗ trợ tiếng Việt tốt với paraphrase-multilingual-MiniLM-L12-v2 (dim=384).
    Model được cache tại ~/.cache/huggingface/hub sau lần download đầu.
    """
    _model_cache: dict = {}  # Class-level cache để tránh load lại nhiều lần

    def __init__(self, model_name: str = "paraphrase-multilingual-MiniLM-L12-v2", dim: int = 384):
        self.model_name = model_name
        self._dim = dim
        self._model = None

    def _load_model(self):
        if self._model is None:
            if self.model_name in LocalSTEmbedder._model_cache:
                self._model = LocalSTEmbedder._model_cache[self.model_name]
                logger.info(f"LocalSTEmbedder: Loaded '{self.model_name}' from class cache.")
            else:
                try:
                    from sentence_transformers import SentenceTransformer
                    logger.info(f"LocalSTEmbedder: Loading '{self.model_name}' (download if needed)...")
                    self._model = SentenceTransformer(self.model_name)
                    LocalSTEmbedder._model_cache[self.model_name] = self._model
                    logger.info(f"LocalSTEmbedder: Model '{self.model_name}' ready, dim={self._dim}")
                except Exception as e:
                    logger.error(f"LocalSTEmbedder: Failed to load model: {e}")
                    raise

    @property
    def dim(self) -> int:
        return self._dim

    def embed_texts(self, texts: List[str], task_type: str = "RETRIEVAL_DOCUMENT") -> List[List[float]]:
        try:
            self._load_model()
            embeddings = self._model.encode(
                texts, batch_size=32, show_progress_bar=False, normalize_embeddings=True
            )
            return validate_and_normalize_embeddings(
                [emb.tolist() for emb in embeddings], len(texts), self._dim
            )
        except Exception as e:
            # Falling back to a hash embedding corrupts retrieval because it is a
            # distinct vector space from already indexed documents.
            raise EmbeddingError(f"Không thể tạo embedding local: {e}") from e

    def embed_query(self, query: str) -> List[float]:
        return self.embed_texts([query], task_type="RETRIEVAL_QUERY")[0]


# ─── Gemini LLM via OpenAI-compatible endpoint ───────────────────────────────

class GeminiLLM(LLMClient):
    def __init__(self):
        self.api_key = settings.LLM_API_KEY or settings.GEMINI_API_KEY
        self.base_url = settings.LLM_BASE_URL
        self.model = settings.LLM_MODEL

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Type[T],
        temperature: float = 0.2,
        max_tokens: int = 700
    ) -> Tuple[T, Dict[str, Any]]:
        # Nếu dùng endpoint OpenAI-compatible (vilao.ai, etc.)
        if self.base_url and "vilao.ai" in self.base_url:
            endpoint = self.base_url.rstrip("/") + "/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            # Ép trả về JSON bằng system instruction & format
            schema_json = json.dumps(response_schema.model_json_schema(), ensure_ascii=False)
            sys_instruct = f"{system_prompt}\nBẮT BUỘC trả về đúng JSON Schema sau:\n{schema_json}"
            
            body = {
                "model": self.model,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": sys_instruct},
                    {"role": "user", "content": user_prompt}
                ]
            }

            with httpx.Client(timeout=settings.LLM_TIMEOUT_S) as client:
                res = client.post(endpoint, headers=headers, json=body)
                if not res.is_success:
                    logger.error(f"LLM API Error {res.status_code}: {res.text}")
                    res.raise_for_status()
                data = res.json()
                raw_content = data["choices"][0]["message"]["content"]

                # Loại bỏ markdown code blocks nếu model trả về ```json ... ```
                clean_json = raw_content.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:]
                elif clean_json.startswith("```"):
                    clean_json = clean_json[3:]
                if clean_json.endswith("```"):
                    clean_json = clean_json[:-3]
                clean_json = clean_json.strip()

                parsed = response_schema.model_validate_json(clean_json)
                usage = data.get("usage", {})
                return parsed, usage

        # Dùng google-genai SDK nếu không qua proxy OpenAI
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=self.api_key)
        resp = client.models.generate_content(
            model=self.model,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema=response_schema,
                temperature=temperature,
                max_output_tokens=max_tokens
            )
        )
        parsed = resp.parsed
        usage = {
            "input_tokens": getattr(resp.usage_metadata, "prompt_token_count", 0),
            "output_tokens": getattr(resp.usage_metadata, "candidates_token_count", 0)
        }
        return parsed, usage

    def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        if self.base_url and "vilao.ai" in self.base_url:
            endpoint = self.base_url.rstrip("/") + "/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            body = {
                "model": self.model,
                "temperature": settings.LLM_TEMPERATURE,
                "max_tokens": settings.LLM_MAX_OUTPUT_TOKENS,
                "messages": messages
            }
            with httpx.Client(timeout=settings.LLM_TIMEOUT_S) as client:
                res = client.post(endpoint, headers=headers, json=body)
                res.raise_for_status()
                return res.json()["choices"][0]["message"]["content"]
        else:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=self.api_key)
            resp = client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=settings.LLM_TEMPERATURE,
                    max_output_tokens=settings.LLM_MAX_OUTPUT_TOKENS
                )
            )
            return resp.text

class GeminiEmbedder(Embedder):
    def __init__(self, dim: int = 768):
        self._dim = dim
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.EMBED_MODEL

    @property
    def dim(self) -> int:
        return self._dim

    def embed_texts(self, texts: List[str], task_type: str = "RETRIEVAL_DOCUMENT") -> List[List[float]]:
        if not texts:
            return []
        try:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=self.api_key)
            result = client.models.embed_content(
                model=self.model,
                contents=texts,
                config=types.EmbedContentConfig(
                    task_type=task_type,
                    output_dimensionality=self._dim,
                ),
            )
            embeddings = [e.values for e in result.embeddings]
            return validate_and_normalize_embeddings(embeddings, len(texts), self._dim)
        except Exception as e:
            raise EmbeddingError(f"Không thể tạo embedding Gemini: {e}") from e

    def embed_query(self, query: str) -> List[float]:
        return self.embed_texts([query], task_type="RETRIEVAL_QUERY")[0]
