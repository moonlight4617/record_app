from typing import Any

from fastapi import Depends

from app.db.dynamodb import get_content_table, user_table
from app.schemas.content import DependsData
from app.services.user_service import get_user_id


async def get_content_table_and_user_id(
    table: Any = Depends(get_content_table),
    user_id: str = Depends(get_user_id),
) -> DependsData:
    # ユーザー課金状態をユーザーテーブルから取得（存在しない場合は無料）
    try:
        user_resp = user_table.get_item(Key={"userId": user_id})
        item = user_resp.get("Item") or {}
        is_premium = bool(item.get("is_premium"))
    except Exception:
        is_premium = False
    return DependsData(table=table, user_id=user_id, is_premium=is_premium)
