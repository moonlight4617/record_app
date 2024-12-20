from fastapi import APIRouter, HTTPException, Depends, Query, Header, status
from app.services.user_service import get_user_id
from app.services.content_service import create_content_service
from app.schemas.content import ContentData
import traceback

router = APIRouter(prefix="/content")

# データベースの代わりに一時的に内容を保存するリストを使用（開発テスト用）
contents_db = []

@router.post("/add", tags=["content"])
async def add_content(content: ContentData, user_id: str = Depends(get_user_id)):
    try:
        await create_content_service(content, user_id)
        return {"message": "Content added successfully"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
