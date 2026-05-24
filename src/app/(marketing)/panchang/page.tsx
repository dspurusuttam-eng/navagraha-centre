import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { PanchangToolPanel } from "@/modules/panchang/components/panchang-tool-panel";
import { RetentionPreferenceBridge } from "@/modules/retention/components/retention-preference-bridge";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("panchang", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/panchang",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "daily panchang",
      "tithi",
      "nakshatra",
      "yoga",
      "karana",
      "muhurat",
    ],
  });
}

export const revalidate = 3600;

const quickRail = [
  {
    label: "Today",
    href: "/panchang",
    feature: "panchang-rail-today",
    tone: "accent" as const,
  },
  {
    label: "Muhurat",
    href: "/muhurat",
    feature: "panchang-rail-muhurat",
    tone: "secondary" as const,
  },
  {
    label: "Rashifal",
    href: "/rashifal",
    feature: "panchang-rail-rashifal",
    tone: "secondary" as const,
  },
  {
    label: "Kundli",
    href: "/kundli",
    feature: "panchang-rail-kundli",
    tone: "secondary" as const,
  },
  {
    label: "Ask NI",
    href: "/ai",
    feature: "panchang-rail-ask-ni",
    tone: "ni" as const,
  },
] as const;

const conceptCards = [
  {
    title: "Tithi",
    note: "Shown from the real daily calculation panel when date and place are resolved.",
    accent: "gold",
  },
  {
    title: "Nakshatra",
    note: "Used for daily context and timing awareness without showing invented values.",
    accent: "gold",
  },
  {
    title: "Yoga",
    note: "Calculated by the existing Panchang engine and surfaced only when real output is available.",
    accent: "gold",
  },
  {
    title: "Karana",
    note: "Useful for practical day structure once the actual Panchang is generated.",
    accent: "gold",
  },
  {
    title: "Sunrise",
    note: "Location and timezone sensitive; the page should rely only on resolved timing data.",
    accent: "sapphire",
  },
  {
    title: "Sunset",
    note: "Displayed as a real timing reference after place resolution, not as placeholder text.",
    accent: "sapphire",
  },
  {
    title: "Rahu Kaal",
    note: "Shown only when advanced timing windows are returned by the existing flow.",
    accent: "sapphire",
  },
  {
    title: "Abhijit Muhurat",
    note: "A timing window to review carefully when the real advanced timings are available.",
    accent: "sapphire",
  },
] as const;

const timingGuidanceCards = [
  {
    title: "Explore Muhurat",
    href: "/muhurat",
    description: "Move from the daily calendar into focused auspicious timing review.",
    feature: "panchang-timing-muhurat",
    eyebrow: "Timing",
    tone: "sapphire",
  },
  {
    title: "Consultation Support",
    href: "/consultation",
    description: "Use human-reviewed timing guidance when the day involves higher-context decisions.",
    feature: "panchang-timing-consultation",
    eyebrow: "Human Guidance",
    tone: "ruby",
  },
  {
    title: "Reports",
    href: "/reports",
    description: "Continue into structured report guidance when you need a deeper interpretive layer.",
    feature: "panchang-timing-reports",
    eyebrow: "Structured Guidance",
    tone: "gold",
  },
] as const;

const dailyGuidanceCards = [
  {
    title: "Rashifal",
    href: "/rashifal",
    description: "Read sign-level daily guidance after checking the timing layer.",
    feature: "panchang-daily-rashifal",
  },
  {
    title: "Transit",
    href: "/transit",
    description: "Add wider movement context when the day needs more than calendar timing.",
    feature: "panchang-daily-transit",
  },
  {
    title: "Dasha",
    href: "/dasha",
    description: "Connect today with the longer timing cycle already active in your life.",
    feature: "panchang-daily-dasha",
  },
  {
    title: "Remedies",
    href: "/remedies",
    description: "Review calm, optional support pathways without guaranteed claims.",
    feature: "panchang-daily-remedies",
  },
] as const;

function localizePanchangHref(
  locale: string,
  hasExplicitLocalePrefix: boolean,
  href: string
) {
  if (href.startsWith("#")) {
    return href;
  }

  return getLocalizedPath(locale, href, {
    forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
  });
}

function PanchangQuickRail({
  locale,
  hasExplicitLocalePrefix,
}: Readonly<{
  locale: string;
  hasExplicitLocalePrefix: boolean;
}>) {
  return (
    <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max min-w-full gap-2 pr-4">
        {quickRail.map((item) => (
          <TrackedLink
            key={item.label}
            href={localizePanchangHref(locale, hasExplicitLocalePrefix, item.href)}
            eventName="cta_click"
            eventPayload={{ page: "/panchang", feature: item.feature }}
            className={buttonStyles({
              tone: item.tone,
              size: "sm",
              className:
                "min-h-9 shrink-0 rounded-full px-4 text-[0.68rem] uppercase tracking-[0.08em]",
            })}
          >
            {item.label}
          </TrackedLink>
        ))}
      </div>
    </div>
  );
}

function PanchangConceptCard({
  title,
  note,
  accent,
}: Readonly<{
  title: string;
  note: string;
  accent: "gold" | "sapphire";
}>) {
  return (
    <Card
      tone="light"
      className={cn(
        "relative min-h-[8rem] border bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.045)] before:opacity-0",
        accent === "sapphire"
          ? "border-[rgba(212,181,76,0.18)]"
          : "border-[rgba(184,137,67,0.18)]"
      )}
    >
      <div
        className={cn(
          "absolute inset-x-4 top-0 h-px",
          accent === "sapphire"
            ? "bg-[linear-gradient(90deg,rgba(244,212,101,0),rgba(244,212,101,0.95),rgba(244,212,101,0))]"
            : "bg-[linear-gradient(90deg,rgba(184,137,67,0),rgba(184,137,67,0.75),rgba(184,137,67,0))]"
        )}
      />
      <div className="space-y-2">
        <p className="text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-ink-strong)]">
          {title}
        </p>
        <p className="text-[0.76rem] leading-[1.45] text-[color:var(--color-ink-body)]">
          {note}
        </p>
      </div>
    </Card>
  );
}

function PanchangPathCard({
  locale,
  hasExplicitLocalePrefix,
  title,
  href,
  description,
  feature,
  eyebrow,
  tone = "gold",
}: Readonly<{
  locale: string;
  hasExplicitLocalePrefix: boolean;
  title: string;
  href: string;
  description: string;
  feature: string;
  eyebrow: string;
  tone?: "gold" | "sapphire" | "ruby";
}>) {
  const localizedHref = localizePanchangHref(
    locale,
    hasExplicitLocalePrefix,
    href
  );

  const accentClass =
    tone === "ruby"
      ? "border-[rgba(128,39,53,0.18)]"
      : tone === "sapphire"
        ? "border-[rgba(214,183,80,0.22)]"
        : "border-[rgba(184,137,67,0.18)]";

  const buttonTone =
    tone === "ruby" ? "secondary" : tone === "sapphire" ? "accent" : "secondary";

  return (
    <TrackedLink
      href={localizedHref}
      eventName="cta_click"
      eventPayload={{ page: "/panchang", feature }}
      className="block h-full"
    >
      <Card
        tone="light"
        interactive
        className={cn(
          "flex h-full min-h-[10rem] flex-col justify-between gap-4 bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.045)] before:opacity-0",
          accentClass
        )}
      >
        <div className="space-y-2">
          <Badge tone="outline" className="border border-black/8 bg-white">
            {eyebrow}
          </Badge>
          <h3 className="text-[1rem] font-semibold leading-tight text-[color:var(--color-ink-strong)]">
            {title}
          </h3>
          <p className="text-[0.78rem] leading-[1.5] text-[color:var(--color-ink-body)]">
            {description}
          </p>
        </div>
        <span
          className={buttonStyles({
            tone: buttonTone,
            size: "sm",
            className: "w-full justify-center uppercase tracking-[0.06em]",
          })}
        >
          Open
        </span>
      </Card>
    </TrackedLink>
  );
}

export default async function PanchangPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  return (
    <>
      <PageViewTracker page="/panchang" feature="panchang-page" />
      <AnalyticsEventTracker
        event="panchang_view"
        payload={{ page: "/panchang", feature: "panchang-page" }}
      />
      <RetentionPreferenceBridge section="panchang" />

      <main className="launch-page launch-page-panchang min-h-screen bg-white pb-[calc(7.2rem+env(safe-area-inset-bottom))] text-[color:var(--color-ink-strong)] xl:pb-0">
        <section className="relative overflow-hidden border-b border-[rgba(184,137,67,0.14)] bg-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(231,208,154,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(244,212,101,0.08),transparent_24%)]" />
          <Container className="relative grid gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:items-start lg:py-12">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Daily Vedic Calendar
                </Badge>
                <Badge
                  tone="outline"
                  className="border border-[rgba(214,183,80,0.26)] bg-white text-[color:var(--color-ink-strong)]"
                >
                  Timing-first
                </Badge>
              </div>

              <div className="space-y-3">
                <h1
                  className="max-w-[9.5ch] font-[family-name:var(--font-display)] text-[clamp(2.95rem,12vw,4.9rem)] text-[color:var(--color-ink-strong)] md:max-w-[11ch] md:text-[clamp(4.25rem,8vw,6.75rem)]"
                  style={{
                    letterSpacing: "0.01em",
                    lineHeight: "var(--line-height-tight)",
                  }}
                >
                  Panchang — Daily Vedic Calendar
                </h1>
                <p className="max-w-[48rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-lg)]">
                  View daily Tithi, Nakshatra, Yoga, Karana, timing guidance,
                  Muhurat links, and Ask NI support.
                </p>
              </div>

              <PanchangQuickRail
                locale={locale}
                hasExplicitLocalePrefix={hasExplicitLocalePrefix}
              />
            </div>

            <Card
              tone="light"
              className="relative overflow-hidden border-[rgba(184,137,67,0.18)] bg-white p-5 shadow-[0_18px_42px_rgba(17,24,39,0.05)] before:opacity-0"
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(246,238,220,0.32)_100%)]" />
              <div className="pointer-events-none absolute right-5 top-5 h-16 w-16 rounded-full border border-[rgba(214,183,80,0.24)]" />
              <div className="pointer-events-none absolute left-5 top-8 h-px w-24 bg-[linear-gradient(90deg,rgba(184,137,67,0),rgba(184,137,67,0.75),rgba(184,137,67,0))]" />
              <div className="relative space-y-4">
                <div className="space-y-2">
                  <Badge tone="outline" className="border border-black/8 bg-white">
                    Panchang Today
                  </Badge>
                  <h2 className="text-[length:var(--font-size-title-sm)] font-semibold text-[color:var(--color-ink-strong)]">
                    Start with the real daily calculation panel.
                  </h2>
                  <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    Date, place, and timezone drive the real daily Panchang.
                    Concepts stay informational until actual output is generated.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {conceptCards.slice(0, 6).map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[1rem] border border-black/8 bg-white px-3 py-2.5 shadow-[0_8px_20px_rgba(17,24,39,0.04)]"
                    >
                      <p className="text-[0.76rem] font-semibold text-[color:var(--color-ink-strong)]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[0.68rem] leading-[1.4] text-[color:var(--color-ink-body)]">
                        Real panel context
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Container>
        </section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Daily Calculation"
          title="Run today’s Panchang near the top."
          description="The existing calculation-backed flow remains intact here. No placeholder values are shown before the real date and place are resolved."
        >
          <div id="panchang-tool" className="space-y-4">
            <PanchangToolPanel />
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Daily Concepts"
          title="Know what each Panchang factor helps you read."
          description="These cards explain the structure of the day. Real values appear only inside the calculation-backed panel."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {conceptCards.map((item) => (
              <PanchangConceptCard
                key={item.title}
                title={item.title}
                note={item.note}
                accent={item.accent}
              />
            ))}
          </div>
        </Section>

        <Section className="pt-0" tone="transparent">
          <Card
            tone="contrast"
            className="overflow-hidden border-[rgba(38,85,180,0.2)] bg-[linear-gradient(145deg,#070d1b_0%,#0f1830_58%,#131a24_100%)] p-6 text-white before:opacity-0"
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="space-y-3">
                <Badge tone="accent">Ask NI</Badge>
                <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-white">
                  Ask NI for daily Panchang context and timing interpretation.
                </h2>
                <p className="max-w-[44rem] text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-white/82">
                  Ask NI is powered by NAVAGRAHA Intelligence and helps users
                  understand daily Panchang context, timing, Muhurat, Rahu Kaal,
                  Dasha and Transit links, and practical Vedic guidance.
                </p>
              </div>
              <TrackedLink
                href={localizePanchangHref(locale, hasExplicitLocalePrefix, "/ai")}
                eventName="cta_click"
                eventPayload={{ page: "/panchang", feature: "panchang-ask-ni-bridge" }}
                className={buttonStyles({
                  tone: "ni",
                  size: "lg",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Ask NI
              </TrackedLink>
            </div>
          </Card>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Muhurat + Timing"
          title="Continue into timing guidance without adding fake date promises."
          description="Use Muhurat for timing depth, consultation for higher-context timing decisions, and reports for structured follow-up."
        >
          <div className="grid gap-3 lg:grid-cols-3">
            {timingGuidanceCards.map((item) => (
              <PanchangPathCard
                key={item.title}
                locale={locale}
                hasExplicitLocalePrefix={hasExplicitLocalePrefix}
                title={item.title}
                href={item.href}
                description={item.description}
                feature={item.feature}
                eyebrow={item.eyebrow}
                tone={item.tone}
              />
            ))}
          </div>
        </Section>

        <Section
          tone="light"
          category="utilities"
          eyebrow="Daily Guidance"
          title="Use Panchang as the daily timing layer, then open the right next tool."
          description="Rashifal, Transit, Dasha, and Remedies should remain one tap away after the daily calendar context is clear."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {dailyGuidanceCards.map((item) => (
              <PanchangPathCard
                key={item.title}
                locale={locale}
                hasExplicitLocalePrefix={hasExplicitLocalePrefix}
                title={item.title}
                href={item.href}
                description={item.description}
                feature={item.feature}
                eyebrow="Next Layer"
              />
            ))}
          </div>
        </Section>

        <Section className="pt-0" tone="transparent">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
            <Card
              tone="light"
              className="border-[rgba(128,39,53,0.18)] bg-white p-5 shadow-[0_12px_28px_rgba(17,24,39,0.045)] before:opacity-0"
            >
              <div className="space-y-3">
                <Badge
                  tone="outline"
                  className="border border-[rgba(128,39,53,0.16)] bg-white text-[color:var(--color-ink-strong)]"
                >
                  J P Sarmah
                </Badge>
                <h2 className="text-[length:var(--font-size-title-sm)] font-semibold text-[color:var(--color-ink-strong)]">
                  Human authority stays separate from Ask NI.
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  J P Sarmah remains the human authority. Ask NI is assistance,
                  not replacement. Consultation supports deeper timing guidance
                  when daily context alone is not enough.
                </p>
              </div>
            </Card>

            <Card
              tone="light"
              className="border-[rgba(184,137,67,0.18)] bg-white p-5 shadow-[0_12px_28px_rgba(17,24,39,0.045)] before:opacity-0"
            >
              <div className="space-y-3">
                <Badge tone="trust" className="border border-black/8 bg-white">
                  Date + Location Trust
                </Badge>
                <h2 className="text-[length:var(--font-size-title-sm)] font-semibold text-[color:var(--color-ink-strong)]">
                  Panchang depends on date, location, and timing context.
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Guidance should be used responsibly. No guaranteed outcome
                  claims should be attached to daily timing windows.
                </p>
              </div>
            </Card>
          </div>
        </Section>
      </main>
    </>
  );
}
