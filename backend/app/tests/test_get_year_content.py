import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app
from app.schemas.content import ContentData
from app.services.depends_service import get_content_table_and_user_id
from app.schemas.content import DependsData
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

# モックデータと設定
mock_table = MagicMock()
mock_user_id = "test_user"
mock_year = 2024
mock_content_items = [
    {
        "contentId": "1",
        "userId": mock_user_id,
        "type": "movie",
        "title": "Title 1",
        "date": "2024-11-10",
        "year": 2024,
        "notes": "Note 1",
        "link": "https://example1.com",
        "rank": None
    },
    {
        "contentId": "2",
        "userId": mock_user_id,
        "type": "book",
        "title": "Title 2",
        "date": "2024-08-15",
        "year": 2024,
        "notes": "Note 2",
        "link": "https://example2.com",
        "rank": None
    },
]

# 依存関係をモック化
async def mock_get_content_table_and_user_id():
    return DependsData(table=mock_table, user_id=mock_user_id)

app.dependency_overrides[get_content_table_and_user_id] = mock_get_content_table_and_user_id
client = TestClient(app)

@pytest.mark.asyncio
async def test_get_year_contents_success():
    """正常系: 指定された年のコンテンツを取得できることを確認"""
    mock_table.query = MagicMock(return_value={"Items": mock_content_items})

    # テスト対象のエンドポイントを呼び出し
    response = client.get("/content/year=2024")

    # レスポンスのアサーション
    assert response.status_code == 200
    assert response.json() == mock_content_items

    # 実際の KeyConditionExpression を作成
    expected_key_condition = Key("userId").eq("test_user") & Key("year").eq(2024)

    # query メソッドの呼び出しを検証
    mock_table.query.assert_called_once_with(
        IndexName="YearIndex",
        KeyConditionExpression=expected_key_condition,  # 実際の条件式を使用
    )

# 異常系テスト: DynamoDBクエリ失敗
@pytest.mark.asyncio
async def test_get_year_contents_dynamodb_error():
    """異常系: DynamoDBがエラーをスローした場合の返却値が想定通り"""
    mock_table.query = MagicMock(side_effect=ClientError(
        error_response={
            "Error": {
                "Code": "ProvisionedThroughputExceededException",
                "Message": "Rate exceeded"
            }
        },
        operation_name="Query"
    ))

    response = client.get(f"/content/year={mock_year}")

    # 検証
    assert response.status_code == 500  # 内部サーバーエラー
    assert response.json()["detail"] == "Internal Server Error"

# 異常系テスト: クエリ結果が空の場合
@pytest.mark.asyncio
async def test_get_year_contents_no_data():
    """異常系: 指定された年のコンテンツが存在しない場合"""
    mock_table.query = MagicMock(return_value={"Items": []})

    response = client.get(f"/content/year={mock_year}")

    # 検証
    assert response.status_code == 200
    assert response.json() == []  # 空のリストが返ることを確認

# 異常系テスト: 無効なパラメータ
@pytest.mark.asyncio
async def test_get_year_contents_invalid_year():
    """異常系: 年のパラメータが無効な場合"""
    response = client.get("/content/year=invalid")

    # 検証
    assert response.status_code == 422  # バリデーションエラー
