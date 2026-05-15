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
  buildTransitGocharFoundation,
  type TransitGocharFoundationSnapshot,
} from "@/modules/astrology/transit/foundation";
import {
  nakshatraLabelMap,
  planetLabelMap,
  zodiacSignLabelMap,
} from "@/lib/astrology/constants";

const transitActionCtas = [
  {
    href: "/kundli",
    label: "Generate Kundli",
    feature: "transit-page-generate-kundli",
    tone: "accent" as const,
  },
  {
    href: "/navagraha-ai",
    label: "Ask NAVAGRAHA AI",
    feature: "transit-page-ask-ai",
    tone: "secondary" as const,
  },
  {
    href: "/reports",
    label: "View Reports",
    feature: "transit-page-view-reports",
    tone: "secondary" as const,
  },
] as const;

export const metadata = createToolMetadata({
  title: "Transit / Gochar Calculator",
  description:
    "Review a safe Transit / Gochar snapshot with verified planetary positions, natal overlay readiness, and chart-aware next actions.",
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
        <Badge tone={status === "Unavailable" ? "neutral" : "trust"}>{status}</Badge>
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
  const transitData = transitSnapshot.status === "ready" ? transitSnapshot.data : null;
  const transitDateLabel = transitData ? formatSnapshotDate(transitData.transitDate) : null;
  const comparisonReadiness = transitData?.comparisonReadiness ?? null;

  return (
    <>
      <PageViewTracker page="/transit" feature="transit-page" />
      <AnalyticsEventTracker
        event="page_view"
        payload={{ page: "/transit", feature: "transit-page" }}
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
                  Transit / Gochar
                </Badge>
                <Badge tone="accent" className="border border-[rgba(184,137,67,0.18)] bg-white">
                  12 Bodies
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
                  Transit / Gochar Calculator
                </h1>
                <p className="max-w-[46rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-lg)]">
                  Review current sidereal planetary positions in a calm public foundation. Verified transit data appears only when the engine returns a safe 12-body snapshot.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {transitActionCtas.map((cta) => (
                  <TrackedLink
                    key={cta.label}
                    href={cta.href}
                    eventName="cta_click"
                    eventPayload={{ page: "/transit", feature: cta.feature }}
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
                  Snapshot Readiness
                </Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  {transitData
                    ? "Verified current transit positions are available"
                    : "Safe public foundation, not a fabricated gochar forecast"}
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  {transitData
                    ? transitData.safeSummary
                    : "This page will not invent transit positions. It remains calm and readable until verified data is available."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Transit Time
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    {transitData
                      ? `As of ${transitDateLabel}`
                      : "Safe fallback until transit data is verified."}
                  </p>
                </div>
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Coverage
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    {transitData
                      ? "All 12 planetary bodies are included in the snapshot."
                      : "No fake transit output is shown in the fallback state."}
                  </p>
                </div>
              </div>
            </Card>
          </Container>
        </section>

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
                    : "No raw JSON, guesswork, or fake planetary positions are shown here."}
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
                  Current Transit Summary
                </Badge>
                <h3 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  The 12-body transit grid is shown below without inventing timing claims.
                </h3>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  The page keeps the current transit layer simple: body, sign, degree, nakshatra, and retrograde status only.
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
              status={comparisonReadiness?.natalChartAvailable ? "Ready" : "Pending"}
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
                  : "House impact readiness unlocks after the protected Kundli context is supplied."
              }
              tone="accent"
            />
          </div>

          <Card
            tone="default"
            className="mt-4 grid gap-5 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]"
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
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:justify-end">
              <TrackedLink
                href="/kundli"
                eventName="cta_click"
                eventPayload={{ page: "/transit", feature: "transit-set-active-kundli" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "accent",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Set Active Kundli
              </TrackedLink>
              <TrackedLink
                href="/kundli"
                eventName="cta_click"
                eventPayload={{ page: "/transit", feature: "transit-generate-kundli" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Generate Kundli
              </TrackedLink>
            </div>
          </Card>
        </Section>

        <Section tone="transparent" category="utilities" eyebrow="Next Actions">
          <Card
            tone="accent"
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
          >
            <div className="space-y-3">
              <Badge tone="accent">Chart-Aware Path</Badge>
              <h2
                className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[var(--color-ink-strong)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Continue into Kundli, NAVAGRAHA AI, or reports for deeper chart-aware guidance.
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                Transit is a timing lens. Pair it with natal context when you want deeper interpretation.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              {transitActionCtas.map((cta) => (
                <TrackedLink
                  key={`footer-${cta.label}`}
                  href={cta.href}
                  eventName="cta_click"
                  eventPayload={{ page: "/transit", feature: `${cta.feature}-footer` }}
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
          </Card>
        </Section>
      </main>
    </>
  );
}

export default function TransitPage() {
  return <TransitPageContent />;
}

