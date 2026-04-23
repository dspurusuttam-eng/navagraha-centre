import { TrackedLink } from "@/components/analytics/tracked-link";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { rashifalSigns } from "@/modules/rashifal/content";
import { RevenuePathwaysCard } from "@/modules/subscriptions/components/revenue-readiness-panels";

export const metadata = buildPageMetadata({
  title: "Today's Rashifal - Daily Horoscope for All Zodiac Signs",
  description:
    "Read today's Rashifal for all 12 zodiac signs, then continue with personalized Kundli and NAVAGRAHA AI guidance.",
  path: "/rashifal",
  keywords: [
    "daily rashifal",
    "today horoscope all zodiac signs",
    "vedic rashifal",
    "zodiac daily prediction",
  ],
});
export const revalidate = 3600;

export default function RashifalPage() {
  return (
    <>
      <PageViewTracker page="/rashifal" feature="rashifal-page" />
      <AnalyticsEventTracker
        event="rashifal_page_view"
        payload={{ page: "/rashifal", feature: "rashifal-main" }}
      />

      <section className="relative overflow-hidden border-b border-[color:var(--color-border)] bg-[linear-gradient(180deg,#fffefb_0%,#fcf4e7_54%,#f8ecd8_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_14%,rgba(210,166,90,0.2),transparent_34%),radial-gradient(circle_at_86%_16%,rgba(208,164,112,0.16),transparent_34%),radial-gradient(circle_at_70%_88%,rgba(188,145,87,0.12),transparent_38%)]" />
        <Container className="relative grid gap-8 py-12 sm:py-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:items-center">
          <div className="space-y-6">
            <Badge tone="trust">Daily Rashifal</Badge>
            <div className="space-y-4">
              <h1
                className="font-[family-name:var(--font-display)] text-[length:var(--font-size-display-md)] text-[var(--color-ink-strong)] sm:text-[length:var(--font-size-display-lg)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Today&apos;s Rashifal - Daily Horoscope for All Zodiac Signs
              </h1>
              <p className="max-w-[44rem] text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                Start with public daily Rashifal for all signs, then continue with personalized Kundli-based guidance for deeper clarity.
              </p>
            </div>
            <TrackedLink
              href="/kundli"
              eventName="cta_click"
              eventPayload={{ page: "/rashifal", feature: "rashifal-hero-kundli" }}
              className={buttonStyles({
                size: "lg",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Generate Your Kundli
            </TrackedLink>
          </div>

          <Card className="space-y-4 border-[rgba(184,137,67,0.28)] bg-[linear-gradient(165deg,rgba(255,255,255,0.96)_0%,rgba(248,236,216,0.9)_100%)]">
            <Badge tone="trust">Today Highlights</Badge>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                "Career timing gains clarity through discipline.",
                "Relationships benefit from steady communication.",
                "Avoid rushed commitments in business matters.",
                "Use AI follow-up for personal chart context.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.84)] px-3 py-2 text-[0.7rem] uppercase tracking-[0.13em] text-[var(--color-ink-body)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </Container>
      </section>

      <Section
        tone="light"
        eyebrow="12 Zodiac Signs"
        title="Choose your sign and read today&apos;s forecast."
        description="Each sign includes a compact daily prediction and a full detail page."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rashifalSigns.map((sign) => (
            <Card
              key={sign.slug}
              tone="light"
              interactive
              className="flex h-full flex-col gap-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-trust-border)] bg-[var(--color-trust-bg)] text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-trust-text)]">
                  {sign.icon}
                </span>
                <Badge tone="neutral">Sign</Badge>
              </div>
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {sign.name}
              </h2>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {sign.shortPrediction}
              </p>
              <TrackedLink
                href={`/rashifal/${sign.slug}`}
                eventName="cta_click"
                eventPayload={{
                  page: "/rashifal",
                  feature: `rashifal-read-full-${sign.slug}`,
                }}
                className={buttonStyles({
                  size: "sm",
                  tone: "tertiary",
                  className: "w-full justify-center",
                })}
              >
                Read Full
              </TrackedLink>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        eyebrow="Full Rashifal"
        title="Complete daily Rashifal details for all zodiac signs."
        description="Love, career, business, and lucky indicators are provided for each sign."
      >
        <Card className="mb-6 border-[rgba(184,137,67,0.2)] bg-[rgba(255,255,255,0.9)]">
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            Every sign below follows the same structured daily format: five
            descriptive lines, dedicated love/career/business guidance, and
            lucky indicators for quick readability.
          </p>
        </Card>
        <div className="grid gap-4 lg:grid-cols-2">
          {rashifalSigns.map((sign) => (
            <Card
              key={`full-${sign.slug}`}
              tone="light"
              className="space-y-4 border-[rgba(184,137,67,0.24)]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                  {sign.name} Rashifal
                </h2>
                <TrackedLink
                  href={`/rashifal/${sign.slug}`}
                  eventName="cta_click"
                  eventPayload={{
                    page: "/rashifal",
                    feature: `rashifal-sign-page-${sign.slug}`,
                  }}
                  className={buttonStyles({ tone: "ghost", size: "sm" })}
                >
                  Open Sign Page
                </TrackedLink>
              </div>

              <ul className="space-y-2">
                {sign.fullDescription.map((line) => (
                  <li
                    key={line}
                    className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]"
                  >
                    - {line}
                  </li>
                ))}
              </ul>

              <div className="grid gap-2 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)] sm:grid-cols-2">
                <p>
                  <span className="font-medium text-[var(--color-ink-strong)]">
                    Love:
                  </span>{" "}
                  {sign.love}
                </p>
                <p>
                  <span className="font-medium text-[var(--color-ink-strong)]">
                    Career:
                  </span>{" "}
                  {sign.career}
                </p>
                <p>
                  <span className="font-medium text-[var(--color-ink-strong)]">
                    Business:
                  </span>{" "}
                  {sign.business}
                </p>
                <p>
                  <span className="font-medium text-[var(--color-ink-strong)]">
                    Lucky Color:
                  </span>{" "}
                  {sign.luckyColor}
                </p>
                <p>
                  <span className="font-medium text-[var(--color-ink-strong)]">
                    Lucky Number:
                  </span>{" "}
                  {sign.luckyNumber}
                </p>
                <p>
                  <span className="font-medium text-[var(--color-ink-strong)]">
                    Lucky Time:
                  </span>{" "}
                  {sign.luckyTime}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0" tone="transparent">
        <Card
          tone="accent"
          className="border-[rgba(184,137,67,0.34)] bg-[linear-gradient(160deg,rgba(255,252,246,0.98)_0%,rgba(246,232,206,0.94)_58%,rgba(239,222,193,0.96)_100%)] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6"
        >
          <div className="space-y-3">
            <Badge tone="accent">Personalized Rashifal</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[var(--color-ink-strong)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Get personalized Rashifal using your Kundli
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Use your verified birth chart to move from general sign-level guidance to personal timing and chart-aware interpretation.
            </p>
          </div>
          <TrackedLink
            href="/kundli"
            eventName="cta_click"
            eventPayload={{
              page: "/rashifal",
              feature: "rashifal-personalization-kundli",
            }}
            className={buttonStyles({
              size: "lg",
              className: "w-full justify-center sm:w-auto",
            })}
          >
            Generate Kundli
          </TrackedLink>
        </Card>
      </Section>

      <Section className="pt-0" tone="transparent">
        <Card
          tone="light"
          className="border-[rgba(184,137,67,0.24)] bg-[rgba(255,255,255,0.92)] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6"
        >
          <div className="space-y-3">
            <Badge tone="trust">NAVAGRAHA AI</Badge>
            <h2 className="text-[length:var(--font-size-title-md)] font-medium text-[var(--color-ink-strong)]">
              Ask NAVAGRAHA AI about your day
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Continue with chart-aware AI guidance for deeper daily interpretation and practical next-step clarity.
            </p>
          </div>
          <TrackedLink
            href="/ai"
            eventName="cta_click"
            eventPayload={{ page: "/rashifal", feature: "rashifal-ai-free" }}
            className={buttonStyles({
              size: "lg",
              tone: "secondary",
              className: "w-full justify-center sm:w-auto",
            })}
          >
            Try AI Free
          </TrackedLink>
        </Card>
      </Section>

      <Section className="pt-0" tone="transparent">
        <RevenuePathwaysCard
          pagePath="/rashifal"
          title="Continue from daily Rashifal into deeper guidance"
          description="Use daily sign insight for free, then continue into reports, consultation, or optional shop support when you need more depth."
        />
      </Section>
    </>
  );
}
