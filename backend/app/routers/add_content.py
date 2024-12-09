from fastapi import APIRouter, HTTPException, Depends, Query, Header, status
from app.services.content_service import create_content_service
from app.schemas.content import RegisterContentData, DependsData
from app.services.depends_service import get_content_table_and_user_id
import traceback

router = APIRouter(prefix="/content")

@router.post("/add", tags=["content"])
async def add_content(content: RegisterContentData, depends: DependsData = Depends(get_content_table_and_user_id)):
    try:
        await create_content_service(content, depends.user_id, depends.table)
        return {"message": "Content added successfully"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
