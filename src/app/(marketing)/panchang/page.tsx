import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { AdSlot } from "@/components/monetization/AdSlot";
import { ConsultationCTA } from "@/components/monetization/ConsultationCTA";
import { ReportCTA } from "@/components/monetization/ReportCTA";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      "Use Panchang for daily timing context first, then open Rashifal for sign-level guidance and NAVAGRAHA AI for chart-aware interpretation.",
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
    title: "Daily Panchang",
    href: "#panchang-tool",
    icon: "DP",
    statusLabel: "Open",
    ctaLabel: "Open",
    feature: "panchang-utility-daily",
    description: "Open the verified daily timing panel.",
  },
  {
    title: "Monthly Calendar",
    href: undefined,
    icon: "MC",
    statusLabel: "Coming Soon",
    ctaLabel: "Coming Soon",
    feature: "panchang-utility-monthly-calendar",
    description: "Monthly calendar planning is being prepared.",
  },
  {
    title: "Hindu Calendar",
    href: undefined,
    icon: "HC",
    statusLabel: "Coming Soon",
    ctaLabel: "Coming Soon",
    feature: "panchang-utility-hindu-calendar",
    description: "Hindu calendar view is being prepared.",
  },
  {
    title: "Hora",
    href: undefined,
    icon: "HO",
    statusLabel: "Coming Soon",
    ctaLabel: "Coming Soon",
    feature: "panchang-utility-hora",
    description: "Hora planning tools are being prepared.",
  },
  {
    title: "Choghadiya",
    href: undefined,
    icon: "CH",
    statusLabel: "Coming Soon",
    ctaLabel: "Coming Soon",
    feature: "panchang-utility-choghadiya",
    description: "Choghadiya timing tools are being prepared.",
  },
  {
    title: "Rahu Kaal",
    href: undefined,
    icon: "RK",
    statusLabel: "Coming Soon",
    ctaLabel: "Coming Soon",
    feature: "panchang-utility-rahu-kaal",
    description: "Rahu Kaal timing details are being prepared.",
  },
  {
    title: "Panchak",
    href: undefined,
    icon: "PA",
    statusLabel: "Coming Soon",
    ctaLabel: "Coming Soon",
    feature: "panchang-utility-panchak",
    description: "Panchak awareness tools are being prepared.",
  },
  {
    title: "Bhadra",
    href: undefined,
    icon: "BH",
    statusLabel: "Coming Soon",
    ctaLabel: "Coming Soon",
    feature: "panchang-utility-bhadra",
    description: "Bhadra timing tools are being prepared.",
  },
  {
    title: "Muhurat",
    href: undefined,
    icon: "MU",
    statusLabel: "Coming Soon",
    ctaLabel: "Coming Soon",
    feature: "panchang-utility-muhurat",
    description: "Muhurat planning tools are being prepared.",
  },
  {
    title: "Festival Calendar",
    href: undefined,
    icon: "FC",
    statusLabel: "Coming Soon",
    ctaLabel: "Coming Soon",
    feature: "panchang-utility-festival-calendar",
    description: "Festival calendar planning is being prepared.",
  },
  {
    title: "Lagna Table",
    href: undefined,
    icon: "LT",
    statusLabel: "Coming Soon",
    ctaLabel: "Coming Soon",
    feature: "panchang-utility-lagna-table",
    description: "Lagna table tools are being prepared.",
  },
  {
    title: "Panchang NI",
    href: "/tools",
    icon: "NI",
    statusLabel: "AI Tool",
    ctaLabel: "Open Tools",
    feature: "panchang-utility-ni",
    description: "Move into NAVAGRAHA AI tools for Panchang NI.",
  },
] as const;

const panchangGuidanceLinks = [
  {
    title: "Read Daily Rashifal",
    href: "/rashifal",
    icon: "DR",
    subtitle: "Daily predictions",
    feature: "panchang-guidance-rashifal",
  },
  {
    title: "Generate Kundli",
    href: "/kundli",
    icon: "KU",
    subtitle: "Birth chart",
    feature: "panchang-guidance-kundli",
  },
  {
    title: "Ask NAVAGRAHA AI",
    href: "/tools",
    icon: "AI",
    subtitle: "AI astrology help",
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
    title: "Consult JYOTISH BHASKAR J P SARMAH",
    href: "/consultation",
    icon: "CS",
    subtitle: "Personal consultation",
    feature: "panchang-guidance-consultation",
  },
  {
    title: "Explore Panchang NI",
    href: "/tools",
    icon: "NI",
    subtitle: "AI panchang insights",
    feature: "panchang-guidance-ni",
  },
] as const;

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
  const localizedHref = getLocalizedPath(locale, href, {
    forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
  });
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
  const isAiTool = statusLabel === "AI Tool";
  const linkHref = href ?? "#";
  const localizedHref =
    !isComingSoon && linkHref.startsWith("#")
      ? getLocalizedPath(locale, linkHref, {
          forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
        })
      : linkHref;

  const badgeTone =
    statusLabel === "Coming Soon"
      ? "neutral"
      : statusLabel === "AI Tool"
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

      <PageHero
        eyebrow="Daily Panchang Utility"
        title="Panchang Today"
        description="View daily Panchang guidance with tithi, nakshatra, yoga, karana, sunrise, sunset, timing context and Vedic daily planning support."
        highlights={[
          "Daily Panchang",
          "Tithi + Nakshatra",
          "Yoga + Karana",
          "Vedic Timing",
          "Daily Guidance",
        ]}
        note="Panchang is a timing reference layer and should be used with practical judgment for important decisions."
        primaryAction={{
          href: "#panchang-tool",
          label: "View Today's Panchang",
          eventName: "cta_click",
          eventPayload: {
            page: "/panchang",
            feature: "panchang-hero-primary",
          },
        }}
        secondaryAction={{
          href: "/rashifal",
          label: "Read Daily Rashifal",
          eventName: "cta_click",
          eventPayload: {
            page: "/panchang",
            feature: "panchang-hero-secondary",
          },
        }}
        supportTitle="Panchang Today"
      />

      <Section
        tone="light"
        category="utilities"
        eyebrow="Panchang Utilities"
        title="Quick access to daily timing, calendar, muhurat and Vedic planning tools."
        description="Use compact utility cards to move through the verified Panchang timing flow."
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
        eyebrow="Today&apos;s Panchang"
        title="Today&apos;s Panchang"
        description="Daily Panchang details will appear here when verified Panchang data is available."
      >
        <Card
          tone="default"
          className="border-[rgba(184,137,67,0.2)] bg-white p-4 shadow-[0_12px_28px_rgba(17,24,39,0.05)] before:opacity-0 sm:p-5"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(184,137,67,0.28)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.98)_0%,rgba(247,234,204,0.92)_72%,rgba(238,214,166,0.88)_100%)] text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-accent-strong)] shadow-[0_10px_22px_rgba(121,85,33,0.12)]">
              PM
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[0.96rem] font-semibold leading-tight text-[color:var(--color-ink-strong)]">
                  Today&apos;s Panchang
                </h3>
                <Badge
                  tone="trust"
                  className="border border-[rgba(184,137,67,0.18)] bg-white text-[0.62rem] uppercase tracking-[0.06em] text-[color:var(--color-accent-strong)]"
                >
                  Safe Mode
                </Badge>
              </div>
              <p className="text-[0.84rem] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Verified Panchang data will be published soon.
              </p>
            </div>
          </div>
        </Card>
      </Section>

      <Section
        tone="light"
        category="utilities"
        eyebrow="Continue Guidance"
        title="Continue Your Daily Vedic Guidance"
        description="Move into the next safe action without fake Panchang data or broken routes."
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
        description="The flow is lightweight, deterministic, and aligned with current astrology engine conventions."
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
        description="Keep the flow simple: check the core factors, note transition windows, then continue into deeper chart-aware tools when needed."
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
              Continue into Kundli, NAVAGRAHA AI, and consultation when you need chart-level interpretation beyond daily timing.
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
        description="These answers are intentionally concise and practical for everyday checking."
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
        description="Internal links are kept focused so you can move into the right next tool without clutter."
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
              href: "/muhurta",
              label: "Open Muhurta-lite",
              title: "Muhurta-lite",
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
              label: "Get Free Report",
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
              Move from daily Panchang into chart and AI guidance.
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Use Panchang for daily timing context, then continue with Kundli and NAVAGRAHA AI for deeper personal interpretation.
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
              Explore NAVAGRAHA AI
            </TrackedLink>
          </div>
        </Card>
      </Section>
    </>
  );
}

