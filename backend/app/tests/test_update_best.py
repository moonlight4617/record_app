from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app
from app.schemas.content import ContentData
from boto3.dynamodb.conditions import Key, Attr
from app.tests.conftest import mock_dependencies, mock_user_id  # noqa: F401

# テスト用クライアント
client = TestClient(app)

# モックのデータ
mock_contents = [
    ContentData(
        contentId="content-1",
        title="Updated Title",
        type="movie",
        date="2024-12-01",
        userId=mock_user_id,
        year=2024,
        rank=1,
        notes="Updated note",
        link="https://updated-example.com",
    ),
    ContentData(
        contentId="content-2",
        title="Updated Title 2",
        type="book",
        date="2024-06-01",
        userId=mock_user_id,
        year=2024,
        rank=2,
        notes="Updated note 2",
        link="https://updated-example.com",
    ),
]


# 正常系のテスト
def test_update_best_success(mock_dependencies):  # noqa: F811
    """正常系: 更新できることを確認"""
    # モックの動作を設定
    mock_table = mock_dependencies
    mock_table.query.return_value = {
        "Items": [
            {"contentId": "content-3", "userId": mock_user_id, "rank": 1}
        ]
    }
    mock_table.update_item = MagicMock()

    # エンドポイントを呼び出し
    response = client.post(
        "/content/update-best",
        json=[content.dict() for content in mock_contents],
    )

    # アサーション
    assert response.status_code == 200
    assert response.json() == {"message": "Best Content update successfully"}

    # 実際の KeyConditionExpression, FilterExpression を作成
    expected_key_condition = Key("userId").eq(mock_user_id)
    expected_filter_expression = Attr("year").eq(2024)

    # モックが呼ばれたか検証
    mock_table.query.assert_called_once_with(
        IndexName="RankIndex",
        KeyConditionExpression=expected_key_condition,
        FilterExpression=expected_filter_expression,
    )
    assert mock_table.update_item.call_count == 3  # 削除用1回 + 更新用2回


def test_update_best_failure_empty_body(mock_dependencies):  # noqa: F811
    # エンドポイントを呼び出し
    response = client.post("/content/update-best", json=[])

    # アサーション
    assert response.status_code == 500
    assert (
        response.json()["detail"] == "list index out of range"
    )  # サーバー側で空リストにアクセス


def test_update_best_failure_year_none(mock_dependencies):  # noqa: F811
    # リクエストデータ（year が None）
    invalid_contents = [
        ContentData(
            contentId="content-1",
            title="Updated Title",
            type="movie",
            date="2024-12-01",
            userId=mock_user_id,
            year=None,
            rank=1,
            notes="Updated note",
            link="https://updated-example.com",
        ),
    ]

    # エンドポイントを呼び出し
    response = client.post(
        "/content/update-best",
        json=[content.dict() for content in invalid_contents],
    )

    # アサーション
    assert response.status_code == 500
    assert (
        "No active exception to reraise" in response.json()["detail"]
    )  # 指定なしraiseが発生していることを確認
