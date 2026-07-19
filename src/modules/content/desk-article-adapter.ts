// Claude C8A — server-only public Desk adapter over the Admin-managed Article model.
// Mirrors the method names of the existing catalog ContentAdapter (the subset the Desk
// routes use), so the /from-the-desk routes wire in without changing their shape.
//
// Failure posture: the public site must never 500 or leak because the database is
// unavailable. Every read is wrapped; on failure the adapter degrades to "no content"
// (empty listing / null entry -> 404) and never surfaces an error, query or connection
// detail to the caller.
import "server-only";

import { unstable_cache } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import {
  PUBLIC_CONTENT_REVALIDATE_SECONDS,
  PUBLIC_CONTENT_TAGS,
} from "@/lib/public-content-cache";
import {
  PUBLIC_DESK_LOCALES,
  PUBLIC_DESK_STATUS,
  isPublicDeskLocale,
  safeDeskRead,
  toPublicDeskEntries,
  type DeskArticleSource,
} from "@/modules/content/desk-article-core";
import { defaultLocale, normalizeLocaleCode } from "@/modules/localization/config";
import type { ContentEntry } from "@/modules/content/types";
import type { SupportedLocale } from "@/modules/localization/config";

/** Hard cap on a public listing read. */
const DESK_LIST_LIMIT = 200;

/** Only the columns the public Desk needs — no author email, no internal audit fields. */
const deskArticleSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  summary: true,
  body: true,
  language: true,
  category: true,
  status: true,
  seoTitle: true,
  seoDescription: true,
  readingTimeMinutes: true,
  isFeatured: true,
  displayOrder: true,
  publishedAt: true,
  updatedAt: true,
  coverImageAssetId: true,
  author: { select: { name: true } },
} as const;

type DeskArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  summary: string | null;
  body: string | null;
  language: string;
  category: string | null;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
  readingTimeMinutes: number | null;
  isFeatured: boolean;
  displayOrder: number;
  publishedAt: Date | null;
  updatedAt: Date;
  coverImageAssetId: string | null;
  author: { name: string } | null;
};

function toSource(row: DeskArticleRow, cover: { url: string; altText: string | null } | null): DeskArticleSource {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    summary: row.summary,
    body: row.body,
    language: row.language,
    category: row.category,
    status: row.status,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    readingTimeMinutes: row.readingTimeMinutes,
    isFeatured: row.isFeatured,
    displayOrder: row.displayOrder,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    coverImage: cover,
    authorName: row.author?.name ?? null,
  };
}

/** Resolve cover media for the given asset ids (missing/deleted references degrade to none). */
async function loadCoverImages(assetIds: readonly string[]): Promise<Map<string, { url: string; altText: string | null }>> {
  const ids = [...new Set(assetIds)];
  if (!ids.length) return new Map();
  const assets = await getPrisma().mediaAsset.findMany({
    where: { id: { in: ids } },
    select: { id: true, url: true, altText: true },
  });
  return new Map(assets.map((asset) => [asset.id, { url: asset.url, altText: asset.altText }]));
}

/**
 * Publicly visible Desk entries, newest-first within display order.
 * The status/locale/date gate is applied in SQL *and* re-applied in the pure core, so a
 * query change can never silently widen public exposure.
 */
async function readPublicEntries(now: Date): Promise<ContentEntry[]> {
  const rows = (await getPrisma().article.findMany({
    where: {
      status: PUBLIC_DESK_STATUS,
      language: { in: [...PUBLIC_DESK_LOCALES] },
      publishedAt: { not: null, lte: now },
    },
    select: deskArticleSelect,
    orderBy: [{ displayOrder: "asc" }, { publishedAt: "desc" }, { slug: "asc" }],
    take: DESK_LIST_LIMIT,
  })) as DeskArticleRow[];

  const covers = await loadCoverImages(
    rows.map((row) => row.coverImageAssetId).filter((id): id is string => Boolean(id)),
  );
  const sources = rows.map((row) => toSource(row, row.coverImageAssetId ? covers.get(row.coverImageAssetId) ?? null : null));
  // Defence in depth: the pure gate runs again over whatever the query returned.
  return toPublicDeskEntries(sources, now);
}

// Perf: the whole public Desk read (articles + covers + the pure publish gate) is cached so
// list pages, article pages and the home rail never repeat the database round trips on
// navigation. `now` is taken when the cache entry is (re)built: Admin publish/update actions
// invalidate the tag immediately, and scheduled `publishedAt` flips surface within the
// revalidate window. The error-throwing read stays inside the cache; `safeDeskRead` remains
// outside so a transient failure degrades for that request without caching the empty state.
const readPublicEntriesCached = unstable_cache(
  async (): Promise<ContentEntry[]> => readPublicEntries(new Date()),
  ["public-desk-entries"],
  {
    tags: [PUBLIC_CONTENT_TAGS.deskContent],
    revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
  },
);

function toLocale(value?: string | null): SupportedLocale {
  return normalizeLocaleCode(value) ?? defaultLocale;
}

export type DeskContentAdapter = {
  key: "admin-article";
  listPublishedEntries(): Promise<ContentEntry[]>;
  listPublishedEntriesByLocale(locale?: string | null): Promise<ContentEntry[]>;
  getPublishedEntryBySlugForLocale(slug: string, locale?: string | null): Promise<ContentEntry | null>;
  listTranslationAlternates(translationGroup: string): Promise<Partial<Record<SupportedLocale, string>>>;
};

export const adminArticleDeskAdapter: DeskContentAdapter = {
  key: "admin-article",

  async listPublishedEntries() {
    return safeDeskRead(() => readPublicEntriesCached(), []);
  },

  async listPublishedEntriesByLocale(locale) {
    return safeDeskRead(async () => {
      const requested = toLocale(locale);
      const entries = await readPublicEntriesCached();
      // A non-public locale (e.g. bn) never falls back to another locale's content; it
      // simply has no Desk content of its own beyond the default-locale set.
      const target = isPublicDeskLocale(requested) ? requested : defaultLocale;
      const localized = entries.filter((entry) => entry.locale === target);
      if (localized.length) return localized;
      return entries.filter((entry) => entry.locale === defaultLocale);
    }, []);
  },

  async getPublishedEntryBySlugForLocale(slug, locale) {
    return safeDeskRead(async () => {
      const requested = toLocale(locale);
      const entries = await readPublicEntriesCached();
      const exact = entries.find((entry) => entry.slug === slug && entry.locale === requested);
      if (exact) return exact;
      // Slugs are unique across the Admin model, so fall back to the slug in any public
      // locale rather than 404-ing a valid article on a locale mismatch.
      return entries.find((entry) => entry.slug === slug) ?? null;
    }, null);
  },

  async listTranslationAlternates(translationGroup) {
    return safeDeskRead(async () => {
      const entries = await readPublicEntriesCached();
      return entries
        .filter((entry) => (entry.translationGroup ?? entry.slug) === translationGroup)
        .reduce<Partial<Record<SupportedLocale, string>>>((bucket, entry) => {
          bucket[entry.locale ?? defaultLocale] = entry.path;
          return bucket;
        }, {});
    }, {});
  },
};

/** The public Desk adapter (Admin-managed Articles). */
export function getDeskContentAdapter(): DeskContentAdapter {
  return adminArticleDeskAdapter;
}
