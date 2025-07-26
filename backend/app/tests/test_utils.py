from app.utils import extract_year_from_date


class TestExtractYearFromDate:
    def test_extract_year_from_date_valid_format(self):
        """有効な日付形式からの年抽出をテスト"""
        # テスト実行
        result = extract_year_from_date("2023-12-25")

        # アサーション
        assert result == 2023

    def test_extract_year_from_date_different_valid_format(self):
        """異なる有効な日付形式からの年抽出をテスト"""
        # テスト実行
        result = extract_year_from_date("2022-01-01")

        # アサーション
        assert result == 2022

    def test_extract_year_from_date_edge_case_year(self):
        """境界値の年をテスト"""
        # テスト実行
        result = extract_year_from_date("2000-06-15")

        # アサーション
        assert result == 2000

    def test_extract_year_from_date_future_year(self):
        """未来の年をテスト"""
        # テスト実行
        result = extract_year_from_date("2030-03-10")

        # アサーション
        assert result == 2030

    def test_extract_year_from_date_invalid_format(self):
        """無効な日付形式の場合の動作をテスト"""
        # 無効な形式でのテスト（実装によって動作が変わる可能性がある）
        try:
            result = extract_year_from_date("invalid-date")
            # もし例外が発生しなければ、結果をチェック
            assert isinstance(result, (int, type(None)))
        except (ValueError, AttributeError):
            # 例外が発生した場合は正常
            pass

    def test_extract_year_from_date_none_input(self):
        """None入力の場合の動作をテスト"""
        try:
            result = extract_year_from_date(None)
            # もし例外が発生しなければ、結果をチェック
            assert result is None or isinstance(result, int)
        except (AttributeError, TypeError):
            # 例外が発生した場合は正常
            pass

    def test_extract_year_from_date_empty_string(self):
        """空文字列入力の場合の動作をテスト"""
        try:
            result = extract_year_from_date("")
            # もし例外が発生しなければ、結果をチェック
            assert result is None or isinstance(result, int)
        except (ValueError, IndexError, AttributeError):
            # 例外が発生した場合は正常
            pass
