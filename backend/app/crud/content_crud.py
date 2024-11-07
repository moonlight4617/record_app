from boto3.dynamodb.conditions import Key
from app.db.dynamodb import table
from app.schemas.content import ContentData

async def add_content(content: ContentData):
    item = content.dict()
    await table.put_item(Item=item)

# def get_content(content_id: str):
#     response = table.get_item(Key={"content_id": content_id})
#     return response.get("Item")
