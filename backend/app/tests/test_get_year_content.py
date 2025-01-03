import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
from app.tests.conftest import mock_dependencies, mock_user_id  # noqa: F401

# モックデータと設定
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
        "rank": None,
        "status": None,
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
        "rank": None,
        "status": None,
    },
]

client = TestClient(app)


@pytest.mark.asyncio
async def test_get_year_contents_success(mock_dependencies):  # noqa: F811
    """正常系: 指定された年のコンテンツを取得できることを確認"""
    mock_table = mock_dependencies
    mock_table.query = MagicMock(return_value={"Items": mock_content_items})

    # テスト対象のエンドポイントを呼び出し
    response = client.get("/content/year=2024")

    # レスポンスのアサーション
    assert response.status_code == 200
    assert response.json() == mock_content_items

    # 実際の KeyConditionExpression を作成
    expected_key_condition = Key("userId").eq("test_user") & Key("year").eq(
        2024
    )

    # query メソッドの呼び出しを検証
    mock_table.query.assert_called_once_with(
        IndexName="YearIndex",
        KeyConditionExpression=expected_key_condition,  # 実際の条件式を使用
    )


# 異常系テスト: DynamoDBクエリ失敗
@pytest.mark.asyncio
async def test_get_year_contents_dynamodb_error(mock_dependencies):  # noqa: E501,F811
    """異常系: DynamoDBがエラーをスローした場合の返却値が想定通り"""
    mock_table = mock_dependencies
    mock_table.query = MagicMock(
        side_effect=ClientError(
            error_response={
                "Error": {
                    "Code": "ProvisionedThroughputExceededException",
                    "Message": "Rate exceeded",
                }
            },
            operation_name="Query",
        )
    )

    response = client.get(f"/content/year={mock_year}")

    # 検証
    assert response.status_code == 500  # 内部サーバーエラー
    assert response.json()["detail"] == "An error occurred (ProvisionedThroughputExceededException) when calling the Query operation: Rate exceeded"  # noqa: E501


# 異常系テスト: クエリ結果が空の場合
@pytest.mark.asyncio
async def test_get_year_contents_no_data(mock_dependencies):  # noqa: F811
    """異常系: 指定された年のコンテンツが存在しない場合"""
    mock_table = mock_dependencies
    mock_table.query = MagicMock(return_value={"Items": []})

    response = client.get(f"/content/year={mock_year}")

    # 検証
    assert response.status_code == 200
    assert response.json() == []  # 空のリストが返ることを確認


# 異常系テスト: 無効なパラメータ
@pytest.mark.asyncio
async def test_get_year_contents_invalid_year(mock_dependencies):  # noqa: F811
    """異常系: 年のパラメータが無効な場合"""
    response = client.get("/content/year=invalid")

    # 検証
    assert response.status_code == 422  # バリデーションエラー
