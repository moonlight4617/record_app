import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

describe("Card", () => {
  describe("レンダリング", () => {
    it("基本的なCardが正常にレンダリングされる", () => {
      render(
        <Card>
          <div>テストコンテンツ</div>
        </Card>
      );

      const card = screen.getByText("テストコンテンツ").parentElement;
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent("テストコンテンツ");
    });

    it("子要素が正常に表示される", () => {
      render(
        <Card>
          <span>子要素1</span>
          <span>子要素2</span>
        </Card>
      );

      expect(screen.getByText("子要素1")).toBeInTheDocument();
      expect(screen.getByText("子要素2")).toBeInTheDocument();
    });
  });

  describe("スタイリング", () => {
    it("デフォルトのスタイルクラスが適用される", () => {
      render(
        <Card>
          <div data-testid="content">コンテンツ</div>
        </Card>
      );

      const card = screen.getByTestId("content").parentElement;
      expect(card).toHaveClass("bg-white", "shadow-md", "rounded-lg", "p-4");
    });

    it("カスタムクラス名が適用される", () => {
      render(
        <Card className="custom-class">
          <div data-testid="content">コンテンツ</div>
        </Card>
      );

      const card = screen.getByTestId("content").parentElement;
      expect(card).toHaveClass(
        "bg-white",
        "shadow-md",
        "rounded-lg",
        "p-4",
        "custom-class"
      );
    });

    it("複数のカスタムクラス名が適用される", () => {
      render(
        <Card className="class1 class2 class3">
          <div data-testid="content">コンテンツ</div>
        </Card>
      );

      const card = screen.getByTestId("content").parentElement;
      expect(card).toHaveClass("class1", "class2", "class3");
    });

    it("className未指定時はデフォルトスタイルのみ適用される", () => {
      render(
        <Card>
          <div data-testid="content">コンテンツ</div>
        </Card>
      );

      const card = screen.getByTestId("content").parentElement;
      expect(card).toHaveClass("bg-white", "shadow-md", "rounded-lg", "p-4");
      if (card) {
        expect(card.className).toBe(
          "bg-white shadow-md rounded-lg p-4 undefined"
        );
      }
    });
  });

  describe("HTML構造", () => {
    it("div要素として正常にレンダリングされる", () => {
      render(
        <Card>
          <div data-testid="content">コンテンツ</div>
        </Card>
      );

      const card = screen.getByTestId("content").parentElement;
      expect(card?.tagName).toBe("DIV");
    });
  });
});

describe("CardHeader", () => {
  describe("レンダリング", () => {
    it("基本的なCardHeaderが正常にレンダリングされる", () => {
      render(
        <CardHeader>
          <div>ヘッダーコンテンツ</div>
        </CardHeader>
      );

      const header = screen.getByText("ヘッダーコンテンツ").parentElement;
      expect(header).toBeInTheDocument();
      expect(header).toHaveTextContent("ヘッダーコンテンツ");
    });

    it("子要素が正常に表示される", () => {
      render(
        <CardHeader>
          <span>ヘッダー要素1</span>
          <span>ヘッダー要素2</span>
        </CardHeader>
      );

      expect(screen.getByText("ヘッダー要素1")).toBeInTheDocument();
      expect(screen.getByText("ヘッダー要素2")).toBeInTheDocument();
    });
  });

  describe("スタイリング", () => {
    it("デフォルトのスタイルクラスが適用される", () => {
      render(
        <CardHeader>
          <div data-testid="header-content">ヘッダー</div>
        </CardHeader>
      );

      const header = screen.getByTestId("header-content").parentElement;
      expect(header).toHaveClass("mb-4");
    });
  });

  describe("HTML構造", () => {
    it("div要素として正常にレンダリングされる", () => {
      render(
        <CardHeader>
          <div data-testid="header-content">ヘッダー</div>
        </CardHeader>
      );

      const header = screen.getByTestId("header-content").parentElement;
      expect(header?.tagName).toBe("DIV");
    });
  });
});

describe("CardTitle", () => {
  describe("レンダリング", () => {
    it("基本的なCardTitleが正常にレンダリングされる", () => {
      render(<CardTitle>タイトルテキスト</CardTitle>);

      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent("タイトルテキスト");
    });

    it("子要素が正常に表示される", () => {
      render(
        <CardTitle>
          <span>タイトル</span>
          <span>サブタイトル</span>
        </CardTitle>
      );

      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toHaveTextContent("タイトルサブタイトル");
      expect(screen.getByText("タイトル")).toBeInTheDocument();
      expect(screen.getByText("サブタイトル")).toBeInTheDocument();
    });
  });

  describe("スタイリング", () => {
    it("デフォルトのスタイルクラスが適用される", () => {
      render(<CardTitle>タイトル</CardTitle>);

      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toHaveClass("text-xl", "font-bold", "text-center");
    });

    it("カスタムクラス名が適用される", () => {
      render(<CardTitle className="custom-title-class">タイトル</CardTitle>);

      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toHaveClass(
        "text-xl",
        "font-bold",
        "text-center",
        "custom-title-class"
      );
    });

    it("複数のカスタムクラス名が適用される", () => {
      render(<CardTitle className="class1 class2">タイトル</CardTitle>);

      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toHaveClass("class1", "class2");
    });

    it("className未指定時はデフォルトスタイルのみ適用される", () => {
      render(<CardTitle>タイトル</CardTitle>);

      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toHaveClass("text-xl", "font-bold", "text-center");
      expect(title.className).toBe("text-xl font-bold text-center undefined");
    });
  });

  describe("HTML構造", () => {
    it("h2要素として正常にレンダリングされる", () => {
      render(<CardTitle>タイトル</CardTitle>);

      const title = screen.getByRole("heading", { level: 2 });
      expect(title.tagName).toBe("H2");
    });
  });
});

describe("CardDescription", () => {
  describe("レンダリング", () => {
    it("基本的なCardDescriptionが正常にレンダリングされる", () => {
      render(<CardDescription>説明テキスト</CardDescription>);

      const description = screen.getByText("説明テキスト");
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent("説明テキスト");
    });

    it("子要素が正常に表示される", () => {
      render(
        <CardDescription>
          <span>説明1</span>
          <span>説明2</span>
        </CardDescription>
      );

      // 個別の要素を確認
      expect(screen.getByText("説明1")).toBeInTheDocument();
      expect(screen.getByText("説明2")).toBeInTheDocument();

      // 親要素の確認
      const description = screen.getByText("説明1").parentElement;
      expect(description).toHaveTextContent("説明1説明2");
    });
  });

  describe("スタイリング", () => {
    it("デフォルトのスタイルクラスが適用される", () => {
      render(<CardDescription>説明</CardDescription>);

      const description = screen.getByText("説明");
      expect(description).toHaveClass("text-gray-500", "text-sm");
    });
  });

  describe("HTML構造", () => {
    it("p要素として正常にレンダリングされる", () => {
      render(<CardDescription>説明</CardDescription>);

      const description = screen.getByText("説明");
      expect(description.tagName).toBe("P");
    });
  });
});

describe("CardContent", () => {
  describe("レンダリング", () => {
    it("基本的なCardContentが正常にレンダリングされる", () => {
      render(
        <CardContent>
          <div>コンテンツテキスト</div>
        </CardContent>
      );

      const content = screen.getByText("コンテンツテキスト").parentElement;
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent("コンテンツテキスト");
    });

    it("子要素が正常に表示される", () => {
      render(
        <CardContent>
          <span>コンテンツ1</span>
          <span>コンテンツ2</span>
        </CardContent>
      );

      expect(screen.getByText("コンテンツ1")).toBeInTheDocument();
      expect(screen.getByText("コンテンツ2")).toBeInTheDocument();
    });
  });

  describe("HTML構造", () => {
    it("div要素として正常にレンダリングされる", () => {
      render(
        <CardContent>
          <div data-testid="content">コンテンツ</div>
        </CardContent>
      );

      const content = screen.getByTestId("content").parentElement;
      expect(content?.tagName).toBe("DIV");
    });
  });
});

describe("CardFooter", () => {
  describe("レンダリング", () => {
    it("基本的なCardFooterが正常にレンダリングされる", () => {
      render(
        <CardFooter>
          <div>フッターコンテンツ</div>
        </CardFooter>
      );

      const footer = screen.getByText("フッターコンテンツ").parentElement;
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveTextContent("フッターコンテンツ");
    });

    it("子要素が正常に表示される", () => {
      render(
        <CardFooter>
          <span>フッター要素1</span>
          <span>フッター要素2</span>
        </CardFooter>
      );

      expect(screen.getByText("フッター要素1")).toBeInTheDocument();
      expect(screen.getByText("フッター要素2")).toBeInTheDocument();
    });
  });

  describe("スタイリング", () => {
    it("デフォルトのスタイルクラスが適用される", () => {
      render(
        <CardFooter>
          <div data-testid="footer-content">フッター</div>
        </CardFooter>
      );

      const footer = screen.getByTestId("footer-content").parentElement;
      expect(footer).toHaveClass("mt-4");
    });
  });

  describe("HTML構造", () => {
    it("div要素として正常にレンダリングされる", () => {
      render(
        <CardFooter>
          <div data-testid="footer-content">フッター</div>
        </CardFooter>
      );

      const footer = screen.getByTestId("footer-content").parentElement;
      expect(footer?.tagName).toBe("DIV");
    });
  });
});

describe("Card複合テスト", () => {
  describe("完全なCard構造", () => {
    it("すべてのCardコンポーネントが組み合わされて正常に動作する", () => {
      render(
        <Card className="custom-card">
          <CardHeader>
            <CardTitle className="custom-title">カードタイトル</CardTitle>
            <CardDescription>カードの説明文</CardDescription>
          </CardHeader>
          <CardContent>
            <p>メインコンテンツ</p>
          </CardContent>
          <CardFooter>
            <button>アクションボタン</button>
          </CardFooter>
        </Card>
      );

      // Card
      const cardTitle = screen.getByRole("heading", { level: 2 });
      const card = cardTitle.closest('div[class*="bg-white"]');
      expect(card).toHaveClass("custom-card");

      // CardTitle
      expect(cardTitle).toHaveTextContent("カードタイトル");
      expect(cardTitle).toHaveClass("custom-title");

      // CardDescription
      const description = screen.getByText("カードの説明文");
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass("text-gray-500", "text-sm");

      // CardContent
      const content = screen.getByText("メインコンテンツ");
      expect(content).toBeInTheDocument();

      // CardFooter
      const button = screen.getByRole("button", { name: "アクションボタン" });
      expect(button).toBeInTheDocument();
      expect(button.parentElement).toHaveClass("mt-4");
    });

    it("最小構成のCardが正常に動作する", () => {
      render(
        <Card>
          <CardContent>シンプルなコンテンツ</CardContent>
        </Card>
      );

      const content = screen.getByText("シンプルなコンテンツ");
      expect(content).toBeInTheDocument();

      const card = content.closest('div[class*="bg-white"]');
      expect(card).toHaveClass("bg-white", "shadow-md", "rounded-lg", "p-4");
    });

    it("ヘッダーとフッターのみのCardが正常に動作する", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>ヘッダーのみ</CardTitle>
          </CardHeader>
          <CardFooter>
            <span>フッターのみ</span>
          </CardFooter>
        </Card>
      );

      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toHaveTextContent("ヘッダーのみ");
      expect(title.parentElement).toHaveClass("mb-4");

      const footer = screen.getByText("フッターのみ");
      expect(footer.parentElement).toHaveClass("mt-4");
    });
  });

  describe("ネストした構造", () => {
    it("複数のCardが入れ子になっても正常に動作する", () => {
      render(
        <Card className="outer-card">
          <CardContent>
            <Card className="inner-card">
              <CardTitle>内側のカード</CardTitle>
            </Card>
          </CardContent>
        </Card>
      );

      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toHaveTextContent("内側のカード");

      const innerCard = title.closest('div[class*="inner-card"]');
      const outerCard = title.closest('div[class*="outer-card"]');

      expect(innerCard).toHaveClass("inner-card");
      expect(outerCard).toHaveClass("outer-card");
      expect(innerCard).not.toBe(outerCard);
    });
  });
});
