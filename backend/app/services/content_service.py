import json
from typing import Any, List
import os
import requests

import boto3

from app.crud.content_crud import (add_content, add_watchlist, delete_best,
                                   delete_watchlist_contents,
                                   get_recent_contents, get_watchlist_contents,
                                   get_year_best, get_year_contents, get_years,
                                   update_best, update_content)
from app.schemas.content import ContentData, RegisterContentData, watchlistData
from app.utils import extract_year_from_date


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


def search_movie_links_tmdb(title: str) -> List[dict]:
    """TMDB APIで映画情報とリンクを取得"""
    try:
        # TMDB APIキーが環境変数にあると仮定
        api_key = os.getenv("TMDB_API_KEY")
        if not api_key:
            return []

        # 映画検索
        search_url = "https://api.themoviedb.org/3/search/movie"
        params = {
            "api_key": api_key,
            "query": title,
            "language": "ja-JP"
        }

        response = requests.get(search_url, params=params)
        if response.status_code != 200:
            return []

        data = response.json()
        if not data.get("results"):
            return []

        movie = data["results"][0]  # 最初の結果を使用
        movie_id = movie.get("id")

        links = []

        # TMDB詳細ページ
        links.append({
            "site_name": "The Movie Database",
            "url": f"https://www.themoviedb.org/movie/{movie_id}?language=ja",
        })

        # IMDb リンク (外部IDから取得)
        # external_url = (
        #     f"https://api.themoviedb.org/3/movie/{movie_id}/external_ids"
        # )
        # external_params = {"api_key": api_key}
        # external_response = requests.get(
        #     external_url, params=external_params
        # )

        # if external_response.status_code == 200:
        #     external_data = external_response.json()
        #     imdb_id = external_data.get("imdb_id")
        #     if imdb_id:
        #         links.append({
        #             "site_name": "IMDb",
        #             "url": f"https://www.imdb.com/title/{imdb_id}/",
        #             "description": "国際映画データベース"
        #         })

        # Amazon Prime Video (検索URL)
        links.append({
            "site_name": "Amazon Prime Video",
            "url": f"https://www.amazon.co.jp/s?k={title}+映画&i=instant-video",
        })

        return links

    except Exception as e:
        print(f"TMDB API error: {e}")
        return []


def search_book_links_google(title: str) -> List[dict]:
    """Google Books APIで書籍情報とリンクを取得"""
    try:
        # Google Books API (APIキー不要)
        search_url = "https://www.googleapis.com/books/v1/volumes"
        params = {
            "q": title,
            "langRestrict": "ja",
            "maxResults": 1
        }

        response = requests.get(search_url, params=params)
        if response.status_code != 200:
            return []

        data = response.json()
        if not data.get("items"):
            return []

        book = data["items"][0]

        links = []

        # Google Books詳細ページ
        if book.get("id"):
            links.append({
                "site_name": "Google Books",
                "url": f"https://books.google.co.jp/books?id={book['id']}",
            })

        # Amazon検索
        links.append({
            "site_name": "Amazon",
            "url": f"https://www.amazon.co.jp/s?k={title}+本",
        })

        # 楽天ブックス検索
        links.append({
            "site_name": "楽天ブックス",
            "url": f"https://books.rakuten.co.jp/search?sitem={title}",
        })

        return links

    except Exception as e:
        print(f"Google Books API error: {e}")
        return []


def verify_book_exists(title: str) -> bool:
    """Google Books APIで書籍の実在を確認"""
    try:
        search_url = "https://www.googleapis.com/books/v1/volumes"
        params = {
            "q": title,
            "langRestrict": "ja",
            "maxResults": 1
        }

        response = requests.get(search_url, params=params)
        if response.status_code != 200:
            return False

        data = response.json()
        if not data.get("items"):
            return False

        # 検索結果の最初の書籍のタイトルが入力タイトルと近似しているかチェック
        book = data["items"][0]
        volume_info = book.get("volumeInfo", {})
        found_title = volume_info.get("title", "").lower()
        input_title = title.lower()

        # タイトルが含まれているかの簡単なチェック
        return input_title in found_title or found_title in input_title

    except Exception as e:
        print(f"Book verification error: {e}")
        return False


def search_external_api_links(title: str, content_type: str) -> List[dict]:
    """外部APIを使って作品の信頼できるリンクを取得"""
    if content_type == "movie":
        return search_movie_links_tmdb(title)
    elif content_type == "book":
        return search_book_links_google(title)
    else:
        return []


def generate_recommendations_bedrock(
    type: str, history: List[str]
) -> str:
    # TODO: 一時コミット。後ほど整理
    """Amazon Bedrockを使ってレコメンドを生成"""
    try:

        client = boto3.client("bedrock-runtime", region_name="ap-northeast-1")

        tool_name = "Recommended_works_to_check_out_next"
        description = "次にチェックするべきおすすめ作品"
        tool_definition = {
            "toolSpec": {
                "name": tool_name,
                "description": description,
                "inputSchema": {
                    "json": {
                        "type": "object",
                        "properties": {
                            "recommendations": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "title": {"type": "string"},
                                        "desc": {"type": "string"},
                                        # "link": {"type": "string"}
                                    },
                                    "required": ["title", "desc"],
                                },
                            }
                        },
                        "required": ["recommendations"],
                    }
                },
            }
        }

        prompt = f"""
        <text>
        私は以下の{"映画を鑑賞" if type == "movie" else "本を読書"}しました。
        {history}

        {"次に観るべき映画" if type == "movie" else "次に読むべき本"}を3つ推薦してください。
        各作品について、タイトル、簡潔な説明を提供してください。
        タイトル、説明は日本語で返却してください。
        {tool_name} ツールのみを利用すること。
        </text>
        """

        print("prompt")
        print(prompt)

        messages = [
            {
                "role": "user",
                "content": [{"text": prompt}],
            }
        ]

        response = client.converse(
            modelId="anthropic.claude-3-haiku-20240307-v1:0",
            messages=messages,
            toolConfig={
                "tools": [tool_definition],
                "toolChoice": {
                    "tool": {
                        "name": tool_name,
                    },
                },
            },
        )
        print("response")
        print(response)

        response_content = response["output"]["message"]["content"]

        # json部を抽出
        tool_use_args = extract_tool_use_args(response_content)

        if tool_use_args and "recommendations" in tool_use_args:
            recommendations_list = tool_use_args["recommendations"]
            verified_recommendations = []

            # 各推薦作品の検証とリンク検索
            for rec in recommendations_list:
                if "title" in rec:
                    # 書籍の場合は実在確認
                    if type == "book":
                        if not verify_book_exists(rec["title"]):
                            print(f"書籍 '{rec['title']}' は実在しないため除外します")
                            continue

                    # リンク取得
                    links = search_external_api_links(rec["title"], type)

                    # リンクが取得できない場合は架空作品として除外
                    if not links or len(links) == 0:
                        print(f"作品 '{rec['title']}' のリンクが取得できないため除外します")
                        continue

                    rec["links"] = links
                    verified_recommendations.append(rec)

            # 検証済み推薦リストを返す
            final_result = {"recommendations": verified_recommendations}
            recommendations = json.dumps(
                final_result, indent=2, ensure_ascii=False
            )
            print(recommendations)
            return recommendations
        else:
            return json.dumps({"recommendations": []}, ensure_ascii=False)
    except Exception as e:
        print(f"""Error: {e}""")
        raise


def extract_tool_use_args(content):
    """Claude3の返却値からtoolUseのinputを抽出"""
    for item in content:
        if "toolUse" in item:
            return item["toolUse"]["input"]
    return None
