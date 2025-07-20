import { render, screen, fireEvent } from "@testing-library/react";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

describe("Textarea", () => {
  describe("レンダリング", () => {
    it("デフォルトのTextareaが正常にレンダリングされる", () => {
      render(<Textarea />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("デフォルトのスタイルクラスが適用される", () => {
      render(<Textarea />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass(
        "border",
        "border-gray-300",
        "rounded",
        "p-2",
        "w-full"
      );
    });

    it("カスタムクラスが追加で適用される", () => {
      render(<Textarea className="custom-class" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass(
        "border",
        "border-gray-300",
        "rounded",
        "p-2",
        "w-full",
        "custom-class"
      );
    });
  });

  describe("基本属性", () => {
    it("placeholderが正常に設定される", () => {
      const placeholderText = "テキストを入力してください";
      render(<Textarea placeholder={placeholderText} />);

      const textarea = screen.getByPlaceholderText(placeholderText);
      expect(textarea).toBeInTheDocument();
    });

    it("valueが正常に設定される", () => {
      const testValue = "テストテキスト";
      render(<Textarea value={testValue} onChange={() => {}} />);

      const textarea = screen.getByDisplayValue(testValue);
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue(testValue);
    });

    it("defaultValueが正常に設定される", () => {
      const defaultText = "デフォルトテキスト";
      render(<Textarea defaultValue={defaultText} />);

      const textarea = screen.getByDisplayValue(defaultText);
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue(defaultText);
    });

    it("nameプロパティが正常に設定される", () => {
      render(<Textarea name="test-textarea" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("name", "test-textarea");
    });

    it("idプロパティが正常に設定される", () => {
      render(<Textarea id="test-id" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("id", "test-id");
    });

    it("disabledプロパティが正常に設定される", () => {
      render(<Textarea disabled />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeDisabled();
    });

    it("readOnlyプロパティが正常に設定される", () => {
      render(<Textarea readOnly value="読み取り専用テキスト" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("readonly");
      expect(textarea).toHaveValue("読み取り専用テキスト");
    });

    it("requiredプロパティが正常に設定される", () => {
      render(<Textarea required />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeRequired();
    });
  });

  describe("サイズとレイアウト", () => {
    it("rowsプロパティが正常に設定される", () => {
      render(<Textarea rows={5} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("rows", "5");
    });

    it("colsプロパティが正常に設定される", () => {
      render(<Textarea cols={40} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("cols", "40");
    });

    it("maxLengthプロパティが正常に設定される", () => {
      render(<Textarea maxLength={100} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("maxlength", "100");
    });
  });

  describe("イベントハンドリング", () => {
    it("onChangeイベントが正常に動作する", () => {
      const handleChange = jest.fn();
      render(<Textarea onChange={handleChange} />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "新しいテキスト" } });

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: "新しいテキスト",
          }),
        })
      );
    });

    it("onFocusイベントが正常に動作する", () => {
      const handleFocus = jest.fn();
      render(<Textarea onFocus={handleFocus} />);

      const textarea = screen.getByRole("textbox");
      fireEvent.focus(textarea);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it("onBlurイベントが正常に動作する", () => {
      const handleBlur = jest.fn();
      render(<Textarea onBlur={handleBlur} />);

      const textarea = screen.getByRole("textbox");
      fireEvent.focus(textarea);
      fireEvent.blur(textarea);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it("onKeyDownイベントが正常に動作する", () => {
      const handleKeyDown = jest.fn();
      render(<Textarea onKeyDown={handleKeyDown} />);

      const textarea = screen.getByRole("textbox");
      fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "Enter",
        })
      );
    });

    it("複数文字の入力が正常に動作する", () => {
      const handleChange = jest.fn();
      render(<Textarea onChange={handleChange} />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, {
        target: { value: "複数行の\nテキストを\n入力します" },
      });

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: "複数行の\nテキストを\n入力します",
          }),
        })
      );
    });
  });

  describe("アクセシビリティ", () => {
    it("aria-labelプロパティが正常に設定される", () => {
      render(<Textarea aria-label="コメント入力エリア" />);

      const textarea = screen.getByLabelText("コメント入力エリア");
      expect(textarea).toBeInTheDocument();
    });

    it("aria-describedbyプロパティが正常に設定される", () => {
      render(<Textarea aria-describedby="textarea-help" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-describedby", "textarea-help");
    });

    it("aria-invalidプロパティが正常に設定される", () => {
      render(<Textarea aria-invalid={true} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("制御されたコンポーネント", () => {
    it("制御されたコンポーネントとして正常に動作する", () => {
      const TestControlledTextarea = () => {
        const [value, setValue] = React.useState("初期値");

        return (
          <div>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              data-testid="controlled-textarea"
            />
            <span data-testid="current-value">{value}</span>
          </div>
        );
      };

      render(<TestControlledTextarea />);

      const textarea = screen.getByTestId("controlled-textarea");
      const valueDisplay = screen.getByTestId("current-value");

      expect(textarea).toHaveValue("初期値");
      expect(valueDisplay).toHaveTextContent("初期値");

      fireEvent.change(textarea, { target: { value: "変更後の値" } });

      expect(textarea).toHaveValue("変更後の値");
      expect(valueDisplay).toHaveTextContent("変更後の値");
    });
  });

  describe("非制御コンポーネント", () => {
    it("非制御コンポーネントとして正常に動作する", () => {
      render(<Textarea defaultValue="デフォルト値" />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("デフォルト値");

      fireEvent.change(textarea, { target: { value: "新しい値" } });
      expect(textarea).toHaveValue("新しい値");
    });
  });

  describe("複合属性とエッジケース", () => {
    it("複数の属性を同時に設定できる", () => {
      render(
        <Textarea
          placeholder="プレースホルダー"
          rows={3}
          cols={50}
          maxLength={200}
          required
          name="test-textarea"
          id="textarea-id"
          className="custom-textarea"
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("placeholder", "プレースホルダー");
      expect(textarea).toHaveAttribute("rows", "3");
      expect(textarea).toHaveAttribute("cols", "50");
      expect(textarea).toHaveAttribute("maxlength", "200");
      expect(textarea).toBeRequired();
      expect(textarea).toHaveAttribute("name", "test-textarea");
      expect(textarea).toHaveAttribute("id", "textarea-id");
      expect(textarea).toHaveClass("custom-textarea");
    });

    it("空のvalueでも正常に動作する", () => {
      render(<Textarea value="" onChange={() => {}} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("");
    });

    it("長いテキストでも正常に動作する", () => {
      const longText = "あ".repeat(1000);
      const handleChange = jest.fn();
      render(<Textarea onChange={handleChange} />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: longText } });

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: longText,
          }),
        })
      );
    });

    it("特殊文字を含むテキストでも正常に動作する", () => {
      const specialText = "特殊文字: !@#$%^&*()_+{}|:<>?[]\\;',./`~";
      const handleChange = jest.fn();
      render(<Textarea onChange={handleChange} />);

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: specialText } });

      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: specialText,
          }),
        })
      );
    });
  });

  describe("フォーム統合", () => {
    it("フォーム送信時に値が正常に取得される", () => {
      const handleSubmit = jest.fn((e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        return formData.get("textarea-field");
      });

      render(
        <form onSubmit={handleSubmit}>
          <Textarea name="textarea-field" defaultValue="フォームテスト" />
          <button type="submit">送信</button>
        </form>
      );

      const submitButton = screen.getByText("送信");
      fireEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
