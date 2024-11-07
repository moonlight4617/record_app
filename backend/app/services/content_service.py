from app.crud.content_crud import add_content
from app.schemas.content import ContentData

async def create_content_service(content_data: ContentData):
    # 必要な前処理を実施（例：データのバリデーション）
    await add_content(content_data)

# def retrieve_content_service(content_id: str):
#     return get_content(content_id)
