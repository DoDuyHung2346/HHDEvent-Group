"""Persistent storage for original knowledge-base files.

The relational database and Qdrant contain derived data. Keeping the original
document in private object storage makes every successful admin upload
recoverable and independent from a developer's local disk.
"""

from __future__ import annotations

import mimetypes
from pathlib import Path
from urllib.parse import quote

import httpx

from app.config import settings


class FileStorageError(RuntimeError):
    pass


class FileStorage:
    @property
    def backend_name(self) -> str:
        return settings.RAG_FILE_STORE

    def upload(self, source: Path, object_path: str) -> str | None:
        if settings.RAG_FILE_STORE == "local":
            return None
        if settings.RAG_FILE_STORE != "supabase":
            raise FileStorageError(f"RAG_FILE_STORE không hợp lệ: {settings.RAG_FILE_STORE}")

        base_url = (settings.NEXT_PUBLIC_SUPABASE_URL or "").rstrip("/")
        service_key = settings.SUPABASE_SERVICE_ROLE_KEY or ""
        if not base_url or not service_key:
            raise FileStorageError("Thiếu cấu hình Supabase Storage cho RAG.")

        content_type = mimetypes.guess_type(source.name)[0] or "application/octet-stream"
        endpoint = (
            f"{base_url}/storage/v1/object/"
            f"{quote(settings.SUPABASE_STORAGE_BUCKET, safe='')}/"
            f"{quote(object_path, safe='/')}"
        )
        with source.open("rb") as file_handle:
            response = httpx.post(
                endpoint,
                content=file_handle,
                headers={
                    "apikey": service_key,
                    "Authorization": f"Bearer {service_key}",
                    "Content-Type": content_type,
                    "x-upsert": "false",
                },
                timeout=90,
            )
        if response.status_code not in {200, 201}:
            raise FileStorageError(f"Không thể lưu file lên Supabase Storage ({response.status_code}): {response.text[:300]}")
        return object_path

    def delete(self, object_path: str | None) -> None:
        if settings.RAG_FILE_STORE != "supabase" or not object_path:
            return
        base_url = (settings.NEXT_PUBLIC_SUPABASE_URL or "").rstrip("/")
        service_key = settings.SUPABASE_SERVICE_ROLE_KEY or ""
        endpoint = f"{base_url}/storage/v1/object/{quote(settings.SUPABASE_STORAGE_BUCKET, safe='')}"
        response = httpx.request(
            "DELETE",
            endpoint,
            json={"prefixes": [object_path]},
            headers={"apikey": service_key, "Authorization": f"Bearer {service_key}"},
            timeout=30,
        )
        if response.status_code not in {200, 204}:
            raise FileStorageError(f"Không thể xóa file Supabase Storage ({response.status_code}).")


file_storage = FileStorage()
