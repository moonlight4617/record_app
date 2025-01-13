export const typeLabels: Record<"movie" | "book" | "blog", string> = {
  movie: "映画",
  book: "本",
  blog: "ブログ",
};

// ラベルを取得するユーティリティ関数
export const getTypeLabel = (type: "movie" | "book" | "blog"): string => {
  return typeLabels[type];
};
