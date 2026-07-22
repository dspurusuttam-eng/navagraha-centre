import Image from "next/image";
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
import { ArticleShareBar } from "@/modules/content/components/article-share-bar";
import { ArticleLikeButton } from "@/modules/content/components/article-like-button";
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

  // A slug with no published entry must 404 here, before anything is sent.
  // This used to return a fabricated "published" article -- real-looking title,
  // author and a publishedAt of `now` -- which made generateMetadata succeed, so
  // Next committed the response head with status 200. The page body below then
  // called notFound(), but the status was already on the wire: the not-found UI
  // streamed inside a 200. Deleted and never-existent articles therefore kept
  // answering 200 forever, which is precisely the stale-content condition the
  // Founder's publish/delete certification has to be able to detect.
  if (!entry) {
    notFound();
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

  return (
    <>
      <PageViewTracker
        page={`/from-the-desk/${entry.slug}`}
        feature={`from-the-desk-detail-${entry.slug}`}
      />
      <AnalyticsEventTracker
        event="from_the_desk_read"
        payload={{
          // `route` is the only one of these the analytics writer actually
          // stores; `page` and `feature` are dropped on the floor. Without it
          // every article read was recorded with a NULL route, so the Admin
          // console could show a healthy total for article views while
          // "Most viewed" sat empty — the share event carried `route` and
          // ranked correctly, which is what exposed the difference.
          route: `/from-the-desk/${entry.slug}`,
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
        className="pb-10 xl:pb-12"
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
            {entry.featuredImage ? (
              // Above the fold on the article, so this one is eager with high priority; the
              // fixed 16:9 box reserves layout space so the LCP image cannot shift the page.
              <div className="relative mt-2 aspect-[16/9] w-full overflow-hidden rounded-[var(--ui-radius-lg)] bg-[color:var(--ui-color-surface-muted,#f5f2ec)]">
                <Image
                  alt={entry.featuredImage.alt}
                  className="object-cover"
                  fill
                  priority
                  // Hero only. At the default q=75 the optimizer delivered the
                  // cover at 35.6 dB PSNR against its master — measurably soft
                  // on a phone. Cards keep the lighter default; raising just
                  // this one image keeps the extra bytes on the LCP asset the
                  // reader actually looks at.
                  quality={90}
                  sizes="(max-width: 768px) 100vw, 768px"
                  src={entry.featuredImage.src}
                />
              </div>
            ) : null}
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
                <div className="flex flex-wrap items-center gap-2">
                  <ArticleLikeButton slug={entry.slug} />
                </div>
                <ArticleShareBar
                  // Curated published copy only (SEO description → summary →
                  // excerpt), straight from the article DTO — never page text.
                  excerpt={entry.seoDescription || entry.description || entry.excerpt}
                  locale={locale}
                  route={entry.path}
                  title={entry.title}
                  url={publicUrl}
                />
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
