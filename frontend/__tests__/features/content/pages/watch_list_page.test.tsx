import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "react-toastify";
import { WatchListPage } from "@/features/content/pages/watch_list_page";
import { useAddWatchList } from "@/features/content/hooks/add_watchlist";
import { useGetWatchlist } from "@/features/content/hooks/get_watchlist";
import { useDeleteWatchList } from "@/features/content/hooks/delete_watchlist";
import {
  WatchlistDataType,
  ContentType,
} from "@/features/content/types/content_type";

// モック設定
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/features/content/hooks/add_watchlist");
jest.mock("@/features/content/hooks/get_watchlist");
jest.mock("@/features/content/hooks/delete_watchlist");

jest.mock("@/features/content/components/input_content_area", () => ({
  InputContentArea: ({
    content,
    isWatchList,
  }: {
    content?: any;
    isWatchList?: boolean;
  }) => (
    <div data-testid="input-content-area">
      <select name="type" data-testid="type-input" defaultValue="movie">
        <option value="movie">映画</option>
        <option value="book">本</option>
        <option value="blog">ブログ</option>
      </select>
      <input
        name="title"
        data-testid="title-input"
        placeholder="タイトル"
        defaultValue={content?.title || ""}
      />
      <input
        name="link"
        data-testid="link-input"
        placeholder="リンク"
        defaultValue={content?.link || ""}
      />
    </div>
  ),
}));

jest.mock("@/features/content/components/modal", () => ({
  EditModal: ({
    isDisplayModal,
    setIsDisplayModal,
    content,
    onUpdate,
    isWatchllist,
  }: {
    isDisplayModal: boolean;
    setIsDisplayModal: (value: boolean) => void;
    content: any;
    onUpdate: (content: any) => void;
    isWatchllist?: boolean;
  }) =>
    isDisplayModal ? (
      <div data-testid="edit-modal">
        <div data-testid="modal-content">
          {content?.title && (
            <span data-testid="modal-title">{content.title}</span>
          )}
        </div>
        <button
          onClick={() => {
            onUpdate(content);
            setIsDisplayModal(false);
          }}
          data-testid="modal-update-button"
        >
          更新
        </button>
        <button
          onClick={() => setIsDisplayModal(false)}
          data-testid="modal-close-button"
        >
          閉じる
        </button>
      </div>
    ) : null,
}));

jest.mock("@/features/content/constants/flash_messages", () => ({
  flashMessages: {
    SUCCESSFUL_WATCHLIST_ADDITION: "ウォッチリスト追加しました",
    FAILED_WATCHLIST_ADDITION: "ウォッチリスト追加に失敗しました",
    SUCCESSFUL_WATCHLIST_DELETION: "ウォッチリスト削除しました",
    FAILED_WATCHLIST_DELETION: "ウォッチリスト削除に失敗しました",
  },
}));

// テストデータ
const mockWatchlistData: WatchlistDataType[] = [
  {
    contentId: "1",
    type: "movie",
    title: "テスト映画",
    link: "https://example.com/movie1",
    date: "2024-01-01",
    notes: "面白い映画",
    status: "pending",
  },
  {
    contentId: "2",
    type: "book",
    title: "テスト本",
    link: "https://example.com/book1",
    date: "2024-01-02",
    notes: "良い本",
    status: "pending",
  },
  {
    contentId: "3",
    type: "blog",
    title: "テストブログ",
    date: "2024-01-03",
    notes: "参考になる記事",
    status: "pending",
  },
];

describe("WatchListPage", () => {
  const mockAddWatchlist = jest.fn();
  const mockFetchWatchlist = jest.fn();
  const mockDeleteWatchlist = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useAddWatchList as jest.Mock).mockReturnValue({
      addWatchlist: mockAddWatchlist,
      loading: false,
      error: null,
    });

    (useGetWatchlist as jest.Mock).mockReturnValue({
      fetchWatchlist: mockFetchWatchlist,
      loading: false,
      error: null,
    });

    (useDeleteWatchList as jest.Mock).mockReturnValue({
      deleteWatchlist: mockDeleteWatchlist,
      loading: false,
      error: null,
    });

    mockFetchWatchlist.mockResolvedValue(mockWatchlistData);
  });

  describe("初期表示", () => {
    test("コンポーネントが正常にレンダリングされる", async () => {
      render(<WatchListPage />);

      expect(screen.getByTestId("input-content-area")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
      expect(screen.getByText("ウォッチリスト")).toBeInTheDocument();

      await waitFor(() => {
        expect(mockFetchWatchlist).toHaveBeenCalledTimes(1);
      });
    });

    test("初期データが正常に表示される", async () => {
      render(<WatchListPage />);

      await waitFor(() => {
        expect(screen.getByText("テスト映画")).toBeInTheDocument();
        expect(screen.getByText("テスト本")).toBeInTheDocument();
        expect(screen.getByText("テストブログ")).toBeInTheDocument();
      });
    });

    test("各コンテンツタイプのアイコンが正しく表示される", async () => {
      render(<WatchListPage />);

      await waitFor(() => {
        // SVGアイコンが表示されることを確認（lucide-reactのアイコン）
        const movieIcon = screen
          .getByText("テスト映画")
          .closest("div")
          ?.querySelector("svg");
        const bookIcon = screen
          .getByText("テスト本")
          .closest("div")
          ?.querySelector("svg");
        const blogIcon = screen
          .getByText("テストブログ")
          .closest("div")
          ?.querySelector("svg");

        expect(movieIcon).toBeInTheDocument();
        expect(bookIcon).toBeInTheDocument();
        expect(blogIcon).toBeInTheDocument();
      });
    });

    test("リンクが存在する場合はリンクが表示される", async () => {
      render(<WatchListPage />);

      await waitFor(() => {
        const links = screen.getAllByText("Link");
        expect(links).toHaveLength(2); // movie and book have links
        expect(links[0].closest("a")).toHaveAttribute(
          "href",
          "https://example.com/book1"
        );
        expect(links[1].closest("a")).toHaveAttribute(
          "href",
          "https://example.com/movie1"
        );
        expect(links[0].closest("a")).toHaveAttribute("target", "_blank");
        expect(links[0].closest("a")).toHaveAttribute(
          "rel",
          "noopener noreferrer"
        );
      });
    });

    test("リンクが存在しない場合はリンクが表示されない", async () => {
      render(<WatchListPage />);

      await waitFor(() => {
        // blogアイテムにはリンクがないことを確認
        const blogItem = screen.getByText("テストブログ").closest("div");
        const linkInBlogItem = blogItem?.querySelector("a[href]");
        expect(linkInBlogItem).toBeNull();
      });
    });
  });

  describe("ウォッチリスト追加", () => {
    test("フォーム送信でウォッチリストに追加される（成功）", async () => {
      const user = userEvent.setup();
      mockAddWatchlist.mockResolvedValue({ success: true });

      render(<WatchListPage />);

      // フォームに入力
      await user.selectOptions(screen.getByTestId("type-input"), "book");
      await user.type(screen.getByTestId("title-input"), "新しい本");
      await user.type(
        screen.getByTestId("link-input"),
        "https://example.com/new-book"
      );

      // 送信
      await user.click(screen.getByRole("button", { name: "追加" }));

      await waitFor(() => {
        expect(mockAddWatchlist).toHaveBeenCalledWith({
          type: "book",
          title: "新しい本",
          link: "https://example.com/new-book",
        });
        expect(toast.success).toHaveBeenCalledWith(
          "ウォッチリスト追加しました"
        );
      });
    });

    test("フォーム送信でウォッチリストに追加される（失敗）", async () => {
      const user = userEvent.setup();
      mockAddWatchlist.mockResolvedValue({
        success: false,
        message: "データベース接続エラー",
      });

      render(<WatchListPage />);

      await user.type(screen.getByTestId("title-input"), "新しい映画");
      await user.click(screen.getByRole("button", { name: "追加" }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "ウォッチリスト追加に失敗しました: データベース接続エラー"
        );
      });
    });

    test("リンクなしでもウォッチリストに追加できる", async () => {
      const user = userEvent.setup();
      mockAddWatchlist.mockResolvedValue({ success: true });

      render(<WatchListPage />);

      await user.selectOptions(screen.getByTestId("type-input"), "blog");
      await user.type(screen.getByTestId("title-input"), "リンクなしブログ");

      await user.click(screen.getByRole("button", { name: "追加" }));

      await waitFor(() => {
        expect(mockAddWatchlist).toHaveBeenCalledWith({
          type: "blog",
          title: "リンクなしブログ",
          link: "",
        });
      });
    });
  });

  describe("ウォッチリスト削除", () => {
    test("削除ボタンクリックでアイテムが削除される（成功）", async () => {
      const user = userEvent.setup();
      mockDeleteWatchlist.mockResolvedValue({ success: true });

      render(<WatchListPage />);

      await waitFor(() => {
        expect(screen.getByText("テスト映画")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button", { name: "削除" });

      await user.click(deleteButtons[2]);

      await waitFor(() => {
        expect(mockDeleteWatchlist).toHaveBeenCalledWith(mockWatchlistData[2]);
        expect(toast.success).toHaveBeenCalledWith(
          "ウォッチリスト削除しました"
        );
      });
    });

    test("削除ボタンクリックでアイテムが削除される（失敗）", async () => {
      const user = userEvent.setup();
      mockDeleteWatchlist.mockResolvedValue({
        success: false,
        message: "アクセス権限がありません",
      });

      render(<WatchListPage />);

      await waitFor(() => {
        expect(screen.getByText("テスト映画")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button", { name: "削除" });

      await user.click(deleteButtons[2]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "ウォッチリスト削除に失敗しました: アクセス権限がありません"
        );
      });
    });

    test("削除成功時にUIからアイテムが除去される", async () => {
      const user = userEvent.setup();
      mockDeleteWatchlist.mockResolvedValue({ success: true });

      render(<WatchListPage />);

      await waitFor(() => {
        expect(screen.getByText("テスト映画")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button", { name: "削除" });

      await user.click(deleteButtons[2]);

      await waitFor(() => {
        expect(screen.queryByText("テスト映画")).not.toBeInTheDocument();
        expect(screen.getByText("テスト本")).toBeInTheDocument(); // 他のアイテムは残る
        expect(screen.getByText("テストブログ")).toBeInTheDocument();
      });
    });
  });

  describe("編集モーダル", () => {
    test("閲覧済ボタンクリックでモーダルが表示される", async () => {
      const user = userEvent.setup();

      render(<WatchListPage />);

      await waitFor(() => {
        expect(screen.getByText("テスト映画")).toBeInTheDocument();
      });

      const viewedButtons = screen.getAllByRole("button", { name: "閲覧済" });

      await user.click(viewedButtons[2]);

      expect(screen.getByTestId("edit-modal")).toBeInTheDocument();
      expect(screen.getByTestId("modal-title")).toHaveTextContent("テスト映画");
    });

    test("モーダルで更新ボタンをクリックするとアイテムが削除される", async () => {
      const user = userEvent.setup();

      render(<WatchListPage />);

      await waitFor(() => {
        expect(screen.getByText("テスト映画")).toBeInTheDocument();
      });

      const viewedButtons = screen.getAllByRole("button", { name: "閲覧済" });
      await user.click(viewedButtons[2]);

      const updateButton = screen.getByTestId("modal-update-button");

      await user.click(updateButton);

      // モーダルが閉じることを確認
      expect(screen.queryByTestId("edit-modal")).not.toBeInTheDocument();

      // アイテムがリストから削除されることを確認
      await waitFor(() => {
        expect(screen.queryByText("テスト映画")).not.toBeInTheDocument();
      });
    });

    test("モーダルで閉じるボタンをクリックするとモーダルが閉じる", async () => {
      const user = userEvent.setup();

      render(<WatchListPage />);

      await waitFor(() => {
        expect(screen.getByText("テスト映画")).toBeInTheDocument();
      });

      const viewedButtons = screen.getAllByRole("button", { name: "閲覧済" });
      await user.click(viewedButtons[2]);

      const closeButton = screen.getByTestId("modal-close-button");

      await user.click(closeButton);

      expect(screen.queryByTestId("edit-modal")).not.toBeInTheDocument();

      // アイテムは削除されないことを確認
      expect(screen.getByText("テスト映画")).toBeInTheDocument();
    });

    test("異なるアイテムの閲覧済ボタンで正しいコンテンツがモーダルに表示される", async () => {
      const user = userEvent.setup();

      render(<WatchListPage />);

      await waitFor(() => {
        expect(screen.getByText("テスト本")).toBeInTheDocument();
      });

      const viewedButtons = screen.getAllByRole("button", { name: "閲覧済" });

      await user.click(viewedButtons[1]); // 2番目のアイテム（テスト本）

      expect(screen.getByTestId("edit-modal")).toBeInTheDocument();
      expect(screen.getByTestId("modal-title")).toHaveTextContent("テスト本");
    });
  });

  describe("エラーハンドリング", () => {
    test("初期データ取得が空の場合の処理", async () => {
      mockFetchWatchlist.mockResolvedValue([]);

      render(<WatchListPage />);

      await waitFor(() => {
        expect(mockFetchWatchlist).toHaveBeenCalledTimes(1);
      });

      // ウォッチリストが空の場合、アイテムが表示されないことを確認
      expect(screen.queryByText("テスト映画")).not.toBeInTheDocument();
      expect(screen.queryByText("テスト本")).not.toBeInTheDocument();
      expect(screen.queryByText("テストブログ")).not.toBeInTheDocument();

      // ヘッダーは表示されることを確認
      expect(screen.getByText("ウォッチリスト")).toBeInTheDocument();
    });

    test("初期データ取得でエラーが発生した場合の処理", async () => {
      // fetchWatchlistがエラーオブジェクトを返す場合をシミュレート
      mockFetchWatchlist.mockResolvedValue({ message: "サーバーエラー" });

      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      render(<WatchListPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "ウォッチリスト取得に失敗しました: サーバーエラー"
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("ソート機能", () => {
    test("タイプ別にソートされて表示される", async () => {
      const unsortedData: WatchlistDataType[] = [
        {
          contentId: "1",
          type: "movie",
          title: "映画タイトル",
          date: "2024-01-01",
        },
        {
          contentId: "2",
          type: "book",
          title: "本タイトル",
          date: "2024-01-02",
        },
        {
          contentId: "3",
          type: "blog",
          title: "ブログタイトル",
          date: "2024-01-03",
        },
      ];

      mockFetchWatchlist.mockResolvedValue(unsortedData);

      render(<WatchListPage />);

      await waitFor(() => {
        expect(screen.getByText("映画タイトル")).toBeInTheDocument();
        expect(screen.getByText("本タイトル")).toBeInTheDocument();
        expect(screen.getByText("ブログタイトル")).toBeInTheDocument();
      });

      // ソート順序を確認（blog -> book -> movie の辞書順）
      const allTitles = screen.getAllByText(/タイトル$/);
      expect(allTitles.map((el) => el.textContent)).toEqual([
        "ブログタイトル",
        "本タイトル",
        "映画タイトル",
      ]);
    });
  });

  describe("エラー状態", () => {
    // 将来的にローディング処理を入れた場合のテスト
    // test("追加時のローディング状態", async () => {
    //   (useAddWatchList as jest.Mock).mockReturnValue({
    //     addWatchlist: mockAddWatchlist,
    //     loading: true,
    //     error: null,
    //   });

    //   await act(async () => {
    //     render(<WatchListPage />);
    //   });

    //   // ローディング中はボタンが無効化されるなどの処理があれば、ここでテスト
    //   expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
    // });

    // test("削除時のローディング状態", async () => {
    //   (useDeleteWatchList as jest.Mock).mockReturnValue({
    //     deleteWatchlist: mockDeleteWatchlist,
    //     loading: true,
    //     error: null,
    //   });

    //   await act(async () => {
    //     render(<WatchListPage />);
    //   });

    //   // ローディング中の処理があれば、ここでテスト
    // });

    test("フック内でエラーが発生した場合", async () => {
      const user = userEvent.setup();
      mockAddWatchlist.mockResolvedValue({
        success: false,
        message: "ネットワークエラー",
      });

      render(<WatchListPage />);

      // フォームに入力
      await user.selectOptions(screen.getByTestId("type-input"), "book");
      await user.type(screen.getByTestId("title-input"), "新しい本");
      await user.type(
        screen.getByTestId("link-input"),
        "https://example.com/new-book"
      );

      // 送信
      await user.click(screen.getByRole("button", { name: "追加" }));

      await waitFor(() => {
        expect(mockAddWatchlist).toHaveBeenCalledWith({
          type: "book",
          title: "新しい本",
          link: "https://example.com/new-book",
        });
        expect(toast.error).toHaveBeenCalledWith(
          "ウォッチリスト追加に失敗しました: ネットワークエラー"
        );
      });
    });
  });
});
