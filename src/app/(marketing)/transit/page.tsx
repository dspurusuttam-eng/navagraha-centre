import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { createToolMetadata } from "@/lib/seo/metadata";
import {
  nakshatraLabelMap,
  planetLabelMap,
  zodiacSignLabelMap,
} from "@/lib/astrology/constants";
import {
  buildTransitGocharFoundation,
  type TransitGocharFoundationSnapshot,
} from "@/modules/astrology/transit/foundation";

const transitIntroCtas = [
  {
    href: "#transit-system",
    label: "Explore Transit System",
    feature: "transit-hero-explore-system",
    tone: "accent" as const,
  },
  {
    href: "/ai",
    label: "Ask NI",
    feature: "transit-hero-ask-ni",
    tone: "ni" as const,
  },
  {
    href: "/kundli",
    label: "Open Kundli",
    feature: "transit-hero-open-kundli",
    tone: "secondary" as const,
  },
  {
    href: "/dasha",
    label: "View Dasha",
    feature: "transit-hero-view-dasha",
    tone: "secondary" as const,
  },
  {
    href: "/rashifal",
    label: "Read Rashifal",
    feature: "transit-hero-read-rashifal",
    tone: "secondary" as const,
  },
] as const;

const transitStructureCards = [
  {
    title: "Current Planetary Transit",
    label: "Verified snapshot",
    description:
      "Current planet movement is shown only from the existing safe transit snapshot.",
  },
  {
    title: "Major Gochar",
    label: "Longer movement",
    description:
      "A structure layer for major planetary movement without invented results.",
  },
  {
    title: "Moon Transit",
    label: "Daily movement",
    description:
      "A daily timing lens that must stay tied to verified transit data.",
  },
  {
    title: "Saturn Transit",
    label: "Slow cycle",
    description:
      "Reserved for careful Saturn movement context, not manually written dates.",
  },
  {
    title: "Jupiter Transit",
    label: "Growth cycle",
    description:
      "A structure card for Jupiter movement after verified calculation context.",
  },
  {
    title: "Rahu / Ketu Transit",
    label: "Nodal movement",
    description:
      "Keeps nodal transit guidance separate from fake sign-wise claims.",
  },
  {
    title: "Sign-wise Impact",
    label: "Chart context",
    description:
      "Personal impact should come from chart context, not public placeholder text.",
  },
  {
    title: "Transit Interpretation",
    label: "Guidance layer",
    description:
      "Connects movement, natal context, and practical review when data is ready.",
  },
  {
    title: "Timing Guidance",
    label: "Planning context",
    description:
      "Pairs Transit with Dasha, Panchang, and Rashifal for timing awareness.",
  },
  {
    title: "Report / Consultation Support",
    label: "Deeper review",
    description:
      "Use reports or consultation for decisions that need personal context.",
  },
] as const;

const transitShortcuts = [
  {
    title: "Kundli",
    href: "/kundli",
    icon: "KU",
    ctaLabel: "Open Kundli",
    feature: "transit-shortcut-kundli",
    description: "Start with birth-chart context before reading transit impact.",
  },
  {
    title: "Dasha",
    href: "/dasha",
    icon: "DA",
    ctaLabel: "View Dasha",
    feature: "transit-shortcut-dasha",
    description: "Compare current movement with longer timing cycles.",
  },
  {
    title: "Panchang",
    href: "/panchang",
    icon: "PA",
    ctaLabel: "Open Panchang",
    feature: "transit-shortcut-panchang",
    description: "Use daily tithi and timing context alongside transit review.",
  },
  {
    title: "Rashifal",
    href: "/rashifal",
    icon: "RA",
    ctaLabel: "Read Rashifal",
    feature: "transit-shortcut-rashifal",
    description: "Read daily guidance after checking current movement.",
  },
  {
    title: "Ask NI",
    href: "/ai",
    icon: "NI",
    ctaLabel: "Ask NI",
    feature: "transit-shortcut-ai",
    description:
      "Use NAVAGRAHA Intelligence for AI-guided transit context.",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: "RP",
    ctaLabel: "View Reports",
    feature: "transit-shortcut-reports",
    description: "Move into structured reports when deeper review is needed.",
  },
  {
    title: "Consultation",
    href: "/consultation",
    icon: "CS",
    ctaLabel: "Consult",
    feature: "transit-shortcut-consultation",
    description: "Use human-led guidance for sensitive timing questions.",
  },
  {
    title: "Tools",
    href: "/tools",
    icon: "TH",
    ctaLabel: "Open Tools",
    feature: "transit-shortcut-tools",
    description: "Return to the complete astrology tools hub.",
  },
] as const;

const transitReadinessSteps = [
  {
    title: "Start with current movement",
    description:
      "Review the verified transit snapshot for body, sign, degree, nakshatra, and direction.",
  },
  {
    title: "Add chart context",
    description:
      "Transit impact becomes personal only when it is compared with protected Kundli context.",
  },
  {
    title: "Review timing safely",
    description:
      "Use Dasha, Panchang, reports, Ask NI, or consultation for practical interpretation.",
  },
] as const;

export const metadata = createToolMetadata({
  title: "Transit / Gochar Calculator",
  description:
    "Explore a safe Transit / Gochar foundation for planetary movement, current gochar, sign impact, timing influence, and Vedic guidance.",
  path: "/transit",
  keywords: [
    "transit calculator",
    "gochar calculator",
    "current planetary transit",
    "sidereal transit",
    "vedic transit",
  ],
});

export const revalidate = 3600;

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSignedDegree(value: number) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatLongitude(value: number) {
  return `${formatSignedDegree(value)}°`;
}

function formatPlanetLabel(value: string) {
  return (
    planetLabelMap[value.toUpperCase() as keyof typeof planetLabelMap] ??
    titleCase(value)
  );
}

function formatSignLabel(value: string) {
  return (
    zodiacSignLabelMap[value.toUpperCase() as keyof typeof zodiacSignLabelMap] ??
    titleCase(value)
  );
}

function formatNakshatraLabel(value: string) {
  return (
    nakshatraLabelMap[value.toUpperCase() as keyof typeof nakshatraLabelMap] ??
    titleCase(value)
  );
}

function formatSnapshotDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

function TransitFirstScreen({
  transitData,
  transitDateLabel,
}: Readonly<{
  transitData: TransitGocharFoundationSnapshot["data"] | null;
  transitDateLabel: string | null;
}>) {
  return (
    <section className="border-b border-[rgba(155,122,74,0.16)] bg-[linear-gradient(180deg,#fffefb_0%,#ffffff_100%)]">
      <Container className="grid gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(0,1.04fr)_minmax(300px,0.96fr)] lg:items-center lg:py-12">
        <div className="space-y-4 sm:space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge tone="trust" className="border border-black/8 bg-white">
              Transit / Gochar
            </Badge>
            <Badge
              tone="outline"
              className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]"
            >
              Planetary Movement
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
              Transit
            </h1>
            <p className="max-w-[48rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-lg)]">
              Planetary movement, current gochar, sign impact, timing influence, and Vedic guidance for understanding how the sky is moving now.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            {transitIntroCtas.map((cta) => (
              <TrackedLink
                key={cta.label}
                href={cta.href}
                eventName="cta_click"
                eventPayload={{ page: "/transit", feature: cta.feature }}
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
              "Current Gochar",
              "Moon Transit",
              "Saturn / Jupiter",
              "Rahu / Ketu",
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
              Snapshot-safe
            </Badge>
          </div>

          <div className="space-y-2">
            <h2 className="text-[length:var(--font-size-title-sm)] font-semibold text-[color:var(--color-ink-strong)]">
              Read current movement before personal impact.
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
              Transit impact becomes personal only after current movement is paired with verified Kundli context. This page does not invent positions, dates, or sign-wise predictions.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-[1.1rem] border border-[rgba(184,137,67,0.18)] bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
              <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                Transit Time
              </p>
              <p className="mt-1.5 text-[0.76rem] leading-[1.45] text-[color:var(--color-ink-body)]">
                {transitData
                  ? `As of ${transitDateLabel}`
                  : "Available when verified transit data is ready."}
              </p>
            </div>
            <div className="rounded-[1.1rem] border border-[rgba(184,137,67,0.18)] bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
              <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                Coverage
              </p>
              <p className="mt-1.5 text-[0.76rem] leading-[1.45] text-[color:var(--color-ink-body)]">
                {transitData
                  ? "Verified 12-body transit snapshot."
                  : "No fallback output is fabricated."}
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
}

function TransitPlanetCard({
  planet,
}: Readonly<{
  planet: NonNullable<TransitGocharFoundationSnapshot["data"]>["planets"][number];
}>) {
  return (
    <Card
      tone="default"
      className="flex h-full flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
            Transit Body
          </p>
          <h2 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
            {formatPlanetLabel(planet.planet)}
          </h2>
        </div>
        <Badge tone={planet.retrograde ? "neutral" : "trust"}>
          {planet.retrograde ? "Retrograde" : "Direct"}
        </Badge>
      </div>

      <div className="space-y-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
        <p>
          <span className="font-medium text-[color:var(--color-ink-strong)]">
            Sign:
          </span>{" "}
          {formatSignLabel(planet.sign)}
        </p>
        <p>
          <span className="font-medium text-[color:var(--color-ink-strong)]">
            Degree:
          </span>{" "}
          {formatSignedDegree(planet.degreeInSign)}°
        </p>
        <p>
          <span className="font-medium text-[color:var(--color-ink-strong)]">
            Longitude:
          </span>{" "}
          {formatLongitude(planet.longitude)}
        </p>
        <p>
          <span className="font-medium text-[color:var(--color-ink-strong)]">
            Nakshatra:
          </span>{" "}
          {formatNakshatraLabel(planet.nakshatra)}
        </p>
        <p>
          <span className="font-medium text-[color:var(--color-ink-strong)]">
            Pada:
          </span>{" "}
          {planet.pada}
        </p>
      </div>
    </Card>
  );
}

function TransitStructureCard({
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
      className="flex min-h-[8.4rem] flex-col justify-between gap-3 border-[rgba(184,137,67,0.2)] bg-white p-3 shadow-[0_10px_22px_rgba(17,24,39,0.045)] before:opacity-0"
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

function TransitShortcutCard({
  title,
  href,
  icon,
  ctaLabel,
  feature,
  description,
}: Readonly<(typeof transitShortcuts)[number]>) {
  return (
    <TrackedLink
      href={href}
      eventName="cta_click"
      eventPayload={{ page: "/transit", feature }}
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
            tone: title === "Ask NI" ? "ni" : "secondary",
            className: "mt-auto w-full justify-center",
          })}
        >
          {ctaLabel}
        </span>
      </Card>
    </TrackedLink>
  );
}

function TransitStatusCard({
  label,
  status,
  body,
  tone = "default",
}: Readonly<{
  label: string;
  status: string;
  body: string;
  tone?: "default" | "accent" | "light";
}>) {
  return (
    <Card
      tone={tone}
      className="flex h-full flex-col gap-3 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
            {label}
          </p>
          <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
            {status}
          </h3>
        </div>
        <Badge tone={status === "Unavailable" ? "neutral" : "trust"}>
          {status}
        </Badge>
      </div>
      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
        {body}
      </p>
    </Card>
  );
}

function TransitPageContent() {
  const transitSnapshot = buildTransitGocharFoundation({
    transitDateUtc: new Date(),
  });
  const transitData =
    transitSnapshot.status === "ready" ? transitSnapshot.data : null;
  const transitDateLabel = transitData
    ? formatSnapshotDate(transitData.transitDate)
    : null;
  const comparisonReadiness = transitData?.comparisonReadiness ?? null;

  return (
    <>
      <PageViewTracker page="/transit" feature="transit-page" />
      <AnalyticsEventTracker
        event="page_view"
        payload={{ page: "/transit", feature: "transit-page" }}
      />

      <main className="launch-page launch-page-transit min-h-screen bg-[linear-gradient(180deg,#fffefb_0%,#ffffff_28%,#fbf6ed_100%)] pb-[calc(7.2rem+env(safe-area-inset-bottom))] text-[color:var(--color-ink-strong)] xl:pb-0">
        <TransitFirstScreen
          transitData={transitData}
          transitDateLabel={transitDateLabel}
        />

        <Section
          id="transit-system"
          tone="light"
          category="utilities"
          eyebrow="Transit System"
          title="Read the transit layers without invented positions or sign-wise results."
          description="These cards explain the Transit / Gochar structure and stay value-safe unless verified calculation context is available."
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
            {transitStructureCards.map((item) => (
              <TransitStructureCard
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
          eyebrow="Current Transit"
          title="Current planetary positions are shown only when verified transit data is ready."
          description="The public page stays honest: if the transit engine is unavailable, it shows a safe empty state instead of a fabricated forecast."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <Card
              tone="default"
              className="space-y-4 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <div className="space-y-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Result Overview
                </Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  {transitData
                    ? "Verified transit data is ready for review"
                    : "Verified transit positions will appear when the engine returns a safe snapshot"}
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  {transitData
                    ? transitData.safeSummary
                    : "No raw JSON, guesswork, fake planetary positions, fake dates, or fake sign-wise results are shown here."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Transit Date
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    {transitData
                      ? transitDateLabel
                      : "Safe fallback until transit data is verified."}
                  </p>
                </div>
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    12 Bodies
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    {transitData
                      ? "All 12 planetary bodies are included in the current transit snapshot."
                      : "No fake transit output is shown in the fallback state."}
                  </p>
                </div>
              </div>
            </Card>

            <Card
              tone="default"
              className="space-y-4 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <div className="space-y-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Current Transit Snapshot
                </Badge>
                <h3 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  The 12-body transit grid stays calculation-backed.
                </h3>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  When available, the snapshot shows body, sign, degree, nakshatra, pada, longitude, and retrograde status only.
                </p>
              </div>

              {transitData ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {transitData.planets.map((planet) => (
                    <TransitPlanetCard key={planet.planet} planet={planet} />
                  ))}
                </div>
              ) : (
                <Card
                  tone="default"
                  className="space-y-3 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
                >
                  <Badge tone="neutral">Unavailable</Badge>
                  <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                    Verified transit positions will appear when the engine returns a safe snapshot
                  </h2>
                  <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    No raw JSON, guesswork, or fake planetary positions are shown here.
                  </p>
                </Card>
              )}
            </Card>
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Natal Overlay Readiness"
          title="Transit interpretation stays gated to verified Kundli context."
          description="The comparison layer remains calm and safe until protected natal chart context is available."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <TransitStatusCard
              label="Transit Snapshot"
              status={transitData ? "Ready" : "Unavailable"}
              body={
                transitData
                  ? "Current sidereal transits are ready for review."
                  : "Current transit positions are not available right now."
              }
              tone="light"
            />
            <TransitStatusCard
              label="Natal Overlay"
              status={
                comparisonReadiness?.natalChartAvailable ? "Ready" : "Pending"
              }
              body={
                comparisonReadiness?.natalChartAvailable
                  ? "Protected natal chart context is available for overlay."
                  : "Natal overlay unlocks after protected Kundli context is supplied."
              }
              tone="default"
            />
            <TransitStatusCard
              label="House Impact"
              status={comparisonReadiness?.houseOverlayReady ? "Ready" : "Pending"}
              body={
                comparisonReadiness?.houseOverlayReady
                  ? "House overlay readiness is available for chart-aware comparison."
                  : "House impact readiness unlocks after protected Kundli context is supplied."
              }
              tone="accent"
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(280px,0.98fr)]">
            <Card
              tone="default"
              className="space-y-4 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <div className="space-y-2">
                <Badge
                  tone={comparisonReadiness?.natalChartAvailable ? "trust" : "neutral"}
                  className="border border-black/8 bg-white"
                >
                  Active Kundli
                </Badge>
                <h3 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  {comparisonReadiness?.natalChartAvailable
                    ? "A verified Kundli foundation can ground transit comparison."
                    : "Set an active Kundli before comparing transit against natal context."}
                </h3>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  {comparisonReadiness?.natalChartAvailable
                    ? "Natal planet vs transit planet readiness is available for the current chart context."
                    : "The current public page keeps comparison safe until chart context is prepared through onboarding."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {transitReadinessSteps.map((step, index) => (
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
                  Use NAVAGRAHA Intelligence for transit context.
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Ask NI can help frame transit questions after you understand the movement. It is AI-guided assistance, not a replacement for human review.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <TrackedLink
                  href="/ai"
                  eventName="cta_click"
                  eventPayload={{ page: "/transit", feature: "transit-ni-panel" }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "ni",
                    className: "w-full justify-center",
                  })}
                >
                  Ask NI
                </TrackedLink>
                <TrackedLink
                  href="/consultation"
                  eventName="cta_click"
                  eventPayload={{
                    page: "/transit",
                    feature: "transit-consultation-panel",
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
          tone="transparent"
          category="utilities"
          eyebrow="Transit Shortcuts"
          title="Continue into the right route-safe surface."
          description="Use existing public tools and service pages without creating unverified transit results."
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {transitShortcuts.map((shortcut) => (
              <TransitShortcutCard key={shortcut.title} {...shortcut} />
            ))}
          </div>
        </Section>

        <Section
          tone="light"
          category="content"
          eyebrow="Guidance Safety"
          title="Transit is movement context, not a public prediction dump."
          description="Use the structure here to understand gochar, then move into Kundli, Dasha, reports, Ask NI, or consultation when personal context is needed."
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
                Keep major transit decisions grounded.
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                For sensitive decisions, combine calculated chart context with reports or consultation instead of relying on public structure cards alone.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[13rem]">
              <TrackedLink
                href="/reports"
                eventName="cta_click"
                eventPayload={{ page: "/transit", feature: "transit-trust-reports" }}
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
                  page: "/transit",
                  feature: "transit-trust-consultation",
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

export default function TransitPage() {
  return <TransitPageContent />;
}
