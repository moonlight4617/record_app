from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
import traceback
from app.services.content_service import get_year_contents_service
from app.schemas.content import ContentData, DependsData
from app.services.depends_service import get_content_table_and_user_id

router = APIRouter(prefix="/content")

@router.get("/year={year}", tags=["content"])
async def get_year_contents(year: int, depends: DependsData = Depends(get_content_table_and_user_id)) -> List[dict]:
    try:
        content_items = [ContentData(**item) for item in get_year_contents_service(depends.user_id, depends.table, year)]
        return content_items

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")
