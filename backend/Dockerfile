# Pythonベースのイメージを使用
FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /code

# 依存関係をコピー
COPY ./requirements.txt /code/requirements.txt
COPY ./requirements-dev.txt /code/requirements-dev.txt

# 依存関係のインストール
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /code/requirements.txt && \
    pip install --no-cache-dir -r /code/requirements-dev.txt && \
    apt update && apt install -y zip

# アプリケーションコードをコピー
COPY ./app /code/app

# ポート番号（FastAPIのデフォルトポート）
EXPOSE 8000

# FastAPIアプリケーションを起動（開発サーバーとして）
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
