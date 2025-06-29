from typing import Any

from fastapi import Depends

from app.db.dynamodb import get_content_table
from app.schemas.content import DependsData
from app.services.user_service import get_user_id


async def get_content_table_and_user_id(
    table: Any = Depends(get_content_table),
    user_id: str = Depends(get_user_id),
) -> DependsData:
    return DependsData(table=table, user_id=user_id)
