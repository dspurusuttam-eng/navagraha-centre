import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { createToolMetadata } from "@/lib/seo/metadata";

const heroCtas = [
  {
    href: "#dosha-review",
    label: "Start Dosha Review",
    feature: "dosha-yoga-start-review",
    tone: "accent" as const,
  },
  {
    href: "/kundli",
    label: "Open Kundli",
    feature: "dosha-yoga-open-kundli",
    tone: "secondary" as const,
  },
  {
    href: "/ai",
    label: "Ask NI",
    feature: "dosha-yoga-ask-ni",
    tone: "ni" as const,
  },
  {
    href: "/remedies",
    label: "View Remedies",
    feature: "dosha-yoga-view-remedies",
    tone: "secondary" as const,
  },
  {
    href: "/consultation",
    label: "Consult Expert",
    feature: "dosha-yoga-consult-expert",
    tone: "secondary" as const,
  },
] as const;

const diagnosticRail = [
  "Dosha Review",
  "Yoga Strength",
  "Timing Support",
  "Remedy Direction",
  "Ask NI",
] as const;

const doshaCards = [
  {
    title: "Mangal Dosha",
    label: "Mars context",
    description:
      "A calm review of Mars placement, houses, and relationship context only when a verified Kundli foundation exists.",
  },
  {
    title: "Kaal Sarp Yoga",
    label: "Node-axis context",
    description:
      "Rahu-Ketu alignment is treated as a chart pattern that needs careful review, not as an alarming public verdict.",
  },
  {
    title: "Pitra Dosha",
    label: "Ancestral pattern",
    description:
      "Traditional indicators are framed as reflective chart context and never as pressure for a forced action.",
  },
  {
    title: "Grahan Dosha",
    label: "Luminary shadow",
    description:
      "Sun-Moon shadow factors are described as diagnostic context only after verified chart review.",
  },
  {
    title: "Rahu-Ketu Influence",
    label: "Axis movement",
    description:
      "Nodal influence is connected with Kundli structure, Dasha, and Transit before guidance is suggested.",
  },
  {
    title: "Shani / Sade Sati Pressure",
    label: "Saturn timing",
    description:
      "Saturn pressure is kept practical, paced, and timing-aware without harsh or alarming claims.",
  },
] as const;

const yogaCards = [
  {
    title: "Raj Yoga",
    label: "Authority pattern",
    description:
      "A supportive structure can be reviewed only from verified chart context, not from a public assumption.",
  },
  {
    title: "Dhana Yoga",
    label: "Resource pattern",
    description:
      "Finance-related strengths are treated as chart signals, not promises of material outcome.",
  },
  {
    title: "Budhaditya Yoga",
    label: "Intellect pattern",
    description:
      "Sun-Mercury combinations need sign, house, strength, and timing context before interpretation.",
  },
  {
    title: "Gaj Kesari Yoga",
    label: "Moon-Jupiter support",
    description:
      "Supportive combinations are reviewed with dignity and restraint, without exaggerated certainty.",
  },
  {
    title: "Vipreet Raj Yoga",
    label: "Reversal pattern",
    description:
      "Complex house relationships need careful reading across chart structure and life context.",
  },
  {
    title: "Career / Wealth / Authority Yogas",
    label: "Life-area strengths",
    description:
      "Strength patterns are grouped for repeat review while keeping all personal conclusions private.",
  },
] as const;

const timingCards = [
  {
    title: "Dasha",
    href: "/dasha",
    label: "Life-phase timing",
    description: "Connect dosha or yoga themes with the active planetary period before forming guidance.",
  },
  {
    title: "Transit",
    href: "/transit",
    label: "Current movement",
    description: "Review present graha movement as a timing layer, not as a stand-alone conclusion.",
  },
  {
    title: "Panchang / Muhurat",
    href: "/panchang",
    label: "Daily timing",
    description: "Use date, timing, and Muhurat context for practical planning and repeat visits.",
  },
  {
    title: "Remedy timing",
    href: "/remedies",
    label: "Support direction",
    description: "Explore optional spiritual support pathways only after calm chart review.",
  },
] as const;

const journeySteps = [
  "Birth details are checked",
  "Kundli base is reviewed",
  "Dosha factors are identified",
  "Yoga strengths are studied",
  "Dasha and Transit timing are connected",
  "Remedy or consultation direction is suggested",
  "Final guidance is reviewed carefully",
] as const;

const supportCards = [
  {
    title: "Remedies",
    href: "/remedies",
    icon: "RE",
    ctaLabel: "View Remedies",
    description: "Explore optional spiritual support with calm, non-pressured wording.",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: "RP",
    ctaLabel: "View Reports",
    description: "Move into structured report options when a deeper chart review is needed.",
  },
  {
    title: "Consultation",
    href: "/consultation",
    icon: "JP",
    ctaLabel: "Consult Expert",
    description: "Use human-reviewed guidance with J P Sarmah for sensitive interpretation.",
  },
  {
    title: "Kundli",
    href: "/kundli",
    icon: "KU",
    ctaLabel: "Open Kundli",
    description: "Start from verified chart context before reading diagnostic layers.",
  },
  {
    title: "Tools",
    href: "/tools",
    icon: "TH",
    ctaLabel: "Open Tools",
    description: "Return to the broader public tools hub for related Vedic utilities.",
  },
] as const;

export const metadata = createToolMetadata({
  title: "Dosha-Yoga Analysis",
  description:
    "A calm Vedic diagnostic pathway for Kundli doshas, yogas, timing influences, Ask NI guidance, reports, and consultation support without alarming claims.",
  path: "/dosha-yoga",
  keywords: [
    "dosha yoga analysis",
    "kundli dosha review",
    "mangal dosha",
    "kaal sarp yoga",
    "raj yoga",
    "vedic diagnostic guidance",
  ],
});

export const revalidate = 3600;

function DiagnosticCard({
  title,
  label,
  description,
  tone,
}: Readonly<{
  title: string;
  label: string;
  description: string;
  tone: "dosha" | "yoga";
}>) {
  const toneClass =
    tone === "dosha"
      ? "border-[rgba(127,64,48,0.2)] shadow-[0_14px_32px_rgba(127,64,48,0.06)] hover:border-[rgba(127,64,48,0.34)]"
      : "border-[rgba(72,126,92,0.22)] shadow-[0_14px_32px_rgba(72,126,92,0.06)] hover:border-[rgba(72,126,92,0.36)]";
  const labelClass = tone === "dosha" ? "text-[#7f4030]" : "text-[#2f6d48]";

  return (
    <Card
      tone="default"
      className={`flex min-h-[11.25rem] flex-col justify-between gap-4 bg-white p-4 before:opacity-0 ${toneClass}`}
    >
      <div className="space-y-2">
        <p className={`text-[0.68rem] uppercase tracking-[0.12em] ${labelClass}`}>
          {label}
        </p>
        <h3 className="text-[length:var(--font-size-body-lg)] font-semibold leading-tight text-[color:var(--color-ink-strong)]">
          {title}
        </h3>
        <p className="text-[0.82rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
          {description}
        </p>
      </div>
      <Badge
        tone="outline"
        className="w-fit border border-black/8 bg-white text-[0.58rem] uppercase tracking-[0.06em] text-[color:var(--color-ink-body)]"
      >
        Educational only
      </Badge>
    </Card>
  );
}

function TimingCard({
  title,
  href,
  label,
  description,
}: Readonly<(typeof timingCards)[number]>) {
  return (
    <TrackedLink
      href={href}
      eventName="cta_click"
      eventPayload={{ page: "/dosha-yoga", feature: `dosha-yoga-timing-${title}` }}
      className="group block h-full"
    >
      <Card
        tone="default"
        interactive
        className="flex h-full min-h-[10rem] flex-col gap-3 border-[rgba(184,137,67,0.2)] bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0"
      >
        <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
          {label}
        </p>
        <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
          {title}
        </h3>
        <p className="text-[0.82rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
          {description}
        </p>
      </Card>
    </TrackedLink>
  );
}

function SupportCard({
  title,
  href,
  icon,
  ctaLabel,
  description,
}: Readonly<(typeof supportCards)[number]>) {
  return (
    <TrackedLink
      href={href}
      eventName="cta_click"
      eventPayload={{ page: "/dosha-yoga", feature: `dosha-yoga-support-${title}` }}
      className="group block h-full"
    >
      <Card
        tone="default"
        interactive
        className="flex h-full min-h-[11rem] flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0 hover:border-[rgba(184,137,67,0.28)]"
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
              Safe path
            </p>
          </div>
        </div>
        <p className="text-[0.8rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
          {description}
        </p>
        <span
          className={buttonStyles({
            size: "sm",
            tone: "secondary",
            className: "mt-auto w-full justify-center",
          })}
        >
          {ctaLabel}
        </span>
      </Card>
    </TrackedLink>
  );
}

export default function DoshaYogaPage() {
  return (
    <>
      <PageViewTracker page="/dosha-yoga" feature="dosha-yoga-page" />
      <AnalyticsEventTracker
        event="page_view"
        payload={{ page: "/dosha-yoga", feature: "dosha-yoga-page" }}
      />

      <main className="launch-page launch-page-dosha-yoga min-h-screen bg-white pb-[calc(7.2rem+env(safe-area-inset-bottom))] text-[color:var(--color-ink-strong)] xl:pb-0">
        <section className="relative overflow-hidden border-b border-[rgba(155,122,74,0.16)] bg-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[-5rem] top-5 hidden h-72 w-72 rounded-full border border-[rgba(184,137,67,0.16)] md:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-20 top-16 hidden h-56 w-56 rotate-45 border border-[rgba(184,137,67,0.18)] md:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-32 top-28 hidden h-36 w-36 rounded-full border border-dashed border-[rgba(127,64,48,0.28)] md:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-44 top-40 hidden h-20 w-20 rounded-full border border-[rgba(72,126,92,0.24)] md:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-48 top-44 hidden h-2.5 w-2.5 rounded-full bg-[rgba(184,137,67,0.76)] shadow-[0_0_24px_rgba(184,137,67,0.24)] md:block"
          />

          <Container className="grid gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(0,1.04fr)_minmax(300px,0.96fr)] lg:items-center lg:py-12">
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge
                  tone="trust"
                  className="border border-[rgba(127,64,48,0.24)] bg-[rgba(127,64,48,0.06)] text-[#6f382d]"
                >
                  Kundli Dosha · Yoga Review
                </Badge>
                <Badge
                  tone="outline"
                  className="border border-[rgba(72,126,92,0.2)] bg-white text-[#2f6d48]"
                >
                  Calm Diagnostic Path
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
                  Dosha-Yoga Analysis
                </h1>
                <p className="max-w-[48rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-lg)]">
                  A calm Vedic diagnostic pathway to understand important Kundli doshas, yogas, timing influences, and suitable guidance without alarming claims.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                {heroCtas.map((cta) => (
                  <TrackedLink
                    key={cta.label}
                    href={cta.href}
                    eventName="cta_click"
                    eventPayload={{ page: "/dosha-yoga", feature: cta.feature }}
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
                {diagnosticRail.map((label) => (
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
              className="space-y-4 border-[rgba(127,64,48,0.2)] bg-white shadow-[0_18px_46px_rgba(127,64,48,0.08)] before:opacity-0"
            >
              <div className="flex items-center justify-between gap-3">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Start here
                </Badge>
                <Badge
                  tone="outline"
                  className="border border-[rgba(72,126,92,0.2)] bg-white text-[#2f6d48]"
                >
                  Review, not alarm
                </Badge>
              </div>

              <div className="space-y-3">
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  Understand the pattern before choosing a path.
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Dosha and Yoga should be read with Kundli structure, planet strength, Dasha, Transit, and lived context. This public page keeps the flow educational until verified chart context is available.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-[1.1rem] border border-[rgba(127,64,48,0.18)] bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
                  <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[#7f4030]">
                    Dosha
                  </p>
                  <p className="mt-1.5 text-[0.76rem] leading-[1.45] text-[color:var(--color-ink-body)]">
                    Diagnostic context only.
                  </p>
                </div>
                <div className="rounded-[1.1rem] border border-[rgba(72,126,92,0.18)] bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
                  <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[#2f6d48]">
                    Yoga
                  </p>
                  <p className="mt-1.5 text-[0.76rem] leading-[1.45] text-[color:var(--color-ink-body)]">
                    Strength review only.
                  </p>
                </div>
                <div className="rounded-[1.1rem] border border-[rgba(184,137,67,0.18)] bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
                  <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Timing
                  </p>
                  <p className="mt-1.5 text-[0.76rem] leading-[1.45] text-[color:var(--color-ink-body)]">
                    Dasha and Transit aware.
                  </p>
                </div>
              </div>
            </Card>
          </Container>
        </section>

        <Section
          id="dosha-review"
          tone="transparent"
          category="utilities"
          eyebrow="Dosha Review"
          title="Review dosha indicators calmly, without public verdicts."
          description="These cards explain what may be reviewed later from verified Kundli context. They do not claim that any dosha is present."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {doshaCards.map((card) => (
              <DiagnosticCard
                key={card.title}
                title={card.title}
                label={card.label}
                description={card.description}
                tone="dosha"
              />
            ))}
          </div>
        </Section>

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Yoga Strength Review"
          title="Study supportive yoga layers without invented results."
          description="Yoga strength needs chart structure, planet dignity, house context, and timing review before any personal interpretation."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {yogaCards.map((card) => (
              <DiagnosticCard
                key={card.title}
                title={card.title}
                label={card.label}
                description={card.description}
                tone="yoga"
              />
            ))}
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Timing Support"
          title="Connect diagnosis with timing before choosing the next step."
          description="Returning viewers can revisit Dasha, Transit, Panchang, and remedy direction as practical context changes."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {timingCards.map((card) => (
              <TimingCard key={card.title} {...card} />
            ))}
          </div>
        </Section>

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Dosha-Yoga Journey"
          title="A careful review moves step by step."
          description="The flow keeps the user path understandable and repeatable without turning diagnosis into pressure."
        >
          <Card
            tone="default"
            className="border-[rgba(184,137,67,0.18)] bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
              {journeySteps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-[1rem] border border-[rgba(184,137,67,0.16)] bg-[rgba(255,250,240,0.52)] px-3 py-3"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(184,137,67,0.3)] bg-white text-[0.72rem] font-semibold text-[color:var(--color-accent-strong)]">
                    {index + 1}
                  </span>
                  <p className="mt-3 text-[0.78rem] font-medium leading-[1.45] text-[color:var(--color-ink-strong)]">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Remedy Direction"
          title="Move from review into calm support pathways."
          description="Remedies, reports, consultation, Kundli, and tools remain safe public paths without commercial claims, pressure, or certainty claims."
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
            {supportCards.map((card) => (
              <SupportCard key={card.title} {...card} />
            ))}
          </div>
        </Section>

        <Section
          tone="transparent"
          category="ai"
          eyebrow="Ask NI Support"
          title="Use Ask NI to prepare better questions."
          description="Ask NI can explain Dosha-Yoga concepts, timing layers, and what to ask next. It remains assistance, not a replacement for human review."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(280px,1.1fr)]">
            <Card
              tone="accent"
              className="space-y-4 border-[rgba(19,211,224,0.22)] bg-white shadow-[0_14px_34px_rgba(19,211,224,0.08)] before:opacity-0"
            >
              <Badge tone="accent">Ask NI</Badge>
              <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                NAVAGRAHA Intelligence can help clarify the concepts before deeper review.
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Ask NI helps users understand dosha categories, yoga strength questions, Dasha and Transit connections, and what information to prepare for careful guidance.
              </p>
              <TrackedLink
                href="/ai"
                eventName="cta_click"
                eventPayload={{ page: "/dosha-yoga", feature: "dosha-yoga-ask-ni-panel" }}
                className={buttonStyles({
                  size: "lg",
                  tone: "ni",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Ask NI
              </TrackedLink>
            </Card>

            <Card
              tone="default"
              className="space-y-4 border-[rgba(91,38,36,0.2)] bg-white shadow-[0_14px_34px_rgba(91,38,36,0.06)] before:opacity-0"
            >
              <Badge
                tone="trust"
                className="border border-[rgba(91,38,36,0.22)] bg-[rgba(91,38,36,0.06)] text-[#5b2624]"
              >
                J P Sarmah Authority
              </Badge>
              <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                Dosha and Yoga should not be judged by one factor alone.
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                A careful review should consider Kundli structure, Dasha, Transit, planet strength, and practical life context under expert guidance from J P Sarmah.
              </p>
            </Card>
          </div>
        </Section>

        <Section
          tone="transparent"
          category="content"
          eyebrow="Trust / Privacy Note"
          title="The public page stays educational and privacy-safe."
          description="No personal chart output, saved chart history, or private birth context is exposed here. Use verified Kundli context and human-reviewed guidance for sensitive decisions."
        >
          <Card
            tone="default"
            className="border-[rgba(184,137,67,0.18)] bg-white p-5 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Badge tone="outline" className="border border-black/8 bg-white">
                  No public verdicts
                </Badge>
                <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  The page explains review layers and does not declare a user has any specific dosha or yoga.
                </p>
              </div>
              <div className="space-y-2">
                <Badge tone="outline" className="border border-black/8 bg-white">
                  Privacy-safe
                </Badge>
                <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Birth context and saved Kundli history stay outside this public route.
                </p>
              </div>
              <div className="space-y-2">
                <Badge tone="outline" className="border border-black/8 bg-white">
                  Guidance-first
                </Badge>
                <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Use this as a calm learning path before reports, consultation, or deeper chart review.
                </p>
              </div>
            </div>
          </Card>
        </Section>
      </main>
    </>
  );
}
