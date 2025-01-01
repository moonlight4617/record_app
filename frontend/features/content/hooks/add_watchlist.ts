import { useState } from "react";
import { WatchlistDataType, UseAddWatchListReturn, AddWatchlistResult } from "../types/content_type"

export const useAddWatchList = (): UseAddWatchListReturn => {
  const [loading, setLoading] = useState(false);

  // TODO: いらなければ後ほど削除
  const [error, setError] = useState<string | null>(null);

  const addWatchlist = async (watchlist: WatchlistDataType): Promise<AddWatchlistResult> => {
    watchlist = { ...watchlist, contentId: Date.now().toString(), status: "to_watch" }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/addWatchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(watchlist),
      });

      if (!response.ok) {
        throw new Error(`Failed to add watchlist: ${response.statusText}`);
      }

      // TODO: 成功した場合の処理をここに記述（例：成功メッセージの表示やステートの更新）
      console.log("成功", response)
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { addWatchlist, loading, error };
};
