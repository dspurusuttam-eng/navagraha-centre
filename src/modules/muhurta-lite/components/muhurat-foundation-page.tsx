import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { PageHero } from "@/components/site/page-hero";
import { MuhurtaLiteToolPanel } from "@/modules/muhurta-lite/components/muhurta-lite-tool-panel";

type MuhuratReadinessItem = {
  title: string;
  status: string;
  description: string;
};

const muhuratCategoryCards: readonly MuhuratReadinessItem[] = [
  {
    title: "Marriage Muhurat",
    status: "Preparation",
    description:
      "Traditional marriage timing stays in preparation mode until verified timing is available.",
  },
  {
    title: "Griha Pravesh Muhurat",
    status: "Preparation",
    description:
      "House entry timing remains advisory and should be checked against real Panchang data.",
  },
  {
    title: "Vehicle Muhurat",
    status: "Preparation",
    description:
      "Vehicle purchase timing is treated as a timing reference, not a guarantee of outcome.",
  },
  {
    title: "Business Muhurat",
    status: "Preparation",
    description:
      "Business start timing stays optional and should be reviewed with practical planning.",
  },
  {
    title: "Naming Muhurat",
    status: "Preparation",
    description:
      "Naming ceremony timing remains a verified-calculation placeholder until data is ready.",
  },
  {
    title: "Property Muhurat",
    status: "Preparation",
    description:
      "Property timing stays tied to the real calendar and Panchang layer, not a fabricated date.",
  },
] as const;

const calendarCategoryCards: readonly MuhuratReadinessItem[] = [
  {
    title: "Hindu Calendar",
    status: "Panchang-linked",
    description:
      "Use the live Panchang page for verified tithi, nakshatra, yoga, and karana context.",
  },
  {
    title: "Festival Calendar",
    status: "Panchang-linked",
    description:
      "Festival awareness stays tied to verified calendar data rather than hand-written dates.",
  },
  {
    title: "Monthly Panchang",
    status: "Panchang-linked",
    description:
      "Monthly timing context belongs to the live Panchang route and its verified data source.",
  },
  {
    title: "Choghadiya",
    status: "Panchang-linked",
    description:
      "Choghadiya readiness is preserved through the timing stack and the public Panchang page.",
  },
  {
    title: "Hora",
    status: "Panchang-linked",
    description:
      "Hora support is represented as a timing layer rather than a fabricated schedule.",
  },
  {
    title: "Rahu Kaal",
    status: "Panchang-linked",
    description:
      "Rahu Kaal remains a cautionary planning reference, not a fear-based warning.",
  },
] as const;

const timingReadinessItems: readonly MuhuratReadinessItem[] = [
  {
    title: "Date",
    status: "Required",
    description:
      "Enter a date before any verified muhurat output can appear.",
  },
  {
    title: "Place",
    status: "Required",
    description:
      "Location keeps timing windows tied to the correct timezone and coordinates.",
  },
  {
    title: "Event Type",
    status: "Optional",
    description:
      "Choose the type of event you want to review once the calculation is ready.",
  },
  {
    title: "Panchang Context",
    status: "Ready",
    description:
      "The public page connects into the live Panchang layer for verified timing support.",
  },
  {
    title: "Safe Empty State",
    status: "Preparation",
    description:
      "Verified Muhurat calculation preparing. No date or timing is fabricated on load.",
  },
] as const;

const nextActions = [
  {
    href: "/panchang",
    label: "Open Panchang",
    tone: "accent" as const,
    feature: "muhurat-next-panchang",
  },
  {
    href: "/ai",
    label: "Ask NI",
    tone: "secondary" as const,
    feature: "muhurat-next-ai",
  },
  {
    href: "/consultation",
    label: "Book Consultation",
    tone: "secondary" as const,
    feature: "muhurat-next-consultation",
  },
] as const;

function FoundationCard({
  item,
  tone = "light",
  cta,
}: Readonly<{
  item: MuhuratReadinessItem;
  tone?: "light" | "default";
  cta?: { href: string; label: string; feature: string };
}>) {
  return (
    <Card
      tone={tone}
      className="flex h-full flex-col gap-3 border-black/8 bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.04)] before:opacity-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
            Muhurat Category
          </p>
          <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
            {item.title}
          </h3>
        </div>
        <Badge tone={item.status === "Preparation" ? "neutral" : "trust"}>
          {item.status}
        </Badge>
      </div>
      <p className="text-[0.88rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
        {item.description}
      </p>
      {cta ? (
        <TrackedLink
          href={cta.href}
          eventName="cta_click"
          eventPayload={{
            page: "/muhurat",
            feature: cta.feature,
          }}
          className={buttonStyles({
            size: "sm",
            tone: "secondary",
            className: "w-full justify-center",
          })}
        >
          {cta.label}
        </TrackedLink>
      ) : null}
    </Card>
  );
}

export function MuhuratFoundationPage({
  pagePath,
}: Readonly<{
  pagePath: "/muhurta" | "/muhurat";
}>) {
  return (
    <>
      <PageViewTracker page={pagePath} feature="muhurta-lite-page" />
      <AnalyticsEventTracker
        event="page_view"
        payload={{ page: pagePath, feature: "muhurta-lite-page" }}
      />

      <main className="launch-page launch-page-muhurat min-h-screen bg-[#FFFFFF] pb-[calc(7rem+env(safe-area-inset-bottom))] text-[color:var(--color-ink-strong)] md:pb-0">
        <PageHero
          eyebrow="Muhurat Utility"
          title="Muhurat & Hindu Calendar"
          description="Use traditional timing guidance as an optional planning layer. The page stays rooted in verified Panchang context and never fabricates dates or timing windows."
          highlights={[
            "Date and place readiness stay required before verified timing appears.",
            "Muhurat categories remain preparation-first until real timing is available.",
            "Panchang, consultation, and AI links stay optional and route-safe.",
          ]}
          note="Muhurat is traditional timing guidance, not a guarantee. For important events, combine it with Panchang and expert review."
          primaryAction={{
            href: "#muhurat-tool",
            label: "Check Verified Timing",
            eventName: "cta_click",
            eventPayload: {
              page: pagePath,
              feature: "muhurat-hero-primary",
            },
          }}
          secondaryAction={{
            href: "/panchang",
            label: "Open Panchang",
            eventName: "cta_click",
            eventPayload: {
              page: pagePath,
              feature: "muhurat-hero-secondary",
            },
          }}
          supportTitle="Timing Readiness"
        />

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Safe Empty State"
          title="Verified Muhurat calculation preparing until date and place are entered."
          description="No timing window is shown until the live calculation has enough verified context."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {timingReadinessItems.map((item) => (
              <FoundationCard key={item.title} item={item} />
            ))}
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Muhurat Categories"
          title="Traditional event timing stays optional, practical, and consultation-led."
          description="These cards show supported planning categories without inventing any date or outcome."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {muhuratCategoryCards.map((item) => (
              <FoundationCard
                key={item.title}
                item={item}
                tone="default"
                cta={{
                  href: "#muhurat-tool",
                  label: "Open Timing Tool",
                  feature: `muhurat-category-${item.title.toLowerCase().replace(/\s+/g, "-")}`,
                }}
              />
            ))}
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Calendar Categories"
          title="Calendar support stays tied to the live Panchang route."
          description="Use the verified Panchang page for calendar values instead of a fabricated summary surface."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {calendarCategoryCards.map((item) => (
              <FoundationCard
                key={item.title}
                item={item}
                tone="default"
                cta={{
                  href: "/panchang",
                  label: "Open Panchang",
                  feature: `muhurat-calendar-${item.title.toLowerCase().replace(/\s+/g, "-")}`,
                }}
              />
            ))}
          </div>
        </Section>

        <Section
          tone="transparent"
          category="utilities"
          eyebrow="Location / Date"
          title="Enter date and place once to unlock verified timing windows."
          description="The existing timing panel resolves timezone-aware Panchang data and stays empty until valid input is provided."
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)]">
            <Card tone="accent" className="space-y-4 border-[rgba(184,137,67,0.22)]">
              <Badge tone="accent">Verified Muhurat calculation preparing</Badge>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                Use the live timing panel below to check supported windows once a
                valid date and place are entered. No dates, timings, or event
                recommendations are fabricated on load.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Supported input
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                    Date, place, and activity type readiness stay aligned to the
                    verified Panchang layer.
                  </p>
                </div>
                <div className="rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.18)] bg-white p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-accent-strong)]">
                    Safety
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                    Muhurat stays traditional timing guidance only. For major
                    events, consultation remains the safer next step.
                  </p>
                </div>
              </div>
            </Card>

            <Card tone="light" className="space-y-3 border-[rgba(184,137,67,0.2)]">
              <Badge tone="neutral">Panchang connection</Badge>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                Calendar readiness depends on the live Panchang route and the
                existing daily timing engine. When timing data is unavailable,
                the page stays in preparation mode.
              </p>
              <div className="flex flex-col gap-3">
                <TrackedLink
                  href="/panchang"
                  eventName="cta_click"
                  eventPayload={{ page: pagePath, feature: "muhurat-panel-panchang" }}
                  className={buttonStyles({
                    size: "sm",
                    className: "w-full justify-center",
                  })}
                >
                  Open Panchang
                </TrackedLink>
                <TrackedLink
                  href="/consultation"
                  eventName="cta_click"
                  eventPayload={{
                    page: pagePath,
                    feature: "muhurat-panel-consultation",
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
          eyebrow="Live Tool"
          title="Use the existing verified timing engine for supported daily windows."
          description="The tool below stays linked to the real timing engine and does not fabricate a schedule when the inputs are missing."
        >
          <div id="muhurat-tool">
            <MuhurtaLiteToolPanel pagePath={pagePath} />
          </div>
        </Section>

        <Section tone="muted" category="utilities">
          <Card
            tone="accent"
            className="grid gap-5 border-[rgba(184,137,67,0.3)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
          >
            <div className="space-y-2">
              <Badge tone="accent">Continue Journey</Badge>
              <h2
                className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[var(--color-ink-strong)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Continue from timing guidance into chart and AI context.
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Use Muhurat as an optional planning layer, then continue into
                Panchang, Kundli, NAVAGRAHA Intelligence, or consultation when
                a deeper review is needed.
            </p>
          </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {nextActions.map((action) => (
                <TrackedLink
                  key={action.label}
                  href={action.href}
                  eventName="cta_click"
                  eventPayload={{ page: pagePath, feature: action.feature }}
                  className={buttonStyles({
                    size: "lg",
                    tone: action.tone,
                    className: "w-full justify-center",
                  })}
                >
                  {action.label}
                </TrackedLink>
              ))}
            </div>
          </Card>
        </Section>
      </main>
    </>
  );
}
