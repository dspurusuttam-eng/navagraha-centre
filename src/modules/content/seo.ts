import type { Metadata } from "next";
import { createArticleMetadata } from "@/lib/seo/metadata";
import {
  createArticleSchema,
  createBreadcrumbSchema,
  createCollectionPageSchema,
  createFaqSchema,
  createPersonSchema,
  type JsonLdRecord,
} from "@/lib/seo/schema";
import {
  defaultLocale,
  resolveLocale,
  type SupportedLocale,
} from "@/modules/localization/config";
import type { ContentEntry } from "@/modules/content/types";

type ContentMetadataOptions = {
  locale?: string | null;
  explicitLocalePrefix?: boolean;
  alternatesByLocale?: Partial<Record<SupportedLocale, string>>;
};

function getCollectionInfo(path: string) {
  if (path.startsWith("/from-the-desk")) {
    return {
      path: "/from-the-desk",
      label: "From the Desk of J P Sarmah",
    };
  }

  return {
    path: "/insights",
    label: "Insights",
  };
}

export function buildContentMetadata(
  entry: ContentEntry,
  options?: ContentMetadataOptions
): Metadata {
  const locale = resolveLocale(options?.locale);

  return createArticleMetadata({
    title: entry.seoTitle || entry.title,
    description: entry.seoDescription || entry.description,
    path: entry.path,
    locale,
    explicitLocalePrefix: options?.explicitLocalePrefix,
    alternatesByLocale: options?.alternatesByLocale,
    keywords: entry.keywords,
    imagePath: entry.featuredImage?.src,
    publishedTime: entry.publishedAt,
    modifiedTime: entry.updatedAt,
    authors: [entry.author.name],
    index: entry.status === "published",
  });
}

export function getContentStructuredData(
  entry: ContentEntry,
  options?: {
    locale?: string | null;
    explicitLocalePrefix?: boolean;
  }
) {
  const locale = resolveLocale(options?.locale);
  const collection = getCollectionInfo(entry.path);
  const structuredData: JsonLdRecord[] = [
    createBreadcrumbSchema({
      locale,
      explicitLocalePrefix: options?.explicitLocalePrefix,
      items: [
        { name: "Home", path: "/" },
        { name: collection.label, path: collection.path },
        { name: entry.title, path: entry.path },
      ],
    }),
    createArticleSchema({
      title: entry.title,
      description: entry.description,
      path: entry.path,
      locale,
      explicitLocalePrefix: options?.explicitLocalePrefix,
      publishedAt: entry.publishedAt,
      updatedAt: entry.updatedAt,
      imagePath: entry.featuredImage?.src,
      category: entry.category,
      keywords: entry.keywords,
      authorName: entry.author.name,
    }),
    createPersonSchema({
      locale,
      path: "/joy-prakash-sarmah",
    }),
  ];

  if (entry.faqItems?.length) {
    structuredData.push(
      createFaqSchema({
        questions: entry.faqItems,
      })
    );
  }

  return structuredData;
}

export function getInsightsCollectionStructuredData(options?: {
  locale?: string | null;
}) {
  const locale = resolveLocale(options?.locale);

  return createCollectionPageSchema({
    name: "From the Desk of J P Sarmah",
    description:
      "Official NAVAGRAHA CENTRE editorial desk for Daily Rashifal, Panchang guidance, Vedic astrology insights, and remedies.",
    path: "/from-the-desk",
    locale,
  });
}

export function getDefaultContentAlternates() {
  return {
    [defaultLocale]: "/from-the-desk",
  } as Partial<Record<SupportedLocale, string>>;
}
