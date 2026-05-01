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
import { defaultLocale, getLocalizedPath } from "@/modules/localization/config";
import { globalCtaCopy } from "@/modules/localization/copy";
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

type HomeCardItem = {
  icon: HomeIcon;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  feature: string;
};

type TrustItem = {
  icon: HomeIcon;
  label: string;
  description: string;
};

type ServiceCard = HomeCardItem & {
  label: string;
};

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

const heroTrustItems: readonly TrustItem[] = [
  {
    icon: "consultation",
    label: "Trusted Guidance for Generations",
    description: "A calm human astrology tradition with modern platform support.",
  },
  {
    icon: "panchang",
    label: "Accurate Vedic Calculations",
    description: "Structured chart, Panchang, and timing tools stay calculation-led.",
  },
  {
    icon: "kundli",
    label: "Secure & Private",
    description: "Birth details are handled with privacy-safe production rules.",
  },
  {
    icon: "ai",
    label: "Tools Available 24/7",
    description: "Use self-guided utilities and NAVAGRAHA AI entry points anytime.",
  },
] as const;

const utilities: readonly HomeCardItem[] = [
  {
    icon: "kundli",
    title: "Kundli",
    description: "Generate a sidereal birth chart with Lagna, houses, and planetary context.",
    href: "/kundli",
    ctaLabel: "Explore",
    feature: "home-utility-kundli",
  },
  {
    icon: "consultation",
    title: "Compatibility",
    description: "Review relationship and marriage matching through structured Vedic signals.",
    href: "/compatibility",
    ctaLabel: "Explore",
    feature: "home-utility-compatibility",
  },
  {
    icon: "rashifal",
    title: "Rashifal",
    description: "Read daily zodiac guidance with Love, Career, Business, and lucky indicators.",
    href: "/rashifal",
    ctaLabel: "Explore",
    feature: "home-utility-rashifal",
  },
  {
    icon: "panchang",
    title: "Panchang",
    description: "Check Tithi, Nakshatra, Yoga, Karana, sunrise, sunset, and day context.",
    href: "/panchang",
    ctaLabel: "Explore",
    feature: "home-utility-panchang",
  },
  {
    icon: "numerology",
    title: "Numerology",
    description: "Understand birth, destiny, and name-number patterns in a clean utility flow.",
    href: "/numerology",
    ctaLabel: "Explore",
    feature: "home-utility-numerology",
  },
  {
    icon: "calculators",
    title: "Calculators",
    description: "Use quick tools for Moon sign, Nakshatra, Lagna, and related checks.",
    href: "/calculators",
    ctaLabel: "Explore",
    feature: "home-utility-calculators",
  },
  {
    icon: "panchang",
    title: "Muhurta / Time Tools",
    description: "Review Rahu Kaal, Gulika Kaal, Yamaganda, and Abhijit Muhurta.",
    href: "/muhurta",
    ctaLabel: "Explore",
    feature: "home-utility-muhurta",
  },
] as const;

const aiFeatureChips = [
  "Deep Chart Analysis",
  "Personalized Answers",
  "24/7 Guidance Tools",
  "Vedic Accuracy",
  "Human + AI Intelligence",
] as const;

const serviceCards: readonly ServiceCard[] = [
  {
    icon: "reports",
    label: "Premium Service",
    title: "Premium Reports",
    description: "In-depth life analysis reports with chart-aware interpretation and clear next steps.",
    href: "/reports",
    ctaLabel: "Explore Reports",
    feature: "home-service-reports",
  },
  {
    icon: "consultation",
    label: "Human Guidance",
    title: "Consultation",
    description: "Personal guidance by Joy Prakash Sarmah for nuanced questions and deeper review.",
    href: "/consultation",
    ctaLabel: "Book Consultation",
    feature: "home-service-consultation",
  },
  {
    icon: "reports",
    label: "Editorial Desk",
    title: "From the Desk of J P Sarmah",
    description: "Articles, remedies, Rashifal context, and spiritual guidance from the editorial desk.",
    href: "/from-the-desk",
    ctaLabel: "Read Insights",
    feature: "home-service-content",
  },
  {
    icon: "kundli",
    label: "Spiritual Products",
    title: "Spiritual Support Shop",
    description: "Optional Rudraksha, gemstones, malas, yantras, and devotional support products.",
    href: "/shop",
    ctaLabel: "Visit Shop",
    feature: "home-service-shop",
  },
] as const;

const credibilityItems = [
  "A Legacy of Vedic Guidance",
  "Accurate Vedic Calculations",
  "Expert Astrology Guidance",
  "Secure & Confidential",
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

function mapServiceToEvent(feature: string) {
  if (feature.includes("consultation")) {
    return "consultation_cta_click" as const;
  }

  if (feature.includes("shop")) {
    return "shop_cta_click" as const;
  }

  if (feature.includes("reports")) {
    return "report_cta_click" as const;
  }

  return "cta_click" as const;
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

  return (
    <>
      <PageViewTracker page="/" feature="home-page" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />

      <section className="relative overflow-hidden border-b border-[color:var(--color-border)] bg-[linear-gradient(180deg,#fffefb_0%,#fff8ea_50%,#f7ead2_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(185,139,70,0.2),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(232,198,135,0.2),transparent_30%),radial-gradient(circle_at_72%_88%,rgba(185,139,70,0.14),transparent_36%)]" />
        <Container className="relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] lg:items-center lg:py-20">
          <div className="home-reveal home-reveal-delay-1 space-y-7">
            <Badge tone="trust">VEDIC WISDOM. MODERN INTELLIGENCE.</Badge>
            <div className="space-y-5">
              <h1
                className="max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-md)] text-[var(--color-ink-strong)] sm:text-[length:var(--font-size-display-lg)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Discover Your Destiny. Unlock Your True Potential.
              </h1>
              <p className="max-w-[42rem] text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                Authentic Vedic astrology guidance powered by ancient wisdom,
                intelligent technology, and expert human insight.
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
                eventName="premium_ai_cta_click"
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

          <Card className="home-reveal home-reveal-delay-2 border-[rgba(184,137,67,0.3)] bg-[linear-gradient(160deg,rgba(255,255,255,0.97)_0%,rgba(252,244,232,0.95)_56%,rgba(245,229,199,0.94)_100%)] shadow-[0_26px_60px_rgba(95,67,28,0.14)]">
            <div className="relative mx-auto flex min-h-[24rem] max-w-[30rem] items-center justify-center">
              <div className="absolute inset-6 rounded-full border border-[rgba(184,137,67,0.22)]" />
              <div className="absolute inset-12 rounded-full border border-[rgba(184,137,67,0.28)]" />
              <div className="absolute inset-20 rotate-45 border border-[rgba(184,137,67,0.26)]" />
              <div className="absolute left-1/2 top-1/2 h-[19rem] w-px -translate-x-1/2 -translate-y-1/2 bg-[rgba(184,137,67,0.16)]" />
              <div className="absolute left-1/2 top-1/2 h-px w-[19rem] -translate-x-1/2 -translate-y-1/2 bg-[rgba(184,137,67,0.16)]" />
              <div className="relative z-10 flex h-48 w-48 items-center justify-center rounded-full border border-[rgba(184,137,67,0.4)] bg-[radial-gradient(circle_at_center,#fffdf8_0%,#f9ecd2_62%,rgba(232,198,135,0.45)_100%)] shadow-[0_18px_42px_rgba(113,81,33,0.18)]">
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border border-[rgba(184,137,67,0.38)] text-center">
                  <span className="text-[0.62rem] uppercase tracking-[0.24em] text-[var(--color-trust-text)]">
                    NAVAGRAHA
                  </span>
                  <span className="mt-2 h-px w-12 bg-[rgba(184,137,67,0.45)]" />
                  <span className="mt-2 text-[0.58rem] uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                    Vedic Chart
                  </span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.24)] bg-[rgba(255,253,248,0.82)] p-4 text-center shadow-[var(--shadow-sm)] backdrop-blur-sm">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  Golden zodiac wheel, sacred geometry, and chart-line motif.
                </p>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      <section className="border-b border-[color:var(--color-border)] bg-[rgba(255,253,248,0.94)] py-5">
        <Container>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {heroTrustItems.map((item) => (
              <div
                key={item.label}
                className="trust-strip-item flex min-w-0 items-start gap-3 rounded-[var(--radius-xl)] p-4"
              >
                {getHomeIcon(item.icon, "h-10 w-10 shrink-0")}
                <div className="min-w-0">
                  <p className="mobile-safe-text text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[length:var(--font-size-body-xs)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Section tone="light" category="content" contentClassName="py-0">
        <Card tone="accent" className="grid gap-6 border-[rgba(184,137,67,0.32)] lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <div className="flex items-center justify-center gap-4 sm:justify-start">
            {[
              { monogram: "JPS", label: "Joy Prakash Sarmah" },
              { monogram: "HS", label: "Hemeswar Sarmah legacy" },
            ].map((profile) => (
              <div key={profile.monogram} className="text-center">
                <div
                  aria-label="Astrologer profile portrait placeholder"
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(184,137,67,0.38)] bg-[radial-gradient(circle_at_center,#fffdf7_0%,#f5e4c2_100%)] font-[family-name:var(--font-display)] text-[1rem] tracking-[0.16em] text-[var(--color-trust-text)] shadow-[var(--shadow-sm)]"
                >
                  {profile.monogram}
                </div>
                <p className="mt-2 max-w-28 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
                  {profile.label}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-3 text-center lg:text-left">
            <Badge tone="trust">Authority / Legacy</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[var(--color-ink-strong)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Guided by Joy Prakash Sarmah, with reverence for the legacy of Hemeswar Sarmah.
            </h2>
            <p className="mx-auto max-w-3xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)] lg:mx-0">
              NAVAGRAHA CENTRE presents astrology as a serious guidance tradition:
              chart-aware, privacy-conscious, and supported by both human interpretation
              and intelligent tools.
            </p>
          </div>
        </Card>
      </Section>

      <Section
        tone="light"
        category="utilities"
        eyebrow="Explore Core Astrology Utilities"
        title="Practical Vedic astrology tools, clearly separated from premium services."
        description="Start with free utility paths for chart generation, daily guidance, timing, numerology, compatibility, and quick calculators."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {utilities.map((tool) => (
            <Card key={tool.title} tone="light" interactive className="flex h-full flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                {getHomeIcon(tool.icon)}
                <Badge tone="neutral">Utility</Badge>
              </div>
              <h3 className="mobile-safe-text text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
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

        <div className="mt-6">
          <TrackedLink
            href={localizeHref("/tools")}
            eventName="cta_click"
            eventPayload={{ page: "/", feature: "home-view-all-utilities" }}
            className={buttonStyles({
              size: "sm",
              tone: "secondary",
              className: "w-full justify-center sm:w-auto",
            })}
          >
            View All Utilities
          </TrackedLink>
        </div>
      </Section>

      <Section
        tone="muted"
        category="ai"
        eyebrow="NAVAGRAHA AI"
        title="Ask Anything. Get Intelligent Answers."
        description="AI-powered astrology insights based on your birth chart and Vedic wisdom, presented in a light premium guidance layer."
      >
        <Card tone="accent" className="border-[rgba(184,137,67,0.34)] bg-[linear-gradient(150deg,rgba(255,254,249,0.98)_0%,rgba(249,235,207,0.95)_58%,rgba(242,222,187,0.94)_100%)]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] lg:items-center">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {aiFeatureChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.26)] bg-[rgba(255,255,255,0.72)] px-3 py-2 text-[0.66rem] uppercase tracking-[0.14em] text-[var(--color-trust-text)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <p className="max-w-3xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                NAVAGRAHA AI is positioned as chart-aware guidance, not a generic
                chatbot. It helps users move from Kundli context into structured
                questions about life direction, timing, daily planning, and next steps.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <TrackedLink
                  href={localizeHref("/ai")}
                  eventName="premium_ai_cta_click"
                  eventPayload={{ page: "/", feature: "ai-light-panel-primary" }}
                  className={buttonStyles({
                    size: "lg",
                    className: "w-full justify-center sm:w-auto",
                  })}
                >
                  Chat with NAVAGRAHA AI
                </TrackedLink>
                <TrackedLink
                  href={localizeHref("/kundli")}
                  eventName="cta_click"
                  eventPayload={{ page: "/", feature: "ai-light-panel-kundli" }}
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

            <div className="relative mx-auto flex min-h-[18rem] w-full max-w-[22rem] items-center justify-center">
              <div className="absolute inset-3 rounded-full border border-[rgba(184,137,67,0.2)]" />
              <div className="absolute inset-10 rounded-full border border-dashed border-[rgba(184,137,67,0.34)]" />
              <div className="absolute left-8 top-8 h-3 w-3 rounded-full bg-[rgba(184,137,67,0.75)]" />
              <div className="absolute right-10 top-14 h-3 w-3 rounded-full bg-[rgba(184,137,67,0.58)]" />
              <div className="absolute bottom-12 left-12 h-3 w-3 rounded-full bg-[rgba(184,137,67,0.52)]" />
              <div className="absolute bottom-8 right-14 h-3 w-3 rounded-full bg-[rgba(184,137,67,0.68)]" />
              <div className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full border border-[rgba(184,137,67,0.42)] bg-[rgba(255,253,247,0.92)] text-center shadow-[0_16px_40px_rgba(113,81,33,0.16)]">
                <NavagrahaAiIcon className="h-12 w-12" />
                <span className="mt-3 text-[0.62rem] uppercase tracking-[0.2em] text-[var(--color-trust-text)]">
                  Chart AI
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Section>

      <Section
        tone="light"
        category="services"
        eyebrow="Premium Services"
        title="Reports, consultation, editorial guidance, and shop stay clearly separated."
        description="Each card has one focused action so users can choose their next path without commerce pressure or mixed utility messaging."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {serviceCards.map((service) => (
            <Card key={service.title} tone="light" interactive className="flex h-full flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                {getHomeIcon(service.icon)}
                <Badge tone="trust">{service.label}</Badge>
              </div>
              <h3 className="mobile-safe-text text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {service.title}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {service.description}
              </p>
              <TrackedLink
                href={localizeHref(service.href)}
                eventName={mapServiceToEvent(service.feature)}
                eventPayload={{ page: "/", feature: service.feature }}
                className={buttonStyles({
                  size: "sm",
                  tone: service.feature.includes("consultation") ? "accent" : "tertiary",
                  className: "w-full justify-center",
                })}
              >
                {service.ctaLabel}
              </TrackedLink>
            </Card>
          ))}
        </div>
      </Section>

      <section className="border-y border-[color:var(--color-border)] bg-[rgba(255,253,248,0.94)] py-6">
        <Container>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {credibilityItems.map((item) => (
              <span
                key={item}
                className="rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.28)] bg-[rgba(255,255,255,0.78)] px-4 py-3 text-center text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-trust-text)] shadow-[var(--shadow-xs)]"
              >
                {item}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <Section className="pt-0" tone="transparent">
        <Card
          tone="accent"
          className="border-[rgba(184,137,67,0.35)] bg-[linear-gradient(160deg,rgba(255,252,246,0.98)_0%,rgba(246,232,206,0.94)_58%,rgba(239,222,193,0.96)_100%)] shadow-[var(--shadow-md)] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8"
        >
          <div className="space-y-4">
            <Badge tone="trust">Begin Your Journey</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[var(--color-ink-strong)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Begin Your Journey of Self-Discovery
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              The stars have answers. Let us help you find them through Kundli,
              NAVAGRAHA AI, and careful human guidance when needed.
            </p>
          </div>

          <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:mt-0">
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
            <TrackedLink
              href={localizeHref("/ai")}
              eventName="premium_ai_cta_click"
              eventPayload={{ page: "/", feature: "final-cta-ai" }}
              className={buttonStyles({
                size: "lg",
                tone: "ghost",
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
