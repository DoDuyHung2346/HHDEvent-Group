import time
import tempfile
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.store.db import init_db

def test_upload_and_check_chunks():
    init_db()
    with TestClient(app) as client:
        headers = {"Authorization": f"Bearer {settings.ADMIN_TOKEN}"}

        sample_md = """---
title: "Tài liệu thử nghiệm E2E"
doc_type: faq
---
## EventViet thành lập năm nào?
EventViet Demo được thành lập từ năm 2018 tại Hà Nội.

## Hotline liên hệ nhanh là số nào?
Hotline chính thức của chúng tôi là 1900 6886.
"""

        with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as f:
            f.write(sample_md)
            f_path = Path(f.name)

        try:
            with open(f_path, "rb") as f_bytes:
                res = client.post(
                    "/api/kb/documents",
                    headers=headers,
                    files={"file": ("faq-e2e.md", f_bytes, "text/markdown")},
                    data={"doc_type": "faq"}
                )
            assert res.status_code == 202
            data = res.json()
            job_id = data["job_id"]
            doc_id = data["doc_id"]

            # Chờ job xử lý xong trong thread pool (tối đa 45s cho lần đầu load model)
            for _ in range(90):
                job_res = client.get(f"/api/kb/jobs/{job_id}", headers=headers)
                assert job_res.status_code == 200
                j_data = job_res.json()
                if j_data["status"] == "ready":
                    break
                time.sleep(0.5)

            assert j_data["status"] == "ready"
            assert j_data["progress"] == 1.0

            # Kiểm tra chunks qua API
            chunks_res = client.get(f"/api/kb/documents/{doc_id}/chunks", headers=headers)
            assert chunks_res.status_code == 200
            chunks = chunks_res.json()
            assert len(chunks) == 2
            assert any("1900 6886" in c["text_display"] for c in chunks)

            # Xóa tài liệu sau test
            del_res = client.delete(f"/api/kb/documents/{doc_id}", headers=headers)
            assert del_res.status_code == 200

        finally:
            f_path.unlink(missing_ok=True)


def test_empty_upload_is_rejected_before_enqueueing():
    init_db()
    with TestClient(app) as client:
        res = client.post(
            "/api/kb/documents",
            headers={"Authorization": f"Bearer {settings.ADMIN_TOKEN}"},
            files={"file": ("empty.md", b"", "text/markdown")},
        )
    assert res.status_code == 400
    assert "rỗng" in res.json()["detail"]
