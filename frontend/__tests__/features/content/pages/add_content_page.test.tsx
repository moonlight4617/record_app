import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddContentPage } from "@/features/content/pages/add_content_page";
import { useAddContent } from "@/features/content/hooks/add_content";
import { toast } from "react-toastify";

// モック
jest.mock("@/features/content/hooks/add_content");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("AddContentPage", () => {
  const mockAddContent = jest.fn();

  const setup = (options?: { loading?: boolean; error?: string }) => {
    (useAddContent as jest.Mock).mockReturnValue({
      addContent: mockAddContent,
      loading: options?.loading || false,
      error: options?.error || null,
    });

    render(<AddContentPage />);
  };

  it("formの表示確認", () => {
    setup();
    expect(screen.getByText("追加")).toBeInTheDocument();
    // InputContentArea の内部までテストしたい場合はそちらもテストする
  });

  it("登録成功時のflashメッセージ確認", async () => {
    mockAddContent.mockResolvedValue({ success: true });
    setup();

    fireEvent.change(screen.getByLabelText("タイトル"), {
      target: { value: "Test Title" },
    });
    fireEvent.change(screen.getByLabelText("日付"), {
      target: { value: "2024-01-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() => {
      expect(mockAddContent).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("メモ登録しました");
    });
  });

  it("登録エラー時のflashメッセージ確認", async () => {
    mockAddContent.mockResolvedValue({
      success: false,
      message: "APIエラー",
    });
    setup();

    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "メモ登録に失敗しました: APIエラー"
      );
    });
  });

  it("登録中は登録ボタンが非活性になっていることの確認", () => {
    setup({ loading: true });

    expect(screen.getByRole("button", { name: "追加" })).toBeDisabled();
  });

  it("エラー時にエラーメッセージが想定通り表示されるか確認", () => {
    setup({ error: "エラーメッセージ" });

    expect(screen.getByText("エラーメッセージ")).toBeInTheDocument();
  });
});
