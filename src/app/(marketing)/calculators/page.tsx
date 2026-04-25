import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { CalculatorsBundlePanel } from "@/modules/calculators/components/calculators-bundle-panel";

export const metadata = buildPageMetadata({
  title: "Astrology Calculators Bundle",
  description:
    "Use NAVAGRAHA CENTRE calculators for Nakshatra, Moon Sign, Lagna, Birth Number, Compatibility Quick Score, and Date Suitability in one premium utility bundle.",
  path: "/calculators",
  keywords: [
    "astrology calculators",
    "nakshatra calculator",
    "moon sign calculator",
    "lagna calculator",
    "compatibility calculator",
    "auspicious date check",
  ],
});
export const revalidate = 3600;

export default function CalculatorsPage() {
  return (
    <>
      <PageViewTracker page="/calculators" feature="calculators-page" />

      <PageHero
        eyebrow="Utility Expansion"
        title="Practical astrology calculators in one premium bundle."
        description="Run high-value daily calculators with deterministic chart and utility engines, then continue into deeper AI and report layers when needed."
        highlights={[
          "Nakshatra, Moon Sign, and Lagna calculators with date/time/place input.",
          "Birth Number and quick compatibility signal from numerology logic.",
          "Basic date suitability check powered by Panchang context.",
        ]}
        note="Calculators provide structured guidance support and should be paired with practical judgment."
        primaryAction={{
          href: "#calculators-bundle",
          label: "Start Free Analysis",
          eventName: "cta_click",
          eventPayload: {
            page: "/calculators",
            feature: "calculators-hero-primary",
          },
        }}
        secondaryAction={{
          href: "/ai",
          label: "Try NAVAGRAHA AI",
          eventName: "cta_click",
          eventPayload: {
            page: "/calculators",
            feature: "calculators-hero-secondary",
          },
        }}
        supportTitle="Calculator Snapshot"
      />

      <Section
        tone="light"
        eyebrow="Calculator Bundle"
        title="A clean first-pass suite for quick astrological clarity."
        description="Each calculator is lightweight, deterministic, and built for immediate utility without portal clutter."
      >
        <div id="calculators-bundle">
          <CalculatorsBundlePanel />
        </div>
      </Section>

      <Section
        tone="muted"
        eyebrow="Related Time Utility"
        title="Need focused daily timing windows?"
        description="Open Muhurta-lite for Rahu Kaal, Gulika Kaal, Yamaganda, and Abhijit Muhurta with date and place input."
      >
        <Card
          tone="light"
          className="grid gap-5 border-[rgba(184,137,67,0.24)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-2">
            <Badge tone="trust">Muhurta-lite</Badge>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Use this focused utility when you need practical daily caution/supportive time windows without a full Panchang deep-dive.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <TrackedLink
              href="/muhurta"
              eventName="muhurta_tool_click"
              eventPayload={{
                page: "/calculators",
                feature: "calculators-related-muhurta",
              }}
              className={buttonStyles({
                size: "sm",
                tone: "secondary",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Open Muhurta-lite
            </TrackedLink>
            <TrackedLink
              href="/tools"
              eventName="utility_card_click"
              eventPayload={{
                page: "/calculators",
                feature: "calculators-related-tools-hub",
              }}
              className={buttonStyles({
                size: "sm",
                tone: "tertiary",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Explore All Tools
            </TrackedLink>
          </div>
        </Card>
      </Section>

      <Section
        tone="muted"
        eyebrow="How To Use"
        title="Move from quick checks to deeper interpretation when needed."
        description="Use calculators as fast utility layers, then continue into chart, AI, report, or consultation surfaces."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Run a quick utility",
              description:
                "Start with one focused calculator to answer the immediate question.",
            },
            {
              title: "Review structured output",
              description:
                "Use main result and supporting details to form a practical first view.",
            },
            {
              title: "Go deeper if needed",
              description:
                "Continue into Kundli, NAVAGRAHA AI, reports, or consultation for richer context.",
            },
          ].map((item) => (
            <Card key={item.title} tone="light" className="space-y-3">
              <Badge tone="trust">Step</Badge>
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {item.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0" tone="transparent">
        <Card
          tone="accent"
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-3">
            <Badge tone="accent">Next Layer</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[var(--color-ink-strong)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Continue from utilities into chart-aware guidance.
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Calculators are your quick-entry layer. Kundli and NAVAGRAHA AI add deeper personalized interpretation.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <TrackedLink
              href="/kundli"
              eventName="cta_click"
              eventPayload={{
                page: "/calculators",
                feature: "calculators-final-kundli",
              }}
              className={buttonStyles({
                size: "lg",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Generate Your Kundli
            </TrackedLink>
            <TrackedLink
              href="/reports"
              eventName="premium_utility_cta_click"
              eventPayload={{
                page: "/calculators",
                feature: "calculators-final-reports",
              }}
              className={buttonStyles({
                size: "lg",
                tone: "secondary",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Get Free Report
            </TrackedLink>
          </div>
        </Card>
      </Section>
    </>
  );
}
