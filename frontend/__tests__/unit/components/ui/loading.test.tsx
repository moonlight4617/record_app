import { render, screen } from "@testing-library/react";
import { Loading } from "@/components/ui/loading";

describe("Loading", () => {
  describe("レンダリング", () => {
    it("Loadingコンポーネントが正常にレンダリングされる", () => {
      render(<Loading />);

      // "Loading" テキストが表示されることを確認
      const loadingText = screen.getByText("Loading");
      expect(loadingText).toBeInTheDocument();
    });

    it("スピナーアニメーション要素が存在する", () => {
      const { container } = render(<Loading />);

      // スピナーのdiv要素を取得（animate-spinクラスを持つ要素）
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("適切なコンテナ構造でレンダリングされる", () => {
      const { container } = render(<Loading />);

      // コンテナ要素を取得
      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass(
        "flex",
        "justify-center",
        "items-center",
        "gap-6",
        "mt-10"
      );
    });
  });

  describe("スタイリング", () => {
    it("スピナーに正しいスタイルクラスが適用される", () => {
      const { container } = render(<Loading />);

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass(
        "h-10",
        "w-10",
        "animate-spin",
        "border-[5px]",
        "border-sky-500",
        "rounded-full",
        "border-t-transparent"
      );
    });

    it("Loading テキストに正しいスタイルクラスが適用される", () => {
      render(<Loading />);

      const loadingText = screen.getByText("Loading");
      expect(loadingText).toHaveClass("text-[30px]", "font-weight");
    });
  });

  describe("アクセシビリティ", () => {
    it("スクリーンリーダー用のテキストが提供される", () => {
      render(<Loading />);

      // "Loading" テキストがスクリーンリーダーで読み上げられることを確認
      const loadingText = screen.getByText("Loading");
      expect(loadingText).toBeInTheDocument();

      // テキストが視覚的に表示されていることを確認
      expect(loadingText).toBeVisible();
    });

    it("適切なセマンティック構造を持つ", () => {
      const { container } = render(<Loading />);

      // コンテナがdiv要素であることを確認
      const containerDiv = container.firstChild as HTMLElement;
      expect(containerDiv.tagName.toLowerCase()).toBe("div");

      // p要素でテキストが表示されることを確認
      const textElement = screen.getByText("Loading");
      expect(textElement.tagName.toLowerCase()).toBe("p");
    });
  });

  describe("レイアウト", () => {
    it("flexレイアウトでコンテンツが中央揃えされる", () => {
      const { container } = render(<Loading />);

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass(
        "flex",
        "justify-center",
        "items-center"
      );
    });

    it("スピナーとテキストの間に適切な間隔がある", () => {
      const { container } = render(<Loading />);

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass("gap-6");
    });

    it("上部にマージンが設定される", () => {
      const { container } = render(<Loading />);

      const containerDiv = container.firstChild;
      expect(containerDiv).toHaveClass("mt-10");
    });
  });

  describe("動的要素", () => {
    it("スピナーがアニメーション設定を持つ", () => {
      const { container } = render(<Loading />);

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("animate-spin");
    });

    it("スピナーが円形の境界線を持つ", () => {
      const { container } = render(<Loading />);

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("rounded-full");
    });

    it("スピナーの上部境界線が透明になっている", () => {
      const { container } = render(<Loading />);

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toHaveClass("border-t-transparent");
    });
  });

  describe("エラーハンドリング", () => {
    it("propsなしで正常に動作する", () => {
      expect(() => render(<Loading />)).not.toThrow();
    });

    it("DOMに正しくマウントされる", () => {
      const { unmount } = render(<Loading />);

      // コンポーネントが正常にマウントされることを確認
      expect(screen.getByText("Loading")).toBeInTheDocument();

      // アンマウントも正常に動作することを確認
      expect(() => unmount()).not.toThrow();
    });
  });
});
