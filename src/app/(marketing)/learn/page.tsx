import Link from "next/link";
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
  PremiumStatusBadge,
} from "@/components/ui/premium";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  createBreadcrumbSchema,
  createCollectionPageSchema,
} from "@/lib/seo/schema";
import { getContentAdapter } from "@/modules/content";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

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
    title: "Learn",
    description:
      "NAVAGRAHA CENTRE Learn index with real published Desk content.",
    path: "/learn",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: ["learn astrology", "vedic astrology articles", "desk articles"],
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

export default async function LearnPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });
  const entries = await getContentAdapter().listPublishedEntriesByLocale(locale);
  const categories = [...new Set(entries.map((entry) => entry.category))].sort();
  const latestEntries = entries.slice(0, 9);
  const learnSchemas = [
    createBreadcrumbSchema({
      locale,
      explicitLocalePrefix: hasExplicitLocalePrefix,
      items: [
        { name: "Home", path: "/" },
        { name: "Learn", path: "/learn" },
      ],
    }),
    createCollectionPageSchema({
      name: "Learn",
      description: "Published NAVAGRAHA CENTRE Desk content index.",
      path: "/learn",
      locale,
    }),
  ];

  return (
    <>
      <JsonLd id="learn-page-schema" data={learnSchemas} />
      <PageViewTracker page="/learn" feature="learn-index" />

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
              Learn
            </span>
          </nav>

          <div className="rounded-[var(--ui-radius-2xl)] border border-[color:var(--ui-color-border-gold)] bg-white px-5 py-6 shadow-[var(--ui-shadow-md)] sm:px-6 sm:py-8">
            <div className="flex flex-wrap gap-2">
              <PremiumStatusBadge status="LIVE">Learn</PremiumStatusBadge>
              <PremiumStatusBadge status="NEUTRAL">
                {entries.length} articles
              </PremiumStatusBadge>
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-lg)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
              Learn
            </h1>
          </div>
        </PremiumBentoSection>

        <PremiumBentoSection label="Search" className="pt-0">
          <form
            action={localizeHref("/from-the-desk")}
            className="grid gap-3 rounded-[var(--ui-radius-xl)] border border-[color:var(--ui-color-border-subtle)] bg-white p-4 shadow-[var(--ui-shadow-sm)] sm:grid-cols-[minmax(0,1fr)_auto]"
          >
            <label className="sr-only" htmlFor="learn-search">
              Search Desk
            </label>
            <Input id="learn-search" name="q" placeholder="Search Desk" />
            <Button type="submit">Search</Button>
          </form>
        </PremiumBentoSection>

        <PremiumBentoSection label="Categories" className="pt-0">
          <div className="flex min-w-0 flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                href={localizeHref(toDeskHref({ category }))}
                key={category}
              >
                <PremiumStatusBadge status="NEUTRAL">
                  {category}
                </PremiumStatusBadge>
              </Link>
            ))}
          </div>
        </PremiumBentoSection>

        <PremiumBentoSection className="pt-0">
          <PremiumSectionHeading label="Latest" />
          <PremiumBentoGrid className="sm:grid-cols-2 lg:grid-cols-3">
            {latestEntries.map((entry) => (
              <PremiumArticleCard
                category={entry.category}
                date={formatDeskDate(entry.publishedAt)}
                href={localizeHref(entry.path)}
                key={`${entry.locale ?? defaultLocale}-${entry.slug}`}
                title={entry.title}
              />
            ))}
          </PremiumBentoGrid>
        </PremiumBentoSection>
      </PremiumPageShell>
    </>
  );
}
