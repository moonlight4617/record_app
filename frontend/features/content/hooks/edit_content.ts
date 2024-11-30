import { useState } from "react";
import { ContentDataType, UseEditContentReturn, EditContentResult, RegisterContentDataType } from "../types/content_type"

export const useEditContent = (): UseEditContentReturn => {
  const [loading, setLoading] = useState(false);

  // TODO: いらなければ後ほど削除
  const [error, setError] = useState<string | null>(null);

  const editContent = async (content: RegisterContentDataType): Promise<EditContentResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        throw new Error(`Failed to edit content: ${response.statusText}`);
      }

      // TODO: 成功した場合の処理をここに記述（例：成功メッセージの表示やステートの更新）
      const result = await response.json();
      return { success: true, content: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { editContent, loading, error };
};
