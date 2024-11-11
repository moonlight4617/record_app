# main.py

from fastapi import APIRouter, HTTPException, Depends, Query, Header, status
from app.services.content_service import create_content_service
from app.schemas.content import ContentData
import traceback

router = APIRouter(prefix="/content")

# データベースの代わりに一時的に内容を保存するリストを使用（開発テスト用）
contents_db = []

@router.post("/add", tags=["content"])
async def add_content(content: ContentData):
    try:
        await create_content_service(content)
        return {"message": "Content added successfully"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
