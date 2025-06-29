from boto3.dynamodb.conditions import Key
from fastapi.testclient import TestClient

from app.main import app
from app.tests.conftest import mock_dependencies  # noqa: F401

# テスト用のクライアント
client = TestClient(app)


# 正常系のテスト
def test_get_years_success(mock_dependencies):  # noqa: F811
    """正常系: DBに存在する年度を取得を重複を除いて取得できることを確認"""
    # モックの戻り値を設定
    mock_table = mock_dependencies
    mock_table.query.return_value = {
        "Items": [
            {"year": "2023"},
            {"year": "2022"},
            {"year": "2023"},
            {"year": "2021"},
        ]
    }

    # エンドポイントを呼び出し
    response = client.get("/content/years")

    # アサーション
    assert response.status_code == 200
    assert response.json() == [
        "2023",
        "2022",
        "2021",
    ]  # 重複が排除されていることを確認

    # 実際の KeyConditionExpression を作成
    expected_key_condition = Key("userId").eq("test_user")

    # モックが正しく呼ばれているか確認
    mock_table.query.assert_called_once_with(
        IndexName="YearIndex",
        KeyConditionExpression=expected_key_condition,
        ProjectionExpression="#yr",
        ExpressionAttributeNames={"#yr": "year"},
    )


# 異常系のテスト
def test_get_years_failure(mock_dependencies):  # noqa: F811
    """異常系: DynamoDBがエラーをスローした場合の返却値が想定通りなことを確認"""
    # モックの戻り値として例外を発生させる
    mock_table = mock_dependencies
    mock_table.query.side_effect = Exception("Mocked exception")

    # エンドポイントを呼び出し
    response = client.get("/content/years")

    # アサーション
    assert response.status_code == 500
    assert response.json() == {"detail": "Mocked exception"}
