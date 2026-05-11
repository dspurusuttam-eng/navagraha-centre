import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  CalculatorIcon,
  ConsultationIcon,
  KundliIcon,
  NavagrahaAiIcon,
  NumerologyIcon,
  PanchangIcon,
  RashifalIcon,
  ReportIcon,
} from "@/components/icons/astrology-icons";
import { HomepagePremiumHeroVisual } from "@/components/graphics/homepage-premium-hero-visual";
import { GoldSectionDivider } from "@/components/graphics/section-patterns";
import { UtilityIcon } from "@/components/graphics/utility-icons";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("home", locale);

  return createPageMetadata({
    title: localized.title,
    description: localized.description,
    path: "/",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "AI Vedic astrology",
      "kundli",
      "daily rashifal",
      "daily panchang",
      "numerology",
      "astrology reports",
    ],
  });
}

export const revalidate = 3600;

type HomeIcon =
  | "kundli"
  | "ai"
  | "rashifal"
  | "reports"
  | "consultation"
  | "numerology"
  | "panchang"
  | "calculators";

type ToolPreviewStatus = "Available" | "Requires Kundli" | "Preview";

type ToolPreviewGlyph =
  | "kundli"
  | "rashifal"
  | "panchang"
  | "reports"
  | "consultation"
  | "ai"
  | "numerology"
  | "compatibility"
  | "calculators"
  | "generic";

type ToolPreviewItem = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  feature: string;
  status: ToolPreviewStatus;
  glyph: ToolPreviewGlyph;
  initials?: string;
};

const heroTrustBadges = [
  "Since 1950 Legacy",
  "12-Planet Calculations",
  "AI + Human Guidance",
  "Privacy-Safe Astrology",
] as const;

const trustStripItems = [
  "Trusted Vedic Guidance",
  "12-Planet Calculations",
  "Kundli + Dasha + Transit",
  "Assamese / English / Hindi Ready",
  "Secure & Privacy-Safe",
] as const;

const toolPreviewItems: readonly ToolPreviewItem[] = [
  {
    title: "Free Kundli",
    description: "Generate a clean sidereal chart with houses, Lagna, and planet context.",
    href: "/kundli",
    ctaLabel: "Open Kundli",
    feature: "home-tools-preview-kundli",
    status: "Available",
    glyph: "kundli",
  },
  {
    title: "Daily Rashifal",
    description: "See daily guidance across career, love, business, and planning cues.",
    href: "/daily-rashifal",
    ctaLabel: "Read Today",
    feature: "home-tools-preview-rashifal",
    status: "Available",
    glyph: "rashifal",
  },
  {
    title: "Panchang Today",
    description: "Check tithi, nakshatra, yoga, karana, and the day's timing context.",
    href: "/panchang",
    ctaLabel: "Open Panchang",
    feature: "home-tools-preview-panchang",
    status: "Available",
    glyph: "panchang",
  },
  {
    title: "Dasha Timeline",
    description: "Review time cycles and understand the current period more clearly.",
    href: "/tools",
    ctaLabel: "View Tools Hub",
    feature: "home-tools-preview-dasha",
    status: "Preview",
    glyph: "calculators",
  },
  {
    title: "Transit / Gochar",
    description: "See current motion context and how it can shape the day ahead.",
    href: "/insights/transits",
    ctaLabel: "Open Transit",
    feature: "home-tools-preview-transit",
    status: "Available",
    glyph: "panchang",
  },
  {
    title: "Matchmaking",
    description: "Review relationship compatibility through a calm Vedic signal flow.",
    href: "/marriage-compatibility",
    ctaLabel: "Check Match",
    feature: "home-tools-preview-matchmaking",
    status: "Available",
    glyph: "compatibility",
  },
  {
    title: "Dosha & Yoga",
    description: "Review dosha and yoga signals with safe remedy guidance nearby.",
    href: "/compatibility-hub",
    ctaLabel: "Open Hub",
    feature: "home-tools-preview-dosha-yoga",
    status: "Available",
    glyph: "compatibility",
  },
  {
    title: "Numerology",
    description: "Explore life path, destiny, and name-number patterns in one place.",
    href: "/numerology",
    ctaLabel: "Open Numerology",
    feature: "home-tools-preview-numerology",
    status: "Available",
    glyph: "numerology",
  },
  {
    title: "Remedies",
    description: "Browse optional, cautious guidance for mantra, charity, and worship.",
    href: "/remedies",
    ctaLabel: "View Remedies",
    feature: "home-tools-preview-remedies",
    status: "Available",
    glyph: "reports",
  },
  {
    title: "Reports",
    description: "Preview premium report paths for deeper life guidance and context.",
    href: "/reports",
    ctaLabel: "Explore Reports",
    feature: "home-tools-preview-reports",
    status: "Available",
    glyph: "reports",
  },
  {
    title: "Ask NAVAGRAHA AI",
    description: "Ask for guided chart-aware answers without leaving the homepage flow.",
    href: "/ai",
    ctaLabel: "Open AI",
    feature: "home-tools-preview-ai",
    status: "Available",
    glyph: "ai",
  },
  {
    title: "Consultation",
    description: "Book a guided human consultation when deeper review is needed.",
    href: "/consultation",
    ctaLabel: "Book Consultation",
    feature: "home-tools-preview-consultation",
    status: "Available",
    glyph: "consultation",
  },
] as const;

function getToolPreviewIcon(
  glyph: ToolPreviewGlyph,
  className?: string,
  initials?: string,
) {
  switch (glyph) {
    case "kundli":
      return <KundliIcon className={className} />;
    case "rashifal":
      return <RashifalIcon className={className} />;
    case "panchang":
      return <PanchangIcon className={className} />;
    case "reports":
      return <ReportIcon className={className} />;
    case "consultation":
      return <ConsultationIcon className={className} />;
    case "ai":
      return <NavagrahaAiIcon className={className} />;
    case "numerology":
      return <NumerologyIcon className={className} />;
    case "compatibility":
      return <UtilityIcon name="compatibility" className={className} />;
    case "calculators":
      return <CalculatorIcon className={className} />;
    case "generic":
    default:
      return (
        <span
          className={[
            "inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(184,137,67,0.34)] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.96)_0%,rgba(247,234,204,0.9)_70%,rgba(238,214,166,0.84)_100%)] text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[rgba(130,86,25,0.92)] shadow-[0_8px_20px_rgba(121,85,33,0.12)]",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {initials ?? "NC"}
        </span>
      );
  }
}

const aiContextChips = [
  "Kundli Context",
  "Dasha",
  "Transit",
  "Panchang",
  "Remedies",
] as const;

type DailyGuidanceCard = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  feature: string;
  icon: HomeIcon;
};

const dailyGuidanceCards: readonly DailyGuidanceCard[] = [
  {
    title: "Today's Rashifal",
    description: "Open the daily zodiac guidance flow for practical planning context.",
    href: "/daily-rashifal",
    ctaLabel: "Read Rashifal",
    feature: "home-daily-rashifal",
    icon: "rashifal",
  },
  {
    title: "Panchang Today",
    description: "Check tithi, nakshatra, and daily timing context in a simple flow.",
    href: "/panchang",
    ctaLabel: "Open Panchang",
    feature: "home-daily-panchang",
    icon: "panchang",
  },
  {
    title: "Daily Remedy",
    description: "Review calm, optional guidance for mantra, charity, and worship.",
    href: "/remedies",
    ctaLabel: "View Remedies",
    feature: "home-daily-remedy",
    icon: "consultation",
  },
  {
    title: "Current Transit",
    description: "See the live transit lens that supports daily context and return visits.",
    href: "/insights/transits",
    ctaLabel: "Open Transit",
    feature: "home-daily-transit",
    icon: "calculators",
  },
] as const;

const premiumReportCards: readonly ToolPreviewItem[] = [
  {
    title: "Birth Kundli Report",
    description: "Structured life mapping from Lagna, houses, planets, and chart context.",
    href: "/reports",
    ctaLabel: "View Reports",
    feature: "home-reports-birth-kundli",
    status: "Preview",
    glyph: "kundli",
  },
  {
    title: "Career Report",
    description: "Focused analysis for work direction, timing, and decision support.",
    href: "/reports",
    ctaLabel: "View Reports",
    feature: "home-reports-career",
    status: "Preview",
    glyph: "consultation",
  },
  {
    title: "Marriage Report",
    description: "Relationship and compatibility insight with calm, practical framing.",
    href: "/reports",
    ctaLabel: "View Reports",
    feature: "home-reports-marriage",
    status: "Preview",
    glyph: "compatibility",
  },
  {
    title: "Finance Report",
    description: "Money-flow, planning, and opportunity context from the chart lens.",
    href: "/reports",
    ctaLabel: "View Reports",
    feature: "home-reports-finance",
    status: "Preview",
    glyph: "calculators",
  },
  {
    title: "Health Guidance",
    description: "Supportive wellness indicators and lifestyle awareness from chart signals.",
    href: "/reports",
    ctaLabel: "View Reports",
    feature: "home-reports-health",
    status: "Preview",
    glyph: "panchang",
  },
  {
    title: "Yearly Guidance",
    description: "A broader annual view that can help with planning and timing.",
    href: "/reports",
    ctaLabel: "View Reports",
    feature: "home-reports-yearly",
    status: "Preview",
    glyph: "rashifal",
  },
  {
    title: "Dasha Report",
    description: "Time-period context that helps interpret current phases more clearly.",
    href: "/reports",
    ctaLabel: "View Reports",
    feature: "home-reports-dasha",
    status: "Preview",
    glyph: "calculators",
  },
  {
    title: "Transit Report",
    description: "Current motion context for day-to-day decisions and awareness.",
    href: "/reports",
    ctaLabel: "View Reports",
    feature: "home-reports-transit",
    status: "Preview",
    glyph: "panchang",
  },
] as const;

const authorityHighlights = [
  "Annual Vedic guidance",
  "Rashifal + Panchang",
  "Life-direction support",
] as const;

const consultationFocusChips = [
  "Kundli Context",
  "Dasha Review",
  "Transit Timing",
  "Life Decisions",
] as const;

const deskPreviewCards: readonly ToolPreviewItem[] = [
  {
    title: "FROM THE DESK OF J P SARMAH",
    description: "Manually published Daily Rashifal, Monthly Rashifal, Yearly Rashifal, Panchang guidance, spiritual remedies, and educational astrology content.",
    href: "/from-the-desk",
    ctaLabel: "Read From the Desk",
    feature: "home-desk-editorial",
    status: "Available",
    glyph: "reports",
  },
  {
    title: "Gemstones, Rudraksha & Vedic Items",
    description: "Optional spiritual support products selected for future remedy commerce and careful guidance flows.",
    href: "/shop",
    ctaLabel: "Explore Shop",
    feature: "home-desk-shop",
    status: "Preview",
    glyph: "kundli",
  },
] as const;

type FutureRailCard = {
  title: string;
  description: string;
  href?: string;
  ctaLabel: string;
  feature: string;
  statusLabel: string;
  glyph: ToolPreviewGlyph;
  initials?: string;
  ctaMode: "link" | "soon";
};

const futureRailCards: readonly FutureRailCard[] = [
  {
    title: "Astrology Learning",
    description: "Learn planets, houses, Rashis, Dasha, Panchang, remedies and Vedic astrology basics from NAVAGRAHA CENTRE.",
    href: "/insights/astrology-guides",
    ctaLabel: "Explore Lessons",
    feature: "home-future-learning",
    statusLabel: "Available",
    glyph: "generic",
    initials: "AL",
    ctaMode: "link",
  },
  {
    title: "NAVAGRAHA Videos & Guidance",
    description: "Watch astrology lessons, Rashifal guidance and Vedic insights from NAVAGRAHA CENTRE.",
    ctaLabel: "Videos coming soon",
    feature: "home-future-videos",
    statusLabel: "Coming Soon",
    glyph: "generic",
    initials: "VID",
    ctaMode: "soon",
  },
  {
    title: "Gemstones, Rudraksha & Vedic Items",
    description: "Explore spiritual and astrology-aligned items selected for future NAVAGRAHA remedy commerce.",
    href: "/shop",
    ctaLabel: "Explore Shop",
    feature: "home-future-shop",
    statusLabel: "Preview",
    glyph: "generic",
    initials: "SHOP",
    ctaMode: "link",
  },
] as const;

const futureIntelligenceChips = [
  "Kundli NI",
  "Dasha NI",
  "Transit NI",
  "Panchang NI",
  "Remedy NI",
  "Numerology NI",
  "Vastu NI",
  "Palmistry NI",
  "Career NI",
  "Finance NI",
  "Marriage NI",
  "Business NI",
] as const;


export default async function HomePage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localizeHref = (href: string) =>
    getLocalizedPath(locale, href, {
      forcePrefix: locale !== defaultLocale || hasExplicitLocalePrefix,
    });

  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/from-the-desk?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  } as const;

  return (
    <>
      <PageViewTracker page="/" feature="home-page" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />

      <section className="relative overflow-hidden border-b border-black/8 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(184,137,67,0.06),transparent_28%),radial-gradient(circle_at_80%_16%,rgba(17,24,39,0.03),transparent_26%),radial-gradient(circle_at_70%_84%,rgba(184,137,67,0.05),transparent_30%)]" />
        <Container className="relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.04fr)_minmax(320px,0.96fr)] lg:items-center lg:py-20">
          <div className="home-reveal home-reveal-delay-1 space-y-7">
            <Badge tone="trust">Since 1950 Legacy</Badge>
            <div className="space-y-5">
              <h1
                className="max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-md)] text-[var(--color-ink-strong)] sm:text-[length:var(--font-size-display-lg)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Your Complete Vedic Astrology Intelligence Centre
              </h1>
              <p className="max-w-[42rem] text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                Generate Kundli, explore Rashifal, Panchang, Dasha, Transit,
                Matchmaking, Remedies and personalized AI guidance - all in one
                trusted astrology platform.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <TrackedLink
                href={localizeHref("/kundli")}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "hero-primary-kundli" }}
                className={buttonStyles({
                  size: "lg",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Generate Your Kundli
              </TrackedLink>
              <TrackedLink
                href={localizeHref("/tools")}
                eventName="premium_ai_cta_click"
                eventPayload={{ page: "/", feature: "hero-secondary-tools" }}
                className={buttonStyles({
                  size: "lg",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Explore Astrology Tools
              </TrackedLink>
            </div>

            <div className="flex flex-wrap gap-2">
              {heroTrustBadges.map((badge) => (
                <Badge
                  key={badge}
                  tone="trust"
                  className="border border-black/8 bg-white px-3 py-2 text-[0.64rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-strong)] shadow-[0_8px_20px_rgba(17,24,39,0.04)]"
                >
                  {badge}
                </Badge>
              ))}
            </div>
          </div>

          <HomepagePremiumHeroVisual />
        </Container>
      </section>

      <section className="border-b border-black/8 bg-white">
        <Container className="py-4 sm:py-5">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {trustStripItems.map((item) => (
              <span
                key={item}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-black/8 bg-white px-3.5 py-2 text-[0.64rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-strong)] shadow-[0_8px_20px_rgba(17,24,39,0.04)]"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-gold)]"
                />
                {item}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <GoldSectionDivider />


      <section className="border-b border-black/8 bg-white">
        <Container className="py-12 sm:py-14">
          <div className="max-w-3xl space-y-4">
            <Badge tone="trust" className="w-fit border border-black/8 bg-white">
              Astrology Tools
            </Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-ink-strong)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Explore NAVAGRAHA Astrology Tools
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
              Quick entry points into the site&apos;s most-used astrology flows,
              with clean routing, status-aware fallbacks, and a premium white
              presentation.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {toolPreviewItems.map((tool) => (
              <Card
                key={tool.title}
                tone="default"
                interactive
                className="flex h-full flex-col gap-4 border-black/8 bg-white bg-none shadow-[0_14px_36px_rgba(17,24,39,0.06)] before:opacity-0 hover:border-black/12"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {getToolPreviewIcon(tool.glyph, "h-12 w-12", tool.initials)}
                    <div className="space-y-1">
                      <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-ink-strong)]">
                        {tool.title}
                      </h3>
                    </div>
                  </div>
                  <span className="rounded-full border border-[rgba(184,137,67,0.24)] px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
                    {tool.status}
                  </span>
                </div>

                <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  {tool.description}
                </p>

                <TrackedLink
                  href={localizeHref(tool.href)}
                  eventPayload={{ page: "/", feature: tool.feature, section: "home-tools-preview" }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className: "w-full justify-center",
                  })}
                >
                  {tool.ctaLabel}
                </TrackedLink>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <GoldSectionDivider />

      <section className="border-b border-black/8 bg-white">
        <Container className="grid gap-10 py-12 sm:py-14 lg:grid-cols-[minmax(0,1.04fr)_minmax(20rem,0.96fr)] lg:items-start lg:py-16">
          <div className="space-y-6">
            <Badge tone="trust" className="w-fit border border-black/8 bg-white">
              NAVAGRAHA AI
            </Badge>
            <div className="space-y-4">
              <h2
                className="max-w-3xl font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-ink-strong)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Ask NAVAGRAHA AI
              </h2>
              <p className="max-w-2xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Personalized astrology guidance from Kundli, Dasha, Transit,
                Panchang and daily context.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiContextChips.map((chip) => (
                <Badge
                  key={chip}
                  tone="trust"
                  className="border border-black/8 bg-white px-3 py-2 text-[0.64rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-strong)] shadow-[0_8px_20px_rgba(17,24,39,0.04)]"
                >
                  {chip}
                </Badge>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <TrackedLink
                href={localizeHref("/ai")}
                eventName="premium_ai_cta_click"
                eventPayload={{ page: "/", feature: "home-ai-primary" }}
                className={buttonStyles({
                  size: "lg",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Start AI Guidance
              </TrackedLink>
              <TrackedLink
                href={localizeHref("/kundli")}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "home-ai-secondary" }}
                className={buttonStyles({
                  size: "lg",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Generate Kundli First
              </TrackedLink>
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
                  <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[color:var(--color-ink-muted)]">
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
                {aiContextChips.map((chip) => (
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
        </Container>
      </section>

      <section className="border-b border-black/8 bg-white">
        <Container className="py-12 sm:py-14">
          <div className="max-w-3xl space-y-4">
            <Badge tone="trust" className="w-fit border border-black/8 bg-white">
              Daily Guidance
            </Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-ink-strong)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Daily Guidance for Return Visits
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
              Lightweight daily entry points that keep the homepage useful for
              repeat visits without fabricating content.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dailyGuidanceCards.map((card) => (
              <Card
                key={card.title}
                tone="default"
                interactive
                className="flex h-full flex-col gap-4 border-black/8 bg-white bg-none shadow-[0_14px_36px_rgba(17,24,39,0.06)] before:opacity-0 hover:border-black/12"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {getToolPreviewIcon(
                      card.icon === "consultation" ? "generic" : card.icon,
                      "h-12 w-12",
                      card.icon === "consultation" ? "DR" : undefined,
                    )}
                    <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-ink-strong)]">
                      {card.title}
                    </h3>
                  </div>
                  <span className="rounded-full border border-[rgba(184,137,67,0.24)] px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
                    Daily
                  </span>
                </div>
                <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  {card.description}
                </p>
                <TrackedLink
                  href={localizeHref(card.href)}
                  eventPayload={{ page: "/", feature: card.feature, section: "home-daily-guidance" }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className: "w-full justify-center",
                  })}
                >
                  {card.ctaLabel}
                </TrackedLink>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <GoldSectionDivider tone="light" />

      <section className="border-b border-black/8 bg-white">
        <Container className="py-12 sm:py-14">
          <div className="max-w-3xl space-y-4">
            <Badge tone="trust" className="w-fit border border-black/8 bg-white">
              Premium Reports
            </Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-ink-strong)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Personalized Astrology Reports
            </h2>
            <p className="max-w-3xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
              Career, Marriage, Finance, Health, Life Path and advanced Vedic
              insights prepared from Kundli, Dasha, Transit and planetary
              intelligence.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {premiumReportCards.map((report) => (
              <Card
                key={report.title}
                tone="default"
                interactive
                className="flex h-full flex-col gap-4 border-black/8 bg-white bg-none shadow-[0_14px_36px_rgba(17,24,39,0.06)] before:opacity-0 hover:border-black/12"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {getToolPreviewIcon(report.glyph, "h-12 w-12", report.initials)}
                    <div className="space-y-1">
                      <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
                        {report.title}
                      </h3>
                    </div>
                  </div>
                  <span className="rounded-full border border-[rgba(184,137,67,0.24)] px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
                    {report.status}
                  </span>
                </div>

                <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  {report.description}
                </p>

                <TrackedLink
                  href={localizeHref(report.href)}
                  eventName="report_cta_click"
                  eventPayload={{ page: "/", feature: report.feature, section: "home-reports-preview" }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className: "w-full justify-center",
                  })}
                >
                  {report.ctaLabel}
                </TrackedLink>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <TrackedLink
              href={localizeHref("/reports")}
              eventName="report_cta_click"
              eventPayload={{ page: "/", feature: "home-reports-section-primary" }}
              className={buttonStyles({
                size: "lg",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              View Reports
            </TrackedLink>
            <TrackedLink
              href={localizeHref("/kundli")}
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "home-reports-section-secondary" }}
              className={buttonStyles({
                size: "lg",
                tone: "secondary",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Generate Kundli First
            </TrackedLink>
          </div>
        </Container>
      </section>

      <GoldSectionDivider />

      <section className="border-b border-black/8 bg-white">
        <Container className="py-12 sm:py-14">
          <div className="max-w-3xl space-y-4">
            <Badge tone="trust" className="w-fit border border-black/8 bg-white">
              Authority + Consultation
            </Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-ink-strong)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Guided by JYOTISH BHASKAR JOY PRAKASH SARMAH
            </h2>
            <p className="max-w-3xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
              The guiding astrologer authority behind NAVAGRAHA CENTRE, paired
              with human review for important life decisions.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-stretch">
            <Card className="relative overflow-hidden border border-[rgba(95,135,200,0.24)] bg-[linear-gradient(145deg,#f8fbff_0%,#e8f0ff_55%,#dfeaff_100%)] shadow-[0_18px_44px_rgba(19,53,110,0.12)] before:opacity-0">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(75,118,192,0.16),transparent_32%),radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.48),transparent_24%),radial-gradient(circle_at_72%_82%,rgba(184,137,67,0.12),transparent_30%)]" />
              <div className="relative flex h-full flex-col gap-6 p-5 sm:p-6 lg:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(184,137,67,0.38)] bg-[radial-gradient(circle_at_center,#ffffff_0%,#f2dcaf_100%)] text-[0.95rem] font-semibold tracking-[0.14em] text-[rgba(130,86,25,0.95)] shadow-[0_16px_30px_rgba(37,56,98,0.14)]">
                      <span className="absolute inset-2 rounded-full border border-[rgba(184,137,67,0.24)]" />
                      <span className="absolute inset-4 rotate-45 border border-[rgba(184,137,67,0.18)]" />
                      <span className="relative">JPS</span>
                    </div>
                    <div className="space-y-2">
                      <Badge tone="trust" className="border border-white/55 bg-white/75 text-[color:var(--color-ink-strong)]">
                        Astrologer Authority
                      </Badge>
                      <p className="max-w-md text-[0.68rem] uppercase tracking-[0.14em] text-[rgba(19,53,110,0.74)]">
                        JYOTISH BHASKAR JOY PRAKASH SARMAH
                      </p>
                    </div>
                  </div>
                  <Badge tone="trust" className="border border-[rgba(184,137,67,0.26)] bg-white/85 text-[color:var(--color-ink-strong)]">
                    ???????? 2026
                  </Badge>
                </div>

                <div className="space-y-4">
                  <h3 className="max-w-2xl text-[length:var(--font-size-title-sm)] font-semibold text-[color:var(--color-ink-strong)]">
                    The guiding astrologer authority behind NAVAGRAHA CENTRE.
                  </h3>
                  <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                    Annual Vedic guidance, Rashifal, Panchang insights and
                    life-direction support from the astrologer&apos;s desk.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {authorityHighlights.map((item) => (
                    <Badge
                      key={item}
                      tone="trust"
                      className="border border-white/60 bg-white px-3 py-2 text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--color-ink-strong)] shadow-[0_8px_20px_rgba(17,24,39,0.04)]"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>

                <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <TrackedLink
                    href={localizeHref("/consultation")}
                    eventName="consultation_cta_click"
                    eventPayload={{ page: "/", feature: "home-authority-consult-jps" }}
                    className={buttonStyles({
                      size: "lg",
                      className: "w-full justify-center sm:w-auto",
                    })}
                  >
                    Consult J P Sarmah
                  </TrackedLink>
                  <TrackedLink
                    href={localizeHref("/insights/monthly")}
                    eventName="cta_click"
                    eventPayload={{ page: "/", feature: "home-authority-yearly-guidance" }}
                    className={buttonStyles({
                      size: "lg",
                      tone: "secondary",
                      className: "w-full justify-center sm:w-auto",
                    })}
                  >
                    Explore Yearly Guidance
                  </TrackedLink>
                </div>
              </div>
            </Card>

            <Card className="flex h-full flex-col gap-5 border-black/8 bg-white shadow-[0_16px_38px_rgba(17,24,39,0.06)] before:opacity-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ConsultationIcon className="h-12 w-12" />
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[color:var(--color-ink-muted)]">
                      Consultation
                    </p>
                    <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-ink-strong)]">
                      Human guidance for important life decisions.
                    </p>
                  </div>
                </div>
                <Badge tone="trust">Premium Review</Badge>
              </div>
              <h3 className="text-[length:var(--font-size-title-sm)] font-semibold text-[color:var(--color-ink-strong)]">
                Consult with JYOTISH BHASKAR J P SARMAH
              </h3>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                Human guidance for important life decisions, supported by
                Kundli, Dasha, Transit, Panchang and NAVAGRAHA Intelligence
                context.
              </p>
              <div className="flex flex-wrap gap-2">
                {consultationFocusChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.24)] bg-white px-3 py-2 text-[0.64rem] uppercase tracking-[0.14em] text-[color:var(--color-trust-text)] shadow-[0_8px_20px_rgba(17,24,39,0.04)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TrackedLink
                  href={localizeHref("/consultation")}
                  eventName="consultation_cta_click"
                  eventPayload={{ page: "/", feature: "home-consultation-primary" }}
                  className={buttonStyles({
                    size: "sm",
                    className: "w-full justify-center",
                  })}
                >
                  Book Consultation
                </TrackedLink>
                <TrackedLink
                  href={localizeHref("/kundli")}
                  eventName="cta_click"
                  eventPayload={{ page: "/", feature: "home-consultation-secondary" }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className: "w-full justify-center",
                  })}
                >
                  Generate Kundli First
                </TrackedLink>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <GoldSectionDivider />

      <section className="border-b border-black/8 bg-white">
        <Container className="py-12 sm:py-14">
          <div className="max-w-3xl space-y-4">
            <Badge tone="trust" className="w-fit border border-black/8 bg-white">
              From the Desk
            </Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-ink-strong)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              FROM THE DESK OF J P SARMAH
            </h2>
            <p className="max-w-3xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
              Daily Rashifal, Monthly Rashifal, Yearly Rashifal, Panchang
              guidance, Vedic astrology insights and spiritual remedies are
              published manually from the astrologer&apos;s desk.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {deskPreviewCards.map((card) => (
              <Card
                key={card.title}
                tone="default"
                interactive
                className="flex h-full flex-col gap-4 border-black/8 bg-white bg-none shadow-[0_14px_36px_rgba(17,24,39,0.06)] before:opacity-0 hover:border-black/12"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {getToolPreviewIcon(card.glyph, "h-12 w-12", card.initials)}
                    <div className="space-y-1">
                      <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-muted)]">
                        {card.status}
                      </p>
                      <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
                        {card.title}
                      </h3>
                    </div>
                  </div>
                  <Badge tone="trust">Manual</Badge>
                </div>
                <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  {card.description}
                </p>
                <TrackedLink
                  href={localizeHref(card.href)}
                  eventName={card.feature.includes("shop") ? "shop_cta_click" : "cta_click"}
                  eventPayload={{ page: "/", feature: card.feature, section: "home-desk" }}
                  className={buttonStyles({
                    size: "sm",
                    tone: card.feature.includes("shop") ? "secondary" : "tertiary",
                    className: "w-full justify-center",
                  })}
                >
                  {card.ctaLabel}
                </TrackedLink>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <GoldSectionDivider />

      <section className="border-b border-black/8 bg-white">
        <Container className="py-12 sm:py-14">
          <div className="max-w-3xl space-y-4">
            <Badge tone="trust" className="w-fit border border-black/8 bg-white">
              Future Rails
            </Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-ink-strong)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Future-Ready Premium Rails
            </h2>
            <p className="max-w-3xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
              The platform is being prepared for lessons, videos, commerce, and
              future intelligence tools without pretending those surfaces are
              already complete.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {futureRailCards.map((rail) => (
              <Card
                key={rail.title}
                tone="default"
                className="flex h-full flex-col gap-4 border-black/8 bg-white shadow-[0_14px_36px_rgba(17,24,39,0.06)] before:opacity-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {getToolPreviewIcon(rail.glyph, "h-12 w-12", rail.initials)}
                    <div className="space-y-1">
                      <h3 className="text-[length:var(--font-size-body-lg)] font-semibold text-[color:var(--color-ink-strong)]">
                        {rail.title}
                      </h3>
                    </div>
                  </div>
                  <span className="rounded-full border border-[rgba(184,137,67,0.24)] px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.14em] text-[color:var(--color-accent-strong)]">
                    {rail.statusLabel}
                  </span>
                </div>
                <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  {rail.description}
                </p>
                {rail.ctaMode === "link" ? (
                  <TrackedLink
                    href={rail.href ? localizeHref(rail.href) : localizeHref("/")}
                    eventName="cta_click"
                    eventPayload={{ page: "/", feature: rail.feature, section: "home-future-rails" }}
                    className={buttonStyles({
                      size: "sm",
                      tone: "secondary",
                      className: "w-full justify-center",
                    })}
                  >
                    {rail.ctaLabel}
                  </TrackedLink>
                ) : (
                  <span className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-black/8 bg-white px-[1.125rem] text-[0.72rem] font-medium uppercase tracking-[var(--tracking-label)] text-[color:var(--color-ink-muted)] shadow-[var(--shadow-sm)]">
                    {rail.ctaLabel}
                  </span>
                )}
              </Card>
            ))}
          </div>

          <Card className="mt-8 border border-[rgba(184,137,67,0.18)] bg-white shadow-[0_12px_30px_rgba(17,24,39,0.04)] before:opacity-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <Badge tone="trust">NAVAGRAHA Intelligence</Badge>
                <p className="max-w-3xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  NAVAGRAHA Intelligence tools will expand into Kundli NI,
                  Dasha NI, Transit NI, Panchang NI, Remedy NI, Numerology NI,
                  Vastu NI, Palmistry NI, Career NI, Finance NI, Marriage NI and
                  Business NI.
                </p>
              </div>
              <TrackedLink
                href={localizeHref("/tools")}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "home-future-intelligence-tools" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Explore Tools Hub
              </TrackedLink>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {futureIntelligenceChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-[var(--radius-lg)] border border-[rgba(184,137,67,0.18)] bg-white px-3 py-2 text-[length:var(--font-size-body-xs)] uppercase tracking-[0.12em] text-[color:var(--color-ink-strong)]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </Card>
        </Container>
      </section>

      <GoldSectionDivider />

      <section className="bg-white">
        <Container className="py-12 sm:py-14">
          <Card className="border-black/8 bg-white shadow-[0_18px_44px_rgba(17,24,39,0.06)] before:opacity-0">
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="space-y-4">
                <Badge tone="trust">Begin Your Journey</Badge>
                <h2
                  className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-ink-strong)]"
                  style={{
                    letterSpacing: "var(--tracking-display)",
                    lineHeight: "var(--line-height-tight)",
                  }}
                >
                  Begin Your Journey of Self-Discovery
                </h2>
                <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-ink-body)]">
                  The stars have answers. Let&apos;s help you find them.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:flex-col xl:flex-row">
                <TrackedLink
                  href={localizeHref("/kundli")}
                  eventName="cta_click"
                  eventPayload={{ page: "/", feature: "final-cta-kundli" }}
                  className={buttonStyles({
                    size: "lg",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Generate Your Kundli
                </TrackedLink>
                <TrackedLink
                  href={localizeHref("/consultation")}
                  eventName="consultation_cta_click"
                  eventPayload={{ page: "/", feature: "final-cta-consultation" }}
                  className={buttonStyles({
                    size: "lg",
                    tone: "secondary",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Consult an Astrologer
                </TrackedLink>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </>
  );
}

