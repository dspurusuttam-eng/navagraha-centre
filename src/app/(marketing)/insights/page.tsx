import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { AdReadyZone } from "@/components/site/ad-ready-zone";
import { PageHero } from "@/components/site/page-hero";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import {
  getContentAdapter,
  getInsightsCollectionStructuredData,
} from "@/modules/content";
import { ContentCard } from "@/modules/content/components/content-card";
import {
  insightsCategories,
  insightsSeoLandings,
} from "@/modules/content/insights-authority";
import { RevenuePathwaysCard } from "@/modules/subscriptions/components/revenue-readiness-panels";

export const metadata = buildPageMetadata({
  title: "Insights",
  description:
    "Explore NAVAGRAHA CENTRE insights with premium astrology categories, featured articles, and latest authority content.",
  path: "/insights",
  keywords: [
    "astrology insights",
    "vedic astrology content",
    "rashifal articles",
    "astrology guides",
    "remedies insights",
  ],
});
export const revalidate = 3600;

export default async function InsightsPage() {
  const contentAdapter = getContentAdapter();
  const entries = await contentAdapter.listPublishedEntries();
  const featuredEntries = entries.slice(0, 3);
  const latestEntries = entries.slice(3, 9);

  return (
    <>
      <PageViewTracker page="/insights" feature="insights-page" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getInsightsCollectionStructuredData()),
        }}
      />

      <PageHero
        eyebrow="Insights Authority Engine"
        title="Astrology insights built for authority, trust, and practical action."
        description="The insights system is structured as a premium editorial engine: category pathways, searchable topic surfaces, and conversion-safe links into Kundli, NAVAGRAHA AI, and consultation."
        highlights={[
          "Category-driven discovery for Rashifal, remedies, relationships, and career.",
          "Article templates with authorship, structured sections, and practical guidance.",
          "SEO-safe internal linking across Rashifal, AI, Kundli, and related articles.",
        ]}
        note="All content remains human-reviewed and aligned with trust-safe premium communication."
        primaryAction={{ href: "/kundli", label: "Generate Kundli" }}
        secondaryAction={{ href: "/ai", label: "Try NAVAGRAHA AI" }}
        supportTitle="Editorial Foundation"
      />

      <Section
        eyebrow="Content Categories"
        title="Navigate insights by category."
        description="Choose a category to explore focused content clusters and conversion pathways."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {insightsCategories.map((category) => (
            <Card key={category.slug} interactive className="flex h-full flex-col gap-4">
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {category.title}
              </h2>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {category.description}
              </p>
              <Link
                href={category.path}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center",
                })}
              >
                Open Category
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="muted"
        eyebrow="SEO Surfaces"
        title="High-intent astrology search pathways."
        description="These SEO surfaces route daily horoscope intent into trusted articles, Rashifal pages, and chart-aware tools."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {insightsSeoLandings.map((landing) => (
            <Card key={landing.slug} interactive className="flex h-full flex-col gap-4">
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {landing.title}
              </h2>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {landing.description}
              </p>
              <Link
                href={landing.path}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center",
                })}
              >
                Open SEO Surface
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        eyebrow="Featured Articles"
        title="High-signal editorial pieces from the authority library."
        description="These featured articles anchor the insights system with durable, high-intent topics."
      >
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {featuredEntries.map((entry) => (
            <ContentCard key={entry.slug} entry={entry} />
          ))}
        </div>
      </Section>

      <Section
        tone="muted"
        eyebrow="Latest Articles"
        title="Freshly updated content for daily and seasonal engagement."
        description="Latest updates keep the insights system active for return users and search consistency."
      >
        <AdReadyZone className="mb-6" />
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {latestEntries.map((entry) => (
            <ContentCard key={entry.slug} entry={entry} />
          ))}
        </div>
      </Section>

      <Section className="pt-0" tone="transparent">
        <RevenuePathwaysCard
          pagePath="/insights"
          title="Continue from insights into guided astrology pathways"
          description="Read trusted content first, then move into chart reports, consultation, and optional spiritual add-ons with clear progression."
        />
      </Section>
    </>
  );
}
