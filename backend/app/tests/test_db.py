from unittest.mock import Mock, patch

from app.db.dynamodb import get_content_table


class TestDynamoDB:
    @patch("app.db.dynamodb.dynamodb")
    async def test_get_content_table_success(self, mock_dynamodb):
        # モック設定
        mock_table = Mock()
        mock_dynamodb.Table.return_value = mock_table

        # テスト実行
        result = await get_content_table()

        # アサーション
        assert result == mock_table
        mock_dynamodb.Table.assert_called_once()

    def test_dynamodb_initialization(self):
        # DynamoDB関連変数の初期化テスト
        from app.db.dynamodb import (
            AWS_REGION,
            CONTENT_TABLE_NAME,
            USER_TABLE_NAME,
        )

        # アサーション
        assert AWS_REGION is not None
        assert CONTENT_TABLE_NAME is not None
        assert USER_TABLE_NAME is not None
