import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
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
        <div className="grid gap-5 lg:grid-cols-3">
          {planRows.map((row) => (
            <Card key={row.planType} className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={row.planType === "PREMIUM" ? "accent" : "neutral"}>
                  {row.title}
                </Badge>
                {row.featuredLabel ? <Badge tone="outline">Most Popular</Badge> : null}
              </div>
              <p className="text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]">
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
              </div>
              <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Best for: {row.bestFor}
              </p>
              {row.planType === "FREE" ? (
                <Link href="/sign-up" className={buttonStyles({ size: "sm", tone: "secondary" })}>
                  Start Free
                </Link>
              ) : (
                <TrackedLink
                  href="/sign-up"
                  className={buttonStyles({
                    size: "sm",
                    tone: row.planType === "PREMIUM" ? "accent" : "secondary",
                  })}
                  eventName="plan_selected"
                  eventPayload={{
                    page: "/pricing",
                    surface: "public",
                    plan: row.planType,
                    feature: "pricing-plan-selection",
                  }}
                >
                  {row.planType === "PREMIUM" ? "Unlock Premium" : "Explore Pro"}
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
          <Link href="/settings" className={buttonStyles({ size: "sm", tone: "secondary" })}>
            Open Member Settings
          </Link>
        </Card>
      </Section>
    </>
  );
}
