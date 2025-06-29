import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// テスト用のラッパーコンポーネント
const SelectTestWrapper = ({
  onValueChange,
  initialValue = "",
}: {
  onValueChange?: (value: string) => void;
  initialValue?: string;
}) => {
  const [value, setValue] = useState<string | undefined>(initialValue);

  return (
    <Select value={value} setValue={setValue} onValueChange={onValueChange}>
      <SelectItem value="">選択してください</SelectItem>
      <SelectItem value="2023">2023年</SelectItem>
      <SelectItem value="2024">2024年</SelectItem>
      <SelectItem value="2025">2025年</SelectItem>
    </Select>
  );
};

describe("Select Components", () => {
  describe("Select", () => {
    describe("レンダリング", () => {
      it("Selectコンポーネントが正常にレンダリングされる", () => {
        render(
          <Select>
            <SelectItem value="test">テスト項目</SelectItem>
          </Select>
        );

        const selectElement = screen.getByRole("combobox");
        expect(selectElement).toBeInTheDocument();
      });

      it("子要素のSelectItemが正常に表示される", () => {
        render(
          <Select>
            <SelectItem value="option1">オプション1</SelectItem>
            <SelectItem value="option2">オプション2</SelectItem>
          </Select>
        );

        expect(screen.getByDisplayValue("オプション1")).toBeInTheDocument();
        expect(screen.getByText("オプション2")).toBeInTheDocument();
      });

      it("name属性が正しく設定される", () => {
        render(
          <Select name="test-select">
            <SelectItem value="test">テスト</SelectItem>
          </Select>
        );

        const selectElement = screen.getByRole("combobox");
        expect(selectElement).toHaveAttribute("name", "test-select");
      });
    });

    describe("値の制御", () => {
      it("外部から渡されたvalueが正しく表示される", () => {
        render(
          <Select value="option1">
            <SelectItem value="option1">オプション1</SelectItem>
            <SelectItem value="option2">オプション2</SelectItem>
          </Select>
        );

        const selectElement = screen.getByRole("combobox") as HTMLSelectElement;
        expect(selectElement.value).toBe("option1");
      });

      it("内部状態で値が管理される", () => {
        render(<SelectTestWrapper />);

        const selectElement = screen.getByRole("combobox") as HTMLSelectElement;

        // 初期値は空文字列
        expect(selectElement.value).toBe("");

        // 値を変更
        fireEvent.change(selectElement, { target: { value: "2023" } });
        expect(selectElement.value).toBe("2023");
      });

      it("setValueコールバックが正しく呼ばれる", () => {
        const mockSetValue = jest.fn();

        render(
          <Select setValue={mockSetValue}>
            <SelectItem value="test1">テスト1</SelectItem>
            <SelectItem value="test2">テスト2</SelectItem>
          </Select>
        );

        const selectElement = screen.getByRole("combobox");
        fireEvent.change(selectElement, { target: { value: "test1" } });

        expect(mockSetValue).toHaveBeenCalledWith("test1");
      });

      it("onValueChangeコールバックが正しく呼ばれる", () => {
        const mockOnValueChange = jest.fn();

        render(<SelectTestWrapper onValueChange={mockOnValueChange} />);

        const selectElement = screen.getByRole("combobox");
        fireEvent.change(selectElement, { target: { value: "2024" } });

        expect(mockOnValueChange).toHaveBeenCalledWith("2024");
      });
    });

    describe("スタイリング", () => {
      it("正しいCSSクラスが適用される", () => {
        render(
          <Select>
            <SelectItem value="test">テスト</SelectItem>
          </Select>
        );

        const selectElement = screen.getByRole("combobox");
        expect(selectElement).toHaveClass(
          "border",
          "border-gray-300",
          "rounded",
          "p-2",
          "w-full",
          "text-left"
        );
      });

      it("コンテナにrelativeクラスが適用される", () => {
        const { container } = render(
          <Select>
            <SelectItem value="test">テスト</SelectItem>
          </Select>
        );

        const containerDiv = container.firstChild;
        expect(containerDiv).toHaveClass("relative");
      });
    });
  });

  describe("SelectTrigger", () => {
    describe("レンダリング", () => {
      it("SelectTriggerが正常にレンダリングされる", () => {
        const mockSetIsOpen = jest.fn();

        render(
          <SelectTrigger isOpen={false} setIsOpen={mockSetIsOpen}>
            <span>トリガーテキスト</span>
          </SelectTrigger>
        );

        const triggerButton = screen.getByRole("button");
        expect(triggerButton).toBeInTheDocument();
        expect(triggerButton).toHaveTextContent("トリガーテキスト");
      });

      it("子要素が正常に表示される", () => {
        const mockSetIsOpen = jest.fn();

        render(
          <SelectTrigger isOpen={false} setIsOpen={mockSetIsOpen}>
            <span>アイコン</span>
            <span>テキスト</span>
          </SelectTrigger>
        );

        expect(screen.getByText("アイコン")).toBeInTheDocument();
        expect(screen.getByText("テキスト")).toBeInTheDocument();
      });
    });

    describe("インタラクション", () => {
      it("クリック時にsetIsOpenが呼ばれる（閉じている→開く）", () => {
        const mockSetIsOpen = jest.fn();

        render(
          <SelectTrigger isOpen={false} setIsOpen={mockSetIsOpen}>
            トリガー
          </SelectTrigger>
        );

        const triggerButton = screen.getByRole("button");
        fireEvent.click(triggerButton);

        expect(mockSetIsOpen).toHaveBeenCalledWith(true);
      });

      it("クリック時にsetIsOpenが呼ばれる（開いている→閉じる）", () => {
        const mockSetIsOpen = jest.fn();

        render(
          <SelectTrigger isOpen={true} setIsOpen={mockSetIsOpen}>
            トリガー
          </SelectTrigger>
        );

        const triggerButton = screen.getByRole("button");
        fireEvent.click(triggerButton);

        expect(mockSetIsOpen).toHaveBeenCalledWith(false);
      });
    });

    describe("スタイリング", () => {
      it("正しいCSSクラスが適用される", () => {
        const mockSetIsOpen = jest.fn();

        render(
          <SelectTrigger isOpen={false} setIsOpen={mockSetIsOpen}>
            トリガー
          </SelectTrigger>
        );

        const triggerButton = screen.getByRole("button");
        expect(triggerButton).toHaveClass(
          "border",
          "border-gray-300",
          "rounded",
          "p-2",
          "w-full",
          "text-left"
        );
      });

      it("type属性がbuttonに設定される", () => {
        const mockSetIsOpen = jest.fn();

        render(
          <SelectTrigger isOpen={false} setIsOpen={mockSetIsOpen}>
            トリガー
          </SelectTrigger>
        );

        const triggerButton = screen.getByRole("button");
        expect(triggerButton).toHaveAttribute("type", "button");
      });
    });
  });

  describe("SelectContent", () => {
    describe("レンダリング", () => {
      it("SelectContentが正常にレンダリングされる", () => {
        render(
          <SelectContent>
            <option value="test">テストオプション</option>
          </SelectContent>
        );

        const selectElement = screen.getByRole("combobox");
        expect(selectElement).toBeInTheDocument();
      });

      it("子要素が正常に表示される", () => {
        render(
          <SelectContent>
            <option value="option1">オプション1</option>
            <option value="option2">オプション2</option>
          </SelectContent>
        );

        expect(screen.getByText("オプション1")).toBeInTheDocument();
        expect(screen.getByText("オプション2")).toBeInTheDocument();
      });
    });

    describe("スタイリング", () => {
      it("正しいCSSクラスが適用される", () => {
        render(
          <SelectContent>
            <option value="test">テスト</option>
          </SelectContent>
        );

        const selectElement = screen.getByRole("combobox");
        expect(selectElement).toHaveClass(
          "border",
          "border-gray-300",
          "rounded",
          "p-2",
          "w-full",
          "text-left"
        );
      });
    });
  });

  describe("SelectItem", () => {
    describe("レンダリング", () => {
      it("SelectItemが正常にレンダリングされる", () => {
        render(
          <select>
            <SelectItem value="test-value">テスト項目</SelectItem>
          </select>
        );

        const optionElement = screen.getByRole("option");
        expect(optionElement).toBeInTheDocument();
        expect(optionElement).toHaveTextContent("テスト項目");
      });

      it("value属性が正しく設定される", () => {
        render(
          <select>
            <SelectItem value="test-value">テスト項目</SelectItem>
          </select>
        );

        const optionElement = screen.getByRole("option");
        expect(optionElement).toHaveAttribute("value", "test-value");
      });

      it("子要素が正常に表示される", () => {
        render(
          <select>
            <SelectItem value="complex">複雑なテキスト</SelectItem>
          </select>
        );

        const optionElement = screen.getByRole("option");
        expect(optionElement).toHaveTextContent("複雑なテキスト");
      });
    });

    describe("スタイリング", () => {
      it("正しいCSSクラスが適用される", () => {
        render(
          <select>
            <SelectItem value="test">テスト</SelectItem>
          </select>
        );

        const optionElement = screen.getByRole("option");
        expect(optionElement).toHaveClass("text-gray-700");
      });
    });
  });

  describe("SelectValue", () => {
    describe("レンダリング", () => {
      it("SelectValueが正常にレンダリングされる", () => {
        render(<SelectValue placeholder="選択してください" selectedValue="" />);

        const valueSpan = screen.getByText("選択してください");
        expect(valueSpan).toBeInTheDocument();
      });

      it("選択された値がある場合は値が表示される", () => {
        render(
          <SelectValue
            placeholder="選択してください"
            selectedValue="選択済み"
          />
        );

        const valueSpan = screen.getByText("選択済み");
        expect(valueSpan).toBeInTheDocument();
        expect(screen.queryByText("選択してください")).not.toBeInTheDocument();
      });

      it("選択された値がない場合はプレースホルダーが表示される", () => {
        render(<SelectValue placeholder="選択してください" selectedValue="" />);

        const valueSpan = screen.getByText("選択してください");
        expect(valueSpan).toBeInTheDocument();
      });

      it("selectedValueがnullまたはundefinedの場合もプレースホルダーが表示される", () => {
        render(
          <SelectValue
            placeholder="選択してください"
            selectedValue={undefined as any}
          />
        );

        const valueSpan = screen.getByText("選択してください");
        expect(valueSpan).toBeInTheDocument();
      });
    });

    describe("スタイリング", () => {
      it("正しいCSSクラスが適用される", () => {
        render(<SelectValue placeholder="テスト" selectedValue="" />);

        const valueSpan = screen.getByText("テスト");
        expect(valueSpan).toHaveClass("text-gray-700");
      });
    });
  });

  describe("統合テスト", () => {
    it("複数のコンポーネントが連携して動作する", () => {
      const mockOnValueChange = jest.fn();

      render(<SelectTestWrapper onValueChange={mockOnValueChange} />);

      const selectElement = screen.getByRole("combobox") as HTMLSelectElement;

      // 初期状態
      expect(selectElement.value).toBe("");

      // 値を変更
      fireEvent.change(selectElement, { target: { value: "2023" } });

      // 状態が更新される
      expect(selectElement.value).toBe("2023");
      expect(mockOnValueChange).toHaveBeenCalledWith("2023");
    });

    it("エラーハンドリング - propsが不完全でも動作する", () => {
      expect(() => {
        render(
          <Select>
            <SelectItem value="test">テスト</SelectItem>
          </Select>
        );
      }).not.toThrow();
    });

    it("エラーハンドリング - 各コンポーネントが独立して動作する", () => {
      expect(() => {
        render(
          <div>
            <SelectTrigger isOpen={false} setIsOpen={() => {}}>
              トリガー
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="test">テスト</SelectItem>
            </SelectContent>
            <SelectValue placeholder="選択" selectedValue="" />
          </div>
        );
      }).not.toThrow();
    });
  });
});
