from boto3.dynamodb.conditions import Key, Attr
from app.db.dynamodb import content_table
from app.schemas.content import RegisterContentData, ContentData, ContentType
from typing import List

def add_content(content: RegisterContentData):
    item = content.dict()
    content_table.put_item(Item=item)

def update_best(contents: List[ContentData]):
    for content in contents:
        content_table.update_item(
            Key= {
                'contentId': content.contentId,
                'userId': content.userId
            },
            UpdateExpression="SET #rnk = :r",
            ExpressionAttributeNames={
                "#rnk": "rank"  # rank をエイリアス #rnk として定義
            },
            ExpressionAttributeValues={
                ":r": content.rank
            }
        )

def delete_best(contents: list[ContentData]):
    for content in contents:
        content_table.update_item(
            Key= {
                'contentId': content["contentId"],
                'userId': content["userId"]
            },
            UpdateExpression="REMOVE #rnk",  # エイリアスを使用
            ExpressionAttributeNames={
                "#rnk": "rank"  # rank をエイリアス #rnk として定義
            }
        )

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

def get_year_contents(user_id: str, year: int) -> list[dict]:
    response = content_table.query(
        IndexName="YearIndex",
        KeyConditionExpression=Key("userId").eq(user_id) & Key("year").eq(year)
    )
    return response.get("Items", [])

# TODO:不要そうであれば後ほど削除
# def get_year(user_id: str, year: int) -> list[dict]:
#     response = content_table.query(
#         IndexName="RankIndex",
#         KeyConditionExpression=Key("userId").eq(user_id)
#     )
#     return response.get("Items", [])

# TODO:不要そうであれば後ほど削除
def get_year_best(user_id: str, year: int) -> list[dict]:
    response = content_table.query(
        IndexName="RankIndex",
        KeyConditionExpression=Key("userId").eq(user_id),
        FilterExpression =Attr("year").eq(year)
    )
    return response.get("Items", [])
