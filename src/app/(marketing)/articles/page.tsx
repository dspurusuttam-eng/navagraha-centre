import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  buildContentListingMetadata,
  getContentAdapter,
  getContentListingStructuredData,
  type ContentEntry,
} from "@/modules/content";
import { ArticlePreviewCard } from "@/modules/content/components/article-preview-card";
import { ContentLinkBlock } from "@/modules/content/components/content-link-block";
import {
  contentCategoryOrder,
  contentTagOrder,
  isPublicArticleType,
} from "@/modules/content/taxonomy";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { RetentionPreferenceBridge } from "@/modules/retention/components/retention-preference-bridge";

type ArticlesPageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    tag?: string;
  }>;
};

const pageTitle = "Learn / Articles | NAVAGRAHA CENTRE";
const pageDescription =
  "Explore NAVAGRAHA CENTRE's public learning hub for Vedic astrology basics, editorial guidance, Kundli understanding, Panchang, Dasha, Transit, remedies, Assamese learning, and Ask NI support.";

const contentPillars = [
  {
    title: "Daily Rashifal Learning",
    description: "Start with safe daily guidance, sign-by-sign awareness, and practical astrology reading habits.",
    href: "/rashifal",
  },
  {
    title: "Assamese Astrology",
    description: "Read regional guidance notes and Assamese explanations for public learning and trust.",
    href: "/from-the-desk",
  },
  {
    title: "Kundli Learning",
    description: "Understand chart foundations before moving into deeper timing or life-area questions.",
    href: "/kundli",
  },
  {
    title: "Panchang Guidance",
    description: "Connect tithi, nakshatra, and daily timing awareness with safe educational context.",
    href: "/panchang",
  },
  {
    title: "Dasha Education",
    description: "Learn how life-phase timing is studied safely and without certainty claims.",
    href: "/dasha",
  },
  {
    title: "Transit / Gochar Education",
    description: "Review planetary movement as timing context, not as a guaranteed outcome system.",
    href: "/transit",
  },
  {
    title: "Remedies Safety",
    description: "Read careful remedy guidance that avoids fear, pressure, or cure claims.",
    href: "/remedies",
  },
  {
    title: "Gemstone Caution",
    description: "Study gemstone topics with caution, review, and no instant-result framing.",
    href: "/shop",
  },
  {
    title: "Puja and Yagya Education",
    description: "Learn about ritual guidance as educational context, not a guaranteed booking outcome.",
    href: "/consultation",
  },
  {
    title: "J P Sarmah Desk",
    description: "Follow authority notes, explanation bridges, and careful editorial context.",
    href: "/from-the-desk",
  },
  {
    title: "Ask NI Support",
    description: "Use Ask NI for explanation and preparation support before consulting a human reviewer.",
    href: "/ai",
  },
] as const;

const learningPaths = [
  {
    title: "Beginner Guide",
    description: "A safe starting path for astrology terms, chart basics, and how to ask better questions.",
    href: "/consultation",
  },
  {
    title: "Daily Astrology Understanding",
    description: "Use Rashifal and Panchang together to build practical daily awareness.",
    href: "/rashifal",
  },
  {
    title: "Kundli Reading Foundation",
    description: "Generate a Kundli first, then study houses, graha influence, Dasha, and Transit layers.",
    href: "/kundli",
  },
  {
    title: "Remedy Awareness",
    description: "Understand remedy categories and boundaries before seeking personalized guidance.",
    href: "/remedies",
  },
] as const;

const safeRouteBridges = [
  { label: "Learning Library", href: "#published-articles" },
  { label: "Tools", href: "/tools" },
  { label: "Rashifal", href: "/rashifal" },
  { label: "Panchang", href: "/panchang" },
  { label: "Kundli", href: "/kundli" },
  { label: "Dasha", href: "/dasha" },
  { label: "Transit", href: "/transit" },
  { label: "Remedies", href: "/remedies" },
  { label: "Reports", href: "/reports" },
  { label: "Consultation", href: "/consultation" },
  { label: "Shop", href: "/shop" },
  { label: "From the Desk", href: "/from-the-desk" },
  { label: "Ask NI", href: "/ai" },
] as const;

function normalizeSearch(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function sortByOrder(values: readonly string[], preferredOrder: readonly string[]) {
  const orderMap = new Map(preferredOrder.map((value, index) => [value.toLowerCase(), index]));

  return [...values].sort((left, right) => {
    const leftIndex = orderMap.get(left.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = orderMap.get(right.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.localeCompare(right);
  });
}

function matchesSearch(entry: ContentEntry, searchQuery: string) {
  if (!searchQuery) {
    return true;
  }

  const searchableText = [
    entry.title,
    entry.excerpt,
    entry.description,
    entry.category,
    entry.authorName,
    entry.authorTitle,
    ...entry.tags,
    ...entry.keywords,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(searchQuery);
}

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return buildContentListingMetadata(pageTitle, pageDescription, "/articles", {
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "learn vedic astrology",
      "jyotish learning hub",
      "from the desk of J P Sarmah",
      "daily horoscope editorial",
      "vedic astrology articles",
      "panchang guidance",
    ],
  });
}

export const revalidate = 900;

export default async function ArticlesPage({
  searchParams,
}: Readonly<ArticlesPageProps>) {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const params = (await searchParams) ?? {};
  const contentAdapter = getContentAdapter();
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });

  const baseEntries = (await contentAdapter.listPublishedEntriesByLocale(locale)).filter(
    (entry) => isPublicArticleType(entry.type)
  );
  const searchQuery = normalizeSearch(params.q);
  const entries = baseEntries.filter((entry) => matchesSearch(entry, searchQuery));

  const categories = sortByOrder(
    Array.from(new Set(baseEntries.map((entry) => entry.category))).filter(Boolean),
    contentCategoryOrder
  );
  const tags = sortByOrder(
    Array.from(new Set(baseEntries.flatMap((entry) => entry.tags))).filter(Boolean),
    contentTagOrder
  );
  const activeCategory = params.category?.trim() ?? "";
  const activeTag = params.tag?.trim() ?? "";

  const filteredEntries = entries.filter((entry) => {
    const categoryMatches =
      !activeCategory || entry.category.toLowerCase() === activeCategory.toLowerCase();
    const tagMatches = !activeTag || entry.tags.some((tag) => tag.toLowerCase() === activeTag.toLowerCase());

    return categoryMatches && tagMatches;
  });

  const listingStructuredData = getContentListingStructuredData({
    title: "Learn / Articles",
    description: pageDescription,
    path: "/articles",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
  });

  return (
    <>
      <PageViewTracker page="/articles" feature="articles-listing" />
      <RetentionPreferenceBridge section="articles" />
      <JsonLd id="articles-listing-schema" data={listingStructuredData} />

      <main className="launch-page launch-page-articles bg-white text-[#111111]">
        <section className="border-b border-[#111111]/15 bg-white">
          <Container className="grid gap-8 py-10 sm:py-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:items-stretch">
            <div className="flex min-w-0 flex-col justify-between gap-7">
              <div className="space-y-5">
                <Badge tone="accent">Learning Hub</Badge>
                <div className="space-y-4">
                  <h1
                    className="max-w-4xl font-[family-name:var(--font-display)] text-[clamp(2.2rem,13vw,4.9rem)] text-[#111111] sm:text-[clamp(3.4rem,8vw,6.4rem)]"
                    style={{
                      letterSpacing: "var(--tracking-display)",
                      lineHeight: "0.88",
                    }}
                  >
                    Learn / Articles
                  </h1>
                  <p className="max-w-[46rem] text-[1.02rem] leading-[1.75] text-[#111111] sm:text-[1.14rem]">
                    A premium public learning hub for astrology education, editorial
                    guidance, chart language, timing awareness, Assamese notes, and safe
                    pathways into deeper study.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="#learning-library"
                  className={buttonStyles({
                    size: "lg",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Start Learning
                </a>
                <a
                  href="#published-articles"
                  className={buttonStyles({
                    tone: "secondary",
                    size: "lg",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Explore Articles
                </a>
                <Link
                  href="/ai"
                  className={buttonStyles({
                    tone: "tertiary",
                    size: "lg",
                    className: "w-full justify-center border-[#5eead4] sm:w-auto",
                  })}
                >
                  Ask NI
                </Link>
              </div>
            </div>

            <Card className="relative overflow-hidden border-[#111111]/15 bg-white p-0">
              <div className="absolute right-5 top-5 h-24 w-24 rounded-full border border-[#facc15]/70" />
              <div className="absolute right-12 top-12 h-10 w-10 rounded-full border border-[#86efac]/80" />
              <div className="relative grid h-full gap-5 p-5 sm:p-6">
                <div className="rounded-[var(--radius-xl)] border border-[#111111]/15 bg-white p-4">
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#111111]">
                    SEO Authority Introduction
                  </p>
                  <p className="mt-3 text-[0.96rem] leading-[1.7] text-[#111111]">
                    Read first, build chart context second, then use Ask NI or human
                    guidance when a question needs careful interpretation.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {["Daily Rashifal", "Assamese", "Kundli", "Ask NI"].map((label) => (
                    <div
                      key={label}
                      className="rounded-[var(--radius-lg)] border border-[#111111]/15 bg-white p-3 text-sm font-semibold text-[#111111]"
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="rounded-[var(--radius-xl)] border border-[#facc15]/70 bg-white p-4">
                  <p className="text-sm font-semibold text-[#111111]">Authority-led learning</p>
                  <p className="mt-2 text-sm leading-6 text-[#111111]">
                    J P Sarmah remains the human authority reference for deeper chart
                    judgment, while Ask NI supports explanation and preparation through
                    /ai.
                  </p>
                </div>
              </div>
            </Card>
          </Container>
        </section>

        <Section tone="transparent" category="content">
          <div id="learning-library" className="space-y-8">
            <div className="max-w-3xl space-y-3">
              <Badge tone="accent">Learning Categories</Badge>
              <h2 className="text-[clamp(1.7rem,7vw,3.4rem)] font-semibold leading-none text-[#111111]">
                Choose a clear learning direction.
              </h2>
              <p className="text-[1rem] leading-7 text-[#111111]">
                These categories help returning readers find the right public knowledge
                area without implying account status, gated records, or inactive commerce.
              </p>
            </div>
            <div className="grid max-w-full min-w-0 grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2 lg:grid-cols-5">
              {contentPillars.map((item) => (
                <Link
                  key={item.title}
                  href={localizeHref(item.href)}
                  className="min-w-0 rounded-[var(--radius-xl)] border border-[#111111]/15 bg-white p-4 text-[#111111] transition hover:border-[#facc15]"
                >
                  <span className="text-sm font-semibold">{item.title}</span>
                  <span className="mt-3 block text-sm leading-6">{item.description}</span>
                </Link>
              ))}
            </div>
          </div>
        </Section>

        <Section tone="transparent" category="content">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.98fr)_minmax(280px,0.62fr)]">
            <div className="space-y-5">
              <Badge tone="accent">Featured Learning Paths</Badge>
              <div className="grid gap-4 sm:grid-cols-2">
                {learningPaths.map((path) => (
                  <Link
                    key={path.title}
                    href={localizeHref(path.href)}
                    className="rounded-[var(--radius-xl)] border border-[#111111]/15 bg-white p-5 text-[#111111] transition hover:border-[#86efac]"
                  >
                    <h3 className="text-lg font-semibold">{path.title}</h3>
                    <p className="mt-3 text-sm leading-6">{path.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            <Card className="border-[#111111]/15 bg-white">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#111111]">
                Safe Learning Boundary
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-[#111111]">
                <p>Only published public learning content and route-safe guide cards are shown here.</p>
                <p>Learning notes do not replace personalized chart review or human judgment.</p>
                <p>Account-only areas, internal operations, and protected data surfaces remain excluded.</p>
              </div>
            </Card>
          </div>
        </Section>

        <Section
          tone="transparent"
          category="content"
          eyebrow="Search And Filter"
          title="Find the published article you need."
          description="Use filters for real published content. If no article exists for a topic yet, the hub still keeps the route structure safe and educational."
        >
          <form method="get" className="grid gap-3 rounded-[var(--radius-xl)] border border-[#111111]/15 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search articles"
              className="min-h-11 rounded-[var(--radius-lg)] border border-[#111111]/20 bg-white px-3 text-[length:var(--font-size-body-sm)] text-[#111111]"
            />
            <select
              name="category"
              defaultValue={activeCategory}
              className="min-h-11 rounded-[var(--radius-lg)] border border-[#111111]/20 bg-white px-3 text-[length:var(--font-size-body-sm)] text-[#111111]"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              name="tag"
              defaultValue={activeTag}
              className="min-h-11 rounded-[var(--radius-lg)] border border-[#111111]/20 bg-white px-3 text-[length:var(--font-size-body-sm)] text-[#111111]"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <button type="submit" className={buttonStyles({ size: "sm" })}>
              Apply
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={localizeHref("/articles#learning-library")}
              className={buttonStyles({
                tone: activeCategory || activeTag ? "tertiary" : "secondary",
                size: "sm",
              })}
            >
              Reset
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={`${localizeHref("/articles")}?category=${encodeURIComponent(category)}`}
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

        <Section
          tone="transparent"
          category="content"
          eyebrow="Learning Library"
          title="Published public articles."
          description="Cards come from the real publishing adapter and stay summary-safe, author-aware, and connected to public reading paths."
        >
          <div id="published-articles">
            {filteredEntries.length ? (
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {filteredEntries.map((entry) => (
                  <ArticlePreviewCard key={entry.id} entry={entry} locale={locale} />
                ))}
              </div>
            ) : (
              <Card className="space-y-4 border-[#111111]/15 bg-white">
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#111111]">
                  No published learning articles match your current filters yet.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={localizeHref("/articles#learning-library")}
                    className={buttonStyles({ size: "sm" })}
                  >
                    Reset Learning Library
                  </Link>
                  <Link
                    href={localizeHref("/rashifal")}
                    className={buttonStyles({ tone: "secondary", size: "sm" })}
                  >
                    Open Rashifal
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </Section>

        <Section tone="transparent" category="content">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(280px,0.62fr)]">
            <Card className="border-[#5eead4]/80 bg-white">
              <Badge tone="accent">Ask NI</Badge>
              <h2 className="mt-4 text-2xl font-semibold leading-tight text-[#111111]">
                Ask NI for guided explanation.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#111111]">
                Ask NI can help explain chart terms, article concepts, Panchang timing,
                Dasha and Transit language, and what to study next. It supports learning
                preparation and does not replace J P Sarmah.
              </p>
              <Link
                href="/ai"
                className={buttonStyles({
                  tone: "secondary",
                  size: "sm",
                  className: "mt-5 w-full justify-center sm:w-auto",
                })}
              >
                Ask NI
              </Link>
            </Card>

            <Card className="border-[#111111]/15 bg-white">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#111111]">
                J P Sarmah Authority
              </p>
              <p className="mt-4 text-sm leading-6 text-[#111111]">
                Learning astrology is strongest when terminology, Kundli structure,
                Dasha, Transit, Panchang, remedies, and practical context are studied
                carefully under trusted human guidance.
              </p>
            </Card>
          </div>
        </Section>

        <Section tone="transparent" category="content">
          <ContentLinkBlock
            groups={[
              {
                title: "Continue Through Safe Public Paths",
                description:
                  "Move from learning into real public tools and guidance surfaces without gated or inactive flows.",
                links: safeRouteBridges.map((route) => ({
                  href: localizeHref(route.href),
                  label: route.label,
                  description: `Open the ${route.label} public pathway for related context.`,
                })),
              },
              {
                title: "Learning Trust Boundary",
                description:
                  "The learning hub remains educational, public, and preparation-focused.",
                links: [
                  {
                    href: localizeHref("/articles#published-articles"),
                    label: "Learning Library",
                    description: "Return to published articles and topic filters.",
                  },
                  {
                    href: "/ai",
                    label: "Ask NI",
                    description: "Ask for concept explanations and study direction.",
                  },
                  {
                    href: localizeHref("/consultation"),
                    label: "Consultation",
                    description: "Use human guidance when personal interpretation is needed.",
                  },
                ],
              },
            ]}
          />
        </Section>
      </main>
    </>
  );
}
