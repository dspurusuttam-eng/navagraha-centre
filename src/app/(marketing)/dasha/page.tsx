import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { createToolMetadata } from "@/lib/seo/metadata";

const dashaIntroCtas = [
  {
    href: "#dasha-system",
    label: "Explore Dasha System",
    feature: "dasha-hero-explore-system",
    tone: "accent" as const,
  },
  {
    href: "/ai",
    label: "Ask NI",
    feature: "dasha-hero-ask-ni",
    tone: "secondary" as const,
  },
  {
    href: "/kundli",
    label: "Open Kundli",
    feature: "dasha-hero-open-kundli",
    tone: "secondary" as const,
  },
  {
    href: "/transit",
    label: "View Transit",
    feature: "dasha-hero-view-transit",
    tone: "secondary" as const,
  },
] as const;

const dashaStructureCards = [
  {
    title: "Mahadasha",
    label: "Major cycle",
    description:
      "The primary life-period layer that is resolved only from verified chart context.",
  },
  {
    title: "Antardasha",
    label: "Sub-cycle",
    description:
      "The inner period that becomes meaningful after the Mahadasha foundation exists.",
  },
  {
    title: "Pratyantar Dasha",
    label: "Fine timing",
    description:
      "The nested timing layer used only after the broader Dasha chain is available.",
  },
  {
    title: "Current Period",
    label: "Calculated state",
    description:
      "Shown by the calculation flow when verified birth details and timing context are present.",
  },
  {
    title: "Upcoming Period",
    label: "Next transition",
    description:
      "Reserved for calculated future timing transitions, not manually written dates.",
  },
  {
    title: "Dasha Interpretation",
    label: "Guidance layer",
    description:
      "Connects timing cycles with practical context after the chart foundation is ready.",
  },
  {
    title: "Timing Guidance",
    label: "Planning context",
    description:
      "Pairs Dasha timing with Transit, Panchang, and human review when needed.",
  },
  {
    title: "Report / Consultation Support",
    label: "Deeper review",
    description:
      "Use reports or consultation for decisions that need careful personal context.",
  },
] as const;

const dashaShortcuts = [
  {
    title: "Kundli",
    href: "/kundli",
    icon: "KU",
    ctaLabel: "Open Kundli",
    feature: "dasha-shortcut-kundli",
    description: "Start with chart context before reviewing timing cycles.",
  },
  {
    title: "Transit",
    href: "/transit",
    icon: "TR",
    ctaLabel: "View Transit",
    feature: "dasha-shortcut-transit",
    description: "Compare long-period timing with current planetary movement.",
  },
  {
    title: "Panchang",
    href: "/panchang",
    icon: "PA",
    ctaLabel: "Open Panchang",
    feature: "dasha-shortcut-panchang",
    description: "Use daily timing context alongside Dasha planning.",
  },
  {
    title: "Rashifal",
    href: "/rashifal",
    icon: "RA",
    ctaLabel: "Read Rashifal",
    feature: "dasha-shortcut-rashifal",
    description: "Read daily sign guidance after timing context is clear.",
  },
  {
    title: "Ask NI",
    href: "/ai",
    icon: "NI",
    ctaLabel: "Ask NI",
    feature: "dasha-shortcut-ai",
    description: "Use NAVAGRAHA Intelligence for AI-guided Dasha context.",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: "RP",
    ctaLabel: "View Reports",
    feature: "dasha-shortcut-reports",
    description: "Move into structured reports when deeper review is needed.",
  },
  {
    title: "Consultation",
    href: "/consultation",
    icon: "CS",
    ctaLabel: "Consult",
    feature: "dasha-shortcut-consultation",
    description: "Use human-led guidance for decisions that need context.",
  },
  {
    title: "Tools",
    href: "/tools",
    icon: "TH",
    ctaLabel: "Open Tools",
    feature: "dasha-shortcut-tools",
    description: "Return to the complete astrology tools hub.",
  },
] as const;

const dashaReadinessSteps = [
  {
    title: "Start with birth details",
    description:
      "Dasha timing depends on birth date, time, place, and Moon nakshatra context.",
  },
  {
    title: "Resolve the timing chain",
    description:
      "Mahadasha, Antardasha, and Pratyantar layers should come from the calculation flow.",
  },
  {
    title: "Review with context",
    description:
      "Use Transit, Panchang, reports, Ask NI, or consultation for practical interpretation.",
  },
] as const;

export const metadata = createToolMetadata({
  title: "Vimshottari Dasha Calculator",
  description:
    "Explore a safe Dasha foundation for Mahadasha, Antardasha, Pratyantar Dasha, timing cycles, and Vedic life-period guidance.",
  path: "/dasha",
  keywords: [
    "vimshottari dasha",
    "mahadasha",
    "antardasha",
    "pratyantar dasha",
    "vedic timing",
  ],
});

export const revalidate = 3600;

function DashaFirstScreen() {
  return (
    <section className="border-b border-[rgba(155,122,74,0.16)] bg-[linear-gradient(180deg,#fffefb_0%,#ffffff_100%)]">
      <Container className="grid gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(0,1.04fr)_minmax(300px,0.96fr)] lg:items-center lg:py-12">
        <div className="space-y-4 sm:space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge tone="trust" className="border border-black/8 bg-white">
              Vimshottari Dasha
            </Badge>
            <Badge
              tone="outline"
              className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]"
            >
              Timing Cycles
            </Badge>
          </div>

          <div className="space-y-2.5 sm:space-y-4">
            <h1
              className="max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-sm)] text-[color:var(--color-ink-strong)] sm:text-[length:var(--font-size-display-lg)]"
              style={{
                letterSpacing: "0.01em",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Dasha
            </h1>
            <p className="max-w-[48rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-lg)]">
              Vimshottari Dasha, Mahadasha, Antardasha, timing cycles, and life-period guidance for understanding when chart themes unfold.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            {dashaIntroCtas.map((cta) => (
              <TrackedLink
                key={cta.label}
                href={cta.href}
                eventName="cta_click"
                eventPayload={{ page: "/dasha", feature: cta.feature }}
                className={buttonStyles({
                  size: "lg",
                  tone: cta.tone,
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                {cta.label}
              </TrackedLink>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              "Mahadasha",
              "Antardasha",
              "Pratyantar",
              "Timing Guidance",
              "Ask NI follow-up",
            ].map((label) => (
              <Badge
                key={label}
                tone="trust"
                className="border border-black/8 bg-white px-2 py-1 text-[0.56rem] uppercase tracking-[0.05em] text-[color:var(--color-ink-strong)] sm:px-3 sm:py-1.5 sm:text-[0.64rem] sm:tracking-[0.1em]"
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>

        <Card
          tone="default"
          className="space-y-4 border-[rgba(155,122,74,0.18)] bg-white shadow-[0_18px_46px_rgba(17,24,39,0.06)] before:opacity-0"
        >
          <div className="flex items-center justify-between gap-3">
            <Badge tone="trust" className="border border-black/8 bg-white">
              Start here
            </Badge>
            <Badge
              tone="outline"
              className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]"
            >
              Chart-first
            </Badge>
          </div>

          <div className="space-y-2">
            <h2 className="text-[length:var(--font-size-title-sm)] font-semibold text-[color:var(--color-ink-strong)]">
              Build chart context before reading timing cycles.
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
              Dasha periods are calculated from birth-chart context. This page keeps the public layer structure-only until verified chart details are available.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {dashaStructureCards.slice(0, 6).map((item) => (
              <div
                key={item.title}
                className="rounded-[1.1rem] border border-black/8 bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(17,24,39,0.04)]"
              >
                <p className="text-[0.74rem] font-semibold text-[color:var(--color-ink-strong)]">
                  {item.title}
                </p>
                <p className="mt-1 text-[0.68rem] leading-[1.35] text-[color:var(--color-ink-body)]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </Container>
    </section>
  );
}

function DashaStructureCard({
  title,
  label,
  description,
}: Readonly<{
  title: string;
  label: string;
  description: string;
}>) {
  return (
    <Card
      tone="default"
      className="flex min-h-[8.2rem] flex-col justify-between gap-3 border-[rgba(184,137,67,0.2)] bg-white p-3 shadow-[0_10px_22px_rgba(17,24,39,0.045)] before:opacity-0"
    >
      <div className="space-y-1.5">
        <p className="text-[0.88rem] font-semibold leading-tight text-[color:var(--color-ink-strong)]">
          {title}
        </p>
        <p className="text-[0.66rem] uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)]">
          {label}
        </p>
        <p className="text-[0.7rem] leading-[1.4] text-[color:var(--color-ink-body)]">
          {description}
        </p>
      </div>
      <Badge
        tone="outline"
        className="w-fit border border-black/8 bg-white text-[0.58rem] uppercase tracking-[0.06em] text-[color:var(--color-accent-strong)]"
      >
        Structure only
      </Badge>
    </Card>
  );
}

function DashaShortcutCard({
  title,
  href,
  icon,
  ctaLabel,
  feature,
  description,
}: Readonly<(typeof dashaShortcuts)[number]>) {
  return (
    <TrackedLink
      href={href}
      eventName="cta_click"
      eventPayload={{ page: "/dasha", feature }}
      className="group block h-full"
    >
      <Card
        tone="default"
        interactive
        className="flex h-full min-h-[12rem] flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0 hover:border-[rgba(184,137,67,0.28)]"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(184,137,67,0.28)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.98)_0%,rgba(247,234,204,0.92)_72%,rgba(238,214,166,0.88)_100%)] text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)] shadow-[0_10px_22px_rgba(121,85,33,0.12)]">
            {icon}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-[0.98rem] font-semibold leading-tight text-[color:var(--color-ink-strong)]">
              {title}
            </h3>
            <p className="text-[0.68rem] uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)]">
              Route-safe
            </p>
          </div>
        </div>

        <p className="text-[0.8rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
          {description}
        </p>

        <span
          className={buttonStyles({
            size: "sm",
            tone: title === "Ask NI" ? "tertiary" : "secondary",
            className: "mt-auto w-full justify-center",
          })}
        >
          {ctaLabel}
        </span>
      </Card>
    </TrackedLink>
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

      <main className="min-h-screen bg-[linear-gradient(180deg,#fffefb_0%,#ffffff_28%,#fbf6ed_100%)] pb-[calc(7.2rem+env(safe-area-inset-bottom))] text-[color:var(--color-ink-strong)] xl:pb-0">
        <DashaFirstScreen />

        <Section
          id="dasha-system"
          tone="light"
          category="utilities"
          eyebrow="Dasha System"
          title="Read the timing layers without invented periods."
          description="These cards explain the Dasha structure and stay value-free until verified chart context is available."
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {dashaStructureCards.map((item) => (
              <DashaStructureCard
                key={item.title}
                title={item.title}
                label={item.label}
                description={item.description}
              />
            ))}
          </div>
        </Section>

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Timing Flow"
          title="Move from birth details into timing interpretation."
          description="Dasha works best when chart context, current movement, and practical guidance are reviewed together."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(280px,0.98fr)]">
            <Card
              tone="default"
              className="space-y-4 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <div className="space-y-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Readiness
                </Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  Keep Dasha timing tied to verified chart context.
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  The public page explains the flow and routes users toward verified chart, transit, report, and consultation surfaces.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {dashaReadinessSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-[1.1rem] border border-[rgba(184,137,67,0.18)] bg-white p-4 shadow-[0_10px_22px_rgba(17,24,39,0.04)]"
                  >
                    <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
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
              <Badge tone="accent">Ask NI</Badge>
              <div className="space-y-2">
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  Use NAVAGRAHA Intelligence for Dasha context.
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Ask NI can help frame timing questions after you understand the structure. It is AI-guided assistance, not a replacement for human review.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <TrackedLink
                  href="/ai"
                  eventName="cta_click"
                  eventPayload={{ page: "/dasha", feature: "dasha-ni-panel" }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "accent",
                    className: "w-full justify-center",
                  })}
                >
                  Ask NI
                </TrackedLink>
                <TrackedLink
                  href="/consultation"
                  eventName="cta_click"
                  eventPayload={{
                    page: "/dasha",
                    feature: "dasha-consultation-panel",
                  }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className: "w-full justify-center",
                  })}
                >
                  Consultation
                </TrackedLink>
              </div>
            </Card>
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Dasha Shortcuts"
          title="Continue into the right route-safe surface."
          description="Use existing public tools and service pages without creating unverified Dasha results."
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {dashaShortcuts.map((shortcut) => (
              <DashaShortcutCard key={shortcut.title} {...shortcut} />
            ))}
          </div>
        </Section>

        <Section
          tone="transparent"
          category="content"
          eyebrow="Guidance Safety"
          title="Dasha is timing context, not a public results dump."
          description="Use the structure here to understand the system, then move into Kundli, Transit, reports, Ask NI, or consultation when personal context is needed."
        >
          <Card
            tone="default"
            className="flex flex-col gap-4 border-[rgba(184,137,67,0.2)] bg-white p-5 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="max-w-2xl space-y-2">
              <Badge tone="trust" className="border border-black/8 bg-white">
                Human review when needed
              </Badge>
              <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                Keep major timing decisions grounded.
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                For sensitive decisions, combine calculated chart context with reports or consultation instead of relying on public structure cards alone.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[13rem]">
              <TrackedLink
                href="/reports"
                eventName="cta_click"
                eventPayload={{ page: "/dasha", feature: "dasha-trust-reports" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "accent",
                  className: "w-full justify-center",
                })}
              >
                View Reports
              </TrackedLink>
              <TrackedLink
                href="/consultation"
                eventName="cta_click"
                eventPayload={{
                  page: "/dasha",
                  feature: "dasha-trust-consultation",
                }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center",
                })}
              >
                Consultation
              </TrackedLink>
            </div>
          </Card>
        </Section>
      </main>
    </>
  );
}
