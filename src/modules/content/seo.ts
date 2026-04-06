import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import type { ContentEntry } from "@/modules/content/types";

type StructuredDataRecord = Record<string, unknown>;

function buildBreadcrumbStructuredData(
  entry: ContentEntry
): StructuredDataRecord {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Insights",
        item: new URL("/insights", siteConfig.url).toString(),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: entry.title,
        item: new URL(entry.path, siteConfig.url).toString(),
      },
    ],
  };
}

function buildArticleStructuredData(entry: ContentEntry): StructuredDataRecord {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.description,
    datePublished: entry.publishedAt,
    dateModified: entry.updatedAt,
    mainEntityOfPage: new URL(entry.path, siteConfig.url).toString(),
    author: {
      "@type": "Person",
      name: entry.author.name,
      jobTitle: entry.author.title,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    reviewer: entry.reviewer
      ? {
          "@type": "Person",
          name: entry.reviewer.name,
          jobTitle: entry.reviewer.title,
        }
      : undefined,
  };
}

function buildFaqStructuredData(
  entry: ContentEntry
): StructuredDataRecord | null {
  if (!entry.faqItems?.length) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entry.faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildContentMetadata(entry: ContentEntry): Metadata {
  const url = new URL(entry.path, siteConfig.url).toString();

  return {
    title: entry.title,
    description: entry.description,
    keywords: ["NAVAGRAHA CENTRE", "Joy Prakash Sarmah", ...entry.keywords],
    alternates: {
      canonical: entry.path,
    },
    robots: {
      index: entry.status === "published",
      follow: entry.status === "published",
    },
    authors: [{ name: entry.author.name }],
    openGraph: {
      title: entry.title,
      description: entry.description,
      url,
      siteName: siteConfig.name,
      type: "article",
      publishedTime: entry.publishedAt,
      modifiedTime: entry.updatedAt,
      authors: [entry.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
    },
  };
}

export function getContentStructuredData(entry: ContentEntry) {
  const structuredData: StructuredDataRecord[] = [
    buildBreadcrumbStructuredData(entry),
    buildArticleStructuredData(entry),
  ];

  const faqStructuredData = buildFaqStructuredData(entry);

  if (faqStructuredData) {
    structuredData.push(faqStructuredData);
  }

  return structuredData;
}

export function getInsightsCollectionStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "NAVAGRAHA CENTRE Insights",
    description:
      "Editorial articles, forecasts, FAQs, and remedy guidance content from NAVAGRAHA CENTRE.",
    url: new URL("/insights", siteConfig.url).toString(),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}
