export type ContentType =
  | "BLOG_ARTICLE"
  | "DAILY_HOROSCOPE"
  | "MONTHLY_FORECAST"
  | "REMEDIES_ARTICLE"
  | "SERVICE_PAGE"
  | "FAQ_PAGE";

export type ContentStatus = "draft" | "review" | "published" | "archived";

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

export type ContentEntry = {
  slug: string;
  path: string;
  type: ContentType;
  status: ContentStatus;
  title: string;
  excerpt: string;
  description: string;
  keywords: readonly string[];
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  heroEyebrow: string;
  heroHighlights: readonly string[];
  heroNote: string;
  author: ContentPerson;
  reviewer?: ContentPerson;
  sections: readonly ContentSection[];
  faqItems?: readonly ContentFaqItem[];
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
};
