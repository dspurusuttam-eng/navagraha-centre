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
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { contentTypeLabels } from "@/modules/content";
import { curatedContentEntries } from "@/modules/content/catalog";
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import { globalCtaCopy } from "@/modules/localization/copy";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { TrustIndicatorStrip } from "@/modules/marketing/components/trust-conversion-sections";
import { listFeaturedShopProducts } from "@/modules/shop";

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

type HomeCardItem = {
  icon: HomeIcon;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  feature: string;
};

function formatPublishedDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    dateStyle: "medium",
  });
}

function getHomeIcon(icon: HomeIcon, className?: string) {
  switch (icon) {
    case "kundli":
      return <KundliIcon className={className} />;
    case "ai":
      return <NavagrahaAiIcon className={className} />;
    case "rashifal":
      return <RashifalIcon className={className} />;
    case "reports":
      return <ReportIcon className={className} />;
    case "consultation":
      return <ConsultationIcon className={className} />;
    case "numerology":
      return <NumerologyIcon className={className} />;
    case "panchang":
      return <PanchangIcon className={className} />;
    case "calculators":
      return <CalculatorIcon className={className} />;
    default:
      return <KundliIcon className={className} />;
  }
}

const trustItems = [
  "Lahiri Sidereal Foundation",
  "Swiss Ephemeris Calculation",
  "Chart-Aware AI",
  "Human-Guided Consultation",
  "Privacy Protected",
] as const;

const utilities: readonly HomeCardItem[] = [
  {
    icon: "kundli",
    title: "Kundli Generator",
    description: "Create a clean sidereal birth chart with Lagna, houses, and planetary context.",
    href: "/kundli",
    ctaLabel: "Generate Kundli",
    feature: "home-utility-kundli",
  },
  {
    icon: "rashifal",
    title: "Daily Rashifal",
    description: "Read practical daily guidance for all zodiac signs in a calm editorial format.",
    href: "/rashifal",
    ctaLabel: "Open Rashifal",
    feature: "home-utility-rashifal",
  },
  {
    icon: "panchang",
    title: "Panchang",
    description: "Check Tithi, Nakshatra, Yoga, Karana, sunrise, sunset, and daily context.",
    href: "/panchang",
    ctaLabel: "Open Panchang",
    feature: "home-utility-panchang",
  },
  {
    icon: "numerology",
    title: "Numerology",
    description: "Explore name and date-of-birth numbers with structured life guidance.",
    href: "/numerology",
    ctaLabel: "Open Numerology",
    feature: "home-utility-numerology",
  },
  {
    icon: "calculators",
    title: "Calculators",
    description: "Use quick tools for Moon sign, Nakshatra, Lagna, and related astrology checks.",
    href: "/calculators",
    ctaLabel: "Open Calculators",
    feature: "home-utility-calculators",
  },
  {
    icon: "panchang",
    title: "Muhurta / Time Tools",
    description: "Review Rahu Kaal, Gulika Kaal, Yamaganda, and Abhijit Muhurta.",
    href: "/muhurta",
    ctaLabel: "Check Timing",
    feature: "home-utility-muhurta",
  },
  {
    icon: "consultation",
    title: "Compatibility",
    description: "Start relationship and marriage matching with structured Vedic compatibility signals.",
    href: "/compatibility",
    ctaLabel: "Check Compatibility",
    feature: "home-utility-compatibility",
  },
] as const;

const aiTools: readonly HomeCardItem[] = [
  {
    icon: "kundli",
    title: "Kundli AI",
    description: "Ask chart-grounded questions after generating or reviewing your Kundli.",
    href: "/kundli-ai",
    ctaLabel: "Open Kundli AI",
    feature: "home-ai-kundli",
  },
  {
    icon: "numerology",
    title: "Numerology AI",
    description: "Turn core number patterns into readable guidance without exaggerated claims.",
    href: "/numerology",
    ctaLabel: "Explore Numerology",
    feature: "home-ai-numerology",
  },
  {
    icon: "consultation",
    title: "Marriage Compatibility AI",
    description: "Review relationship themes through a structured compatibility lens.",
    href: "/compatibility",
    ctaLabel: "Check Compatibility",
    feature: "home-ai-compatibility",
  },
  {
    icon: "reports",
    title: "Career Guidance AI",
    description: "Explore career direction through report-ready chart interpretation pathways.",
    href: "/career-prediction",
    ctaLabel: "Explore Career",
    feature: "home-ai-career",
  },
  {
    icon: "reports",
    title: "Finance AI",
    description: "Use finance guidance as reflective astrology context, not guaranteed outcomes.",
    href: "/finance-report",
    ctaLabel: "View Finance",
    feature: "home-ai-finance",
  },
  {
    icon: "reports",
    title: "Health AI",
    description: "Read wellness-oriented astrology guidance with clear professional-advice boundaries.",
    href: "/health-report",
    ctaLabel: "View Health",
    feature: "home-ai-health",
  },
  {
    icon: "rashifal",
    title: "Daily Prediction AI",
    description: "Use daily prompts for planning, reflection, and calm decision pacing.",
    href: "/ai?tool=daily-guidance",
    ctaLabel: "Ask Daily AI",
    feature: "home-ai-daily",
  },
] as const;

const predictiveCore = [
  {
    title: "Dasha Timing",
    description: "Major, sub, and day-level timing layers help interpretation stay sequence-aware.",
  },
  {
    title: "Transit Context",
    description: "Current planetary movement is kept separate from birth-chart structure before synthesis.",
  },
  {
    title: "Yoga / Rule Engine",
    description: "Rule-based signals create a disciplined foundation before narrative interpretation.",
  },
  {
    title: "Predictive Synthesis",
    description: "Outputs combine timing, transit, rules, and context into balanced guidance.",
  },
  {
    title: "Report + Assistant Grounding",
    description: "Reports and AI prompts are grounded in structured chart data instead of invented details.",
  },
] as const;

const dailyDashboard = [
  {
    title: "Today's Rashifal",
    description: "Start with zodiac-wise daily guidance.",
    href: "/rashifal",
    feature: "home-daily-rashifal",
  },
  {
    title: "Today's Panchang",
    description: "Check the daily Tithi, Nakshatra, Yoga, and Karana.",
    href: "/panchang",
    feature: "home-daily-panchang",
  },
  {
    title: "Muhurta / Time Tools",
    description: "Review practical caution and better-time windows.",
    href: "/muhurta",
    feature: "home-daily-muhurta",
  },
  {
    title: "Daily AI Guidance",
    description: "Ask for a calm daily planning prompt.",
    href: "/ai?tool=daily-guidance",
    feature: "home-daily-ai",
  },
] as const;

const reportCards = [
  {
    title: "Career Report",
    description: "Direction, strengths, timing context, and decision guidance.",
    href: "/career-report",
  },
  {
    title: "Marriage Report",
    description: "Relationship, compatibility, and commitment-oriented guidance.",
    href: "/marriage-compatibility",
  },
  {
    title: "Finance Report",
    description: "Reflective finance themes, timing cautions, and planning context.",
    href: "/finance-report",
  },
  {
    title: "Health Report",
    description: "Wellness-oriented astrology guidance with clear safety boundaries.",
    href: "/health-report",
  },
  {
    title: "Full Kundli Report",
    description: "A deeper overview of chart structure, timing, and practical themes.",
    href: "/reports",
  },
  {
    title: "Yearly Prediction",
    description: "Use the reports hub for longer-range timing and synthesis pathways.",
    href: "/reports",
  },
] as const;

const faqItems = [
  {
    question: "How accurate is the chart?",
    answer:
      "Chart accuracy depends on correct birth date, time, place, timezone, and the deterministic calculation layer. Interpretation quality improves when the input data is complete.",
  },
  {
    question: "Is NAVAGRAHA AI generic?",
    answer:
      "No. The AI layer is designed to use structured astrology context and safety rules instead of inventing chart details.",
  },
  {
    question: "Is my birth data private?",
    answer:
      "The platform is designed with privacy-safe handling and avoids exposing sensitive birth data in public analytics or logs.",
  },
  {
    question: "Are remedies guaranteed?",
    answer:
      "No. Remedies are optional spiritual supports and are never presented as guaranteed outcomes or replacements for professional advice.",
  },
  {
    question: "What is free and what is premium?",
    answer:
      "Core tools currently provide free launch value. Deeper reports, consultations, shop products, and future premium AI paths are kept separate and clearly labeled.",
  },
  {
    question: "Can I book a human consultation?",
    answer:
      "Yes. Consultation is the human-led path for nuanced, personal, and context-heavy interpretation with Joy Prakash Sarmah.",
  },
] as const;

function mapFeatureToEvent(feature: string) {
  if (feature.includes("panchang")) {
    return "panchang_tool_click" as const;
  }

  if (feature.includes("numerology")) {
    return "numerology_tool_click" as const;
  }

  if (feature.includes("calculators")) {
    return "calculator_tool_click" as const;
  }

  if (feature.includes("muhurta")) {
    return "muhurta_tool_click" as const;
  }

  return "utility_card_click" as const;
}

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

  const featuredInsights = [...curatedContentEntries]
    .filter((entry) => entry.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 3);
  const featuredProducts = listFeaturedShopProducts().slice(0, 3);

  return (
    <>
      <PageViewTracker page="/" feature="home-page" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />

      <section className="relative overflow-hidden border-b border-[color:var(--color-border)] bg-[linear-gradient(180deg,#fffefb_0%,#fdf8ef_55%,#fbf1df_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(214,171,95,0.2),transparent_32%),radial-gradient(circle_at_86%_8%,rgba(219,178,121,0.16),transparent_30%),radial-gradient(circle_at_74%_86%,rgba(198,148,86,0.12),transparent_36%)]" />
        <Container className="relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] lg:items-center lg:py-20">
          <div className="home-reveal home-reveal-delay-1 space-y-6">
            <div className="space-y-4">
              <h1
                className="max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-md)] text-[var(--color-ink-strong)] sm:text-[length:var(--font-size-display-lg)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Premium Vedic Astrology with NAVAGRAHA AI and Human-Guided Trust
              </h1>
              <p className="max-w-[42rem] text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                Generate your Kundli, read daily Rashifal and Panchang, ask chart-aware AI questions, and continue into reports or consultation when deeper interpretation is needed.
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
                {globalCtaCopy.generateKundli}
              </TrackedLink>
              <TrackedLink
                href={localizeHref("/ai")}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "hero-secondary-ai" }}
                className={buttonStyles({
                  size: "lg",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Explore NAVAGRAHA AI
              </TrackedLink>
              <TrackedLink
                href={localizeHref("/consultation")}
                eventName="consultation_cta_click"
                eventPayload={{ page: "/", placement: "hero-tertiary" }}
                className={buttonStyles({
                  size: "lg",
                  tone: "ghost",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Book Consultation
              </TrackedLink>
            </div>
          </div>

          <Card className="home-reveal home-reveal-delay-2 home-polish-surface border-[rgba(184,137,67,0.28)] bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(252,244,232,0.94)_56%,rgba(246,232,209,0.9)_100%)] shadow-[0_26px_60px_rgba(95,67,28,0.14)]">
            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-center">
              <div className="space-y-4">
                <Badge tone="trust">Chart-Based Guidance</Badge>
                <h2
                  className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[var(--color-ink-strong)]"
                  style={{ letterSpacing: "var(--tracking-display)" }}
                >
                  Sacred geometry, deterministic calculation, structured interpretation.
                </h2>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                  The homepage introduces the platform without fake planetary positions or exaggerated certainty. The chart is calculated only from real user input.
                </p>
              </div>

              <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full border border-[rgba(184,137,67,0.38)] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.98)_0%,rgba(248,235,210,0.88)_58%,rgba(232,205,156,0.34)_100%)] shadow-[0_14px_30px_rgba(113,81,33,0.16)]">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-[rgba(184,137,67,0.34)]">
                  <span className="absolute h-24 w-24 rotate-45 border border-[rgba(184,137,67,0.3)]" />
                  <span className="absolute h-20 w-20 rounded-full border border-[rgba(184,137,67,0.24)]" />
                  <span className="absolute left-1/2 top-1/2 h-0.5 w-28 -translate-x-1/2 -translate-y-1/2 bg-[rgba(184,137,67,0.2)]" />
                  <span className="absolute left-1/2 top-1/2 h-28 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-[rgba(184,137,67,0.16)]" />
                  <span className="text-center text-[0.62rem] uppercase tracking-[0.16em] text-[var(--color-trust-text)]">
                    NAVAGRAHA
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      <TrustIndicatorStrip items={trustItems} />

      <Section
        tone="light"
        category="utilities"
        eyebrow="Core Astrology Utilities"
        title="Free practical tools for daily astrology decisions."
        description="Utilities stay separate from reports, consultation, AI upgrades, and shop products so the free value path remains clear."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {utilities.map((tool) => (
            <Card key={tool.title} tone="light" interactive className="flex h-full flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                {getHomeIcon(tool.icon)}
                <Badge tone="neutral">Utility</Badge>
              </div>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {tool.title}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {tool.description}
              </p>
              <TrackedLink
                href={localizeHref(tool.href)}
                eventName={mapFeatureToEvent(tool.feature)}
                eventPayload={{ page: "/", feature: tool.feature }}
                className={buttonStyles({
                  size: "sm",
                  tone: "tertiary",
                  className: "w-full justify-center",
                })}
              >
                {tool.ctaLabel}
              </TrackedLink>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="contrast"
        category="ai"
        eyebrow="NAVAGRAHA AI"
        title="A flagship intelligence layer for chart-aware astrology guidance."
        description="NAVAGRAHA AI is positioned as the premium interpretation layer, while calculations remain deterministic and grounded in structured astrology data."
      >
        <Card tone="accent" className="border-[var(--color-section-contrast-edge)] bg-[linear-gradient(155deg,rgba(255,250,240,0.96)_0%,rgba(249,236,208,0.9)_52%,rgba(241,222,189,0.92)_100%)]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {aiTools.map((tool) => (
                <TrackedLink
                  key={tool.title}
                  href={localizeHref(tool.href)}
                  eventName="premium_ai_cta_click"
                  eventPayload={{ page: "/", feature: tool.feature }}
                  className="rounded-[var(--radius-lg)] border border-[rgba(184,137,67,0.28)] bg-[rgba(255,255,255,0.86)] px-4 py-3 transition [transition-duration:var(--motion-duration-base)] hover:border-[rgba(184,137,67,0.44)]"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    {getHomeIcon(tool.icon, "h-9 w-9")}
                    <Badge tone="neutral">AI Tool</Badge>
                  </div>
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                    {tool.title}
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                    {tool.description}
                  </p>
                  <p className="mt-3 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
                    {tool.ctaLabel}
                  </p>
                </TrackedLink>
              ))}
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-[15rem]">
              <TrackedLink
                href={localizeHref("/ai")}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "ai-flagship-primary" }}
                className={buttonStyles({ size: "lg", className: "w-full justify-center" })}
              >
                Try NAVAGRAHA AI
              </TrackedLink>
              <TrackedLink
                href={localizeHref("/kundli")}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "ai-flagship-kundli-first" }}
                className={buttonStyles({
                  size: "lg",
                  tone: "secondary",
                  className: "w-full justify-center",
                })}
              >
                Generate Kundli First
              </TrackedLink>
            </div>
          </div>
        </Card>
      </Section>

      <Section
        tone="light"
        category="ai"
        eyebrow="Predictive Intelligence Core"
        title="Not generic AI: the interpretation layer is built around astrology structure."
        description="The platform separates calculation, timing, rules, and synthesis so guidance can remain more grounded and explainable."
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <Card tone="light" className="flex h-full flex-col justify-between gap-6">
            <div className="space-y-4">
              <Badge tone="trust">Structured Synthesis</Badge>
              <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                Predictive intelligence is presented carefully: timing signals, transit context, rule-based indicators, and report grounding support guidance without deterministic overclaiming.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <TrackedLink
                href={localizeHref("/reports")}
                eventName="report_cta_click"
                eventPayload={{ page: "/", placement: "predictive-core" }}
                className={buttonStyles({ size: "sm", className: "w-full justify-center sm:w-auto" })}
              >
                Explore Predictive Reports
              </TrackedLink>
              <TrackedLink
                href={localizeHref("/ai")}
                eventName="premium_ai_cta_click"
                eventPayload={{ page: "/", placement: "predictive-core" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Ask My Chart
              </TrackedLink>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {predictiveCore.map((item) => (
              <Card key={item.title} tone="light" className="space-y-3 p-4 sm:p-5">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  {item.title}
                </p>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section
        tone="muted"
        category="utilities"
        eyebrow="Daily Astrology Dashboard"
        title="A clean daily return panel for Rashifal, Panchang, timing, and AI guidance."
        description="This section supports repeat usage without adding a new retention engine in this phase."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dailyDashboard.map((item) => (
            <TrackedLink
              key={item.title}
              href={localizeHref(item.href)}
              eventName="daily_insight_view"
              eventPayload={{ page: "/", feature: item.feature }}
              className="rounded-[var(--radius-card)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.9)] p-5 shadow-[var(--shadow-card-soft)] transition [transition-duration:var(--motion-duration-base)] hover:-translate-y-0.5 hover:border-[rgba(184,137,67,0.34)]"
            >
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                {item.title}
              </p>
              <p className="mt-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.description}
              </p>
            </TrackedLink>
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        category="services"
        eyebrow="Premium Reports"
        title="Deeper report pathways stay separate from free utility tools."
        description="Reports are framed as premium interpretation layers with preview-first value and clear boundaries."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reportCards.map((report) => (
            <Card key={report.title} tone="light" interactive className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <ReportIcon />
                <Badge tone="trust">Report</Badge>
              </div>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {report.title}
              </h3>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {report.description}
              </p>
              <TrackedLink
                href={localizeHref(report.href)}
                eventName="report_cta_click"
                eventPayload={{ page: "/", feature: report.title }}
                className={buttonStyles({
                  size: "sm",
                  tone: "tertiary",
                  className: "w-full justify-center",
                })}
              >
                View Reports
              </TrackedLink>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="muted"
        category="services"
        eyebrow="Consultation"
        title="Human interpretation led by Joy Prakash Sarmah."
        description="AI can organize questions quickly. Human consultation is for nuance, context, sensitive timing, and deeper personal interpretation."
      >
        <Card tone="accent" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-4">
            <Badge tone="trust">Vedic Astrologer and Spiritual Guide</Badge>
            <p className="max-w-3xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Book consultation when your question needs personal context, follow-up, and careful interpretive judgment beyond a short tool output.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Human-led review", "Chart-aware discussion", "Calm remedy framing"].map((item) => (
                <span
                  key={item}
                  className="rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.72)] px-3 py-2 text-center text-[0.66rem] uppercase tracking-[0.14em] text-[var(--color-trust-text)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <TrackedLink
            href={localizeHref("/consultation")}
            eventName="consultation_cta_click"
            eventPayload={{ page: "/", placement: "consultation-section" }}
            className={buttonStyles({
              size: "lg",
              className: "w-full justify-center lg:w-auto",
            })}
          >
            Book Consultation
          </TrackedLink>
        </Card>
      </Section>

      <Section
        tone="light"
        category="content"
        eyebrow="From the Desk of J P Sarmah"
        title="Editorial guidance, Daily Rashifal, remedies, and long-term astrology authority."
        description="Content is positioned as a trust and learning layer, separate from utility tools and service conversion."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {featuredInsights.map((entry) => (
            <Card key={entry.slug} tone="light" interactive className="h-full space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Badge tone="trust">{contentTypeLabels[entry.type]}</Badge>
                <span className="text-[0.66rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  {entry.readingTimeMinutes} min
                </span>
              </div>
              <p className="text-[0.66rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                {entry.authorName} | {formatPublishedDate(entry.publishedAt)}
              </p>
              <h3
                className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]"
                style={{ letterSpacing: "var(--tracking-display)" }}
              >
                {entry.title}
              </h3>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {entry.excerpt}
              </p>
              <TrackedLink
                href={localizeHref(entry.path)}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: `insight-open-${entry.slug}` }}
                className={buttonStyles({
                  size: "sm",
                  tone: "tertiary",
                  className: "w-full justify-center",
                })}
              >
                Read Insight
              </TrackedLink>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <TrackedLink
            href={localizeHref("/from-the-desk")}
            eventName="cta_click"
            eventPayload={{ page: "/", feature: "from-the-desk-index" }}
            className={buttonStyles({ size: "sm", className: "w-full justify-center sm:w-auto" })}
          >
            Visit From the Desk
          </TrackedLink>
          <TrackedLink
            href={localizeHref("/insights/monthly")}
            eventName="cta_click"
            eventPayload={{ page: "/", feature: "monthly-forecast-index" }}
            className={buttonStyles({
              size: "sm",
              tone: "secondary",
              className: "w-full justify-center sm:w-auto",
            })}
          >
            Monthly Forecast
          </TrackedLink>
        </div>
      </Section>

      <Section
        tone="muted"
        category="services"
        eyebrow="Shop Preview"
        title="Spiritual products stay optional, calm, and consultation-aware."
        description="Rudraksha, gemstones, malas, yantras, and devotional supports are presented as secondary spiritual products, not fear-based prescriptions."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <Card key={product.slug} tone="light" interactive className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Badge tone="trust">{product.categoryLabel}</Badge>
                <span className="text-[0.66rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  {product.priceLabel}
                </span>
              </div>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {product.name}
              </h3>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {product.summary}
              </p>
              <TrackedLink
                href={localizeHref(product.href)}
                eventName="shop_cta_click"
                eventPayload={{ page: "/", feature: product.slug }}
                className={buttonStyles({
                  size: "sm",
                  tone: "tertiary",
                  className: "w-full justify-center",
                })}
              >
                View Product
              </TrackedLink>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <TrackedLink
            href={localizeHref("/shop")}
            eventName="shop_cta_click"
            eventPayload={{ page: "/", placement: "shop-preview" }}
            className={buttonStyles({ size: "sm", tone: "secondary" })}
          >
            Explore Spiritual Shop
          </TrackedLink>
        </div>
      </Section>

      <Section
        tone="light"
        eyebrow="FAQ"
        title="Trust questions answered before users go deeper."
        description="Short answers keep expectations clear without turning the homepage into a legal document."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {faqItems.map((item) => (
            <Card key={item.question} tone="light" className="space-y-3">
              <h3 className="text-[length:var(--font-size-body-md)] font-medium text-[var(--color-ink-strong)]">
                {item.question}
              </h3>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.answer}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0" tone="transparent">
        <Card
          tone="accent"
          className="border-[rgba(184,137,67,0.35)] bg-[linear-gradient(160deg,rgba(255,252,246,0.98)_0%,rgba(246,232,206,0.94)_58%,rgba(239,222,193,0.96)_100%)] shadow-[var(--shadow-md)] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8"
        >
          <div className="space-y-4">
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[var(--color-ink-strong)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Start with your Kundli. Continue with NAVAGRAHA AI.
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Begin with accurate birth details, then choose AI guidance, reports, or human consultation based on the depth you need.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
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
              href={localizeHref("/ai")}
              eventName="premium_ai_cta_click"
              eventPayload={{ page: "/", feature: "final-cta-ai" }}
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
