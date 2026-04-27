import {
  contentTypeDescriptions,
  contentTypeLabels,
  curatedContentEntries,
} from "@/modules/content/catalog";
import { localizedContentOverrides } from "@/modules/content/localized-catalog";
import {
  defaultLocale,
  getLiveLocales,
  normalizeLocaleCode,
  type SupportedLocale,
} from "@/modules/localization/config";
import type {
  ContentEntry,
  ContentListingGroup,
  ContentSitemapEntry,
  ContentType,
} from "@/modules/content/types";

export interface ContentAdapter {
  key: "catalog";
  listPublishedEntries(): Promise<ContentEntry[]>;
  getPublishedEntryBySlug(slug: string): Promise<ContentEntry | null>;
  listPublishedEntriesByLocale(locale?: string | null): Promise<ContentEntry[]>;
  getPublishedEntryBySlugForLocale(
    slug: string,
    locale?: string | null
  ): Promise<ContentEntry | null>;
  getPublishedEntryByTranslationGroupForLocale(
    translationGroup: string,
    locale?: string | null
  ): Promise<ContentEntry | null>;
  listTranslationAlternates(
    translationGroup: string
  ): Promise<Partial<Record<SupportedLocale, string>>>;
  listListingGroups(): Promise<ContentListingGroup[]>;
  listSitemapEntries(): Promise<ContentSitemapEntry[]>;
}

function sortByPublishedDateDesc(a: ContentEntry, b: ContentEntry) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

const contentTypeOrder: readonly ContentType[] = [
  "DAILY_RASHIFAL",
  "BLOG_ARTICLE",
  "SERVICE_PAGE",
  "REMEDIES_ARTICLE",
  "MONTHLY_FORECAST",
  "DAILY_HOROSCOPE",
  "FAQ_PAGE",
] as const;

function withLocaleDefaults(entry: ContentEntry) {
  return {
    ...entry,
    locale: entry.locale ?? defaultLocale,
    translationGroup: entry.translationGroup ?? entry.slug,
    localizedSlug: entry.localizedSlug ?? entry.slug,
  } satisfies ContentEntry;
}

function toLocale(value?: string | null): SupportedLocale {
  return normalizeLocaleCode(value) ?? defaultLocale;
}

function withTrailingPathSegment(pathname: string, segment: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (!segments.length) {
    return `/${segment}`;
  }

  return `/${[...segments.slice(0, -1), segment].join("/")}`;
}

function buildLocalizedEntries(baseEntries: readonly ContentEntry[]) {
  const expanded: ContentEntry[] = [];

  for (const baseEntry of baseEntries) {
    const normalizedBase = withLocaleDefaults({
      ...baseEntry,
      locale: defaultLocale,
      translationGroup: baseEntry.translationGroup ?? baseEntry.slug,
      localizedSlug: baseEntry.localizedSlug ?? baseEntry.slug,
    });
    expanded.push(normalizedBase);

    const overrideSet = localizedContentOverrides[baseEntry.slug];

    if (!overrideSet) {
      continue;
    }

    for (const override of Object.values(overrideSet)) {
      if (!override) {
        continue;
      }

      expanded.push(
        withLocaleDefaults({
          ...baseEntry,
          slug: override.localizedSlug,
          localizedSlug: override.localizedSlug,
          path: withTrailingPathSegment(baseEntry.path, override.localizedSlug),
          locale: override.locale,
          translationGroup: baseEntry.translationGroup ?? baseEntry.slug,
          title: override.title,
          excerpt: override.excerpt,
          description: override.description,
          heroEyebrow: override.heroEyebrow,
          heroHighlights: override.heroHighlights,
          heroNote: override.heroNote,
          sections: override.sections,
          faqItems: override.faqItems,
        })
      );
    }
  }

  return expanded;
}

function localeSortWeight(locale: SupportedLocale) {
  const liveOrder = getLiveLocales().map((definition) => definition.code as string);
  const index = liveOrder.indexOf(locale);

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export const catalogContentAdapter: ContentAdapter = {
  key: "catalog",
  async listPublishedEntries() {
    return buildLocalizedEntries(
      [...curatedContentEntries]
      .filter((entry) => entry.status === "published")
    )
      .sort((left, right) => {
        const dateDiff = sortByPublishedDateDesc(left, right);

        if (dateDiff !== 0) {
          return dateDiff;
        }

        return localeSortWeight(left.locale ?? defaultLocale) -
          localeSortWeight(right.locale ?? defaultLocale);
      });
  },
  async getPublishedEntryBySlug(slug) {
    const published = await this.listPublishedEntries();

    return published.find((entry) => entry.slug === slug) ?? null;
  },
  async listPublishedEntriesByLocale(locale) {
    const requestedLocale = toLocale(locale);
    const published = await this.listPublishedEntries();
    const localizedEntries = published.filter((entry) => entry.locale === requestedLocale);

    if (localizedEntries.length) {
      return localizedEntries;
    }

    return published.filter((entry) => entry.locale === defaultLocale);
  },
  async getPublishedEntryBySlugForLocale(slug, locale) {
    const requestedLocale = toLocale(locale);
    const published = await this.listPublishedEntries();
    const exact = published.find(
      (entry) =>
        (entry.slug === slug || entry.localizedSlug === slug) &&
        entry.locale === requestedLocale
    );

    if (exact) {
      return exact;
    }

    return (
      published.find(
        (entry) =>
          (entry.slug === slug || entry.localizedSlug === slug) &&
          entry.locale === defaultLocale
      ) ?? null
    );
  },
  async getPublishedEntryByTranslationGroupForLocale(translationGroup, locale) {
    const requestedLocale = toLocale(locale);
    const published = await this.listPublishedEntries();
    const exact = published.find(
      (entry) =>
        entry.translationGroup === translationGroup &&
        entry.locale === requestedLocale
    );

    if (exact) {
      return exact;
    }

    return (
      published.find(
        (entry) =>
          entry.translationGroup === translationGroup &&
          entry.locale === defaultLocale
      ) ?? null
    );
  },
  async listTranslationAlternates(translationGroup) {
    const published = await this.listPublishedEntries();

    return published
      .filter((entry) => entry.translationGroup === translationGroup)
      .reduce<Partial<Record<SupportedLocale, string>>>((bucket, entry) => {
        bucket[entry.locale ?? defaultLocale] = entry.path;

        return bucket;
      }, {});
  },
  async listListingGroups() {
    const publishedEntries = await this.listPublishedEntries();

    return contentTypeOrder
      .map((type) => ({
        type,
        label: contentTypeLabels[type],
        description: contentTypeDescriptions[type],
        entries: publishedEntries.filter((entry) => entry.type === type),
      }))
      .filter((group) => group.entries.length);
  },
  async listSitemapEntries() {
    const publishedEntries = await this.listPublishedEntries();

    return publishedEntries.map((entry) => ({
      path: entry.path,
      lastModified: entry.updatedAt,
      locale: entry.locale ?? defaultLocale,
      translationGroup: entry.translationGroup ?? entry.slug,
    }));
  },
};
