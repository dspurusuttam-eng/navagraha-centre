import Link from "next/link";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PremiumArticleCard,
  PremiumBentoGrid,
  PremiumBentoSection,
  PremiumPageShell,
  PremiumSectionHeading,
  PremiumStatePanel,
  PremiumStatusBadge,
} from "@/components/ui/premium";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  createBreadcrumbSchema,
  createPersonSchema,
} from "@/lib/seo/schema";
import { getContentAdapter, type ContentEntry } from "@/modules/content";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

type FromTheDeskPageProps = {
  searchParams?: Promise<{
    category?: string;
    q?: string;
  }>;
};

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createPageMetadata({
    title: "J P Sarmah Desk",
    description:
      "Authority notes, Vedic guidance, and careful astrology learning from NAVAGRAHA CENTRE.",
    path: "/from-the-desk",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "Learn Articles",
      "J P Sarmah Desk",
      "Joy Prakash Sarmah",
      "Vedic astrology authority",
      "consultation guidance",
      "astrology learning",
      "Assamese astrology notes",
    ],
  });
}

export const revalidate = 900;

function formatDeskDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return value.slice(0, 10);
  }

  return `${day} ${monthLabels[month - 1]} ${year}`;
}

function normalizeQuery(value?: string) {
  return (value ?? "").trim();
}

function matchesQuery(entry: ContentEntry, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    entry.title,
    entry.category,
    entry.authorName,
    ...entry.tags,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function toDeskHref(params: { category?: string; q?: string }) {
  const search = new URLSearchParams();

  if (params.category) {
    search.set("category", params.category);
  }

  if (params.q) {
    search.set("q", params.q);
  }

  const suffix = search.toString();

  return suffix ? `/from-the-desk?${suffix}` : "/from-the-desk";
}

export default async function FromTheDeskPage({
  searchParams,
}: Readonly<FromTheDeskPageProps>) {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const params = (await searchParams) ?? {};
  const activeCategory = normalizeQuery(params.category);
  const query = normalizeQuery(params.q);
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });
  const entries = await getContentAdapter().listPublishedEntriesByLocale(locale);
  const categories = [...new Set(entries.map((entry) => entry.category))].sort();
  const filteredEntries = entries.filter(
    (entry) =>
      (!activeCategory || entry.category === activeCategory) &&
      matchesQuery(entry, query)
  );
  const resultLabel =
    filteredEntries.length === 1
      ? "1 result"
      : `${filteredEntries.length} results`;
  const deskSchemas = [
    createPersonSchema({
      locale,
      path: "/joy-prakash-sarmah",
    }),
    createBreadcrumbSchema({
      locale,
      explicitLocalePrefix: hasExplicitLocalePrefix,
      items: [
        { name: "Home", path: "/" },
        { name: "J P Sarmah Desk", path: "/from-the-desk" },
      ],
    }),
  ];

  return (
    <>
      <PageViewTracker page="/from-the-desk" feature="from-the-desk-page" />
      <AnalyticsEventTracker
        event="from_the_desk_read"
        payload={{ page: "/from-the-desk", feature: "from-the-desk-page" }}
      />
      <JsonLd id="from-the-desk-schema" data={deskSchemas} />

      <PremiumPageShell
        className="pb-[calc(6rem+env(safe-area-inset-bottom))] xl:pb-12"
        tone="soft"
      >
        <PremiumBentoSection className="pt-5 sm:pt-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[var(--tracking-label)] text-[color:var(--ui-color-text-muted)]"
          >
            <Link href={localizeHref("/")}>Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-[color:var(--ui-color-text-primary)]">
              Desk
            </span>
          </nav>

          <div className="rounded-[var(--ui-radius-2xl)] border border-[color:var(--ui-color-border-gold)] bg-white px-5 py-6 shadow-[var(--ui-shadow-md)] sm:px-6 sm:py-8">
            <div className="flex flex-wrap gap-2">
              <PremiumStatusBadge status="LIVE">Desk</PremiumStatusBadge>
              <PremiumStatusBadge status="NEUTRAL">Search</PremiumStatusBadge>
            </div>
            <h1 className="font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-lg)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
              J P Sarmah Desk
            </h1>
          </div>
        </PremiumBentoSection>

        <PremiumBentoSection label="Categories" className="pt-0">
          <div className="flex min-w-0 flex-wrap gap-2">
            <Link href={localizeHref(toDeskHref({ q: query }))}>
              <PremiumStatusBadge status={!activeCategory ? "LIVE" : "NEUTRAL"}>
                All
              </PremiumStatusBadge>
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={localizeHref(toDeskHref({ category, q: query }))}
              >
                <PremiumStatusBadge
                  status={activeCategory === category ? "LIVE" : "NEUTRAL"}
                >
                  {category}
                </PremiumStatusBadge>
              </Link>
            ))}
          </div>
        </PremiumBentoSection>

        <PremiumBentoSection label="Search" className="pt-0">
          <form
            action={localizeHref("/from-the-desk")}
            className="grid gap-3 rounded-[var(--ui-radius-xl)] border border-[color:var(--ui-color-border-subtle)] bg-white p-4 shadow-[var(--ui-shadow-sm)] sm:grid-cols-[minmax(0,1fr)_auto]"
          >
            {activeCategory ? (
              <input name="category" type="hidden" value={activeCategory} />
            ) : null}
            <label className="sr-only" htmlFor="desk-search">
              Search Desk
            </label>
            <Input
              defaultValue={query}
              id="desk-search"
              name="q"
              placeholder="Search Desk"
            />
            <Button type="submit">Search</Button>
          </form>
        </PremiumBentoSection>

        <PremiumBentoSection className="pt-0">
          <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <PremiumSectionHeading className="mb-2" label="Results" />
              <p className="text-sm font-medium leading-6 text-[color:var(--ui-color-text-secondary)]">
                {query ? `Query: ${query}` : "Query: All"}
                {activeCategory ? ` / Category: ${activeCategory}` : ""}
              </p>
            </div>
            <PremiumStatusBadge status="NEUTRAL">{resultLabel}</PremiumStatusBadge>
          </div>
          {filteredEntries.length ? (
            <PremiumBentoGrid className="sm:grid-cols-2 lg:grid-cols-3">
              {filteredEntries.map((entry) => (
                <PremiumArticleCard
                  key={`${entry.locale ?? defaultLocale}-${entry.slug}`}
                  category={entry.category}
                  date={formatDeskDate(entry.publishedAt)}
                  href={localizeHref(entry.path)}
                  title={entry.title}
                />
              ))}
            </PremiumBentoGrid>
          ) : (
            <PremiumStatePanel
              action={
                <Link
                  className="text-sm font-semibold text-[color:var(--ui-color-text-primary)] underline decoration-[color:var(--ui-color-border-gold)] underline-offset-4"
                  href={localizeHref("/from-the-desk")}
                >
                  Reset
                </Link>
              }
              state="empty"
              title="No Desk articles found."
            />
          )}
        </PremiumBentoSection>
      </PremiumPageShell>
    </>
  );
}
