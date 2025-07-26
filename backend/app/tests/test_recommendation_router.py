from unittest.mock import patch
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestGetRecommendation:
    def test_get_recommendation_success(self, mock_dependencies):
        with patch(
            "app.routers.get_recommendation.get_recent_contents_service"
        ) as mock_recent, patch(
            "app.routers.get_recommendation.generate_recommendations_bedrock"
        ) as mock_bedrock:

            # モック設定
            mock_recent.return_value = [
                {"title": "Movie 1", "type": "movie"},
                {"title": "Movie 2", "type": "movie"},
            ]
            mock_bedrock.return_value = (
                '{"recommendations": [{"title": "Recommended Movie", '
                '"desc": "Great movie"}]}'
            )

            # テスト実行
            response = client.get("/content/recommend?content_type=movie")

            # アサーション
            assert response.status_code == 200
            data = response.json()
            assert "recommendations" in data
            mock_recent.assert_called_once()
            mock_bedrock.assert_called_once()

    def test_get_recommendation_no_recent_contents(self, mock_dependencies):
        with patch(
            "app.routers.get_recommendation.get_recent_contents_service"
        ) as mock_recent:
            # 最近のコンテンツがない場合（IndexErrorが発生する）
            mock_recent.return_value = []

            # テスト実行
            response = client.get("/content/recommend?content_type=movie")

            # アサーション
            assert response.status_code == 500
            data = response.json()
            assert "detail" in data
            mock_recent.assert_called_once()

    def test_get_recommendation_error(self, mock_dependencies):
        with patch(
            "app.routers.get_recommendation.get_recent_contents_service"
        ) as mock_recent:
            mock_recent.side_effect = Exception("Database error")

            # テスト実行
            response = client.get("/content/recommend?content_type=movie")

            # アサーション
            assert response.status_code == 500
            data = response.json()
            assert "detail" in data

    def test_get_recommendation_bedrock_error(self, mock_dependencies):
        with patch(
            "app.routers.get_recommendation.get_recent_contents_service"
        ) as mock_recent, patch(
            "app.routers.get_recommendation.generate_recommendations_bedrock"
        ) as mock_bedrock:

            # モック設定
            mock_recent.return_value = [{"title": "Movie 1", "type": "movie"}]
            mock_bedrock.side_effect = Exception("Bedrock error")

            # テスト実行
            response = client.get("/content/recommend?content_type=movie")

            # アサーション
            assert response.status_code == 500
            data = response.json()
            assert "detail" in data

    def test_get_recommendation_insufficient_contents(self, mock_dependencies):
        with patch(
            "app.routers.get_recommendation.get_recent_contents_service"
        ) as mock_recent, patch(
            "app.routers.get_recommendation.generate_recommendations_bedrock"
        ) as mock_bedrock:
            # 5件未満のコンテンツでもBedrockが呼ばれる
            mock_recent.return_value = [
                {"title": "Movie 1", "type": "movie"},
                {"title": "Movie 2", "type": "movie"},
            ]
            mock_bedrock.return_value = '{"recommendations": []}'

            # テスト実行
            response = client.get("/content/recommend?content_type=movie")

            # アサーション
            assert response.status_code == 200
            data = response.json()
            assert "recommendations" in data
