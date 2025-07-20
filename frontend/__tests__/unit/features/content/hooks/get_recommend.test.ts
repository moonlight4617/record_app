import { renderHook, act } from "@testing-library/react";
import { useGetRecommend } from "@/features/content/hooks/get_recommend";
import {
  ContentType,
  RecommendContentsType,
} from "@/features/content/types/content_type";

// fetch APIをモック
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// console.logをモック
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

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

describe("useGetRecommend", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllMocks();
  });

  const mockRecommendations: RecommendContentsType[] = [
    {
      type: "movie",
      title: "おすすめ映画1",
      desc: "素晴らしい映画です",
      link: "https://example.com/movie1",
    },
    {
      type: "movie",
      title: "おすすめ映画2",
      desc: "感動的な映画です",
      link: "https://example.com/movie2",
    },
  ];

  const mockApiResponse = {
    recommendations: JSON.stringify({
      recommendations: mockRecommendations,
    }),
  };

  it("初期状態が正しく設定されている", () => {
    const { result } = renderHook(() => useGetRecommend());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.getRecommend).toBe("function");
  });

  it("レコメンドの取得に成功した場合", async () => {
    // モックレスポンスを設定
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockApiResponse),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetRecommend());

    let recommendResult;
    await act(async () => {
      recommendResult = await result.current.getRecommend("movie");
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 呼び出し引数を取得して検証
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(
      "http://localhost:8080/content/recommend?content_type=movie"
    );
    expect(options?.method).toBe("GET");
    expect(options?.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(options?.credentials).toBe("include");

    // JSONレスポンスの解析が呼ばれたかチェック
    expect(mockResponse.json).toHaveBeenCalledTimes(1);

    // 結果が正しいかチェック
    expect(recommendResult).toEqual(mockRecommendations);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("bookタイプでレコメンドの取得に成功した場合", async () => {
    const bookRecommendations: RecommendContentsType[] = [
      {
        type: "book",
        title: "おすすめ本1",
        desc: "面白い本です",
        link: "https://example.com/book1",
      },
    ];

    const mockBookResponse = {
      recommendations: JSON.stringify({
        recommendations: bookRecommendations,
      }),
    };

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockBookResponse),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetRecommend());

    let recommendResult;
    await act(async () => {
      recommendResult = await result.current.getRecommend("book");
    });

    // URLのクエリパラメータが正しいかチェック
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe(
      "http://localhost:8080/content/recommend?content_type=book"
    );

    // 結果が正しいかチェック
    expect(recommendResult).toEqual(bookRecommendations);
  });

  it("blogタイプでレコメンドの取得に成功した場合", async () => {
    const blogRecommendations: RecommendContentsType[] = [
      {
        type: "blog",
        title: "おすすめブログ1",
        desc: "有益な情報です",
        link: "https://example.com/blog1",
      },
    ];

    const mockBlogResponse = {
      recommendations: JSON.stringify({
        recommendations: blogRecommendations,
      }),
    };

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockBlogResponse),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetRecommend());

    let recommendResult;
    await act(async () => {
      recommendResult = await result.current.getRecommend("blog");
    });

    // URLのクエリパラメータが正しいかチェック
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe(
      "http://localhost:8080/content/recommend?content_type=blog"
    );

    // 結果が正しいかチェック
    expect(recommendResult).toEqual(blogRecommendations);
  });

  it("レコメンドの取得に失敗した場合（レスポンスエラー）", async () => {
    // モックレスポンスを設定（エラー）
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    const { result } = renderHook(() => useGetRecommend());

    let recommendResult;
    await act(async () => {
      recommendResult = await result.current.getRecommend("movie");
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー結果が正しいかチェック
    expect(recommendResult).toEqual({
      success: false,
      message: "Failed to get recommend: Internal Server Error",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      "Failed to get recommend: Internal Server Error"
    );
  });

  it("JSONパースエラーの場合（最初のresponse.json()）", async () => {
    // JSONパースエラーをシミュレート
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetRecommend());

    let recommendResult;
    await act(async () => {
      recommendResult = await result.current.getRecommend("movie");
    });

    // エラー結果が正しいかチェック
    expect(recommendResult).toEqual({
      success: false,
      message: "Invalid JSON",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Invalid JSON");
  });

  it("JSONパースエラーの場合（二重目のJSON.parse()）", async () => {
    // 無効なJSONを含むレスポンス
    const mockInvalidJsonResponse = {
      recommendations: "invalid json string",
    };

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockInvalidJsonResponse),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetRecommend());

    let recommendResult;
    await act(async () => {
      recommendResult = await result.current.getRecommend("movie");
    });

    // エラー結果が正しいかチェック
    expect(recommendResult).toEqual({
      success: false,
      message: expect.stringContaining("Unexpected token"),
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toContain("Unexpected token");
  });

  it("ネットワークエラーの場合", async () => {
    // ネットワークエラーをシミュレート
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useGetRecommend());

    let recommendResult;
    await act(async () => {
      recommendResult = await result.current.getRecommend("movie");
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー結果が正しいかチェック
    expect(recommendResult).toEqual({
      success: false,
      message: "Network error",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Network error");
  });

  it("未知のエラーの場合", async () => {
    // 未知のエラーをシミュレート
    mockFetch.mockRejectedValueOnce("Unknown error");

    const { result } = renderHook(() => useGetRecommend());

    let recommendResult;
    await act(async () => {
      recommendResult = await result.current.getRecommend("movie");
    });

    // エラー結果が正しいかチェック
    expect(recommendResult).toEqual({
      success: false,
      message: "An unknown error occurred",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("An unknown error occurred");
  });

  it("空のレコメンドリストでも正常に処理される", async () => {
    const mockEmptyResponse = {
      recommendations: JSON.stringify({
        recommendations: [],
      }),
    };

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockEmptyResponse),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetRecommend());

    let recommendResult;
    await act(async () => {
      recommendResult = await result.current.getRecommend("movie");
    });

    // 空の配列が返されることを確認
    expect(recommendResult).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("ローディング状態が正しく管理される", async () => {
    // 遅延レスポンスをシミュレート
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(delayedPromise as Promise<Response>);

    const { result } = renderHook(() => useGetRecommend());

    // 初期状態でloadingがfalse
    expect(result.current.loading).toBe(false);

    // getRecommendを呼び出し
    act(() => {
      result.current.getRecommend("movie");
    });

    // loadingがtrueになることを確認
    expect(result.current.loading).toBe(true);

    // レスポンスを解決
    await act(async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        json: jest.fn().mockResolvedValue(mockApiResponse),
      } as unknown as Response;

      resolvePromise!(mockResponse);
    });

    // loadingがfalseに戻ることを確認
    expect(result.current.loading).toBe(false);
  });

  it("複数回の呼び出しでエラー状態がリセットされる", async () => {
    const { result } = renderHook(() => useGetRecommend());

    // 最初の呼び出しでエラー
    mockFetch.mockRejectedValueOnce(new Error("First error"));
    await act(async () => {
      await result.current.getRecommend("movie");
    });

    expect(result.current.error).toBe("First error");

    // 2回目の呼び出しで成功
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockApiResponse),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    await act(async () => {
      await result.current.getRecommend("movie");
    });

    // エラーがクリアされることを確認
    expect(result.current.error).toBe(null);
  });

  it("recommendationsプロパティが存在しない場合", async () => {
    const mockMalformedResponse = {
      recommendations: JSON.stringify({
        // recommendationsプロパティがない
        data: mockRecommendations,
      }),
    };

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockMalformedResponse),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useGetRecommend());

    let recommendResult;
    await act(async () => {
      recommendResult = await result.current.getRecommend("movie");
    });

    // undefinedが返されることを確認
    expect(recommendResult).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });
});
