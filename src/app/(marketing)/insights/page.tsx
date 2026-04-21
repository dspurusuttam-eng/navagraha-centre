import Link from "next/link";
import { AdReadyZone } from "@/components/site/ad-ready-zone";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { EditorialPlaceholder } from "@/components/site/editorial-placeholder";
import { PageHero } from "@/components/site/page-hero";
import { buildPageMetadata } from "@/lib/metadata";
import { ContentCard } from "@/modules/content/components/content-card";
import {
  contentHubs,
  getContentAdapter,
  getInsightsCollectionStructuredData,
} from "@/modules/content";

export const metadata = buildPageMetadata({
  title: "Insights",
  description:
    "Read editorial articles, forecasts, FAQ pages, and remedies guidance from NAVAGRAHA CENTRE.",
  path: "/insights",
  keywords: [
    "astrology blog",
    "remedy guidance articles",
    "monthly forecast",
    "daily horoscope",
    "astrology faq",
  ],
});

export default async function InsightsPage() {
  const contentAdapter = getContentAdapter();
  const [entries, groups] = await Promise.all([
    contentAdapter.listPublishedEntries(),
    contentAdapter.listListingGroups(),
  ]);
  const featuredEntries = entries.slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getInsightsCollectionStructuredData()),
        }}
      />

      <PageHero
        eyebrow="Insights"
        title="Editorial content designed for long-term authority, not filler."
        description="The insights library gives NAVAGRAHA CENTRE an evergreen content foundation for search, trust, and editorial authority. Each piece is structured for clarity, human review, and disciplined publishing."
        highlights={[
          "Typed content records for articles, forecasts, FAQs, remedy explainers, and service guides",
          "A CMS-ready adapter boundary that keeps publishing clean and portable",
          "Structured metadata and human-reviewed publishing posture from the start",
        ]}
        note="Publication remains human-reviewed and deliberate so the editorial tone stays measured and trustworthy."
        primaryAction={{ href: "/consultation", label: "Book Consultation" }}
        secondaryAction={{ href: "/services", label: "View Services" }}
        supportTitle="Editorial Foundation"
      />

      <Section
        eyebrow="Featured Edit"
        title="A compact editorial front door for search depth and trust."
        description="The featured selection surfaces the latest high-signal content first, while the grouped library below keeps the overall architecture clear and scalable."
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <EditorialPlaceholder
            eyebrow="Publishing Principles"
            title="Strong content systems rank because they stay clear, useful, and restrained."
            description="The editorial layer is built to support long-term authority: careful metadata, typed content records, structured review, and public pages that feel composed rather than automated."
            annotations={[
              "Human review before publication",
              "No mass-generated filler pages",
              "Structured data for article and FAQ surfaces",
              "CMS-ready boundary for disciplined publishing growth",
            ]}
            tone="midnight"
            className="h-full"
          />

          <div className="grid gap-6">
            {featuredEntries.map((entry) => (
              <ContentCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </div>
      </Section>

      {groups.map((group) => (
        <Section
          key={group.type}
          eyebrow={group.label}
          title={`${group.label} content with a clear SEO role.`}
          description={group.description}
          tone="muted"
        >
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {group.entries.map((entry) => (
              <ContentCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </Section>
      ))}

      <Section
        eyebrow="Knowledge Hubs"
        title="Authority hubs that connect content, tools, and conversion."
        description="Use structured hubs to navigate major astrology themes without fragmentation across the public website."
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {contentHubs.map((hub) => (
            <Card key={hub.slug} interactive className="flex h-full flex-col gap-4">
              <h3 className="text-[length:var(--font-size-body-lg)] text-[color:var(--color-foreground)]">
                {hub.title}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {hub.description}
              </p>
              <Link
                href={hub.path}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center",
                })}
              >
                Open Hub
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Publishing Boundary"
        title="Human-reviewed publishing, with clear editorial boundaries."
        description="The content system is designed for disciplined writing, careful review, and high-signal publishing without filler output."
      >
        <AdReadyZone className="mb-6" />

        <Card tone="accent" className="space-y-5">
          <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            That boundary matters for quality. The long-term goal is stronger
            search authority built on high-signal content, deliberate review,
            and a publishing system that protects tone and factual limits.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className={buttonStyles({ size: "lg" })}>
              Contact The Centre
            </Link>
            <Link
              href="/joy-prakash-sarmah"
              className={buttonStyles({ tone: "secondary", size: "lg" })}
            >
              Meet Joy Prakash Sarmah
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
