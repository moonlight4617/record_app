import traceback
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.content import ContentData, DependsData
from app.services.content_service import update_best_service
from app.services.depends_service import get_content_table_and_user_id

router = APIRouter(prefix="/content")


@router.post("/update-best", tags=["content"])
async def update_best(
    contents: List[ContentData],
    depends: DependsData = Depends(get_content_table_and_user_id),
):
    try:
        await update_best_service(contents, depends.user_id, depends.table)
        return {"message": "Best Content update successfully"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
