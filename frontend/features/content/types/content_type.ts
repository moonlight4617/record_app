export type ContentType = 'movie' | 'book' | 'blog'

export type ContentDataType = {
  contentId?: string
  type: ContentType
  title: string
  date: string
  notes?: string
  link?: string
}

export type UseAddContentReturn = {
  addContent: (content: ContentDataType) => Promise<AddContentResult>;
  loading: boolean;
  error: string | null;
};

export type AddContentResult = {
  success: boolean;
  message?: string;
};
