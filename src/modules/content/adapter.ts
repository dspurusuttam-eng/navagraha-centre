import {
  contentTypeDescriptions,
  contentTypeLabels,
  curatedContentEntries,
} from "@/modules/content/catalog";
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
  listListingGroups(): Promise<ContentListingGroup[]>;
  listSitemapEntries(): Promise<ContentSitemapEntry[]>;
}

function sortByPublishedDateDesc(a: ContentEntry, b: ContentEntry) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

const contentTypeOrder: readonly ContentType[] = [
  "BLOG_ARTICLE",
  "SERVICE_PAGE",
  "REMEDIES_ARTICLE",
  "MONTHLY_FORECAST",
  "DAILY_HOROSCOPE",
  "FAQ_PAGE",
] as const;

export const catalogContentAdapter: ContentAdapter = {
  key: "catalog",
  async listPublishedEntries() {
    return [...curatedContentEntries]
      .filter((entry) => entry.status === "published")
      .sort(sortByPublishedDateDesc);
  },
  async getPublishedEntryBySlug(slug) {
    return (
      curatedContentEntries.find(
        (entry) => entry.slug === slug && entry.status === "published"
      ) ?? null
    );
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
    }));
  },
};
