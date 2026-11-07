from fastapi import APIRouter, Header, Depends
from sqlalchemy.orm import Session
from app.core.schemas import ChatRequest, ChatResponse
from app.store.db import get_db
from app.rag.pipeline import execute_chat_pipeline

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest, x_debug: str = Header(None)):
    return execute_chat_pipeline(req, x_debug=x_debug)
