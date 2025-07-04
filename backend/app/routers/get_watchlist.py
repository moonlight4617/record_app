import traceback
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.content import DependsData, watchlistData
from app.services.content_service import get_watchlist_service
from app.services.depends_service import get_content_table_and_user_id

router = APIRouter(prefix="/content")


@router.get("/watchlist", tags=["content"])
async def get_watchlist(
    depends: DependsData = Depends(get_content_table_and_user_id),
) -> List[dict]:
    try:
        content_items = [
            watchlistData(**item)
            for item in get_watchlist_service(depends.user_id, depends.table)
        ]
        return content_items

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
