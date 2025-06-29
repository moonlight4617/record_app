import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  describe("レンダリング", () => {
    it("デフォルトのボタンが正常にレンダリングされる", () => {
      render(<Button>テストボタン</Button>);

      const button = screen.getByRole("button", { name: "テストボタン" });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("テストボタン");
    });

    it("子要素が正常に表示される", () => {
      render(
        <Button>
          <span>アイコン</span>
          <span>テキスト</span>
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("アイコンテキスト");
      expect(screen.getByText("アイコン")).toBeInTheDocument();
      expect(screen.getByText("テキスト")).toBeInTheDocument();
    });
  });

  describe("variant prop", () => {
    it("variant='default'でデフォルトスタイルが適用される", () => {
      render(<Button variant="default">デフォルトボタン</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-blue-500", "text-white");
      expect(button).not.toHaveClass("bg-transparent", "text-gray-700");
      expect(button).not.toHaveClass("bg-gray-300", "text-black");
    });

    it("variant='ghost'でゴーストスタイルが適用される", () => {
      render(<Button variant="ghost">ゴーストボタン</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-transparent", "text-gray-700");
      expect(button).not.toHaveClass("bg-blue-500", "text-white");
      expect(button).not.toHaveClass("bg-gray-300", "text-black");
    });

    it("variant='cancel'でキャンセルスタイルが適用される", () => {
      render(<Button variant="cancel">キャンセルボタン</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-gray-300", "text-black");
      expect(button).not.toHaveClass("bg-blue-500", "text-white");
      expect(button).not.toHaveClass("bg-transparent", "text-gray-700");
    });

    it("variantが指定されていない場合はデフォルトスタイルが適用される", () => {
      render(<Button>ボタン</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-blue-500", "text-white");
    });
  });

  describe("className prop", () => {
    it("カスタムクラス名が適用される", () => {
      render(<Button className="custom-class">カスタムボタン</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
      expect(button).toHaveClass("px-4", "py-2", "rounded");
    });

    it("複数のカスタムクラス名が適用される", () => {
      render(
        <Button className="class1 class2 class3">マルチクラスボタン</Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("class1", "class2", "class3");
    });
  });

  describe("基本クラス", () => {
    it("基本的なスタイルクラスが常に適用される", () => {
      render(<Button>基本ボタン</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-4", "py-2", "rounded");
    });
  });

  describe("HTML button属性", () => {
    it("type属性が正常に設定される", () => {
      render(<Button type="submit">送信ボタン</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
    });

    it("disabled属性が正常に設定される", () => {
      render(<Button disabled>無効ボタン</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("id属性が正常に設定される", () => {
      render(<Button id="test-button">IDボタン</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("id", "test-button");
    });

    it("name属性が正常に設定される", () => {
      render(<Button name="test-name">ネームボタン</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("name", "test-name");
    });

    it("aria-label属性が正常に設定される", () => {
      render(<Button aria-label="閉じる">×</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "閉じる");
    });
  });

  describe("イベントハンドリング", () => {
    it("onClickイベントが正常に呼び出される", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>クリック可能ボタン</Button>);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("onMouseEnterイベントが正常に呼び出される", () => {
      const handleMouseEnter = jest.fn();
      render(<Button onMouseEnter={handleMouseEnter}>ホバー可能ボタン</Button>);

      const button = screen.getByRole("button");
      fireEvent.mouseEnter(button);

      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    });

    it("onMouseLeaveイベントが正常に呼び出される", () => {
      const handleMouseLeave = jest.fn();
      render(
        <Button onMouseLeave={handleMouseLeave}>ホバー離脱可能ボタン</Button>
      );

      const button = screen.getByRole("button");
      fireEvent.mouseLeave(button);

      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });

    it("onFocusイベントが正常に呼び出される", () => {
      const handleFocus = jest.fn();
      render(<Button onFocus={handleFocus}>フォーカス可能ボタン</Button>);

      const button = screen.getByRole("button");
      fireEvent.focus(button);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it("onBlurイベントが正常に呼び出される", () => {
      const handleBlur = jest.fn();
      render(<Button onBlur={handleBlur}>ブラー可能ボタン</Button>);

      const button = screen.getByRole("button");
      fireEvent.blur(button);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it("disabled時はonClickイベントが呼び出されない", () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} disabled>
          無効クリックボタン
        </Button>
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("複合的なテスト", () => {
    it("全ての属性とイベントが組み合わされて正常に動作する", () => {
      const handleClick = jest.fn();
      const handleMouseEnter = jest.fn();

      render(
        <Button
          variant="ghost"
          className="custom-style"
          type="button"
          id="complex-button"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          aria-label="複合ボタン"
        >
          複合テストボタン
        </Button>
      );

      const button = screen.getByRole("button");

      // スタイル確認
      expect(button).toHaveClass(
        "bg-transparent",
        "text-gray-700",
        "custom-style"
      );

      // 属性確認
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("id", "complex-button");
      expect(button).toHaveAttribute("aria-label", "複合ボタン");

      // イベント確認
      fireEvent.mouseEnter(button);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);

      // テキスト確認
      expect(button).toHaveTextContent("複合テストボタン");
    });

    it("variant、className、イベントの組み合わせがdefaultで正常に動作する", () => {
      const handleClick = jest.fn();

      render(
        <Button
          variant="default"
          className="extra-padding"
          onClick={handleClick}
        >
          デフォルト組み合わせ
        </Button>
      );

      const button = screen.getByRole("button");

      expect(button).toHaveClass("bg-blue-500", "text-white", "extra-padding");

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("variant、className、イベントの組み合わせがcancelで正常に動作する", () => {
      const handleClick = jest.fn();

      render(
        <Button
          variant="cancel"
          className="border-red-500"
          onClick={handleClick}
        >
          キャンセル組み合わせ
        </Button>
      );

      const button = screen.getByRole("button");

      expect(button).toHaveClass("bg-gray-300", "text-black", "border-red-500");

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
