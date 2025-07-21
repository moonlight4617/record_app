# E2Eテスト実行ガイド

このディレクトリには、アプリケーションのE2Eテスト（End-to-End Testing）が含まれています。

## 🚀 推奨実行手順（Dockerコンテナ使用）

最も簡単で確実な方法です：

```bash
# 1. プロジェクトルートに移動
cd /path/to/record_app

# 2. E2E環境を起動（既存コンテナ + Nginx）
docker-compose -f docker-compose.e2e.yml up -d

# 3. E2Eテストを実行
docker-compose -f docker-compose.e2e.yml exec e2e-tests npx playwright test --project=chromium

# 4. テスト後のクリーンアップ（オプション）
docker-compose -f docker-compose.e2e.yml down
```

## 🛠️ 簡単実行スクリプト

プロジェクトルートの専用スクリプトを使用（推奨）：

```bash
./run-e2e-tests.sh
```

このスクリプトは以下を自動で行います：
- サービスの起動確認
- Nginxプロキシ経由でのヘルスチェック
- E2Eテストの実行
- 結果レポートの場所表示

## 💻 ローカル環境での直接実行

開発やデバッグ時に便利です：

```bash
# 1. E2E環境を先に起動（必須）
docker-compose -f docker-compose.e2e.yml up -d nginx frontend backend

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

| コマンド | 説明 | 用途 |
|----------|------|------|
| `test:e2e` | ヘッドレス実行 | CI/CD、自動化 |
| `test:e2e:headed` | ブラウザウィンドウ表示 | 動作確認 |
| `test:e2e:ui` | インタラクティブUIモード | 開発・デバッグ |
| `test:e2e:debug` | ステップ実行可能 | 詳細デバッグ |
| `test:e2e:manual` | HTMLレポート生成 | 結果の詳細確認 |

## 📊 テスト結果の確認

```bash
# HTMLレポートを表示
npx playwright show-report

# テスト結果ファイルの場所
ls test-results/          # スクリーンショット、動画
ls playwright-report/     # HTMLレポート
```

## 🏗️ アーキテクチャ

### Nginxリバースプロキシ構成

```
http://nginx/          → フロントエンド (Next.js)
http://nginx/api/      → バックエンド (FastAPI)
```

この構成により、フロントエンドとバックエンドが同一ドメインになり、Cookieの共有問題が解決されています。

### 認証フロー

1. UI操作によるログイン（本番と同様のフロー）
2. テスト用アカウント: `sample123@sample.com`
3. サーバーからSet-Cookieヘッダーでcookie設定
4. ブラウザが自動的にcookieを送信
5. リアルなE2Eテストフローを実現

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

### Playwrightブラウザの問題

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
│       └── content-delete.spec.ts       # コンテンツ削除テスト
├── test-results/            # テスト実行結果
└── playwright-report/       # HTMLレポート
```

## 🚦 推奨ワークフロー

1. **初回セットアップ**: `./run-e2e-tests.sh`で全体動作を確認
2. **開発時**: `npm run test:e2e:ui`でテスト作成・デバッグ
3. **CI/CD**: `npm run test:e2e`でヘッドレス実行
4. **結果確認**: `npx playwright show-report`でHTMLレポート表示

## 📊 テスト実行状況 (2025-01-19更新)

| テストスイート | 状態 | 説明 |
|--------------|------|------|
| コンテンツ登録 | ✅ PASSED | ログイン〜登録〜確認の全フロー成功 |
| コンテンツ削除 | ✅ PASSED | 登録〜削除〜確認の全フロー成功 |
| コンテンツ編集 | ⚠️ FAILED | 編集フォーム要素の取得でエラー（要修正） |

**実行時間**: 登録30-40秒、削除30秒、編集タイムアウト
**成功率**: 2/3 (66%)

## 📝 注意事項

- UI操作によるリアルなログインフローを使用（テストアカウント: sample123@sample.com）
- テスト実行前に必ずDockerサービスが起動していることを確認
- Nginxリバースプロキシにより統一ドメインでCookie共有を実現
- スクリーンショット・動画による詳細なデバッグ情報を自動保存