import { renderHook, act } from "@testing-library/react";
import { useEditContent } from "@/features/content/hooks/edit_content";
import {
  RegisterContentDataType,
  ContentDataType,
} from "@/features/content/types/content_type";

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

describe("useEditContent", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllMocks();
  });

  const mockContent: RegisterContentDataType = {
    contentId: "12345",
    type: "movie",
    title: "編集するテスト映画",
    date: "2025-06-28",
    notes: "編集されたテストノート",
    link: "https://example.com",
    status: "completed",
  };

  const mockResponseContent: ContentDataType = {
    contentId: "12345",
    type: "movie",
    title: "編集するテスト映画",
    date: "2025-06-28",
    notes: "編集されたテストノート",
    link: "https://example.com",
    year: 2025,
    rank: 1,
    isBest: true,
  };

  it("初期状態が正しく設定されている", () => {
    const { result } = renderHook(() => useEditContent());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.editContent).toBe("function");
  });

  it("コンテンツの編集に成功した場合", async () => {
    // モックレスポンスを設定
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockResponseContent),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useEditContent());

    let editResult;
    await act(async () => {
      editResult = await result.current.editContent(mockContent);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 呼び出し引数を取得して検証
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/content/edit");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(options?.credentials).toBe("include");

    // bodyをパースして検証
    const requestBody = JSON.parse(options?.body as string);
    expect(requestBody).toEqual(mockContent);

    // JSONレスポンスの解析が呼ばれたかチェック
    expect(mockResponse.json).toHaveBeenCalledTimes(1);

    // 結果が正しいかチェック
    expect(editResult).toEqual({
      success: true,
      content: mockResponseContent,
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("コンテンツの編集に失敗した場合（レスポンスエラー）", async () => {
    // モックレスポンスを設定（エラー）
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response);

    const { result } = renderHook(() => useEditContent());

    let editResult;
    await act(async () => {
      editResult = await result.current.editContent(mockContent);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー結果が正しいかチェック
    expect(editResult).toEqual({
      success: false,
      message: "Failed to edit content: Bad Request",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Failed to edit content: Bad Request");
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

    const { result } = renderHook(() => useEditContent());

    let editResult;
    await act(async () => {
      editResult = await result.current.editContent(mockContent);
    });

    // エラー結果が正しいかチェック
    expect(editResult).toEqual({
      success: false,
      message: "Invalid JSON",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Invalid JSON");
  });

  it("ネットワークエラーの場合", async () => {
    // ネットワークエラーをシミュレート
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useEditContent());

    let editResult;
    await act(async () => {
      editResult = await result.current.editContent(mockContent);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー結果が正しいかチェック
    expect(editResult).toEqual({
      success: false,
      message: "Network error",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Network error");
  });

  it("未知のエラーの場合", async () => {
    // 未知のエラーをシミュレート
    mockFetch.mockRejectedValueOnce("Unknown error");

    const { result } = renderHook(() => useEditContent());

    let editResult;
    await act(async () => {
      editResult = await result.current.editContent(mockContent);
    });

    // エラー結果が正しいかチェック
    expect(editResult).toEqual({
      success: false,
      message: "An unknown error occurred",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("An unknown error occurred");
  });

  it("必須項目のみでも編集できる", async () => {
    const mockMinimalResponse = {
      contentId: "67890",
      type: "book",
      title: "編集されたテスト本",
      date: "2025-06-28",
      year: 2025,
    };

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockMinimalResponse),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useEditContent());

    const minimalContent = {
      contentId: "67890",
      type: "book" as const,
      title: "編集されたテスト本",
      date: "2025-06-28",
    };

    let editResult;
    await act(async () => {
      editResult = await result.current.editContent(minimalContent);
    });

    // リクエストボディが正しいことを確認
    const [, options] = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(options?.body as string);
    expect(requestBody).toEqual(minimalContent);

    // 結果が正しいかチェック
    expect(editResult).toEqual({
      success: true,
      content: mockMinimalResponse,
    });
  });

  it("ローディング状態が正しく管理される", async () => {
    // 遅延レスポンスをシミュレート
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(delayedPromise as Promise<Response>);

    const { result } = renderHook(() => useEditContent());

    // 初期状態でloadingがfalse
    expect(result.current.loading).toBe(false);

    // editContentを呼び出し
    act(() => {
      result.current.editContent(mockContent);
    });

    // loadingがtrueになることを確認
    expect(result.current.loading).toBe(true);

    // レスポンスを解決
    await act(async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        json: jest.fn().mockResolvedValue(mockResponseContent),
      } as unknown as Response;

      resolvePromise!(mockResponse);
    });

    // loadingがfalseに戻ることを確認
    expect(result.current.loading).toBe(false);
  });

  it("複数回の呼び出しでエラー状態がリセットされる", async () => {
    const { result } = renderHook(() => useEditContent());

    // 最初の呼び出しでエラー
    mockFetch.mockRejectedValueOnce(new Error("First error"));
    await act(async () => {
      await result.current.editContent(mockContent);
    });

    expect(result.current.error).toBe("First error");

    // 2回目の呼び出しで成功
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockResponseContent),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    await act(async () => {
      await result.current.editContent(mockContent);
    });

    // エラーがクリアされることを確認
    expect(result.current.error).toBe(null);
  });

  it("異なるステータスコードでも適切なエラーメッセージが返される", async () => {
    const { result } = renderHook(() => useEditContent());

    // 404 Not Foundの場合
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    let editResult;
    await act(async () => {
      editResult = await result.current.editContent(mockContent);
    });

    expect(editResult).toEqual({
      success: false,
      message: "Failed to edit content: Not Found",
    });
    expect(result.current.error).toBe("Failed to edit content: Not Found");
  });

  it("空のJSONレスポンスでも正常に処理される", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useEditContent());

    let editResult;
    await act(async () => {
      editResult = await result.current.editContent(mockContent);
    });

    // 空のオブジェクトでも成功として処理される
    expect(editResult).toEqual({
      success: true,
      content: {},
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });
});
