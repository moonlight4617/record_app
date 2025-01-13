import { useState } from "react";
import { ContentDataType, UpdateBestResult } from "../types/content_type";

export const useUpdateBest = () => {
  const [loading, setLoading] = useState(false);

  // TODO: いらなければ後ほど削除
  const [error, setError] = useState<string | null>(null);

  const updateBest = async (
    content: ContentDataType[]
  ): Promise<UpdateBestResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/content/update-best`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(content),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add content: ${response.statusText}`);
      }

      return { success: true };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { updateBest, loading, error };
};
