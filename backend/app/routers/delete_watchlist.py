import traceback

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.content import DependsData, watchlistData
from app.services.content_service import delete_watchlist_service
from app.services.depends_service import get_content_table_and_user_id

router = APIRouter(prefix="/content")


@router.post("/deleteWatchlist", tags=["content"])
async def delete_watchlist(
    content: watchlistData,
    depends: DependsData = Depends(get_content_table_and_user_id),
):
    try:
        await delete_watchlist_service(depends.user_id, depends.table, content)
        return {"message": "Content added successfully"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
