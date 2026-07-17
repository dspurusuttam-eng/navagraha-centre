import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { Card } from "@/components/ui/card";
import {
  PremiumArticleCard,
  PremiumBentoGrid,
  PremiumBentoSection,
  PremiumConsultationCard,
  PremiumPageShell,
  PremiumSectionHeading,
  PremiumStatusBadge,
} from "@/components/ui/premium";
import {
  buildContentMetadata,
  getContentStructuredData,
} from "@/modules/content";
// C8A: the Desk reads Admin-managed Articles; other surfaces keep the static catalog.
import { getDeskContentAdapter } from "@/modules/content/desk-article-adapter";
import type { ContentEntry } from "@/modules/content/types";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { seoConfig } from "@/lib/seo/seo-config";
import { RetentionPreferenceBridge } from "@/modules/retention/components/retention-preference-bridge";

type DeskArticleDetailPageProps = {
  params: Promise<{
    slug: string;
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

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return value.slice(0, 10);
  }

  return `${day} ${monthLabels[month - 1]} ${year}`;
}

function buildShareLinks(currentUrl: string, title: string) {
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);

  return [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ] as const;
}

function toRelatedEntries(
  entry: ContentEntry,
  candidates: readonly ContentEntry[]
) {
  const relatedSlugs = entry.relatedSlugs ?? [];
  const related = candidates.filter((candidate) =>
    relatedSlugs.includes(candidate.translationGroup ?? candidate.slug)
  );

  if (related.length) {
    return related.slice(0, 3);
  }

  return candidates
    .filter((candidate) => candidate.slug !== entry.slug)
    .slice(0, 3);
}

// C8A: Desk slugs now come from the database. The adapter degrades to an empty list when
// the database is unavailable (e.g. at build time), so pages simply render on demand under
// the existing `revalidate` window rather than failing the build.
export async function generateStaticParams() {
  const entries = await getDeskContentAdapter().listPublishedEntries();

  return entries.map((entry) => ({
    slug: entry.slug,
  }));
}

export async function generateMetadata({ params }: DeskArticleDetailPageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const contentAdapter = getDeskContentAdapter();
  const entry = await contentAdapter.getPublishedEntryBySlugForLocale(
    slug,
    locale
  );

  if (!entry) {
    return buildContentMetadata(
      {
        id: "desk-fallback",
        slug,
        path: `/from-the-desk/${slug}`,
        category: "Vedic Astrology",
        tags: [],
        type: "BLOG_ARTICLE",
        status: "published",
        title: "From the Desk",
        excerpt: "NAVAGRAHA CENTRE editorial content.",
        content: "NAVAGRAHA CENTRE editorial content.",
        description: "NAVAGRAHA CENTRE editorial content.",
        seoTitle: "From the Desk of J P Sarmah",
        seoDescription: "NAVAGRAHA CENTRE editorial content page.",
        isFeatured: false,
        keywords: [],
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        readingTime: "1 min read",
        readingTimeMinutes: 1,
        authorName: "J P Sarmah",
        authorTitle: "Vedic Astrologer and Spiritual Guide",
        heroEyebrow: "From the Desk",
        heroHighlights: [],
        heroNote: "",
        author: {
          name: "J P Sarmah",
          title: "Vedic Astrologer and Spiritual Guide",
          bio: "",
        },
        sections: [],
        aiDraftReady: true,
        autoPublish: false,
      },
      {
        locale,
        explicitLocalePrefix: hasExplicitLocalePrefix,
      }
    );
  }

  const alternatesByLocale = await contentAdapter.listTranslationAlternates(
    entry.translationGroup ?? entry.slug
  );

  return buildContentMetadata(entry, {
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    alternatesByLocale,
  });
}

export default async function DeskArticleDetailPage({
  params,
}: Readonly<DeskArticleDetailPageProps>) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });
  const contentAdapter = getDeskContentAdapter();
  const entry = await contentAdapter.getPublishedEntryBySlugForLocale(
    slug,
    locale
  );

  if (!entry) {
    notFound();
  }

  const entries = await contentAdapter.listPublishedEntriesByLocale(locale);
  const relatedEntries = toRelatedEntries(entry, entries);
  const structuredData = getContentStructuredData(entry, {
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
  });
  const publicUrl = `${seoConfig.siteUrl}${localizeHref(entry.path)}`;
  const shareLinks = buildShareLinks(publicUrl, entry.title);

  return (
    <>
      <PageViewTracker
        page={`/from-the-desk/${entry.slug}`}
        feature={`from-the-desk-detail-${entry.slug}`}
      />
      <AnalyticsEventTracker
        event="from_the_desk_read"
        payload={{
          page: `/from-the-desk/${entry.slug}`,
          feature: `from-the-desk-detail-${entry.slug}`,
        }}
      />
      <RetentionPreferenceBridge section="from-the-desk" />

      {structuredData.map((record, index) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(record) }}
          key={`${entry.slug}-${index}`}
          type="application/ld+json"
        />
      ))}

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
            <Link href={localizeHref("/from-the-desk")}>Desk</Link>
            <span aria-hidden="true">/</span>
            <span className="text-[color:var(--ui-color-text-primary)]">
              Article
            </span>
          </nav>

          <article className="space-y-4 rounded-[var(--ui-radius-2xl)] border border-[color:var(--ui-color-border-gold)] bg-white px-5 py-6 shadow-[var(--ui-shadow-md)] sm:px-6 sm:py-8">
            <div className="flex min-w-0 flex-wrap gap-2">
              <PremiumStatusBadge status="LIVE">
                {entry.category}
              </PremiumStatusBadge>
              <PremiumStatusBadge status="NEUTRAL">
                {formatDate(entry.publishedAt)}
              </PremiumStatusBadge>
              <PremiumStatusBadge status="NEUTRAL">
                {entry.authorName}
              </PremiumStatusBadge>
            </div>
            <h1 className="font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-lg)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
              {entry.title}
            </h1>
          </article>
        </PremiumBentoSection>

        <PremiumBentoSection className="pt-0">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.36fr)]">
            <div className="space-y-5">
              {entry.sections.map((section) => (
                <Card className="space-y-4" key={section.title} tone="muted">
                  <h2 className="font-[family-name:var(--font-family-editorial)] text-[length:var(--font-size-title-sm)] leading-[var(--line-height-heading)] text-[color:var(--ui-color-text-primary)]">
                    {section.title}
                  </h2>
                  <div className="space-y-4 text-base leading-7 text-[color:var(--ui-color-text-secondary)]">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </Card>
              ))}

              {entry.dailyRashifal ? (
                <Card className="space-y-4" tone="muted">
                  <PremiumSectionHeading label="Daily Sections" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {entry.dailyRashifal.zodiacSections.map((section) => (
                      <div
                        className="rounded-[var(--ui-radius-lg)] border border-[color:var(--ui-color-border-subtle)] bg-white p-4"
                        key={section.sign}
                      >
                        <h3 className="text-sm font-semibold text-[color:var(--ui-color-text-primary)]">
                          {section.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[color:var(--ui-color-text-secondary)]">
                          {section.overview}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : null}

              {entry.faqItems?.length ? (
                <Card className="space-y-4" tone="muted">
                  <PremiumSectionHeading label="Questions" />
                  {entry.faqItems.map((item) => (
                    <div
                      className="rounded-[var(--ui-radius-lg)] border border-[color:var(--ui-color-border-subtle)] bg-white p-4"
                      key={item.question}
                    >
                      <h3 className="text-sm font-semibold text-[color:var(--ui-color-text-primary)]">
                        {item.question}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--ui-color-text-secondary)]">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </Card>
              ) : null}
            </div>

            <aside className="space-y-5">
              <PremiumConsultationCard
                href={localizeHref("/consultation")}
                label="Consult"
              />

              <Card className="space-y-3" tone="muted">
                <PremiumSectionHeading label="Share" />
                <div className="flex flex-wrap gap-2">
                  {shareLinks.map((link) => (
                    <a
                      className="inline-flex min-h-10 items-center rounded-[var(--ui-radius-pill)] border border-[color:var(--ui-color-border-gold)] bg-white px-4 text-sm font-semibold text-[color:var(--ui-color-text-primary)] shadow-[var(--ui-shadow-sm)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-color-focus)]"
                      href={link.href}
                      key={link.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </Card>
            </aside>
          </div>
        </PremiumBentoSection>

        {relatedEntries.length ? (
          <PremiumBentoSection className="pt-0">
            <PremiumSectionHeading label="Related" />
            <PremiumBentoGrid className="sm:grid-cols-2 lg:grid-cols-3">
              {relatedEntries.map((relatedEntry) => (
                <PremiumArticleCard
                  category={relatedEntry.category}
                  date={formatDate(relatedEntry.publishedAt)}
                  href={localizeHref(relatedEntry.path)}
                  key={`${relatedEntry.locale ?? defaultLocale}-${relatedEntry.slug}`}
                  title={relatedEntry.title}
                />
              ))}
            </PremiumBentoGrid>
          </PremiumBentoSection>
        ) : null}
      </PremiumPageShell>
    </>
  );
}
