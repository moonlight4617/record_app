from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)
from app.services.content_service import get_years_service
from typing import List
from app.schemas.content import DependsData
from app.services.depends_service import get_content_table_and_user_id
import traceback

router = APIRouter(prefix="/content")


@router.get("/years", tags=["content"])
async def get_years(
    depends: DependsData = Depends(get_content_table_and_user_id),
) -> List[str]:
    try:
        years = await get_years_service(depends.user_id, depends.table)
        return sorted(years, reverse=True)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
