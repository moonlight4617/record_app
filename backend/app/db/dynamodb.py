import boto3
import os
from typing import Any

# 環境変数からリージョンとテーブル名を取得
AWS_REGION = os.getenv("AWS_REGION", "ap-northeast-1")
CONTENT_TABLE_NAME = os.getenv("DYNAMODB_CONTENT_TABLE_NAME", "ContentTable")
USER_TABLE_NAME = os.getenv("DYNAMODB_USER_TABLE_NAME", "USER")

# DynamoDBリソースを初期化
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)

# テーブルインスタンスを取得
content_table = dynamodb.Table(CONTENT_TABLE_NAME)
user_table = dynamodb.Table(USER_TABLE_NAME)

async def get_content_table() -> Any:
  return dynamodb.Table(CONTENT_TABLE_NAME)

# try:
#     table.load()
#     print("DynamoDB table loaded successfully.")
# except Exception as e:
#     print(f"Error loading DynamoDB table: {e}")
