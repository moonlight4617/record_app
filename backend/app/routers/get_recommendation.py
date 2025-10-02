import traceback
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.schemas.content import ContentType, DependsData
from app.services.content_service import (
    generate_recommendations_bedrock,
    get_recent_contents_service,
)
from app.services.depends_service import get_content_table_and_user_id

router = APIRouter(prefix="/content")


@router.get("/recommend", tags=["content"])
async def get_recommendations(
    content_type: Optional[ContentType] = Query(
        None
    ),  # TODO: nullでない場合は？
    depends: DependsData = Depends(get_content_table_and_user_id),
):
    try:
        # 有料会員でなければ処理を行わずフラグを返却
        if not depends.is_premium:
            return {
                "recommendations": [],
                "message": "この機能は有料会員限定です",
                "isPremium": False,
            }

        # DynamoDBからユーザーの履歴を取得
        items = get_recent_contents_service(
            depends.user_id, depends.table, content_type
        )
        # 履歴が無い / 取得できない場合
        if not items:
            return {
                "recommendations": [],
                "message": "履歴が不足しているためレコメンドを生成できません",
                "isPremium": True,
            }

        history = [item.get("title") for item in items if item.get("title")]
        content_type_value = (
            items[0].get("type")
            if items and items[0].get("type")
            else (content_type or ContentType.movie)
        )

        # Bedrockを使ってレコメンドを生成
        recommendations = generate_recommendations_bedrock(
            content_type_value, history
        )
        return {"recommendations": recommendations, "isPremium": True}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
