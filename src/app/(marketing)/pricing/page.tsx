import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { PremiumProductCatalogSection } from "@/modules/report/components/premium-product-catalog-section";
import { globalLabelCopy } from "@/modules/localization/copy";
import { getPlanComparisonRows } from "@/modules/subscriptions/monetization-content";

export const metadata = buildPageMetadata({
  title: "Pricing",
  description:
    "Compare Free, Premium, and Pro plans for NAVAGRAHA AI chart guidance, assistant depth, and report access.",
  path: "/pricing",
  keywords: [
    "astrology pricing",
    "kundli ai plans",
    "premium astrology membership",
  ],
});

export default function PricingPage() {
  const planRows = getPlanComparisonRows();

  return (
    <>
      <PageViewTracker page="/pricing" feature="pricing-page" />
      <AnalyticsEventTracker
        event="pricing_view"
        payload={{ page: "/pricing", surface: "public", feature: "pricing-page" }}
      />
      <Section
        eyebrow="Pricing"
        title="Choose the plan depth that matches your guidance rhythm."
        description="Free remains available for foundational use. Premium and Pro unlock deeper assistant and report continuity when you need it."
      >
        <p className="mb-4 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
          {globalLabelCopy.currencyNote}
        </p>
        <Card tone="accent" className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-3">
            <Badge tone="accent">Best starting action</Badge>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Start free if you want the chart foundation first. Move to Premium when you want deeper assistant reasoning and complete report layers.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/sign-up"
              className={buttonStyles({ size: "lg", className: "w-full justify-center sm:w-auto" })}
            >
              Start Free
            </Link>
            <TrackedLink
              href="/sign-up"
              className={buttonStyles({
                size: "lg",
                tone: "secondary",
                className: "w-full justify-center sm:w-auto",
              })}
              eventName="plan_selected"
              eventPayload={{
                page: "/pricing",
                surface: "public",
                plan: "PREMIUM",
                feature: "pricing-top-cta",
              }}
            >
              Unlock Premium
            </TrackedLink>
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-3">
          {planRows.map((row) => (
            <Card key={row.planType} className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={row.planType === "PREMIUM" ? "accent" : "neutral"}>
                  {row.title}
                </Badge>
                {row.featuredLabel ? <Badge tone="outline">Most Popular</Badge> : null}
              </div>
              <p className="text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]">
                {row.priceLabel}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {row.shortDescription}
              </p>
              <div className="space-y-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                <p>{row.aiQuestions}</p>
                <p>{row.reports}</p>
                <p>{row.assistantDepth}</p>
                <p>{row.advancedInsights}</p>
                <p>{row.continuity}</p>
              </div>
              <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Best for: {row.bestFor}
              </p>
              {row.planType === "FREE" ? (
                <Link
                  href="/sign-up"
                  className={buttonStyles({ size: "sm", tone: "secondary", className: "w-full justify-center" })}
                >
                  {row.ctaLabel}
                </Link>
              ) : (
                <TrackedLink
                  href="/sign-up"
                  className={buttonStyles({
                    size: "sm",
                    tone: row.planType === "PREMIUM" ? "accent" : "secondary",
                    className: "w-full justify-center",
                  })}
                  eventName="plan_selected"
                  eventPayload={{
                    page: "/pricing",
                    surface: "public",
                    plan: row.planType,
                    feature: "pricing-plan-selection",
                  }}
                >
                  {row.ctaLabel}
                </TrackedLink>
              )}
            </Card>
          ))}
        </div>

        <Card className="mt-6 space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Existing member
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            If you already have an account, open settings to start or manage plan checkout.
          </p>
          <Link
            href="/settings"
            className={buttonStyles({ size: "sm", tone: "secondary", className: "w-full justify-center sm:w-auto" })}
          >
            Open Member Settings
          </Link>
        </Card>

        <PremiumProductCatalogSection
          surface="public"
          pagePath="/pricing"
          planType="FREE"
          includeKeys={[
            "career-report",
            "marriage-report",
            "finance-report",
            "health-report",
            "deep-ai-reading",
            "consultation-guidance",
          ]}
          upgradeHref="/pricing"
          tone="transparent"
          eyebrow="Premium Products"
          title="What each premium product helps with"
          description="This catalog keeps report, AI depth, and consultation relationships clear before plan selection."
        />

        <Card className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Method
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Premium outputs build on Vedic sidereal chart foundations with Lahiri-aligned context.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Authority
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Consultation-led interpretation remains available under Joy Prakash Sarmah for deeper support.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Privacy
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Birth details and account data stay inside protected member flows; guidance depth is plan-aware and optional.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Payments
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Checkout and subscription state are verified server-side before plan upgrades are finalized.
            </p>
          </div>
        </Card>
      </Section>
    </>
  );
}
