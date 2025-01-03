from fastapi import APIRouter, HTTPException, Depends
from app.services.content_service import add_watchlist_service
from app.schemas.content import watchlistData, DependsData
from app.services.depends_service import get_content_table_and_user_id
import traceback

router = APIRouter(prefix="/content")


@router.post("/addWatchlist", tags=["content"])
async def add_watchlist(
    content: watchlistData,
    depends: DependsData = Depends(get_content_table_and_user_id),
):
    try:
        await add_watchlist_service(content, depends.user_id, depends.table)
        return {"message": "WatchList added successfully"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
