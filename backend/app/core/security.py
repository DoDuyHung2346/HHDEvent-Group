import hmac
import unicodedata
import re
from fastapi import Header, HTTPException, status
from app.config import settings

def verify_admin_token(authorization: str = Header(None)) -> bool:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Must be Bearer <token>",
        )
    token = parts[1]
    if not hmac.compare_digest(token, settings.ADMIN_TOKEN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin token",
        )
    return True

CONTROL_CHARS_REGEX = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")

def sanitize_input(text: str, max_chars: int = settings.MAX_QUERY_CHARS) -> str:
    if not text:
        return ""
    # Chuẩn hoá NFC
    text = unicodedata.normalize("NFC", text)
    # Bỏ ký tự điều khiển
    text = CONTROL_CHARS_REGEX.sub("", text)
    # Cắt độ dài tối đa
    return text[:max_chars].strip()
