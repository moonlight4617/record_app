from app.db.dynamodb import get_content_table, content_table
from app.services.user_service import get_user_id
from app.schemas.content import DependsData
from fastapi import HTTPException, Request, Depends
from typing import Any

async def get_content_table_and_user_id(
    table: Any = Depends(get_content_table),
    user_id: str = Depends(get_user_id),
) -> DependsData:
    return DependsData(table=table, user_id=user_id)
