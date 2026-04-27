import type { SupportedLocale } from "@/modules/localization/config";

export type ContentType =
  | "BLOG_ARTICLE"
  | "DAILY_RASHIFAL"
  | "DAILY_HOROSCOPE"
  | "MONTHLY_FORECAST"
  | "REMEDIES_ARTICLE"
  | "SERVICE_PAGE"
  | "FAQ_PAGE";

export type ContentStatus = "draft" | "review" | "published" | "archived";

export type ContentCategory =
  | "Daily Rashifal"
  | "Panchang"
  | "Vedic Astrology"
  | "Remedies"
  | "Numerology"
  | "Compatibility"
  | "Gemstones"
  | "Festivals"
  | "Spiritual Guidance"
  | "NAVAGRAHA AI Updates";

export type ContentPerson = {
  name: string;
  title: string;
  bio: string;
};

export type ContentSection = {
  title: string;
  paragraphs: readonly string[];
};

export type ContentFaqItem = {
  question: string;
  answer: string;
};

export type RashifalZodiacSection = {
  sign: string;
  title: string;
  overview: string;
  love: string;
  career: string;
  business: string;
  luckyColor: string;
  luckyNumber: string;
  luckyTime: string;
  remedy: string;
};

export type DailyRashifalData = {
  date: string;
  zodiacSections: readonly RashifalZodiacSection[];
  remedies: readonly string[];
  brandFooter: string;
};

export type ContentEntry = {
  id: string;
  slug: string;
  localizedSlug?: string;
  path: string;
  locale?: SupportedLocale;
  translationGroup?: string;
  category: ContentCategory;
  tags: readonly string[];
  type: ContentType;
  status: ContentStatus;
  title: string;
  excerpt: string;
  content: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl?: string;
  featuredImage?: {
    src: string;
    alt: string;
  };
  isFeatured: boolean;
  keywords: readonly string[];
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  readingTimeMinutes: number;
  authorName: string;
  authorTitle: string;
  heroEyebrow: string;
  heroHighlights: readonly string[];
  heroNote: string;
  author: ContentPerson;
  reviewer?: ContentPerson;
  sections: readonly ContentSection[];
  faqItems?: readonly ContentFaqItem[];
  dailyRashifal?: DailyRashifalData;
  relatedSlugs?: readonly string[];
  aiDraftReady: boolean;
  autoPublish: false;
};

export type ContentListingGroup = {
  type: ContentType;
  label: string;
  description: string;
  entries: ContentEntry[];
};

export type ContentSitemapEntry = {
  path: string;
  lastModified: string;
  locale: SupportedLocale;
  translationGroup: string;
};
