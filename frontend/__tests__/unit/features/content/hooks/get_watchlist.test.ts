import { renderHook, act } from "@testing-library/react";
import { useGetWatchlist } from "@/features/content/hooks/get_watchlist";
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

describe("useGetWatchlist", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllMocks();
  });

  const mockWatchlistData: WatchlistDataType[] = [
    {
      contentId: "1",
      type: "movie",
      title: "観たい映画1",
      date: "2025-06-28",
      notes: "面白そうな映画",
      link: "https://example.com/movie1",
      status: "to_watch",
    },
    {
      contentId: "2",
      type: "book",
      title: "読みたい本1",
      notes: "評判の良い本",
      link: "https://example.com/book1",
      status: "to_watch",
    },
    {
      contentId: "3",
      type: "blog",
      title: "チェックしたいブログ",
      link: "https://example.com/blog1",
      status: "to_watch",
    },
  ];

  it("初期状態が正しく設定されている", () => {
    const { result } = renderHook(() => useGetWatchlist());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.fetchWatchlist).toBe("function");
  });

  it("ウォッチリストの取得に成功した場合", async () => {
    // モックレスポンスを設定
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockWatchlistData),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetWatchlist());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchWatchlist();
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 呼び出し引数を取得して検証
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/content/watchlist");
    expect(options?.method).toBe("GET");
    expect(options?.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(options?.credentials).toBe("include");

    // JSONレスポンスの解析が呼ばれたかチェック
    expect(mockResponse.json).toHaveBeenCalledTimes(1);

    // 結果が正しいかチェック
    expect(fetchResult).toEqual(mockWatchlistData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("空のウォッチリストでも正常に処理される", async () => {
    // 空の配列をレスポンスとして設定
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue([]),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetWatchlist());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchWatchlist();
    });

    // 空の配列が返されることを確認
    expect(fetchResult).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("ウォッチリストの取得に失敗した場合（レスポンスエラー）", async () => {
    // モックレスポンスを設定（エラー）
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    const { result } = renderHook(() => useGetWatchlist());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchWatchlist();
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー時に空配列が返されることを確認
    expect(fetchResult).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      "Error fetching watchlist contents: Not Found"
    );
  });

  it("JSONパースエラーの場合", async () => {
    // JSONパースエラーをシミュレート
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetWatchlist());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchWatchlist();
    });

    // エラー時に空配列が返されることを確認
    expect(fetchResult).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Invalid JSON");
  });

  it("ネットワークエラーの場合", async () => {
    // ネットワークエラーをシミュレート
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useGetWatchlist());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchWatchlist();
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー時に空配列が返されることを確認
    expect(fetchResult).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Network error");
  });

  it("異なるステータスコードでも適切なエラーメッセージが返される", async () => {
    const { result } = renderHook(() => useGetWatchlist());

    // 500 Internal Server Errorの場合
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchWatchlist();
    });

    expect(fetchResult).toEqual([]);
    expect(result.current.error).toBe(
      "Error fetching watchlist contents: Internal Server Error"
    );
  });

  it("ローディング状態が正しく管理される", async () => {
    // 遅延レスポンスをシミュレート
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(delayedPromise as Promise<Response>);

    const { result } = renderHook(() => useGetWatchlist());

    // 初期状態でloadingがfalse
    expect(result.current.loading).toBe(false);

    // fetchWatchlistを呼び出し
    act(() => {
      result.current.fetchWatchlist();
    });

    // loadingがtrueになることを確認
    expect(result.current.loading).toBe(true);

    // レスポンスを解決
    await act(async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        json: jest.fn().mockResolvedValue(mockWatchlistData),
      } as unknown as Response;

      resolvePromise!(mockResponse);
    });

    // loadingがfalseに戻ることを確認
    expect(result.current.loading).toBe(false);
  });

  it("複数回の呼び出しでエラー状態がリセットされる", async () => {
    const { result } = renderHook(() => useGetWatchlist());

    // 最初の呼び出しでエラー
    mockFetch.mockRejectedValueOnce(new Error("First error"));
    await act(async () => {
      await result.current.fetchWatchlist();
    });

    expect(result.current.error).toBe("First error");

    // 2回目の呼び出しで成功
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockWatchlistData),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    await act(async () => {
      await result.current.fetchWatchlist();
    });

    // エラーがクリアされることを確認
    expect(result.current.error).toBe(null);
  });

  it("エラー時でもローディング状態が適切に終了する", async () => {
    const { result } = renderHook(() => useGetWatchlist());

    // エラーを発生させる
    mockFetch.mockRejectedValueOnce(new Error("Test error"));

    await act(async () => {
      await result.current.fetchWatchlist();
    });

    // エラー後でもloadingがfalseになることを確認
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Test error");
  });

  it("レスポンスエラー時でもローディング状態が適切に終了する", async () => {
    const { result } = renderHook(() => useGetWatchlist());

    // レスポンスエラーを発生させる
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: "Forbidden",
    } as Response);

    await act(async () => {
      await result.current.fetchWatchlist();
    });

    // エラー後でもloadingがfalseになることを確認
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      "Error fetching watchlist contents: Forbidden"
    );
  });

  it("単一アイテムのウォッチリストでも正常に処理される", async () => {
    const singleItem: WatchlistDataType[] = [
      {
        contentId: "single",
        type: "movie",
        title: "単一の映画",
        status: "to_watch",
      },
    ];

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(singleItem),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetWatchlist());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchWatchlist();
    });

    expect(fetchResult).toEqual(singleItem);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("非配列のレスポンスでも正常に処理される", async () => {
    // オブジェクトが返される場合
    const mockObject = { message: "No watchlist found" };

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockObject),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetWatchlist());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchWatchlist();
    });

    // 非配列のレスポンスもそのまま返される
    expect(fetchResult).toEqual(mockObject);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });
});
