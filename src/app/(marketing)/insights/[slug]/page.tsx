import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { PageHero } from "@/components/site/page-hero";
import { AdReadyZone } from "@/components/site/ad-ready-zone";
import {
  buildContentMetadata,
  contentTypeLabels,
  getContentAdapter,
  getContentStructuredData,
} from "@/modules/content";
import { ContentCard } from "@/modules/content/components/content-card";
import { EditorialAttribution } from "@/modules/content/components/editorial-attribution";

type InsightDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatPublishedDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    dateStyle: "medium",
  });
}

export async function generateStaticParams() {
  const entries = await getContentAdapter().listPublishedEntries();

  return entries.map((entry) => ({
    slug: entry.slug,
  }));
}

export async function generateMetadata({ params }: InsightDetailPageProps) {
  const { slug } = await params;
  const entry = await getContentAdapter().getPublishedEntryBySlug(slug);

  if (!entry) {
    return buildContentMetadata({
      slug,
      path: `/insights/${slug}`,
      type: "BLOG_ARTICLE",
      status: "published",
      title: "Insight",
      excerpt: "NAVAGRAHA CENTRE content page.",
      description: "NAVAGRAHA CENTRE content page.",
      keywords: [],
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingTimeMinutes: 1,
      heroEyebrow: "Insights",
      heroHighlights: [],
      heroNote: "",
      author: {
        name: "NAVAGRAHA CENTRE",
        title: "Editorial",
        bio: "",
      },
      sections: [],
      aiDraftReady: true,
      autoPublish: false,
    });
  }

  return buildContentMetadata(entry);
}

export default async function InsightDetailPage({
  params,
}: Readonly<InsightDetailPageProps>) {
  const { slug } = await params;
  const contentAdapter = getContentAdapter();
  const entry = await contentAdapter.getPublishedEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  const relatedEntries = entry.relatedSlugs?.length
    ? (
        await Promise.all(
          entry.relatedSlugs.map((relatedSlug) =>
            contentAdapter.getPublishedEntryBySlug(relatedSlug)
          )
        )
      ).filter((value): value is NonNullable<typeof value> => value !== null)
    : [];

  const structuredData = getContentStructuredData(entry);

  return (
    <>
      {structuredData.map((record, index) => (
        <script
          key={`${entry.slug}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(record) }}
        />
      ))}

      <PageHero
        eyebrow={contentTypeLabels[entry.type]}
        title={entry.title}
        description={entry.excerpt}
        highlights={entry.heroHighlights}
        note={entry.heroNote}
        primaryAction={{ href: "/consultation", label: "Book Free Consultation" }}
        secondaryAction={{ href: "/insights", label: "Back To Insights" }}
        supportTitle="Content Snapshot"
      />

      <Section
        eyebrow="Published Detail"
        title="A public content record built for clarity, search value, and trust."
        description="The detail page keeps metadata, authorship, and structured content explicit so each article stays useful today and durable over time."
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
          <div className="space-y-6">
            {entry.sections.map((section) => (
              <Card key={section.title} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    Section
                  </p>
                  <h2
                    className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]"
                    style={{ letterSpacing: "var(--tracking-display)" }}
                  >
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Card>
            ))}

            {entry.faqItems?.length ? (
              <Card className="space-y-5">
                <div className="space-y-2">
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    Frequently Asked Questions
                  </p>
                  <h2
                    className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]"
                    style={{ letterSpacing: "var(--tracking-display)" }}
                  >
                    Structured for clarity and rich-result readiness.
                  </h2>
                </div>

                <div className="space-y-4">
                  {entry.faqItems.map((item) => (
                    <div
                      key={item.question}
                      className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.74)] px-4 py-4"
                    >
                      <p className="text-[length:var(--font-size-body-md)] text-[var(--color-ink-strong)]">
                        {item.question}
                      </p>
                      <p className="mt-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card tone="accent" className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="accent">{contentTypeLabels[entry.type]}</Badge>
                <Badge tone="neutral">
                  {entry.readingTimeMinutes} min read
                </Badge>
              </div>

              <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                <p>
                  Published:{" "}
                  <span className="text-[var(--color-ink-strong)]">
                    {formatPublishedDate(entry.publishedAt)}
                  </span>
                </p>
                <p>
                  Updated:{" "}
                  <span className="text-[var(--color-ink-strong)]">
                    {formatPublishedDate(entry.updatedAt)}
                  </span>
                </p>
                <p>
                  Editorial standard:{" "}
                  <span className="text-[var(--color-ink-strong)]">
                    Every article is reviewed for tone, safety, and factual
                    clarity before publication.
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/insights" className={buttonStyles({ size: "sm" })}>
                  More Insights
                </Link>
                <Link
                  href="/consultation"
                  className={buttonStyles({ tone: "secondary", size: "sm" })}
                >
                  Book Free Consultation
                </Link>
              </div>
            </Card>

            <EditorialAttribution
              author={entry.author}
              reviewer={entry.reviewer}
            />

            <AdReadyZone />
          </div>
        </div>
      </Section>

      {relatedEntries.length ? (
        <Section
          eyebrow="Related Reading"
          title="Connected content that deepens context without clutter."
          description="Related entries stay tightly curated so the content system remains useful and premium rather than sprawling."
          tone="muted"
        >
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {relatedEntries.map((relatedEntry) => (
              <ContentCard key={relatedEntry.slug} entry={relatedEntry} />
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
