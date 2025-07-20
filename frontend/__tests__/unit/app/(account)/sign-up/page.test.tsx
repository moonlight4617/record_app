import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContentManager from "@/app/(account)/sign-up/page";
import { signUp } from "@/app/hooks/authService";
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
    type,
  }: {
    id?: string;
    name?: string;
    placeholder?: string;
    type?: string;
  }) => (
    <input
      id={id}
      name={name}
      placeholder={placeholder}
      type={type}
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
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h1 data-testid="card-title">{children}</h1>
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
    <a href={href} className={className} data-testid="link-login">
      {children}
    </a>
  );
});

describe("ContentManager (sign-up page)", () => {
  const mockPush = jest.fn();
  const mockSignUp = signUp as jest.MockedFunction<typeof signUp>;
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
        "ユーザー登録"
      );
    });

    it("フォーム要素が正しく表示される", () => {
      render(<ContentManager />);

      // メールアドレス入力
      expect(screen.getByTestId("label-email")).toHaveTextContent(
        "メールアドレス"
      );
      expect(screen.getByTestId("input-email")).toBeInTheDocument();
      expect(screen.getByTestId("input-email")).toHaveAttribute(
        "placeholder",
        "メールアドレスを入力"
      );

      // パスワード入力
      expect(screen.getByTestId("label-password")).toHaveTextContent(
        "パスワード"
      );
      expect(screen.getByTestId("input-password")).toBeInTheDocument();
      expect(screen.getByTestId("input-password")).toHaveAttribute(
        "type",
        "password"
      );
      expect(screen.getByTestId("input-password")).toHaveAttribute(
        "placeholder",
        "パスワードを入力"
      );

      // パスワード確認入力
      expect(screen.getByTestId("label-confirmPassword")).toHaveTextContent(
        "パスワードの確認"
      );
      expect(screen.getByTestId("input-confirmPassword")).toBeInTheDocument();
      expect(screen.getByTestId("input-confirmPassword")).toHaveAttribute(
        "type",
        "password"
      );
      expect(screen.getByTestId("input-confirmPassword")).toHaveAttribute(
        "placeholder",
        "確認用パスワードを入力"
      );

      // 登録ボタン
      expect(screen.getByTestId("button-登録")).toBeInTheDocument();
      expect(screen.getByTestId("button-登録")).toHaveAttribute(
        "type",
        "submit"
      );
    });

    it("ログインリンクが表示される", () => {
      render(<ContentManager />);

      const loginLink = screen.getByTestId("link-login");
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveTextContent("既に登録済みの方はこちら");
      expect(loginLink).toHaveAttribute("href", "/");
    });
  });

  describe("フォーム送信", () => {
    it("パスワードが一致する場合、signUpが正しい引数で呼ばれる", async () => {
      mockSignUp.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      } as any);

      render(<ContentManager />);

      const emailInput = screen.getByTestId("input-email");
      const passwordInput = screen.getByTestId("input-password");
      const confirmPasswordInput = screen.getByTestId("input-confirmPassword");
      const submitButton = screen.getByTestId("button-登録");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          "test@example.com",
          "password123"
        );
      });
    });

    it("ユーザー登録成功時にconfirm画面にリダイレクトされる", async () => {
      mockSignUp.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      } as any);

      render(<ContentManager />);

      const emailInput = screen.getByTestId("input-email");
      const passwordInput = screen.getByTestId("input-password");
      const confirmPasswordInput = screen.getByTestId("input-confirmPassword");
      const submitButton = screen.getByTestId("button-登録");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/confirm");
      });
    });

    it("パスワードが一致しない場合、エラートーストが表示され、signUpが呼ばれない", async () => {
      render(<ContentManager />);

      const emailInput = screen.getByTestId("input-email");
      const passwordInput = screen.getByTestId("input-password");
      const confirmPasswordInput = screen.getByTestId("input-confirmPassword");
      const submitButton = screen.getByTestId("button-登録");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "differentPassword" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("確認用パスワードが違います");
        expect(mockSignUp).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it("ユーザー登録失敗時（ステータスコードが200以外）にエラートーストが表示される", async () => {
      const mockResult = {
        $metadata: { httpStatusCode: 400 },
      };
      mockSignUp.mockResolvedValue(mockResult as any);

      render(<ContentManager />);

      const emailInput = screen.getByTestId("input-email");
      const passwordInput = screen.getByTestId("input-password");
      const confirmPasswordInput = screen.getByTestId("input-confirmPassword");
      const submitButton = screen.getByTestId("button-登録");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          `ユーザー登録に失敗しました: ${mockResult}`
        );
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it("signUpでエラーが発生した場合にエラートーストが表示される", async () => {
      const errorMessage = "Network error";
      mockSignUp.mockRejectedValue(new Error(errorMessage));

      render(<ContentManager />);

      const emailInput = screen.getByTestId("input-email");
      const passwordInput = screen.getByTestId("input-password");
      const confirmPasswordInput = screen.getByTestId("input-confirmPassword");
      const submitButton = screen.getByTestId("button-登録");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
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
    it("空のフォームデータの場合でも同じ値なのでsignUpが呼ばれる", async () => {
      mockSignUp.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      } as any);

      render(<ContentManager />);

      const submitButton = screen.getByTestId("button-登録");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith("", "");
        expect(toast.error).not.toHaveBeenCalledWith(
          "確認用パスワードが違います"
        );
      });
    });

    it("異なるパスワードが入力された場合、パスワード不一致エラーが表示される", async () => {
      render(<ContentManager />);

      const passwordInput = screen.getByTestId("input-password");
      const confirmPasswordInput = screen.getByTestId("input-confirmPassword");
      const submitButton = screen.getByTestId("button-登録");

      fireEvent.change(passwordInput, { target: { value: "password1" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password2" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("確認用パスワードが違います");
        expect(mockSignUp).not.toHaveBeenCalled();
      });
    });

    it("空文字列のパスワードが一致する場合はsignUpが呼ばれる", async () => {
      mockSignUp.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      } as any);

      render(<ContentManager />);

      const emailInput = screen.getByTestId("input-email");
      const submitButton = screen.getByTestId("button-登録");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith("test@example.com", "");
      });
    });
  });

  describe("バリデーション", () => {
    it("パスワードに特殊文字を含む場合も正常に処理される", async () => {
      mockSignUp.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      } as any);

      render(<ContentManager />);

      const emailInput = screen.getByTestId("input-email");
      const passwordInput = screen.getByTestId("input-password");
      const confirmPasswordInput = screen.getByTestId("input-confirmPassword");
      const submitButton = screen.getByTestId("button-登録");

      const complexPassword = "P@ssw0rd!#$%";
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: complexPassword } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: complexPassword },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          "test@example.com",
          complexPassword
        );
      });
    });

    it("日本語を含むメールアドレスも正常に処理される", async () => {
      mockSignUp.mockResolvedValue({
        $metadata: { httpStatusCode: 200 },
      } as any);

      render(<ContentManager />);

      const emailInput = screen.getByTestId("input-email");
      const passwordInput = screen.getByTestId("input-password");
      const confirmPasswordInput = screen.getByTestId("input-confirmPassword");
      const submitButton = screen.getByTestId("button-登録");

      fireEvent.change(emailInput, { target: { value: "テスト@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          "テスト@example.com",
          "password123"
        );
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

    it("登録ボタンに正しいCSSクラスが適用される", () => {
      render(<ContentManager />);

      const submitButton = screen.getByTestId("button-登録");
      expect(submitButton).toHaveClass("mt-4", "w-full");
    });

    it("ログインリンクに正しいCSSクラスが適用される", () => {
      render(<ContentManager />);

      const loginLink = screen.getByTestId("link-login");
      expect(loginLink).toHaveClass("text-blue-500", "hover:text-blue-800");
    });
  });

  describe("アクセシビリティ", () => {
    it("フォーム要素に適切なラベルが関連付けられている", () => {
      render(<ContentManager />);

      const emailLabel = screen.getByTestId("label-email");
      const passwordLabel = screen.getByTestId("label-password");
      const confirmPasswordLabel = screen.getByTestId("label-confirmPassword");
      const emailInput = screen.getByTestId("input-email");
      const passwordInput = screen.getByTestId("input-password");
      const confirmPasswordInput = screen.getByTestId("input-confirmPassword");

      expect(emailLabel).toHaveAttribute("for", "email");
      expect(passwordLabel).toHaveAttribute("for", "password");
      expect(confirmPasswordLabel).toHaveAttribute("for", "confirmPassword");
      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
      expect(confirmPasswordInput).toHaveAttribute("id", "confirmPassword");
    });

    it("フォーム要素に適切なname属性が設定されている", () => {
      render(<ContentManager />);

      const emailInput = screen.getByTestId("input-email");
      const passwordInput = screen.getByTestId("input-password");
      const confirmPasswordInput = screen.getByTestId("input-confirmPassword");

      expect(emailInput).toHaveAttribute("name", "email");
      expect(passwordInput).toHaveAttribute("name", "password");
      expect(confirmPasswordInput).toHaveAttribute("name", "confirmPassword");
    });

    it("パスワード入力フィールドに適切なtype属性が設定されている", () => {
      render(<ContentManager />);

      const passwordInput = screen.getByTestId("input-password");
      const confirmPasswordInput = screen.getByTestId("input-confirmPassword");

      expect(passwordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
    });
  });
});
