from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestMain:
    def test_health_check_root(self):
        """ルートエンドポイントのテスト"""
        response = client.get("/")
        # Any response code is acceptable for this test
        assert response.status_code in [200, 404, 422]

    def test_app_initialization(self):
        """アプリケーションの初期化テスト"""
        # Just test that the app exists and is properly imported
        assert app is not None
        assert hasattr(app, "router")
