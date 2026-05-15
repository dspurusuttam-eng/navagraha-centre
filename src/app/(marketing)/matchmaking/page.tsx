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

type BirthField = {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "date" | "time";
  optional?: boolean;
  inputMode?: "text" | "decimal";
};

const heroBadges = [
  "Guna Milan Ready",
  "Manglik Safe Mode",
  "Saved Kundli Protected",
  "Privacy-Safe",
] as const;

const birthFields: readonly BirthField[] = [
  { key: "full-name", label: "Full name", placeholder: "Enter full name", type: "text" },
  { key: "date-of-birth", label: "Date of birth", placeholder: "Select date", type: "date" },
  { key: "time-of-birth", label: "Time of birth", placeholder: "Select time", type: "time" },
  { key: "birth-place", label: "Birth place", placeholder: "City, state, country", type: "text" },
  {
    key: "latitude",
    label: "Latitude",
    placeholder: "Optional",
    type: "text",
    optional: true,
    inputMode: "decimal",
  },
  {
    key: "longitude",
    label: "Longitude",
    placeholder: "Optional",
    type: "text",
    optional: true,
    inputMode: "decimal",
  },
  {
    key: "timezone",
    label: "Timezone",
    placeholder: "Optional",
    type: "text",
    optional: true,
  },
] as const;

const gunaReadinessCards = [
  {
    title: "Varna",
    status: "Pending",
    summary: "Ready when verified charts are connected.",
  },
  {
    title: "Vashya",
    status: "Pending",
    summary: "Ready when verified charts are connected.",
  },
  {
    title: "Tara",
    status: "Pending",
    summary: "Ready when verified charts are connected.",
  },
  {
    title: "Yoni",
    status: "Pending",
    summary: "Ready when verified charts are connected.",
  },
  {
    title: "Graha Maitri",
    status: "Pending",
    summary: "Ready when verified charts are connected.",
  },
  {
    title: "Gana",
    status: "Pending",
    summary: "Ready when verified charts are connected.",
  },
  {
    title: "Bhakoot",
    status: "Pending",
    summary: "Ready when verified charts are connected.",
  },
  {
    title: "Nadi",
    status: "Pending",
    summary: "Ready when verified charts are connected.",
  },
] as const;

const manglikReadinessCards = [
  {
    title: "Lagna reference",
    status: "Pending",
    summary: "Verified chart context is required before Manglik comparison appears.",
  },
  {
    title: "Moon reference",
    status: "Pending",
    summary: "Verified chart context is required before Manglik comparison appears.",
  },
  {
    title: "Venus reference",
    status: "Pending",
    summary: "Verified chart context is required before Manglik comparison appears.",
  },
] as const;

const resultUiSlots = [
  {
    title: "Total score",
    label: "Guna Milan",
    value: "Calculation preparing",
    note: "Verified Ashtakoot output will appear only after protected chart pairing is available.",
  },
  {
    title: "Ashtakoot breakdown",
    label: "Guna Milan",
    value: "Hidden safely",
    note: "No points or score lines are fabricated while the public page is in safe mode.",
  },
  {
    title: "Manglik status",
    label: "Manglik",
    value: "Analysis preparing",
    note: "Lagna, Moon, and Venus references stay in safe mode until verified data is supplied.",
  },
  {
    title: "Compatibility summary",
    label: "Summary",
    value: "Safe fallback",
    note: "Consultation is recommended for complex or ambiguous relationship contexts.",
  },
] as const;

const nextActionCtas = [
  {
    href: "/kundli",
    label: "Generate Kundli",
    feature: "matchmaking-generate-kundli",
    tone: "accent" as const,
  },
  {
    href: "/navagraha-ai",
    label: "Ask NAVAGRAHA AI",
    feature: "matchmaking-ask-ai",
    tone: "secondary" as const,
  },
  {
    href: "/consultation",
    label: "Book Consultation",
    feature: "matchmaking-book-consultation",
    tone: "secondary" as const,
  },
  {
    href: "/reports",
    label: "View Marriage Report",
    feature: "matchmaking-view-report",
    tone: "secondary" as const,
  },
] as const;

function BirthDetailCard({
  title,
  prefix,
}: Readonly<{
  title: string;
  prefix: "boy" | "girl";
}>) {
  return (
    <Card
      tone="default"
      className="space-y-4 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
            Birth details
          </p>
          <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
            {title}
          </h3>
        </div>
        <Badge tone="trust" className="border border-black/8 bg-white">
          Safe Mode
        </Badge>
      </div>

      <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
        Required fields are birth date, birth time, and birth place. Latitude, longitude, and timezone stay optional until a verified pairing is connected.
      </p>

      <div className="grid gap-3">
        {birthFields.map((field) => {
          const inputId = `${prefix}-${field.key}`;

          return (
            <label key={inputId} className="space-y-1.5">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-[0.68rem] uppercase tracking-[0.08em] text-[#111111]">
                  {field.label}
                </span>
                <Badge
                  tone={field.optional ? "outline" : "accent"}
                  className="border border-black/8 bg-white"
                >
                  {field.optional ? "Optional" : "Required"}
                </Badge>
              </span>
              <input
                id={inputId}
                name={inputId}
                type={field.type}
                inputMode={field.inputMode}
                className="min-h-11 w-full rounded-[var(--radius-lg)] border border-black/12 bg-white px-4 py-3 text-[#111111] outline-none transition placeholder:text-[#8A8A8A] focus:border-[rgba(184,137,67,0.65)] focus:ring-2 focus:ring-[rgba(184,137,67,0.12)]"
                placeholder={field.placeholder}
                aria-label={`${title} ${field.label}`}
              />
            </label>
          );
        })}
      </div>

      <div className="rounded-[1rem] border border-[rgba(184,137,67,0.18)] bg-white px-4 py-3">
        <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
          Validation
        </p>
        <p className="mt-2 text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
          Missing date, time, or place keeps compatibility in calculation-preparing mode. No cross-user chart data is exposed here.
        </p>
      </div>
    </Card>
  );
}

function ReadinessCard({
  title,
  status,
  summary,
}: Readonly<{
  title: string;
  status: string;
  summary: string;
}>) {
  return (
    <Card
      tone="default"
      className="flex h-full flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_10px_24px_rgba(17,24,39,0.04)] before:opacity-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
            Readiness
          </p>
          <h4 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
            {title}
          </h4>
        </div>
        <Badge tone="neutral">{status}</Badge>
      </div>
      <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
        {summary}
      </p>
    </Card>
  );
}

export const metadata = createToolMetadata({
  title: "Kundli Matching / Compatibility",
  description:
    "Compare two birth charts with safe Guna Milan, Manglik readiness, and verified chart pairing only. No fake scores or fear-based verdicts are shown.",
  path: "/matchmaking",
  keywords: [
    "kundli matching",
    "guna milan",
    "manglik compatibility",
    "marriage compatibility",
    "vedic relationship astrology",
  ],
});

export const revalidate = 3600;

export default function MatchmakingPage() {
  return (
    <>
      <PageViewTracker page="/matchmaking" feature="matchmaking-page" />
      <AnalyticsEventTracker
        event="page_view"
        payload={{ page: "/matchmaking", feature: "matchmaking-page" }}
      />

      <main className="min-h-screen bg-[#FFFFFF] pb-[calc(7rem+env(safe-area-inset-bottom))] text-[color:var(--color-ink-strong)] md:pb-0">
        <section className="border-b border-black/8 bg-white">
          <Container className="grid gap-8 py-10 sm:py-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:items-center lg:py-14">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  NAVAGRAHA CENTRE
                </Badge>
                <Badge tone="outline" className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]">
                  Kundli Matching / Compatibility
                </Badge>
                <Badge tone="accent" className="border border-[rgba(184,137,67,0.18)] bg-white">
                  Guna Milan
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
                  Kundli Matching / Compatibility
                </h1>
                <p className="max-w-[46rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-lg)]">
                  Compare two verified birth charts with calm Guna Milan and Manglik readiness. The public foundation stays honest: it never fabricates a score, dosha result, or marriage outcome.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {heroBadges.map((badge) => (
                  <Badge
                    key={badge}
                    tone="outline"
                    className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {nextActionCtas.map((cta) => (
                  <TrackedLink
                    key={cta.label}
                    href={cta.href}
                    eventName="cta_click"
                    eventPayload={{ page: "/matchmaking", feature: cta.feature }}
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
              <div className="flex flex-wrap items-start gap-4">
                <UtilityIcon name="compatibility" className="h-16 w-16 shrink-0" />
                <div className="space-y-2">
                  <Badge tone="trust" className="border border-black/8 bg-white">
                    Calculation Preparing
                  </Badge>
                  <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                    Verified compatibility output appears only after chart pairing is ready
                  </h2>
                  <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    This foundation stays safe by keeping the public result layer empty until a verified chart context is available.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Guna Milan
                  </p>
                  <p className="mt-2 text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    No fake score or Ashtakoot points are shown until verified charts are connected.
                  </p>
                </div>
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Manglik
                  </p>
                  <p className="mt-2 text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    Lagna, Moon, and Venus references remain in safe mode until verified data is supplied.
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
          title="Enter both birth profiles before moving into verified compatibility."
          description="The public page shows Boy and Girl input readiness, but protected chart pairing stays inside safe chart flows."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <BirthDetailCard title="Boy birth details" prefix="boy" />
            <BirthDetailCard title="Girl birth details" prefix="girl" />
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Result UI Readiness"
          title="Result panels stay visible without inventing a compatibility verdict."
          description="The public interface is ready for verified Guna Milan and Manglik output, but it remains in safe fallback mode until both charts are properly connected."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {resultUiSlots.map((slot) => (
              <Card
                key={slot.title}
                tone="default"
                className="space-y-3 border-black/8 bg-white shadow-[0_12px_28px_rgba(17,24,39,0.045)] before:opacity-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                      {slot.label}
                    </p>
                    <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
                      {slot.title}
                    </h3>
                  </div>
                  <Badge tone="neutral">{slot.value}</Badge>
                </div>
                <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  {slot.note}
                </p>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Compatibility Summary"
          title="Compatibility stays in calculation-preparing mode until verified chart pairing is available."
          description="The summary panel remains honest and safe. It does not fabricate a Guna Milan score, Manglik verdict, or marriage certainty."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(300px,0.98fr)]">
            <Card
              tone="default"
              className="space-y-4 border-black/8 bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <div className="space-y-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Safe Empty State
                </Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-ink-strong)]">
                  Verified compatibility output will appear after chart pairing is connected
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  No public score, no fear-based verdict, and no cross-user data exposure are shown here.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Guna Milan",
                    value: "Pending",
                    note: "Ashtakoot output remains hidden until verified charts exist.",
                  },
                  {
                    label: "Manglik",
                    value: "Pending",
                    note: "Lagna, Moon, and Venus checks stay in safe mode.",
                  },
                  {
                    label: "Saved Kundli",
                    value: "Protected",
                    note: "Comparison support lives in the dashboard only.",
                  },
                  {
                    label: "Public score",
                    value: "Hidden",
                    note: "No numeric compatibility score is fabricated.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4"
                  >
                    <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
                      {item.value}
                    </p>
                  <p className="mt-2 text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card
              tone="accent"
              className="space-y-4 border-[rgba(184,137,67,0.2)] bg-white shadow-[0_14px_34px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <Badge tone="accent">Saved Kundli Comparison</Badge>
              <p className="text-[0.92rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                If you already have saved charts, continue through the protected dashboard flow. Public compatibility should not expose another user&apos;s birth details.
              </p>
              <div className="grid gap-2">
              <TrackedLink
                href="/kundli"
                eventName="cta_click"
                eventPayload={{ page: "/matchmaking", feature: "matchmaking-open-saved-kundli" }}
                className={buttonStyles({
                    size: "sm",
                    tone: "accent",
                    className: "w-full justify-center",
                  })}
                >
                  Open Saved Kundli
              </TrackedLink>
              <TrackedLink
                href="/kundli"
                eventName="cta_click"
                eventPayload={{ page: "/matchmaking", feature: "matchmaking-set-active-kundli" }}
                className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className: "w-full justify-center",
                  })}
                >
                  Set Active Kundli
                </TrackedLink>
                <TrackedLink
                  href="/consultation"
                  eventName="cta_click"
                  eventPayload={{ page: "/matchmaking", feature: "matchmaking-consultation-fallback" }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "ghost",
                    className: "w-full justify-center",
                  })}
                >
                  Consultation Fallback
                </TrackedLink>
              </div>
              <div className="rounded-[1rem] border border-[rgba(184,137,67,0.18)] bg-white px-4 py-3">
                <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                  Privacy Note
                </p>
                <p className="mt-2 text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Cross-user saved Kundli access, raw chart JSON, and private birth data are never exposed on this public page.
                </p>
              </div>
            </Card>
          </div>
        </Section>

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Guna Milan Readiness"
          title="Eight kootas stay visible as readiness markers until verified output is connected."
          description="The public surface is deliberately modest: it signals what will appear later, without inventing any Ashtakoot score."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {gunaReadinessCards.map((card) => (
              <ReadinessCard key={card.title} {...card} />
            ))}
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Manglik Compatibility"
          title="Manglik readiness stays grounded in verified Lagna, Moon, and Venus references."
          description="No fear-based verdicts are shown. The page keeps Manglik context practical and consultation-ready."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {manglikReadinessCards.map((card) => (
              <ReadinessCard key={card.title} {...card} />
            ))}
          </div>
        </Section>
      </main>
    </>
  );
}
