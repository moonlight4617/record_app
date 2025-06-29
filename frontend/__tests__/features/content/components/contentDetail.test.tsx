import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ContentDetail } from "@/features/content/components/contentDetail";
import { ContentDataType } from "@/features/content/types/content_type";

// モック化
jest.mock("@/features/content/components/modal", () => ({
  EditModal: ({
    isDisplayModal,
    setIsDisplayModal,
    content,
    onUpdate,
  }: {
    isDisplayModal: boolean;
    setIsDisplayModal: (value: boolean) => void;
    content: ContentDataType;
    onUpdate?: (content: ContentDataType) => void;
  }) => (
    <div data-testid="edit-modal">
      {isDisplayModal && (
        <div>
          <span>編集モーダル</span>
          <button onClick={() => setIsDisplayModal(false)}>閉じる</button>
          {onUpdate && (
            <button
              onClick={() =>
                onUpdate({ ...content, title: "更新されたタイトル" })
              }
            >
              更新
            </button>
          )}
        </div>
      )}
    </div>
  ),
}));

// Lucide Reactアイコンのモック
jest.mock("lucide-react", () => ({
  BookOpen: () => <span data-testid="book-icon">📚</span>,
  Film: () => <span data-testid="film-icon">🎬</span>,
  Bookmark: () => <span data-testid="bookmark-icon">🔖</span>,
  LinkIcon: () => <span data-testid="link-icon">🔗</span>,
  ChevronUp: () => <span data-testid="chevron-up">▲</span>,
  ChevronDown: () => <span data-testid="chevron-down">▼</span>,
}));

describe("ContentDetail", () => {
  const mockOnUpdate = jest.fn();

  const mockMovieContent: ContentDataType = {
    contentId: "1",
    type: "movie",
    title: "テスト映画",
    date: "2024-01-15",
    notes: "素晴らしい映画でした",
    link: "https://example.com/movie",
    year: 2024,
    rank: 1,
    isBest: true,
  };

  const mockBookContent: ContentDataType = {
    contentId: "2",
    type: "book",
    title: "テスト本",
    date: "2024-02-20",
    notes: "とても面白い本でした",
    link: "",
    year: 2024,
  };

  const mockBlogContent: ContentDataType = {
    contentId: "3",
    type: "blog",
    title: "テストブログ",
    date: "2024-03-10",
    notes: "有益な情報でした",
    link: "https://example.com/blog",
    year: 2024,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("基本的な表示", () => {
    it("映画コンテンツが正しく表示される", () => {
      render(<ContentDetail content={mockMovieContent} />);

      expect(screen.getByTestId("film-icon")).toBeInTheDocument();
      expect(screen.getByText("01/15")).toBeInTheDocument();
      expect(screen.getByText("テスト映画")).toBeInTheDocument();
      expect(screen.getByTestId("chevron-down")).toBeInTheDocument();
    });

    it("本コンテンツが正しく表示される", () => {
      render(<ContentDetail content={mockBookContent} />);

      expect(screen.getByTestId("book-icon")).toBeInTheDocument();
      expect(screen.getByText("02/20")).toBeInTheDocument();
      expect(screen.getByText("テスト本")).toBeInTheDocument();
    });

    it("ブログコンテンツが正しく表示される", () => {
      render(<ContentDetail content={mockBlogContent} />);

      expect(screen.getByTestId("bookmark-icon")).toBeInTheDocument();
      expect(screen.getByText("03/10")).toBeInTheDocument();
      expect(screen.getByText("テストブログ")).toBeInTheDocument();
    });

    it("ランク表示時にランクが表示される", () => {
      render(<ContentDetail content={mockMovieContent} isRank={true} />);

      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("ランク表示でない場合はランクが表示されない", () => {
      render(<ContentDetail content={mockMovieContent} isRank={false} />);

      expect(screen.queryByText("1")).not.toBeInTheDocument();
    });
  });

  describe("展開・折りたたみ機能", () => {
    it("初期状態では詳細が非表示", () => {
      render(<ContentDetail content={mockMovieContent} />);

      expect(
        screen.queryByText("素晴らしい映画でした")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("chevron-down")).toBeInTheDocument();
    });

    it("クリックすると詳細が表示される", () => {
      render(<ContentDetail content={mockMovieContent} />);

      const toggleButton = screen.getByRole("button", {
        name: /01\/15.*テスト映画/,
      });
      fireEvent.click(toggleButton);

      expect(screen.getByText("素晴らしい映画でした")).toBeInTheDocument();
      expect(screen.getByTestId("chevron-up")).toBeInTheDocument();
    });

    it("再度クリックすると詳細が非表示になる", () => {
      render(<ContentDetail content={mockMovieContent} />);

      // 展開ボタンを特定するために、より具体的なセレクタを使用
      const toggleButton = screen.getByRole("button", {
        name: /01\/15.*テスト映画/,
      });

      // 展開
      fireEvent.click(toggleButton);
      expect(screen.getByText("素晴らしい映画でした")).toBeInTheDocument();

      // 折りたたみ
      fireEvent.click(toggleButton);
      expect(
        screen.queryByText("素晴らしい映画でした")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("chevron-down")).toBeInTheDocument();
    });
  });

  describe("リンク表示", () => {
    it("リンクがある場合はリンクボタンが表示される", () => {
      render(<ContentDetail content={mockMovieContent} />);

      // 展開
      const toggleButton = screen.getByRole("button", {
        name: /01\/15.*テスト映画/,
      });
      fireEvent.click(toggleButton);

      const linkElement = screen.getByText("リンク");
      expect(linkElement).toBeInTheDocument();
      expect(linkElement.closest("a")).toHaveAttribute(
        "href",
        "https://example.com/movie"
      );
      expect(linkElement.closest("a")).toHaveAttribute("target", "_blank");
      expect(linkElement.closest("a")).toHaveAttribute(
        "rel",
        "noopener noreferrer"
      );
      expect(screen.getByTestId("link-icon")).toBeInTheDocument();
    });

    it("リンクがない場合はリンクボタンが表示されない", () => {
      render(<ContentDetail content={mockBookContent} />);

      // 展開
      const toggleButton = screen.getByRole("button", {
        name: /02\/20.*テスト本/,
      });
      fireEvent.click(toggleButton);

      expect(screen.queryByText("リンク")).not.toBeInTheDocument();
      expect(screen.queryByTestId("link-icon")).not.toBeInTheDocument();
    });
  });

  describe("編集機能", () => {
    it("ランク表示でない場合は編集ボタンが表示される", () => {
      render(
        <ContentDetail content={mockMovieContent} onUpdate={mockOnUpdate} />
      );

      // 展開
      const toggleButton = screen.getByRole("button", {
        name: /01\/15.*テスト映画/,
      });
      fireEvent.click(toggleButton);

      expect(screen.getByText("編集")).toBeInTheDocument();
    });

    it("ランク表示の場合は編集ボタンが表示されない", () => {
      render(
        <ContentDetail
          content={mockMovieContent}
          isRank={true}
          onUpdate={mockOnUpdate}
        />
      );

      // 展開
      const toggleButton = screen.getByRole("button", {
        name: /01\/15.*テスト映画/,
      });
      fireEvent.click(toggleButton);

      expect(screen.queryByText("編集")).not.toBeInTheDocument();
    });

    it("onUpdateがない場合でも編集ボタンが表示される（isRankがfalseの場合）", () => {
      render(<ContentDetail content={mockMovieContent} />);

      // 展開
      const toggleButton = screen.getByRole("button", {
        name: /01\/15.*テスト映画/,
      });
      fireEvent.click(toggleButton);

      expect(screen.getByText("編集")).toBeInTheDocument();
    });

    it("onUpdateがない場合は編集モーダルが表示されない", async () => {
      render(<ContentDetail content={mockMovieContent} />);

      // 展開
      const toggleButton = screen.getByRole("button", {
        name: /01\/15.*テスト映画/,
      });
      fireEvent.click(toggleButton);

      // 編集ボタンをクリック
      fireEvent.click(screen.getByText("編集"));

      // onUpdateがないのでモーダルは表示されない
      expect(screen.queryByText("編集モーダル")).not.toBeInTheDocument();
    });

    it("編集ボタンをクリックするとモーダルが表示される", async () => {
      render(
        <ContentDetail content={mockMovieContent} onUpdate={mockOnUpdate} />
      );

      // 展開
      const toggleButton = screen.getByRole("button", {
        name: /01\/15.*テスト映画/,
      });
      fireEvent.click(toggleButton);

      // 編集ボタンをクリック
      fireEvent.click(screen.getByText("編集"));

      await waitFor(() => {
        expect(screen.getByText("編集モーダル")).toBeInTheDocument();
      });
    });

    it("モーダルから更新されたコンテンツがonUpdateで呼ばれる", async () => {
      render(
        <ContentDetail content={mockMovieContent} onUpdate={mockOnUpdate} />
      );

      // 展開
      const toggleButton = screen.getByRole("button", {
        name: /01\/15.*テスト映画/,
      });
      fireEvent.click(toggleButton);

      // 編集ボタンをクリック
      fireEvent.click(screen.getByText("編集"));

      await waitFor(() => {
        expect(screen.getByText("編集モーダル")).toBeInTheDocument();
      });

      // モーダル内の更新ボタンをクリック
      fireEvent.click(screen.getByText("更新"));

      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...mockMovieContent,
        title: "更新されたタイトル",
      });
    });

    it("モーダルを閉じることができる", async () => {
      render(
        <ContentDetail content={mockMovieContent} onUpdate={mockOnUpdate} />
      );

      // 展開
      const toggleButton = screen.getByRole("button", {
        name: /01\/15.*テスト映画/,
      });
      fireEvent.click(toggleButton);

      // 編集ボタンをクリック
      fireEvent.click(screen.getByText("編集"));

      await waitFor(() => {
        expect(screen.getByText("編集モーダル")).toBeInTheDocument();
      });

      // モーダルを閉じる
      fireEvent.click(screen.getByText("閉じる"));

      await waitFor(() => {
        expect(screen.queryByText("編集モーダル")).not.toBeInTheDocument();
      });
    });
  });

  describe("日付フォーマット", () => {
    it("日付が正しくフォーマットされる", () => {
      const contentWithSpecificDate = {
        ...mockMovieContent,
        date: "2024-12-25",
      };

      render(<ContentDetail content={contentWithSpecificDate} />);

      expect(screen.getByText("12/25")).toBeInTheDocument();
    });

    it("異なる日付形式でも正しくフォーマットされる", () => {
      const contentWithDifferentDate = {
        ...mockMovieContent,
        date: "2024-01-01",
      };

      render(<ContentDetail content={contentWithDifferentDate} />);

      expect(screen.getByText("01/01")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("展開ボタンにrole='button'が設定されている", () => {
      render(<ContentDetail content={mockMovieContent} />);

      const toggleButton = screen.getByRole("button", {
        name: /01\/15.*テスト映画/,
      });
      expect(toggleButton).toBeInTheDocument();
    });

    it("外部リンクに適切な属性が設定されている", () => {
      render(<ContentDetail content={mockMovieContent} />);

      // 展開
      const toggleButton = screen.getByRole("button", {
        name: /01\/15.*テスト映画/,
      });
      fireEvent.click(toggleButton);

      const linkElement = screen.getByText("リンク").closest("a");
      expect(linkElement).toHaveAttribute("target", "_blank");
      expect(linkElement).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
