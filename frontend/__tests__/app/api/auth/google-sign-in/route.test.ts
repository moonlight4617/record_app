/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";

// 環境変数をモック（ルートファイルをインポートする前に設定）
const originalEnv = process.env;

// NextResponseをモック
jest.mock("next/server", () => ({
  NextResponse: {
    redirect: jest.fn((url) => {
      const mockResponse = {
        status: 307,
        headers: new Map([["location", url.toString()]]),
        set: jest.fn(),
      };
      // headers.setメソッドをモック
      mockResponse.headers.set = jest.fn();
      return mockResponse;
    }),
  },
}));

// 動的にルートファイルをインポート
let GET: any;

beforeAll(async () => {
  // 環境変数を設定
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_COGNITO_DOMAIN:
      "https://test-domain.auth.region.amazoncognito.com",
    NEXT_PUBLIC_CLIENT_ID: "test-client-id",
    NEXT_PUBLIC_REDIRECT_URI: "https://test-app.com/api/auth/google-callback",
    NEXT_PUBLIC_STATE: "test-state-value",
  };

  // ルートファイルを動的にインポート
  const routeModule = await import("@/app/api/auth/google-sign-in/route");
  GET = routeModule.GET;
});

const { NextResponse } = require("next/server");

afterAll(() => {
  process.env = originalEnv;
});

describe("/api/auth/google-sign-in", () => {
  beforeEach(() => {
    NextResponse.redirect.mockClear();
    jest.clearAllMocks();
  });

  describe("正常系", () => {
    it("Cognitoの認証URLにリダイレクトされる", async () => {
      const mockResponse = {
        status: 307,
        headers: new Map([["location", ""]]),
      };
      mockResponse.headers.set = jest.fn();

      NextResponse.redirect.mockReturnValue(mockResponse);

      await GET();

      // 期待されるURLパラメータを構築
      const expectedParams = new URLSearchParams({
        response_type: "code",
        client_id: "test-client-id",
        redirect_uri: "https://test-app.com/api/auth/google-callback",
        state: "test-state-value",
        identity_provider: "Google",
        scope: "profile email openid",
      });

      const expectedUrl = `https://test-domain.auth.region.amazoncognito.com/oauth2/authorize?${expectedParams.toString()}`;

      // NextResponse.redirectが正しいURLで呼ばれることを確認
      expect(NextResponse.redirect).toHaveBeenCalledWith(expectedUrl);
    });

    it("CORSヘッダーが正しく設定される", async () => {
      const mockResponse = {
        status: 307,
        headers: new Map([["location", ""]]),
      };
      mockResponse.headers.set = jest.fn();

      NextResponse.redirect.mockReturnValue(mockResponse);

      await GET();

      // CORSヘッダーが正しく設定されることを確認
      expect(mockResponse.headers.set).toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        "*"
      );
      expect(mockResponse.headers.set).toHaveBeenCalledWith(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
      );
      expect(mockResponse.headers.set).toHaveBeenCalledWith(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
    });
  });

  describe("URLパラメータの構築", () => {
    it("すべての必要なパラメータが含まれる", async () => {
      const mockResponse = {
        status: 307,
        headers: new Map([["location", ""]]),
      };
      mockResponse.headers.set = jest.fn();

      NextResponse.redirect.mockReturnValue(mockResponse);

      await GET();

      const redirectCall = NextResponse.redirect.mock.calls[0];
      const redirectUrl = redirectCall[0];
      const url = new URL(redirectUrl);

      // 各パラメータが正しく設定されていることを確認
      expect(url.searchParams.get("response_type")).toBe("code");
      expect(url.searchParams.get("client_id")).toBe("test-client-id");
      expect(url.searchParams.get("redirect_uri")).toBe(
        "https://test-app.com/api/auth/google-callback"
      );
      expect(url.searchParams.get("state")).toBe("test-state-value");
      expect(url.searchParams.get("identity_provider")).toBe("Google");
      expect(url.searchParams.get("scope")).toBe("profile email openid");
    });

    it("ベースURLが正しく構築される", async () => {
      const mockResponse = {
        status: 307,
        headers: new Map([["location", ""]]),
      };
      mockResponse.headers.set = jest.fn();

      NextResponse.redirect.mockReturnValue(mockResponse);

      await GET();

      const redirectCall = NextResponse.redirect.mock.calls[0];
      const redirectUrl = redirectCall[0];
      const url = new URL(redirectUrl);

      expect(url.origin).toBe(
        "https://test-domain.auth.region.amazoncognito.com"
      );
      expect(url.pathname).toBe("/oauth2/authorize");
    });
  });

  describe("環境変数", () => {
    it("環境変数が正しく使用される", async () => {
      const mockResponse = {
        status: 307,
        headers: new Map([["location", ""]]),
      };
      mockResponse.headers.set = jest.fn();

      NextResponse.redirect.mockReturnValue(mockResponse);

      await GET();

      const redirectCall = NextResponse.redirect.mock.calls[0];
      const redirectUrl = redirectCall[0];

      // 環境変数で設定した値が使用されていることを確認
      expect(redirectUrl).toContain(
        "test-domain.auth.region.amazoncognito.com"
      );
      expect(redirectUrl).toContain("client_id=test-client-id");
      expect(redirectUrl).toContain(
        "redirect_uri=https%3A%2F%2Ftest-app.com%2Fapi%2Fauth%2Fgoogle-callback"
      );
      expect(redirectUrl).toContain("state=test-state-value");
    });
  });

  describe("レスポンス", () => {
    it("リダイレクトレスポンスが返される", async () => {
      const mockResponse = {
        status: 307,
        headers: new Map([["location", ""]]),
      };
      mockResponse.headers.set = jest.fn();

      NextResponse.redirect.mockReturnValue(mockResponse);

      const result = await GET();

      // レスポンスオブジェクトが返されることを確認
      expect(result).toBeDefined();
      expect(result.headers.set).toHaveBeenCalled();
    });

    it("正しい回数だけheaders.setが呼ばれる", async () => {
      const mockResponse = {
        status: 307,
        headers: new Map([["location", ""]]),
      };
      mockResponse.headers.set = jest.fn();

      NextResponse.redirect.mockReturnValue(mockResponse);

      await GET();

      // CORSヘッダー用に3回呼ばれることを確認
      expect(mockResponse.headers.set).toHaveBeenCalledTimes(3);
    });
  });
});
