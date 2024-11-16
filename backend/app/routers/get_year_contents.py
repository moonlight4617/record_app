from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
import traceback
from app.services.content_service import get_year_contents_service
from app.services.user_service import get_user_id
from app.schemas.content import ContentData


router = APIRouter(prefix="/content")

@router.get("/year={year}", tags=["content"])
async def get_year_contents(year: int, user_id: str = Depends(get_user_id)) -> List[dict]:
    try:
        content_items = [ContentData(**item) for item in get_year_contents_service(user_id, year)]

        return content_items

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")
