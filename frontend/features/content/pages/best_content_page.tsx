import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BookOpen, Film, Bookmark } from "lucide-react";
import { useGetYears } from "@/features/content/hooks/get_years";
import {
  ContentType,
  ContentDataType,
} from "@/features/content/types/content_type";
import { ContentDetail } from "@/features/content/components/contentDetail";
import { useGetYearsContents } from "@/features/content/hooks/get_years_contents";
import { useUpdateBest } from "@/features/content/hooks/update_best";
import { typeLabels } from "@/features/content/constants/content_labels";
import { flashMessages } from "@/features/content/constants/flash_messages";
import { toast } from "react-toastify";

export const BestContentPage = () => {
  const [contents, setContents] = useState<ContentDataType[]>([]);
  const [bestContents, setBestContents] = useState<ContentDataType[]>([]); // Best 1, 2, 3用の状態管理
  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    undefined
  );
  const [editable, setEditable] = useState<boolean>(false);

  // TODO: loading, error後で共通化
  const { years, loading: yearsLoading, error: yearsError } = useGetYears();
  const {
    fetchYearsContents,
    loading: contentsLoading,
    error: contentsError,
  } = useGetYearsContents();
  const {
    updateBest,
    loading: updateBestLoading,
    error: updateBestError,
  } = useUpdateBest();

  useEffect(() => {
    if (years.length > 0) {
      const initialYear = years[0];
      setSelectedYear(initialYear);
      fetchContents(initialYear);
    }
  }, [years]);

  const fetchContents = async (year: string) => {
    let data = await fetchYearsContents(year);
    setContents(data);

    //Best絞込
    if (data?.length > 0) {
      // Best絞込
      data = data.filter((item: ContentDataType) => item.rank !== null);

      // Typeごとにグループ化しRank順にソート
      const sortedData = data.sort((a: ContentDataType, b: ContentDataType) => {
        // Typeでグループ化した順番は任意なら以下の方法で設定可能
        if (a.type !== b.type) {
          return a.type.localeCompare(b.type); // Typeを辞書順で並び替え
        }
        return a.rank! - b.rank!; // Rank順（昇順）でソート
      });
      setBestContents(sortedData);
    }
  };

  const handleSelectChange = (
    type: string,
    rank: number,
    contentId: string
  ) => {
    const selectedContent = contents.find(
      (content) => content.contentId === contentId
    );

    if (!selectedContent) return; // そもそもデータとして存在しなければreturnさせる
    setBestContents((prev) => {
      const updated = [...prev];
      const index = updated.findIndex(
        (item) => item.rank === rank && item.type === type
      );

      const newItem = {
        ...selectedContent,
        rank, // rank属性上書き
      };

      if (index !== -1) {
        updated[index] = newItem; // 既存の項目を更新
      } else {
        updated.push(newItem); // 新しい項目を追加
      }

      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!editable) return;
    const result = await updateBest(bestContents);
    if (result.success) {
      setEditable(!editable);
      toast.success(flashMessages.SUCCESSFUL_BEST_REGISTRATION);
    } else {
      toast.error(
        `${flashMessages.FAILED_BEST_REGISTRATION}: ${result.message}`
      );
    }
  };

  return (
    <Card>
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
              {typeLabels[type]} Best3
            </h3>
            <ol className="pl-5">
              {editable ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex">
                    <label htmlFor={`best${i + 1}`}>{`Best ${i + 1}`}</label>
                    <select
                      id={`best${i + 1}`}
                      name={`best${i + 1}`}
                      onChange={(e) =>
                        handleSelectChange(type, i + 1, e.target.value)
                      } // 選択時の処理を実装
                      value={
                        bestContents.filter((item) => item?.type === type)[i]
                          ?.contentId || ""
                      }
                      // defaultValue={bestContents.filter((item) => item?.type === type)[i]?.contentId | false}
                      className="border border-gray-300 rounded p-2 w-full text-left"
                    >
                      <option value={undefined}>-- 選択してください --</option>
                      {contents
                        .filter(
                          (c) =>
                            c.type === type && String(c.year) === selectedYear
                        )
                        .map((content) => (
                          <option
                            key={content?.contentId}
                            value={content?.contentId}
                          >
                            {content.title}
                          </option>
                        ))}
                    </select>
                  </div>
                ))
              ) : (
                <>
                  {bestContents
                    .filter(
                      (c) => c.type === type && String(c.year) === selectedYear
                    )
                    .map((content) => (
                      <ContentDetail
                        content={content}
                        key={content.contentId}
                        isRank={true}
                      />
                    ))}
                </>
              )}
            </ol>
          </div>
        ))}
        {editable ? (
          <div className="mt-4">
            <Button className="mr-2" onClick={handleSubmit}>
              登録
            </Button>
            <Button variant="cancel" onClick={() => setEditable(!editable)}>
              キャンセル
            </Button>
          </div>
        ) : (
          <Button
            className="ml-auto mt-4"
            onClick={() => setEditable(!editable)}
          >
            ベストの編集
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
