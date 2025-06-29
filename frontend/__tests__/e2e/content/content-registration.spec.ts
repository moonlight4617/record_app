// tests/e2e/content/content-registration.spec.ts
import { test, expect } from "@playwright/test";

test.describe("コンテンツ登録フロー", () => {
  test("新しいコンテンツを正常に登録できる", async ({ page }) => {
    await page.goto("/");

    // ログイン処理（必要に応じて）
    // await page.click('[data-testid="login-button"]');

    // コンテンツ登録フォームに移動
    await page.click('[data-testid="add-content-button"]');

    // フォームに入力
    await page.fill('[data-testid="content-title"]', "テスト映画");
    await page.fill('[data-testid="content-description"]', "テスト用の説明文");
    await page.selectOption('[data-testid="content-genre"]', "アクション");

    // 登録ボタンをクリック
    await page.click('[data-testid="submit-button"]');

    // 成功メッセージの確認
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    // 一覧画面で新しいコンテンツが表示されることを確認
    await page.goto("/contents");
    await expect(page.locator("text=テスト映画")).toBeVisible();
  });
});
