import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app
from app.schemas.content import RegisterContentData
from app.services.depends_service import get_content_table_and_user_id
from app.schemas.content import DependsData
from botocore.exceptions import ClientError

# テスト対象のテーブルとモックデータ
mock_table = MagicMock()
mock_user_id = "test_user"
mock_content = RegisterContentData(
    contentId="test_id",
    title="Test Title",
    type="movie",
    date="2024-11-10",
    notes="Test note",
    link="https://example.com"
)

# DI のための依存関数をモック化
async def mock_get_content_table_and_user_id():
    return DependsData(table = mock_table, user_id = mock_user_id)

# 依存関係をオーバーライド
app.dependency_overrides[get_content_table_and_user_id] = mock_get_content_table_and_user_id

client = TestClient(app)

@pytest.mark.asyncio
async def test_add_content():
    """正常系: 想定通りにDB登録され、返却値が想定通りなことを確認"""
    mock_table.put_item = MagicMock()

    # API 呼び出し
    response = client.post(
        "/content/add",
        json = mock_content.dict()
    )

    # 検証
    assert response.status_code == 200
    assert response.json() == {"message": "Content added successfully"}

    # DynamoDB テーブルに正しいデータが渡されたか確認
    mock_content.userId = mock_user_id  # userIdはserviceで付与される
    mock_content.year = 2024 # yearはserviceで付与される
    mock_table.put_item.assert_called_once_with(
        Item={
            **mock_content.dict()
        }
    )

@pytest.mark.asyncio
async def test_content_add_missing_fields():
    """異常系: 必須フィールドが不足している場合、422エラーが発生"""
    invalid_content = {
        "title": "Missing fields"  # 必須フィールドが不足
    }
    response = client.post("/content/add", json=invalid_content)
    assert response.status_code == 422  # バリデーションエラー

@pytest.mark.asyncio
async def test_content_add_dynamodb_error():
    """異常系: DynamoDBがエラーをスローした場合、想定している返却値であることを確認"""
    mock_table.put_item = MagicMock(side_effect=ClientError(
        error_response={
            "Error": {
                "Code": "ProvisionedThroughputExceededException",
                "Message": "Rate exceeded"
            }
        },
        operation_name="PutItem"
    ))

    response = client.post("/content/add", json=mock_content.dict())
    assert response.status_code == 500  # サーバーエラー
    assert response.json()["detail"] == "An error occurred (ProvisionedThroughputExceededException) when calling the PutItem operation: Rate exceeded"
