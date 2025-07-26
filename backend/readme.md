## ディレクトリ構成

.<br>
├── app<br>
│ ├── **init**.py<br>
│ ├── main.py<br>
│ ├── utils.py<br>
│ └── crud //DB 操作<br>
│ │ ├── content.py<br>
│ │ ├── user.py<br>
│ └── db//テーブルインスタンス作成<br>
│ │ ├── dynamodb.py<br>
│ └── schemas //型定義<br>
│ │ ├── content.py<br>
│ │ ├── user.py<br>
│ └── services // サービスロジック<br>
│ │ ├── content_service.py<br>
│ │ ├── user_service.py<br>
│ └── routers<br>
│ │ ├── **init**.py<br>
│ │ ├── 【各ルーティングファイル】<br>

## テスト戦略

- FastAPI 公式では pytest を推奨しているため、pytest を利用

### テスト対象

- 各エンドポイントの HTTP ステータスコード
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
- black --line-length 79 <該当ファイル> // 79 文字までで改行

#### 単体テスト

- テスト実施（C0 出力、docker コンテナ内で実行することを前提）<br>
  pytest -v -cov=app/

- テスト実施（C1 出力、docker コンテナ内で実行することを前提）<br>
  pytest -v -cov=app/ --cov-branch

## デプロイメモ

### layer zip 化

mkdir -p layer/python<br>
pip install -r requirements.txt -t layer/python<br>
cd layer<br>
zip -r ../layer_package.zip .<br>
※デプロイ時にエラーとなった際に、開発環境との差異をなくす為に layer ディレクトリを作成し、そこで layer の zip 化を行った。<br>
そちらの実施方法は layer 配下の read.me 参照

### function zip 化

zip -r lambda*function.zip app/ -x "app/tests/*" "app/**pycache**/_" "app/_.pyc" "app/\_.pyo" "app/.pytest_cache/\*"
