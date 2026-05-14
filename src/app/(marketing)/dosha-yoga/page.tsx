import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { createToolMetadata } from "@/lib/seo/metadata";

const birthReadinessItems = [
  {
    title: "Birth date",
    status: "Required",
    description: "Anchors the chart foundation and keeps any later dosha or yoga reading verified.",
  },
  {
    title: "Birth time",
    status: "Required",
    description: "Needed for Lagna, house, and timed placement checks before analysis is shown.",
  },
  {
    title: "Birth place",
    status: "Required",
    description: "Used to resolve location-aware chart context without exposing private data publicly.",
  },
  {
    title: "Latitude / longitude",
    status: "Optional",
    description: "Helps when protected chart context needs a tighter location reference.",
  },
  {
    title: "Timezone",
    status: "Optional",
    description: "Keeps local civil time consistent when verified chart context is available.",
  },
  {
    title: "Saved Kundli",
    status: "Protected",
    description: "Comparison and deeper analysis remain inside the dashboard flow, not on the public page.",
  },
] as const;

const doshaReadinessCards = [
  {
    title: "Mangal Dosha",
    summary:
      "Analysis preparing. Mars placement and house context will be shown only when verified chart data is connected.",
  },
  {
    title: "Kaal Sarp Dosha",
    summary:
      "Analysis preparing. Node-axis checks stay in safe mode until verified planetary positions are available.",
  },
  {
    title: "Pitru Dosha",
    summary:
      "Analysis preparing. The reading stays calm and chart-grounded instead of using fear-based language.",
  },
  {
    title: "Guru Chandal Dosha",
    summary:
      "Analysis preparing. Jupiter and Rahu / Ketu relationship signals are only surfaced from verified chart context.",
  },
  {
    title: "Grahan Dosha",
    summary:
      "Analysis preparing. Sun-Moon shadow checks remain hidden until the chart foundation is present.",
  },
  {
    title: "Shrapit Dosha",
    summary:
      "Analysis preparing. Saturn-Rahu pattern support appears only after safe, verified calculation context exists.",
  },
] as const;

const yogaReadinessCards = [
  {
    title: "Raj Yoga",
    summary:
      "Detection preparing. Supportive structure is displayed only after verified chart context is available.",
  },
  {
    title: "Dhan Yoga",
    summary:
      "Detection preparing. Wealth-supportive structure stays in safe mode until the engine can verify it.",
  },
  {
    title: "Panch Mahapurush Yoga",
    summary:
      "Detection preparing. Strong graha-kendra combinations are shown only from verified chart output.",
  },
  {
    title: "Vipreet Raj Yoga",
    summary:
      "Detection preparing. Dusthana-based reversal patterns remain hidden without verified data.",
  },
  {
    title: "Neech Bhang Raj Yoga",
    summary:
      "Detection preparing. Cancellation-style readings are surfaced only after a safe calculation path is available.",
  },
] as const;

const doshaResultCards = [
  {
    title: "Mangal Dosha result",
    value: "Analysis preparing",
    description:
      "Verified Mars-and-house output will appear here only after protected chart pairing is available.",
  },
  {
    title: "Kaal Sarp result",
    value: "Analysis preparing",
    description:
      "Verified node-axis output will appear here only after protected chart pairing is available.",
  },
  {
    title: "Pitru / Guru / Grahan / Shrapit",
    value: "Safe fallback",
    description:
      "Detailed dosha layers stay in safe mode until chart logic is confirmed from a protected source.",
  },
] as const;

const yogaResultCards = [
  {
    title: "Raj / Dhan Yoga result",
    value: "Detection preparing",
    description:
      "Verified structural yoga output appears only when the engine can confirm it from chart context.",
  },
  {
    title: "Panch Mahapurush result",
    value: "Detection preparing",
    description:
      "Strong graha-kendra support is surfaced only after verified chart context is available.",
  },
  {
    title: "Vipreet / Neech Bhang result",
    value: "Safe fallback",
    description:
      "Cancellation-style readings remain hidden until the protected detection path is ready.",
  },
] as const;

const actionCtas = [
  {
    href: "/kundli",
    label: "Generate Kundli",
    feature: "dosha-yoga-generate-kundli",
    tone: "accent" as const,
  },
  {
    href: "/navagraha-ai",
    label: "Ask NAVAGRAHA AI",
    feature: "dosha-yoga-ask-ai",
    tone: "secondary" as const,
  },
  {
    href: "/reports",
    label: "View Reports",
    feature: "dosha-yoga-view-reports",
    tone: "secondary" as const,
  },
  {
    href: "/consultation",
    label: "Book Consultation",
    feature: "dosha-yoga-book-consultation",
    tone: "secondary" as const,
  },
] as const;

function FoundationCard({
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
            Readiness
          </p>
          <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
            {title}
          </h3>
        </div>
        <Badge tone="neutral">{status}</Badge>
      </div>
      <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
        {description}
      </p>
    </Card>
  );
}

function ReadinessStateCard({
  title,
  summary,
}: Readonly<{
  title: string;
  summary: string;
}>) {
  return (
    <Card
      tone="default"
      className="flex h-full flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
            Analysis
          </p>
          <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
            {title}
          </h3>
        </div>
        <Badge tone="neutral">Preparing</Badge>
      </div>
      <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
        {summary}
      </p>
    </Card>
  );
}

function ResultStateCard({
  title,
  value,
  description,
}: Readonly<{
  title: string;
  value: string;
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
            Result UI
          </p>
          <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
            {title}
          </h3>
        </div>
        <Badge tone="neutral">{value}</Badge>
      </div>
      <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
        {description}
      </p>
    </Card>
  );
}

export const metadata = createToolMetadata({
  title: "Dosha & Yoga Checker",
  description:
    "Review dosha and yoga readiness in a calm public foundation. Verified analysis appears only after protected chart context is available.",
  path: "/dosha-yoga",
  keywords: [
    "dosha checker",
    "yoga checker",
    "mangal dosha",
    "kaal sarp dosha",
    "raj yoga",
    "dhan yoga",
  ],
});

export const revalidate = 3600;

export default function DoshaYogaPage() {
  return (
    <>
      <PageViewTracker page="/dosha-yoga" feature="dosha-yoga-page" />
      <AnalyticsEventTracker
        event="page_view"
        payload={{ page: "/dosha-yoga", feature: "dosha-yoga-page" }}
      />

      <main className="min-h-screen bg-[#FFFFFF] pb-[calc(7rem+env(safe-area-inset-bottom))] text-[color:var(--color-ink-strong)] md:pb-0">
        <section className="border-b border-black/8 bg-white">
          <Container className="grid gap-8 py-10 sm:py-12 lg:grid-cols-[minmax(0,1.06fr)_minmax(300px,0.94fr)] lg:items-center lg:py-14">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  NAVAGRAHA CENTRE
                </Badge>
                <Badge tone="outline" className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
                  Dosha & Yoga
                </Badge>
                <Badge tone="accent" className="border border-[rgba(184,137,67,0.18)] bg-white">
                  Safe Mode
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
                  Dosha & Yoga Checker
                </h1>
                <p className="max-w-[46rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-lg)]">
                  Review dosha and yoga readiness in a calm public foundation. Verified analysis appears only after protected chart context is available.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {actionCtas.map((cta) => (
                  <TrackedLink
                    key={cta.label}
                    href={cta.href}
                    eventName="cta_click"
                    eventPayload={{ page: "/dosha-yoga", feature: cta.feature }}
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
                  Safe Public Foundation
                </Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  No fabricated dosha or yoga outcomes
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  This page keeps the reading calm and route-safe. It will only show verified output after a protected chart context is connected.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Dosha engine
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    Existing dosha detection helpers are available deeper in the platform, but this public page stays in safe mode.
                  </p>
                </div>
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Yoga engine
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    Existing yoga detection helpers are available deeper in the platform, but no fake result is exposed here.
                  </p>
                </div>
              </div>
            </Card>
          </Container>
        </section>

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Birth Context"
          title="Verify the chart foundation before any dosha or yoga reading appears."
          description="The public page shows input readiness and protected chart continuity without exposing another user's data or inventing a result."
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
                  Dosha and yoga require verified birth context
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Use these fields as a foundation checklist before any protected calculation is surfaced.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {birthReadinessItems.map((item) => (
                  <FoundationCard
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
              <Badge tone="accent">Safe Empty State</Badge>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Analysis preparing. If the protected chart foundation is not ready, the page stays calm and shows a safe fallback instead of a fabricated dosha or yoga result.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Privacy
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    No raw chart JSON, cross-user access, or private birth data is exposed on this public route.
                  </p>
                </div>
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Guidance
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    Consultation remains available for nuanced or sensitive chart interpretation.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Dosha Readiness"
          title="Dosha checks stay in a calm preparing state until verified chart context exists."
          description="No fear-based wording, no deterministic claim, and no fabricated result are shown in the public foundation."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {doshaReadinessCards.map((card) => (
              <ReadinessStateCard
                key={card.title}
                title={card.title}
                summary={card.summary}
              />
            ))}
          </div>
        </Section>

        <Section
          tone="muted"
          category="utilities"
          eyebrow="Dosha Result UI"
          title="When verified output is available, dosha results appear here safely."
          description="Until then, the public page remains in analysis preparing mode and does not invent a score or dosha verdict."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {doshaResultCards.map((card) => (
              <ResultStateCard
                key={card.title}
                title={card.title}
                value={card.value}
                description={card.description}
              />
            ))}
          </div>
        </Section>

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Yoga Readiness"
          title="Yoga checks remain ready for verified chart output, not placeholder certainty."
          description="Supportive or structural yoga readings are kept safe until the protected calculation path is available."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {yogaReadinessCards.map((card) => (
              <ReadinessStateCard
                key={card.title}
                title={card.title}
                summary={card.summary}
              />
            ))}
          </div>
        </Section>

        <Section
          tone="muted"
          category="utilities"
          eyebrow="Yoga Result UI"
          title="Verified yoga detection will appear here without exaggeration."
          description="The public page stays in detection preparing mode until the chart engine can confirm a real pattern."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {yogaResultCards.map((card) => (
              <ResultStateCard
                key={card.title}
                title={card.title}
                value={card.value}
                description={card.description}
              />
            ))}
          </div>
        </Section>

        <Section tone="light" category="utilities" eyebrow="Next Actions" title="Continue into the right chart layer when ready." description="Use these route-safe next steps to move from the public foundation into protected astrology workflows.">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {actionCtas.map((cta) => (
              <TrackedLink
                key={cta.label}
                href={cta.href}
                eventName="cta_click"
                eventPayload={{ page: "/dosha-yoga", feature: `${cta.feature}-secondary` }}
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
