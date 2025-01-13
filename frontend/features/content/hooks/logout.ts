import { useState } from "react";
import {
  UseLogoutReturn,
  LogoutResult,
} from "@/features/content/types/content_type";

export const useLogout = (): UseLogoutReturn => {
  const [loading, setLoading] = useState(false);

  // TODO: いらなければ後ほど削除
  const [error, setError] = useState<string | null>(null);

  const logout = async (): Promise<LogoutResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/account/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to logout: ${response.statusText}`);
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

  return { logout, loading, error };
};
