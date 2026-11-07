import json
import logging
import re
from typing import Any, Dict, Optional
from app.config import settings

# Patterns for PII masking: VN phone numbers, emails, CCCD
PHONE_REGEX = re.compile(r"(?:\+84|0)(?:3|5|7|8|9)\d{8}\b")
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
CCCD_REGEX = re.compile(r"\b\d{12}\b")

def mask_pii(text: Optional[str]) -> str:
    if not text or not settings.LOG_PII_MASK:
        return text or ""
    masked = PHONE_REGEX.sub("[PHONE_REDACTED]", text)
    masked = EMAIL_REGEX.sub("[EMAIL_REDACTED]", masked)
    masked = CCCD_REGEX.sub("[CCCD_REDACTED]", masked)
    return masked

class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": mask_pii(record.getMessage()),
            "logger": record.name,
        }
        if hasattr(record, "trace_id"):
            log_obj["trace_id"] = record.trace_id
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_obj, ensure_ascii=False)

def setup_logger(name: str = "app") -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)
    return logger

logger = setup_logger("eventviet_rag")
