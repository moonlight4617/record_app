import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ViewContentPage } from "@/features/content/pages/view_content_page";

jest.mock("@/features/content/hooks/get_years", () => ({
  useGetYears: jest.fn(),
}));

jest.mock("@/features/content/hooks/get_years_contents", () => ({
  useGetYearsContents: jest.fn(),
}));

jest.mock("@/features/content/components/contentDetail", () => ({
  ContentDetail: ({ content }: any) => <li>{content.title}</li>,
}));

import { useGetYears } from "@/features/content/hooks/get_years";
import { useGetYearsContents } from "@/features/content/hooks/get_years_contents";

describe("ViewContentPage", () => {
  const mockYears = ["2024", "2023"];

  const mockUseGetYears = useGetYears as jest.MockedFunction<
    typeof useGetYears
  >;
  const mockUseGetYearsContents = useGetYearsContents as jest.MockedFunction<
    typeof useGetYearsContents
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithMocks = (contents: any[], fetchMock = jest.fn()) => {
    mockUseGetYears.mockReturnValue({
      years: mockYears,
      loading: false,
      error: null,
    });

    mockUseGetYearsContents.mockReturnValue({
      fetchYearsContents: fetchMock.mockResolvedValue(contents),
      loading: false,
      error: null,
    });

    render(<ViewContentPage />);
    return fetchMock;
  };

  it("初期表示が想定通りか", async () => {
    const mockContents = [
      { contentId: "1", type: "movie", title: "Test Movie" },
      { contentId: "2", type: "book", title: "Test Book" },
    ];

    const fetchMock = renderWithMocks(mockContents);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("2024");
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
      expect(screen.getByText("Test Book")).toBeInTheDocument();
    });
  });

  it("年度を変更した際にコンテンツが切り替わるか", async () => {
    const mockContents2023 = [
      { contentId: "3", type: "blog", title: "2023 Blog" },
    ];

    const fetchMock = renderWithMocks(mockContents2023);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "2023" },
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("2023");
      expect(screen.getByText("2023 Blog")).toBeInTheDocument();
    });
  });
});
