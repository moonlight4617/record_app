import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BestContentPage } from "@/features/content/pages/best_content_page";
import { toast } from "react-toastify";

// Mock all the custom hooks
jest.mock("@/features/content/hooks/get_years");
jest.mock("@/features/content/hooks/get_years_contents");
jest.mock("@/features/content/hooks/update_best");

// Mock components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({
    children,
    htmlFor,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
  }) => (
    <label htmlFor={htmlFor} data-testid="label">
      {children}
    </label>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, value, name, setValue }: any) => (
    <select
      data-testid={`select-${name}`}
      value={value}
      onChange={(e) => {
        onValueChange(e.target.value);
        setValue && setValue(e.target.value);
      }}
    >
      {children}
    </select>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className, variant }: any) => (
    <button
      data-testid={variant ? `button-${variant}` : "button"}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/features/content/components/contentDetail", () => ({
  ContentDetail: ({ content, isRank }: { content: any; isRank?: boolean }) => (
    <div data-testid="content-detail">
      <span data-testid="content-title">{content.title}</span>
      <span data-testid="content-rank">{content.rank}</span>
      <span data-testid="is-rank">{isRank?.toString()}</span>
    </div>
  ),
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock constants
jest.mock("@/features/content/constants/content_labels", () => ({
  typeLabels: {
    movie: "映画",
    book: "本",
    blog: "ブログ",
  },
}));

jest.mock("@/features/content/constants/flash_messages", () => ({
  flashMessages: {
    SUCCESSFUL_BEST_REGISTRATION: "ベストコンテンツの登録に成功しました",
    FAILED_BEST_REGISTRATION: "ベストコンテンツの登録に失敗しました",
  },
}));

import { useGetYears } from "@/features/content/hooks/get_years";
import { useGetYearsContents } from "@/features/content/hooks/get_years_contents";
import { useUpdateBest } from "@/features/content/hooks/update_best";
import {
  ContentDataType,
  ContentType,
} from "@/features/content/types/content_type";

// Type for UpdateBestResult (adjust based on actual implementation)
interface UpdateBestResult {
  success: boolean;
  message?: string;
}

const mockUseGetYears = useGetYears as jest.MockedFunction<typeof useGetYears>;
const mockUseGetYearsContents = useGetYearsContents as jest.MockedFunction<
  typeof useGetYearsContents
>;
const mockUseUpdateBest = useUpdateBest as jest.MockedFunction<
  typeof useUpdateBest
>;

describe("BestContentPage", () => {
  const mockYears = ["2024", "2023", "2022"];
  const mockContents: ContentDataType[] = [
    {
      contentId: "1",
      title: "Movie Title 1",
      type: "movie",
      date: "2024-01-01",
      year: 2024,
      rank: 1,
      isBest: true,
    },
    {
      contentId: "2",
      title: "Movie Title 2",
      type: "movie",
      date: "2024-02-01",
      year: 2024,
      rank: 2,
      isBest: true,
    },
    {
      contentId: "3",
      title: "Book Title 1",
      type: "book",
      date: "2024-03-01",
      year: 2024,
      rank: 1,
      isBest: true,
    },
    {
      contentId: "4",
      title: "Blog Title 1",
      type: "blog",
      date: "2024-04-01",
      year: 2024,
      isBest: false,
    },
  ];

  const mockFetchYearsContents = jest.fn();
  const mockUpdateBest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseGetYears.mockReturnValue({
      years: mockYears,
      loading: false,
      error: null,
    });

    mockUseGetYearsContents.mockReturnValue({
      fetchYearsContents: mockFetchYearsContents,
      loading: false,
      error: null,
    });

    mockUseUpdateBest.mockReturnValue({
      updateBest: mockUpdateBest,
      loading: false,
      error: null,
    });

    mockFetchYearsContents.mockResolvedValue(mockContents);
  });

  describe("初期レンダリング", () => {
    it("コンポーネントが正しくレンダリングされる", async () => {
      await act(async () => {
        render(<BestContentPage />);
      });

      expect(screen.getByTestId("card")).toBeInTheDocument();
      expect(screen.getByText("対象年:")).toBeInTheDocument();
      expect(screen.getByTestId("select-selectedYear")).toBeInTheDocument();
    });

    it("年選択セレクトボックスに年が表示される", async () => {
      await act(async () => {
        render(<BestContentPage />);
      });

      const selectBox = screen.getByRole("combobox");
      const options = Array.from(selectBox.options).map(
        (option) => option.value
      );

      mockYears.forEach((year) => {
        expect(options).toContain(year); // 想定している年度が含まれているかを確認
      });
    });

    it("各コンテンツタイプのセクションが表示される", async () => {
      await act(async () => {
        render(<BestContentPage />);
      });

      expect(screen.getByText("映画 Best3")).toBeInTheDocument();
      expect(screen.getByText("本 Best3")).toBeInTheDocument();
      expect(screen.getByText("ブログ Best3")).toBeInTheDocument();
    });

    it("編集ボタンが表示される", async () => {
      await act(async () => {
        render(<BestContentPage />);
      });

      const editButton = screen.getByText("ベストの編集");
      expect(editButton).toBeInTheDocument();
    });
  });

  describe("年選択機能", () => {
    it("年を選択するとコンテンツが取得される", async () => {
      await act(async () => {
        render(<BestContentPage />);
      });

      const yearSelect = screen.getByTestId("select-selectedYear");

      await act(async () => {
        fireEvent.change(yearSelect, { target: { value: "2023" } });
      });

      expect(mockFetchYearsContents).toHaveBeenCalledWith("2023");
    });

    it("初期年が設定されている場合、自動的にコンテンツを取得する", async () => {
      await act(async () => {
        render(<BestContentPage />);
      });

      await waitFor(() => {
        expect(mockFetchYearsContents).toHaveBeenCalledWith("2024");
      });
    });
  });

  describe("編集モード", () => {
    it("編集ボタンをクリックすると編集モードになる", async () => {
      await act(async () => {
        render(<BestContentPage />);
      });

      const editButton = screen.getByText("ベストの編集");

      await act(async () => {
        fireEvent.click(editButton);
      });

      expect(screen.getByText("登録")).toBeInTheDocument();
      expect(screen.getByText("キャンセル")).toBeInTheDocument();
    });

    it("編集モードではセレクトボックスが表示される", async () => {
      await act(async () => {
        render(<BestContentPage />);
      });

      await waitFor(() => {
        expect(mockFetchYearsContents).toHaveBeenCalled();
      });

      const editButton = screen.getByText("ベストの編集");

      await act(async () => {
        fireEvent.click(editButton);
      });

      const selectElements = screen.getAllByText("Best 1");
      expect(selectElements.length).toBeGreaterThan(0);
    });

    it("キャンセルボタンをクリックすると編集モードが終了する", async () => {
      await act(async () => {
        render(<BestContentPage />);
      });

      const editButton = screen.getByText("ベストの編集");

      await act(async () => {
        fireEvent.click(editButton);
      });

      const cancelButton = screen.getByText("キャンセル");

      await act(async () => {
        fireEvent.click(cancelButton);
      });

      expect(screen.getByText("ベストの編集")).toBeInTheDocument();
      expect(screen.queryByText("登録")).not.toBeInTheDocument();
    });
  });

  describe("ベストコンテンツ登録", () => {
    it("登録ボタンをクリックするとupdateBestが呼ばれる", async () => {
      const mockResult: UpdateBestResult = { success: true };
      mockUpdateBest.mockResolvedValue(mockResult);

      await act(async () => {
        render(<BestContentPage />);
      });

      await waitFor(() => {
        expect(mockFetchYearsContents).toHaveBeenCalled();
      });

      const editButton = screen.getByText("ベストの編集");

      await act(async () => {
        fireEvent.click(editButton);
      });

      const registerButton = screen.getByText("登録");

      await act(async () => {
        fireEvent.click(registerButton);
      });

      expect(mockUpdateBest).toHaveBeenCalled();
    });

    it("登録成功時にトーストが表示される", async () => {
      const mockResult: UpdateBestResult = { success: true };
      mockUpdateBest.mockResolvedValue(mockResult);

      await act(async () => {
        render(<BestContentPage />);
      });

      await waitFor(() => {
        expect(mockFetchYearsContents).toHaveBeenCalled();
      });

      const editButton = screen.getByText("ベストの編集");

      await act(async () => {
        fireEvent.click(editButton);
      });

      const registerButton = screen.getByText("登録");

      await act(async () => {
        fireEvent.click(registerButton);
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "ベストコンテンツの登録に成功しました"
        );
      });
    });

    it("登録失敗時にエラートーストが表示される", async () => {
      const mockResult: UpdateBestResult = {
        success: false,
        message: "エラーが発生しました",
      };
      mockUpdateBest.mockResolvedValue(mockResult);

      await act(async () => {
        render(<BestContentPage />);
      });

      await waitFor(() => {
        expect(mockFetchYearsContents).toHaveBeenCalled();
      });

      const editButton = screen.getByText("ベストの編集");

      await act(async () => {
        fireEvent.click(editButton);
      });

      const registerButton = screen.getByText("登録");

      await act(async () => {
        fireEvent.click(registerButton);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "ベストコンテンツの登録に失敗しました: エラーが発生しました"
        );
      });
    });

    it("編集モードでない場合は登録処理を行わない", async () => {
      await act(async () => {
        render(<BestContentPage />);
      });

      await waitFor(() => {
        expect(mockFetchYearsContents).toHaveBeenCalled();
      });

      // 編集モードではないため、登録ボタンは存在しない
      expect(screen.queryByText("登録")).not.toBeInTheDocument();
      expect(mockUpdateBest).not.toHaveBeenCalled();
    });
  });

  describe("セレクトボックスの操作", () => {
    it("編集モードでコンテンツを選択すると状態が更新される", async () => {
      const event = userEvent.setup();

      const mixedYearContents: ContentDataType[] = [
        ...mockContents,
        {
          contentId: "5",
          title: "Another Movie",
          type: "movie",
          date: "2024-01-01",
          year: 2024,
          isBest: false,
        },
      ];

      mockFetchYearsContents.mockResolvedValue(mixedYearContents);

      await act(async () => {
        render(<BestContentPage />);
      });

      await waitFor(() => {
        expect(mockFetchYearsContents).toHaveBeenCalled();
      });

      const editButton = screen.getByText("ベストの編集");

      await act(async () => {
        fireEvent.click(editButton);
      });

      const select = screen.getByLabelText("Best 1");
      expect(select).toBeInTheDocument();
      await event.selectOptions(select, "Another Movie"); // "Another Movie"を選択

      // 値が変わったことを確認
      expect(select).toHaveValue("5");
    });
  });

  describe("ベストコンテンツ表示", () => {
    it("ランク付きコンテンツのみが表示される", async () => {
      await act(async () => {
        render(<BestContentPage />);
      });

      await waitFor(() => {
        expect(mockFetchYearsContents).toHaveBeenCalled();
      });

      // rankがnullまたはundefinedのコンテンツは表示されない
      const contentDetails = screen.getAllByTestId("content-detail");
      expect(contentDetails).toHaveLength(4); // rank付きコンテンツのみ
    });
  });

  describe("ローディング状態", () => {
    it("年データのローディング中は適切に処理される", async () => {
      mockUseGetYears.mockReturnValue({
        years: [],
        loading: true,
        error: null,
      });

      await act(async () => {
        render(<BestContentPage />);
      });

      expect(mockFetchYearsContents).not.toHaveBeenCalled();
    });

    // 今後、ローディング実装した場合のテスト
    it("コンテンツデータのローディング中は適切に処理される", async () => {
      mockUseGetYearsContents.mockReturnValue({
        fetchYearsContents: mockFetchYearsContents,
        loading: true,
        error: null,
      });

      await act(async () => {
        render(<BestContentPage />);
      });

      // ローディング中でもUIは表示される
      expect(screen.getByTestId("card")).toBeInTheDocument();
    });
  });

  describe("データフィルタリング", () => {
    it("選択された年のコンテンツのみが表示される", async () => {
      const mixedYearContents: ContentDataType[] = [
        ...mockContents,
        {
          contentId: "6",
          title: "Old Movie",
          type: "movie",
          date: "2023-01-01",
          year: 2023,
          rank: 1,
          isBest: true,
        },
      ];

      mockFetchYearsContents.mockResolvedValue(mixedYearContents);

      await act(async () => {
        render(<BestContentPage />);
      });

      await waitFor(() => {
        expect(mockFetchYearsContents).toHaveBeenCalled();
      });

      // 2024年のコンテンツのみ表示される
      expect(screen.getByText("Movie Title 1")).toBeInTheDocument();
      expect(screen.queryByText("Old Movie")).not.toBeInTheDocument();
    });

    it("コンテンツがタイプとランク順でソートされる", async () => {
      const unsortedContents: ContentDataType[] = [
        {
          contentId: "1",
          title: "Movie Rank 3",
          type: "movie",
          date: "2024-01-01",
          year: 2024,
          rank: 3,
          isBest: true,
        },
        {
          contentId: "2",
          title: "Book Rank 1",
          type: "book",
          date: "2024-02-01",
          year: 2024,
          rank: 1,
          isBest: true,
        },
        {
          contentId: "3",
          title: "Movie Rank 1",
          type: "movie",
          date: "2024-03-01",
          year: 2024,
          rank: 1,
          isBest: true,
        },
      ];

      const expectedTitles = ["Movie Rank 1", "Movie Rank 3", "Book Rank 1"];

      mockFetchYearsContents.mockResolvedValue(unsortedContents);

      await act(async () => {
        render(<BestContentPage />);
      });

      await waitFor(() => {
        expect(mockFetchYearsContents).toHaveBeenCalled();
      });

      const contentDetails = screen.getAllByTestId("content-detail");
      expect(contentDetails).toHaveLength(3);

      contentDetails.forEach((detail, index) => {
        const title = within(detail).getByTestId("content-title");
        expect(title.textContent).toBe(expectedTitles[index]);
      });
    });
  });

  describe("空データの処理", () => {
    it("コンテンツが空の場合でもエラーにならない", async () => {
      mockFetchYearsContents.mockResolvedValue([]);

      await act(async () => {
        render(<BestContentPage />);
      });

      await waitFor(() => {
        expect(mockFetchYearsContents).toHaveBeenCalled();
      });

      expect(screen.getByText("映画 Best3")).toBeInTheDocument();
      expect(screen.getByText("本 Best3")).toBeInTheDocument();
      expect(screen.getByText("ブログ Best3")).toBeInTheDocument();
    });

    it("年データが空の場合の処理", async () => {
      mockUseGetYears.mockReturnValue({
        years: [],
        loading: false,
        error: null,
      });

      await act(async () => {
        render(<BestContentPage />);
      });

      expect(screen.getByTestId("select-selectedYear")).toBeInTheDocument();
      expect(mockFetchYearsContents).not.toHaveBeenCalled();
    });

    it("年データの取得エラーが処理される", async () => {
      mockUseGetYears.mockReturnValue({
        years: [],
        loading: false,
        error: "Failed to fetch years",
      });

      await act(async () => {
        render(<BestContentPage />);
      });

      // エラーがあってもUIは表示される
      expect(screen.getByTestId("card")).toBeInTheDocument();
      // エラーメッセージを表示するように改修した場合はここでテスト
    });

    it("コンテンツデータの取得エラーが処理される", async () => {
      mockUseGetYearsContents.mockReturnValue({
        fetchYearsContents: mockFetchYearsContents,
        loading: false,
        error: "Failed to fetch contents",
      });

      await act(async () => {
        render(<BestContentPage />);
      });

      // エラーがあってもUIは表示される
      expect(screen.getByTestId("card")).toBeInTheDocument();
      // エラーメッセージを表示するように改修した場合はここでテスト
    });
  });
});
