import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { UtilityIcon } from "@/components/graphics/utility-icons";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { createToolMetadata } from "@/lib/seo/metadata";

const matchmakingIntroCtas = [
  {
    href: "#matchmaking-structure",
    label: "Start Matchmaking",
    feature: "matchmaking-hero-start",
    tone: "accent" as const,
  },
  {
    href: "/ai",
    label: "Ask NI",
    feature: "matchmaking-hero-ask-ni",
    tone: "secondary" as const,
  },
  {
    href: "/kundli",
    label: "Open Kundli",
    feature: "matchmaking-hero-open-kundli",
    tone: "secondary" as const,
  },
  {
    href: "/reports",
    label: "View Reports",
    feature: "matchmaking-hero-view-reports",
    tone: "secondary" as const,
  },
  {
    href: "/consultation",
    label: "Book Consultation",
    feature: "matchmaking-hero-book-consultation",
    tone: "secondary" as const,
  },
] as const;

const matchmakingStructureCards = [
  {
    title: "Kundli Matching",
    label: "Chart pairing",
    description:
      "Matchmaking begins with two verified birth-chart foundations, not public placeholder verdicts.",
  },
  {
    title: "Guna Milan",
    label: "Ashtakoot layer",
    description:
      "The public page stays structure-only until protected chart pairing can produce real Guna output.",
  },
  {
    title: "Manglik / Dosha Check",
    label: "Compatibility caution",
    description:
      "Dosha-sensitive comparison must come from verified chart context, not from manually written labels.",
  },
  {
    title: "Emotional Compatibility",
    label: "Relationship context",
    description:
      "Emotional harmony belongs in chart-aware interpretation, not a fabricated percentage score.",
  },
  {
    title: "Family & Marriage Harmony",
    label: "Practical guidance",
    description:
      "The page frames relationship readiness calmly without promising an outcome or guarantee.",
  },
  {
    title: "Timing Guidance",
    label: "Marriage timing",
    description:
      "Timing context should connect with Kundli, Dasha, and Muhurat when protected data is ready.",
  },
  {
    title: "Report Support",
    label: "Deeper review",
    description:
      "Structured reports remain the route-safe path for deeper compatibility review.",
  },
  {
    title: "Consultation Support",
    label: "Human review",
    description:
      "Sensitive relationship questions can move into consultation without exposing private chart data publicly.",
  },
] as const;

const matchmakingReadinessCards = [
  {
    title: "Birth details for both people",
    status: "Required",
    description:
      "Date, time, and place are required before protected compatibility comparison can begin.",
  },
  {
    title: "Chart pairing",
    status: "Protected",
    description:
      "Pairing remains inside safe chart flows so no public cross-user data is exposed.",
  },
  {
    title: "Guna score output",
    status: "Hidden safely",
    description:
      "No fake Guna Milan score, partial points, or public numeric verdict appears here.",
  },
  {
    title: "Manglik comparison",
    status: "Preparing",
    description:
      "Manglik and dosha-sensitive comparison stays calm and hidden until verified chart context exists.",
  },
  {
    title: "Compatibility summary",
    status: "Safe mode",
    description:
      "The page avoids fake harmony percentages, certainty claims, or marriage guarantees.",
  },
  {
    title: "Private chart continuity",
    status: "Protected",
    description:
      "Saved charts, raw JSON, and detailed result history remain outside the public route.",
  },
] as const;

const matchmakingShortcutCards = [
  {
    title: "Kundli",
    href: "/kundli",
    icon: "KU",
    ctaLabel: "Open Kundli",
    feature: "matchmaking-shortcut-kundli",
    description: "Start from the natal chart before reading compatibility.",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: "RP",
    ctaLabel: "View Reports",
    feature: "matchmaking-shortcut-reports",
    description: "Use structured reports for deeper relationship review.",
  },
  {
    title: "Consultation",
    href: "/consultation",
    icon: "CS",
    ctaLabel: "Book Consultation",
    feature: "matchmaking-shortcut-consultation",
    description: "Move into human-led review for sensitive marriage questions.",
  },
  {
    title: "Ask NI",
    href: "/ai",
    icon: "NI",
    ctaLabel: "Ask NI",
    feature: "matchmaking-shortcut-ai",
    description: "Use NAVAGRAHA Intelligence for AI-guided compatibility context.",
  },
  {
    title: "Dosha / Yoga",
    href: "/dosha-yoga",
    icon: "DY",
    ctaLabel: "Review Dosha / Yoga",
    feature: "matchmaking-shortcut-dosha-yoga",
    description: "Check related chart indicators through the safe public layer.",
  },
  {
    title: "Remedies",
    href: "/remedies",
    icon: "RE",
    ctaLabel: "Open Remedies",
    feature: "matchmaking-shortcut-remedies",
    description: "Keep remedies practical and route-safe without fear-based claims.",
  },
  {
    title: "Muhurat",
    href: "/muhurat",
    icon: "MU",
    ctaLabel: "Explore Muhurat",
    feature: "matchmaking-shortcut-muhurat",
    description: "Use Muhurat when timing questions become relevant later.",
  },
  {
    title: "Tools",
    href: "/tools",
    icon: "TH",
    ctaLabel: "Open Tools",
    feature: "matchmaking-shortcut-tools",
    description: "Return to the full tools hub without leaving the public shell.",
  },
] as const;

const guidanceCards = [
  {
    title: "Relationship fit stays chart-aware",
    body:
      "Compatibility is not reduced to a public percentage. Emotional, family, and marriage context need verified chart pairing.",
  },
  {
    title: "Timing should stay practical",
    body:
      "Marriage timing questions belong with Kundli, Dasha, Muhurat, and consultation support, not a one-line public verdict.",
  },
  {
    title: "Public page remains privacy-safe",
    body:
      "No partner data, raw chart JSON, or saved private comparison history is exposed on this route.",
  },
] as const;

export const metadata = createToolMetadata({
  title: "Matchmaking / Guna Milan",
  description:
    "Explore a safe Matchmaking foundation for Kundli matching, Guna Milan, relationship compatibility, and Vedic marriage guidance without fake public scores.",
  path: "/matchmaking",
  keywords: [
    "matchmaking",
    "kundli matching",
    "guna milan",
    "marriage compatibility",
    "vedic marriage guidance",
  ],
});

export const revalidate = 3600;

function MatchmakingStructureCard({
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
      className="flex min-h-[8.8rem] flex-col justify-between gap-3 border-[rgba(184,137,67,0.2)] bg-white p-3 shadow-[0_10px_22px_rgba(17,24,39,0.045)] before:opacity-0"
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

function MatchmakingStatusCard({
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
            Matchmaking Status
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

function MatchmakingShortcutCard({
  title,
  href,
  icon,
  ctaLabel,
  feature,
  description,
}: Readonly<(typeof matchmakingShortcutCards)[number]>) {
  return (
    <TrackedLink
      href={href}
      eventName="cta_click"
      eventPayload={{ page: "/matchmaking", feature }}
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

export default function MatchmakingPage() {
  return (
    <>
      <PageViewTracker page="/matchmaking" feature="matchmaking-page" />
      <AnalyticsEventTracker
        event="page_view"
        payload={{ page: "/matchmaking", feature: "matchmaking-page" }}
      />

      <main className="min-h-screen bg-[linear-gradient(180deg,#fffefb_0%,#ffffff_28%,#fbf6ed_100%)] pb-[calc(7.2rem+env(safe-area-inset-bottom))] text-[color:var(--color-ink-strong)] xl:pb-0">
        <section className="border-b border-[rgba(155,122,74,0.16)] bg-[linear-gradient(180deg,#fffefb_0%,#ffffff_100%)]">
          <Container className="grid gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(0,1.04fr)_minmax(300px,0.96fr)] lg:items-center lg:py-12">
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Matchmaking
                </Badge>
                <Badge
                  tone="outline"
                  className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]"
                >
                  Kundli Matching
                </Badge>
                <Badge
                  tone="outline"
                  className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]"
                >
                  Guna Milan
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
                  Matchmaking
                </h1>
                <p className="max-w-[48rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-lg)]">
                  Kundli matching, Guna Milan, relationship compatibility, and Vedic marriage guidance presented through a calm, privacy-safe public foundation.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                {matchmakingIntroCtas.map((cta) => (
                  <TrackedLink
                    key={cta.label}
                    href={cta.href}
                    eventName="cta_click"
                    eventPayload={{ page: "/matchmaking", feature: cta.feature }}
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
                  "Chart pairing",
                  "Guna Milan",
                  "Dosha check",
                  "Timing guidance",
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
                  Safe-mode public shell
                </Badge>
              </div>

              <div className="flex items-start gap-4">
                <UtilityIcon name="compatibility" className="h-16 w-16 shrink-0" />
                <div className="space-y-2">
                  <h2 className="text-[length:var(--font-size-title-sm)] font-semibold text-[color:var(--color-ink-strong)]">
                    Begin with two verified birth foundations, not a public score.
                  </h2>
                  <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    This page does not invent compatibility percentages, Guna Milan points, dosha verdicts, or marriage outcomes. It prepares the route-safe structure before deeper protected comparison.
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-[1.1rem] border border-[rgba(184,137,67,0.18)] bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
                  <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Guna Milan
                  </p>
                  <p className="mt-1.5 text-[0.76rem] leading-[1.45] text-[color:var(--color-ink-body)]">
                    Visible only after verified chart pairing.
                  </p>
                </div>
                <div className="rounded-[1.1rem] border border-[rgba(184,137,67,0.18)] bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
                  <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Manglik / Dosha
                  </p>
                  <p className="mt-1.5 text-[0.76rem] leading-[1.45] text-[color:var(--color-ink-body)]">
                    Safe until protected comparison is ready.
                  </p>
                </div>
                <div className="rounded-[1.1rem] border border-[rgba(184,137,67,0.18)] bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
                  <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Human Review
                  </p>
                  <p className="mt-1.5 text-[0.76rem] leading-[1.45] text-[color:var(--color-ink-body)]">
                    Reports and consultation remain the careful next step.
                  </p>
                </div>
              </div>
            </Card>
          </Container>
        </section>

        <Section
          id="matchmaking-structure"
          tone="light"
          category="utilities"
          eyebrow="Matchmaking Structure"
          title="Read the compatibility layers without fabricated scores or partner verdicts."
          description="These cards show the structure of the Matchmaking flow while keeping all scoring, partner data, and prediction layers frozen."
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {matchmakingStructureCards.map((item) => (
              <MatchmakingStructureCard
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
          eyebrow="Readiness"
          title="The public flow stays honest about what must exist before compatibility appears."
          description="Birth context, protected chart pairing, and private comparison remain separate from the public shell."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(280px,0.98fr)]">
            <Card
              tone="default"
              className="space-y-4 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <div className="space-y-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Compatibility Readiness
                </Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  Matchmaking output stays hidden until both chart foundations are ready.
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  The page keeps structure visible while withholding fake Guna scores, dosha verdicts, and partner-level conclusions.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {matchmakingReadinessCards.map((item) => (
                  <MatchmakingStatusCard
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
              <Badge tone="accent">Safe Public Guidance</Badge>
              <div className="space-y-2">
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  Ask NI for context, then move into reports or consultation when the question becomes personal.
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  NAVAGRAHA Intelligence is AI-guided assistance for understanding compatibility themes. Joy Prakash Sarmah remains the human authority for careful interpretation.
                </p>
              </div>

              <div className="grid gap-3">
                {guidanceCards.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1rem] border border-[rgba(184,137,67,0.18)] bg-white px-4 py-3"
                  >
                    <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                      Guidance
                    </p>
                    <h3 className="mt-2 text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <TrackedLink
                  href="/ai"
                  eventName="cta_click"
                  eventPayload={{ page: "/matchmaking", feature: "matchmaking-ni-panel" }}
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
                    page: "/matchmaking",
                    feature: "matchmaking-consultation-panel",
                  }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className: "w-full justify-center",
                  })}
                >
                  Book Consultation
                </TrackedLink>
              </div>
            </Card>
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Route-safe Shortcuts"
          title="Continue into the right compatibility support surface."
          description="These shortcuts stay on existing public routes and avoid fake compatibility outputs."
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {matchmakingShortcutCards.map((shortcut) => (
              <MatchmakingShortcutCard key={shortcut.title} {...shortcut} />
            ))}
          </div>
        </Section>

        <Section
          tone="transparent"
          category="content"
          eyebrow="Trust & Conversion"
          title="Use structured support when the relationship question needs a deeper reading."
          description="Reports and consultation are the route-safe next steps when compatibility needs chart-aware interpretation."
        >
          <Card
            tone="default"
            className="flex flex-col gap-4 border-[rgba(184,137,67,0.2)] bg-white p-5 shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="max-w-2xl space-y-2">
              <Badge tone="trust" className="border border-black/8 bg-white">
                J P Sarmah Desk
              </Badge>
              <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                Keep compatibility decisions grounded in verified chart context.
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                This page does not promise marriage success, urgent certainty, or a public compatibility guarantee. Use reports or consultation when the question needs careful human review.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[13rem]">
              <TrackedLink
                href="/reports"
                eventName="cta_click"
                eventPayload={{ page: "/matchmaking", feature: "matchmaking-trust-reports" }}
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
                  page: "/matchmaking",
                  feature: "matchmaking-trust-consultation",
                }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center",
                })}
              >
                Book Consultation
              </TrackedLink>
            </div>
          </Card>
        </Section>
      </main>
    </>
  );
}
