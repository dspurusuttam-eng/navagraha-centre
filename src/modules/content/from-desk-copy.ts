import { resolveLocale } from "@/modules/localization/config";

type DeskCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  featuredRashifalTitle: string;
  latestArticlesTitle: string;
  categoriesTitle: string;
  searchPlaceholder: string;
  allCategories: string;
  readArticle: string;
  noResults: string;
  deskBreadcrumb: string;
};

const defaultDeskCopy: DeskCopy = {
  eyebrow: "Official Editorial Desk",
  title: "From the Desk of J P Sarmah",
  subtitle:
    "The official astrology guidance desk of NAVAGRAHA CENTRE for Daily Rashifal, Panchang insight, remedies, and Vedic knowledge articles.",
  featuredRashifalTitle: "Featured Daily Rashifal",
  latestArticlesTitle: "Latest Articles",
  categoriesTitle: "Content Categories",
  searchPlaceholder: "Search articles, topics, or remedies",
  allCategories: "All Categories",
  readArticle: "Read Article",
  noResults: "No articles matched this filter. Try another category or keyword.",
  deskBreadcrumb: "From the Desk",
};

const copyByLocale: Record<string, DeskCopy> = {
  en: defaultDeskCopy,
  as: defaultDeskCopy,
  hi: defaultDeskCopy,
};

export function getDeskCopy(locale?: string | null): DeskCopy {
  const resolved = resolveLocale(locale);

  return copyByLocale[resolved] ?? copyByLocale.en;
}
