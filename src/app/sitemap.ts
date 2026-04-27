import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getContentAdapter } from "@/modules/content";
import {
  insightsCategories,
  insightsSeoLandings,
} from "@/modules/content/insights-authority";
import {
  defaultLocale,
  getLiveLocales,
  getLocalizedPath,
  type SupportedLocale,
} from "@/modules/localization/config";
import { rashifalSigns } from "@/modules/rashifal/content";
import { listShopProducts } from "@/modules/shop";

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
  { path: "/kundli", changeFrequency: "weekly", priority: 0.9 },
  { path: "/compatibility", changeFrequency: "weekly", priority: 0.9 },
  { path: "/rashifal", changeFrequency: "daily", priority: 0.9 },
  { path: "/panchang", changeFrequency: "daily", priority: 0.9 },
  { path: "/numerology", changeFrequency: "weekly", priority: 0.9 },
  { path: "/navagraha-ai", changeFrequency: "weekly", priority: 0.9 },
  { path: "/reports", changeFrequency: "weekly", priority: 0.9 },
  { path: "/consultation", changeFrequency: "weekly", priority: 0.9 },
  { path: "/shop", changeFrequency: "weekly", priority: 0.7 },
  { path: "/from-the-desk", changeFrequency: "daily", priority: 0.8 },
  { path: "/insights", changeFrequency: "daily", priority: 0.8 },
  { path: "/tools", changeFrequency: "weekly", priority: 0.7 },
  { path: "/calculators", changeFrequency: "weekly", priority: 0.7 },
  { path: "/muhurta", changeFrequency: "weekly", priority: 0.7 },
  { path: "/ai", changeFrequency: "weekly", priority: 0.9 },
  { path: "/services", changeFrequency: "monthly", priority: 0.6 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/disclaimer", changeFrequency: "yearly", priority: 0.4 },
  { path: "/refund-cancellation", changeFrequency: "yearly", priority: 0.4 },
  ...insightsCategories.map((category) => ({
    path: category.path,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  })),
  ...insightsSeoLandings.map((landing) => ({
    path: landing.path,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  })),
];

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

  for (const sign of rashifalSigns) {
    const path = `/rashifal/${sign.slug}`;
    const alternates = buildAlternatesForSharedPath(path);

    entries.push(
      ...getLiveLocales().map((locale) => ({
        url: buildLocalizedAbsolutePath(locale.code, path, true),
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.72,
        alternates: {
          languages: alternates,
        },
      }))
    );
  }

  for (const product of listShopProducts()) {
    const alternates = buildAlternatesForSharedPath(product.href);

    entries.push(
      ...getLiveLocales().map((locale) => ({
        url: buildLocalizedAbsolutePath(locale.code, product.href, true),
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: {
          languages: alternates,
        },
      }))
    );
  }

  const contentAdapter = getContentAdapter();
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
