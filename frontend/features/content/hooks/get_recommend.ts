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

      // isPremium が false の場合や message がある場合は、そのまま返す
      if (
        data?.isPremium === false ||
        (data?.message && !data?.recommendations)
      ) {
        return {
          success: false,
          message: data?.message,
          recommendations: [],
          isPremium: data?.isPremium,
        };
      }

      // recommendations が JSON 文字列の場合はパース
      let recommendations = data?.recommendations;
      if (typeof recommendations === "string") {
        const jsonData = JSON.parse(recommendations);
        recommendations = jsonData?.recommendations || [];
      }

      return {
        success: true,
        recommendations: recommendations,
        isPremium: data?.isPremium,
        message: data?.message,
      };
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
