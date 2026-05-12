import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  ConsultationIcon,
  KundliIcon,
  NavagrahaAiIcon,
  PanchangIcon,
  RashifalIcon,
  ReportIcon,
} from "@/components/icons/astrology-icons";
import { UtilityIcon } from "@/components/graphics/utility-icons";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { defaultLocale, getLocalizedPath, type SupportedLocale } from "@/modules/localization/config";

type RailStatus = "Available" | "Requires Kundli" | "Coming Soon" | "Future Intelligence" | "Premium / Report";

type RailAction = {
  title: string;
  description: string;
  href?: string;
  ctaLabel: string;
  icon: "kundli" | "ai" | "consultation" | "report" | "panchang" | "rashifal" | "utility" | "letter";
  initials?: string;
  status: RailStatus;
  feature: string;
  eventName?: "cta_click" | "premium_ai_cta_click" | "consultation_cta_click" | "report_cta_click" | "utility_card_click" | "rashifal_view";
};

export type HomepageMobileRailsProps = {
  locale: SupportedLocale;
  hasExplicitLocalePrefix: boolean;
};

function localizeHref(
  locale: SupportedLocale,
  hasExplicitLocalePrefix: boolean,
  href: string,
) {
  return getLocalizedPath(locale, href, {
    forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
  });
}

function statusLabel(status: RailStatus) {
  return status;
}

function RailIcon({ item }: Readonly<{ item: RailAction }>) {
  switch (item.icon) {
    case "kundli":
      return <KundliIcon className="h-12 w-12" />;
    case "ai":
      return <NavagrahaAiIcon className="h-12 w-12" />;
    case "consultation":
      return <ConsultationIcon className="h-12 w-12" />;
    case "report":
      return <ReportIcon className="h-12 w-12" />;
    case "panchang":
      return <PanchangIcon className="h-12 w-12" />;
    case "rashifal":
      return <RashifalIcon className="h-12 w-12" />;
    case "utility":
      return <UtilityIcon name="calculators" className="h-12 w-12" />;
    case "letter":
    default:
      return (
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(184,137,67,0.34)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.96)_0%,rgba(247,234,204,0.9)_70%,rgba(238,214,166,0.84)_100%)] text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-[rgba(130,86,25,0.92)] shadow-[0_8px_20px_rgba(121,85,33,0.12)]">
          {item.initials ?? "NC"}
        </span>
      );
  }
}

function RailSectionHeader({
  eyebrow,
  title,
  description,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
}>) {
  return (
    <div className="max-w-3xl space-y-3 sm:space-y-4">
      <Badge tone="trust" className="w-fit border border-black/8 bg-white">
        {eyebrow}
      </Badge>
      <h2
        className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-ink-strong)] tracking-[0.01em] sm:text-[length:var(--font-size-title-lg)] sm:[letter-spacing:var(--tracking-display)]"
      >
        {title}
      </h2>
      <p className="max-w-3xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-strong)] sm:text-[length:var(--font-size-body-lg)]">
        {description}
      </p>
    </div>
  );
}

function RailActionCard({
  item,
  locale,
  hasExplicitLocalePrefix,
  compact = false,
}: Readonly<{
  item: RailAction;
  locale: SupportedLocale;
  hasExplicitLocalePrefix: boolean;
  compact?: boolean;
}>) {
  const href = item.href
    ? localizeHref(locale, hasExplicitLocalePrefix, item.href)
    : undefined;

  const content = (
    <Card
      tone="default"
      interactive={Boolean(href)}
      className={[
        "flex h-full flex-col border-black/8 bg-white bg-none p-3 shadow-[0_14px_36px_rgba(17,24,39,0.06)] before:opacity-0 hover:border-black/12",
        compact ? "gap-2.5 sm:p-4" : "gap-4 sm:p-4",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <RailIcon item={item} />
        <span className="rounded-full border border-[rgba(184,137,67,0.24)] px-2.5 py-1 text-[0.54rem] uppercase tracking-[0.1em] text-[color:var(--color-accent-strong)] sm:text-[0.58rem] sm:tracking-[0.14em]">
          {statusLabel(item.status)}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-[0.72rem] font-medium leading-[1.15] text-[color:var(--color-ink-strong)] sm:text-[length:var(--font-size-body-lg)]">
          {item.title}
        </h3>
        <p
          className={[
            "text-[0.76rem] leading-[1.45] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-sm)] sm:leading-[var(--line-height-copy)]",
            compact ? "hidden sm:block" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {item.description}
        </p>
      </div>

      <span
        className={buttonStyles({
          size: "sm",
          tone:
            item.status === "Coming Soon" || item.status === "Future Intelligence"
              ? "ghost"
              : "secondary",
          className: compact
            ? "hidden w-full justify-center sm:inline-flex"
            : "w-full justify-center",
        })}
        aria-disabled={item.status === "Coming Soon" || item.status === "Future Intelligence"}
      >
        {item.ctaLabel}
      </span>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <TrackedLink
      href={href}
      eventName={item.eventName ?? "cta_click"}
      eventPayload={{ page: "/", feature: item.feature }}
      className="group block h-full"
    >
      {content}
    </TrackedLink>
  );
}

function ComingSoonCard({
  item,
}: Readonly<{
  item: RailAction;
}>) {
  return (
    <Card className="flex h-full flex-col gap-4 border-black/8 bg-white bg-none p-3 shadow-[0_14px_36px_rgba(17,24,39,0.06)] before:opacity-0 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <RailIcon item={item} />
        <span className="rounded-full border border-[rgba(184,137,67,0.24)] px-2.5 py-1 text-[0.54rem] uppercase tracking-[0.1em] text-[color:var(--color-accent-strong)] sm:text-[0.58rem] sm:tracking-[0.14em]">
          {statusLabel(item.status)}
        </span>
      </div>
      <div className="space-y-2">
        <h3 className="text-[0.72rem] font-medium leading-[1.15] text-[color:var(--color-ink-strong)] sm:text-[length:var(--font-size-body-lg)]">
          {item.title}
        </h3>
        <p className="text-[0.76rem] leading-[1.45] text-[color:var(--color-ink-body)] sm:text-[length:var(--font-size-body-sm)] sm:leading-[var(--line-height-copy)]">
          {item.description}
        </p>
      </div>
      <span
        className={buttonStyles({
          size: "sm",
          tone: "ghost",
          className: "w-full justify-center pointer-events-none opacity-60",
        })}
        aria-disabled="true"
      >
        {item.ctaLabel}
      </span>
    </Card>
  );
}

const quickAccessItems: readonly RailAction[] = [
  {
    title: "Kundli",
    description: "Birth chart foundation.",
    href: "/kundli",
    ctaLabel: "Open",
    icon: "kundli",
    status: "Available",
    feature: "home-mobile-rail-kundli",
    eventName: "cta_click",
  },
  {
    title: "Matchmaking",
    description: "Compatibility flow.",
    href: "/matchmaking",
    ctaLabel: "Open",
    icon: "utility",
    status: "Available",
    feature: "home-mobile-rail-matchmaking",
    eventName: "utility_card_click",
  },
  {
    title: "Rashifal",
    description: "Daily sign guidance.",
    href: "/rashifal",
    ctaLabel: "Open",
    icon: "rashifal",
    status: "Available",
    feature: "home-mobile-rail-rashifal",
    eventName: "rashifal_view",
  },
  {
    title: "Panchang",
    description: "Daily timing context.",
    href: "/panchang",
    ctaLabel: "Open",
    icon: "panchang",
    status: "Available",
    feature: "home-mobile-rail-panchang",
    eventName: "cta_click",
  },
  {
    title: "Reports",
    description: "Premium guidance.",
    href: "/reports",
    ctaLabel: "Open",
    icon: "report",
    status: "Premium / Report",
    feature: "home-mobile-rail-reports",
    eventName: "report_cta_click",
  },
  {
    title: "Consultation",
    description: "Human review.",
    href: "/consultation",
    ctaLabel: "Open",
    icon: "consultation",
    status: "Available",
    feature: "home-mobile-rail-consultation",
    eventName: "consultation_cta_click",
  },
  {
    title: "Remedies",
    description: "Optional support.",
    href: "/tools",
    ctaLabel: "Open",
    icon: "utility",
    status: "Available",
    feature: "home-mobile-rail-remedies",
    eventName: "utility_card_click",
  },
  {
    title: "Shop",
    description: "Future commerce.",
    href: "/shop",
    ctaLabel: "Open",
    icon: "letter",
    initials: "SHOP",
    status: "Available",
    feature: "home-mobile-rail-shop",
    eventName: "utility_card_click",
  },
] as const;

const aiRailCards: readonly RailAction[] = [
  {
    title: "Ask NAVAGRAHA AI",
    description: "Start from chart-aware intelligence without exposing raw prompts.",
    href: "/ai",
    ctaLabel: "Start AI Guidance",
    icon: "ai",
    status: "Available",
    feature: "home-mobile-ai-ask",
    eventName: "premium_ai_cta_click",
  },
  {
    title: "Generate Kundli First",
    description: "Build your chart foundation before asking deeper questions.",
    href: "/kundli",
    ctaLabel: "Generate Kundli",
    icon: "kundli",
    status: "Available",
    feature: "home-mobile-ai-kundli",
    eventName: "cta_click",
  },
  {
    title: "AI Report Guidance",
    description: "Move from chart context into premium report pathways.",
    href: "/reports",
    ctaLabel: "View Reports",
    icon: "report",
    status: "Premium / Report",
    feature: "home-mobile-ai-report",
    eventName: "report_cta_click",
  },
  {
    title: "Daily Guidance",
    description: "Use today’s Rashifal and Panchang context for quick decisions.",
    href: "/daily-rashifal",
    ctaLabel: "Open Daily",
    icon: "rashifal",
    status: "Available",
    feature: "home-mobile-ai-daily",
    eventName: "rashifal_view",
  },
] as const;

const niTools: readonly RailAction[] = [
  {
    title: "Kundli NI",
    description: "Available chart intelligence layer tied to your birth chart context.",
    href: "/kundli",
    ctaLabel: "Open Kundli",
    icon: "ai",
    status: "Available",
    feature: "home-mobile-ni-kundli",
    eventName: "cta_click",
  },
  {
    title: "Dasha NI",
    description: "Future intelligence for time-cycle interpretation.",
    ctaLabel: "Coming Soon",
    icon: "ai",
    status: "Coming Soon",
    feature: "home-mobile-ni-dasha",
    eventName: "cta_click",
  },
  {
    title: "Transit NI",
    description: "Future intelligence for moving planetary context.",
    ctaLabel: "Coming Soon",
    icon: "ai",
    status: "Coming Soon",
    feature: "home-mobile-ni-transit",
    eventName: "cta_click",
  },
  {
    title: "Panchang NI",
    description: "Future intelligence for daily timing and ritual context.",
    ctaLabel: "Coming Soon",
    icon: "ai",
    status: "Coming Soon",
    feature: "home-mobile-ni-panchang",
    eventName: "cta_click",
  },
  {
    title: "Remedy NI",
    description: "Future intelligence for guidance, routines, and support mapping.",
    ctaLabel: "Coming Soon",
    icon: "ai",
    status: "Coming Soon",
    feature: "home-mobile-ni-remedy",
    eventName: "cta_click",
  },
  {
    title: "Numerology NI",
    description: "Future intelligence for life path and number-based context.",
    ctaLabel: "Coming Soon",
    icon: "ai",
    status: "Coming Soon",
    feature: "home-mobile-ni-numerology",
    eventName: "cta_click",
  },
  {
    title: "Career NI",
    description: "Future intelligence for vocation and work-path context.",
    ctaLabel: "Coming Soon",
    icon: "ai",
    status: "Coming Soon",
    feature: "home-mobile-ni-career",
    eventName: "cta_click",
  },
  {
    title: "Finance NI",
    description: "Future intelligence for money-flow and planning cues.",
    ctaLabel: "Coming Soon",
    icon: "ai",
    status: "Coming Soon",
    feature: "home-mobile-ni-finance",
    eventName: "cta_click",
  },
  {
    title: "Marriage NI",
    description: "Future intelligence for relationship context.",
    ctaLabel: "Coming Soon",
    icon: "ai",
    status: "Coming Soon",
    feature: "home-mobile-ni-marriage",
    eventName: "cta_click",
  },
  {
    title: "Business NI",
    description: "Future intelligence for enterprise and strategy context.",
    ctaLabel: "Coming Soon",
    icon: "ai",
    status: "Coming Soon",
    feature: "home-mobile-ni-business",
    eventName: "cta_click",
  },
  {
    title: "Vastu NI",
    description: "Future intelligence for home and space context.",
    ctaLabel: "Coming Soon",
    icon: "ai",
    status: "Coming Soon",
    feature: "home-mobile-ni-vastu",
    eventName: "cta_click",
  },
  {
    title: "Palmistry NI",
    description: "Future intelligence for hand-sign interpretation.",
    ctaLabel: "Coming Soon",
    icon: "ai",
    status: "Coming Soon",
    feature: "home-mobile-ni-palmistry",
    eventName: "cta_click",
  },
  {
    title: "Face Reading NI",
    description: "Future intelligence for appearance and expression cues.",
    ctaLabel: "Coming Soon",
    icon: "ai",
    status: "Coming Soon",
    feature: "home-mobile-ni-face-reading",
    eventName: "cta_click",
  },
] as const;

const reportRailCards: readonly RailAction[] = [
  {
    title: "Birth Kundli Report",
    description: "Structured life mapping from Lagna, houses, planets, and chart context.",
    href: "/reports",
    ctaLabel: "View Reports",
    icon: "kundli",
    status: "Premium / Report",
    feature: "home-mobile-report-birth",
    eventName: "report_cta_click",
  },
  {
    title: "Career Report",
    description: "Work direction, timing, and decision support in a premium report flow.",
    href: "/reports",
    ctaLabel: "View Reports",
    icon: "consultation",
    status: "Premium / Report",
    feature: "home-mobile-report-career",
    eventName: "report_cta_click",
  },
  {
    title: "Marriage Report",
    description: "Relationship guidance and compatibility context with calm framing.",
    href: "/reports",
    ctaLabel: "View Reports",
    icon: "utility",
    status: "Premium / Report",
    feature: "home-mobile-report-marriage",
    eventName: "report_cta_click",
  },
  {
    title: "Finance Report",
    description: "Money-flow and planning context from the chart lens.",
    href: "/reports",
    ctaLabel: "View Reports",
    icon: "utility",
    status: "Premium / Report",
    feature: "home-mobile-report-finance",
    eventName: "report_cta_click",
  },
  {
    title: "Health Guidance",
    description: "Supportive wellness indicators and lifestyle awareness from chart signals.",
    href: "/reports",
    ctaLabel: "View Reports",
    icon: "panchang",
    status: "Premium / Report",
    feature: "home-mobile-report-health",
    eventName: "report_cta_click",
  },
  {
    title: "Yearly Guidance",
    description: "A broader annual view for planning and timing.",
    href: "/reports",
    ctaLabel: "View Reports",
    icon: "rashifal",
    status: "Premium / Report",
    feature: "home-mobile-report-yearly",
    eventName: "report_cta_click",
  },
] as const;

const consultationCards: readonly RailAction[] = [
  {
    title: "Book Consultation",
    description: "Book human review when a deeper conversation is needed.",
    href: "/consultation",
    ctaLabel: "Book Consultation",
    icon: "consultation",
    status: "Available",
    feature: "home-mobile-consultation-book",
    eventName: "consultation_cta_click",
  },
  {
    title: "Generate Kundli First",
    description: "Build chart context before starting a consultation.",
    href: "/kundli",
    ctaLabel: "Generate Kundli",
    icon: "kundli",
    status: "Available",
    feature: "home-mobile-consultation-kundli",
    eventName: "cta_click",
  },
  {
    title: "Ask NAVAGRAHA AI",
    description: "Use AI guidance before deciding on human follow-up.",
    href: "/ai",
    ctaLabel: "Start AI Guidance",
    icon: "ai",
    status: "Available",
    feature: "home-mobile-consultation-ai",
    eventName: "premium_ai_cta_click",
  },
] as const;

const contentRailCards: readonly RailAction[] = [
  {
    title: "FROM THE DESK OF J P SARMAH",
    description:
      "Manually published Daily Rashifal, Monthly Rashifal, Yearly Rashifal, Panchang guidance, spiritual remedies, and educational astrology content.",
    href: "/from-the-desk",
    ctaLabel: "Read From the Desk",
    icon: "report",
    status: "Available",
    feature: "home-mobile-desk",
    eventName: "utility_card_click",
  },
  {
    title: "Astrology Learning",
    description: "Learn planets, houses, Rashis, Dasha, Panchang, remedies and Vedic astrology basics.",
    ctaLabel: "Coming Soon",
    icon: "utility",
    status: "Coming Soon",
    feature: "home-mobile-learning",
    eventName: "utility_card_click",
  },
  {
    title: "NAVAGRAHA Videos & Social",
    description: "Watch astrology lessons, Rashifal guidance and Vedic insights from NAVAGRAHA CENTRE.",
    ctaLabel: "Coming Soon",
    icon: "letter",
    initials: "VID",
    status: "Coming Soon",
    feature: "home-mobile-videos",
    eventName: "utility_card_click",
  },
  {
    title: "Gemstones, Rudraksha & Vedic Items",
    description: "Explore spiritual and astrology-aligned items selected for future remedy commerce.",
    href: "/shop",
    ctaLabel: "Explore Shop",
    icon: "letter",
    initials: "SHOP",
    status: "Available",
    feature: "home-mobile-shop",
    eventName: "utility_card_click",
  },
] as const;

export function HomepageMobileRails({
  locale,
  hasExplicitLocalePrefix,
}: Readonly<HomepageMobileRailsProps>) {
  return (
    <Container className="space-y-8 py-8 sm:py-12 lg:py-14">
      <section className="space-y-4">
        <RailSectionHeader
          eyebrow="Quick Access"
          title="Quick Astrology Access"
          description="Fast-entry rails for the most-used astrology flows, shaped for mobile-first discovery and premium white visibility."
        />
        <div className="grid grid-cols-4 gap-2 sm:gap-3 xl:grid-cols-8">
          {quickAccessItems.map((item) => (
            <RailActionCard
              key={item.title}
              item={item}
              locale={locale}
              hasExplicitLocalePrefix={hasExplicitLocalePrefix}
              compact
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.04fr)_minmax(20rem,0.96fr)] lg:items-start">
          <div className="space-y-4">
            <RailSectionHeader
              eyebrow="NAVAGRAHA AI"
              title="NAVAGRAHA AI"
              description="Personalized Vedic astrology intelligence powered by Kundli, Dasha, Transit, Panchang, Reports and Remedies."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {aiRailCards.map((item) => (
                <RailActionCard
                  key={item.title}
                  item={item}
                  locale={locale}
                  hasExplicitLocalePrefix={hasExplicitLocalePrefix}
                />
              ))}
            </div>
          </div>

          <Card
            tone="default"
            className="flex h-full flex-col gap-5 border-black/8 bg-white bg-none shadow-[0_18px_44px_rgba(17,24,39,0.06)] before:opacity-0"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <NavagrahaAiIcon className="h-12 w-12" />
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[color:var(--color-ink-muted)] sm:text-[0.68rem] sm:tracking-[0.14em]">
                    AI Preview
                  </p>
                  <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-ink-strong)]">
                    Context-led, not fabricated
                  </p>
                </div>
              </div>
              <Badge tone="trust">Safe Preview</Badge>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-black/8 bg-white p-4 shadow-[0_8px_20px_rgba(17,24,39,0.04)]">
              <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-muted)]">
                Guidance layers
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {["Kundli Context", "Dasha", "Transit", "Panchang", "Remedies"].map((chip) => (
                  <li
                    key={chip}
                    className="rounded-[var(--radius-lg)] border border-[rgba(184,137,67,0.18)] px-3 py-2 text-[length:var(--font-size-body-xs)] text-[color:var(--color-ink-body)]"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "No raw prompts exposed",
                "Chart-aware guidance only",
                "Safe fallback when data is missing",
                "Private data stays private",
              ].map((note) => (
                <div
                  key={note}
                  className="rounded-[var(--radius-lg)] border border-[rgba(184,137,67,0.16)] bg-white px-3 py-3 text-[length:var(--font-size-body-xs)] text-[color:var(--color-ink-body)]"
                >
                  {note}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <RailSectionHeader
          eyebrow="NAVAGRAHA Intelligence"
          title="NAVAGRAHA Intelligence Tools"
          description="An expanding intelligent tools ecosystem under NAVAGRAHA AI. Kundli NI is available; the remaining modules are structured as future intelligence only."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {niTools.map((item) =>
            item.status === "Coming Soon" ? (
              <ComingSoonCard key={item.title} item={item} />
            ) : (
              <RailActionCard
                key={item.title}
                item={item}
                locale={locale}
                hasExplicitLocalePrefix={hasExplicitLocalePrefix}
              />
            )
          )}
        </div>
      </section>

      <section className="space-y-4">
        <RailSectionHeader
          eyebrow="Premium Reports"
          title="Premium Astrology Reports"
          description="Career, Marriage, Finance, Health, Life Path and advanced Vedic insights prepared from Kundli, Dasha, Transit and planetary intelligence."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {reportRailCards.map((item) => (
            <RailActionCard
              key={item.title}
              item={item}
              locale={locale}
              hasExplicitLocalePrefix={hasExplicitLocalePrefix}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.04fr)_minmax(20rem,0.96fr)] lg:items-stretch">
          <div className="space-y-4">
            <RailSectionHeader
              eyebrow="Authority + Consultation"
              title="Consult JYOTISH BHASKAR J P SARMAH"
              description="Human astrologer guidance supported by Kundli, Dasha, Transit, Panchang and NAVAGRAHA Intelligence context."
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {consultationCards.map((item) => (
                <RailActionCard
                  key={item.title}
                  item={item}
                  locale={locale}
                  hasExplicitLocalePrefix={hasExplicitLocalePrefix}
                />
              ))}
            </div>
          </div>

          <Card className="relative overflow-hidden border border-[rgba(95,135,200,0.24)] bg-[linear-gradient(145deg,#f8fbff_0%,#e8f0ff_55%,#dfeaff_100%)] shadow-[0_18px_44px_rgba(19,53,110,0.12)] before:opacity-0">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(75,118,192,0.16),transparent_32%),radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.48),transparent_24%),radial-gradient(circle_at_72%_82%,rgba(184,137,67,0.12),transparent_30%)]"
            />
            <div className="relative flex h-full flex-col gap-5 p-4 sm:p-6 lg:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative flex h-18 w-18 items-center justify-center rounded-full border border-[rgba(184,137,67,0.38)] bg-[radial-gradient(circle_at_center,#ffffff_0%,#f2dcaf_100%)] text-[0.9rem] font-semibold tracking-[0.12em] text-[rgba(130,86,25,0.95)] shadow-[0_16px_30px_rgba(37,56,98,0.14)] sm:h-20 sm:w-20 sm:text-[0.95rem] sm:tracking-[0.14em]">
                    <span className="absolute inset-2 rounded-full border border-[rgba(184,137,67,0.24)]" />
                    <span className="absolute inset-4 rotate-45 border border-[rgba(184,137,67,0.18)]" />
                    <span className="relative">JPS</span>
                  </div>
                  <div className="space-y-2">
                    <Badge tone="trust" className="border border-white/55 bg-white/75 text-[color:var(--color-ink-strong)]">
                      Astrologer Authority
                    </Badge>
                  <p className="max-w-md text-[0.62rem] uppercase tracking-[0.1em] text-[rgba(19,53,110,0.74)] sm:text-[0.68rem] sm:tracking-[0.14em]">
                      JYOTISH BHASKAR JOY PRAKASH SARMAH
                    </p>
                  </div>
                </div>
                <Badge tone="trust" className="border border-[rgba(184,137,67,0.26)] bg-white/85 text-[color:var(--color-ink-strong)]">
                  বৰ্ষচক্ৰ 2026
                </Badge>
              </div>

              <div className="space-y-4">
                <h3 className="max-w-2xl text-[length:var(--font-size-title-sm)] font-semibold text-[color:var(--color-ink-strong)]">
                  The guiding astrologer authority behind NAVAGRAHA CENTRE.
                </h3>
                <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  Annual Vedic guidance, Rashifal, Panchang insights and life-direction support from the astrologer&apos;s desk.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Annual Vedic guidance", "Rashifal + Panchang", "Life-direction support"].map((item) => (
                  <Badge
                    key={item}
                    tone="trust"
                    className="border border-white/60 bg-white px-3 py-2 text-[0.62rem] uppercase tracking-[0.1em] text-[color:var(--color-ink-strong)] shadow-[0_8px_20px_rgba(17,24,39,0.04)] sm:text-[0.64rem] sm:tracking-[0.14em]"
                  >
                    {item}
                  </Badge>
                ))}
              </div>

              <div className="mt-auto grid gap-3 sm:grid-cols-3">
                <RailActionCard
                  item={{
                    title: "Book Consultation",
                    description: "Book human review when a deeper conversation is needed.",
                    href: "/consultation",
                    ctaLabel: "Book Consultation",
                    icon: "consultation",
                    status: "Available",
                    feature: "home-mobile-consultation-book",
                    eventName: "consultation_cta_click",
                  }}
                  locale={locale}
                  hasExplicitLocalePrefix={hasExplicitLocalePrefix}
                />
                <RailActionCard
                  item={{
                    title: "Generate Kundli First",
                    description: "Build chart context before starting a consultation.",
                    href: "/kundli",
                    ctaLabel: "Generate Kundli",
                    icon: "kundli",
                    status: "Available",
                    feature: "home-mobile-consultation-kundli",
                    eventName: "cta_click",
                  }}
                  locale={locale}
                  hasExplicitLocalePrefix={hasExplicitLocalePrefix}
                />
                <RailActionCard
                  item={{
                    title: "Ask NAVAGRAHA AI",
                    description: "Use AI guidance before deciding on human follow-up.",
                    href: "/ai",
                    ctaLabel: "Start AI Guidance",
                    icon: "ai",
                    status: "Available",
                    feature: "home-mobile-consultation-ai",
                    eventName: "premium_ai_cta_click",
                  }}
                  locale={locale}
                  hasExplicitLocalePrefix={hasExplicitLocalePrefix}
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <RailSectionHeader
          eyebrow="From the Desk"
          title="Content, Learning, Video and Shop Rails"
          description="Manual publishing, future learning surfaces, and safe commerce previews remain clear and non-fabricated."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {contentRailCards.map((item) =>
            item.href ? (
              <RailActionCard
                key={item.title}
                item={item}
                locale={locale}
                hasExplicitLocalePrefix={hasExplicitLocalePrefix}
              />
            ) : (
              <ComingSoonCard key={item.title} item={item} />
            )
          )}
        </div>
      </section>
    </Container>
  );
}
