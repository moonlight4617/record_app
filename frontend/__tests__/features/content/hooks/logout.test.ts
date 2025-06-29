import { renderHook, waitFor, act } from "@testing-library/react";
import { useLogout } from "@/features/content/hooks/logout";

// fetch APIをモック
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// 環境変数をモック
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_API_URL: "http://localhost:8080",
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe("useLogout", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllMocks();
  });

  it("初期状態が正しく設定されている", () => {
    const { result } = renderHook(() => useLogout());

    // 初期状態の確認
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.logout).toBe("function");
  });

  it("ログアウトに成功した場合", async () => {
    // モックレスポンスを設定
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useLogout());

    let logoutResult: any;
    await act(async () => {
      logoutResult = await result.current.logout();
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 呼び出し引数を取得して検証
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/account/logout");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(options?.credentials).toBe("include");

    // 結果が正しいかチェック
    expect(logoutResult).toEqual({ success: true });

    // ローディング状態が適切に管理されているかチェック
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("ログアウト中のローディング状態が正しく管理される", async () => {
    // 遅延レスポンスをシミュレート
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(delayedPromise as Promise<Response>);

    const { result } = renderHook(() => useLogout());

    // ログアウトを開始
    let logoutPromise: Promise<any>;
    act(() => {
      logoutPromise = result.current.logout();
    });

    // ローディング状態がtrueになることを確認
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    // レスポンスを解決
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response;

    await act(async () => {
      resolvePromise!(mockResponse);
      await logoutPromise!;
    });

    // ローディング状態がfalseに戻ることを確認
    expect(result.current.loading).toBe(false);
  });

  it("レスポンスエラーの場合", async () => {
    // モックレスポンスを設定（エラー）
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    } as Response);

    const { result } = renderHook(() => useLogout());

    let logoutResult: any;
    await act(async () => {
      logoutResult = await result.current.logout();
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー結果の確認
    expect(logoutResult).toEqual({
      success: false,
      message: "Failed to logout: Unauthorized",
    });

    // エラー状態の確認
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Failed to logout: Unauthorized");
  });

  it("ネットワークエラーの場合", async () => {
    // ネットワークエラーをシミュレート
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useLogout());

    let logoutResult: any;
    await act(async () => {
      logoutResult = await result.current.logout();
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー結果の確認
    expect(logoutResult).toEqual({
      success: false,
      message: "Network error",
    });

    // エラー状態の確認
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Network error");
  });

  it("不明なエラーの場合", async () => {
    // 文字列のエラーをシミュレート
    mockFetch.mockRejectedValueOnce("Unknown string error");

    const { result } = renderHook(() => useLogout());

    let logoutResult: any;
    await act(async () => {
      logoutResult = await result.current.logout();
    });

    // エラー結果の確認
    expect(logoutResult).toEqual({
      success: false,
      message: "An unknown error occurred",
    });

    // エラー状態の確認
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("An unknown error occurred");
  });

  it("nullエラーの場合", async () => {
    // nullエラーをシミュレート
    mockFetch.mockRejectedValueOnce(null);

    const { result } = renderHook(() => useLogout());

    let logoutResult: any;
    await act(async () => {
      logoutResult = await result.current.logout();
    });

    // エラー結果の確認
    expect(logoutResult).toEqual({
      success: false,
      message: "An unknown error occurred",
    });

    // エラー状態の確認
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("An unknown error occurred");
  });

  it("異なるHTTPステータスコードでも適切なエラーメッセージが返される", async () => {
    // 500 Internal Server Errorの場合
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    const { result } = renderHook(() => useLogout());

    let logoutResult: any;
    await act(async () => {
      logoutResult = await result.current.logout();
    });

    expect(logoutResult).toEqual({
      success: false,
      message: "Failed to logout: Internal Server Error",
    });
    expect(result.current.error).toBe(
      "Failed to logout: Internal Server Error"
    );
  });

  it("複数回ログアウトを実行しても正常に動作する", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response;

    mockFetch.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLogout());

    // 1回目のログアウト
    let logoutResult1: any;
    await act(async () => {
      logoutResult1 = await result.current.logout();
    });

    expect(logoutResult1).toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 2回目のログアウト
    let logoutResult2: any;
    await act(async () => {
      logoutResult2 = await result.current.logout();
    });

    expect(logoutResult2).toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // 両方とも成功していることを確認
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("エラー後に再度ログアウトを実行すると状態がリセットされる", async () => {
    // 最初はエラーを返す
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    } as Response);

    const { result } = renderHook(() => useLogout());

    // 1回目のログアウト（エラー）
    let logoutResult1: any;
    await act(async () => {
      logoutResult1 = await result.current.logout();
    });

    expect(logoutResult1.success).toBe(false);
    expect(result.current.error).toBe("Failed to logout: Unauthorized");

    // 2回目は成功するように設定
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response);

    // 2回目のログアウト（成功）
    let logoutResult2: any;
    await act(async () => {
      logoutResult2 = await result.current.logout();
    });

    expect(logoutResult2).toEqual({ success: true });
    expect(result.current.error).toBe(null); // エラー状態がリセットされている
    expect(result.current.loading).toBe(false);
  });

  it("ログアウト処理中に複数回呼び出しても適切に処理される", async () => {
    // 遅延レスポンスをシミュレート
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(delayedPromise as Promise<Response>);

    const { result } = renderHook(() => useLogout());

    // 1回目のログアウトを開始
    let logoutPromise1: Promise<any>;
    act(() => {
      logoutPromise1 = result.current.logout();
    });

    // ローディング状態を確認
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    // 2回目のログアウトを開始（1回目がまだ完了していない）
    let logoutPromise2: Promise<any>;
    act(() => {
      logoutPromise2 = result.current.logout();
    });

    // レスポンスを解決
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response;

    await act(async () => {
      resolvePromise!(mockResponse);
      await Promise.all([logoutPromise1!, logoutPromise2!]);
    });

    // 両方とも成功していることを確認
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    // APIは複数回呼ばれる可能性があることを確認
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("ログアウト成功時にはerrorステートがクリアされる", async () => {
    // 最初にエラーを設定
    mockFetch.mockRejectedValueOnce(new Error("Initial error"));

    const { result } = renderHook(() => useLogout());

    // エラーが発生
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.error).toBe("Initial error");

    // 次は成功させる
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response);

    // 成功時にエラーがクリアされることを確認
    let logoutResult: any;
    await act(async () => {
      logoutResult = await result.current.logout();
    });

    expect(logoutResult).toEqual({ success: true });
    expect(result.current.error).toBe(null); // エラーがクリアされている
  });

  it("環境変数が設定されていない場合でも動作する", async () => {
    // 一時的に環境変数を削除
    const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response);

    const { result } = renderHook(() => useLogout());

    let logoutResult: any;
    await act(async () => {
      logoutResult = await result.current.logout();
    });

    // undefinedでもAPIが呼ばれることを確認
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("undefined/account/logout");
    expect(logoutResult).toEqual({ success: true });

    // 環境変数を復元
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  });
});
