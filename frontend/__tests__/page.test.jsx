import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ContentManager from "../app/content/page";
import { describe } from "node:test";

describe("ContentManager", () => {
  it("初期表示でタイトルと初期タブが表示される", () => {
    render(<ContentManager />);
    expect(screen.getByText("ひとことメモ帳。")).toBeInTheDocument();
    expect(screen.getByText("メモ追加")).toHaveClass("bg-white"); // activeタブ
    expect(screen.getByText("振り返り")).not.toHaveClass("bg-white");
    expect(screen.getByText("年度別ベスト")).not.toHaveClass("bg-white");
    expect(screen.getByText("ウォッチリスト")).not.toHaveClass("bg-white");
    expect(screen.getByText("おススメ")).not.toHaveClass("bg-white");
  });
});
