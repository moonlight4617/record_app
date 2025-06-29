import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("Label", () => {
  describe("レンダリング", () => {
    it("基本的なLabelが正常にレンダリングされる", () => {
      render(<Label>ラベルテキスト</Label>);

      const label = screen.getByText("ラベルテキスト");
      expect(label).toBeInTheDocument();
    });

    it("子要素が正常に表示される", () => {
      render(
        <Label>
          <span>必須</span>
          <span>項目名</span>
        </Label>
      );

      expect(screen.getByText("必須")).toBeInTheDocument();
      expect(screen.getByText("項目名")).toBeInTheDocument();
    });

    it("空のchildrenでも正常にレンダリングされる", () => {
      render(<Label data-testid="empty-label"></Label>);

      const label = screen.getByTestId("empty-label");
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent("");
    });
  });

  describe("スタイリング", () => {
    it("デフォルトのスタイルクラスが適用される", () => {
      render(<Label data-testid="test-label">テストラベル</Label>);

      const label = screen.getByTestId("test-label");
      expect(label).toHaveClass("block", "font-semibold", "text-gray-600");
    });

    it("classNameプロパティでカスタムクラスが追加される", () => {
      render(
        <Label className="custom-class" data-testid="test-label">
          カスタムラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      expect(label).toHaveClass("custom-class");
      // propsが後で展開されるため、classNameは上書きされる
      expect(label).not.toHaveClass("block", "font-semibold", "text-gray-600");
    });

    it("複数のカスタムクラスが正常に適用される", () => {
      render(
        <Label className="class1 class2 class3" data-testid="test-label">
          マルチクラスラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      expect(label).toHaveClass("class1", "class2", "class3");
    });
  });

  describe("HTML label属性", () => {
    it("htmlFor属性が正常に設定される", () => {
      render(
        <Label htmlFor="input-id" data-testid="test-label">
          関連ラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      expect(label).toHaveAttribute("for", "input-id");
    });

    it("id属性が正常に設定される", () => {
      render(
        <Label id="label-id" data-testid="test-label">
          IDラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      expect(label).toHaveAttribute("id", "label-id");
    });

    it("form属性が正常に設定される", () => {
      render(
        <Label form="form-id" data-testid="test-label">
          フォームラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      expect(label).toHaveAttribute("form", "form-id");
    });
  });

  describe("アクセシビリティ", () => {
    it("aria-label属性が正常に設定される", () => {
      render(
        <Label aria-label="アリアラベル" data-testid="test-label">
          ラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      expect(label).toHaveAttribute("aria-label", "アリアラベル");
    });

    it("aria-describedby属性が正常に設定される", () => {
      render(
        <Label aria-describedby="help-text" data-testid="test-label">
          説明付きラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      expect(label).toHaveAttribute("aria-describedby", "help-text");
    });

    it("aria-required属性が正常に設定される", () => {
      render(
        <Label aria-required={true} data-testid="test-label">
          必須ラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      expect(label).toHaveAttribute("aria-required", "true");
    });

    it("role属性が正常に設定される", () => {
      render(
        <Label role="presentation" data-testid="test-label">
          プレゼンテーションラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      expect(label).toHaveAttribute("role", "presentation");
    });
  });

  describe("イベントハンドリング", () => {
    it("onClickイベントが正常に呼び出される", () => {
      const handleClick = jest.fn();
      render(
        <Label onClick={handleClick} data-testid="test-label">
          クリック可能ラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      fireEvent.click(label);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("onMouseEnterイベントが正常に呼び出される", () => {
      const handleMouseEnter = jest.fn();
      render(
        <Label onMouseEnter={handleMouseEnter} data-testid="test-label">
          ホバー可能ラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      fireEvent.mouseEnter(label);

      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });

    it("onMouseLeaveイベントが正常に呼び出される", () => {
      const handleMouseLeave = jest.fn();
      render(
        <Label onMouseLeave={handleMouseLeave} data-testid="test-label">
          ホバー離脱可能ラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      fireEvent.mouseLeave(label);

      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });

    it("onFocusイベントが正常に呼び出される", () => {
      const handleFocus = jest.fn();
      render(
        <Label onFocus={handleFocus} data-testid="test-label">
          フォーカス可能ラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      fireEvent.focus(label);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it("onBlurイベントが正常に呼び出される", () => {
      const handleBlur = jest.fn();
      render(
        <Label onBlur={handleBlur} data-testid="test-label">
          ブラー可能ラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      fireEvent.blur(label);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it("onKeyDownイベントが正常に呼び出される", () => {
      const handleKeyDown = jest.fn();
      render(
        <Label onKeyDown={handleKeyDown} data-testid="test-label">
          キーダウン可能ラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      fireEvent.keyDown(label, { key: "Enter", code: "Enter" });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "Enter",
          code: "Enter",
        })
      );
    });

    it("onKeyUpイベントが正常に呼び出される", () => {
      const handleKeyUp = jest.fn();
      render(
        <Label onKeyUp={handleKeyUp} data-testid="test-label">
          キーアップ可能ラベル
        </Label>
      );

      const label = screen.getByTestId("test-label");
      fireEvent.keyUp(label, { key: "Enter", code: "Enter" });

      expect(handleKeyUp).toHaveBeenCalledTimes(1);
    });
  });

  describe("フォーム統合", () => {
    it("htmlForで関連付けられたinput要素との関連性を確認する", () => {
      render(
        <div>
          <Label htmlFor="test-input" data-testid="test-label">
            テストラベル
          </Label>
          <input id="test-input" data-testid="test-input" />
        </div>
      );

      const label = screen.getByTestId("test-label");
      const input = screen.getByTestId("test-input");

      // ラベルとinputの関連性を確認
      expect(label).toHaveAttribute("for", "test-input");
      expect(input).toHaveAttribute("id", "test-input");

      // ラベルをクリックしてもエラーが発生しないことを確認
      expect(() => fireEvent.click(label)).not.toThrow();
    });

    it("ネストしたinput要素との構造を確認する", () => {
      render(
        <Label data-testid="test-label">
          テストラベル
          <input data-testid="nested-input" />
        </Label>
      );

      const label = screen.getByTestId("test-label");
      const input = screen.getByTestId("nested-input");

      // ネストした構造を確認
      expect(label).toContainElement(input);
      expect(input.parentElement).toBe(label);

      // ラベルをクリックしてもエラーが発生しないことを確認
      expect(() => fireEvent.click(label)).not.toThrow();
    });

    it("複数のform要素での関連性を確認する", () => {
      render(
        <form data-testid="test-form">
          <Label htmlFor="name-input" data-testid="name-label">
            名前
          </Label>
          <input id="name-input" name="name" data-testid="name-input" />

          <Label htmlFor="email-input" data-testid="email-label">
            メールアドレス
          </Label>
          <input
            id="email-input"
            name="email"
            type="email"
            data-testid="email-input"
          />
        </form>
      );

      const nameLabel = screen.getByTestId("name-label");
      const nameInput = screen.getByTestId("name-input");
      const emailLabel = screen.getByTestId("email-label");
      const emailInput = screen.getByTestId("email-input");

      // 関連性の確認
      expect(nameLabel).toHaveAttribute("for", "name-input");
      expect(nameInput).toHaveAttribute("id", "name-input");
      expect(emailLabel).toHaveAttribute("for", "email-input");
      expect(emailInput).toHaveAttribute("id", "email-input");

      // ラベルクリックでエラーが発生しないことを確認
      expect(() => fireEvent.click(nameLabel)).not.toThrow();
      expect(() => fireEvent.click(emailLabel)).not.toThrow();
    });
  });

  describe("複合的なテスト", () => {
    it("全ての属性とイベントが組み合わされて正常に動作する", () => {
      const handleClick = jest.fn();
      const handleMouseEnter = jest.fn();
      const handleFocus = jest.fn();

      render(
        <Label
          htmlFor="complex-input"
          className="custom-label"
          id="complex-label"
          aria-label="複合ラベル"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onFocus={handleFocus}
          data-testid="complex-label"
        >
          複合テストラベル
        </Label>
      );

      const label = screen.getByTestId("complex-label");

      // 属性確認
      expect(label).toHaveAttribute("for", "complex-input");
      expect(label).toHaveAttribute("id", "complex-label");
      expect(label).toHaveAttribute("aria-label", "複合ラベル");

      // スタイル確認
      expect(label).toHaveClass("custom-label");

      // イベント確認
      fireEvent.mouseEnter(label);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);

      fireEvent.focus(label);
      expect(handleFocus).toHaveBeenCalledTimes(1);

      fireEvent.click(label);
      expect(handleClick).toHaveBeenCalledTimes(1);

      // テキスト確認
      expect(label).toHaveTextContent("複合テストラベル");
    });

    it("必須項目マーカー付きのラベルが正常に動作する", () => {
      render(
        <Label htmlFor="required-input" data-testid="required-label">
          <span>名前</span>
          <span style={{ color: "red" }}>*</span>
        </Label>
      );

      const label = screen.getByTestId("required-label");
      expect(label).toHaveTextContent("名前*");
      expect(screen.getByText("名前")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("アイコン付きのラベルが正常に動作する", () => {
      const IconComponent = () => <span data-testid="icon">📧</span>;

      render(
        <Label htmlFor="icon-input" data-testid="icon-label">
          <IconComponent />
          <span>メールアドレス</span>
        </Label>
      );

      const label = screen.getByTestId("icon-label");
      expect(label).toBeInTheDocument();
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByText("メールアドレス")).toBeInTheDocument();
    });
  });

  describe("HTML構造", () => {
    it("label要素として正常にレンダリングされる", () => {
      render(<Label data-testid="test-label">ラベル</Label>);

      const label = screen.getByTestId("test-label");
      expect(label.tagName).toBe("LABEL");
    });

    it("プロパティが正しくlabel要素に渡される", () => {
      const props = {
        htmlFor: "test-input",
        id: "test-label",
        className: "test-class",
        form: "test-form",
        "aria-label": "テストラベル",
        "aria-required": true,
      };

      render(
        <Label {...props} data-testid="props-label">
          プロパティテスト
        </Label>
      );

      const label = screen.getByTestId("props-label");

      // htmlFor -> for属性への変換確認
      expect(label).toHaveAttribute("for", "test-input");
      expect(label).toHaveAttribute("id", "test-label");
      expect(label).toHaveClass("test-class");
      expect(label).toHaveAttribute("form", "test-form");
      expect(label).toHaveAttribute("aria-label", "テストラベル");
      expect(label).toHaveAttribute("aria-required", "true");
    });

    it("children以外の全てのpropsが正しく渡される", () => {
      const customProps = {
        "data-custom": "custom-value",
        tabIndex: 0,
        title: "ツールチップテキスト",
      };

      render(
        <Label {...customProps} data-testid="custom-props-label">
          カスタムプロパティラベル
        </Label>
      );

      const label = screen.getByTestId("custom-props-label");
      expect(label).toHaveAttribute("data-custom", "custom-value");
      expect(label).toHaveAttribute("tabindex", "0");
      expect(label).toHaveAttribute("title", "ツールチップテキスト");
    });
  });

  describe("エッジケース", () => {
    it("htmlForが空文字列の場合も正常に動作する", () => {
      render(
        <Label htmlFor="" data-testid="empty-for-label">
          空のfor属性
        </Label>
      );

      const label = screen.getByTestId("empty-for-label");
      expect(label).toHaveAttribute("for", "");
    });

    it("非常に長いテキストでも正常に動作する", () => {
      const longText = "これは非常に長いラベルテキストです。".repeat(10);
      render(<Label data-testid="long-text-label">{longText}</Label>);

      const label = screen.getByTestId("long-text-label");
      expect(label).toHaveTextContent(longText);
    });

    it("特殊文字を含むテキストでも正常に動作する", () => {
      const specialText = "特殊文字: @#$%^&*()_+-=[]{}|;':\",./<>?`~";
      render(<Label data-testid="special-text-label">{specialText}</Label>);

      const label = screen.getByTestId("special-text-label");
      expect(label).toHaveTextContent(specialText);
    });

    it("数値のchildrenでも正常に動作する", () => {
      render(<Label data-testid="number-label">{42}</Label>);

      const label = screen.getByTestId("number-label");
      expect(label).toHaveTextContent("42");
    });

    it("真偽値のchildrenでも正常に動作する", () => {
      render(
        <Label data-testid="boolean-label">
          {true && "表示される"}
          {false && "表示されない"}
        </Label>
      );

      const label = screen.getByTestId("boolean-label");
      expect(label).toHaveTextContent("表示される");
      expect(label).not.toHaveTextContent("表示されない");
    });

    it("undefinedやnullのchildrenでも正常に動作する", () => {
      render(
        <Label data-testid="nullable-label">
          {undefined}
          {null}
          正常なテキスト
        </Label>
      );

      const label = screen.getByTestId("nullable-label");
      expect(label).toHaveTextContent("正常なテキスト");
    });

    it("複雑にネストした子要素でも正常に動作する", () => {
      render(
        <Label data-testid="nested-label">
          <div>
            <span>
              <strong>重要</strong>
            </span>
            <small>（必須）</small>
          </div>
          <span>フィールド名</span>
        </Label>
      );

      const label = screen.getByTestId("nested-label");
      expect(label).toHaveTextContent("重要（必須）フィールド名");
      expect(screen.getByText("重要")).toBeInTheDocument();
      expect(screen.getByText("（必須）")).toBeInTheDocument();
      expect(screen.getByText("フィールド名")).toBeInTheDocument();
    });
  });
});
