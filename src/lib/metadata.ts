import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: readonly string[];
  index?: boolean;
};

function shouldIndexPath(path: string) {
  return !(
    path.startsWith("/dashboard") ||
    path.startsWith("/settings") ||
    path.startsWith("/sign-") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/style-guide") ||
    path.startsWith("/admin")
  );
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  index,
}: PageMetadataInput): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const shouldIndex = index ?? shouldIndexPath(path);
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
      index: shouldIndex,
      follow: shouldIndex,
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
