from typing import Optional

class RAGException(Exception):
    def __init__(self, message: str, status_code: int = 500, detail: Optional[str] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.detail = detail

class DocumentParseException(RAGException):
    def __init__(self, message: str, detail: Optional[str] = None):
        super().__init__(message, status_code=400, detail=detail)

class EmbeddingDimMismatchException(RAGException):
    def __init__(self, message: str):
        super().__init__(message, status_code=500)

class LLMProviderException(RAGException):
    def __init__(self, message: str, detail: Optional[str] = None):
        super().__init__(message, status_code=502, detail=detail)
