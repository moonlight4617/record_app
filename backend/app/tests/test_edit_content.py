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
    title="Updated Title",
    type="movie",
    date="2024-12-01",
    notes="Updated note",
    link="https://updated-example.com"
)

# DI のための依存関数をモック化
async def mock_get_content_table_and_user_id():
    return DependsData(table=mock_table, user_id=mock_user_id)

# 依存関係をオーバーライド
app.dependency_overrides[get_content_table_and_user_id] = mock_get_content_table_and_user_id

client = TestClient(app)

@pytest.mark.asyncio
async def test_edit_content():
    """正常系: 想定通りにDB更新され、返却値が想定通りなことを確認"""
    # Mock の update_item メソッドを設定
    mock_table.update_item = MagicMock(return_value={
        "Attributes": {
            "contentId": mock_content.contentId,
            "userId": mock_user_id,
            "type": mock_content.type,
            "title": mock_content.title,
            "date": mock_content.date,
            "year": 2024,  # yearはバックエンドで計算される
            "notes": mock_content.notes,
            "link": mock_content.link,
        }
    })

    # API 呼び出し
    response = client.post(
        "/content/edit",
        json=mock_content.dict()
    )

    # 検証
    assert response.status_code == 200
    # モック設定した固定値がちゃんと帰ってきているか確認
    assert response.json() == {
        "contentId": mock_content.contentId,
        "userId": mock_user_id,
        "type": mock_content.type,
        "title": mock_content.title,
        "date": mock_content.date,
        "year": 2024,
        "notes": mock_content.notes,
        "link": mock_content.link,
    }

    # DynamoDB テーブルに正しいデータが渡されたか確認
    mock_table.update_item.assert_called_once_with(
        Key={
            "contentId": mock_content.contentId,
            "userId": mock_user_id,
        },
        UpdateExpression="SET #ty = :ty, #ti = :ti, #d = :d, #y = :y, #n = :n, #l = :l",
        ConditionExpression="attribute_exists(userId) AND attribute_exists(contentId)",
        ExpressionAttributeNames={
            "#ty": "type",
            "#ti": "title",
            "#d": "date",
            "#y": "year",
            "#n": "notes",
            "#l": "link"
        },
        ExpressionAttributeValues={
            ":ty": mock_content.type,
            ":ti": mock_content.title,
            ":d": mock_content.date,
            ":y": 2024,  # バックエンドで計算された year を使用
            ":n": mock_content.notes,
            ":l": mock_content.link,
        },
        ReturnValues="ALL_NEW",
    )

@pytest.mark.asyncio
async def test_content_edit_invalid_content_id():
    """異常系: 更新対象のcontentIdが存在しない場合の返却値が想定通りであることを確認"""
    mock_table.update_item = MagicMock(side_effect=ClientError(
        error_response={
            "Error": {
                "Code": "ConditionalCheckFailedException",
                "Message": "The conditional request failed"
            }
        },
        operation_name="UpdateItem"
    ))

    response = client.post("/content/edit", json=mock_content.dict())
    assert response.status_code == 500  # サーバーエラー
    assert response.json()["detail"] == "An error occurred (ConditionalCheckFailedException) when calling the UpdateItem operation: The conditional request failed"

@pytest.mark.asyncio
async def test_content_edit_missing_fields():
    """異常系: 必須フィールドが不足している場合の返却値が想定通りであることを確認"""
    invalid_content = {
        "contentId": "test_id",  # 他の必須フィールドが不足
    }
    response = client.post("/content/edit", json=invalid_content)
    assert response.status_code == 422  # バリデーションエラー

@pytest.mark.asyncio
async def test_content_edit_dynamodb_error():
    """異常系: DynamoDBがエラーをスローした場合の返却値が想定通りであることを確認"""
    mock_table.update_item = MagicMock(side_effect=ClientError(
        error_response={
            "Error": {
                "Code": "ProvisionedThroughputExceededException",
                "Message": "Rate exceeded"
            }
        },
        operation_name="UpdateItem"
    ))

    response = client.post("/content/edit", json=mock_content.dict())
    assert response.status_code == 500  # サーバーエラー
    assert response.json()["detail"] == "An error occurred (ProvisionedThroughputExceededException) when calling the UpdateItem operation: Rate exceeded"