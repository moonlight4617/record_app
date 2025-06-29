#!/bin/bash

# Python自動フォーマッター実行スクリプト
echo "Python自動フォーマットを開始します..."

# 1. 未使用インポートと末尾空行を削除（W391対応）
echo "autoflakeを実行中..."
autoflake --in-place --remove-all-unused-imports --remove-unused-variables --recursive app/

# 2. PEP8準拠に修正（E302対応）
echo "autopep8を実行中..."
autopep8 --in-place --aggressive --aggressive --recursive app/

# 3. blackでコードフォーマット（E501対応）
echo "blackを実行中..."
black --line-length 79 app/

# 4. isortでインポート順序を整理
echo "isortを実行中..."
isort app/

echo "フォーマット完了！"
echo "flake8で確認してください: flake8 app/"
