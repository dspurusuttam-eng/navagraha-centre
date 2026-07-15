// Claude Admin Console C2A — Article repository interface (pure; DI boundary).
// The Prisma-backed implementation lives in service.ts (server-only); tests provide
// an in-memory implementation.
import type { ArticleRecord } from "@/modules/admin/articles/types";

export type NormalizedArticleFilters = {
  status?: string;
  language?: string;
  search?: string;
  skip: number;
  take: number;
};

export type ArticleCreateData = {
  slug: string;
  title: string;
  excerpt: string;
  summary: string | null;
  body: string | null;
  language: string;
  category: string | null;
  coverImageAssetId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  readingTimeMinutes: number | null;
  isFeatured: boolean;
  displayOrder: number;
  status: string;
  authorId: string | null;
};

export type ArticleUpdateData = Partial<
  Omit<ArticleCreateData, "authorId"> & {
    status: string;
    publishedAt: Date | null;
    unpublishedAt: Date | null;
    archivedAt: Date | null;
  }
>;

export interface ArticleRepository {
  list(filters: NormalizedArticleFilters): Promise<{ items: ArticleRecord[]; total: number }>;
  findById(id: string): Promise<ArticleRecord | null>;
  findBySlug(slug: string): Promise<ArticleRecord | null>;
  create(data: ArticleCreateData): Promise<ArticleRecord>;
  update(id: string, data: ArticleUpdateData): Promise<ArticleRecord>;
  remove(id: string): Promise<void>;
}
