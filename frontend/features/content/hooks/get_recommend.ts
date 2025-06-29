import { useState } from "react";
import {
  UseGetRecommendReturn,
  GetRecommendResult,
  ContentType,
} from "../types/content_type";

export const useGetRecommend = (): UseGetRecommendReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommend = async (
    type: ContentType
  ): Promise<GetRecommendResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/content/recommend?content_type=${type}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get recommend: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("data: ", data);
      const jsonData = JSON.parse(data?.recommendations);
      console.log("jsonData: ", jsonData);
      console.log("jsonData type: ", typeof jsonData);
      console.log("jsonData?.recommendations: ", jsonData?.recommendations);
      return jsonData?.recommendations;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { getRecommend, loading, error };
};
