from fastapi import APIRouter, HTTPException, Depends, Query, Header, status, Request
from app.services.content_service import get_years_service
from app.services.user_service import get_user_id
from typing import List
import traceback

router = APIRouter(prefix="/content")

# データベースの代わりに一時的に内容を保存するリストを使用（開発テスト用）
contents_db = []

@router.get("/years", tags=["content"])
async def get_years(user_id: str = Depends(get_user_id)) -> List[str]:
    try:
        years = await get_years_service(user_id)
        return years
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
