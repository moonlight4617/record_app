import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from app.main import app  # FastAPI アプリをインポート
from app.schemas.content import RegisterContentData
from app.services.depends_service import get_content_table_and_user_id
from app.services.content_service import create_content_service
from app.schemas.content import DependsData

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
