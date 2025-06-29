from unittest.mock import MagicMock

import pytest

from app.main import app
from app.schemas.content import DependsData
from app.services.depends_service import get_content_table_and_user_id

# モック用データ
mock_user_id = "test_user"


# テスト用の依存関係をオーバーライドするための fixture
@pytest.fixture
def mock_dependencies():
    mock_table = MagicMock()

    async def mock_get_content_table_and_user_id():
        return DependsData(table=mock_table, user_id=mock_user_id)

    # 依存関係をオーバーライド
    app.dependency_overrides[get_content_table_and_user_id] = (
        mock_get_content_table_and_user_id
    )

    yield mock_table  # モックしたテーブルを返却

    # 後始末 (必要なら依存関係をリセット)
    app.dependency_overrides = {}
