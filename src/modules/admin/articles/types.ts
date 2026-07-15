// Claude Admin Console C2A — Article service DTOs (pure; no DB, no server-only).
export type ArticleRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  summary: string | null;
  body: string | null;
  language: string;
  category: string | null;
  coverImageAssetId: string | null;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
  readingTimeMinutes: number | null;
  isFeatured: boolean;
  displayOrder: number;
  publishedAt: Date | null;
  unpublishedAt: Date | null;
  archivedAt: Date | null;
  authorId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ArticleListFilters = {
  status?: string | null;
  language?: string | null;
  search?: string | null;
  page?: number | null;
  pageSize?: number | null;
};

export type ArticleListResult = {
  items: ArticleRecord[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type ArticleActor = {
  userId: string;
  roleKeys: readonly string[];
  primaryRoleKey: string | null;
};

export type ServiceResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; code: string; message: string; issues?: unknown };
