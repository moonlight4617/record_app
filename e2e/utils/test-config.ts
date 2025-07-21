/**
 * E2Eテスト用の設定ユーティリティ
 */

export interface TestCredentials {
  email: string;
  password: string;
}

export interface TestConfig {
  baseUrl: string;
  timeout: number;
  credentials: TestCredentials;
}

/**
 * 環境変数からテスト用認証情報を取得
 */
export function getTestCredentials(): TestCredentials {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E test credentials not found. Please set E2E_TEST_EMAIL and E2E_TEST_PASSWORD environment variables.'
    );
  }

  return {
    email,
    password,
  };
}

/**
 * 環境変数からテスト設定を取得
 */
export function getTestConfig(): TestConfig {
  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';
  const timeout = parseInt(process.env.E2E_TIMEOUT || '30000', 10);
  const credentials = getTestCredentials();

  return {
    baseUrl,
    timeout,
    credentials,
  };
}

/**
 * テスト用のログイン処理を実行
 */
export async function performLogin(
  page: any,
  credentials?: TestCredentials
): Promise<void> {
  const { email, password } = credentials || getTestCredentials();

  // ログインページに移動
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // ログイン情報を入力
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // ログイン成功を待機
  try {
    await Promise.race([
      page.waitForURL(/\/content/, { timeout: 10000 }),
      page.waitForSelector('text=メモ追加', { timeout: 10000 }),
    ]);
    console.log('ログイン成功');
  } catch {
    console.log('ログイン失敗またはタイムアウト');
    await page.screenshot({ path: 'test-results/login-failed.png' });
    throw new Error('ログインに失敗しました');
  }
}