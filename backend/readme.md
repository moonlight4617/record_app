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

## リンター、フォーマッター
- flake8
- black
- autoflake
- isort

### フォーマットコマンド
- autoflake --in-place --remove-all-unused-imports --recursive <該当ディレクトリ> // ディレクトリ配下のファイルの未使用インポートを削除
- black --line-length 79 <該当ファイル> // 79文字までで改行

## デプロイメモ
### layer zip化
mkdir -p layer/python
pip install -r requirements.txt -t layer/python
cd layer
zip -r ../layer_package.zip .
※デプロイ時にエラーとなった際に、開発環境との差異をなくす為にlayerディレクトリを作成し、そこでlayerのzip化を行った。
そちらの実施方法はlayer配下のread.me参照

### function zip化
zip -r lambda_function.zip app/ -x "app/tests/*" "app/__pycache__/*" "app/*.pyc" "app/*.pyo" "app/.pytest_cache/*"
