import { renderHook, act } from "@testing-library/react";
import { useGetYearsBest } from "@/features/content/hooks/get_years_best";
import { ContentDataType } from "@/features/content/types/content_type";

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

describe("useGetYearsBest", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllMocks();
  });

  const mockYearsBestData: ContentDataType[] = [
    {
      contentId: "1",
      type: "movie",
      title: "2024年ベスト映画1",
      date: "2024-12-31",
      notes: "今年最高の映画",
      link: "https://example.com/movie1",
      year: 2024,
      rank: 1,
      isBest: true,
    },
    {
      contentId: "2",
      type: "book",
      title: "2024年ベスト本1",
      date: "2024-11-15",
      notes: "素晴らしい本",
      link: "https://example.com/book1",
      year: 2024,
      rank: 2,
      isBest: true,
    },
    {
      contentId: "3",
      type: "blog",
      title: "2024年ベストブログ1",
      date: "2024-10-20",
      link: "https://example.com/blog1",
      year: 2024,
      rank: 3,
      isBest: true,
    },
  ];

  it("初期状態が正しく設定されている", () => {
    const { result } = renderHook(() => useGetYearsBest());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.fetchYearsBest).toBe("function");
  });

  it("年間ベストコンテンツの取得に成功した場合", async () => {
    // モックレスポンスを設定
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockYearsBestData),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetYearsBest());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchYearsBest("2024");
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 呼び出し引数を取得して検証
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/content/best/year=2024");
    expect(options?.method).toBe("GET");
    expect(options?.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(options?.credentials).toBe("include");

    // JSONレスポンスの解析が呼ばれたかチェック
    expect(mockResponse.json).toHaveBeenCalledTimes(1);

    // 結果が正しいかチェック
    expect(fetchResult).toEqual(mockYearsBestData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("異なる年でも正しくリクエストされる", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue([]),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetYearsBest());

    await act(async () => {
      await result.current.fetchYearsBest("2023");
    });

    // URLに正しい年が含まれているかチェック
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/content/best/year=2023");
  });

  it("4桁以外の年でも正しく処理される", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue([]),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetYearsBest());

    await act(async () => {
      await result.current.fetchYearsBest("25");
    });

    // URLに渡された年がそのまま含まれているかチェック
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/content/best/year=25");
  });

  it("空の年間ベストでも正常に処理される", async () => {
    // 空の配列をレスポンスとして設定
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue([]),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetYearsBest());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchYearsBest("2024");
    });

    // 空の配列が返されることを確認
    expect(fetchResult).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("年間ベストの取得に失敗した場合（レスポンスエラー）", async () => {
    // モックレスポンスを設定（エラー）
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    const { result } = renderHook(() => useGetYearsBest());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchYearsBest("2024");
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー時に空配列が返されることを確認
    expect(fetchResult).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      "Error fetching year contents: Not Found"
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

    const { result } = renderHook(() => useGetYearsBest());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchYearsBest("2024");
    });

    // エラー時に空配列が返されることを確認
    expect(fetchResult).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Invalid JSON");
  });

  it("ネットワークエラーの場合", async () => {
    // ネットワークエラーをシミュレート
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useGetYearsBest());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchYearsBest("2024");
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー時に空配列が返されることを確認
    expect(fetchResult).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Network error");
  });

  it("異なるステータスコードでも適切なエラーメッセージが返される", async () => {
    const { result } = renderHook(() => useGetYearsBest());

    // 500 Internal Server Errorの場合
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchYearsBest("2024");
    });

    expect(fetchResult).toEqual([]);
    expect(result.current.error).toBe(
      "Error fetching year contents: Internal Server Error"
    );
  });

  it("ローディング状態が正しく管理される", async () => {
    // 遅延レスポンスをシミュレート
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(delayedPromise as Promise<Response>);

    const { result } = renderHook(() => useGetYearsBest());

    // 初期状態でloadingがfalse
    expect(result.current.loading).toBe(false);

    // fetchYearsBestを呼び出し
    act(() => {
      result.current.fetchYearsBest("2024");
    });

    // loadingがtrueになることを確認
    expect(result.current.loading).toBe(true);

    // レスポンスを解決
    await act(async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        json: jest.fn().mockResolvedValue(mockYearsBestData),
      } as unknown as Response;

      resolvePromise!(mockResponse);
    });

    // loadingがfalseに戻ることを確認
    expect(result.current.loading).toBe(false);
  });

  it("複数回の呼び出しでエラー状態がリセットされる", async () => {
    const { result } = renderHook(() => useGetYearsBest());

    // 最初の呼び出しでエラー
    mockFetch.mockRejectedValueOnce(new Error("First error"));
    await act(async () => {
      await result.current.fetchYearsBest("2024");
    });

    expect(result.current.error).toBe("First error");

    // 2回目の呼び出しで成功
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockYearsBestData),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    await act(async () => {
      await result.current.fetchYearsBest("2024");
    });

    // エラーがクリアされることを確認
    expect(result.current.error).toBe(null);
  });

  it("エラー時でもローディング状態が適切に終了する", async () => {
    const { result } = renderHook(() => useGetYearsBest());

    // エラーを発生させる
    mockFetch.mockRejectedValueOnce(new Error("Test error"));

    await act(async () => {
      await result.current.fetchYearsBest("2024");
    });

    // エラー後でもloadingがfalseになることを確認
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Test error");
  });

  it("レスポンスエラー時でもローディング状態が適切に終了する", async () => {
    const { result } = renderHook(() => useGetYearsBest());

    // レスポンスエラーを発生させる
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: "Forbidden",
    } as Response);

    await act(async () => {
      await result.current.fetchYearsBest("2024");
    });

    // エラー後でもloadingがfalseになることを確認
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      "Error fetching year contents: Forbidden"
    );
  });

  it("単一アイテムの年間ベストでも正常に処理される", async () => {
    const singleItem: ContentDataType[] = [
      {
        contentId: "single",
        type: "movie",
        title: "唯一のベスト映画",
        date: "2024-12-31",
        year: 2024,
        rank: 1,
        isBest: true,
      },
    ];

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(singleItem),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetYearsBest());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchYearsBest("2024");
    });

    expect(fetchResult).toEqual(singleItem);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("非配列のレスポンスでも正常に処理される", async () => {
    // オブジェクトが返される場合
    const mockObject = { message: "No best contents found for this year" };

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockObject),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetYearsBest());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchYearsBest("2024");
    });

    // 非配列のレスポンスもそのまま返される
    expect(fetchResult).toEqual(mockObject);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("空文字列の年でも処理される", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue([]),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetYearsBest());

    await act(async () => {
      await result.current.fetchYearsBest("");
    });

    // 空文字列でもURLに含まれる
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/content/best/year=");
  });

  it("現在の年での取得も正常に処理される", async () => {
    const currentYear = new Date().getFullYear().toString();

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue([]),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetYearsBest());

    await act(async () => {
      await result.current.fetchYearsBest(currentYear);
    });

    // 現在の年が正しくURLに含まれる
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe(`http://localhost:8080/content/best/year=${currentYear}`);
  });
});
