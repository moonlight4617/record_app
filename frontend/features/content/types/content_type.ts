export type ContentType = 'movie' | 'book' | 'blog'

export type RegisterContentDataType = {
  contentId?: string
  type: ContentType
  title: string
  date: string
  notes?: string
  link?: string
}

export type ContentDataType = {
  contentId?: string
  type: ContentType
  title: string
  date: string
  notes?: string
  link?: string
  year?: number
  rank?: number
  isBest? : boolean
}

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

export type AddContentResult = {
  success: boolean;
  message?: string;
};

export type EditContentResult = {
  success: boolean;
  message?: string;
  content?: ContentDataType;
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
