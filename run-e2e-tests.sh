#!/bin/bash

# E2Eテスト実行スクリプト

echo "=== E2Eテスト開始 ==="

# プロジェクトルートに移動
cd "$(dirname "$0")"

# 既存のサービスが起動していることを確認
echo "既存のfrontendとbackendサービスを確認中..."
docker-compose ps

# サービスが起動するまで待機
echo "フロントエンドとバックエンドサービスの準備完了を待機中..."
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    # より安全な方法でサービスの状態をチェック
    frontend_ready=false
    backend_ready=false

    # Nginxプロキシ経由でフロントエンドの確認
    if command -v curl >/dev/null 2>&1; then
        if curl -f http://localhost/ >/dev/null 2>&1; then
            frontend_ready=true
        fi
    else
        # curlが使えない場合はwgetを試す
        if command -v wget >/dev/null 2>&1; then
            if wget -q --spider http://localhost 2>/dev/null; then
                frontend_ready=true
            fi
        else
            # どちらも使えない場合はdocker psで確認
            if docker-compose ps frontend | grep -q "Up"; then
                frontend_ready=true
            fi
        fi
    fi

    # Nginxプロキシ経由でバックエンドの確認
    if command -v curl >/dev/null 2>&1; then
        if curl -f http://localhost/api/health >/dev/null 2>&1; then
            backend_ready=true
        fi
    else
        if command -v wget >/dev/null 2>&1; then
            if wget -q --spider http://localhost/api/health 2>/dev/null; then
                backend_ready=true
            fi
        else
            if docker-compose ps backend | grep -q "Up"; then
                backend_ready=true
            fi
        fi
    fi

    if [ "$frontend_ready" = true ] && [ "$backend_ready" = true ]; then
        echo "サービスの準備が完了しました"
        break
    fi

    echo "サービス起動を待機中... ($counter/$timeout) [Frontend: $frontend_ready, Backend: $backend_ready]"
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    echo "エラー: サービスの起動に失敗しました"
    exit 1
fi

# 既存のサービスにE2E環境変数を設定して、E2Eテストを実行
echo "E2E環境でテストを実行中..."
docker-compose -f docker-compose.yml -f docker-compose.e2e.yml up e2e-tests --abort-on-container-exit

# 実行結果を確認
EXIT_CODE=$?

# E2Eテストコンテナのログを表示
if [ $EXIT_CODE -ne 0 ]; then
    echo "E2Eテストが失敗しました。コンテナログを確認中..."
    docker-compose -f docker-compose.e2e.yml logs e2e-tests
fi

# E2Eテストコンテナのみクリーンアップ
echo "E2Eテストコンテナをクリーンアップ中..."
docker rm -f e2e-tests 2>/dev/null || true

echo "=== E2Eテスト完了 ==="

# テスト結果レポートの場所を表示
if [ -d "e2e/playwright-report" ]; then
    echo "テストレポート: e2e/playwright-report/index.html"
    if [ $EXIT_CODE -ne 0 ]; then
        echo "テスト失敗の詳細は上記レポートファイルを確認してください"
    fi
fi

# テスト結果ファイルも表示
if [ -f "e2e/test-results/results.json" ]; then
    echo "テスト結果JSON: e2e/test-results/results.json"
fi

exit $EXIT_CODE
