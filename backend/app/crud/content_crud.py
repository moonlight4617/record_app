from boto3.dynamodb.conditions import Key
from app.db.dynamodb import content_table
from app.schemas.content import ContentData

def add_content(content: ContentData):
    item = content.dict()
    content_table.put_item(Item=item)

def get_years(userId: str):
    response = content_table.query(
        IndexName="YearIndex",
        KeyConditionExpression=Key("userId").eq(userId),
        ProjectionExpression="#yr",
        ExpressionAttributeNames={
            "#yr": "year"  # year を予約語として回避
        }
    )

    # `year`のみのリストを取得し、重複を排除
    years = list({item["year"] for item in response.get("Items", [])})
    return years

# def get_content(content_id: str):
#     response = table.get_item(Key={"content_id": content_id})
#     return response.get("Item")
