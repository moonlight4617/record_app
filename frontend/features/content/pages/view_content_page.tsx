import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useGetYears } from "@/features/content/hooks/get_years";
import { useGetYearsContents } from "@/features/content/hooks/get_years_contents";
import { BookOpen, Film, Bookmark } from "lucide-react";
import { ContentDetail } from "@/features/content/components/contentDetail";
import {
  ContentType,
  ContentDataType,
} from "@/features/content/types/content_type";
import { typeLabels } from "@/features/content/constants/content_labels";

export const ViewContentPage = () => {
  const { years, loading: yearsLoading, error: yearsError } = useGetYears();
  const {
    fetchYearsContents,
    loading: contentsLoading,
    error: contentsError,
  } = useGetYearsContents();
  const [contents, setContents] = useState<ContentDataType[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (years.length > 0) {
      const initialYear = years[0];
      fetchContents(initialYear);
    }
  }, [years]);

  const fetchContents = async (year: string) => {
    const data = await fetchYearsContents(year);
    setContents(data || []);
  };

  const updateStateContents = (updatedContent: ContentDataType) => {
    setContents((prevData) =>
      prevData.map((item) =>
        item.contentId === updatedContent.contentId ? updatedContent : item
      )
    );
  };

  // TODO: 読み込み中、エラー発生時の処理共通化
  // if (yearsLoading || contentsLoading) return <p>Loading...</p>;
  // if (yearsError || contentsError) return <p>Error: {yearsError || contentsError}</p>;

  return (
    <Card>
      {/* <CardHeader>
        <CardTitle>View Content</CardTitle>
        <CardDescription>Browse your recorded content by year and category.</CardDescription>
      </CardHeader> */}
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Label htmlFor="year">対象年:</Label>
          <Select
            name="selectedYear"
            onValueChange={fetchContents}
            value={selectedYear}
            setValue={setSelectedYear}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </div>
        {(["movie", "book", "blog"] as ContentType[]).map((type) => (
          <div key={type} className="mb-4">
            <h3 className="text-lg font-semibold capitalize mb-2 flex items-center">
              {type === "movie" && <Film className="mr-2 h-5 w-5" />}
              {type === "book" && <BookOpen className="mr-2 h-5 w-5" />}
              {type === "blog" && <Bookmark className="mr-2 h-5 w-5" />}
              {typeLabels[type]}
            </h3>
            <ul className="pl-5 list-none">
              {contents
                .filter((c) => c.type === type)
                .map((content) => (
                  <ContentDetail
                    content={content}
                    key={content.contentId}
                    onUpdate={updateStateContents}
                  />
                ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
