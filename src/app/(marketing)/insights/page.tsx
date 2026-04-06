import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { EditorialPlaceholder } from "@/components/site/editorial-placeholder";
import { PageHero } from "@/components/site/page-hero";
import { buildPageMetadata } from "@/lib/metadata";
import { ContentCard } from "@/modules/content/components/content-card";
import {
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
        description="The insights library gives NAVAGRAHA CENTRE an evergreen content foundation for search, trust, and future editorial expansion. Each piece is structured for clarity, human review, and disciplined publishing."
        highlights={[
          "Typed content records for articles, forecasts, FAQs, remedy explainers, and service guides",
          "A CMS-ready adapter boundary without tying the public site to a live CMS yet",
          "Structured metadata and human-reviewed publishing posture from the start",
        ]}
        note="The system is prepared for assisted drafting later, but publication remains intentionally human-reviewed and deliberate."
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
              "CMS-ready boundary for later expansion",
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
        eyebrow="Publishing Boundary"
        title="Ready for assisted drafting, not automated publishing."
        description="The adapter and content types are ready for a future AI-assisted draft workflow, but nothing in this phase auto-publishes or mass-produces content."
      >
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
