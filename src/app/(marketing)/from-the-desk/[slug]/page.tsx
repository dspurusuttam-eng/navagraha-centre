import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { ConsultationCTA } from "@/components/monetization/ConsultationCTA";
import { GemstoneGuidanceCTA } from "@/components/monetization/GemstoneGuidanceCTA";
import { ReportCTA } from "@/components/monetization/ReportCTA";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import {
  buildContentMetadata,
  contentTypeLabels,
  getContentAdapter,
  getContentStructuredData,
} from "@/modules/content";
import { AdSlot } from "@/modules/content/components/ad-slot";
import { AuthorAuthorityBlock } from "@/modules/content/components/author-authority-block";
import { ContentCard } from "@/modules/content/components/content-card";
import { EditorialAttribution } from "@/modules/content/components/editorial-attribution";
import { getDeskCopy } from "@/modules/content/from-desk-copy";
import type { ContentEntry } from "@/modules/content/types";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

type DeskArticleDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(value: string, locale?: string) {
  return new Date(value).toLocaleDateString(locale ?? "en-IN", {
    dateStyle: "medium",
  });
}

function getPracticalGuidance(entry: ContentEntry) {
  if (entry.heroHighlights.length) {
    return entry.heroHighlights.slice(0, 4);
  }

  return entry.sections.flatMap((section) => section.paragraphs).slice(0, 4);
}

function getContextualCtas(entry: ContentEntry) {
  if (entry.category === "Gemstones") {
    return [
      { href: "/shop", label: "Explore Gemstone Products" },
      { href: "/consultation", label: "Consult Before Purchase" },
    ] as const;
  }

  if (entry.category === "Compatibility") {
    return [
      { href: "/compatibility", label: "Open Compatibility Tool" },
      { href: "/reports", label: "View Full Compatibility Reports" },
    ] as const;
  }

  if (entry.category === "Panchang") {
    return [
      { href: "/panchang", label: "Open Panchang Tool" },
      { href: "/muhurta", label: "Check Time Tools" },
    ] as const;
  }

  if (entry.category === "NAVAGRAHA AI Updates") {
    return [
      { href: "/ai", label: "Try NAVAGRAHA AI" },
      { href: "/reports", label: "Generate Chart Report" },
    ] as const;
  }

  return [
    { href: "/rashifal", label: "Open Rashifal" },
    { href: "/reports", label: "View Reports" },
  ] as const;
}

function buildShareLinks(currentUrl: string, title: string) {
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);

  return [
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ] as const;
}

export async function generateStaticParams() {
  const entries = await getContentAdapter().listPublishedEntries();

  return entries.map((entry) => ({
    slug: entry.slug,
  }));
}

export async function generateMetadata({ params }: DeskArticleDetailPageProps) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const contentAdapter = getContentAdapter();
  const entry = await contentAdapter.getPublishedEntryBySlugForLocale(slug, locale);

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
        content: "Editorial content placeholder",
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
  const copy = getDeskCopy(locale);
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });
  const contentAdapter = getContentAdapter();
  const entry = await contentAdapter.getPublishedEntryBySlugForLocale(slug, locale);

  if (!entry) {
    notFound();
  }

  const relatedEntries = entry.relatedSlugs?.length
    ? (
        await Promise.all(
          entry.relatedSlugs.map((relatedTranslationGroup) =>
            contentAdapter.getPublishedEntryByTranslationGroupForLocale(
              relatedTranslationGroup,
              locale
            )
          )
        )
      ).filter((value): value is NonNullable<typeof value> => value !== null)
    : [];
  const structuredData = getContentStructuredData(entry, {
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
  });
  const practicalGuidance = getPracticalGuidance(entry);
  const contextualCtas = getContextualCtas(entry);
  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://navagrahacentre.com"}${localizeHref(entry.path)}`;
  const shareLinks = buildShareLinks(publicUrl, entry.title);

  return (
    <>
      <PageViewTracker
        page={`/from-the-desk/${entry.slug}`}
        feature={`from-the-desk-detail-${entry.slug}`}
      />

      {structuredData.map((record, index) => (
        <script
          key={`${entry.slug}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(record) }}
        />
      ))}

      <Section className="pb-0">
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
          <Link href={localizeHref("/")} className="hover:text-[var(--color-ink-strong)]">
            Home
          </Link>
          <span>/</span>
          <Link
            href={localizeHref("/from-the-desk")}
            className="hover:text-[var(--color-ink-strong)]"
          >
            {copy.deskBreadcrumb}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-ink-strong)]">{entry.title}</span>
        </nav>
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="accent">{entry.category}</Badge>
            <Badge tone="neutral">{contentTypeLabels[entry.type]}</Badge>
            <Badge tone="neutral">{entry.readingTime}</Badge>
          </div>
          <h1
            className="font-[family-name:var(--font-display)] text-[length:var(--font-size-display-sm)] text-[var(--color-ink-strong)]"
            style={{ letterSpacing: "var(--tracking-display)" }}
          >
            {entry.title}
          </h1>
          <p className="text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            {entry.excerpt}
          </p>
          <div className="grid gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.76)] p-4 sm:grid-cols-2">
            <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
              Published: {formatDate(entry.publishedAt, locale)}
            </p>
            <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
              Updated: {formatDate(entry.updatedAt, locale)}
            </p>
            <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
              Author: {entry.authorName}
            </p>
            <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
              Role: {entry.authorTitle}
            </p>
          </div>
          {entry.featuredImage ? (
            <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.68)]">
              <Image
                src={entry.featuredImage.src}
                alt={entry.featuredImage.alt}
                width={1200}
                height={675}
                className="h-auto w-full object-cover"
              />
            </div>
          ) : null}
        </Card>
      </Section>

      <Section className="pt-6" tone="light">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(310px,0.8fr)]">
          <article className="space-y-6">
            <AdSlot placement="after-intro" />

            {entry.sections.map((section) => (
              <Card key={section.title} className="space-y-4">
                <h2
                  className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]"
                  style={{ letterSpacing: "var(--tracking-display)" }}
                >
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Card>
            ))}

            {entry.dailyRashifal ? (
              <Card className="space-y-4">
                <h2
                  className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]"
                  style={{ letterSpacing: "var(--tracking-display)" }}
                >
                  Zodiac Guidance Sections
                </h2>
                <div className="space-y-4">
                  {entry.dailyRashifal.zodiacSections.map((section) => (
                    <div
                      key={section.sign}
                      className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.78)] p-4"
                    >
                      <h3 className="text-[length:var(--font-size-body-lg)] text-[var(--color-ink-strong)]">
                        {section.title}
                      </h3>
                      <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                        {section.overview}
                      </p>
                      <div className="mt-3 grid gap-2 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)] sm:grid-cols-2">
                        <p>Love: {section.love}</p>
                        <p>Career: {section.career}</p>
                        <p>Business: {section.business}</p>
                        <p>Lucky Color: {section.luckyColor}</p>
                        <p>Lucky Number: {section.luckyNumber}</p>
                        <p>Lucky Time: {section.luckyTime}</p>
                      </div>
                      <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                        Remedy: {section.remedy}
                      </p>
                    </div>
                  ))}
                </div>
                {entry.dailyRashifal.remedies.length ? (
                  <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.74)] p-4">
                    <h3 className="text-[length:var(--font-size-body-md)] text-[var(--color-ink-strong)]">
                      Daily Remedy Notes
                    </h3>
                    <ul className="mt-2 space-y-2 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                      {entry.dailyRashifal.remedies.map((remedy) => (
                        <li key={remedy}>- {remedy}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  {entry.dailyRashifal.brandFooter}
                </p>
              </Card>
            ) : null}

            <Card className="space-y-4">
              <h2
                className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]"
                style={{ letterSpacing: "var(--tracking-display)" }}
              >
                Practical Guidance
              </h2>
              <div className="space-y-3">
                {practicalGuidance.map((item) => (
                  <p
                    key={item}
                    className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]"
                  >
                    - {item}
                  </p>
                ))}
              </div>
            </Card>

            <AdSlot placement="mid-article" />

            <Card tone="accent" className="space-y-4">
              <h2
                className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]"
                style={{ letterSpacing: "var(--tracking-display)" }}
              >
                Continue With Related Tools
              </h2>
              <div className="flex flex-wrap gap-3">
                {contextualCtas.map((cta) => (
                  <Link
                    key={cta.href}
                    href={localizeHref(cta.href)}
                    className={buttonStyles({ size: "sm" })}
                  >
                    {cta.label}
                  </Link>
                ))}
                <Link
                  href={localizeHref("/consultation")}
                  className={buttonStyles({ tone: "secondary", size: "sm" })}
                >
                  Book Consultation
                </Link>
              </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <ConsultationCTA
                pagePath={`/from-the-desk/${entry.slug}`}
                placement="article_end"
              />
              <ReportCTA
                pagePath={`/from-the-desk/${entry.slug}`}
                placement="article_end"
              />
            </div>

            {entry.category === "Gemstones" ? (
              <GemstoneGuidanceCTA
                pagePath={`/from-the-desk/${entry.slug}`}
                placement="article_end"
              />
            ) : null}

            <Card className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                Share
              </p>
              <div className="flex flex-wrap gap-3">
                {shareLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonStyles({ tone: "tertiary", size: "sm" })}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </Card>
          </article>

          <aside className="space-y-6">
            <AuthorAuthorityBlock consultationHref={localizeHref("/consultation")} />
            <EditorialAttribution author={entry.author} reviewer={entry.reviewer} />
            <AdSlot placement="sidebar" className="hidden xl:block" />
          </aside>
        </div>
      </Section>

      <Section tone="muted">
        <AdSlot placement="before-related" />
        {relatedEntries.length ? (
          <div className="mt-6 space-y-5">
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Related Articles
            </h2>
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {relatedEntries.map((relatedEntry) => (
                <ContentCard key={relatedEntry.id} entry={relatedEntry} locale={locale} />
              ))}
            </div>
          </div>
        ) : null}
      </Section>
    </>
  );
}
