// Claude Admin Console C6A — Media list filters + display helpers (pure).
import { MEDIA_ASSET_KINDS } from "@/modules/admin/domain";
import type { MediaListFilters, MediaReferenceCount } from "@/modules/admin/media/types";

export const MEDIA_KIND_OPTIONS = MEDIA_ASSET_KINDS;
export const MEDIA_PAGE_SIZE = 20;

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Normalize URL search params into the media-service filter shape. */
export function buildMediaListQuery(params: Record<string, string | string[] | undefined>): MediaListFilters {
  const kind = single(params.kind);
  const search = single(params.search);
  const page = Math.max(1, Math.trunc(Number(single(params.page)) || 1));
  const pageSize = Math.min(50, Math.max(1, Math.trunc(Number(single(params.pageSize)) || MEDIA_PAGE_SIZE)));
  return {
    kind: kind && (MEDIA_KIND_OPTIONS as readonly string[]).includes(kind) ? kind : null,
    search: search && search.trim() ? search.trim().slice(0, 200) : null,
    page,
    pageSize,
  };
}

/** Build an /admin/media URL preserving the active filters at a given page. */
export function buildMediaUrl(query: MediaListFilters, page: number): string {
  const params = new URLSearchParams();
  if (query.kind) params.set("kind", query.kind);
  if (query.search) params.set("search", query.search);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/media?${qs}` : "/admin/media";
}

/** Human byte size (deterministic, no locale dependency). */
export function formatByteSize(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb * 10) / 10} KB`;
  return `${Math.round((kb / 1024) * 10) / 10} MB`;
}

/** Human dimensions, or an em dash when unknown. */
export function formatDimensions(width: number | null | undefined, height: number | null | undefined): string {
  if (width == null || height == null) return "—";
  return `${width}×${height}`;
}

/** True when any Article or BrandSettings still points at the asset. */
export function isReferenced(refs: MediaReferenceCount): boolean {
  return refs.total > 0;
}

/** Plain-language reference status for the admin UI. */
export function referenceSummary(refs: MediaReferenceCount): string {
  if (refs.total === 0) return "Not referenced — safe to delete.";
  const parts: string[] = [];
  if (refs.articles > 0) parts.push(`${refs.articles} article${refs.articles === 1 ? "" : "s"}`);
  if (refs.brand > 0) parts.push("brand settings");
  return `Referenced by ${parts.join(" and ")}.`;
}
