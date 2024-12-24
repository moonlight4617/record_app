## コマンド
pip install -r requirements.txt

## ディレクトリ構成
.<br>
├── app<br>
│   ├── __init__.py<br>
│   ├── main.py<br>
│   ├── utils.py<br>
│   └── crud<br> //DB操作
│   │   ├── content.py<br>
│   │   ├── user.py<br>
│   └── db<br> //テーブルインスタンス作成
│   │   ├── dynamodb.py<br>
│   └── schemas<br> //型定義
│   │   ├── content.py<br>
│   │   ├── user.py<br>
│   └── services<br> // サービスロジック
│   │   ├── content_service.py<br>
│   │   ├── user_service.py<br>
│   └── routers<br>
│   │   ├── __init__.py<br>
│   │   ├── 【各ルーティングファイル】<br>

## テスト戦略
- FastAPI公式ではpytestを推奨しているため、pytestを利用

### テスト対象
- 各エンドポイントのHTTPステータスコード
- リクエストとレスポンスのデータフォーマット
- ビジネスロジック（ユースケース）
- エラーハンドリング
