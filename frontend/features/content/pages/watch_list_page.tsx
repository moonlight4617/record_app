import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Film, Bookmark } from "lucide-react";
import { InputContentArea } from "@/features/content/components/input_content_area";
import {
  ContentType,
  WatchlistDataType,
  ContentDataType,
} from "@/features/content/types/content_type";
import { useAddWatchList } from "@/features/content/hooks/add_watchlist";
import { useGetWatchlist } from "@/features/content/hooks/get_watchlist";
import { useDeleteWatchList } from "@/features/content/hooks/delete_watchlist";
import { toast } from "react-toastify";
import { EditModal } from "@/features/content/components/modal";
import { flashMessages } from "@/features/content/constants/flash_messages";

export const WatchListPage = () => {
  const [watchlist, setWatchlist] = useState<WatchlistDataType[]>([]);
  const [isDisplayModal, setIsDisplayModal] = useState<boolean>(false);
  const [displaycontent, setDisplaycontent] =
    useState<WatchlistDataType | null>();
  const {
    addWatchlist,
    loading: addWatchlistLoading,
    error: addWatchlistError,
  } = useAddWatchList();
  const {
    fetchWatchlist,
    loading: fetchWatchlistLoading,
    error: fetchWatchlistError,
  } = useGetWatchlist();
  const {
    deleteWatchlist,
    loading: deleteWatchlistLoading,
    error: deleteWatchlistError,
  } = useDeleteWatchList();

  const getIcon = (type: ContentDataType["type"]) => {
    switch (type) {
      case "movie":
        return <Film className="w-4 h-4 flex-none" />;
      case "book":
        return <BookOpen className="w-4 h-4 flex-none" />;
      case "blog":
        return <Bookmark className="w-4 h-4 flex-none" />;
    }
  };

  const handleEdit = (updatedContent: WatchlistDataType) => {
    setIsDisplayModal(!isDisplayModal);
    setDisplaycontent(updatedContent);
  };

  const updateStateContents = (updatedContent: WatchlistDataType) => {
    setWatchlist(
      (prevWatchlist) =>
        prevWatchlist.filter(
          (item) => item.contentId !== updatedContent.contentId
        ) // content.idが一致しないものだけ残す
    );
  };

  const handleDelete = async (content: WatchlistDataType) => {
    const result = await deleteWatchlist(content);
    if (result.success) {
      toast.success(flashMessages.SUCCESSFUL_WATCHLIST_DELETION);
      // stateから削除
      setWatchlist(
        (prevWatchlist) =>
          prevWatchlist.filter((item) => item.contentId !== content.contentId) // content.idが一致しないものだけ残す
      );
    } else {
      toast.error(
        `${flashMessages.FAILED_WATCHLIST_DELETION}: ${result.message}`
      );
    }
  };

  const handleSubmit = async (content: WatchlistDataType) => {
    const result = await addWatchlist(content);
    if (result.success) {
      toast.success(flashMessages.SUCCESSFUL_WATCHLIST_ADDITION);
      setWatchlist([...watchlist, content]);
    } else {
      toast.error(
        `${flashMessages.FAILED_WATCHLIST_ADDITION}: ${result.message}`
      );
    }
  };

  useEffect(() => {
    const fetchContents = async () => {
      const data = await fetchWatchlist();
      if (data.length > 0) {
        // Typeごとにグループ化
        const sortedData = data.sort(
          (a: WatchlistDataType, b: WatchlistDataType) => {
            // Typeでグループ化した順番は任意なら以下の方法で設定可能
            if (a.type !== b.type) {
              return a.type.localeCompare(b.type); // Typeを辞書順で並び替え
            }
          }
        );
        setWatchlist(sortedData || []);
      } else {
        console.log(`ウォッチリスト取得に失敗しました: ${data.message}`);
      }
    };
    fetchContents();
  }, []);

  return (
    <Card>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSubmit({
              type: formData.get("type") as ContentType,
              title: formData.get("title") as string,
              link: formData.get("link") as string,
            });
          }}
          className="mb-4"
        >
          <InputContentArea isWatchList />
          <Button type="submit" className="mt-4">
            追加
          </Button>
        </form>
        <hr className="my-4 border-gray-400" />
        <h3 className="text-lg font-semibold mb-2">ウォッチリスト</h3>
        <ul className="list-disc pl-5">
          {watchlist.map((item, i) => (
            <div
              key={i}
              className="border rounded-lg pl-4 transition-all duration-200 ease-in-out w-full"
            >
              <div
                // variant="ghost"
                className="w-full text-left flex items-center justify-between py-2"
              >
                <div className="flex items-center space-x-2 truncate flex-initial">
                  {getIcon(item.type)}
                  <span className="truncate flex-initial">{item.title}</span>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-500 hover:underline"
                    >
                      Link
                    </a>
                  )}
                </div>
                <div className="flex-none text-white">
                  <Button onClick={() => handleEdit(item)} className="ml-2">
                    閲覧済
                  </Button>
                  <Button
                    onClick={() => handleDelete(item)}
                    className="ml-2 bg-red-500"
                  >
                    削除
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </ul>
        {isDisplayModal && (
          <EditModal
            isDisplayModal={isDisplayModal}
            setIsDisplayModal={setIsDisplayModal}
            content={displaycontent || null}
            onUpdate={updateStateContents}
            isWatchllist
          />
        )}
      </CardContent>
    </Card>
  );
};
