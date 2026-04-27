import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { createBreadcrumbSchema, createPersonSchema } from "@/lib/seo/schema";
import {
  getContentAdapter,
  getInsightsCollectionStructuredData,
} from "@/modules/content";
import { AdSlot } from "@/modules/content/components/ad-slot";
import { AuthorAuthorityBlock } from "@/modules/content/components/author-authority-block";
import { ContentCard } from "@/modules/content/components/content-card";
import { getDeskCopy } from "@/modules/content/from-desk-copy";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

type DeskLandingPageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
  }>;
};

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("fromTheDesk", locale);

  return createPageMetadata({
    title: localized.title,
    description: localized.description,
    path: "/from-the-desk",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "From the Desk of J P Sarmah",
      "daily rashifal publishing",
      "vedic astrology insights",
      "panchang guidance",
      "astrology remedies",
    ],
  });
}

export const revalidate = 900;

function normalizeSearch(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export default async function FromTheDeskPage({
  searchParams,
}: Readonly<DeskLandingPageProps>) {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const copy = getDeskCopy(locale);
  const params = (await searchParams) ?? {};
  const activeCategory = params.category?.trim() ?? "";
  const searchQuery = normalizeSearch(params.q);
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });
  const contentAdapter = getContentAdapter();
  const deskSchemas = [
    getInsightsCollectionStructuredData({ locale }),
    createPersonSchema({
      locale,
      path: "/joy-prakash-sarmah",
    }),
    createBreadcrumbSchema({
      locale,
      explicitLocalePrefix: hasExplicitLocalePrefix,
      items: [
        { name: "Home", path: "/" },
        { name: "From the Desk of J P Sarmah", path: "/from-the-desk" },
      ],
    }),
  ];
  const entries = await contentAdapter.listPublishedEntriesByLocale(locale);
  const categories = Array.from(new Set(entries.map((entry) => entry.category))).sort(
    (left, right) => left.localeCompare(right)
  );
  const filteredEntries = entries.filter((entry) => {
    const categoryMatches =
      !activeCategory || entry.category.toLowerCase() === activeCategory.toLowerCase();

    if (!categoryMatches) {
      return false;
    }

    if (!searchQuery) {
      return true;
    }

    const searchableText = [
      entry.title,
      entry.excerpt,
      entry.description,
      entry.category,
      ...entry.tags,
      ...entry.keywords,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchQuery);
  });
  const featuredRashifal =
    filteredEntries.find((entry) => entry.type === "DAILY_RASHIFAL") ??
    entries.find((entry) => entry.type === "DAILY_RASHIFAL");
  const latestArticles = filteredEntries
    .filter((entry) => entry.slug !== featuredRashifal?.slug)
    .slice(0, 9);

  return (
    <>
      <PageViewTracker page="/from-the-desk" feature="from-the-desk-landing" />
      <JsonLd id="from-the-desk-schema" data={deskSchemas} />

      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.subtitle}
        highlights={[
          "Manual Daily Rashifal publishing with structured zodiac blocks.",
          "Vedic astrology articles with trust-safe remedy framing.",
          "Multilingual-ready authority section built for long-term SEO growth.",
        ]}
        note="Official content identity of NAVAGRAHA CENTRE editorial publishing."
        primaryAction={{ href: localizeHref("/rashifal"), label: "Open Daily Rashifal" }}
        secondaryAction={{
          href: localizeHref("/consultation"),
          label: "Book Consultation",
        }}
        supportTitle="Authority Publishing Desk"
      />

      <Section
        eyebrow={copy.categoriesTitle}
        title="Discover by category and intent."
        description="Filter by topic and quickly move from reading into the right astrology tool or consultation path."
      >
        <form method="get" className="grid gap-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.7)] p-4 sm:grid-cols-[minmax(0,1fr)_220px_auto]">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder={copy.searchPlaceholder}
            className="min-h-11 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white px-3 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]"
          />
          <select
            name="category"
            defaultValue={activeCategory}
            className="min-h-11 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-white px-3 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-strong)]"
          >
            <option value="">{copy.allCategories}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button type="submit" className={buttonStyles({ size: "sm" })}>
            Apply
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={localizeHref("/from-the-desk")}
            className={buttonStyles({
              tone: activeCategory ? "tertiary" : "secondary",
              size: "sm",
            })}
          >
            {copy.allCategories}
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`${localizeHref("/from-the-desk")}?category=${encodeURIComponent(category)}`}
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

      {featuredRashifal ? (
        <Section
          tone="light"
          eyebrow={copy.featuredRashifalTitle}
          title={featuredRashifal.title}
          description={featuredRashifal.excerpt}
        >
          <Card className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="accent">{featuredRashifal.category}</Badge>
              <Badge tone="neutral">{featuredRashifal.readingTime}</Badge>
            </div>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              {featuredRashifal.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={localizeHref(featuredRashifal.path)}
                className={buttonStyles({ size: "sm" })}
              >
                {copy.readArticle}
              </Link>
              <Link
                href={localizeHref("/reports")}
                className={buttonStyles({ tone: "secondary", size: "sm" })}
              >
                View Reports
              </Link>
              <Link
                href={localizeHref("/consultation")}
                className={buttonStyles({ tone: "tertiary", size: "sm" })}
              >
                Consultation
              </Link>
            </div>
          </Card>
          <AdSlot placement="after-intro" />
        </Section>
      ) : null}

      <Section
        tone="muted"
        eyebrow={copy.latestArticlesTitle}
        title="Editorial publishing stream"
        description="Daily utility content plus long-form authority articles from the official desk."
      >
        {latestArticles.length ? (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {latestArticles.map((entry) => (
              <ContentCard key={entry.id} entry={entry} locale={locale} />
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
              {copy.noResults}
            </p>
          </Card>
        )}
      </Section>

      <Section tone="transparent" className="pt-0">
        <AuthorAuthorityBlock consultationHref={localizeHref("/consultation")} />
      </Section>
    </>
  );
}
