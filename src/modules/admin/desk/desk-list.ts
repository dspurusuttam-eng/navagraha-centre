// Claude Admin Console C4A — Desk list filters (pure).
import type { ArticleListFilters } from "@/modules/admin/articles/types";

export const DESK_STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"] as const;
export const DESK_LANGUAGE_OPTIONS = ["en", "as", "hi", "bn"] as const;
export const DESK_PAGE_SIZE = 20;

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Normalize URL search params into the article-service filter shape. */
export function buildDeskListQuery(params: Record<string, string | string[] | undefined>): ArticleListFilters {
  const status = single(params.status);
  const language = single(params.language);
  const search = single(params.search);
  const page = Math.max(1, Math.trunc(Number(single(params.page)) || 1));
  const pageSize = Math.min(50, Math.max(1, Math.trunc(Number(single(params.pageSize)) || DESK_PAGE_SIZE)));
  return {
    status: status && (DESK_STATUS_OPTIONS as readonly string[]).includes(status) ? status : null,
    language: language && (DESK_LANGUAGE_OPTIONS as readonly string[]).includes(language) ? language : null,
    search: search && search.trim() ? search.trim().slice(0, 200) : null,
    page,
    pageSize,
  };
}

/** Build a /admin/desk URL preserving the active filters at a given page. */
export function buildDeskUrl(query: ArticleListFilters, page: number): string {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.language) params.set("language", query.language);
  if (query.search) params.set("search", query.search);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/desk?${qs}` : "/admin/desk";
}
