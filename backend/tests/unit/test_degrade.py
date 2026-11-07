from fastapi.testclient import TestClient
from app.main import app

def test_chat_pipeline_fallback():
    client = TestClient(app)
    # Câu hỏi không liên quan đến sự kiện (ngoài phạm vi)
    res = client.post(
        "/api/chat",
        json={"session_id": "test_sess", "message": "Giải bài toán vi tích phân bậc 3 giúp tôi", "history": []}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["out_of_scope", "fallback"]
    assert len(data["follow_ups"]) == 3
    assert "answer" in data

def test_chat_greeting():
    client = TestClient(app)
    res = client.post(
        "/api/chat",
        json={"session_id": "test_sess", "message": "Xin chào bạn", "history": []}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "smalltalk"
    assert len(data["follow_ups"]) == 3
    assert "EventViet" in data["answer"]
