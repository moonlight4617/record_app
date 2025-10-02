import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useGetRecommend } from "../hooks/get_recommend";
import { ContentType } from "../types/content_type";
import { toast } from "react-toastify";
import { flashMessages } from "@/features/content/constants/flash_messages";
import { useState } from "react";
import { BookOpen, Film } from "lucide-react";

type Recommendation = {
  title: string;
  desc: string;
  links?: Array<{
    site_name: string;
    url: string;
  }>;
};

export const RecommendPage = () => {
  const [recommendationType, setRecommendationType] =
    useState<ContentType | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const { getRecommend, loading, error } = useGetRecommend();

  const getRecommendations = async (type: ContentType) => {
    setRecommendationType(type);
    setApiMessage(null);
    const result = await getRecommend(type);
    console.log("result: ", result);

    // API からメッセージが返却された場合は表示
    if (result?.message) {
      setApiMessage(result?.message);
      setRecommendations([]);
      return;
    }

    if (error || !result.success) {
      toast.error(flashMessages.FAILED_GET_RECOMMENDATIONS);
      console.log(error);
      return;
    }

    // 推薦リストが0件の場合はエラーとして扱わない
    if (!result?.recommendations || result?.recommendations.length === 0) {
      setRecommendations([]);
      return;
    }

    setRecommendations(result?.recommendations);
  };

  return (
    <Card>
      <CardContent>
        {recommendationType && (
          <div className="grid gap-6">
            {loading ? (
              <Loading />
            ) : apiMessage ? (
              <div className="text-center py-8">
                <p className="text-gray-600 text-lg">{apiMessage}</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 text-lg">
                  現在、おススメできる作品はありません。
                </p>
              </div>
            ) : (
              recommendations.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    {recommendationType === "movie" && (
                      <Film className="mr-2 h-5 w-5" />
                    )}
                    {recommendationType === "book" && (
                      <BookOpen className="mr-2 h-5 w-5" />
                    )}
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{item.desc}</p>
                  {item.links && item.links.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-700">
                        関連リンク:
                      </p>
                      {item.links.map((link, linkIndex) => (
                        <div key={linkIndex}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-sm"
                          >
                            {link.site_name}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        <div className="flex flex-col space-y-4 mt-4">
          <p>おススメを見たい種類を選択してください</p>
          <div className="flex space-x-4">
            <Button onClick={() => getRecommendations("movie")}>映画</Button>
            <Button onClick={() => getRecommendations("book")}>本</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
