import { renderHook, waitFor, act } from "@testing-library/react";
import { useGetYears } from "@/features/content/hooks/get_years";

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

describe("useGetYears", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllMocks();
  });

  const mockYearsData = ["2024", "2023", "2022", "2021", "2020"];

  it("初期状態が正しく設定されている", async () => {
    // fetchを成功させるが、まだレスポンスを返さない状態
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockYearsData),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    let result: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result = hook.result;
    });

    // useEffectが完了するまで待つ
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 最終的な状態の確認
    expect(result.current.years).toEqual(mockYearsData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("マウント時に年一覧の取得に成功した場合", async () => {
    // モックレスポンスを設定
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockYearsData),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    let result: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result = hook.result;
    });

    // useEffectの実行を待つ
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 呼び出し引数を取得して検証
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8080/content/years");
    expect(options?.method).toBe("GET");
    expect(options?.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(options?.credentials).toBe("include");

    // JSONレスポンスの解析が呼ばれたかチェック
    expect(mockResponse.json).toHaveBeenCalledTimes(1);

    // 結果が正しいかチェック
    expect(result.current.years).toEqual(mockYearsData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("空の年一覧でも正常に処理される", async () => {
    // 空の配列をレスポンスとして設定
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue([]),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    let result: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result = hook.result;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 空の配列が設定されることを確認
    expect(result.current.years).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it("年一覧の取得に失敗した場合（レスポンスエラー）", async () => {
    // モックレスポンスを設定（エラー）
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    let result: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result = hook.result;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー状態の確認
    expect(result.current.years).toEqual([]); // 初期状態のまま
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      "Error fetching years: Internal Server Error"
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

    let result: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result = hook.result;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // エラー状態の確認
    expect(result.current.years).toEqual([]); // 初期状態のまま
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Invalid JSON");
  });

  it("ネットワークエラーの場合", async () => {
    // ネットワークエラーをシミュレート
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    let result: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result = hook.result;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // API呼び出しが正しく行われたかチェック
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // エラー状態の確認
    expect(result.current.years).toEqual([]); // 初期状態のまま
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Network error");
  });

  it("ローディング状態が正しく管理される", async () => {
    // 遅延レスポンスをシミュレート
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(delayedPromise as Promise<Response>);

    let result: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result = hook.result;
    });

    // useEffectが実行されてloadingがtrueになるまで待つ
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    // レスポンスを解決
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockYearsData),
    } as unknown as Response;

    await act(async () => {
      resolvePromise!(mockResponse);
    });

    // loadingがfalseに戻ることを確認
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.years).toEqual(mockYearsData);
    expect(result.current.error).toBe(null);
  });

  it("単一の年でも正常に処理される", async () => {
    const singleYear = ["2024"];

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(singleYear),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    let result: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result = hook.result;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.years).toEqual(singleYear);
    expect(result.current.error).toBe(null);
  });

  it("多数の年が返されても正常に処理される", async () => {
    const manyYears = Array.from({ length: 50 }, (_, i) =>
      (2024 - i).toString()
    );

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(manyYears),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    let result: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result = hook.result;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.years).toEqual(manyYears);
    expect(result.current.years).toHaveLength(50);
    expect(result.current.error).toBe(null);
  });

  it("異なるステータスコードでも適切なエラーメッセージが返される", async () => {
    // 404 Not Foundの場合
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    let result: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result = hook.result;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.years).toEqual([]);
    expect(result.current.error).toBe("Error fetching years: Not Found");
  });

  it("非配列のレスポンスでも正常に処理される", async () => {
    // オブジェクトが返される場合
    const mockObject = { message: "No years found" };

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockObject),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    let result: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result = hook.result;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 非配列のレスポンスもそのまま設定される
    expect(result.current.years).toEqual(mockObject);
    expect(result.current.error).toBe(null);
  });

  it("数値の年が文字列として処理される", async () => {
    // 数値の年が含まれている場合
    const mixedYears = ["2024", "2023", 2022, 2021]; // 意図的に数値を混在

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mixedYears),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    let result: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result = hook.result;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // APIから返されたデータがそのまま設定される
    expect(result.current.years).toEqual(mixedYears);
    expect(result.current.error).toBe(null);
  });

  it("並び順が保持される", async () => {
    const orderedYears = ["2020", "2021", "2022", "2023", "2024"]; // 昇順

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(orderedYears),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    let result: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result = hook.result;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 順序が保持されることを確認
    expect(result.current.years).toEqual(orderedYears);
    expect(result.current.years[0]).toBe("2020");
    expect(result.current.years[4]).toBe("2024");
  });

  it("重複する年が含まれていても正常に処理される", async () => {
    const duplicateYears = ["2024", "2023", "2024", "2022", "2023"];

    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(duplicateYears),
    } as unknown as Response;

    mockFetch.mockResolvedValueOnce(mockResponse);

    let result: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result = hook.result;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 重複も含めてそのまま設定される
    expect(result.current.years).toEqual(duplicateYears);
    expect(result.current.years).toHaveLength(5);
  });

  it("エラー後でもローディング状態が適切に終了する", async () => {
    // エラーを発生させる
    mockFetch.mockRejectedValueOnce(new Error("Test error"));

    let result: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result = hook.result;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // エラー後でもloadingがfalseになることを確認
    expect(result.current.loading).toBe(false);
    expect(result.current.years).toEqual([]);
    expect(result.current.error).toBe("Test error");
  });

  it("コンポーネントの再マウント時にも正常に動作する", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue(mockYearsData),
    } as unknown as Response;

    mockFetch.mockResolvedValue(mockResponse);

    // 最初のマウント
    let result1: any;
    let unmount: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result1 = hook.result;
      unmount = hook.unmount;
    });

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
    });

    expect(result1.current.years).toEqual(mockYearsData);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // アンマウント
    unmount();

    // 再マウント
    let result2: any;
    await act(async () => {
      const hook = renderHook(() => useGetYears());
      result2 = hook.result;
    });

    await waitFor(() => {
      expect(result2.current.loading).toBe(false);
    });

    // 再度API呼び出しが行われることを確認
    expect(result2.current.years).toEqual(mockYearsData);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
