import { TrackedLink } from "@/components/analytics/tracked-link";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { NumerologyToolPanel } from "@/modules/numerology/components/numerology-tool-panel";

export const metadata = buildPageMetadata({
  title: "Premium Numerology Calculator",
  description:
    "Calculate Birth, Destiny, Name, and compound numbers with premium structured numerology interpretation for relationships, career, and decision clarity.",
  path: "/numerology",
  keywords: [
    "numerology calculator",
    "birth number calculator",
    "destiny number calculator",
    "name number",
    "navagraha numerology",
  ],
});
export const revalidate = 3600;

export default function NumerologyPage() {
  return (
    <>
      <PageViewTracker page="/numerology" feature="numerology-page" />

      <PageHero
        eyebrow="Premium Numerology Utility"
        title="A richer numerology profile built for clarity, depth, and practical guidance."
        description="Generate Birth, Destiny, and Name numbers with compound-number context, then review structured tendencies across relationships, career, and financial decisions."
        highlights={[
          "Deterministic DOB + name processing with strict input validation.",
          "Core numbers plus compound-number layer for richer context.",
          "Premium structured interpretation blocks ready for AI/report integration.",
        ]}
        note="This numerology layer is intentionally structured and conservative: practical guidance, no exaggerated certainty."
        primaryAction={{
          href: "#numerology-tool",
          label: "Start Free Analysis",
          eventName: "cta_click",
          eventPayload: {
            page: "/numerology",
            feature: "numerology-hero-primary",
          },
        }}
        secondaryAction={{
          href: "/ai",
          label: "Try NAVAGRAHA AI",
          eventName: "cta_click",
          eventPayload: {
            page: "/numerology",
            feature: "numerology-hero-secondary",
          },
        }}
        supportTitle="Core Number Snapshot"
      />

      <Section
        tone="light"
        eyebrow="Numerology Tool"
        title="Enter your details once and generate a premium numerology profile."
        description="The result is organized for immediate use today and future expansion into report and assistant intelligence layers."
      >
        <div id="numerology-tool">
          <NumerologyToolPanel />
        </div>
      </Section>

      <Section
        tone="muted"
        eyebrow="How It Works"
        title="Three clean steps behind the calculation."
        description="The upgraded flow keeps numerology accurate, deterministic, and ready for deeper interpretation surfaces."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Validate inputs",
              description:
                "Date format is validated before calculation. Optional name input is sanitized for letter mapping.",
            },
            {
              title: "Compute core numbers",
              description:
                "Birth/Psychic and Destiny/Life Path numbers are derived first, then optional Name Number and compound values are added.",
            },
            {
              title: "Return premium context",
              description:
                "Outputs include personality tendencies, strengths, caution areas, relationship style, career tendency, and money/decision tendency.",
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
            <Badge tone="accent">Continue Journey</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[var(--color-ink-strong)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Move from numerology insight into chart and AI guidance.
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Start with free utility output, then continue into Kundli and NAVAGRAHA AI for broader astrological context.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <TrackedLink
              href="/kundli"
              eventName="cta_click"
              eventPayload={{
                page: "/numerology",
                feature: "numerology-final-kundli",
              }}
              className={buttonStyles({
                size: "lg",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Generate Your Kundli
            </TrackedLink>
            <TrackedLink
              href="/ai"
              eventName="cta_click"
              eventPayload={{
                page: "/numerology",
                feature: "numerology-final-ai",
              }}
              className={buttonStyles({
                size: "lg",
                tone: "secondary",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Explore NAVAGRAHA AI
            </TrackedLink>
          </div>
        </Card>
      </Section>
    </>
  );
}
