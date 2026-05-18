import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { AdSlot } from "@/components/monetization/AdSlot";
import { ConsultationCTA } from "@/components/monetization/ConsultationCTA";
import { ReportCTA } from "@/components/monetization/ReportCTA";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { createToolMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/cn";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import { getRequestLocale, hasExplicitLocalePrefixInRequest } from "@/modules/localization/request";
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

const panchangFaqEntries = [
  {
    question: "How is this Panchang calculated?",
    answer:
      "The tool resolves place and timezone first, then calculates Tithi, Vara, Nakshatra, Yoga, and Karana using deterministic sidereal/Lahiri-aligned astrology calculations.",
  },
  {
    question: "Why do transition timings matter?",
    answer:
      "Transition timings show when core Panchang factors change during the day, helping you plan important work windows with better timing awareness.",
  },
  {
    question: "Should I check Panchang or Rashifal first?",
    answer:
      "Use Panchang for daily timing context first, then open Rashifal for sign-level guidance or Ask NI for AI-guided Vedic assistance.",
  },
  {
    question: "Can I use this without creating an account?",
    answer:
      "Yes. Panchang is public for daily use. You can generate your Kundli later if you want deeper personalized guidance.",
  },
] as const;

const panchangFaqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: panchangFaqEntries.map((entry) => ({
    "@type": "Question",
    name: entry.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: entry.answer,
    },
  })),
} as const;

const panchangUtilities = [
  {
    title: "Today's Panchang",
    href: "#panchang-tool",
    icon: "DP",
    statusLabel: "Live",
    ctaLabel: "View today",
    feature: "panchang-utility-daily",
    description: "Open the daily calculation panel for date and place.",
  },
  {
    title: "Muhurat",
    href: "/muhurat",
    icon: "MU",
    statusLabel: "Route-safe",
    ctaLabel: "Open Muhurat",
    feature: "panchang-utility-muhurat",
    description: "Continue from daily timing into muhurat planning.",
  },
  {
    title: "Rashifal",
    href: "/rashifal",
    icon: "RA",
    statusLabel: "Route-safe",
    ctaLabel: "Read Rashifal",
    feature: "panchang-utility-rashifal",
    description: "Read sign-level guidance after checking day timing.",
  },
  {
    title: "Transit",
    href: "/transit",
    icon: "TR",
    statusLabel: "Route-safe",
    ctaLabel: "Open Transit",
    feature: "panchang-utility-transit",
    description: "Review broader movement context with the transit tool.",
  },
  {
    title: "Dasha",
    href: "/dasha",
    icon: "DA",
    statusLabel: "Route-safe",
    ctaLabel: "Open Dasha",
    feature: "panchang-utility-dasha",
    description: "Connect daily timing with long-period timing context.",
  },
  {
    title: "Ask NI",
    href: "/ai",
    icon: "NI",
    statusLabel: "Route-safe",
    ctaLabel: "Ask NI",
    feature: "panchang-utility-ni",
    description: "Use NAVAGRAHA Intelligence for AI-guided Vedic assistance.",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: "RP",
    statusLabel: "Route-safe",
    ctaLabel: "View Reports",
    feature: "panchang-utility-reports",
    description: "Move into structured reports when deeper review is needed.",
  },
  {
    title: "Consultation",
    href: "/consultation",
    icon: "CS",
    statusLabel: "Route-safe",
    ctaLabel: "Consult",
    feature: "panchang-utility-consultation",
    description: "Use human guidance for decisions that need context.",
  },
] as const;

const panchangGuidanceLinks = [
  {
    title: "Read Rashifal",
    href: "/rashifal",
    icon: "DR",
    subtitle: "Daily sign guidance",
    feature: "panchang-guidance-rashifal",
  },
  {
    title: "Explore Muhurat",
    href: "/muhurat",
    icon: "MU",
    subtitle: "Auspicious timing",
    feature: "panchang-guidance-muhurat",
  },
  {
    title: "Ask NI",
    href: "/ai",
    icon: "NI",
    subtitle: "NAVAGRAHA Intelligence",
    feature: "panchang-guidance-ai",
  },
  {
    title: "View Reports",
    href: "/reports",
    icon: "RP",
    subtitle: "Detailed reports",
    feature: "panchang-guidance-reports",
  },
  {
    title: "Consultation",
    href: "/consultation",
    icon: "CS",
    subtitle: "Human-led guidance",
    feature: "panchang-guidance-consultation",
  },
  {
    title: "Tools Hub",
    href: "/tools",
    icon: "TH",
    subtitle: "All astrology tools",
    feature: "panchang-guidance-tools",
  },
] as const;

const panchangIntroCtas = [
  {
    href: "#panchang-tool",
    label: "View Today's Panchang",
    feature: "panchang-intro-view-daily",
    eventName: "cta_click" as const,
  },
  {
    href: "/ai",
    label: "Ask NI",
    feature: "panchang-intro-ask-ai",
    eventName: "cta_click" as const,
  },
  {
    href: "/muhurat",
    label: "Explore Muhurat",
    feature: "panchang-intro-muhurat",
    eventName: "cta_click" as const,
  },
  {
    href: "/rashifal",
    label: "Read Rashifal",
    feature: "panchang-intro-rashifal",
    eventName: "cta_click" as const,
  },
] as const;

const panchangSummaryItems = [
  {
    title: "Tithi",
    description: "Calculated in the daily Panchang panel.",
  },
  {
    title: "Nakshatra",
    description: "Shown after date and place are resolved.",
  },
  {
    title: "Yoga",
    description: "Generated from the existing Panchang engine.",
  },
  {
    title: "Karana",
    description: "Displayed from calculated Panchang output.",
  },
  {
    title: "Sunrise",
    description: "Resolved by location and timezone in the tool.",
  },
  {
    title: "Sunset",
    description: "Resolved by location and timezone in the tool.",
  },
  {
    title: "Rahu Kaal",
    description: "Available when advanced timings return.",
  },
  {
    title: "Abhijit Muhurat",
    description: "Available when advanced timings return.",
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

function PanchangIntroActions({
  locale,
  hasExplicitLocalePrefix,
}: Readonly<{
  locale: string;
  hasExplicitLocalePrefix: boolean;
}>) {
  return (
    <Section className="pt-0" tone="transparent">
      <Card
        tone="light"
        className="grid gap-2 border-[rgba(184,137,67,0.18)] bg-white p-3 shadow-[0_10px_22px_rgba(17,24,39,0.045)] sm:grid-cols-2 lg:grid-cols-4"
      >
        {panchangIntroCtas.map((item) => {
          const href = localizePanchangHref(
            locale,
            hasExplicitLocalePrefix,
            item.href
          );

          return (
            <TrackedLink
              key={item.label}
              href={href}
              eventName={item.eventName}
              eventPayload={{ page: "/panchang", feature: item.feature }}
              className={buttonStyles({
                size: "sm",
                tone: item.label === "Ask NI" ? "tertiary" : "secondary",
                className:
                  "min-h-10 w-full justify-center px-3 text-[0.69rem] uppercase tracking-[0.06em]",
              })}
            >
              {item.label}
            </TrackedLink>
          );
        })}
      </Card>
    </Section>
  );
}

function PanchangGuidanceCard({
  locale,
  hasExplicitLocalePrefix,
  title,
  href,
  icon,
  subtitle,
  feature,
}: Readonly<{
  locale: string;
  hasExplicitLocalePrefix: boolean;
  title: string;
  href: string;
  icon: string;
  subtitle: string;
  feature: string;
}>) {
  const localizedHref = localizePanchangHref(
    locale,
    hasExplicitLocalePrefix,
    href
  );
  const isAiCard = feature.includes("ai") || feature.includes("ni");

  return (
    <TrackedLink
      href={localizedHref}
      eventName="cta_click"
      eventPayload={{ page: "/panchang", feature }}
      className="block h-full"
    >
      <Card
        tone="default"
        interactive
        className="flex h-full min-h-[7.5rem] flex-col justify-between gap-2.5 border-[rgba(184,137,67,0.2)] bg-white p-3 shadow-[0_10px_22px_rgba(17,24,39,0.045)] before:opacity-0 hover:border-[rgba(184,137,67,0.3)]"
      >
        <div className="flex flex-col gap-2">
          <span className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[0.67rem] font-semibold uppercase tracking-[0.08em] shadow-[0_10px_18px_rgba(121,85,33,0.12)]",
            isAiCard
              ? "border-[rgba(73,112,210,0.3)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.98)_0%,rgba(221,231,255,0.92)_72%,rgba(181,198,255,0.88)_100%)] text-[color:var(--color-accent-strong)]"
              : "border-[rgba(184,137,67,0.3)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.98)_0%,rgba(247,234,204,0.92)_72%,rgba(238,214,166,0.88)_100%)] text-[color:var(--color-accent-strong)]"
          )}>
            {icon}
          </span>
          <div className="min-w-0 space-y-1">
            <h3 className="text-[0.88rem] font-semibold leading-tight text-[color:var(--color-ink-strong)]">
              {title}
            </h3>
            <p className={cn(
              "text-[0.68rem] leading-[1.35] text-[color:var(--color-ink-body)]",
              isAiCard && "text-[color:var(--color-ink-body)]"
            )}>
              {subtitle}
            </p>
          </div>
        </div>

        <span
          className={buttonStyles({
            size: "sm",
            tone: isAiCard ? "tertiary" : "secondary",
            className: "w-full justify-center min-h-9 px-3 text-[0.67rem] uppercase tracking-[0.06em]",
          })}
        >
          Open
        </span>
      </Card>
    </TrackedLink>
  );
}

function PanchangUtilityCard({
  locale,
  hasExplicitLocalePrefix,
  title,
  href,
  icon,
  statusLabel,
  ctaLabel,
  description,
  feature,
}: Readonly<{
  locale: string;
  hasExplicitLocalePrefix: boolean;
  title: string;
  href?: string;
  icon: string;
  statusLabel: string;
  ctaLabel: string;
  description: string;
  feature: string;
}>) {
  const isComingSoon = statusLabel === "Coming Soon";
  const isAiTool = feature.includes("ai") || feature.includes("ni");
  const linkHref = href ?? "#";
  const localizedHref =
    !isComingSoon
      ? localizePanchangHref(locale, hasExplicitLocalePrefix, linkHref)
      : linkHref;

  const badgeTone =
    statusLabel === "Coming Soon"
      ? "neutral"
      : isAiTool
        ? "accent"
        : "trust";

  const card = (
    <Card
      tone="default"
      interactive={!isComingSoon}
      className="flex h-full min-h-[7.75rem] flex-col justify-between gap-2.5 border-[rgba(184,137,67,0.2)] bg-white p-3 shadow-[0_10px_22px_rgba(17,24,39,0.045)] before:opacity-0 hover:border-[rgba(184,137,67,0.3)]"
    >
      <div className="flex flex-col gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(184,137,67,0.3)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.98)_0%,rgba(247,234,204,0.92)_72%,rgba(238,214,166,0.88)_100%)] text-[0.67rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)] shadow-[0_10px_18px_rgba(121,85,33,0.12)]">
          {icon}
        </span>
        <div className="min-w-0 space-y-1">
          <h3 className="text-[0.88rem] font-semibold leading-tight text-[color:var(--color-ink-strong)]">
            {title}
          </h3>
          <p className="text-[0.68rem] leading-[1.35] text-[color:var(--color-ink-body)]">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Badge
          tone={badgeTone}
          className="w-fit border border-[rgba(184,137,67,0.18)] bg-white text-[0.6rem] uppercase tracking-[0.06em] text-[color:var(--color-accent-strong)]"
        >
          {statusLabel}
        </Badge>

        <span
          className={buttonStyles({
            size: "sm",
            tone: isComingSoon ? "secondary" : isAiTool ? "tertiary" : "accent",
            className:
              "w-full justify-center min-h-9 px-3 text-[0.67rem] uppercase tracking-[0.06em]",
          })}
        >
          {ctaLabel}
        </span>
      </div>
    </Card>
  );

  if (isComingSoon) {
    return <div className="block h-full">{card}</div>;
  }

  return (
    <TrackedLink
      href={localizedHref}
      eventName="cta_click"
      eventPayload={{ page: "/panchang", feature }}
      className="block h-full"
    >
      {card}
    </TrackedLink>
  );
}

function PanchangFirstScreen({
  locale,
  hasExplicitLocalePrefix,
}: Readonly<{
  locale: string;
  hasExplicitLocalePrefix: boolean;
}>) {
  const primaryHref = localizePanchangHref(
    locale,
    hasExplicitLocalePrefix,
    "#panchang-tool"
  );
  const askNiHref = localizePanchangHref(locale, hasExplicitLocalePrefix, "/ai");
  const muhuratHref = localizePanchangHref(
    locale,
    hasExplicitLocalePrefix,
    "/muhurat"
  );
  const rashifalHref = localizePanchangHref(
    locale,
    hasExplicitLocalePrefix,
    "/rashifal"
  );

  return (
    <section className="border-b border-[rgba(155,122,74,0.16)] bg-[linear-gradient(180deg,#fffefb_0%,#ffffff_100%)]">
      <Container className="grid gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(0,1.04fr)_minmax(300px,0.96fr)] lg:items-center lg:py-12">
        <div className="space-y-4 sm:space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge tone="trust" className="border border-black/8 bg-white">
              Daily Timing
            </Badge>
            <Badge
              tone="outline"
              className="border border-black/8 bg-white text-[color:var(--color-ink-strong)]"
            >
              Panchang Calculation
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
              Panchang
            </h1>
            <p className="max-w-[48rem] text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-lg)]">
              Daily tithi, nakshatra, yoga, karana, sunrise/sunset, auspicious timing, and Vedic day guidance from the existing Panchang calculation flow.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
            <TrackedLink
              href={primaryHref}
              eventName="cta_click"
              eventPayload={{ page: "/panchang", feature: "panchang-hero-view-today" }}
              className={buttonStyles({
                tone: "accent",
                size: "lg",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              View Today&apos;s Panchang
            </TrackedLink>
            <TrackedLink
              href={askNiHref}
              eventName="cta_click"
              eventPayload={{ page: "/panchang", feature: "panchang-hero-ask-ni" }}
              className={buttonStyles({
                tone: "secondary",
                size: "lg",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Ask NI
            </TrackedLink>
            <TrackedLink
              href={muhuratHref}
              eventName="cta_click"
              eventPayload={{ page: "/panchang", feature: "panchang-hero-muhurat" }}
              className={buttonStyles({
                tone: "secondary",
                size: "lg",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Explore Muhurat
            </TrackedLink>
            <TrackedLink
              href={rashifalHref}
              eventName="cta_click"
              eventPayload={{ page: "/panchang", feature: "panchang-hero-rashifal" }}
              className={buttonStyles({
                tone: "secondary",
                size: "lg",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Read Rashifal
            </TrackedLink>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              "Tithi",
              "Nakshatra",
              "Yoga",
              "Karana",
              "Sunrise / Sunset",
              "Rahu Kaal",
              "Abhijit Muhurat",
              "Ask NI follow-up",
            ].map((badge) => (
              <Badge
                key={badge}
                tone="trust"
                className="border border-black/8 bg-white px-2 py-1 text-[0.56rem] uppercase tracking-[0.05em] text-[color:var(--color-ink-strong)] sm:px-3 sm:py-1.5 sm:text-[0.64rem] sm:tracking-[0.1em]"
              >
                {badge}
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
              Calculation panel
            </Badge>
          </div>

          <div className="space-y-2">
            <h2 className="text-[length:var(--font-size-title-sm)] font-semibold text-[color:var(--color-ink-strong)]">
              Calculate the day first, then choose the next action.
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
              Enter date and place in the panel below to view calculated values for the selected day.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {panchangSummaryItems.slice(0, 6).map((item) => (
              <div
                key={item.title}
                className="rounded-[1.1rem] border border-black/8 bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(17,24,39,0.04)]"
              >
                <p className="text-[0.74rem] font-semibold text-[color:var(--color-ink-strong)]">
                  {item.title}
                </p>
                <p className="mt-1 text-[0.68rem] leading-[1.35] text-[color:var(--color-ink-body)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </Container>
    </section>
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(panchangFaqStructuredData),
        }}
      />

      <main className="min-h-screen bg-[linear-gradient(180deg,#fffefb_0%,#ffffff_28%,#fbf6ed_100%)] pb-[calc(7.2rem+env(safe-area-inset-bottom))] text-[color:var(--color-ink-strong)] xl:pb-0">
      <PanchangFirstScreen
        locale={locale}
        hasExplicitLocalePrefix={hasExplicitLocalePrefix}
      />

      <PanchangIntroActions
        locale={locale}
        hasExplicitLocalePrefix={hasExplicitLocalePrefix}
      />

      <Section
        tone="light"
        category="utilities"
        eyebrow="Panchang Shortcuts"
        title="Move from daily timing into the right next tool."
        description="Quick access to route-safe Panchang, muhurat, Rashifal, timing, reporting, and consultation surfaces."
      >
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
          {panchangUtilities.map((utility) => (
            <PanchangUtilityCard
              key={utility.title}
              locale={locale}
              hasExplicitLocalePrefix={hasExplicitLocalePrefix}
              title={utility.title}
              href={utility.href}
              icon={utility.icon}
              statusLabel={utility.statusLabel}
              ctaLabel={utility.ctaLabel}
              description={utility.description}
              feature={utility.feature}
            />
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        category="utilities"
        eyebrow="Panchang Summary"
        title="Daily Panchang structure"
        description="These are the core values the calculation panel resolves after date and place are entered."
      >
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {panchangSummaryItems.map((item) => (
            <Card
              key={item.title}
              tone="default"
              className="flex min-h-[7.2rem] flex-col justify-between gap-3 border-[rgba(184,137,67,0.2)] bg-white p-3 shadow-[0_10px_22px_rgba(17,24,39,0.045)] before:opacity-0"
            >
              <div className="space-y-1">
                <p className="text-[0.86rem] font-semibold leading-tight text-[color:var(--color-ink-strong)]">
                  {item.title}
                </p>
                <p className="text-[0.68rem] leading-[1.35] text-[color:var(--color-ink-body)]">
                  {item.description}
                </p>
              </div>
              <Badge
                tone="outline"
                className="w-fit border border-black/8 bg-white text-[0.58rem] uppercase tracking-[0.06em] text-[color:var(--color-accent-strong)]"
              >
                Calculated
              </Badge>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        category="utilities"
        eyebrow="Continue Guidance"
        title="Continue Your Daily Vedic Guidance"
        description="Move into the next route-safe action after checking daily timing."
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {panchangGuidanceLinks.map((item) => (
            <PanchangGuidanceCard
              key={item.title}
              locale={locale}
              hasExplicitLocalePrefix={hasExplicitLocalePrefix}
              title={item.title}
              href={item.href}
              icon={item.icon}
              subtitle={item.subtitle}
              feature={item.feature}
            />
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        category="utilities"
        eyebrow="Panchang Tool"
        title="Generate a complete daily Panchang profile with transitions and guidance."
        description="Enter date and place once to view core values, next transitions, and structured daily guidance in one clean result flow."
      >
        <div id="panchang-tool">
          <PanchangToolPanel />
        </div>
        <div className="mt-6">
          <AdSlot placement="tool_result_bottom" />
        </div>
      </Section>

      <Section
        tone="muted"
        category="utilities"
        eyebrow="How It Works"
        title="Three focused steps behind this Panchang engine."
        description="Lightweight, deterministic, and aligned with current astrology engine conventions."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Validate date + place",
              description:
                "Input normalization runs first, then place resolution derives coordinates and timezone cleanly.",
            },
            {
              title: "Calculate core factors",
              description:
                "Sun and Moon sidereal longitudes drive Tithi, Nakshatra, Yoga, and Karana with deterministic formulas.",
            },
            {
              title: "Return daily structure",
              description:
                "Output includes core Panchang values, next-change transitions, and conservative guidance blocks for daily planning.",
            },
          ].map((item) => (
            <Card key={item.title} tone="light" className="space-y-3">
              <Badge tone="trust">Step</Badge>
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {item.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        category="utilities"
        eyebrow="Daily Use"
        title="Use Panchang as a practical daily timing layer."
        description="Check the core factors, note transition windows, then continue into deeper chart-aware tools when needed."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <Card tone="light" className="space-y-3">
            <Badge tone="trust">Daily Rhythm</Badge>
            <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
              Start with timing clarity
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Check Tithi, Nakshatra, and Yoga first to understand the day&apos;s overall tone before major decisions.
            </p>
          </Card>
          <Card tone="light" className="space-y-3">
            <Badge tone="trust">Transition Awareness</Badge>
            <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
              Watch next-change timings
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Use transition timings as planning checkpoints for meetings, focused work, and important commitments.
            </p>
          </Card>
          <Card tone="light" className="space-y-3">
            <Badge tone="trust">Deeper Layer</Badge>
            <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
              Add personalization when needed
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Continue into Kundli, Ask NI, and consultation when you need chart-level interpretation beyond daily timing.
            </p>
          </Card>
        </div>
      </Section>

      <Section className="pt-0" tone="transparent">
        <div className="grid gap-4 lg:grid-cols-2">
          <AdSlot placement="panchang_after_summary" />
          <ConsultationCTA pagePath="/panchang" placement="panchang_summary" />
        </div>
      </Section>

      <Section
        tone="muted"
        eyebrow="Panchang FAQ"
        title="Common questions about daily Panchang usage."
        description="Concise, practical answers for everyday checking."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {panchangFaqEntries.map((entry) => (
            <Card key={entry.question} tone="light" className="space-y-3">
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {entry.question}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {entry.answer}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        category="utilities"
        eyebrow="Related Tools"
        title="Continue from Panchang into complementary guidance surfaces."
        description="Move into the right next tool without clutter."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            {
              href: "/tools",
              label: "Explore All Tools",
              title: "Tools Hub",
              description:
                "Open the utility hub to move across chart, timing, numerology, and AI layers cleanly.",
              feature: "panchang-related-tools-hub",
              eventName: "utility_card_click" as const,
            },
            {
              href: "/muhurat",
              label: "Open Muhurat",
              title: "Muhurat",
              description:
                "Focused daily timing windows for Rahu Kaal, Gulika Kaal, Yamaganda, and Abhijit Muhurta.",
              feature: "panchang-related-muhurta",
              eventName: "muhurta_tool_click" as const,
            },
            {
              href: "/rashifal",
              label: "Open Daily Rashifal",
              title: "Rashifal",
              description:
                "Sign-level daily guidance to complement timing context from Panchang.",
              feature: "panchang-related-rashifal",
              eventName: "utility_card_click" as const,
            },
            {
              href: "/numerology",
              label: "Open Numerology",
              title: "Numerology",
              description:
                "Explore number-based tendencies alongside your daily Panchang timing layer.",
              feature: "panchang-related-numerology",
              eventName: "numerology_tool_click" as const,
            },
            {
              href: "/reports",
              label: "View Reports",
              title: "Premium Reports",
              description:
                "Move from daily signals into deeper structured interpretation and planning.",
              feature: "panchang-related-reports",
              eventName: "premium_utility_cta_click" as const,
            },
            {
              href: "/consultation",
              label: "Book Consultation",
              title: "Consultation",
              description:
                "Discuss timing and chart context directly with guided human interpretation.",
              feature: "panchang-related-consultation",
              eventName: "premium_utility_cta_click" as const,
            },
          ].map((item) => (
            <Card key={item.title} tone="light" className="flex h-full flex-col gap-3">
              <Badge tone="trust">{item.title}</Badge>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.description}
              </p>
              <TrackedLink
                href={item.href}
                eventName={item.eventName}
                eventPayload={{ page: "/panchang", feature: item.feature }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center",
                })}
              >
                {item.label}
              </TrackedLink>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0" tone="transparent">
        <ReportCTA pagePath="/panchang" placement="panchang_footer" />
      </Section>

      <Section className="pt-0" tone="transparent">
        <Card
          tone="accent"
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-3">
            <Badge tone="accent">Continue Journey</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[var(--color-ink-strong)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Move from daily Panchang into chart and NAVAGRAHA Intelligence guidance.
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Use Panchang for daily timing context, then continue with Kundli and NAVAGRAHA Intelligence for AI-guided interpretation.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <TrackedLink
              href="/kundli"
              eventName="cta_click"
              eventPayload={{
                page: "/panchang",
                feature: "panchang-final-kundli",
              }}
              className={buttonStyles({
                size: "lg",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Generate Your Kundli
            </TrackedLink>
            <TrackedLink
              href="/ai"
              eventName="cta_click"
              eventPayload={{
                page: "/panchang",
                feature: "panchang-final-ai",
              }}
              className={buttonStyles({
                size: "lg",
                tone: "secondary",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Ask NI
            </TrackedLink>
          </div>
        </Card>
      </Section>
      </main>
    </>
  );
}

