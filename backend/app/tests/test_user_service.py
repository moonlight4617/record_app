from unittest.mock import Mock, patch
import pytest
from fastapi import HTTPException, Request

from app.services.user_service import (
    get_sub_from_id_token,
    create_user_service,
    get_user_id,
    COGNITO_APP_CLIENT_ID,
)
from app.schemas.user import User


class TestGetSubFromIdToken:
    @patch("app.services.user_service.PyJWKClient")
    @patch("app.services.user_service.jwt.decode")
    def test_get_sub_from_id_token_success(
        self, mock_jwt_decode, mock_jwk_client
    ):
        # モックの設定
        mock_signing_key = Mock()
        mock_signing_key.key = "mock_key"
        mock_jwk_client.return_value.get_signing_key_from_jwt.return_value = (
            mock_signing_key
        )

        mock_payload = {
            "sub": "test_user_id",
            "email": "test@example.com",
            "cognito:username": "testuser",
        }
        mock_jwt_decode.return_value = mock_payload

        # テスト実行
        result = get_sub_from_id_token("test_token")

        # アサーション
        assert result == ("test_user_id", "test@example.com", "testuser")
        mock_jwk_client.assert_called_once()
        mock_jwt_decode.assert_called_once_with(
            "test_token",
            "mock_key",
            algorithms=["RS256"],
            audience=COGNITO_APP_CLIENT_ID,
            leeway=60,
        )

    @patch("app.services.user_service.PyJWKClient")
    def test_get_sub_from_id_token_exception(self, mock_jwk_client):
        # 例外を発生させる
        mock_jwk_client.side_effect = Exception("JWT error")

        # テスト実行
        result = get_sub_from_id_token("invalid_token")

        # アサーション
        assert result is None


class TestCreateUserService:
    @patch("app.services.user_service.save_user")
    async def test_create_user_service(self, mock_save_user):
        # テストデータ
        user = User(
            user_id="test_user_id", email="test@example.com", name="Test User"
        )

        # テスト実行
        await create_user_service(user)

        # アサーション
        mock_save_user.assert_called_once_with(user)


class TestGetUserId:
    async def test_get_user_id_from_cookies_success(self):
        # モックリクエスト
        mock_request = Mock(spec=Request)
        mock_request.cookies = {
            "id_token": "test_token",
            "user_id": "test_user_id",
        }

        # テスト実行
        result = await get_user_id(mock_request)

        # アサーション
        assert result == "test_user_id"

    async def test_get_user_id_missing_id_token_raises_exception(self):
        # モックリクエスト
        mock_request = Mock(spec=Request)
        mock_request.cookies = {}
        mock_request.headers = {}

        # テスト実行とアサーション
        with pytest.raises(HTTPException) as exc_info:
            await get_user_id(mock_request)

        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Unauthorized"
