import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import ContentManager from "@/app/content/page";
import { describe } from "node:test";
import { toast } from "react-toastify";
import { waitFor } from "@testing-library/react";

const mockPush = jest.fn();
const mockLogout = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("@/features/content/hooks/logout", () => ({
  useLogout: () => ({
    logout: mockLogout,
    loading: false,
    error: null,
  }),
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// jest.mock("next/navigation", () => ({
//   useRouter: () => ({
//     push: jest.fn(),
//   }),
// }));

describe("ContentManager", () => {
  it("初期表示でタイトルと初期タブが表示される", () => {
    render(<ContentManager />);
    expect(screen.getByText("ひとことメモ帳。")).toBeInTheDocument();
    expect(screen.getByText("メモ追加")).toHaveClass("bg-white"); // activeタブ
    expect(screen.getByText("振り返り")).not.toHaveClass("bg-white");
    expect(screen.getByText("年度別ベスト")).not.toHaveClass("bg-white");
    expect(screen.getByText("ウォッチリスト")).not.toHaveClass("bg-white");
    expect(screen.getByText("おススメ")).not.toHaveClass("bg-white");
  });

  it("タブをクリックすると表示が切り替わる", () => {
    render(<ContentManager />);
    fireEvent.click(screen.getByText("振り返り"));
    expect(screen.getByText("振り返り")).toHaveClass("bg-white");
  });
});

describe("ContentManager - handleLogout", () => {
  it("ログアウト成功時にtoast.successとrouter.pushが呼ばれる", async () => {
    mockLogout.mockResolvedValue({ success: true });

    const { getByText } = render(<ContentManager />);
    const logoutButton = getByText("ログアウト");
    await fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("ログアウトに成功しました");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("ログアウト失敗時にtoast.errorが呼ばれる", async () => {
    mockLogout.mockResolvedValueOnce({ success: false, message: "エラー発生" });
    // mockUseRouter.mockReturnValue({ push: mockPush });

    render(<ContentManager />);
    const logoutButton = screen.getByRole("button", { name: /ログアウト/i });
    await fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      "ログアウトに失敗しました: エラー発生"
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
