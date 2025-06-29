from typing import Any, List

from boto3.dynamodb.conditions import Attr, Key

from app.schemas.content import ContentData, RegisterContentData, watchlistData


def add_content(content: RegisterContentData, table: Any):
    item = content.dict()
    table.put_item(Item=item)


def update_content(content: RegisterContentData, table: Any):
    response = table.update_item(
        Key={"contentId": content.contentId, "userId": content.userId},
        UpdateExpression="SET #ty = :ty, #ti = :ti, #d = :d, #y = :y, #n = :n,\
            #l = :l REMOVE #s",
        ConditionExpression="attribute_exists(userId) AND\
            attribute_exists(contentId)",
        ExpressionAttributeNames={
            "#ty": "type",
            "#ti": "title",
            "#d": "date",
            "#y": "year",
            "#n": "notes",
            "#l": "link",
            "#s": "status",
        },
        ExpressionAttributeValues={
            ":ty": content.type,
            ":ti": content.title,
            ":d": content.date,
            ":y": content.year,
            ":n": content.notes,
            ":l": content.link,
        },
        ReturnValues="ALL_NEW",  # 更新後の完全なアイテムを返却
    )
    return response.get("Attributes")


def update_best(contents: List[ContentData], table: Any):
    for content in contents:
        table.update_item(
            Key={"contentId": content.contentId, "userId": content.userId},
            UpdateExpression="SET #rnk = :r",
            ExpressionAttributeNames={
                "#rnk": "rank"  # rank をエイリアス #rnk として定義
            },
            ExpressionAttributeValues={":r": content.rank},
        )


def delete_best(contents: list[ContentData], table: Any):
    for content in contents:
        table.update_item(
            Key={
                "contentId": content["contentId"],
                "userId": content["userId"],
            },
            UpdateExpression="REMOVE #rnk",  # エイリアスを使用
            ExpressionAttributeNames={
                "#rnk": "rank"  # rank をエイリアス #rnk として定義
            },
        )


def get_years(userId: str, table: Any):
    response = table.query(
        IndexName="YearIndex",
        KeyConditionExpression=Key("userId").eq(userId),
        ProjectionExpression="#yr",
        ExpressionAttributeNames={"#yr": "year"},  # year を予約語として回避
    )

    # `year`のみのリストを取得し、重複を排除
    years = list({item["year"] for item in response.get("Items", [])})
    return years


def get_year_contents(user_id: str, table: Any, year: int) -> list[dict]:
    response = table.query(
        IndexName="YearIndex",
        KeyConditionExpression=Key("userId").eq(user_id)
        & Key("year").eq(year),
    )
    items = response.get("Items", [])

    # date属性で昇順に並び替え
    sorted_items = sorted(items, key=lambda x: x.get("date", ""))
    return sorted_items


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
        FilterExpression=Attr("year").eq(year),
    )
    return response.get("Items", [])


def add_watchlist(content: watchlistData, table: Any):
    item = content.dict()
    table.put_item(Item=item)


def get_watchlist_contents(user_id: str, table: Any) -> list[dict]:
    """
    ウォッチリストのコンテンツを取得するメソッド。

    :param user_id: ユーザーID
    :param table: DynamoDBのテーブルオブジェクト
    :return: ウォッチリストのコンテンツ（リスト形式）
    """
    response = table.scan(
        FilterExpression=Attr("userId").eq(user_id)
        & Attr("status").eq("to_watch")
    )
    return response.get("Items", [])


def delete_watchlist_contents(user_id: str, table: Any, content_id: str):
    """
    ウォッチリストのコンテンツを削除するメソッド。

    :param user_id: ユーザーID
    :param table: DynamoDBのテーブルオブジェクト
    :param content_id: 削除対象のコンテンツコンテンツID
    :return: なし
    """
    table.delete_item(Key={"contentId": content_id, "userId": user_id})


def get_recent_contents(
    user_id: str, table: Any, content_type: str
) -> list[dict]:
    """
    直近鑑賞したコンテンツを取得するメソッド。

    :param user_id: ユーザーID
    :param table: DynamoDBのテーブルオブジェクト
    :param content_type: 対象のコンテンツコンテンツタイプ
    :return: 直近鑑賞したコンテンツ
    """
    response = table.query(
        IndexName="userId-type-date-index",
        KeyConditionExpression="userId = :uid AND begins_with(type_date, :type)",   # noqa: E501
        ExpressionAttributeValues={":uid": user_id, ":type": content_type},
        ScanIndexForward=False,  # 降順（新しい順）
        Limit=3,  # 上位3件
    )
    return response.get("Items", [])
