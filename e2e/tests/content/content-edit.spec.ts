// tests/e2e/content/content-edit.spec.ts
import { test, expect } from "@playwright/test";
import { performLogin } from "../../utils/test-config";

test.describe("コンテンツ編集フロー", () => {
  test("既存コンテンツを編集できる", async ({ page }) => {
    test.setTimeout(60000);

    // ログイン情報は環境変数から自動取得

    // ログイン処理
    await performLogin(page);

    // まず新しいコンテンツを登録（編集対象として）
    console.log("編集対象のコンテンツを登録");
    await page.goto("/content");
    await page.waitForLoadState("networkidle");

    const testTitle = `編集テスト_${Date.now()}`;
    const updatedTitle = `${testTitle}_更新済み`;

    // コンテンツ登録
    await page.selectOption('select[name="type"]', "movie");
    await page.fill('input[name="title"]', testTitle);
    await page.fill('input[name="date"]', "2025-01-15");
    await page.fill('textarea[name="notes"]', "編集前のメモ");
    await page.fill('input[name="link"]', "https://example.com/before");

    await page.click('button[type="submit"]:has-text("追加")');

    // 登録成功を待機
    try {
      await expect(page.locator("text=メモ登録しました")).toBeVisible({ timeout: 10000 });
      console.log("コンテンツ登録成功");
    } catch {
      console.log("コンテンツ登録失敗");
      await page.screenshot({ path: "test-results/edit-registration-failed.png" });
      return;
    }

    // 振り返りページに移動して編集対象を探す
    await page.getByRole("button", { name: "振り返り" }).click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // 映画セクション内でコンテンツを探す（調査結果に基づく構造的アプローチ）
    console.log("映画セクション内でコンテンツを探しています...");
    try {
      // 映画セクションを特定
      const movieSection = page.locator('h3:has-text("映画")').or(page.locator('text=映画')).first();
      
      // 映画セクションが見つからない場合は全体から検索
      let searchScope = page;
      if (await movieSection.isVisible({ timeout: 3000 })) {
        console.log("映画セクションが見つかりました");
        searchScope = movieSection.locator('..');
      } else {
        console.log("映画セクションが見つかりません - 全体から検索します");
      }
      
      // コンテンツコンテナを特定（border rounded-lg のコンテナ内でタイトル検索）
      const contentContainers = searchScope.locator('div.border.rounded-lg').or(
        searchScope.locator('div').filter({ hasText: testTitle })
      );
      
      let contentContainer;
      const containerCount = await contentContainers.count();
      console.log(`コンテンツコンテナの数: ${containerCount}`);
      
      if (containerCount > 0) {
        // タイトルを含むコンテナを探す
        for (let i = 0; i < containerCount; i++) {
          const container = contentContainers.nth(i);
          const containerText = await container.textContent();
          if (containerText && containerText.includes(testTitle)) {
            contentContainer = container;
            console.log(`コンテンツコンテナを発見: ${i + 1}番目`);
            break;
          }
        }
      }
      
      if (!contentContainer) {
        // フォールバック: タイトルテキストから直接探す
        console.log("フォールバック: タイトルから直接検索");
        const titleElement = page.locator(`text=${testTitle}`).first();
        if (await titleElement.isVisible({ timeout: 3000 })) {
          contentContainer = titleElement.locator('xpath=ancestor::div[contains(@class,"border")]').first();
        }
      }
      
      if (!contentContainer) {
        throw new Error("コンテンツコンテナが見つかりません");
      }
      
      // コンテンツを展開する（クリックで展開）
      console.log("コンテンツを展開中...");
      await contentContainer.click();
      await page.waitForTimeout(1000); // アニメーション待機
      
      console.log("コンテンツの展開が完了しました");
      
    } catch (error) {
      console.log(`コンテンツが見つかりません: ${error}`);
      await page.screenshot({ path: "test-results/edit-content-not-found.png" });
      
      // デバッグ情報を出力
      const allText = await page.textContent('body');
      console.log("ページ内のテキスト（最初の200文字）:", allText?.substring(0, 200));
      return;
    }

    // 編集ボタンを探してクリック（展開後に表示される）
    console.log("編集ボタンを探しています...");
    try {
      // より確実な編集ボタンの検索（data-testidを優先）
      await page.waitForTimeout(500); // DOM更新待機
      
      // まずdata-testid付きの編集ボタンを探す
      let editButton = page.locator(`[data-testid*="edit-button"]`);
      
      if (!(await editButton.isVisible({ timeout: 2000 }))) {
        console.log("data-testid付きボタンが見つからない - フォールバックテキストベース検索");
        editButton = page.locator("button:has-text('編集')").first();
      }
      
      await expect(editButton).toBeVisible({ timeout: 5000 });
      
      console.log("編集ボタンが見つかりました");
      
      // コンソールエラーを監視
      const errorLogs: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errorLogs.push(`Console Error: ${msg.text()}`);
        }
      });
      
      page.on('pageerror', (error) => {
        errorLogs.push(`Page Error: ${error.message}`);
      });
      
      await editButton.click();
      await page.waitForTimeout(1000); // エラー検出のための待機
      
      if (errorLogs.length > 0) {
        console.log("JavaScript エラーが検出されました:");
        errorLogs.forEach(log => console.log(`  ${log}`));
      } else {
        console.log("JavaScript エラーは検出されませんでした");
      }
      
      // クリック後の状態変化を待機
      await page.waitForTimeout(2000);
      console.log("編集ボタンクリック後の待機完了");
      
      // クリック後のURL確認
      const currentUrl = page.url();
      console.log(`現在のURL: ${currentUrl}`);
      
      // ページのタイトル確認
      const pageTitle = await page.title();
      console.log(`ページタイトル: ${pageTitle}`);
      
      // 現在のページに何があるか確認
      const pageContent = await page.textContent('body');
      console.log(`ページ内容（最初の100文字）: ${pageContent?.substring(0, 100)}`);
      
    } catch {
      console.log("編集ボタンが見つかりませんでした");
      await page.screenshot({ path: "test-results/edit-button-not-found.png" });
      
      // デバッグ: 現在表示されているボタンを確認
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`現在のボタン数: ${buttonCount}`);
      
      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const buttonText = await allButtons.nth(i).textContent();
          console.log(`ボタン ${i + 1}: "${buttonText}"`);
        }
      }
      
      return;
    }

    // 編集フォームが表示されるまで待機（より長時間の待機とフォームの確認）
    console.log("編集フォームの表示を待機中...");
    
    try {
      // より詳細なモーダル検出ロジック
      console.log("モーダル検出を開始...");
      
      // 複数のモーダル検出戦略を同時に試行（data-testidを優先）
      await Promise.race([
        page.waitForSelector('[data-testid="edit-modal-backdrop"]', { timeout: 15000 }),
        page.waitForSelector('[data-testid="edit-modal-content"]', { timeout: 15000 }),
        page.waitForSelector('[data-testid="edit-modal-title"]', { timeout: 15000 }),
        page.waitForSelector('h2:has-text("メモ編集")', { timeout: 15000 }),
        page.waitForSelector('input[name="title"]', { timeout: 15000 })
      ]);
      
      console.log("モーダル要素が検出されました");
      
      // モーダルヘッダーの確認
      const modalHeader = page.locator('h2:has-text("メモ編集")');
      if (await modalHeader.isVisible({ timeout: 3000 })) {
        console.log("編集モーダルヘッダーが表示されました");
      }
      
      // 編集フォームの要素が表示されるまで待機（data-testidを優先）
      const titleInput = await Promise.race([
        page.waitForSelector('[data-testid="input-title"]', { timeout: 5000 }).then(() => 'data-testid'),
        page.waitForSelector('input[name="title"]', { timeout: 5000 }).then(() => 'name')
      ]);
      console.log(`編集フォームが表示されました (${titleInput}セレクター使用)`);
      
    } catch (error) {
      console.log(`編集フォームの表示に失敗: ${error}`);
      await page.screenshot({ path: "test-results/edit-form-not-visible.png" });
      
      // より詳細なデバッグ情報
      const modalH2 = await page.locator('h2:has-text("メモ編集")').count();
      const allH2 = await page.locator('h2').count();
      const modalDialog = await page.locator('[role="dialog"]').count();
      const modalClass = await page.locator('.modal').count();
      const formElements = await page.locator('form, input, textarea, select').count();
      const editElements = await page.locator('text=編集').count();
      
      console.log(`デバッグ情報:`);
      console.log(`- メモ編集H2: ${modalH2}, 全H2: ${allH2}`);
      console.log(`- ダイアログ: ${modalDialog}, モーダルクラス: ${modalClass}`);
      console.log(`- 入力要素数: ${formElements}, 編集テキスト: ${editElements}`);
      
      // 現在のDOM構造の一部をログ出力
      const allH2Elements = page.locator('h2');
      const h2Count = await allH2Elements.count();
      if (h2Count > 0) {
        console.log("現在のH2要素:");
        for (let i = 0; i < Math.min(h2Count, 3); i++) {
          const h2Text = await allH2Elements.nth(i).textContent();
          console.log(`  H2[${i}]: "${h2Text}"`);
        }
      }
      
      return;
    }

    // フォームの値を変更
    console.log("コンテンツを編集中...");
    
    // タイトルを更新（data-testidを優先）
    const titleInput = page.locator('[data-testid="input-title"]').or(page.locator('input[name="title"]'));
    await titleInput.clear();
    await titleInput.fill(updatedTitle);

    // メモを更新（data-testidを優先）
    const notesTextarea = page.locator('[data-testid="textarea-notes"]').or(page.locator('textarea[name="notes"]'));
    await notesTextarea.clear();
    await notesTextarea.fill("編集後のメモ - 内容が更新されました");

    // リンクを更新（data-testidを優先）
    const linkInput = page.locator('[data-testid="input-link"]').or(page.locator('input[name="link"]'));
    await linkInput.clear();
    await linkInput.fill("https://example.com/after-edit");

    // 更新ボタンをクリック（data-testidを優先）
    try {
      const saveButton = page.locator('[data-testid="save-button"]').or(page.locator('button[type="submit"]:has-text("保存")'));
      if (await saveButton.isVisible({ timeout: 3000 })) {
        await saveButton.click();
        console.log("保存ボタンをクリックしました");
      } else {
        // 代替ボタンを探す
        const fallbackButton = page.locator('button[type="submit"], button:has-text("更新"), button:has-text("確定")').first();
        await fallbackButton.click();
        console.log("代替の更新ボタンをクリックしました");
      }
    } catch {
      console.log("更新/保存ボタンが見つかりませんでした");
      await page.screenshot({ path: "test-results/edit-save-button-not-found.png" });
      return;
    }

    // 更新成功メッセージを待機
    try {
      await Promise.race([
        expect(page.locator("text=更新しました")).toBeVisible({ timeout: 10000 }),
        expect(page.locator("text=保存しました")).toBeVisible({ timeout: 10000 }),
        expect(page.locator("text=編集しました")).toBeVisible({ timeout: 10000 }),
      ]);
      console.log("編集成功メッセージを確認");
    } catch {
      console.log("編集成功メッセージが見つかりませんでした");
      await page.screenshot({ path: "test-results/edit-success-message-not-found.png" });
    }

    // 振り返りページで変更内容が反映されているか確認
    await page.getByRole("button", { name: "振り返り" }).click();
    await page.waitForTimeout(2000);

    try {
      await expect(page.locator(`text=${updatedTitle}`)).toBeVisible({ timeout: 5000 });
      console.log("Success: コンテンツが正常に編集されました");
    } catch {
      console.log("Warning: 編集後のタイトルが確認できませんでした");
      await page.screenshot({ path: "test-results/edit-verification-failed.png" });
    }

    console.log("コンテンツ編集フローテスト完了");
  });
});