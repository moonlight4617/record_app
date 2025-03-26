from fastapi import APIRouter, HTTPException, Depends, Query
from app.services.content_service import get_recent_contents_service, generate_recommendations_bedrock
from app.schemas.content import ContentType, DependsData
from app.services.depends_service import get_content_table_and_user_id
import traceback
from typing import Optional

router = APIRouter(prefix="/content")

@router.get("/recommend", tags=["content"])
async def get_recommendations(
    content_type: Optional[ContentType] = Query(None),  # TODO: nullでない場合は？
    depends: DependsData = Depends(get_content_table_and_user_id),
):
    try:
        """DynamoDBからユーザーの履歴を取得"""
        items = get_recent_contents_service(depends.user_id, depends.table, content_type)

        history = [f"{item['title']} ({item['type']})" for item in items]
        print("history")
        print(history)
        # return history;

        # Bedrockを使ってレコメンドを生成
        recommendations = generate_recommendations_bedrock(history)
        return {"recommendations": recommendations}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
