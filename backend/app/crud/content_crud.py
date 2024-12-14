from boto3.dynamodb.conditions import Key, Attr
from app.schemas.content import RegisterContentData, ContentData, ContentType
from typing import List, Any

def add_content(content: RegisterContentData, table: Any):
    item = content.dict()
    table.put_item(Item=item)

def update_content(content: RegisterContentData, table: Any):
    response = table.update_item(
        Key = {
            'contentId': content.contentId,
            'userId': content.userId
        },
        UpdateExpression="SET #ty = :ty, #ti = :ti, #d = :d, #y = :y, #n = :n, #l = :l",
        ConditionExpression="attribute_exists(userId) AND attribute_exists(contentId)",
        ExpressionAttributeNames = {
            "#ty": "type",
            "#ti": "title",
            "#d": "date",
            "#y": "year",
            "#n": "notes",
            "#l": "link"
        },
        ExpressionAttributeValues={
            ":ty": content.type,
            ":ti": content.title,
            ":d": content.date,
            ":y": content.year,
            ":n": content.notes,
            ":l": content.link
        },
        ReturnValues="ALL_NEW"  # 更新後の完全なアイテムを返却
    )
    return response.get('Attributes')

def update_best(contents: List[ContentData], table: Any):
    for content in contents:
        table.update_item(
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

def delete_best(contents: list[ContentData], table: Any):
    for content in contents:
        table.update_item(
            Key= {
                'contentId': content["contentId"],
                'userId': content["userId"]
            },
            UpdateExpression="REMOVE #rnk",  # エイリアスを使用
            ExpressionAttributeNames={
                "#rnk": "rank"  # rank をエイリアス #rnk として定義
            }
        )

def get_years(userId: str, table: Any):
    response = table.query(
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

def get_year_contents(user_id: str, table: Any, year: int) -> list[dict]:
    response = table.query(
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

def get_year_best(user_id: str, year: int, table: Any) -> list[dict]:
    response = table.query(
        IndexName="RankIndex",
        KeyConditionExpression=Key("userId").eq(user_id),
        FilterExpression =Attr("year").eq(year)
    )
    return response.get("Items", [])
