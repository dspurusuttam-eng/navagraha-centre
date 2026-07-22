import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getDeskContentAdapter } from "@/modules/content/desk-article-adapter";
import {
  defaultLocale,
  getLiveLocales,
  getLocalizedPath,
  type SupportedLocale,
} from "@/modules/localization/config";

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = NonNullable<SitemapEntry["changeFrequency"]>;

type StaticRouteDefinition = {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
};

function buildAbsoluteUrl(pathname: string) {
  return new URL(pathname, siteConfig.url).toString();
}

function buildLocalizedAbsolutePath(
  locale: SupportedLocale,
  pathname: string,
  forcePrefix = true
) {
  return buildAbsoluteUrl(
    getLocalizedPath(locale, pathname, {
      forcePrefix,
    })
  );
}

function buildAlternatesForSharedPath(pathname: string) {
  const languages: Record<string, string> = {};

  for (const locale of getLiveLocales()) {
    languages[locale.hreflang] = buildLocalizedAbsolutePath(locale.code, pathname, true);
  }

  languages["x-default"] = buildAbsoluteUrl(pathname);

  return languages;
}

function buildAlternatesForLocalizedPaths(
  pathsByLocale: Partial<Record<SupportedLocale, string>>,
  fallbackPath: string
) {
  const languages: Record<string, string> = {};

  for (const locale of getLiveLocales()) {
    const path = pathsByLocale[locale.code] ?? fallbackPath;
    languages[locale.hreflang] = buildLocalizedAbsolutePath(locale.code, path, true);
  }

  languages["x-default"] = buildAbsoluteUrl(fallbackPath);

  return languages;
}

function buildLocalizedStaticEntries(
  route: StaticRouteDefinition,
  lastModified: Date
): SitemapEntry[] {
  const alternates = buildAlternatesForSharedPath(route.path);

  return getLiveLocales().map((locale) => ({
    url: buildLocalizedAbsolutePath(locale.code, route.path, true),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: alternates,
    },
  }));
}

const staticRoutes: readonly StaticRouteDefinition[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/consultation", changeFrequency: "weekly", priority: 0.9 },
  { path: "/joy-prakash-sarmah", changeFrequency: "monthly", priority: 0.82 },
  { path: "/from-the-desk", changeFrequency: "daily", priority: 0.8 },
  // Public footer label is "Method"; /methodology stays the canonical path.
  { path: "/methodology", changeFrequency: "monthly", priority: 0.6 },
  { path: "/support", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
];

// The sitemap MUST be rendered per request, not prerendered at build time.
//
// Measured on Production: publishing an article never changed /sitemap.xml. Every
// response came back `X-Vercel-Cache: HIT` with the article set frozen as of the
// last deployment — even with a unique cache-busting query string, and even long
// past the revalidate window, with `Age` climbing monotonically and never
// resetting. A newly published article therefore never entered the sitemap, and a
// deleted one never left it, until the next deploy happened to rebuild it.
//
// The publish path does call `revalidateTag(PUBLIC_CONTENT_TAGS.deskContent)`,
// which is why the Desk listing and the home rail update immediately — those are
// dynamic routes. That tag expires the *data* cache; it does not regenerate a
// route Next has already prerendered to a static asset.
//
// Rendering on demand is the correct trade here: sitemaps are fetched rarely (by
// crawlers), and `listPublishedEntries()` underneath is still served from
// `unstable_cache` with the same tag plus a 300 s backstop, so this costs a cache
// read rather than a database round trip on the typical request.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: SitemapEntry[] = [
    {
      url: buildAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: buildAlternatesForSharedPath("/"),
      },
    },
  ];

  for (const route of staticRoutes) {
    entries.push(...buildLocalizedStaticEntries(route, now));
  }

  // Article URLs come from the SAME authoritative source as the public Desk
  // pages (Admin-managed articles), never the static demo catalog — otherwise
  // the sitemap advertises retired demo URLs and omits real publications.
  const contentAdapter = getDeskContentAdapter();
  const publishedEntries = await contentAdapter.listPublishedEntries();
  const groupedByTranslation = publishedEntries.reduce<
    Map<string, typeof publishedEntries>
  >((bucket, entry) => {
    const translationGroup = entry.translationGroup ?? entry.slug;
    const group = bucket.get(translationGroup) ?? [];
    group.push(entry);
    bucket.set(translationGroup, group);
    return bucket;
  }, new Map());

  for (const group of groupedByTranslation.values()) {
    if (!group.length) {
      continue;
    }

    const englishEntry =
      group.find((entry) => entry.locale === defaultLocale) ?? group[0];
    const alternatesByLocale = group.reduce<Partial<Record<SupportedLocale, string>>>(
      (bucket, entry) => {
        bucket[entry.locale ?? defaultLocale] = entry.path;
        return bucket;
      },
      {}
    );
    const alternates = buildAlternatesForLocalizedPaths(
      alternatesByLocale,
      englishEntry.path
    );

    entries.push(
      ...getLiveLocales().map<SitemapEntry>((locale) => {
        const localizedEntry =
          group.find((entry) => entry.locale === locale.code) ?? englishEntry;
        const isDailyRashifal = localizedEntry.type === "DAILY_RASHIFAL";
        const changeFrequency: ChangeFrequency = isDailyRashifal ? "daily" : "weekly";

        return {
          url: buildLocalizedAbsolutePath(locale.code, localizedEntry.path, true),
          lastModified: new Date(localizedEntry.updatedAt),
          changeFrequency,
          priority: isDailyRashifal ? 0.7 : 0.68,
          alternates: {
            languages: alternates,
          },
        };
      })
    );
  }

  const seen = new Set<string>();

  return entries.filter((entry) => {
    if (!entry.url || seen.has(entry.url)) {
      return false;
    }

    seen.add(entry.url);
    return true;
  });
}
