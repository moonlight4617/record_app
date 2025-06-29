import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContentManager from "@/app/(account)/confirm/page";
import { confirmSignUp } from "@/app/hooks/authService";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// モック
jest.mock("@/app/hooks/authService");
jest.mock("next/navigation");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// UIコンポーネントのモック
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    type,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "submit" | "reset" | "button";
    className?: string;
  }) => (
    <button
      type={type}
      onClick={onClick}
      data-testid={`button-${children?.toString().replace(/\s+/g, "-").toLowerCase()}`}
      className={className}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    id,
    name,
    placeholder,
  }: {
    id?: string;
    name?: string;
    placeholder?: string;
  }) => (
    <input
      id={id}
      name={name}
      placeholder={placeholder}
      data-testid={`input-${name || id}`}
    />
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-description">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h1 data-testid="card-title" className={className}>
      {children}
    </h1>
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({
    htmlFor,
    children,
  }: {
    htmlFor?: string;
    children: React.ReactNode;
  }) => (
    <label htmlFor={htmlFor} data-testid={`label-${htmlFor}`}>
      {children}
    </label>
  ),
}));

jest.mock("next/link", () => {
  return ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className} data-testid="link-sign-up">
      {children}
    </a>
  );
});

describe("ContentManager (confirm page)", () => {
  const mockPush = jest.fn();
  const mockConfirmSignUp = confirmSignUp as jest.MockedFunction<
    typeof confirmSignUp
  >;
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  describe("レンダリング", () => {
    it("コンポーネントが正常にレンダリングされる", () => {
      render(<ContentManager />);

      expect(screen.getByTestId("card")).toBeInTheDocument();
      expect(screen.getByTestId("card-title")).toHaveTextContent(
        "認証コードの確認"
      );
      expect(screen.getByTestId("card-description")).toHaveTextContent(
        "メールに届いた認証コードを入力して下さい"
      );
    });

    it("フォーム要素が正しく表示される", () => {
      render(<ContentManager />);

      expect(screen.getByTestId("label-email")).toHaveTextContent(
        "メールアドレス"
      );
      expect(screen.getByTestId("input-email")).toBeInTheDocument();
      expect(screen.getByTestId("input-email")).toHaveAttribute(
        "placeholder",
        "メールアドレスを入力"
      );

      expect(screen.getByTestId("label-code")).toHaveTextContent("認証コード");
      expect(screen.getByTestId("input-code")).toBeInTheDocument();
      expect(screen.getByTestId("input-code")).toHaveAttribute(
        "placeholder",
        "認証コードを入力"
      );

      expect(screen.getByTestId("button-送信")).toBeInTheDocument();
      expect(screen.getByTestId("button-送信")).toHaveAttribute(
        "type",
        "submit"
      );
    });

    it("新規登録リンクが表示される", () => {
      render(<ContentManager />);

      const signUpLink = screen.getByTestId("link-sign-up");
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink).toHaveTextContent("新規登録はこちら");
      expect(signUpLink).toHaveAttribute("href", "/sign-up");
    });
  });

  describe("フォーム送信", () => {
    it("フォーム送信時にconfirmSignUpが正しい引数で呼ばれる", async () => {
      mockConfirmSignUp.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      } as any);

      render(<ContentManager />);

      const emailInput = screen.getByTestId("input-email");
      const codeInput = screen.getByTestId("input-code");
      const submitButton = screen.getByTestId("button-送信");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(codeInput, { target: { value: "123456" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockConfirmSignUp).toHaveBeenCalledWith(
          "test@example.com",
          "123456"
        );
      });
    });

    it("認証成功時にcontent画面にリダイレクトされる", async () => {
      mockConfirmSignUp.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      } as any);

      render(<ContentManager />);

      const emailInput = screen.getByTestId("input-email");
      const codeInput = screen.getByTestId("input-code");
      const submitButton = screen.getByTestId("button-送信");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(codeInput, { target: { value: "123456" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/content");
      });
    });

    it("認証失敗時（ステータスコードが200以外）にエラートーストが表示される", async () => {
      const mockResult = {
        $metadata: { httpStatusCode: 400 },
      };
      mockConfirmSignUp.mockResolvedValue(mockResult as any);

      render(<ContentManager />);

      const emailInput = screen.getByTestId("input-email");
      const codeInput = screen.getByTestId("input-code");
      const submitButton = screen.getByTestId("button-送信");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(codeInput, { target: { value: "123456" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          `認証コードが違います: ${mockResult}`
        );
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it("confirmSignUpでエラーが発生した場合にエラートーストが表示される", async () => {
      const errorMessage = "Network error";
      mockConfirmSignUp.mockRejectedValue(new Error(errorMessage));

      render(<ContentManager />);

      const emailInput = screen.getByTestId("input-email");
      const codeInput = screen.getByTestId("input-code");
      const submitButton = screen.getByTestId("button-送信");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(codeInput, { target: { value: "123456" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          `エラーが発生しました: Error: ${errorMessage}`
        );
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });

  describe("フォームデータの処理", () => {
    it("空のフォームデータでも送信される", async () => {
      mockConfirmSignUp.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      } as any);

      render(<ContentManager />);

      const submitButton = screen.getByTestId("button-送信");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockConfirmSignUp).toHaveBeenCalledWith("", "");
      });
    });

    it("部分的なフォームデータでも送信される", async () => {
      mockConfirmSignUp.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      } as any);

      render(<ContentManager />);

      const emailInput = screen.getByTestId("input-email");
      const submitButton = screen.getByTestId("button-送信");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockConfirmSignUp).toHaveBeenCalledWith("test@example.com", "");
      });
    });
  });

  describe("UI/UX", () => {
    it("カードに正しいCSSクラスが適用される", () => {
      render(<ContentManager />);

      const card = screen.getByTestId("card");
      expect(card).toHaveClass(
        "w-[350px]",
        "bg-white",
        "backdrop-blur-sm",
        "shadow-lg"
      );
    });

    it("タイトルに正しいCSSクラスが適用される", () => {
      render(<ContentManager />);

      const title = screen.getByTestId("card-title");
      expect(title).toHaveClass("text-2xl", "font-bold", "text-center");
    });

    it("送信ボタンに正しいCSSクラスが適用される", () => {
      render(<ContentManager />);

      const submitButton = screen.getByTestId("button-送信");
      expect(submitButton).toHaveClass("mt-4", "w-full");
    });

    it("新規登録リンクに正しいCSSクラスが適用される", () => {
      render(<ContentManager />);

      const signUpLink = screen.getByTestId("link-sign-up");
      expect(signUpLink).toHaveClass("text-blue-500", "hover:text-blue-800");
    });
  });

  describe("アクセシビリティ", () => {
    it("フォーム要素に適切なラベルが関連付けられている", () => {
      render(<ContentManager />);

      const emailLabel = screen.getByTestId("label-email");
      const codeLabel = screen.getByTestId("label-code");
      const emailInput = screen.getByTestId("input-email");
      const codeInput = screen.getByTestId("input-code");

      expect(emailLabel).toHaveAttribute("for", "email");
      expect(codeLabel).toHaveAttribute("for", "code");
      expect(emailInput).toHaveAttribute("id", "email");
      expect(codeInput).toHaveAttribute("id", "code");
    });

    it("フォーム要素に適切なname属性が設定されている", () => {
      render(<ContentManager />);

      const emailInput = screen.getByTestId("input-email");
      const codeInput = screen.getByTestId("input-code");

      expect(emailInput).toHaveAttribute("name", "email");
      expect(codeInput).toHaveAttribute("name", "code");
    });
  });
});
