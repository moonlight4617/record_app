from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestAddWatchlist:
    def test_add_watchlist_success(self, mock_dependencies):
        # テストデータ
        watchlist_data = {
            "contentId": "test_content_id",
            "title": "Test Movie",
            "type": "movie",
            "status": "pending",
        }

        with patch(
            "app.routers.add_watchlist.add_watchlist_service",
            new_callable=AsyncMock,
        ) as mock_service:
            # テスト実行
            response = client.post(
                "/content/addWatchlist", json=watchlist_data
            )

            # アサーション
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "WatchList added successfully"
            mock_service.assert_called_once()

    def test_add_watchlist_error(self, mock_dependencies):
        # テストデータ
        watchlist_data = {
            "contentId": "test_content_id",
            "title": "Test Movie",
            "type": "movie",
            "status": "pending",
        }

        with patch(
            "app.routers.add_watchlist.add_watchlist_service",
            new_callable=AsyncMock,
        ) as mock_service:
            mock_service.side_effect = Exception("Database error")

            # テスト実行
            response = client.post(
                "/content/addWatchlist", json=watchlist_data
            )

            # アサーション
            assert response.status_code == 500
            data = response.json()
            assert "detail" in data


class TestDeleteWatchlist:
    def test_delete_watchlist_success(self, mock_dependencies):
        # テストデータ
        watchlist_data = {
            "userId": "test_user",
            "contentId": "test_content_id",
            "title": "Test Movie",
            "type": "movie",
            "status": "pending",
        }

        with patch(
            "app.routers.delete_watchlist.delete_watchlist_service",
            new_callable=AsyncMock,
        ) as mock_service:
            mock_service.return_value = [{"deleted": "success"}]

            # テスト実行
            response = client.post(
                "/content/deleteWatchlist", json=watchlist_data
            )

            # アサーション
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Content added successfully"
            mock_service.assert_called_once()

    def test_delete_watchlist_error(self, mock_dependencies):
        # テストデータ
        watchlist_data = {
            "userId": "test_user",
            "contentId": "test_content_id",
            "title": "Test Movie",
            "type": "movie",
            "status": "pending",
        }

        with patch(
            "app.routers.delete_watchlist.delete_watchlist_service",
            new_callable=AsyncMock,
        ) as mock_service:
            mock_service.side_effect = Exception("Database error")

            # テスト実行
            response = client.post(
                "/content/deleteWatchlist", json=watchlist_data
            )

            # アサーション
            assert response.status_code == 500
            data = response.json()
            assert "detail" in data


class TestGetWatchlist:
    def test_get_watchlist_success(self, mock_dependencies):
        with patch(
            "app.routers.get_watchlist.get_watchlist_service"
        ) as mock_service:
            mock_service.return_value = [
                {
                    "contentId": "test_id",
                    "title": "Test Movie",
                    "type": "movie",
                    "status": "pending",
                }
            ]

            # テスト実行
            response = client.get("/content/watchlist")

            # アサーション
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["title"] == "Test Movie"
            mock_service.assert_called_once()

    def test_get_watchlist_error(self, mock_dependencies):
        with patch(
            "app.routers.get_watchlist.get_watchlist_service"
        ) as mock_service:
            mock_service.side_effect = Exception("Database error")

            # テスト実行
            response = client.get("/content/watchlist")

            # アサーション
            assert response.status_code == 500
            data = response.json()
            assert "detail" in data
