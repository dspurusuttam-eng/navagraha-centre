import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { createToolMetadata } from "@/lib/seo/metadata";

const dashaPreviewStates = [
  {
    title: "Current Mahadasha",
    status: "Safe Mode",
    description:
      "Verified Mahadasha data will appear after a saved chart foundation is available.",
  },
  {
    title: "Antardasha",
    status: "Ready Next",
    description:
      "Antardasha timing will unlock after the current verified Mahadasha context exists.",
  },
  {
    title: "Pratyantardasha",
    status: "Ready Next",
    description:
      "Pratyantardasha appears after verified chart data and the nested timing chain are ready.",
  },
] as const;

const dashaTimelineSteps = [
  {
    title: "Build verified chart context",
    description:
      "Dasha timing depends on a saved chart with validated birth details and Moon nakshatra context.",
  },
  {
    title: "Resolve Mahadasha and sub-cycles",
    description:
      "When chart data is present, the engine can surface Mahadasha, Antardasha, and Pratyantardasha safely.",
  },
  {
    title: "Continue into AI or reports",
    description:
      "Use NAVAGRAHA AI or reports after the timing backbone is ready and reviewed.",
  },
] as const;

const dashaActionCtas = [
  {
    href: "/kundli",
    label: "Generate Kundli",
    feature: "dasha-page-generate-kundli",
    tone: "accent" as const,
  },
  {
    href: "/navagraha-ai",
    label: "Ask NAVAGRAHA AI",
    feature: "dasha-page-ask-ai",
    tone: "secondary" as const,
  },
  {
    href: "/reports",
    label: "View Reports",
    feature: "dasha-page-view-reports",
    tone: "secondary" as const,
  },
] as const;

export const metadata = createToolMetadata({
  title: "Vimshottari Dasha Calculator",
  description:
    "Explore a safe Dasha foundation for Mahadasha, Antardasha, and Pratyantardasha readiness. Verified timing data appears only after chart context is available.",
  path: "/dasha",
  keywords: [
    "vimshottari dasha",
    "mahadasha",
    "antardasha",
    "pratyantardasha",
    "vedic timing",
  ],
});

export const revalidate = 3600;

function DashaPreviewCard({
  title,
  status,
  description,
}: Readonly<{
  title: string;
  status: string;
  description: string;
}>) {
  return (
    <Card
      tone="default"
      className="flex h-full flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
            Dasha Layer
          </p>
          <h2 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
            {title}
          </h2>
        </div>
        <Badge tone={status === "Safe Mode" ? "neutral" : "trust"}>{status}</Badge>
      </div>
      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
        {description}
      </p>
    </Card>
  );
}

export default function DashaPage() {
  return (
    <>
      <PageViewTracker page="/dasha" feature="dasha-page" />
      <AnalyticsEventTracker
        event="page_view"
        payload={{ page: "/dasha", feature: "dasha-page" }}
      />

      <main className="min-h-screen bg-[#FFFFFF] pb-[calc(7rem+env(safe-area-inset-bottom))] text-[color:var(--color-ink-strong)] md:pb-0">
        <section className="border-b border-black/8 bg-white">
          <Container className="grid gap-8 py-10 sm:py-12 lg:grid-cols-[minmax(0,1.04fr)_minmax(300px,0.96fr)] lg:items-center lg:py-14">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  NAVAGRAHA CENTRE
                </Badge>
                <Badge tone="outline" className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
                  Vimshottari Dasha
                </Badge>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h1
                  className="max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-sm)] text-[color:var(--color-ink-strong)] sm:text-[length:var(--font-size-display-lg)]"
                  style={{
                    letterSpacing: "0.01em",
                    lineHeight: "var(--line-height-tight)",
                  }}
                >
                  Vimshottari Dasha Calculator
                </h1>
                <p className="max-w-[46rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-lg)]">
                  Review Mahadasha, Antardasha, and Pratyantardasha readiness in a safe public foundation. Verified timing data appears only after chart context is available.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {dashaActionCtas.map((cta) => (
                  <TrackedLink
                    key={cta.label}
                    href={cta.href}
                    eventName="cta_click"
                    eventPayload={{ page: "/dasha", feature: cta.feature }}
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
            </div>

            <Card className="space-y-4 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0">
              <div className="space-y-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Chart Readiness
                </Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  Safe public foundation, not a fabricated forecast
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  This page is ready to receive verified chart data, but it will not invent Mahadasha or sub-cycle results.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Input Path
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    Complete the protected Kundli flow to unlock the verified Dasha chain.
                  </p>
                </div>
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Safety
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    No raw chart JSON, fear-based timing, or placeholder predictions are exposed here.
                  </p>
                </div>
              </div>
            </Card>
          </Container>
        </section>

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Birth Details"
          title="Add verified chart context before reviewing timing layers."
          description="A shared public birth form is not exposed on this page, so the foundation uses safe guidance cards and protected chart routes."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
            <Card
              tone="default"
              className="space-y-4 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <div className="space-y-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Safe Empty State
                </Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  Verified Mahadasha will appear after chart readiness
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  This public page keeps the Dasha experience calm. It shows readiness only when the chart foundation is verified.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {dashaPreviewStates.map((item) => (
                  <DashaPreviewCard
                    key={item.title}
                    title={item.title}
                    status={item.status}
                    description={item.description}
                  />
                ))}
              </div>
            </Card>

            <Card
              tone="accent"
              className="space-y-4 border-[rgba(184,137,67,0.2)] bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <Badge tone="accent">Birth Details Path</Badge>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                If you have not saved birth details yet, complete the protected Kundli flow first. That keeps Dasha timing grounded in verified chart context.
              </p>
              <div className="flex flex-col gap-2">
                <TrackedLink
                  href="/kundli"
                  eventName="cta_click"
                  eventPayload={{ page: "/dasha", feature: "dasha-birth-kundli" }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "accent",
                    className: "w-full justify-center",
                  })}
                >
                  Generate Kundli
                </TrackedLink>
              <TrackedLink
                href="/kundli"
                eventName="cta_click"
                eventPayload={{ page: "/dasha", feature: "dasha-birth-onboarding" }}
                className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className: "w-full justify-center",
                  })}
                >
                  Complete Birth Details
                </TrackedLink>
              </div>
            </Card>
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Current Mahadasha"
          title="Mahadasha, Antardasha, and Pratyantardasha remain ready for verified input."
          description="The foundation shows safe placeholders until a verified chart can be supplied through the protected onboarding path."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Mahadasha",
                status: "Unavailable",
                body: "Waiting for verified birth context.",
              },
              {
                title: "Antardasha",
                status: "Ready Next",
                body: "Unlocks after Mahadasha becomes available.",
              },
              {
                title: "Pratyantardasha",
                status: "Ready Next",
                body: "Unlocks after the nested timing chain is ready.",
              },
            ].map((item) => (
              <Card
                key={item.title}
                tone="light"
                className="flex h-full flex-col gap-3 border-black/8 bg-white shadow-[0_12px_28px_rgba(17,24,39,0.045)] before:opacity-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                      {item.title}
                    </p>
                    <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
                      {item.status}
                    </h3>
                  </div>
                  <Badge tone={item.status === "Unavailable" ? "neutral" : "trust"}>
                    {item.status}
                  </Badge>
                </div>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Dasha Timeline"
          title="Timeline readiness stays visible without inventing sub-cycle output."
          description="The page is prepared for a real timeline once verified chart data is available."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(280px,0.98fr)]">
            <Card
              tone="default"
              className="space-y-4 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <div className="space-y-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Timeline
                </Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  Timeline will populate after verified dasha data is present
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  No raw values are shown now. The page stays honest until the chart foundation is ready.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {dashaTimelineSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4 shadow-[0_10px_22px_rgba(17,24,39,0.04)]"
                  >
                    <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-2 text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card
              tone="accent"
              className="space-y-4 border-[rgba(184,137,67,0.2)] bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <Badge tone="accent">Next Actions</Badge>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Continue into chart creation, NAVAGRAHA AI, or reports when you want timing context with more depth.
              </p>
              <div className="grid gap-2">
                <TrackedLink
                  href="/kundli"
                  eventName="cta_click"
                  eventPayload={{ page: "/dasha", feature: "dasha-next-kundli" }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "accent",
                    className: "w-full justify-center",
                  })}
                >
                  Generate Kundli
                </TrackedLink>
                <TrackedLink
                  href="/navagraha-ai"
                  eventName="cta_click"
                  eventPayload={{ page: "/dasha", feature: "dasha-next-ai" }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className: "w-full justify-center",
                  })}
                >
                  Ask NAVAGRAHA AI
                </TrackedLink>
                <TrackedLink
                  href="/reports"
                  eventName="report_cta_click"
                  eventPayload={{ page: "/dasha", feature: "dasha-next-reports" }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className: "w-full justify-center",
                  })}
                >
                  View Reports
                </TrackedLink>
              </div>
            </Card>
          </div>
        </Section>
      </main>
    </>
  );
}
