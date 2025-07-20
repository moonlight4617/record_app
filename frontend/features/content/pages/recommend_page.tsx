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
  const { getRecommend, loading, error } = useGetRecommend();

  const getRecommendations = async (type: ContentType) => {
    setRecommendationType(type);
    const recommendations = await getRecommend(type);
    console.log("recommendations: ", recommendations);

    if (error || !Array.isArray(recommendations)) {
      toast.error(flashMessages.FAILED_GET_RECOMMENDATIONS);
      console.log(error);
      return;
    }

    // 推薦リストが0件の場合はエラーとして扱わない
    if (recommendations.length === 0) {
      setRecommendations([]);
      return;
    }

    // Mock recommendations data
    const movieRecommendations: Recommendation[] = [
      {
        title: "Inception",
        desc: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        links: [
          {
            site_name: "Amazon",
            url: "https://www.imdb.com/title/tt1375666/",
          },
        ],
      },
      {
        title: "The Shawshank Redemption",
        desc: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        links: [
          {
            site_name: "IMDb",
            url: "https://www.imdb.com/title/tt0111161/",
          },
        ],
      },
      {
        title: "Spirited Away",
        desc: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
        links: [
          {
            site_name: "IMDb",
            url: "https://www.imdb.com/title/tt0245429/",
          },
        ],
      },
    ];
    const bookRecommendations: Recommendation[] = [
      {
        title: "1984",
        desc: "A dystopian novel by George Orwell about a totalitarian regime and the rebellion against it.",
        links: [
          {
            site_name: "Goodreads",
            url: "https://www.goodreads.com/book/show/40961427-1984",
          },
        ],
      },
      {
        title: "The Alchemist",
        desc: "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.",
        links: [
          {
            site_name: "Goodreads",
            url: "https://www.goodreads.com/book/show/865.The_Alchemist",
          },
        ],
      },
      {
        title: "Norwegian Wood",
        desc: "A novel by Japanese author Haruki Murakami about loss and growing up.",
        links: [
          {
            site_name: "Goodreads",
            url: "https://www.goodreads.com/book/show/11297.Norwegian_Wood",
          },
        ],
      },
    ];
    // if (type === "movie") {
    //   setRecommendations(movieRecommendations);
    // } else if (type === "book") {
    //   setRecommendations(bookRecommendations);
    // }

    setRecommendations(recommendations);
  };

  return (
    <Card>
      <CardContent>
        {recommendationType && (
          <div className="grid gap-6">
            {loading ? (
              <Loading />
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
