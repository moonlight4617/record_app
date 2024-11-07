import boto3
import os

# 環境変数からリージョンとテーブル名を取得
AWS_REGION = os.getenv("AWS_REGION", "ap-northeast-1")
TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "ContentTable")

# DynamoDBリソースを初期化
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)

# テーブルインスタンスを取得
table = dynamodb.Table(TABLE_NAME)

try:
    table.load()
    print("DynamoDB table loaded successfully.")
except Exception as e:
    print(f"Error loading DynamoDB table: {e}")
