import { useState } from "react";
import { ContentDataType, UseAddContentReturn, AddContentResult, RegisterContentDataType } from "../types/content_type"

export const useAddContent = (): UseAddContentReturn => {
  const [loading, setLoading] = useState(false);

  // TODO: いらなければ後ほど削除
  const [error, setError] = useState<string | null>(null);

  const addContent = async (content: RegisterContentDataType): Promise<AddContentResult> => {
    content = { ...content, contentId: Date.now().toString() }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        throw new Error(`Failed to add content: ${response.statusText}`);
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

  return { addContent, loading, error };
};
