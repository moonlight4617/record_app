# ベースイメージ
FROM node:18-alpine

# 作業ディレクトリを作成
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションファイルをコピー
COPY . .

# 開発サーバーを起動
CMD ["npm", "run", "dev"]
