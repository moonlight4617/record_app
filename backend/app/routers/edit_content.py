from fastapi import APIRouter, HTTPException, Depends, Query, Header, status
from app.services.user_service import get_user_id
from app.services.content_service import edit_content_service
from app.schemas.content import RegisterContentData
import traceback

router = APIRouter(prefix="/content")

# データベースの代わりに一時的に内容を保存するリストを使用（開発テスト用）
contents_db = []

@router.post("/edit", tags=["content"])
async def edit_content(content: RegisterContentData, user_id: str = Depends(get_user_id)):
    try:
        result = await edit_content_service(content, user_id)
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
