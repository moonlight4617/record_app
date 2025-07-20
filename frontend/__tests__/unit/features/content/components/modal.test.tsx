import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditModal } from "@/features/content/components/modal";
import { useEditContent } from "@/features/content/hooks/edit_content";
import { toast } from "react-toastify";
import {
  ContentDataType,
  WatchlistDataType,
  RegisterContentDataType,
} from "@/features/content/types/content_type";

// モック
jest.mock("@/features/content/hooks/edit_content");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// InputContentAreaコンポーネントのモック
jest.mock("@/features/content/components/input_content_area", () => ({
  InputContentArea: ({ content }: { content: RegisterContentDataType }) => (
    <div data-testid="input-content-area">
      <input name="type" defaultValue={content.type} data-testid="input-type" />
      <input
        name="title"
        defaultValue={content.title}
        data-testid="input-title"
      />
      <input name="date" defaultValue={content.date} data-testid="input-date" />
      <textarea
        name="notes"
        defaultValue={content.notes || ""}
        data-testid="input-notes"
      />
      <input
        name="link"
        defaultValue={content.link || ""}
        data-testid="input-link"
      />
    </div>
  ),
}));

// Buttonコンポーネントのモック
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    type,
    variant,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "submit" | "reset" | "button";
    variant?: string;
    className?: string;
  }) => (
    <button
      type={type}
      onClick={onClick}
      data-testid={`button-${children?.toString().replace(/\s+/g, "-").toLowerCase()}`}
      data-variant={variant}
      className={className}
    >
      {children}
    </button>
  ),
}));

describe("EditModal", () => {
  const mockEditContent = jest.fn();
  const mockSetIsDisplayModal = jest.fn();
  const mockOnUpdate = jest.fn();

  const defaultProps = {
    isDisplayModal: true,
    setIsDisplayModal: mockSetIsDisplayModal,
    onUpdate: mockOnUpdate,
  };

  const sampleContentData: ContentDataType = {
    contentId: "test-content-id",
    type: "movie",
    title: "テストムービー",
    date: "2024-12-01",
    notes: "テストノート",
    link: "https://example.com",
    year: 2024,
    rank: 1,
    isBest: true,
  };

  const sampleWatchlistData: WatchlistDataType = {
    contentId: "test-watchlist-id",
    type: "book",
    title: "テストブック",
    date: "2024-12-02",
    notes: "ウォッチリストノート",
    link: "https://example.com/book",
    status: "watching",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useEditContent as jest.Mock).mockReturnValue({
      editContent: mockEditContent,
      loading: false,
      error: null,
    });
  });

  describe("レンダリング", () => {
    it("contentがnullの場合、何もレンダリングしない", () => {
      render(<EditModal {...defaultProps} content={null} />);

      expect(screen.queryByText("メモ編集")).not.toBeInTheDocument();
    });

    it("ContentDataTypeのコンテンツで正常にレンダリングされる", () => {
      render(<EditModal {...defaultProps} content={sampleContentData} />);

      expect(screen.getByText("メモ編集")).toBeInTheDocument();
      expect(screen.getByTestId("input-content-area")).toBeInTheDocument();
      expect(screen.getByTestId("button-保存")).toBeInTheDocument();
      expect(screen.getByTestId("button-キャンセル")).toBeInTheDocument();
    });

    it("WatchlistDataTypeのコンテンツで正常にレンダリングされる", () => {
      render(
        <EditModal
          {...defaultProps}
          content={sampleWatchlistData}
          isWatchllist={true}
        />
      );

      expect(screen.getByText("メモ編集")).toBeInTheDocument();
      expect(screen.getByTestId("input-content-area")).toBeInTheDocument();
      expect(screen.getByTestId("button-閲覧済に更新")).toBeInTheDocument();
      expect(screen.getByTestId("button-キャンセル")).toBeInTheDocument();
    });

    it("isWatchllistがtrueの場合、ボタンテキストが「閲覧済に更新」になる", () => {
      render(
        <EditModal
          {...defaultProps}
          content={sampleContentData}
          isWatchllist={true}
        />
      );

      expect(screen.getByTestId("button-閲覧済に更新")).toBeInTheDocument();
      expect(screen.queryByTestId("button-保存")).not.toBeInTheDocument();
    });

    it("isWatchllistがfalseまたは未定義の場合、ボタンテキストが「保存」になる", () => {
      render(<EditModal {...defaultProps} content={sampleContentData} />);

      expect(screen.getByTestId("button-保存")).toBeInTheDocument();
      expect(
        screen.queryByTestId("button-閲覧済に更新")
      ).not.toBeInTheDocument();
    });
  });

  describe("フォーム送信", () => {
    it("フォーム送信時にeditContentが正しい引数で呼ばれる", async () => {
      mockEditContent.mockResolvedValue({
        success: true,
        content: sampleContentData,
      });

      render(<EditModal {...defaultProps} content={sampleContentData} />);

      const submitButton = screen.getByTestId("button-保存");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockEditContent).toHaveBeenCalledWith({
          contentId: sampleContentData.contentId,
          type: sampleContentData.type,
          title: sampleContentData.title,
          date: sampleContentData.date,
          notes: sampleContentData.notes,
          link: sampleContentData.link,
        });
      });
    });

    it("編集成功時にsuccessトーストが表示される", async () => {
      mockEditContent.mockResolvedValue({
        success: true,
        content: sampleContentData,
      });

      render(<EditModal {...defaultProps} content={sampleContentData} />);

      const submitButton = screen.getByTestId("button-保存");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("メモ登録しました");
        expect(mockOnUpdate).toHaveBeenCalledWith(sampleContentData);
        expect(mockSetIsDisplayModal).toHaveBeenCalledWith(false);
      });
    });

    it("編集失敗時にerrorトーストが表示される", async () => {
      const errorMessage = "編集に失敗しました";
      mockEditContent.mockResolvedValue({
        success: false,
        message: errorMessage,
      });

      render(<EditModal {...defaultProps} content={sampleContentData} />);

      const submitButton = screen.getByTestId("button-保存");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          `メモ登録に失敗しました: ${errorMessage}`
        );
        expect(mockOnUpdate).not.toHaveBeenCalled();
        expect(mockSetIsDisplayModal).toHaveBeenCalledWith(false);
      });
    });

    it("編集成功時だがcontentがnullの場合、onUpdateが呼ばれない", async () => {
      mockEditContent.mockResolvedValue({
        success: true,
        content: null,
      });

      render(<EditModal {...defaultProps} content={sampleContentData} />);

      const submitButton = screen.getByTestId("button-保存");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnUpdate).not.toHaveBeenCalled();
        expect(mockSetIsDisplayModal).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("キャンセル操作", () => {
    it("キャンセルボタンクリック時にモーダルが閉じる", () => {
      render(<EditModal {...defaultProps} content={sampleContentData} />);

      const cancelButton = screen.getByTestId("button-キャンセル");
      fireEvent.click(cancelButton);

      expect(mockSetIsDisplayModal).toHaveBeenCalledWith(false);
    });

    it("キャンセル時にeditContentが呼ばれない", () => {
      render(<EditModal {...defaultProps} content={sampleContentData} />);

      const cancelButton = screen.getByTestId("button-キャンセル");
      fireEvent.click(cancelButton);

      expect(mockEditContent).not.toHaveBeenCalled();
    });
  });

  describe("モーダルの表示/非表示", () => {
    it("isDisplayModalがfalseの場合でもcontentがあれば表示される", () => {
      render(
        <EditModal
          {...defaultProps}
          isDisplayModal={false}
          content={sampleContentData}
        />
      );

      expect(screen.getByText("メモ編集")).toBeInTheDocument();
    });

    it("モーダルに正しいCSSクラスが適用される", () => {
      render(<EditModal {...defaultProps} content={sampleContentData} />);

      const modal = screen.getByText("メモ編集").closest("div")?.parentElement;
      expect(modal).toHaveClass(
        "fixed",
        "top-0",
        "left-0",
        "w-full",
        "h-full",
        "flex",
        "items-center",
        "justify-center",
        "bg-black",
        "bg-opacity-50"
      );
    });
  });

  describe("アクセシビリティ", () => {
    it("キャンセルボタンに正しいvariantが設定される", () => {
      render(<EditModal {...defaultProps} content={sampleContentData} />);

      const cancelButton = screen.getByTestId("button-キャンセル");
      expect(cancelButton).toHaveAttribute("data-variant", "cancel");
    });

    it("保存ボタンがsubmitタイプになっている", () => {
      render(<EditModal {...defaultProps} content={sampleContentData} />);

      const submitButton = screen.getByTestId("button-保存");
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("キャンセルボタンがbuttonタイプになっている", () => {
      render(<EditModal {...defaultProps} content={sampleContentData} />);

      const cancelButton = screen.getByTestId("button-キャンセル");
      expect(cancelButton).toHaveAttribute("type", "button");
    });
  });

  describe("ローディング状態", () => {
    it("ローディング中でも正常にレンダリングされる", () => {
      (useEditContent as jest.Mock).mockReturnValue({
        editContent: mockEditContent,
        loading: true,
        error: null,
      });

      render(<EditModal {...defaultProps} content={sampleContentData} />);

      expect(screen.getByText("メモ編集")).toBeInTheDocument();
      expect(screen.getByTestId("button-保存")).toBeInTheDocument();
    });
  });

  describe("エラー状態", () => {
    it("エラー状態でも正常にレンダリングされる", () => {
      (useEditContent as jest.Mock).mockReturnValue({
        editContent: mockEditContent,
        loading: false,
        error: "何らかのエラー",
      });

      render(<EditModal {...defaultProps} content={sampleContentData} />);

      expect(screen.getByText("メモ編集")).toBeInTheDocument();
      expect(screen.getByTestId("button-保存")).toBeInTheDocument();
    });
  });
});
