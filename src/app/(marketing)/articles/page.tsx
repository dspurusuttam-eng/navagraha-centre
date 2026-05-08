import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  buildContentListingMetadata,
  getContentAdapter,
  getContentListingStructuredData,
  type ContentEntry,
} from "@/modules/content";
import { ArticlePreviewCard } from "@/modules/content/components/article-preview-card";
import { ContentLinkBlock } from "@/modules/content/components/content-link-block";
import {
  contentCategoryOrder,
  contentTagOrder,
  isPublicArticleType,
} from "@/modules/content/taxonomy";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

type ArticlesPageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    tag?: string;
  }>;
};

const pageTitle = "Blog & Articles | NAVAGRAHA CENTRE";
const pageDescription =
  "Browse NAVAGRAHA CENTRE's editorial articles, public astrology guidance, and authority-led reading paths with clean internal links.";

function normalizeSearch(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function sortByOrder(values: readonly string[], preferredOrder: readonly string[]) {
  const orderMap = new Map(preferredOrder.map((value, index) => [value.toLowerCase(), index]));

  return [...values].sort((left, right) => {
    const leftIndex = orderMap.get(left.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = orderMap.get(right.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.localeCompare(right);
  });
}

function matchesSearch(entry: ContentEntry, searchQuery: string) {
  if (!searchQuery) {
    return true;
  }

  const searchableText = [
    entry.title,
    entry.excerpt,
    entry.description,
    entry.category,
    entry.authorName,
    entry.authorTitle,
    ...entry.tags,
    ...entry.keywords,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(searchQuery);
}

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return buildContentListingMetadata(pageTitle, pageDescription, "/articles", {
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "blog articles",
      "from the desk of J P Sarmah",
      "daily horoscope editorial",
      "vedic astrology articles",
      "panchang guidance",
    ],
  });
}

export const revalidate = 900;

export default async function ArticlesPage({
  searchParams,
}: Readonly<ArticlesPageProps>) {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const params = (await searchParams) ?? {};
  const contentAdapter = getContentAdapter();
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });

  const baseEntries = (await contentAdapter.listPublishedEntriesByLocale(locale)).filter(
    (entry) => isPublicArticleType(entry.type)
  );
  const searchQuery = normalizeSearch(params.q);
  const entries = baseEntries.filter((entry) => matchesSearch(entry, searchQuery));

  const categories = sortByOrder(
    Array.from(new Set(baseEntries.map((entry) => entry.category))).filter(Boolean),
    contentCategoryOrder
  );
  const tags = sortByOrder(
    Array.from(new Set(baseEntries.flatMap((entry) => entry.tags))).filter(Boolean),
    contentTagOrder
  );
  const activeCategory = params.category?.trim() ?? "";
  const activeTag = params.tag?.trim() ?? "";

  const filteredEntries = entries.filter((entry) => {
    const categoryMatches =
      !activeCategory || entry.category.toLowerCase() === activeCategory.toLowerCase();
    const tagMatches = !activeTag || entry.tags.some((tag) => tag.toLowerCase() === activeTag.toLowerCase());

    return categoryMatches && tagMatches;
  });

  const listingStructuredData = getContentListingStructuredData({
    title: "Blog & Articles",
    description: pageDescription,
    path: "/articles",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
  });

  return (
    <>
      <PageViewTracker page="/articles" feature="articles-listing" />
      <JsonLd id="articles-listing-schema" data={listingStructuredData} />

      <section className="border-b border-[color:var(--color-border)] bg-white">
        <Container className="grid gap-8 py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-start">
          <div className="space-y-6">
            <Badge tone="accent">Blog / Articles</Badge>
            <div className="space-y-4">
              <h1
                className="max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-md)] text-[var(--color-ink-strong)] sm:text-[length:var(--font-size-display-lg)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Editorial reading for astrology, remedies, and practical guidance.
              </h1>
              <p className="max-w-[44rem] text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                Find public articles, authority notes, and topic guides that stay connected to
                From the Desk, Daily Rashifal, Panchang, and consultation pathways.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={localizeHref("/from-the-desk")}
                className={buttonStyles({
                  size: "lg",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Open From the Desk
              </Link>
              <Link
                href={localizeHref("/daily-rashifal")}
                className={buttonStyles({
                  tone: "secondary",
                  size: "lg",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Daily Rashifal
              </Link>
              <Link
                href={localizeHref("/consultation")}
                className={buttonStyles({
                  tone: "tertiary",
                  size: "lg",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Book Consultation
              </Link>
            </div>
          </div>

          <Card className="space-y-4">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Publishing Safety
            </p>
            <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              <p>Only published public content is shown here.</p>
              <p>Draft, private, dashboard, and admin routes remain excluded.</p>
              <p>Assamese, English, and future multilingual publishing stay aligned to the same editorial pipeline.</p>
            </div>
          </Card>
        </Container>
      </section>

      <Section
        tone="light"
        category="content"
        eyebrow="Search And Filter"
        title="Refine by category and topic."
        description="Use a clean filter layer to move between article themes without exposing drafts or placeholders."
      >
        <form method="get" className="grid gap-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-white p-4 sm:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search articles"
            className="min-h-11 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white px-3 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]"
          />
          <select
            name="category"
            defaultValue={activeCategory}
            className="min-h-11 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white px-3 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            name="tag"
            defaultValue={activeTag}
            className="min-h-11 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white px-3 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]"
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <button type="submit" className={buttonStyles({ size: "sm" })}>
            Apply
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={localizeHref("/articles")}
            className={buttonStyles({
              tone: activeCategory || activeTag ? "tertiary" : "secondary",
              size: "sm",
            })}
          >
            Reset
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`${localizeHref("/articles")}?category=${encodeURIComponent(category)}`}
              className={buttonStyles({
                tone:
                  activeCategory.toLowerCase() === category.toLowerCase()
                    ? "secondary"
                    : "tertiary",
                size: "sm",
              })}
            >
              {category}
            </Link>
          ))}
        </div>
      </Section>

      <Section
        tone="muted"
        category="content"
        eyebrow="Published Articles"
        title="A public article index with authority and internal links."
        description="Each card stays summary-safe, shows the author/source block when available, and links into the canonical public reading surfaces."
      >
        {filteredEntries.length ? (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredEntries.map((entry) => (
              <ArticlePreviewCard key={entry.id} entry={entry} locale={locale} />
            ))}
          </div>
        ) : (
          <Card className="space-y-4">
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              No published articles match your current filters yet.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={localizeHref("/from-the-desk")} className={buttonStyles({ size: "sm" })}>
                Browse From the Desk
              </Link>
              <Link
                href={localizeHref("/daily-rashifal")}
                className={buttonStyles({ tone: "secondary", size: "sm" })}
              >
                Open Daily Rashifal
              </Link>
            </div>
          </Card>
        )}
      </Section>

      <Section tone="transparent" category="content">
        <ContentLinkBlock
          groups={[
            {
              title: "Related Astrology Tools",
              description:
                "Move from article reading into chart creation, daily guidance, and human support.",
              links: [
                {
                  href: localizeHref("/kundli"),
                  label: "Generate Kundli",
                  description: "Create your chart foundation before asking deeper questions.",
                },
                {
                  href: localizeHref("/panchang"),
                  label: "View Panchang",
                  description: "Check timing and daily context before important action.",
                },
                {
                  href: localizeHref("/reports"),
                  label: "Read Reports",
                  description: "Continue into premium report depth when you need more structure.",
                },
                {
                  href: localizeHref("/consultation"),
                  label: "Book Consultation",
                  description: "Escalate into human interpretation for nuanced situations.",
                },
              ],
            },
            {
              title: "Explore Editorial Paths",
              description:
                "These public routes keep the reading journey connected without exposing drafts or private content.",
              links: [
                {
                  href: localizeHref("/from-the-desk"),
                  label: "From the Desk",
                  description: "Open the authority desk and featured editorial notes.",
                },
                {
                  href: localizeHref("/rashifal"),
                  label: "Rashifal Hub",
                  description: "Browse the 12-sign horoscope entry hub.",
                },
                {
                  href: localizeHref("/horoscope-hub"),
                  label: "Horoscope Hub",
                  description: "Move through a broader horoscope content surface.",
                },
                {
                  href: localizeHref("/insights/remedies"),
                  label: "Remedies Articles",
                  description: "Read calm remedy guidance and support-focused content.",
                },
              ],
            },
          ]}
        />
      </Section>
    </>
  );
}
