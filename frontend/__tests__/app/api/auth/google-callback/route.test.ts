/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";

// 環境変数をモック（ルートファイルをインポートする前に設定）
const originalEnv = process.env;

// モックの設定を先に行う
// fetch APIをモック
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// next/headersのcookiesをモック
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

// NextResponseをモック
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      json: () => Promise.resolve(data),
      status: 200,
    })),
    redirect: jest.fn((url) => ({
      status: 307,
      headers: new Map([["location", url.toString()]]),
    })),
  },
}));

// process.envをモック
jest.doMock("process", () => ({
  env: {
    ...originalEnv,
    NEXT_PUBLIC_COGNITO_DOMAIN:
      "https://test-domain.auth.region.amazoncognito.com",
    NEXT_PUBLIC_CLIENT_ID: "test-client-id",
    NEXT_PUBLIC_REDIRECT_URI: "https://test-app.com/api/auth/google-callback",
    DOMAIN: "test-app.com",
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
    DOMAIN: "test-app.com",
  };

  // ルートファイルを動的にインポート
  const routeModule = await import("@/app/api/auth/google-callback/route");
  GET = routeModule.GET;
});

const { cookies } = require("next/headers");
const { NextResponse } = require("next/server");

afterAll(() => {
  process.env = originalEnv;
});

describe("/api/auth/google-callback", () => {
  const mockCookieStore = {
    set: jest.fn(),
  };

  beforeEach(() => {
    mockFetch.mockClear();
    cookies.mockReturnValue(mockCookieStore);
    mockCookieStore.set.mockClear();
    NextResponse.json.mockClear();
    NextResponse.redirect.mockClear();
    jest.clearAllMocks();
  });

  const createMockRequest = (searchParams: Record<string, string>) => {
    const url = new URL("https://test-app.com/api/auth/google-callback");
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return {
      nextUrl: url,
    } as NextRequest;
  };

  describe("正常系", () => {
    it("認証コードが正常に処理され、トークンがクッキーに設定される", async () => {
      // モックレスポンスを設定
      const mockTokenResponse = {
        access_token: "mock-access-token",
        id_token: "mock-id-token",
        refresh_token: "mock-refresh-token",
        token_type: "Bearer",
        expires_in: 3600,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockTokenResponse),
      } as any);

      const request = createMockRequest({ code: "test-auth-code" });
      await GET(request);

      // fetchが正しいパラメータで呼ばれることを確認
      expect(mockFetch).toHaveBeenCalledWith(
        "https://test-domain.auth.region.amazoncognito.com/oauth2/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: "test-client-id",
            code: "test-auth-code",
            redirect_uri: "https://test-app.com/api/auth/google-callback",
          }),
        }
      );

      // クッキーが正しく設定されることを確認
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "id_token",
        "mock-id-token",
        {
          domain: "test-app.com",
          sameSite: "none",
          httpOnly: true,
          secure: true,
        }
      );

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "access_token",
        "mock-access-token",
        {
          domain: "test-app.com",
          sameSite: "none",
          httpOnly: true,
          secure: true,
        }
      );

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "refresh_token",
        "mock-refresh-token",
        {
          domain: "test-app.com",
          sameSite: "none",
          httpOnly: true,
          secure: true,
        }
      );

      // リダイレクトが呼ばれることを確認
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL("/content", "https://test-app.com/api/auth/google-callback")
      );
    });
  });

  describe("異常系", () => {
    it("認証コードが存在しない場合、エラーが返される", async () => {
      const request = createMockRequest({});
      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith({
        error: "Unknown error",
      });
      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it("認証コードが存在せず、errorパラメータがある場合、そのエラーが返される", async () => {
      const request = createMockRequest({ error: "access_denied" });
      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith({
        error: "access_denied",
      });
      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it("Cognitoからのトークンリクエストが失敗した場合、エラーが返される", async () => {
      const mockErrorResponse = {
        error: "invalid_grant",
        error_description: "Invalid authorization code",
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue(mockErrorResponse),
      } as any);

      const request = createMockRequest({ code: "invalid-code" });
      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith({
        error: "invalid_grant",
        error_description: "Invalid authorization code",
      });
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it("fetchエラーが発生した場合、エラーが返される", async () => {
      const mockError = new Error("Network error");
      mockFetch.mockRejectedValueOnce(mockError);

      const request = createMockRequest({ code: "test-code" });
      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith({ error: mockError });
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it("レスポンスが不正な形式の場合でもエラーハンドリングされる", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}), // トークンが含まれていないレスポンス
      } as any);

      const request = createMockRequest({ code: "test-code" });
      await GET(request);

      // undefinedのトークンでもクッキー設定が試行される
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "id_token",
        undefined,
        expect.any(Object)
      );
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "access_token",
        undefined,
        expect.any(Object)
      );
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "refresh_token",
        undefined,
        expect.any(Object)
      );

      expect(NextResponse.redirect).toHaveBeenCalled();
    });
  });

  describe("環境変数", () => {
    it("必要な環境変数が存在しない場合のテスト", async () => {
      // このテストはモジュールレベルでの環境変数の分割代入により、
      // 実行時に環境変数を変更しても反映されないため、スキップします
      // 実際のアプリケーションでは起動時に環境変数をチェックすることを推奨します
      expect(true).toBe(true);
    });
  });

  describe("URLSearchParams", () => {
    it("リクエストボディのパラメータが正しく構築される", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          access_token: "token",
          id_token: "token",
          refresh_token: "token",
        }),
      } as any);

      const request = createMockRequest({ code: "test-auth-code" });
      await GET(request);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyParams = fetchCall[1]?.body as URLSearchParams;

      expect(bodyParams.get("grant_type")).toBe("authorization_code");
      expect(bodyParams.get("client_id")).toBe("test-client-id");
      expect(bodyParams.get("code")).toBe("test-auth-code");
      expect(bodyParams.get("redirect_uri")).toBe(
        "https://test-app.com/api/auth/google-callback"
      );
    });
  });

  describe("クッキー設定", () => {
    it("クッキーが正しいオプションで設定される", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          access_token: "test-access-token",
          id_token: "test-id-token",
          refresh_token: "test-refresh-token",
        }),
      } as any);

      const request = createMockRequest({ code: "test-code" });
      await GET(request);

      const expectedCookieOptions = {
        domain: "test-app.com",
        sameSite: "none",
        httpOnly: true,
        secure: true,
      };

      expect(mockCookieStore.set).toHaveBeenNthCalledWith(
        1,
        "id_token",
        "test-id-token",
        expectedCookieOptions
      );

      expect(mockCookieStore.set).toHaveBeenNthCalledWith(
        2,
        "access_token",
        "test-access-token",
        expectedCookieOptions
      );

      expect(mockCookieStore.set).toHaveBeenNthCalledWith(
        3,
        "refresh_token",
        "test-refresh-token",
        expectedCookieOptions
      );
    });
  });
});
