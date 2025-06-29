from unittest.mock import MagicMock

import pytest
from botocore.exceptions import ClientError
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.content import RegisterContentData, ContentType
from app.tests.conftest import mock_dependencies, mock_user_id  # noqa: F401

# モック用データ
mock_content = RegisterContentData(
    contentId="test_id",
    title="Test Title",
    type="movie",
    date="2024-11-10",
    notes="Test note",
    link="https://example.com",
)

client = TestClient(app)


@pytest.mark.asyncio
async def test_add_content(mock_dependencies):  # noqa: F811
    """正常系: 想定通りにDB登録され、返却値が想定通りなことを確認"""
    # mock_table.put_item = MagicMock()
    mock_table = mock_dependencies
    # mock_table.put_item = MagicMock()

    # API 呼び出し
    response = client.post("/content/add", json=mock_content.dict())

    # 検証
    assert response.status_code == 200
    assert response.json() == {"message": "Content added successfully"}

    # DynamoDB テーブルに正しいデータが渡されたか確認
    mock_content.userId = mock_user_id  # userIdはserviceで付与される
    mock_content.year = 2024  # yearはserviceで付与される
    
    # 期待される呼び出し内容
    expected_content = {
        'contentId': 'test_id',
        'type': ContentType.movie,  # ContentTypeのenumオブジェクト
        'title': 'Test Title',
        'date': '2024-11-10',
        'type_date': 'movie#2024-11-10',  # 自動生成される
        'year': 2024,
        'notes': 'Test note',
        'userId': mock_user_id,
        'link': 'https://example.com',
        'status': None,
    }
    
    mock_table.put_item.assert_called_once_with(Item=expected_content)


@pytest.mark.asyncio
async def test_content_add_missing_fields(mock_dependencies):  # noqa: F811
    """異常系: 必須フィールドが不足している場合、422エラーが発生"""
    # mock_table = mock_dependencies
    # mock_table.put_item = MagicMock()

    invalid_content = {"title": "Missing fields"}  # 必須フィールドが不足
    response = client.post("/content/add", json=invalid_content)
    assert response.status_code == 422  # バリデーションエラー


@pytest.mark.asyncio
async def test_content_add_dynamodb_error(mock_dependencies):  # noqa: F811
    """異常系: DynamoDBがエラーをスローした場合、想定している返却値であることを確認"""
    mock_table = mock_dependencies

    # mock_dependencies.put_item = MagicMock(side_effect=ClientError(
    #     error_response={
    #         "Error": {
    #             "Code": "InternalServerError",
    #             "Message": "An error occurred"
    #         }
    #     },
    #     operation_name="PutItem"
    # ))
    mock_table.put_item = MagicMock(
        side_effect=ClientError(
            error_response={
                "Error": {
                    "Code": "ProvisionedThroughputExceededException",
                    "Message": "Rate exceeded",
                }
            },
            operation_name="PutItem",
        )
    )

    response = client.post("/content/add", json=mock_content.dict())
    assert response.status_code == 500  # サーバーエラー
    assert (
        response.json()["detail"]
        == "An error occurred (ProvisionedThroughputExceededException) when calling the PutItem operation: Rate exceeded"  # noqa: E501
    )
