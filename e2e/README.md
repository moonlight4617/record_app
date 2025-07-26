# E2E テスト実行ガイド

このディレクトリには、アプリケーションの E2E テスト（End-to-End Testing）が含まれています。

## 🔧 環境設定

E2E テストを実行する前に、認証情報を環境変数ファイルに設定してください：

```bash
# e2eディレクトリに移動
cd e2e

# 環境変数ファイルをコピーして設定
cp .env.example .env

# 必要に応じて認証情報を編集
# E2E_TEST_EMAIL=your-test-email@example.com
# E2E_TEST_PASSWORD=your-test-password
```

## 🚀 推奨実行手順（Docker コンテナ使用）

最も簡単で確実な方法です：

```bash
# 1. プロジェクトルートに移動
cd /path/to/record_app

# 2. 基本サービス（frontend, backend）を起動
docker-compose up -d

# 3. E2E環境（Nginx + テストコンテナ）を追加起動
docker-compose -f docker-compose.yml -f docker-compose.e2e.yml up -d nginx

# 4. E2Eテストを実行
docker-compose -f docker-compose.yml -f docker-compose.e2e.yml up e2e-tests --abort-on-container-exit

# 5. テスト後のクリーンアップ（オプション）
docker-compose -f docker-compose.yml -f docker-compose.e2e.yml down nginx e2e-tests
```

## 🛠️ 簡単実行スクリプト

プロジェクトルートの専用スクリプトを使用（推奨）：

```bash
./run-e2e-tests.sh
```

このスクリプトは以下を自動で行います：

- 既存サービス（frontend, backend）の起動確認
- Nginx プロキシの自動起動（未起動の場合）
- Nginx プロキシ経由でのヘルスチェック
- E2E テストの実行
- 結果レポートの場所表示

## 💻 ローカル環境での直接実行

開発やデバッグ時に便利です：

```bash
# 1. E2E環境を先に起動（必須）
docker-compose up -d
docker-compose -f docker-compose.yml -f docker-compose.e2e.yml up -d nginx

# 2. e2eディレクトリに移動
cd e2e

# 3. 依存関係インストール（初回のみ）
npm install

# 4. Playwrightブラウザインストール（初回のみ）
npx playwright install

# 5. テスト実行（各種オプション）
npm run test:e2e              # ヘッドレス実行
npm run test:e2e:headed       # ブラウザ表示
npm run test:e2e:ui           # UIモード（推奨）
npm run test:e2e:debug        # デバッグモード
npm run test:e2e:manual       # HTMLレポート生成
```

## 🎯 各実行モードの説明

| コマンド          | 説明                       | 用途           |
| ----------------- | -------------------------- | -------------- |
| `test:e2e`        | ヘッドレス実行             | CI/CD、自動化  |
| `test:e2e:headed` | ブラウザウィンドウ表示     | 動作確認       |
| `test:e2e:ui`     | インタラクティブ UI モード | 開発・デバッグ |
| `test:e2e:debug`  | ステップ実行可能           | 詳細デバッグ   |
| `test:e2e:manual` | HTML レポート生成          | 結果の詳細確認 |

## 📊 テスト結果の確認

```bash
# HTMLレポートを表示
npx playwright show-report

# テスト結果ファイルの場所
ls test-results/          # スクリーンショット、動画
ls playwright-report/     # HTMLレポート
```

## 🏗️ アーキテクチャ

### Nginx リバースプロキシ構成

```
http://nginx/          → フロントエンド (Next.js)
http://nginx/api/      → バックエンド (FastAPI)
```

この構成により、フロントエンドとバックエンドが同一ドメインになり、Cookie の共有問題が解決されています。

### 認証フロー

1. UI 操作によるログイン（本番と同様のフロー）
2. テスト用アカウント: `sample123@sample.com`
3. サーバーから Set-Cookie ヘッダーで cookie 設定
4. ブラウザが自動的に cookie を送信
5. リアルな E2E テストフローを実現

## 🔧 トラブルシューティング

### サービスが起動しない

```bash
# ネットワークの作成
docker network create record_app_default

# コンテナの状態確認
docker-compose -f docker-compose.e2e.yml ps

# ログの確認
docker-compose -f docker-compose.e2e.yml logs nginx
docker-compose -f docker-compose.e2e.yml logs frontend
docker-compose -f docker-compose.e2e.yml logs backend
```

### ヘルスチェック

```bash
# Nginxプロキシ経由でアクセス確認
curl http://localhost/health        # Nginx自体
curl http://localhost/              # フロントエンド
curl http://localhost/api/docs      # バックエンドAPI
```

### Playwright ブラウザの問題

```bash
# ブラウザの再インストール
npx playwright install --force

# システム依存関係のインストール
npx playwright install-deps
```

## 📁 ファイル構成

```
e2e/
├── README.md                 # このファイル
├── package.json             # 依存関係とスクリプト
├── playwright.config.ts     # Playwright設定
├── tests/
│   └── content/
│       ├── content-registration.spec.ts  # コンテンツ登録テスト
│       ├── content-edit.spec.ts         # コンテンツ編集テスト
│       ├── content-recommend.spec.ts    # レコメンド機能テスト
│       └── content-watchlist.spec.ts    # ウォッチリスト機能テスト
├── test-results/            # テスト実行結果
└── playwright-report/       # HTMLレポート
```

## 🚦 推奨ワークフロー

1. **初回セットアップ**: `./run-e2e-tests.sh`で全体動作を確認
2. **開発時**: `npm run test:e2e:ui`でテスト作成・デバッグ
3. **CI/CD**: `npm run test:e2e`でヘッドレス実行
4. **結果確認**: `npx playwright show-report`で HTML レポート表示

## 📊 テスト実行状況 (2025-07-26 更新)

| テストスイート | 状態      | 説明                               |
| -------------- | --------- | ---------------------------------- |
| コンテンツ登録 | ✅ PASSED | ログイン〜登録〜確認の全フロー成功 |
| コンテンツ編集 | ✅ PASSED | 登録〜編集〜保存の全フロー成功     |
| レコメンド機能 | ✅ PASSED | 認証状態でのレコメンド機能確認     |
| ウォッチリスト | ✅ PASSED | ウォッチリスト追加・削除フロー成功 |

**実行時間**: 約 2 分（全テスト）
**成功率**: 4/4 (100%)

## 📝 注意事項

- UI 操作によるリアルなログインフローを使用（テストアカウント: sample123@sample.com）
- テスト実行前に必ず Docker サービスが起動していることを確認
- Nginx リバースプロキシにより統一ドメインで Cookie 共有を実現
- スクリーンショット・動画による詳細なデバッグ情報を自動保存
