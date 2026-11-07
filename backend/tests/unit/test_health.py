import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.store.db import init_db

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

def test_health_check_returns_200():
    client = TestClient(app)
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] in ["ok", "degraded"]
    assert "uptime_seconds" in data
    assert "embed_dim_ok" in data
    assert data["embed_dim_ok"] is True
