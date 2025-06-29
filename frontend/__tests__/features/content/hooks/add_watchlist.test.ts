import { renderHook, act } from "@testing-library/react";
import { useAddWatchList } from "@/features/content/hooks/add_watchlist";
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

describe("useAddWatchList", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllMocks();
  });

  const mockWatchlist: WatchlistDataType = {
    type: "movie",
    title: "テスト映画",
    date: "2025-06-28",
    notes: "テストノート",
    link: "https://example.com",
  };

  it("初期状態が正しく設定されている", () => {
    const { result } = renderHook(() => useAddWatchList());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.addWatchlist).toBe("function");
  });

  it("ウォッチリストの追加に成功した場合", async () => {
    // モックレスポンスを設定
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response);

    const { result } = renderHook(() => useAddWatchList());

    let addResult;
    await act(async () => {
      addResult = await result.current.addWatchlist(mockWatchlist);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 呼び出し引数を取得して検証
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/content/addWatchlist");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(options?.credentials).toBe("include");

    // bodyをパースして検証
    const requestBody = JSON.parse(options?.body as string);
    expect(requestBody).toEqual({
      ...mockWatchlist,
      contentId: expect.any(String),
      status: "to_watch",
    });

    // 結果が正しいかチェック
    expect(addResult).toEqual({ success: true });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("ウォッチリストの追加に失敗した場合（レスポンスエラー）", async () => {
    // モックレスポンスを設定（エラー）
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response);

    const { result } = renderHook(() => useAddWatchList());

    let addResult;
    await act(async () => {
      addResult = await result.current.addWatchlist(mockWatchlist);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー結果が正しいかチェック
    expect(addResult).toEqual({
      success: false,
      message: "Failed to add watchlist: Bad Request",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Failed to add watchlist: Bad Request");
  });

  it("ネットワークエラーの場合", async () => {
    // ネットワークエラーをシミュレート
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAddWatchList());

    let addResult;
    await act(async () => {
      addResult = await result.current.addWatchlist(mockWatchlist);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー結果が正しいかチェック
    expect(addResult).toEqual({
      success: false,
      message: "Network error",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Network error");
  });

  it("未知のエラーの場合", async () => {
    // 未知のエラーをシミュレート
    mockFetch.mockRejectedValueOnce("Unknown error");

    const { result } = renderHook(() => useAddWatchList());

    let addResult;
    await act(async () => {
      addResult = await result.current.addWatchlist(mockWatchlist);
    });

    // エラー結果が正しいかチェック
    expect(addResult).toEqual({
      success: false,
      message: "An unknown error occurred",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("An unknown error occurred");
  });

  it("contentIdとstatusが自動設定される", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response);

    const { result } = renderHook(() => useAddWatchList());

    const watchlistWithoutIdAndStatus = {
      type: "book" as const,
      title: "テスト本",
      notes: "読みたい本",
    };

    await act(async () => {
      await result.current.addWatchlist(watchlistWithoutIdAndStatus);
    });

    // contentIdとstatusが追加されていることを確認
    const [, options] = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(options?.body as string);
    expect(requestBody.contentId).toBeDefined();
    expect(typeof requestBody.contentId).toBe("string");
    expect(requestBody.status).toBe("to_watch");
  });

  it("ローディング状態が正しく管理される", async () => {
    // 遅延レスポンスをシミュレート
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(delayedPromise as Promise<Response>);

    const { result } = renderHook(() => useAddWatchList());

    // 初期状態でloadingがfalse
    expect(result.current.loading).toBe(false);

    // addWatchlistを呼び出し
    act(() => {
      result.current.addWatchlist(mockWatchlist);
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
    const { result } = renderHook(() => useAddWatchList());

    // 最初の呼び出しでエラー
    mockFetch.mockRejectedValueOnce(new Error("First error"));
    await act(async () => {
      await result.current.addWatchlist(mockWatchlist);
    });

    expect(result.current.error).toBe("First error");

    // 2回目の呼び出しで成功
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response);

    await act(async () => {
      await result.current.addWatchlist(mockWatchlist);
    });

    // エラーがクリアされることを確認
    expect(result.current.error).toBe(null);
  });

  it("既存のstatusが上書きされる", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response);

    const { result } = renderHook(() => useAddWatchList());

    const watchlistWithExistingStatus = {
      ...mockWatchlist,
      status: "completed", // 既存のstatus
    };

    await act(async () => {
      await result.current.addWatchlist(watchlistWithExistingStatus);
    });

    // statusが"to_watch"に上書きされていることを確認
    const [, options] = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(options?.body as string);
    expect(requestBody.status).toBe("to_watch");
  });
});
