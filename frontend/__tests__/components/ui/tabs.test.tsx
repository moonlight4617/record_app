import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import React from "react";

// テスト用のモックsetTab関数
const mockSetTab = jest.fn();

describe("Tabs", () => {
  beforeEach(() => {
    mockSetTab.mockClear();
  });

  describe("Tabsコンポーネント", () => {
    it("デフォルト値でタブが正常にレンダリングされる", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">タブ1</TabsTrigger>
            <TabsTrigger value="tab2">タブ2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">コンテンツ1</TabsContent>
          <TabsContent value="tab2">コンテンツ2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText("タブ1")).toBeInTheDocument();
      expect(screen.getByText("タブ2")).toBeInTheDocument();
    });

    it("カスタムクラスが適用される", () => {
      const { container } = render(
        <Tabs defaultValue="tab1" className="custom-tabs">
          <TabsList>
            <TabsTrigger value="tab1">Test Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" isActive={true}>
            Test content
          </TabsContent>
        </Tabs>
      );

      const tabsElement = container.firstChild as HTMLElement;
      expect(tabsElement).toHaveClass("custom-tabs");
    });

    it("activeTabとsetActiveTabが子要素に正しく渡される", () => {
      const TestChild = ({ activeTab, setActiveTab }: any) => (
        <div>
          <span data-testid="active-tab">{activeTab}</span>
          <button onClick={() => setActiveTab("new-tab")}>Change Tab</button>
        </div>
      );

      render(
        <Tabs defaultValue="initial-tab">
          <TestChild />
        </Tabs>
      );

      expect(screen.getByTestId("active-tab")).toHaveTextContent("initial-tab");

      fireEvent.click(screen.getByText("Change Tab"));
      expect(screen.getByTestId("active-tab")).toHaveTextContent("new-tab");
    });
  });

  describe("TabsListコンポーネント", () => {
    it("正常にレンダリングされる", () => {
      render(
        <TabsList>
          <TabsTrigger value="tab1">タブ1</TabsTrigger>
          <TabsTrigger value="tab2">タブ2</TabsTrigger>
        </TabsList>
      );

      expect(screen.getByText("タブ1")).toBeInTheDocument();
      expect(screen.getByText("タブ2")).toBeInTheDocument();
    });

    it("デフォルトのスタイルクラスが適用される", () => {
      const { container } = render(
        <TabsList>
          <div>Test</div>
        </TabsList>
      );

      const tabsListElement = container.firstChild as HTMLElement;
      expect(tabsListElement).toHaveClass("flex", "space-x-4", "bg-gray-200");
    });

    it("カスタムクラスが適用される", () => {
      const { container } = render(
        <TabsList className="custom-list">
          <div>Test</div>
        </TabsList>
      );

      const tabsListElement = container.firstChild as HTMLElement;
      expect(tabsListElement).toHaveClass(
        "flex",
        "space-x-4",
        "bg-gray-200",
        "custom-list"
      );
    });

    it("子要素が正常に表示される", () => {
      render(
        <TabsList>
          <span>子要素1</span>
          <span>子要素2</span>
        </TabsList>
      );

      expect(screen.getByText("子要素1")).toBeInTheDocument();
      expect(screen.getByText("子要素2")).toBeInTheDocument();
    });
  });

  describe("TabsTriggerコンポーネント", () => {
    it("正常にレンダリングされる", () => {
      render(
        <TabsTrigger value="tab1" setTab={mockSetTab}>
          タブボタン
        </TabsTrigger>
      );

      const button = screen.getByRole("button", { name: "タブボタン" });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("タブボタン");
    });

    it("クリック時にsetTab関数が正しい値で呼ばれる", () => {
      render(
        <TabsTrigger value="tab1" setTab={mockSetTab}>
          タブボタン
        </TabsTrigger>
      );

      const button = screen.getByRole("button", { name: "タブボタン" });
      fireEvent.click(button);

      expect(mockSetTab).toHaveBeenCalledTimes(1);
      expect(mockSetTab).toHaveBeenCalledWith("tab1");
    });

    it("setTab関数が提供されていない場合でもエラーが発生しない", () => {
      render(<TabsTrigger value="tab1">タブボタン</TabsTrigger>);

      const button = screen.getByRole("button", { name: "タブボタン" });

      // エラーが発生しないことを確認
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it("カスタムクラスが適用される", () => {
      render(
        <TabsTrigger
          value="tab1"
          className="custom-trigger"
          setTab={mockSetTab}
        >
          タブボタン
        </TabsTrigger>
      );

      const button = screen.getByRole("button", { name: "タブボタン" });
      expect(button).toHaveClass("custom-trigger");
    });

    it("複数回クリックしても正常に動作する", () => {
      render(
        <TabsTrigger value="tab1" setTab={mockSetTab}>
          タブボタン
        </TabsTrigger>
      );

      const button = screen.getByRole("button", { name: "タブボタン" });

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockSetTab).toHaveBeenCalledTimes(3);
      expect(mockSetTab).toHaveBeenCalledWith("tab1");
    });

    it("子要素が正常に表示される", () => {
      render(
        <TabsTrigger value="tab1" setTab={mockSetTab}>
          <span>アイコン</span>
          <span>テキスト</span>
        </TabsTrigger>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("アイコンテキスト");
      expect(screen.getByText("アイコン")).toBeInTheDocument();
      expect(screen.getByText("テキスト")).toBeInTheDocument();
    });
  });

  describe("TabsContentコンポーネント", () => {
    it("isActiveがtrueの場合にコンテンツが表示される", () => {
      render(
        <TabsContent value="tab1" isActive={true}>
          アクティブなコンテンツ
        </TabsContent>
      );

      expect(screen.getByText("アクティブなコンテンツ")).toBeInTheDocument();
    });

    it("isActiveがfalseの場合にコンテンツが表示されない", () => {
      render(
        <TabsContent value="tab1" isActive={false}>
          非アクティブなコンテンツ
        </TabsContent>
      );

      expect(
        screen.queryByText("非アクティブなコンテンツ")
      ).not.toBeInTheDocument();
    });

    it("isActiveが未定義の場合にコンテンツが表示されない", () => {
      render(<TabsContent value="tab1">未定義コンテンツ</TabsContent>);

      expect(screen.queryByText("未定義コンテンツ")).not.toBeInTheDocument();
    });

    it("複雑な子要素が正常に表示される", () => {
      render(
        <TabsContent value="tab1" isActive={true}>
          <div>
            <h1>タイトル</h1>
            <p>段落テキスト</p>
            <ul>
              <li>アイテム1</li>
              <li>アイテム2</li>
            </ul>
          </div>
        </TabsContent>
      );

      expect(screen.getByText("タイトル")).toBeInTheDocument();
      expect(screen.getByText("段落テキスト")).toBeInTheDocument();
      expect(screen.getByText("アイテム1")).toBeInTheDocument();
      expect(screen.getByText("アイテム2")).toBeInTheDocument();
    });
  });

  describe("統合テスト", () => {
    it("完全なタブシステムが正常に動作する", () => {
      const TestTabsSystem = () => {
        const [activeTab, setActiveTab] = React.useState("tab1");

        return (
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger
                value="tab1"
                setTab={setActiveTab}
                className={activeTab === "tab1" ? "active" : ""}
              >
                タブ1
              </TabsTrigger>
              <TabsTrigger
                value="tab2"
                setTab={setActiveTab}
                className={activeTab === "tab2" ? "active" : ""}
              >
                タブ2
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" isActive={activeTab === "tab1"}>
              タブ1のコンテンツ
            </TabsContent>
            <TabsContent value="tab2" isActive={activeTab === "tab2"}>
              タブ2のコンテンツ
            </TabsContent>
          </Tabs>
        );
      };

      render(<TestTabsSystem />);

      // 初期状態でタブ1のコンテンツが表示される
      expect(screen.getByText("タブ1のコンテンツ")).toBeInTheDocument();
      expect(screen.queryByText("タブ2のコンテンツ")).not.toBeInTheDocument();

      // タブ2をクリック
      fireEvent.click(screen.getByText("タブ2"));

      // タブ2のコンテンツが表示され、タブ1のコンテンツが非表示になる
      expect(screen.queryByText("タブ1のコンテンツ")).not.toBeInTheDocument();
      expect(screen.getByText("タブ2のコンテンツ")).toBeInTheDocument();

      // タブ1に戻る
      fireEvent.click(screen.getByText("タブ1"));

      // タブ1のコンテンツが再表示される
      expect(screen.getByText("タブ1のコンテンツ")).toBeInTheDocument();
      expect(screen.queryByText("タブ2のコンテンツ")).not.toBeInTheDocument();
    });

    it("複数のタブが存在する場合も正常に動作する", () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" setTab={mockSetTab}>
              タブ1
            </TabsTrigger>
            <TabsTrigger value="tab2" setTab={mockSetTab}>
              タブ2
            </TabsTrigger>
            <TabsTrigger value="tab3" setTab={mockSetTab}>
              タブ3
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" isActive={true}>
            コンテンツ1
          </TabsContent>
          <TabsContent value="tab2" isActive={false}>
            コンテンツ2
          </TabsContent>
          <TabsContent value="tab3" isActive={false}>
            コンテンツ3
          </TabsContent>
        </Tabs>
      );

      expect(screen.getByText("タブ1")).toBeInTheDocument();
      expect(screen.getByText("タブ2")).toBeInTheDocument();
      expect(screen.getByText("タブ3")).toBeInTheDocument();
      expect(screen.getByText("コンテンツ1")).toBeInTheDocument();
      expect(screen.queryByText("コンテンツ2")).not.toBeInTheDocument();
      expect(screen.queryByText("コンテンツ3")).not.toBeInTheDocument();
    });
  });

  describe("エッジケースとエラーハンドリング", () => {
    it("valueプロパティが空文字列でも動作する", () => {
      render(
        <TabsTrigger value="" setTab={mockSetTab}>
          空のタブ
        </TabsTrigger>
      );

      fireEvent.click(screen.getByText("空のタブ"));
      expect(mockSetTab).toHaveBeenCalledWith("");
    });

    it("特殊文字を含むvalueでも正常に動作する", () => {
      const specialValue = "tab-1_test@2025";
      render(
        <TabsTrigger value={specialValue} setTab={mockSetTab}>
          特殊文字タブ
        </TabsTrigger>
      );

      fireEvent.click(screen.getByText("特殊文字タブ"));
      expect(mockSetTab).toHaveBeenCalledWith(specialValue);
    });
  });
});
