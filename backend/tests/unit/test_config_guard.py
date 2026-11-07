from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.store.db import SessionLocal, init_db
from app.store.models import KBMetaModel

def test_config_guard_embed_dim():
    init_db()
    db = SessionLocal()
    # Lưu embed_dim lệch vào kb_meta
    meta = db.query(KBMetaModel).filter(KBMetaModel.key == "embed_dim").first()
    if not meta:
        meta = KBMetaModel(key="embed_dim", value="3072")
        db.add(meta)
    else:
        meta.value = "3072"
    db.commit()

    client = TestClient(app)
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["embed_dim_ok"] is False
    assert data["status"] == "degraded"

    # Reset lại đúng theo cấu hình hiện tại
    meta.value = str(settings.EMBED_DIM)
    db.commit()
    db.close()
