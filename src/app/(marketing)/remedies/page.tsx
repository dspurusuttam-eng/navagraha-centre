import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { PageHero } from "@/components/site/page-hero";
import { createToolMetadata } from "@/lib/seo/metadata";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import {
  getRelatedProductsForRemedySlugs,
  getShopProductsByCategory,
  getShopCategorySummaries,
} from "@/modules/shop";

type RemedyCategoryCard = {
  title: string;
  status: string;
  description: string;
  href: string;
  ctaLabel: string;
  tone?: "accent" | "secondary" | "ghost";
};

const remedyReadinessItems = [
  {
    title: "Birth date",
    status: "Required",
    description:
      "Anchors any later remedy review to verified birth context instead of guesswork.",
  },
  {
    title: "Birth time",
    status: "Required",
    description:
      "Helps keep house, Lagna, and timing-aware support grounded in a real chart foundation.",
  },
  {
    title: "Birth place",
    status: "Required",
    description:
      "Used only for protected chart calculations and never exposed in the public page output.",
  },
  {
    title: "Active Kundli",
    status: "Protected",
    description:
      "The safe public page only continues into deeper remedial review when chart context is available.",
  },
  {
    title: "Latitude / longitude",
    status: "Optional",
    description:
      "Useful when a protected chart source needs a tighter location reference.",
  },
  {
    title: "Timezone",
    status: "Optional",
    description:
      "Keeps local civil time consistent if a verified chart path is connected later.",
  },
] as const;

const remedyCategoryCards: readonly RemedyCategoryCard[] = [
  {
    title: "Gemstone",
    status: "Analysis preparing",
    description:
      "Personalized gemstone analysis is still preparing. When protected chart context is connected, the page can point you toward the live shop category without inventing a prescription.",
    href: "/shop#shop-gemstones",
    ctaLabel: "Open Shop",
  },
  {
    title: "Rudraksha",
    status: "Analysis preparing",
    description:
      "Personalized Rudraksha analysis is still preparing. Optional spiritual support stays consultation-led and never becomes a forced purchase or guaranteed fix.",
    href: "/shop#shop-rudraksha",
    ctaLabel: "Open Shop",
  },
  {
    title: "Mala",
    status: "Analysis preparing",
    description:
      "Personalized mala analysis is still preparing. The public page stays calm and only points to the real catalog when you want to browse.",
    href: "/shop#shop-malas",
    ctaLabel: "Open Shop",
  },
  {
    title: "Mantra",
    status: "Analysis preparing",
    description:
      "Personalized mantra analysis is still preparing. Any future guidance stays optional, reflective, and free of outcome guarantees.",
    href: "/shop#shop-mantra-remedies",
    ctaLabel: "Open Shop",
  },
  {
    title: "Charity / Donation",
    status: "Analysis preparing",
    description:
      "Personalized charity guidance is still preparing. Support remains voluntary, proportional, and advisory rather than compulsory.",
    href: "/consultation",
    ctaLabel: "Book Consultation",
    tone: "secondary",
  },
  {
    title: "Fasting / Vrat",
    status: "Analysis preparing",
    description:
      "Personalized fasting guidance is still preparing. The public page avoids any claim that fasting is mandatory or that harm follows if it is skipped.",
    href: "/navagraha-ai",
    ctaLabel: "Ask NAVAGRAHA AI",
    tone: "secondary",
  },
  {
    title: "Spiritual Discipline",
    status: "Analysis preparing",
    description:
      "Personalized discipline guidance is still preparing. Reflection, pacing, and routine stay supportive only, never as cures or guarantees.",
    href: "/consultation",
    ctaLabel: "Book Consultation",
    tone: "secondary",
  },
] as const;

const heroActions = [
  {
    href: "/kundli",
    label: "Generate Kundli",
    tone: "accent" as const,
    feature: "remedies-hero-kundli",
  },
  {
    href: "/shop",
    label: "Open Shop",
    tone: "secondary" as const,
    feature: "remedies-hero-shop",
  },
] as const;

const nextActions = [
  {
    href: "/navagraha-ai",
    label: "Ask NAVAGRAHA AI",
    tone: "secondary" as const,
    feature: "remedies-next-ai",
  },
  {
    href: "/reports",
    label: "View Reports",
    tone: "secondary" as const,
    feature: "remedies-next-reports",
  },
  {
    href: "/consultation",
    label: "Book Consultation",
    tone: "secondary" as const,
    feature: "remedies-next-consultation",
  },
  {
    href: "/shop",
    label: "Browse Shop",
    tone: "accent" as const,
    feature: "remedies-next-shop",
  },
] as const;

function RemedyCategoryCard({
  item,
}: Readonly<{
  item: RemedyCategoryCard;
}>) {
  return (
    <Card
      tone="default"
      className="flex h-full flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
            Remedy Category
          </p>
          <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
            {item.title}
          </h3>
        </div>
        <Badge tone={item.status === "Shop-ready" ? "trust" : "neutral"}>
          {item.status}
        </Badge>
      </div>
      <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
        {item.description}
      </p>
      <TrackedLink
        href={item.href}
        eventName="cta_click"
        eventPayload={{ page: "/remedies", feature: `remedies-${item.title.toLowerCase().replace(/\s+/g, "-")}` }}
        className={buttonStyles({
          size: "sm",
          tone: item.tone ?? "accent",
          className: "w-full justify-center",
        })}
      >
        {item.ctaLabel}
      </TrackedLink>
    </Card>
  );
}

function ShopConnectionCard({
  title,
  description,
  href,
  count,
}: Readonly<{
  title: string;
  description: string;
  href: string;
  count: number;
}>) {
  return (
    <Card
      tone="light"
      className="flex h-full flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.04)] before:opacity-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
            Shop Connection
          </p>
          <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
            {title}
          </h3>
        </div>
        <Badge tone="trust">{count} items</Badge>
      </div>
      <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
        {description}
      </p>
      <TrackedLink
        href={href}
        eventName="shop_interaction"
        eventPayload={{ page: "/remedies", feature: `remedies-shop-${title.toLowerCase().replace(/\s+/g, "-")}` }}
        className={buttonStyles({
          size: "sm",
          tone: "secondary",
          className: "w-full justify-center",
        })}
      >
        Browse Category
      </TrackedLink>
    </Card>
  );
}

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return createToolMetadata({
    title: "Astrology Remedies",
    description:
      "Explore optional spiritual remedies with calm, consultation-led guidance. Shop connections stay safe, transparent, and free of guaranteed outcome claims.",
    path: "/remedies",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "astrology remedies",
      "gemstone guidance",
      "rudraksha guidance",
      "mantra remedies",
      "optional spiritual support",
    ],
  });
}

export const revalidate = 3600;

export default async function RemediesPage() {
  const shopCategorySummaries = getShopCategorySummaries();
  const shopCategorySections = getShopProductsByCategory();
  const shopCategoryCountByKey = new Map(
    shopCategorySections.map((section) => [section.category, section.products.length] as const)
  );
  const relatedShopByRemedy = getRelatedProductsForRemedySlugs([
    "five-mukhi-rudraksha",
    "sandalwood-japa-mala",
    "yellow-sapphire-review",
    "surya-yantra-contemplation",
    "navagraha-puja-observance",
    "adi-gayatri-mantra",
    "sunrise-discipline-window",
  ]);

  return (
    <>
      <PageViewTracker page="/remedies" feature="remedies-page" />
      <AnalyticsEventTracker
        event="page_view"
        payload={{ page: "/remedies", feature: "remedies-page" }}
      />

      <main className="min-h-screen bg-[#FFFFFF] pb-[calc(7rem+env(safe-area-inset-bottom))] text-[color:var(--color-ink-strong)] md:pb-0">
        <PageHero
          eyebrow="Astrology Remedies"
          title="Optional spiritual remedies, presented with restraint and care."
          description="Explore gemstone, Rudraksha, mala, mantra, donation, fasting, and spiritual discipline guidance as supportive pathways only. No remedy is guaranteed, and no fear-based pressure is used."
          highlights={[
            "Guidance stays consultation-led and optional.",
            "Shop connections use live catalog categories only.",
            "Health, money, and legal decisions always remain outside remedy claims.",
          ]}
          note="Use remedies as a reflective support layer, not as a cure or a certainty claim. If a case is complex, consultation is the safer next step."
          primaryAction={heroActions[0]}
          secondaryAction={heroActions[1]}
          supportTitle="Remedy Trust Markers"
        />

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Birth Readiness"
          title="Verified chart context should be present before any personalized remedy path."
          description="The public page keeps the birth flow protected and only moves forward when the chart foundation is available."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(300px,0.98fr)]">
            <Card
              tone="default"
              className="space-y-4 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <div className="space-y-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Readiness Checklist
                </Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  Remedy analysis depends on verified birth context
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Use this checklist as a safe reminder of what the protected chart path needs before remedy detail is shown.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {remedyReadinessItems.map((item) => (
                  <Card
                    key={item.title}
                    tone="default"
                    className="flex h-full flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_10px_24px_rgba(17,24,39,0.04)] before:opacity-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                          Birth Input
                        </p>
                        <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
                          {item.title}
                        </h3>
                      </div>
                      <Badge tone={item.status === "Protected" ? "accent" : "neutral"}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                      {item.description}
                    </p>
                  </Card>
                ))}
              </div>
            </Card>

            <Card
              tone="accent"
              className="space-y-4 border-[rgba(184,137,67,0.2)] bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <Badge tone="accent">Safe Empty State</Badge>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Personalized remedy analysis preparing. The page stays calm and transparent until a protected chart context is connected.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Remedy engine
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    Existing remedy logic remains deeper in the platform, but this public page only shows safe preparation states.
                  </p>
                </div>
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Safety
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    No raw chart JSON, private data, or fear-based remedy claims are shown on this public route.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Remedy Categories"
          title="Choose the support style first, then continue into the live category or consultation."
          description="Categories stay in analysis-preparing mode until protected chart context is available. Shop links go only to existing live categories."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {remedyCategoryCards.map((item) => (
              <RemedyCategoryCard key={item.title} item={item} />
            ))}
          </div>
        </Section>

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Shop CTA Readiness"
          title="Live shop categories are linked only where real products already exist."
          description="No product names, prices, or availability are invented here. The page only points into the current catalog structure."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shopCategorySummaries.map((summary) => (
              <ShopConnectionCard
                key={summary.key}
                title={summary.label}
                description={summary.description}
                href={`/shop#${summary.anchorId}`}
                count={shopCategoryCountByKey.get(summary.key) ?? 0}
              />
            ))}
          </div>
        </Section>

        <Section
          tone="muted"
          category="utilities"
          eyebrow="Linked Remedies"
          title="Existing remedy-linked products stay connected to the live catalog."
          description="These are actual catalog links only, not fabricated remedy products or prices."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from(relatedShopByRemedy.values())
              .flat()
              .slice(0, 6)
              .map((product) => (
                <Card
                  key={product.slug}
                  tone="default"
                  className="flex h-full flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.04)] before:opacity-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                        Related Product
                      </p>
                      <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
                        {product.name}
                      </h3>
                    </div>
                    <Badge tone="trust">{product.categoryLabel}</Badge>
                  </div>
                  <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    {product.summary}
                  </p>
                  <p className="text-[0.72rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    {product.priceLabel}
                  </p>
                  <TrackedLink
                    href={product.href}
                    eventName="shop_interaction"
                    eventPayload={{ page: "/remedies", feature: `remedies-linked-${product.slug}` }}
                    className={buttonStyles({
                      size: "sm",
                      tone: "secondary",
                      className: "w-full justify-center",
                    })}
                  >
                    View Product
                  </TrackedLink>
                </Card>
              ))}
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Next Actions"
          title="Continue into the right layer when you want more context."
          description="Use the public remedy page as an optional support layer, then move into chart, report, or human-guided review as needed."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {nextActions.map((cta) => (
              <TrackedLink
                key={cta.label}
                href={cta.href}
                eventName="cta_click"
                eventPayload={{ page: "/remedies", feature: cta.feature }}
                className={buttonStyles({
                  size: "lg",
                  tone: cta.tone,
                  className: "w-full justify-center",
                })}
              >
                {cta.label}
              </TrackedLink>
            ))}
          </div>
        </Section>
      </main>
    </>
  );
}
