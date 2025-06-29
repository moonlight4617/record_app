import { renderHook, act } from "@testing-library/react";
import { useDeleteWatchList } from "@/features/content/hooks/delete_watchlist";
import { WatchlistDataType } from "@/features/content/types/content_type";

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

describe("useDeleteWatchList", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllMocks();
  });

  const mockWatchlist: WatchlistDataType = {
    contentId: "12345",
    type: "movie",
    title: "削除するテスト映画",
    date: "2025-06-28",
    notes: "テストノート",
    link: "https://example.com",
    status: "to_watch",
  };

  it("初期状態が正しく設定されている", () => {
    const { result } = renderHook(() => useDeleteWatchList());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.deleteWatchlist).toBe("function");
  });

  it("ウォッチリストの削除に成功した場合", async () => {
    // モックレスポンスを設定
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response);

    const { result } = renderHook(() => useDeleteWatchList());

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteWatchlist(mockWatchlist);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 呼び出し引数を取得して検証
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/content/deleteWatchlist");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(options?.credentials).toBe("include");

    // bodyをパースして検証
    const requestBody = JSON.parse(options?.body as string);
    expect(requestBody).toEqual(mockWatchlist);

    // 結果が正しいかチェック
    expect(deleteResult).toEqual({ success: true });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("ウォッチリストの削除に失敗した場合（レスポンスエラー）", async () => {
    // モックレスポンスを設定（エラー）
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    const { result } = renderHook(() => useDeleteWatchList());

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteWatchlist(mockWatchlist);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー結果が正しいかチェック
    expect(deleteResult).toEqual({
      success: false,
      message: "Failed to delete watchlist: Not Found",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Failed to delete watchlist: Not Found");
  });

  it("ネットワークエラーの場合", async () => {
    // ネットワークエラーをシミュレート
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useDeleteWatchList());

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteWatchlist(mockWatchlist);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー結果が正しいかチェック
    expect(deleteResult).toEqual({
      success: false,
      message: "Network error",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Network error");
  });

  it("未知のエラーの場合", async () => {
    // 未知のエラーをシミュレート
    mockFetch.mockRejectedValueOnce("Unknown error");

    const { result } = renderHook(() => useDeleteWatchList());

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteWatchlist(mockWatchlist);
    });

    // エラー結果が正しいかチェック
    expect(deleteResult).toEqual({
      success: false,
      message: "An unknown error occurred",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("An unknown error occurred");
  });

  it("必須項目のみでも削除できる", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response);

    const { result } = renderHook(() => useDeleteWatchList());

    const minimalWatchlist = {
      type: "book" as const,
      title: "削除するテスト本",
    };

    await act(async () => {
      await result.current.deleteWatchlist(minimalWatchlist);
    });

    // リクエストボディが正しいことを確認
    const [, options] = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(options?.body as string);
    expect(requestBody).toEqual(minimalWatchlist);
  });

  it("ローディング状態が正しく管理される", async () => {
    // 遅延レスポンスをシミュレート
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(delayedPromise as Promise<Response>);

    const { result } = renderHook(() => useDeleteWatchList());

    // 初期状態でloadingがfalse
    expect(result.current.loading).toBe(false);

    // deleteWatchlistを呼び出し
    act(() => {
      result.current.deleteWatchlist(mockWatchlist);
    });

    // loadingがtrueになることを確認
    expect(result.current.loading).toBe(true);

    // レスポンスを解決
    await act(async () => {
      resolvePromise!({
        ok: true,
        status: 200,
        statusText: "OK",
      });
    });

    // loadingがfalseに戻ることを確認
    expect(result.current.loading).toBe(false);
  });

  it("複数回の呼び出しでエラー状態がリセットされる", async () => {
    const { result } = renderHook(() => useDeleteWatchList());

    // 最初の呼び出しでエラー
    mockFetch.mockRejectedValueOnce(new Error("First error"));
    await act(async () => {
      await result.current.deleteWatchlist(mockWatchlist);
    });

    expect(result.current.error).toBe("First error");

    // 2回目の呼び出しで成功
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response);

    await act(async () => {
      await result.current.deleteWatchlist(mockWatchlist);
    });

    // エラーがクリアされることを確認
    expect(result.current.error).toBe(null);
  });

  it("異なるステータスコードでも適切なエラーメッセージが返される", async () => {
    const { result } = renderHook(() => useDeleteWatchList());

    // 403 Forbiddenの場合
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: "Forbidden",
    } as Response);

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteWatchlist(mockWatchlist);
    });

    expect(deleteResult).toEqual({
      success: false,
      message: "Failed to delete watchlist: Forbidden",
    });
    expect(result.current.error).toBe("Failed to delete watchlist: Forbidden");
  });

  it("空のオブジェクトでも削除リクエストが送信される", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response);

    const { result } = renderHook(() => useDeleteWatchList());

    const emptyWatchlist = {
      type: "movie" as const,
      title: "",
    };

    await act(async () => {
      await result.current.deleteWatchlist(emptyWatchlist);
    });

    // リクエストが送信されることを確認
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, options] = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(options?.body as string);
    expect(requestBody).toEqual(emptyWatchlist);
  });
});
