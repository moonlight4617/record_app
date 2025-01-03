from fastapi import APIRouter, HTTPException, Depends
from app.services.content_service import edit_content_service
from app.schemas.content import RegisterContentData, DependsData
from app.services.depends_service import get_content_table_and_user_id
import traceback

router = APIRouter(prefix="/content")


@router.post("/edit", tags=["content"])
async def edit_content(
    content: RegisterContentData,
    depends: DependsData = Depends(get_content_table_and_user_id),
):
    try:
        result = await edit_content_service(
            content, depends.user_id, depends.table
        )
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
