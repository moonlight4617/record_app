import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InputContentArea } from "@/features/content/components/input_content_area";
import { RegisterContentDataType } from "@/features/content/types/content_type";
import { placeholders } from "@/features/content/constants/placeholders";

// UIコンポーネントのモック
jest.mock("@/components/ui/input", () => ({
  Input: ({
    id,
    name,
    placeholder,
    type,
    value,
    onChange,
  }: {
    id?: string;
    name?: string;
    placeholder?: string;
    type?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <input
      id={id}
      name={name}
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={onChange}
      data-testid={`input-${name || id}`}
    />
  ),
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({
    id,
    name,
    placeholder,
    value,
    onChange,
  }: {
    id?: string;
    name?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  }) => (
    <textarea
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data-testid={`textarea-${name || id}`}
    />
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({
    htmlFor,
    children,
  }: {
    htmlFor?: string;
    children: React.ReactNode;
  }) => (
    <label htmlFor={htmlFor} data-testid={`label-${htmlFor}`}>
      {children}
    </label>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({
    name,
    value,
    setValue,
    children,
  }: {
    name?: string;
    value?: string;
    setValue?: (value: string | undefined) => void;
    children: React.ReactNode;
  }) => (
    <select
      name={name}
      value={value}
      onChange={(e) => setValue?.(e.target.value)}
      data-testid={`select-${name}`}
    >
      {children}
    </select>
  ),
}));

jest.mock("@/features/content/constants/placeholders", () => ({
  placeholders: {
    TITLE: "対象のタイトルを入力",
    NOTES: "何かひとこと",
    LINK: "リンク添付する場合は入力",
  },
}));

describe("InputContentArea", () => {
  const mockContent: RegisterContentDataType = {
    contentId: "1",
    type: "movie",
    title: "テスト映画",
    date: "2024-01-10",
    notes: "素晴らしい映画でした",
    link: "https://example.com/movie",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("基本的な表示", () => {
    it("すべての必要なフィールドが表示される", () => {
      render(<InputContentArea />);

      // ラベルの確認
      expect(screen.getByTestId("label-type")).toHaveTextContent("種類");
      expect(screen.getByTestId("label-title")).toHaveTextContent("タイトル");
      expect(screen.getByTestId("label-date")).toHaveTextContent("日付");
      expect(screen.getByTestId("label-notes")).toHaveTextContent("メモ");
      expect(screen.getByTestId("label-link")).toHaveTextContent("リンク");

      // 入力フィールドの確認
      expect(screen.getByTestId("select-type")).toBeInTheDocument();
      expect(screen.getByTestId("input-title")).toBeInTheDocument();
      expect(screen.getByTestId("input-date")).toBeInTheDocument();
      expect(screen.getByTestId("textarea-notes")).toBeInTheDocument();
      expect(screen.getByTestId("input-link")).toBeInTheDocument();
    });

    it("セレクトボックスに正しいオプションが表示される", () => {
      render(<InputContentArea />);

      const selectElement = screen.getByTestId("select-type");
      expect(selectElement).toBeInTheDocument();

      // オプションが存在することを確認
      expect(screen.getByText("映画")).toBeInTheDocument();
      expect(screen.getByText("書籍")).toBeInTheDocument();
      expect(screen.getByText("ブログ")).toBeInTheDocument();
    });

    it("プレースホルダーが正しく設定される", () => {
      render(<InputContentArea />);

      expect(screen.getByTestId("input-title")).toHaveAttribute(
        "placeholder",
        placeholders.TITLE
      );
      expect(screen.getByTestId("textarea-notes")).toHaveAttribute(
        "placeholder",
        placeholders.NOTES
      );
      expect(screen.getByTestId("input-link")).toHaveAttribute(
        "placeholder",
        placeholders.LINK
      );
    });

    it("日付フィールドが日付タイプとして設定される", () => {
      render(<InputContentArea />);

      expect(screen.getByTestId("input-date")).toHaveAttribute("type", "date");
    });
  });

  describe("初期値の設定", () => {
    it("contentが渡された場合に初期値が設定される", () => {
      render(<InputContentArea content={mockContent} />);

      expect(screen.getByTestId("select-type")).toHaveValue("movie");
      expect(screen.getByTestId("input-title")).toHaveValue("テスト映画");
      expect(screen.getByTestId("input-date")).toHaveValue("2024-01-10");
      expect(screen.getByTestId("textarea-notes")).toHaveValue(
        "素晴らしい映画でした"
      );
      expect(screen.getByTestId("input-link")).toHaveValue(
        "https://example.com/movie"
      );
    });
    it("contentが渡されない場合に今日の日付が設定される", () => {
      render(<InputContentArea />);

      // 実際に設定された値を取得して確認
      const dateInput = screen.getByTestId("input-date");
      const actualValue = dateInput.getAttribute("value");

      // 日付形式（YYYY-MM-DD）が設定されていることを確認
      expect(actualValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // 設定された日付が現在の日付に近い（テスト実行日から数日以内）ことを確認
      const actualDate = new Date(actualValue!);
      const today = new Date();
      const diffInDays = Math.abs(
        (today.getTime() - actualDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(diffInDays).toBeLessThan(2); // 2日以内の差であることを確認
    });

    it("contentでnotesとlinkが未定義の場合は空文字が設定される", () => {
      const contentWithoutOptionalFields: RegisterContentDataType = {
        type: "book",
        title: "テスト本",
        date: "2024-01-01",
      };

      render(<InputContentArea content={contentWithoutOptionalFields} />);

      expect(screen.getByTestId("textarea-notes")).toHaveValue("");
      expect(screen.getByTestId("input-link")).toHaveValue("");
    });
  });

  describe("watchlistモード", () => {
    it("isWatchListがtrueの場合、日付とメモフィールドが表示されない", () => {
      render(<InputContentArea isWatchList={true} />);

      expect(screen.queryByTestId("label-date")).not.toBeInTheDocument();
      expect(screen.queryByTestId("input-date")).not.toBeInTheDocument();
      expect(screen.queryByTestId("label-notes")).not.toBeInTheDocument();
      expect(screen.queryByTestId("textarea-notes")).not.toBeInTheDocument();

      // 他のフィールドは表示される
      expect(screen.getByTestId("label-type")).toBeInTheDocument();
      expect(screen.getByTestId("label-title")).toBeInTheDocument();
      expect(screen.getByTestId("label-link")).toBeInTheDocument();
    });

    it("isWatchListがfalseの場合、すべてのフィールドが表示される", () => {
      render(<InputContentArea isWatchList={false} />);

      expect(screen.getByTestId("label-date")).toBeInTheDocument();
      expect(screen.getByTestId("input-date")).toBeInTheDocument();
      expect(screen.getByTestId("label-notes")).toBeInTheDocument();
      expect(screen.getByTestId("textarea-notes")).toBeInTheDocument();
    });
  });

  describe("ユーザー操作", () => {
    it("種類の選択ができる", () => {
      render(<InputContentArea />);

      const selectElement = screen.getByTestId("select-type");
      fireEvent.change(selectElement, { target: { value: "book" } });

      expect(selectElement).toHaveValue("book");
    });

    it("タイトルの入力ができる", () => {
      render(<InputContentArea />);

      const titleInput = screen.getByTestId("input-title");
      fireEvent.change(titleInput, { target: { value: "新しいタイトル" } });

      expect(titleInput).toHaveValue("新しいタイトル");
    });

    it("日付の入力ができる", () => {
      render(<InputContentArea />);

      const dateInput = screen.getByTestId("input-date");
      fireEvent.change(dateInput, { target: { value: "2024-12-25" } });

      expect(dateInput).toHaveValue("2024-12-25");
    });

    it("メモの入力ができる", () => {
      render(<InputContentArea />);

      const notesTextarea = screen.getByTestId("textarea-notes");
      fireEvent.change(notesTextarea, {
        target: { value: "新しいメモ" },
      });

      expect(notesTextarea).toHaveValue("新しいメモ");
    });

    it("リンクの入力ができる", () => {
      render(<InputContentArea />);

      const linkInput = screen.getByTestId("input-link");
      fireEvent.change(linkInput, {
        target: { value: "https://new-link.com" },
      });

      expect(linkInput).toHaveValue("https://new-link.com");
    });
  });

  describe("フォームの統合テスト", () => {
    it("複数フィールドの同時操作ができる", () => {
      render(<InputContentArea />);

      // 複数フィールドを操作
      fireEvent.change(screen.getByTestId("select-type"), {
        target: { value: "blog" },
      });
      fireEvent.change(screen.getByTestId("input-title"), {
        target: { value: "テストブログ" },
      });
      fireEvent.change(screen.getByTestId("input-date"), {
        target: { value: "2024-03-15" },
      });
      fireEvent.change(screen.getByTestId("textarea-notes"), {
        target: { value: "ブログのメモ" },
      });
      fireEvent.change(screen.getByTestId("input-link"), {
        target: { value: "https://blog.example.com" },
      });

      // すべての値が正しく設定されていることを確認
      expect(screen.getByTestId("select-type")).toHaveValue("blog");
      expect(screen.getByTestId("input-title")).toHaveValue("テストブログ");
      expect(screen.getByTestId("input-date")).toHaveValue("2024-03-15");
      expect(screen.getByTestId("textarea-notes")).toHaveValue("ブログのメモ");
      expect(screen.getByTestId("input-link")).toHaveValue(
        "https://blog.example.com"
      );
    });

    it("contentとユーザー操作の組み合わせが正しく動作する", () => {
      render(<InputContentArea content={mockContent} />);

      // 初期値が設定されていることを確認
      expect(screen.getByTestId("input-title")).toHaveValue("テスト映画");

      // ユーザーが値を変更
      fireEvent.change(screen.getByTestId("input-title"), {
        target: { value: "変更されたタイトル" },
      });

      // 変更された値が反映されていることを確認
      expect(screen.getByTestId("input-title")).toHaveValue(
        "変更されたタイトル"
      );
    });
  });

  describe("エッジケース", () => {
    it("空の文字列で入力をクリアできる", () => {
      render(<InputContentArea content={mockContent} />);

      const titleInput = screen.getByTestId("input-title");

      // 初期値があることを確認
      expect(titleInput).toHaveValue("テスト映画");

      // 空文字で値をクリア
      fireEvent.change(titleInput, { target: { value: "" } });

      expect(titleInput).toHaveValue("");
    });

    it("contentの型が異なる場合でも正しく表示される", () => {
      const bookContent: RegisterContentDataType = {
        type: "book",
        title: "プログラミング本",
        date: "2024-02-20",
        notes: "とても勉強になった",
        link: "https://book.example.com",
      };

      render(<InputContentArea content={bookContent} />);

      expect(screen.getByTestId("select-type")).toHaveValue("book");
      expect(screen.getByTestId("input-title")).toHaveValue("プログラミング本");
    });
  });

  describe("アクセシビリティ", () => {
    it("ラベルとフォームフィールドが正しく関連付けられている", () => {
      render(<InputContentArea />);

      expect(screen.getByTestId("label-type")).toHaveAttribute("for", "type");
      expect(screen.getByTestId("label-title")).toHaveAttribute("for", "title");
      expect(screen.getByTestId("label-date")).toHaveAttribute("for", "date");
      expect(screen.getByTestId("label-notes")).toHaveAttribute("for", "notes");
      expect(screen.getByTestId("label-link")).toHaveAttribute("for", "link");
    });

    it("フォームフィールドに適切なname属性が設定されている", () => {
      render(<InputContentArea />);

      expect(screen.getByTestId("select-type")).toHaveAttribute("name", "type");
      expect(screen.getByTestId("input-title")).toHaveAttribute(
        "name",
        "title"
      );
      expect(screen.getByTestId("input-date")).toHaveAttribute("name", "date");
      expect(screen.getByTestId("textarea-notes")).toHaveAttribute(
        "name",
        "notes"
      );
      expect(screen.getByTestId("input-link")).toHaveAttribute("name", "link");
    });
  });
});
