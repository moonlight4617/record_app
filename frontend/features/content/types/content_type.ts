export type ContentType = "movie" | "book" | "blog";

export type RegisterContentDataType = {
  contentId?: string;
  type: ContentType;
  title: string;
  date: string;
  notes?: string;
  link?: string;
  status?: string;
};

export type ContentDataType = {
  contentId?: string;
  type: ContentType;
  title: string;
  date: string;
  notes?: string;
  link?: string;
  year?: number;
  rank?: number;
  isBest?: boolean;
};

export type WatchlistDataType = {
  contentId?: string;
  type: ContentType;
  title: string;
  date?: string;
  notes?: string;
  link?: string;
  status?: string;
};

export type RecommendContentsType = {
  type: ContentType;
  title: string;
  description: string;
  link: string;
};

// TODO: 不要そうであれば後ほど削除
export type UseAddContentReturn = {
  addContent: (content: RegisterContentDataType) => Promise<AddContentResult>;
  loading: boolean;
  error: string | null;
};

export type UseEditContentReturn = {
  editContent: (content: RegisterContentDataType) => Promise<EditContentResult>;
  loading: boolean;
  error: string | null;
};

export type UseAddWatchListReturn = {
  addWatchlist: (content: WatchlistDataType) => Promise<AddWatchlistResult>;
  loading: boolean;
  error: string | null;
};

export type UseDeleteWatchListReturn = {
  deleteWatchlist: (
    content: WatchlistDataType
  ) => Promise<DeleteWatchlistResult>;
  loading: boolean;
  error: string | null;
};

export type UseGetRecommendReturn = {
  getRecommend: (content_type: ContentType) => Promise<GetRecommendResult>;
  loading: boolean;
  error: string | null;
};

export type AddContentResult = {
  success: boolean;
  message?: string;
};

export type EditContentResult = {
  success: boolean;
  message?: string;
  content?: ContentDataType;
};

export type AddWatchlistResult = {
  success: boolean;
  message?: string;
};

export type DeleteWatchlistResult = {
  success: boolean;
  message?: string;
};

// TODO: 不要そうであれば後ほど削除
// export type UseUpdateBestReturn = {
//   updateBest: (content: ContentDataType[]) => Promise<UpdateBestResult>;
//   loading: boolean;
//   error: string | null;
// };

export type UpdateBestResult = {
  success: boolean;
  message?: string;
};

export type GetRecommendResult = {
  success: boolean;
  message?: string;
  contents?: RecommendContentsType[];
};

export type UseLogoutReturn = {
  logout: () => Promise<LogoutResult>;
  loading: boolean;
  error: string | null;
};

export type LogoutResult = {
  success: boolean;
  message?: string;
};
