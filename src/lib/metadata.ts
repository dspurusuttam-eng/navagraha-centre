import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: readonly string[];
};

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
}: PageMetadataInput): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const sharedKeywords = [
    "NAVAGRAHA CENTRE",
    "Joy Prakash Sarmah",
    "luxury astrology",
    "vedic astrology platform",
    "premium astrology consultation",
    "remedy guidance",
  ];

  return {
    title,
    description,
    keywords: [...sharedKeywords, ...keywords],
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
