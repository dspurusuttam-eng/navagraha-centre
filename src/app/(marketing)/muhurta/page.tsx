import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { MuhurtaLiteToolPanel } from "@/modules/muhurta-lite/components/muhurta-lite-tool-panel";

export const metadata = buildPageMetadata({
  title: "Muhurta-lite Time Tools",
  description:
    "Use Muhurta-lite daily timing tools to check Rahu Kaal, Gulika Kaal, Yamaganda, and Abhijit Muhurta by date and place.",
  path: "/muhurta",
  keywords: [
    "muhurta calculator",
    "rahu kaal today",
    "gulika kaal timing",
    "yamaganda timing",
    "abhijit muhurta calculator",
    "daily time tools",
  ],
});
export const revalidate = 3600;

export default function MuhurtaLitePage() {
  return (
    <>
      <PageViewTracker page="/muhurta" feature="muhurta-lite-page" />

      <PageHero
        eyebrow="Muhurta-lite Utility"
        title="Daily timing tools in one practical, premium utility flow."
        description="Check Rahu Kaal, Gulika Kaal, Yamaganda, and Abhijit Muhurta using date and place with timezone-aware calculation."
        highlights={[
          "Core daily time tools surfaced cleanly for quick decision support.",
          "Location-resolved sunrise/sunset context for practical timing accuracy.",
          "Conservative caution and supportive windows with no exaggerated claims.",
        ]}
        note="Muhurta-lite windows are timing references and should be combined with practical judgment."
        primaryAction={{
          href: "#muhurta-lite-tool",
          label: "Start Free Analysis",
          eventName: "cta_click",
          eventPayload: {
            page: "/muhurta",
            feature: "muhurta-hero-primary",
          },
        }}
        secondaryAction={{
          href: "/panchang",
          label: "Open Panchang",
          eventName: "cta_click",
          eventPayload: {
            page: "/muhurta",
            feature: "muhurta-hero-secondary",
          },
        }}
        supportTitle="Time Tools Snapshot"
      />

      <Section
        tone="light"
        eyebrow="Time Tools"
        title="Generate daily timing windows in seconds."
        description="Muhurta-lite keeps output concise and useful without turning into a complex ritual portal."
      >
        <div id="muhurta-lite-tool">
          <MuhurtaLiteToolPanel />
        </div>
      </Section>

      <Section
        tone="muted"
        eyebrow="How To Use"
        title="A practical three-step daily timing flow."
        description="Check time windows quickly, then continue into deeper chart-aware layers only when needed."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Set date and place",
              description:
                "Input date and location once. Timezone and coordinates are resolved automatically.",
            },
            {
              title: "Review time windows",
              description:
                "Check caution and supportive timing blocks with clear local-time labels.",
            },
            {
              title: "Decide with context",
              description:
                "Use windows as references, then pair with Panchang/Kundli for deeper context.",
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

      <Section
        tone="light"
        eyebrow="Related Tools"
        title="Pair Muhurta-lite with complementary utilities."
        description="Use the right tool combination for timing, personalization, and deeper interpretation."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              href: "/tools",
              title: "Tools Hub",
              label: "Explore All Tools",
              description:
                "Browse all utility pathways in one clean discovery surface.",
              eventName: "utility_card_click" as const,
              feature: "muhurta-related-tools-hub",
            },
            {
              href: "/panchang",
              title: "Panchang",
              label: "Open Panchang",
              description:
                "Add full daily Panchang values and transitions for richer timing context.",
              eventName: "panchang_tool_click" as const,
              feature: "muhurta-related-panchang",
            },
            {
              href: "/calculators",
              title: "Quick Calculators",
              label: "Open Calculators",
              description:
                "Run date suitability and quick chart signals before deeper planning.",
              eventName: "calculator_tool_click" as const,
              feature: "muhurta-related-calculators",
            },
            {
              href: "/consultation",
              title: "Important Date Consultation",
              label: "Book Consultation",
              description:
                "Get guided support when selecting dates for major life decisions.",
              eventName: "premium_utility_cta_click" as const,
              feature: "muhurta-related-consultation",
            },
          ].map((item) => (
            <Card key={item.title} tone="light" className="flex h-full flex-col gap-3">
              <Badge tone="trust">{item.title}</Badge>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.description}
              </p>
              <TrackedLink
                href={item.href}
                eventName={item.eventName}
                eventPayload={{ page: "/muhurta", feature: item.feature }}
                className={buttonStyles({
                  size: "sm",
                  tone: "tertiary",
                  className: "w-full justify-center",
                })}
              >
                {item.label}
              </TrackedLink>
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
              Continue into chart-aware guidance for deeper timing context.
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Muhurta-lite supports daily planning quickly; Panchang and Kundli add richer interpretive depth.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <TrackedLink
              href="/panchang"
              eventName="panchang_tool_click"
              eventPayload={{
                page: "/muhurta",
                feature: "muhurta-final-panchang",
              }}
              className={buttonStyles({
                size: "lg",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Open Panchang
            </TrackedLink>
            <TrackedLink
              href="/kundli"
              eventName="utility_card_click"
              eventPayload={{
                page: "/muhurta",
                feature: "muhurta-final-kundli",
              }}
              className={buttonStyles({
                size: "lg",
                tone: "secondary",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Generate Your Kundli
            </TrackedLink>
            <TrackedLink
              href="/consultation"
              eventName="premium_utility_cta_click"
              eventPayload={{
                page: "/muhurta",
                feature: "muhurta-final-consultation",
              }}
              className={buttonStyles({
                size: "lg",
                tone: "secondary",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Book Consultation
            </TrackedLink>
          </div>
        </Card>
      </Section>
    </>
  );
}
