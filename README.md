# record_app

## ローカルでaws認証読み込んでのdocker立ち上げコマンド
docker compose -f docker-compose.yml -f docker-compose.local.yml up
*ローカル環境ではエイリアス設定を入れてあるので下記コマンドで実行可能
docker-local up

## layer zip化
mkdir -p layer/python
pip install -r requirements.txt -t layer/python
cd layer
zip -r ../layer_package.zip .

## function zip化
zip -r lambda_function.zip app/ -x "app/tests/*" "app/__pycache__/*" "app/*.pyc" "app/*.pyo" "app/.pytest_cache/*"

docker build -t lambda-layer .
docker create --name temp lambda-layer
docker cp temp:layer.zip .
docker rm temp