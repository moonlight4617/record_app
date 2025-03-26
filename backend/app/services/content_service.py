from app.crud.content_crud import (
    add_content,
    get_years,
    get_year_contents,
    get_year_best,
    update_best,
    delete_best,
    update_content,
    add_watchlist,
    get_watchlist_contents,
    delete_watchlist_contents,
    get_recent_contents
)
from app.schemas.content import RegisterContentData, ContentData, watchlistData
from app.utils import extract_year_from_date
from typing import List, Any
import boto3
import json


async def create_content_service(
    content_data: RegisterContentData, user_id: str, table: Any
):
    if content_data.date:
        content_data.year = extract_year_from_date(content_data.date)

    content_data.userId = user_id

    # TODO: 試し修正。これでうまくいけば更新処理も同様に修正
    content_data.type_date = content_data.type + "#" + content_data.date
    add_content(content_data, table)

async def edit_content_service(
    content_data: RegisterContentData, user_id: str, table: Any
):
    if content_data.date:
        content_data.year = extract_year_from_date(content_data.date)

    content_data.userId = user_id
    return update_content(content_data, table)


async def update_best_service(
    contents: List[ContentData], user_id: str, table: Any
):
    if (contents[0].userId != user_id) or (not contents[0].year):
        raise
    ex_best_contents = get_year_best(user_id, contents[0].year, table)
    # rank属性削除して後に再度rank属性付与
    delete_best(ex_best_contents, table)
    update_best(contents, table)


async def get_years_service(userId: str, table: Any):
    return get_years(userId, table)


def get_year_contents_service(
    user_id: str, table: Any, year: int
) -> list[dict]:
    return get_year_contents(user_id, table, year)


# def get_year_best_service(user_id: str, year: int) -> list[dict]:
#     return get_year_best(user_id, year)


async def add_watchlist_service(
    content: watchlistData, user_id: str, table: Any
):
    content.userId = user_id
    add_watchlist(content, table)


def get_watchlist_service(user_id: str, table: Any) -> list[dict]:
    return get_watchlist_contents(user_id, table)


async def delete_watchlist_service(
    user_id: str, table: Any, content: watchlistData
) -> list[dict]:
    if (content.userId != user_id) or (not content.contentId):
        raise

    return delete_watchlist_contents(user_id, table, content.contentId)

def get_recent_contents_service(
        user_id: str, table: Any, content_type: str
) -> list[dict]:
    return get_recent_contents(user_id, table, content_type)

def generate_recommendations_bedrock(history: List[str]) -> List[str]:
    # TODO: 一時コミット。後ほど整理
    """Amazon Bedrockを使ってレコメンドを生成"""
    client = boto3.client("bedrock-runtime", region_name="ap-northeast-1")

    prompt = f"""
    私は以下の映画や本を鑑賞・読書しました。
    {history}

    次に読むべき本や観るべき映画を3つ推薦してください。
    作品名だけでなく、簡単な説明もつけてください。
    """

    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 300,
        "temperature": 0.7,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    })

    response = client.invoke_model(
        modelId="anthropic.claude-3-haiku-20240307-v1:0",
        body=body.encode('utf-8')
    )

    # Bedrockのレスポンスをパース
    response_body = json.loads(response["body"].read().decode("utf-8"))
    print("response_body")
    print(response_body)
    recommendations = response_body['content'][0]['text'].split("\n")
    print("recommendations")
    print(recommendations)

    return recommendations
