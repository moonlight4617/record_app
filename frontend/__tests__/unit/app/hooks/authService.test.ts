// AWS SDK のモック
jest.mock("@aws-sdk/client-cognito-identity-provider", () => {
  const mockSend = jest.fn();
  return {
    CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    SignUpCommand: jest.fn().mockImplementation((input) => ({ input })),
    ConfirmSignUpCommand: jest.fn().mockImplementation((input) => ({ input })),
    __mockSend: mockSend, // テストで参照するためのexport
  };
});

// モジュールの取得
const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  __mockSend: mockSend,
} = require("@aws-sdk/client-cognito-identity-provider");

// authService のインポート
import { signUp, confirmSignUp } from "@/app/hooks/authService";

// 環境変数のモック
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_REGION: "us-west-2",
    NEXT_PUBLIC_CLIENT_ID: "test-client-id",
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockClear();
  });

  describe("signUp", () => {
    const testEmail = "test@example.com";
    const testPassword = "TestPassword123!";

    it("サインアップが成功した場合、正しいパラメータでコマンドが送信される", async () => {
      // モックレスポンス
      const mockResponse = {
        UserSub: "test-user-sub",
        CodeDeliveryDetails: {
          Destination: "t***@example.com",
          DeliveryMedium: "EMAIL",
          AttributeName: "email",
        },
      };

      mockSend.mockResolvedValueOnce(mockResponse);

      const result = await signUp(testEmail, testPassword);

      // SignUpCommand が正しいパラメータで呼ばれることを確認
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(SignUpCommand).toHaveBeenCalledWith({
        ClientId: "test-client-id",
        Username: testEmail,
        Password: testPassword,
        UserAttributes: [
          {
            Name: "email",
            Value: testEmail,
          },
        ],
      });

      // 正しいレスポンスが返されることを確認
      expect(result).toEqual(mockResponse);
    });

    it("サインアップが失敗した場合、エラーがスローされる", async () => {
      const mockError = new Error("UserExistsException");
      mockSend.mockRejectedValueOnce(mockError);

      // コンソールエラーをモック（テスト出力をクリーンにするため）
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(signUp(testEmail, testPassword)).rejects.toThrow(
        "UserExistsException"
      );

      // エラーログが出力されることを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error signing up: ",
        mockError
      );

      consoleErrorSpy.mockRestore();
    });

    it("成功時にログが出力される", async () => {
      const mockResponse = { UserSub: "test-user-sub" };
      mockSend.mockResolvedValueOnce(mockResponse);

      // コンソールログをモック
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      await signUp(testEmail, testPassword);

      // 成功ログが出力されることを確認
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Sign up success: ",
        mockResponse
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe("confirmSignUp", () => {
    const testUsername = "test@example.com";
    const testCode = "123456";

    it("サインアップ確認が成功した場合、正しいパラメータでコマンドが送信される", async () => {
      // モックレスポンス
      const mockResponse = {};

      mockSend.mockResolvedValueOnce(mockResponse);

      const result = await confirmSignUp(testUsername, testCode);

      // ConfirmSignUpCommand が正しいパラメータで呼ばれることを確認
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(ConfirmSignUpCommand).toHaveBeenCalledWith({
        ClientId: "test-client-id",
        Username: testUsername,
        ConfirmationCode: testCode,
      });

      // 正しいレスポンスが返されることを確認
      expect(result).toEqual(mockResponse);
    });

    it("サインアップ確認が失敗した場合、エラーがスローされる", async () => {
      const mockError = new Error("CodeMismatchException");
      mockSend.mockRejectedValueOnce(mockError);

      // コンソールエラーをモック（テスト出力をクリーンにするため）
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(confirmSignUp(testUsername, testCode)).rejects.toThrow(
        "CodeMismatchException"
      );

      // エラーログが出力されることを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error confirming sign up: ",
        mockError
      );

      consoleErrorSpy.mockRestore();
    });

    it("成功時にログが出力される", async () => {
      const mockResponse = {};
      mockSend.mockResolvedValueOnce(mockResponse);

      // コンソールログをモック
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      await confirmSignUp(testUsername, testCode);

      // 成功ログが出力されることを確認
      expect(consoleLogSpy).toHaveBeenCalledWith("response", mockResponse);

      consoleLogSpy.mockRestore();
    });

    it("空の確認コードでもエラーなく処理される", async () => {
      const mockResponse = {};
      mockSend.mockResolvedValueOnce(mockResponse);

      const result = await confirmSignUp(testUsername, "");

      expect(ConfirmSignUpCommand).toHaveBeenCalledWith({
        ClientId: "test-client-id",
        Username: testUsername,
        ConfirmationCode: "",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("エラーハンドリング", () => {
    it("ネットワークエラーが適切に処理される", async () => {
      const networkError = new Error("Network error");
      mockSend.mockRejectedValueOnce(networkError);

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(signUp("test@example.com", "password")).rejects.toThrow(
        "Network error"
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error signing up: ",
        networkError
      );

      consoleErrorSpy.mockRestore();
    });

    it("サービスエラーが適切に処理される", async () => {
      const serviceError = new Error("InvalidParameterException");
      mockSend.mockRejectedValueOnce(serviceError);

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      await expect(confirmSignUp("test@example.com", "123456")).rejects.toThrow(
        "InvalidParameterException"
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error confirming sign up: ",
        serviceError
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("パラメータバリデーション", () => {
    it("signUp: 空のemail でも処理される", async () => {
      const mockResponse = { UserSub: "test-user-sub" };
      mockSend.mockResolvedValueOnce(mockResponse);

      await signUp("", "password");

      expect(SignUpCommand).toHaveBeenCalledWith({
        ClientId: "test-client-id",
        Username: "",
        Password: "password",
        UserAttributes: [
          {
            Name: "email",
            Value: "",
          },
        ],
      });
    });

    it("signUp: 空のpassword でも処理される", async () => {
      const mockResponse = { UserSub: "test-user-sub" };
      mockSend.mockResolvedValueOnce(mockResponse);

      await signUp("test@example.com", "");

      expect(SignUpCommand).toHaveBeenCalledWith({
        ClientId: "test-client-id",
        Username: "test@example.com",
        Password: "",
        UserAttributes: [
          {
            Name: "email",
            Value: "test@example.com",
          },
        ],
      });
    });

    it("confirmSignUp: 空のusername でも処理される", async () => {
      const mockResponse = {};
      mockSend.mockResolvedValueOnce(mockResponse);

      await confirmSignUp("", "123456");

      expect(ConfirmSignUpCommand).toHaveBeenCalledWith({
        ClientId: "test-client-id",
        Username: "",
        ConfirmationCode: "123456",
      });
    });
  });
});
