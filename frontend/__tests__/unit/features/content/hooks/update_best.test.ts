import { renderHook, waitFor, act } from "@testing-library/react";
import { useUpdateBest } from "@/features/content/hooks/update_best";
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

describe("useUpdateBest", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllMocks();
  });

  const mockContentData: ContentDataType[] = [
    {
      contentId: "1",
      type: "movie",
      title: "Test Movie 1",
      date: "2024-01-01",
      notes: "Test notes 1",
      link: "https://example.com/1",
      year: 2024,
      rank: 1,
      isBest: true,
    },
    {
      contentId: "2",
      type: "book",
      title: "Test Book 1",
      date: "2024-01-02",
      notes: "Test notes 2",
      link: "https://example.com/2",
      year: 2024,
      rank: 2,
      isBest: true,
    },
  ];

  it("初期状態が正しく設定されている", () => {
    const { result } = renderHook(() => useUpdateBest());

    // 初期状態の確認
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.updateBest).toBe("function");
  });

  it("ベストコンテンツの更新に成功した場合", async () => {
    // モックレスポンスを設定
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUpdateBest());

    let updateResult: any;
    await act(async () => {
      updateResult = await result.current.updateBest(mockContentData);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 呼び出し引数を取得して検証
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/content/update-best");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(options?.credentials).toBe("include");
    expect(options?.body).toBe(JSON.stringify(mockContentData));

    // 結果が正しいかチェック
    expect(updateResult).toEqual({ success: true });

    // ローディング状態が適切に管理されているかチェック
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("空の配列でもベストコンテンツの更新に成功した場合", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUpdateBest());

    let updateResult: any;
    await act(async () => {
      updateResult = await result.current.updateBest([]);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 空の配列が正しく送信されているかチェック
    const [, options] = mockFetch.mock.calls[0];
    expect(options?.body).toBe(JSON.stringify([]));

    // 結果が正しいかチェック
    expect(updateResult).toEqual({ success: true });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("更新中のローディング状態が正しく管理される", async () => {
    // 遅延レスポンスをシミュレート
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(delayedPromise as Promise<Response>);

    const { result } = renderHook(() => useUpdateBest());

    // 更新を開始
    let updatePromise: Promise<any>;
    act(() => {
      updatePromise = result.current.updateBest(mockContentData);
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
      await updatePromise!;
    });

    // ローディング状態がfalseに戻ることを確認
    expect(result.current.loading).toBe(false);
  });

  it("レスポンスエラーの場合", async () => {
    // モックレスポンスを設定（エラー）
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response);

    const { result } = renderHook(() => useUpdateBest());

    let updateResult: any;
    await act(async () => {
      updateResult = await result.current.updateBest(mockContentData);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー結果の確認
    expect(updateResult).toEqual({
      success: false,
      message: "Failed to add content: Bad Request",
    });

    // エラー状態の確認
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Failed to add content: Bad Request");
  });

  it("ネットワークエラーの場合", async () => {
    // ネットワークエラーをシミュレート
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useUpdateBest());

    let updateResult: any;
    await act(async () => {
      updateResult = await result.current.updateBest(mockContentData);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー結果の確認
    expect(updateResult).toEqual({
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

    const { result } = renderHook(() => useUpdateBest());

    let updateResult: any;
    await act(async () => {
      updateResult = await result.current.updateBest(mockContentData);
    });

    // エラー結果の確認
    expect(updateResult).toEqual({
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

    const { result } = renderHook(() => useUpdateBest());

    let updateResult: any;
    await act(async () => {
      updateResult = await result.current.updateBest(mockContentData);
    });

    expect(updateResult).toEqual({
      success: false,
      message: "Failed to add content: Internal Server Error",
    });
    expect(result.current.error).toBe(
      "Failed to add content: Internal Server Error"
    );
  });

  it("複数回更新を実行しても正常に動作する", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response;

    mockFetch.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUpdateBest());

    // 1回目の更新
    let updateResult1: any;
    await act(async () => {
      updateResult1 = await result.current.updateBest(mockContentData);
    });

    expect(updateResult1).toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 2回目の更新（異なるデータ）
    const secondData = [mockContentData[0]];
    let updateResult2: any;
    await act(async () => {
      updateResult2 = await result.current.updateBest(secondData);
    });

    expect(updateResult2).toEqual({ success: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // 両方とも成功していることを確認
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    // 2回目の呼び出しで正しいデータが送信されているかチェック
    const [, secondOptions] = mockFetch.mock.calls[1];
    expect(secondOptions?.body).toBe(JSON.stringify(secondData));
  });

  it("エラー後に再度更新を実行すると状態がリセットされる", async () => {
    // 最初はエラーを返す
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response);

    const { result } = renderHook(() => useUpdateBest());

    // 1回目の更新（エラー）
    let updateResult1: any;
    await act(async () => {
      updateResult1 = await result.current.updateBest(mockContentData);
    });

    expect(updateResult1.success).toBe(false);
    expect(result.current.error).toBe("Failed to add content: Bad Request");

    // 2回目は成功するように設定
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response);

    // 2回目の更新（成功）
    let updateResult2: any;
    await act(async () => {
      updateResult2 = await result.current.updateBest(mockContentData);
    });

    expect(updateResult2).toEqual({ success: true });
    expect(result.current.error).toBe(null); // エラー状態がリセットされている
    expect(result.current.loading).toBe(false);
  });

  it("大量のコンテンツデータでも正常に処理される", async () => {
    // 大量のデータを生成
    const largeContentData: ContentDataType[] = Array.from(
      { length: 100 },
      (_, i) => ({
        contentId: `${i + 1}`,
        type: "movie" as const,
        title: `Test Movie ${i + 1}`,
        date: `2024-01-${String(i + 1).padStart(2, "0")}`,
        notes: `Test notes ${i + 1}`,
        link: `https://example.com/${i + 1}`,
        year: 2024,
        rank: i + 1,
        isBest: true,
      })
    );

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUpdateBest());

    let updateResult: any;
    await act(async () => {
      updateResult = await result.current.updateBest(largeContentData);
    });

    // 結果が正しいかチェック
    expect(updateResult).toEqual({ success: true });

    // 大量のデータが正しく送信されているかチェック
    const [, options] = mockFetch.mock.calls[0];
    expect(JSON.parse(options?.body as string)).toHaveLength(100);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("異なるコンテンツタイプが混在していても正常に処理される", async () => {
    const mixedContentData: ContentDataType[] = [
      {
        contentId: "1",
        type: "movie",
        title: "Test Movie",
        date: "2024-01-01",
        year: 2024,
        rank: 1,
        isBest: true,
      },
      {
        contentId: "2",
        type: "book",
        title: "Test Book",
        date: "2024-01-02",
        year: 2024,
        rank: 2,
        isBest: true,
      },
      {
        contentId: "3",
        type: "blog",
        title: "Test Blog",
        date: "2024-01-03",
        year: 2024,
        rank: 3,
        isBest: true,
      },
    ];

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUpdateBest());

    let updateResult: any;
    await act(async () => {
      updateResult = await result.current.updateBest(mixedContentData);
    });

    expect(updateResult).toEqual({ success: true });

    // 混在データが正しく送信されているかチェック
    const [, options] = mockFetch.mock.calls[0];
    const sentData = JSON.parse(options?.body as string);
    expect(sentData).toHaveLength(3);
    expect(sentData[0].type).toBe("movie");
    expect(sentData[1].type).toBe("book");
    expect(sentData[2].type).toBe("blog");
  });

  it("必須フィールドのみのコンテンツでも正常に処理される", async () => {
    const minimalContentData: ContentDataType[] = [
      {
        type: "movie",
        title: "Minimal Movie",
        date: "2024-01-01",
      },
    ];

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUpdateBest());

    let updateResult: any;
    await act(async () => {
      updateResult = await result.current.updateBest(minimalContentData);
    });

    expect(updateResult).toEqual({ success: true });

    // 最小限のデータが正しく送信されているかチェック
    const [, options] = mockFetch.mock.calls[0];
    const sentData = JSON.parse(options?.body as string);
    expect(sentData[0]).toEqual({
      type: "movie",
      title: "Minimal Movie",
      date: "2024-01-01",
    });
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

    const { result } = renderHook(() => useUpdateBest());

    let updateResult: any;
    await act(async () => {
      updateResult = await result.current.updateBest(mockContentData);
    });

    // undefinedでもAPIが呼ばれることを確認
    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("undefined/content/update-best");
    expect(updateResult).toEqual({ success: true });

    // 環境変数を復元
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  });

  it("更新成功時にはerrorステートがクリアされる", async () => {
    // 最初にエラーを設定
    mockFetch.mockRejectedValueOnce(new Error("Initial error"));

    const { result } = renderHook(() => useUpdateBest());

    // エラーが発生
    await act(async () => {
      await result.current.updateBest(mockContentData);
    });

    expect(result.current.error).toBe("Initial error");

    // 次は成功させる
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
    } as Response);

    // 成功時にエラーがクリアされることを確認
    let updateResult: any;
    await act(async () => {
      updateResult = await result.current.updateBest(mockContentData);
    });

    expect(updateResult).toEqual({ success: true });
    expect(result.current.error).toBe(null); // エラーがクリアされている
  });
});
