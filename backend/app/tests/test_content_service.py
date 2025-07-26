import json
from unittest.mock import Mock, patch
import pytest

from app.services.content_service import (
    create_content_service,
    edit_content_service,
    update_best_service,
    get_years_service,
    get_year_contents_service,
    add_watchlist_service,
    get_watchlist_service,
    delete_watchlist_service,
    get_recent_contents_service,
    search_movie_links_tmdb,
    search_book_links_google,
    verify_book_exists,
    search_external_api_links,
    generate_recommendations_bedrock,
    extract_tool_use_args,
)
from app.schemas.content import RegisterContentData, ContentData, watchlistData


class TestCreateContentService:
    @patch("app.services.content_service.add_content")
    @patch("app.services.content_service.extract_year_from_date")
    async def test_create_content_service(
        self, mock_extract_year, mock_add_content
    ):
        # テストデータ
        content_data = RegisterContentData(
            contentId="test_content_id",
            title="Test Movie",
            type="movie",
            date="2023-01-01",
        )
        user_id = "test_user"
        table = Mock()

        mock_extract_year.return_value = 2023

        # テスト実行
        await create_content_service(content_data, user_id, table)

        # アサーション
        assert content_data.year == 2023
        assert content_data.userId == user_id
        assert content_data.type_date == "movie#2023-01-01"
        mock_add_content.assert_called_once_with(content_data, table)


class TestEditContentService:
    @patch("app.services.content_service.update_content")
    @patch("app.services.content_service.extract_year_from_date")
    async def test_edit_content_service(
        self, mock_extract_year, mock_update_content
    ):
        # テストデータ
        content_data = RegisterContentData(
            contentId="test_content_id",
            title="Test Movie Updated",
            type="movie",
            date="2023-01-01",
        )
        user_id = "test_user"
        table = Mock()

        mock_extract_year.return_value = 2023
        mock_update_content.return_value = {"status": "updated"}

        # テスト実行
        result = await edit_content_service(content_data, user_id, table)

        # アサーション
        assert content_data.year == 2023
        assert content_data.userId == user_id
        assert result == {"status": "updated"}
        mock_update_content.assert_called_once_with(content_data, table)


class TestUpdateBestService:
    @patch("app.services.content_service.update_best")
    @patch("app.services.content_service.delete_best")
    @patch("app.services.content_service.get_year_best")
    async def test_update_best_service_success(
        self, mock_get_year_best, mock_delete_best, mock_update_best
    ):
        # テストデータ
        contents = [
            ContentData(
                contentId="test_content_id",
                userId="test_user",
                year=2023,
                title="Test Movie",
                type="movie",
                date="2023-01-01",
            )
        ]
        user_id = "test_user"
        table = Mock()

        mock_get_year_best.return_value = [{"contentId": "old_best"}]

        # テスト実行
        await update_best_service(contents, user_id, table)

        # アサーション
        mock_get_year_best.assert_called_once_with(user_id, 2023, table)
        mock_delete_best.assert_called_once_with(
            [{"contentId": "old_best"}], table
        )
        mock_update_best.assert_called_once_with(contents, table)

    async def test_update_best_service_invalid_user(self):
        # テストデータ
        contents = [
            ContentData(
                contentId="test_content_id",
                userId="wrong_user",
                year=2023,
                title="Test Movie",
                type="movie",
                date="2023-01-01",
            )
        ]
        user_id = "test_user"
        table = Mock()

        # テスト実行とアサーション
        with pytest.raises(Exception):
            await update_best_service(contents, user_id, table)


class TestGetYearsService:
    @patch("app.services.content_service.get_years")
    async def test_get_years_service(self, mock_get_years):
        user_id = "test_user"
        table = Mock()
        mock_get_years.return_value = [2023, 2022]

        # テスト実行
        result = await get_years_service(user_id, table)

        # アサーション
        assert result == [2023, 2022]
        mock_get_years.assert_called_once_with(user_id, table)


class TestGetYearContentsService:
    @patch("app.services.content_service.get_year_contents")
    def test_get_year_contents_service(self, mock_get_year_contents):
        user_id = "test_user"
        table = Mock()
        year = 2023
        mock_get_year_contents.return_value = [{"title": "Test Movie"}]

        # テスト実行
        result = get_year_contents_service(user_id, table, year)

        # アサーション
        assert result == [{"title": "Test Movie"}]
        mock_get_year_contents.assert_called_once_with(user_id, table, year)


class TestWatchlistServices:
    @patch("app.services.content_service.add_watchlist")
    async def test_add_watchlist_service(self, mock_add_watchlist):
        # テストデータ
        content = watchlistData(
            contentId="test_content_id",
            title="Test Movie",
            type="movie",
            status="pending",
        )
        user_id = "test_user"
        table = Mock()

        # テスト実行
        await add_watchlist_service(content, user_id, table)

        # アサーション
        assert content.userId == user_id
        mock_add_watchlist.assert_called_once_with(content, table)

    @patch("app.services.content_service.get_watchlist_contents")
    def test_get_watchlist_service(self, mock_get_watchlist):
        user_id = "test_user"
        table = Mock()
        mock_get_watchlist.return_value = [{"title": "Test Movie"}]

        # テスト実行
        result = get_watchlist_service(user_id, table)

        # アサーション
        assert result == [{"title": "Test Movie"}]
        mock_get_watchlist.assert_called_once_with(user_id, table)

    @patch("app.services.content_service.delete_watchlist_contents")
    async def test_delete_watchlist_service_success(
        self, mock_delete_watchlist
    ):
        # テストデータ
        content = watchlistData(
            userId="test_user",
            contentId="test_content_id",
            title="Test Movie",
            type="movie",
            status="pending",
        )
        user_id = "test_user"
        table = Mock()

        mock_delete_watchlist.return_value = [{"deleted": "success"}]

        # テスト実行
        result = await delete_watchlist_service(user_id, table, content)

        # アサーション
        assert result == [{"deleted": "success"}]
        mock_delete_watchlist.assert_called_once_with(
            user_id, table, "test_content_id"
        )

    async def test_delete_watchlist_service_invalid_user(self):
        # テストデータ
        content = watchlistData(
            userId="wrong_user",
            contentId="test_content_id",
            title="Test Movie",
            type="movie",
            status="pending",
        )
        user_id = "test_user"
        table = Mock()

        # テスト実行とアサーション
        with pytest.raises(Exception):
            await delete_watchlist_service(user_id, table, content)


class TestGetRecentContentsService:
    @patch("app.services.content_service.get_recent_contents")
    def test_get_recent_contents_service(self, mock_get_recent):
        user_id = "test_user"
        table = Mock()
        content_type = "movie"
        mock_get_recent.return_value = [{"title": "Recent Movie"}]

        # テスト実行
        result = get_recent_contents_service(user_id, table, content_type)

        # アサーション
        assert result == [{"title": "Recent Movie"}]
        mock_get_recent.assert_called_once_with(user_id, table, content_type)


class TestSearchMovieLinksTmdb:
    @patch.dict("os.environ", {"TMDB_API_KEY": "test_api_key"})
    @patch("app.services.content_service.requests.get")
    def test_search_movie_links_tmdb_success(self, mock_get):
        # モックレスポンス
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "results": [{"id": 12345, "title": "Test Movie"}]
        }
        mock_get.return_value = mock_response

        # テスト実行
        result = search_movie_links_tmdb("Test Movie")

        # アサーション
        assert len(result) == 2
        assert result[0]["site_name"] == "The Movie Database"
        assert "12345" in result[0]["url"]
        assert result[1]["site_name"] == "Amazon Prime Video"

    @patch.dict("os.environ", {}, clear=True)
    def test_search_movie_links_tmdb_no_api_key(self):
        # テスト実行
        result = search_movie_links_tmdb("Test Movie")

        # アサーション
        assert result == []

    @patch.dict("os.environ", {"TMDB_API_KEY": "test_api_key"})
    @patch("app.services.content_service.requests.get")
    def test_search_movie_links_tmdb_api_error(self, mock_get):
        # APIエラーを模擬
        mock_response = Mock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response

        # テスト実行
        result = search_movie_links_tmdb("Test Movie")

        # アサーション
        assert result == []


class TestSearchBookLinksGoogle:
    @patch("app.services.content_service.requests.get")
    def test_search_book_links_google_success(self, mock_get):
        # モックレスポンス
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "items": [{"id": "book123", "volumeInfo": {"title": "Test Book"}}]
        }
        mock_get.return_value = mock_response

        # テスト実行
        result = search_book_links_google("Test Book")

        # アサーション
        assert len(result) == 3
        assert result[0]["site_name"] == "Google Books"
        assert "book123" in result[0]["url"]
        assert result[1]["site_name"] == "Amazon"
        assert result[2]["site_name"] == "楽天ブックス"

    @patch("app.services.content_service.requests.get")
    def test_search_book_links_google_no_results(self, mock_get):
        # 結果なしのレスポンス
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"items": []}
        mock_get.return_value = mock_response

        # テスト実行
        result = search_book_links_google("Nonexistent Book")

        # アサーション
        assert result == []


class TestVerifyBookExists:
    @patch("app.services.content_service.requests.get")
    def test_verify_book_exists_true(self, mock_get):
        # モックレスポンス
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "items": [{"volumeInfo": {"title": "Test Book Title"}}]
        }
        mock_get.return_value = mock_response

        # テスト実行
        result = verify_book_exists("Test Book")

        # アサーション
        assert result is True

    @patch("app.services.content_service.requests.get")
    def test_verify_book_exists_false(self, mock_get):
        # 結果なしのレスポンス
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"items": []}
        mock_get.return_value = mock_response

        # テスト実行
        result = verify_book_exists("Nonexistent Book")

        # アサーション
        assert result is False


class TestSearchExternalApiLinks:
    @patch("app.services.content_service.search_movie_links_tmdb")
    def test_search_external_api_links_movie(self, mock_search_movie):
        mock_search_movie.return_value = [{"site_name": "TMDB"}]

        # テスト実行
        result = search_external_api_links("Test Movie", "movie")

        # アサーション
        assert result == [{"site_name": "TMDB"}]
        mock_search_movie.assert_called_once_with("Test Movie")

    @patch("app.services.content_service.search_book_links_google")
    def test_search_external_api_links_book(self, mock_search_book):
        mock_search_book.return_value = [{"site_name": "Google Books"}]

        # テスト実行
        result = search_external_api_links("Test Book", "book")

        # アサーション
        assert result == [{"site_name": "Google Books"}]
        mock_search_book.assert_called_once_with("Test Book")

    def test_search_external_api_links_unknown_type(self):
        # テスト実行
        result = search_external_api_links("Test Content", "unknown")

        # アサーション
        assert result == []


class TestExtractToolUseArgs:
    def test_extract_tool_use_args_success(self):
        content = [
            {"text": "Some text"},
            {"toolUse": {"input": {"recommendations": ["test"]}}},
        ]

        # テスト実行
        result = extract_tool_use_args(content)

        # アサーション
        assert result == {"recommendations": ["test"]}

    def test_extract_tool_use_args_no_tool_use(self):
        content = [{"text": "Some text"}]

        # テスト実行
        result = extract_tool_use_args(content)

        # アサーション
        assert result is None


class TestGenerateRecommendationsBedrock:
    @patch("app.services.content_service.boto3.client")
    @patch("app.services.content_service.search_external_api_links")
    @patch("app.services.content_service.verify_book_exists")
    @patch("app.services.content_service.extract_tool_use_args")
    def test_generate_recommendations_bedrock_success(
        self, mock_extract, mock_verify, mock_search, mock_boto3
    ):
        # モック設定
        mock_client = Mock()
        mock_boto3.return_value = mock_client

        mock_response = {
            "output": {
                "message": {
                    "content": [
                        {
                            "toolUse": {
                                "input": {
                                    "recommendations": [
                                        {
                                            "title": "Test Movie",
                                            "desc": "Great movie",
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            }
        }
        mock_client.converse.return_value = mock_response

        mock_extract.return_value = {
            "recommendations": [{"title": "Test Movie", "desc": "Great movie"}]
        }
        mock_search.return_value = [{"site_name": "TMDB", "url": "test_url"}]

        # テスト実行
        result = generate_recommendations_bedrock(
            "movie", ["Movie 1", "Movie 2"]
        )

        # アサーション
        assert "recommendations" in result
        recommendations = json.loads(result)
        assert len(recommendations["recommendations"]) == 1
        assert recommendations["recommendations"][0]["title"] == "Test Movie"
        assert "links" in recommendations["recommendations"][0]

    @patch("app.services.content_service.boto3.client")
    def test_generate_recommendations_bedrock_exception(self, mock_boto3):
        # 例外を発生させる
        mock_boto3.side_effect = Exception("Bedrock error")

        # テスト実行とアサーション
        with pytest.raises(Exception):
            generate_recommendations_bedrock("movie", ["Movie 1"])
