import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RecommendPage } from "@/features/content/pages/recommend_page";
import { useGetRecommend } from "@/features/content/hooks/get_recommend";
import { toast } from "react-toastify";
import { flashMessages } from "@/features/content/constants/flash_messages";

// モック化
jest.mock("@/features/content/hooks/get_recommend");
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

// UIコンポーネントのモック
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

jest.mock("@/components/ui/loading", () => ({
  Loading: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock("@/features/content/constants/flash_messages", () => ({
  flashMessages: {
    FAILED_GET_RECOMMENDATIONS: "おすすめの取得に失敗しました",
  },
}));

// Lucide Reactアイコンのモック
jest.mock("lucide-react", () => ({
  BookOpen: () => <span data-testid="book-icon">📚</span>,
  Film: () => <span data-testid="film-icon">🎬</span>,
}));

const mockUseGetRecommend = useGetRecommend as jest.MockedFunction<
  typeof useGetRecommend
>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe("RecommendPage", () => {
  const mockGetRecommend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetRecommend.mockReturnValue({
      getRecommend: mockGetRecommend,
      loading: false,
      error: null,
    });
  });

  it("初期表示時に選択ボタンが表示される", () => {
    render(<RecommendPage />);

    expect(
      screen.getByText("おススメを見たい種類を選択してください")
    ).toBeInTheDocument();
    expect(screen.getByText("映画")).toBeInTheDocument();
    expect(screen.getByText("本")).toBeInTheDocument();
  });

  it("初期表示時にはレコメンデーションが表示されない", () => {
    render(<RecommendPage />);

    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    expect(screen.queryByText("詳細を見る →")).not.toBeInTheDocument();
  });

  it("映画ボタンをクリックするとgetRecommendが呼ばれる", async () => {
    const mockRecommendations = [
      {
        title: "テスト映画",
        desc: "テスト映画の説明",
        links: [
          {
            site_name: "TMDB",
            url: "https://example.com/movie",
          },
        ],
      },
    ];

    mockGetRecommend.mockResolvedValue(mockRecommendations);

    render(<RecommendPage />);

    fireEvent.click(screen.getByText("映画"));

    expect(mockGetRecommend).toHaveBeenCalledWith("movie");

    await waitFor(() => {
      expect(screen.getByText("テスト映画")).toBeInTheDocument();
    });
  });

  it("本ボタンをクリックするとgetRecommendが呼ばれる", async () => {
    const mockRecommendations = [
      {
        title: "テスト本",
        desc: "テスト本の説明",
        links: [
          {
            site_name: "Google Books",
            url: "https://example.com/book",
          },
        ],
      },
    ];

    mockGetRecommend.mockResolvedValue(mockRecommendations);

    render(<RecommendPage />);

    fireEvent.click(screen.getByText("本"));

    expect(mockGetRecommend).toHaveBeenCalledWith("book");

    await waitFor(() => {
      expect(screen.getByText("テスト本")).toBeInTheDocument();
    });
  });

  it("ローディング中はLoadingコンポーネントが表示される", () => {
    mockUseGetRecommend.mockReturnValue({
      getRecommend: mockGetRecommend,
      loading: true,
      error: null,
    });

    render(<RecommendPage />);

    // ボタンをクリックしてローディング状態をトリガー
    fireEvent.click(screen.getByText("映画"));

    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("映画のレコメンデーションが正しく表示される", async () => {
    const mockRecommendations = [
      {
        title: "アベンジャーズ",
        desc: "スーパーヒーロー映画",
        links: [
          {
            site_name: "TMDB",
            url: "https://example.com/avengers",
          },
        ],
      },
      {
        title: "タイタニック",
        desc: "ロマンス映画",
        links: [
          {
            site_name: "TMDB",
            url: "https://example.com/titanic",
          },
        ],
      },
    ];

    mockGetRecommend.mockResolvedValue(mockRecommendations);

    render(<RecommendPage />);

    fireEvent.click(screen.getByText("映画"));

    await waitFor(() => {
      expect(screen.getByText("アベンジャーズ")).toBeInTheDocument();
      expect(screen.getByText("スーパーヒーロー映画")).toBeInTheDocument();
      expect(screen.getByText("タイタニック")).toBeInTheDocument();
      expect(screen.getByText("ロマンス映画")).toBeInTheDocument();
      expect(screen.getAllByTestId("film-icon")).toHaveLength(2);
    });
  });

  it("本のレコメンデーションが正しく表示される", async () => {
    const mockRecommendations = [
      {
        title: "ハリーポッター",
        desc: "ファンタジー小説",
        links: [
          {
            site_name: "Google Books",
            url: "https://example.com/harry-potter",
          },
        ],
      },
    ];

    mockGetRecommend.mockResolvedValue(mockRecommendations);

    render(<RecommendPage />);

    fireEvent.click(screen.getByText("本"));

    await waitFor(() => {
      expect(screen.getByText("ハリーポッター")).toBeInTheDocument();
      expect(screen.getByText("ファンタジー小説")).toBeInTheDocument();
      expect(screen.getByTestId("book-icon")).toBeInTheDocument();
    });
  });

  it("リンクが正しく設定される", async () => {
    const mockRecommendations = [
      {
        title: "テスト映画",
        desc: "テスト説明",
        links: [
          {
            site_name: "TMDB",
            url: "https://example.com/test",
          },
        ],
      },
    ];

    mockGetRecommend.mockResolvedValue(mockRecommendations);

    render(<RecommendPage />);

    fireEvent.click(screen.getByText("映画"));

    await waitFor(() => {
      const link = screen.getByText("TMDB");
      expect(link.closest("a")).toHaveAttribute(
        "href",
        "https://example.com/test"
      );
      expect(link.closest("a")).toHaveAttribute("target", "_blank");
    });
  });

  it("リンクがない場合はリンクが表示されない", async () => {
    const mockRecommendations = [
      {
        title: "テスト映画",
        desc: "テスト説明",
        links: [],
      },
    ];

    mockGetRecommend.mockResolvedValue(mockRecommendations);

    render(<RecommendPage />);

    fireEvent.click(screen.getByText("映画"));

    await waitFor(() => {
      expect(screen.getByText("テスト映画")).toBeInTheDocument();
      expect(screen.queryByText("関連リンク:")).not.toBeInTheDocument();
    });
  });

  it("エラーが発生した場合にトーストエラーが表示される", async () => {
    mockUseGetRecommend.mockReturnValue({
      getRecommend: mockGetRecommend,
      loading: false,
      error: "API Error",
    });

    mockGetRecommend.mockResolvedValue([]);

    render(<RecommendPage />);

    fireEvent.click(screen.getByText("映画"));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        flashMessages.FAILED_GET_RECOMMENDATIONS
      );
    });
  });

  it("空の配列が返された場合におススメなしメッセージが表示される", async () => {
    mockGetRecommend.mockResolvedValue([]);

    render(<RecommendPage />);

    fireEvent.click(screen.getByText("映画"));

    await waitFor(() => {
      expect(screen.getByText("現在、おススメできる作品はありません。")).toBeInTheDocument();
    });
  });

  it("配列以外が返された場合にトーストエラーが表示される", async () => {
    mockGetRecommend.mockResolvedValue(null);

    render(<RecommendPage />);

    fireEvent.click(screen.getByText("映画"));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        flashMessages.FAILED_GET_RECOMMENDATIONS
      );
    });
  });

  it("コンソールログが正しく出力される", async () => {
    const mockRecommendations = [
      {
        title: "テスト映画",
        desc: "テスト説明",
        link: "https://example.com/test",
      },
    ];

    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    mockGetRecommend.mockResolvedValue(mockRecommendations);

    render(<RecommendPage />);

    fireEvent.click(screen.getByText("映画"));

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "recommendations: ",
        mockRecommendations
      );
    });

    consoleLogSpy.mockRestore();
  });

  it("エラー時にコンソールログが出力される", async () => {
    const mockError = "Test error";
    mockUseGetRecommend.mockReturnValue({
      getRecommend: mockGetRecommend,
      loading: false,
      error: mockError,
    });

    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    mockGetRecommend.mockResolvedValue([]);

    render(<RecommendPage />);

    fireEvent.click(screen.getByText("映画"));

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
    });

    consoleLogSpy.mockRestore();
  });
});
