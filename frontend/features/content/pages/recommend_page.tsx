import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputContentArea } from "@/features/content/components/input_content_area";
import { useGetRecommend } from "../hooks/get_recommend";
import { ContentType } from "../types/content_type";
import { toast } from "react-toastify";
import { flashMessages } from "@/features/content/constants/flash_messages";
import { useState } from "react";
import { Bookmark, BookOpen, Film } from "lucide-react";

type Recommendation = {
  id?: string; // TODO: 不要であれば削除
  type?: ContentType; // TODO: 不要であれば削除
  title: string;
  desc: string;
  link: string;
};

export const RecommendPage = () => {
  const [recommendationType, setRecommendationType] =
    useState<ContentType | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showRecommendPopup, setShowRecommendPopup] = useState<boolean>(false); // TODO: 不要であれば削除
  const { getRecommend, loading, error } = useGetRecommend();

  const openRecommendPopup = () => {
    setShowRecommendPopup(true);
  };

  const closeRecommendPopup = () => {
    setShowRecommendPopup(false);
  };

  const getRecommendations = async (type: ContentType) => {
    const recommendations = await getRecommend(type);

    console.log("recommendations: ", recommendations);

    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      toast.error(flashMessages.FAILED_GET_RECOMMENDATIONS);
      return;
    }

    // Mock recommendations data
    const movieRecommendations: Recommendation[] = [
      {
        id: "1",
        type: "movie",
        title: "Inception",
        desc: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        link: "https://www.imdb.com/title/tt1375666/",
      },
      {
        id: "2",
        type: "movie",
        title: "The Shawshank Redemption",
        desc: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        link: "https://www.imdb.com/title/tt0111161/",
      },
      {
        id: "3",
        type: "movie",
        title: "Spirited Away",
        desc: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
        link: "https://www.imdb.com/title/tt0245429/",
      },
    ];

    const bookRecommendations: Recommendation[] = [
      {
        id: "1",
        type: "book",
        title: "1984",
        desc: "A dystopian novel by George Orwell about a totalitarian regime and the rebellion against it.",
        link: "https://www.goodreads.com/book/show/40961427-1984",
      },
      {
        id: "2",
        type: "book",
        title: "The Alchemist",
        desc: "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.",
        link: "https://www.goodreads.com/book/show/865.The_Alchemist",
      },
      {
        id: "3",
        type: "book",
        title: "Norwegian Wood",
        desc: "A novel by Japanese author Haruki Murakami about loss and growing up.",
        link: "https://www.goodreads.com/book/show/11297.Norwegian_Wood",
      },
    ];

    setRecommendationType(type);

    // if (type === "movie") {
    //   setRecommendations(movieRecommendations);
    // } else if (type === "book") {
    //   setRecommendations(bookRecommendations);
    // }

    setRecommendations(recommendations);

    // closeRecommendPopup();
  };

  return (
    <Card>
      <CardContent>
        {!recommendationType ? (
          <div className="flex flex-col space-y-4">
            <p>おすすめを見たいコンテンツタイプを選択してください</p>
            <div className="flex space-x-4">
              <Button onClick={() => getRecommendations("movie")}>映画</Button>
              <Button onClick={() => getRecommendations("book")}>本</Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {recommendations.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {item.type === "movie" && <Film className="mr-2 h-5 w-5" />}
                  {item.type === "book" && (
                    <BookOpen className="mr-2 h-5 w-5" />
                  )}
                  {item.title}
                </h3>
                <p className="text-gray-600 mb-2">{item.desc}</p>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    className="text-blue-500 hover:underline flex items-center"
                  >
                    詳細を見る →
                  </a>
                )}
              </div>
            ))}
            <div className="flex flex-col space-y-4 mt-4">
              <p>おススメを見たい種類を選択してください</p>
              <div className="flex space-x-4">
                <Button onClick={() => getRecommendations("movie")}>
                  映画
                </Button>
                <Button onClick={() => getRecommendations("book")}>本</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
