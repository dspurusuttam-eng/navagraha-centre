import type { ContentEntry } from "@/modules/content/types";

export type InsightsCategorySlug =
  | "rashifal"
  | "monthly"
  | "transits"
  | "remedies"
  | "relationships"
  | "career"
  | "spiritual";

export type InsightsCategoryConfig = {
  slug: InsightsCategorySlug;
  path: `/insights/${InsightsCategorySlug}`;
  title: string;
  eyebrow: string;
  description: string;
  metadataTitle: string;
  metadataDescription: string;
  keywords: readonly string[];
};

export const insightsCategories: readonly InsightsCategoryConfig[] = [
  {
    slug: "rashifal",
    path: "/insights/rashifal",
    title: "Rashifal Insights",
    eyebrow: "Rashifal Category",
    description:
      "Daily and practical sign-level guidance with clear links into personalized chart and AI follow-up.",
    metadataTitle: "Rashifal Insights",
    metadataDescription:
      "Explore Rashifal-focused insights, daily guidance context, and links to personalized Kundli and NAVAGRAHA AI paths.",
    keywords: [
      "rashifal insights",
      "daily horoscope guidance",
      "zodiac daily astrology",
      "vedic rashifal articles",
    ],
  },
  {
    slug: "monthly",
    path: "/insights/monthly",
    title: "Monthly Forecast Insights",
    eyebrow: "Monthly Forecast Category",
    description:
      "Monthly outlook content designed for planning, reflection, and practical timing themes.",
    metadataTitle: "Monthly Astrology Insights",
    metadataDescription:
      "Read monthly astrology forecast content with practical guidance and chart-aware follow-up options.",
    keywords: [
      "monthly astrology forecast",
      "monthly horoscope insights",
      "timing guidance astrology",
    ],
  },
  {
    slug: "transits",
    path: "/insights/transits",
    title: "Transit Insights",
    eyebrow: "Transits Category",
    description:
      "Transit-style interpretation through structured forecasting and cycle-based context.",
    metadataTitle: "Transit Astrology Insights",
    metadataDescription:
      "Explore transit-focused astrology insight pages with cycle interpretation and practical guidance.",
    keywords: [
      "transit astrology insights",
      "planetary transit guidance",
      "astrology timing transits",
    ],
  },
  {
    slug: "remedies",
    path: "/insights/remedies",
    title: "Remedies Insights",
    eyebrow: "Remedies Category",
    description:
      "Responsible remedy guidance with transparent framing, practical caution, and no fear-based pressure.",
    metadataTitle: "Astrology Remedies Insights",
    metadataDescription:
      "Read remedy-focused insights with transparent, trust-safe framing and practical next-step guidance.",
    keywords: [
      "astrology remedies",
      "spiritual remedy guidance",
      "vedic remedy insights",
    ],
  },
  {
    slug: "relationships",
    path: "/insights/relationships",
    title: "Relationship Insights",
    eyebrow: "Relationships Category",
    description:
      "Compatibility and relationship-oriented content designed for calm interpretation and real-world context.",
    metadataTitle: "Relationship Astrology Insights",
    metadataDescription:
      "Explore relationship-focused astrology content with compatibility, communication, and practical guidance.",
    keywords: [
      "relationship astrology insights",
      "compatibility guidance",
      "love horoscope insights",
    ],
  },
  {
    slug: "career",
    path: "/insights/career",
    title: "Career Insights",
    eyebrow: "Career Category",
    description:
      "Career and professional-growth guidance connected to chart context and report follow-up flows.",
    metadataTitle: "Career Astrology Insights",
    metadataDescription:
      "Read career-focused astrology insights and continue into chart-aware reports and AI guidance.",
    keywords: [
      "career astrology insights",
      "professional astrology guidance",
      "career prediction articles",
    ],
  },
  {
    slug: "spiritual",
    path: "/insights/spiritual",
    title: "Spiritual Guidance Insights",
    eyebrow: "Spiritual Category",
    description:
      "Premium spiritual guidance content for reflection, practice, and conscious decision-making.",
    metadataTitle: "Spiritual Astrology Insights",
    metadataDescription:
      "Discover spiritual guidance insights from NAVAGRAHA CENTRE with practical direction and trust-safe tone.",
    keywords: [
      "spiritual astrology insights",
      "vedic spiritual guidance",
      "astrology reflective practice",
    ],
  },
] as const;

const categorySlugToEntrySlugs: Record<InsightsCategorySlug, readonly string[]> = {
  rashifal: [
    "daily-horoscope-april-6-2026",
    "april-2026-monthly-forecast",
    "guidance-and-remedies-frequently-asked-questions",
  ],
  monthly: [
    "april-2026-monthly-forecast",
    "daily-horoscope-april-6-2026",
    "understanding-premium-consultation-journeys",
  ],
  transits: [
    "april-2026-monthly-forecast",
    "daily-horoscope-april-6-2026",
    "how-private-consultations-are-structured",
  ],
  remedies: [
    "how-to-approach-remedies-with-discernment",
    "guidance-and-remedies-frequently-asked-questions",
    "understanding-premium-consultation-journeys",
  ],
  relationships: [
    "understanding-premium-consultation-journeys",
    "guidance-and-remedies-frequently-asked-questions",
    "how-private-consultations-are-structured",
  ],
  career: [
    "understanding-premium-consultation-journeys",
    "how-private-consultations-are-structured",
    "april-2026-monthly-forecast",
  ],
  spiritual: [
    "how-to-approach-remedies-with-discernment",
    "understanding-premium-consultation-journeys",
    "guidance-and-remedies-frequently-asked-questions",
  ],
};

export type InsightsSeoLandingSlug =
  | "zodiac-daily"
  | "horoscope-keywords"
  | "astrology-guides";

export type InsightsSeoLandingConfig = {
  slug: InsightsSeoLandingSlug;
  path: `/insights/${InsightsSeoLandingSlug}`;
  title: string;
  eyebrow: string;
  description: string;
  metadataTitle: string;
  metadataDescription: string;
  keywords: readonly string[];
  highlightPoints: readonly string[];
};

export const insightsSeoLandings: readonly InsightsSeoLandingConfig[] = [
  {
    slug: "zodiac-daily",
    path: "/insights/zodiac-daily",
    title: "Zodiac Daily Pages",
    eyebrow: "SEO Surface",
    description:
      "Explore all zodiac sign daily pathways and continue into the full Rashifal system.",
    metadataTitle: "Zodiac Daily Horoscope Pages",
    metadataDescription:
      "Discover zodiac daily pages, sign-wise Rashifal links, and chart-aware daily guidance continuation paths.",
    keywords: [
      "zodiac daily horoscope",
      "daily zodiac pages",
      "sign-wise rashifal",
      "today zodiac prediction",
    ],
    highlightPoints: [
      "All 12 sign links connected to the Rashifal system.",
      "Internal links into NAVAGRAHA AI and Kundli.",
      "Designed for daily discovery and repeat engagement.",
    ],
  },
  {
    slug: "horoscope-keywords",
    path: "/insights/horoscope-keywords",
    title: "Horoscope Keyword Guides",
    eyebrow: "SEO Surface",
    description:
      "A structured surface targeting horoscope search-intent clusters with high-quality editorial routing.",
    metadataTitle: "Horoscope Keyword Insights",
    metadataDescription:
      "Explore horoscope keyword-focused pages linked to Rashifal, monthly forecast, and chart-aware astrology tools.",
    keywords: [
      "horoscope keyword guide",
      "daily horoscope intent",
      "monthly horoscope search",
      "astrology traffic pages",
    ],
    highlightPoints: [
      "Keyword intent routed into useful content, not doorway pages.",
      "Contextual links to Rashifal, Kundli, and AI assistance.",
      "Trust-safe, premium editorial format.",
    ],
  },
  {
    slug: "astrology-guides",
    path: "/insights/astrology-guides",
    title: "Astrology Guides",
    eyebrow: "SEO Surface",
    description:
      "Structured astrology guides for foundational understanding, practical application, and conversion continuity.",
    metadataTitle: "Astrology Guides and Explainers",
    metadataDescription:
      "Read astrology guides and explainers connected to NAVAGRAHA AI, Kundli generation, Rashifal, and consultation pathways.",
    keywords: [
      "astrology guides",
      "vedic astrology explainer",
      "kundli guide",
      "astrology learning content",
    ],
    highlightPoints: [
      "Foundational guides with clear, practical language.",
      "Built for authority, readability, and internal conversion.",
      "Editorially aligned with premium product surfaces.",
    ],
  },
] as const;

const seoLandingToEntrySlugs: Record<InsightsSeoLandingSlug, readonly string[]> = {
  "zodiac-daily": [
    "daily-horoscope-april-6-2026",
    "april-2026-monthly-forecast",
    "guidance-and-remedies-frequently-asked-questions",
  ],
  "horoscope-keywords": [
    "daily-horoscope-april-6-2026",
    "april-2026-monthly-forecast",
    "understanding-premium-consultation-journeys",
  ],
  "astrology-guides": [
    "understanding-premium-consultation-journeys",
    "how-private-consultations-are-structured",
    "how-to-approach-remedies-with-discernment",
  ],
};

export function getInsightsCategoryBySlug(slug: string) {
  return insightsCategories.find((category) => category.slug === slug) ?? null;
}

export function getInsightsSeoLandingBySlug(slug: string) {
  return insightsSeoLandings.find((entry) => entry.slug === slug) ?? null;
}

export function requireInsightsCategory(slug: InsightsCategorySlug) {
  const category = getInsightsCategoryBySlug(slug);

  if (!category) {
    throw new Error(`Missing insights category: ${slug}`);
  }

  return category;
}

export function requireInsightsSeoLanding(slug: InsightsSeoLandingSlug) {
  const landing = getInsightsSeoLandingBySlug(slug);

  if (!landing) {
    throw new Error(`Missing insights SEO landing: ${slug}`);
  }

  return landing;
}

export function getEntriesForInsightsCategory(
  categorySlug: InsightsCategorySlug,
  entries: readonly ContentEntry[]
) {
  const slugs = categorySlugToEntrySlugs[categorySlug];
  const entryBySlug = new Map(entries.map((entry) => [entry.slug, entry]));

  const selected = slugs
    .map((slug) => entryBySlug.get(slug) ?? null)
    .filter((entry): entry is ContentEntry => entry !== null);

  if (selected.length) {
    return selected;
  }

  return entries.slice(0, 3);
}

export function getEntriesForInsightsSeoLanding(
  landingSlug: InsightsSeoLandingSlug,
  entries: readonly ContentEntry[]
) {
  const slugs = seoLandingToEntrySlugs[landingSlug];
  const entryBySlug = new Map(entries.map((entry) => [entry.slug, entry]));

  const selected = slugs
    .map((slug) => entryBySlug.get(slug) ?? null)
    .filter((entry): entry is ContentEntry => entry !== null);

  if (selected.length) {
    return selected;
  }

  return entries.slice(0, 3);
}
