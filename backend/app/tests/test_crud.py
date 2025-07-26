from unittest.mock import patch

from app.crud.user_curd import save_user


class TestUserCrud:
    @patch("app.crud.user_curd.user_table")
    def test_save_user_success(self, mock_user_table):
        # テストデータ (tuple format as expected by the function)
        user = ("test_user_id", "test@example.com", "Test User")

        # モック設定
        mock_user_table.put_item.return_value = {
            "ResponseMetadata": {"HTTPStatusCode": 200}
        }

        # テスト実行
        save_user(user)

        # アサーション
        mock_user_table.put_item.assert_called_once_with(
            Item={
                "userId": "test_user_id",
                "email": "test@example.com",
                "name": "Test User",
            }
        )

    @patch("app.crud.user_curd.user_table")
    @patch("builtins.print")
    def test_save_user_exception(self, mock_print, mock_user_table):
        # テストデータ
        user = ("test_user_id", "test@example.com", "Test User")

        # DynamoDB例外を模擬
        mock_user_table.put_item.side_effect = Exception("DynamoDB error")

        # テスト実行（例外は内部でキャッチされる）
        save_user(user)

        # エラーログが出力されることを確認
        mock_print.assert_called()
