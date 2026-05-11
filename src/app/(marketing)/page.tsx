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
import {
  ConsultationPlaceholderGraphic,
  FinalCtaOrnament,
  SacredGeometryPattern,
} from "@/components/graphics/premium-vedic-graphics";
import { HomepagePremiumHeroVisual } from "@/components/graphics/homepage-premium-hero-visual";
import { NavagrahaAiGraphic } from "@/components/graphics/navagraha-ai-graphic";
import {
  CornerFlourish,
  GoldSectionDivider,
  OmMandalaWatermark,
  ParchmentTextureLayer,
  SacredGeometryPattern as SectionSacredGeometryPattern,
  SoftIvoryGlow,
} from "@/components/graphics/section-patterns";
import {
  ConsultationGraphic,
  EditorialDeskGraphic,
  PremiumReportsGraphic,
  SpiritualShopGraphic,
} from "@/components/graphics/service-graphics";
import type { UtilityIconName } from "@/components/graphics/utility-icons";
import { UtilityIcon } from "@/components/graphics/utility-icons";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
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

type HomeUtilityCardIcon = UtilityIconName;

type HomeCardItem = {
  icon: HomeIcon;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  feature: string;
};

type HomeUtilityCardItem = Omit<HomeCardItem, "icon"> & {
  icon: HomeUtilityCardIcon;
};

type ServiceCard = HomeCardItem & {
  label: string;
  visualVariant: "report" | "consultation" | "editorial" | "shop";
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

const heroTrustBadges = [
  "Since 1950 Legacy",
  "12-Planet Calculations",
  "AI + Human Guidance",
  "Privacy-Safe Astrology",
] as const;

const utilities: readonly HomeUtilityCardItem[] = [
  {
    icon: "kundli",
    title: "Kundli",
    description: "Generate a sidereal birth chart with Lagna, houses, and planetary context.",
    href: "/kundli",
    ctaLabel: "Explore",
    feature: "home-utility-kundli",
  },
  {
    icon: "compatibility",
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
    icon: "muhurta",
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

function getUtilityIcon(icon: HomeUtilityCardIcon, className?: string) {
  return <UtilityIcon name={icon} className={className} />;
}

const aiFeatureChips = [
  "Deep Chart Analysis",
  "Personalized Answers",
  "24/7 Guidance",
  "Vedic Accuracy",
] as const;

const reportBenefits = [
  "Career, Finance & Business",
  "Marriage & Relationships",
  "Health & Well-being",
  "Complete Life Report",
] as const;

const consultationBadges = [
  "Verified Astrologer",
  "Vedic Expertise",
] as const;

const contentCommerceCards: readonly ServiceCard[] = [
  {
    icon: "reports",
    label: "Editorial Desk",
    title: "From the Desk of J P Sarmah",
    description: "Articles, remedies, Rashifal context, and spiritual guidance from the editorial desk.",
    href: "/from-the-desk",
    ctaLabel: "Read Insights",
    feature: "home-service-content",
    visualVariant: "editorial",
  },
  {
    icon: "kundli",
    label: "Spiritual Products",
    title: "Spiritual Support Shop",
    description: "Optional Rudraksha, gemstones, malas, yantras, and devotional support products.",
    href: "/shop",
    ctaLabel: "Visit Shop",
    feature: "home-service-shop",
    visualVariant: "shop",
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
                Matchmaking, Remedies and personalized AI guidance — all in one
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
                  className="border border-black/8 bg-white px-3 py-2 text-[0.64rem] uppercase tracking-[0.16em] text-[color:var(--color-ink-strong)] shadow-[0_8px_20px_rgba(17,24,39,0.04)]"
                >
                  {badge}
                </Badge>
              ))}
            </div>
          </div>

          <HomepagePremiumHeroVisual />
        </Container>
      </section>

      <GoldSectionDivider />

      <Section tone="light" category="content" contentClassName="py-0">
        <Card tone="accent" className="grid gap-6 border-[rgba(184,137,67,0.32)] lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
          <ParchmentTextureLayer className="opacity-[var(--pattern-opacity-parchment)]" />
          <SectionSacredGeometryPattern className="opacity-[0.22]" />
          <OmMandalaWatermark className="right-0 top-1/2 h-44 w-44 -translate-y-1/2 opacity-[0.1]" />
          <CornerFlourish position="top-right" className="opacity-70" />
          <div className="flex items-center justify-center gap-5 sm:justify-start">
            <ConsultationPlaceholderGraphic
              monogram="JPS"
              label="Joy Prakash Sarmah"
              ariaLabel="Astrologer profile portrait placeholder"
            />
            <ConsultationPlaceholderGraphic
              monogram="HS"
              label="Hemeswar Sarmah legacy"
              ariaLabel="Legacy portrait placeholder"
            />
          </div>
          <div className="space-y-3 text-center lg:text-left">
            <Badge tone="trust">Authority / Legacy</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[var(--color-ink-strong)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Guided by Joy Prakash Sarmah, Chief Astrologer & Authority of NAVAGRAHA CENTRE.
            </h2>
            <p className="mx-auto max-w-3xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)] lg:mx-0">
              Inspired by the legacy of Hemeswar Sarmah, renowned Vedic
              astrologer and traditional scholar, the centre presents trusted
              guidance across India through chart-aware interpretation,
              privacy-conscious tools, and modern intelligence.
            </p>
          </div>
        </Card>
      </Section>

      <GoldSectionDivider />

      <Section
        tone="light"
        category="utilities"
        eyebrow="Explore Core Astrology Utilities"
        title="Practical Vedic astrology tools, clearly separated from premium services."
        description="Start with free utility paths for chart generation, daily guidance, timing, numerology, compatibility, and quick calculators."
      >
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[rgba(184,137,67,0.2)] bg-[rgba(255,255,255,0.52)] p-4 sm:p-5">
          <ParchmentTextureLayer className="opacity-[0.2]" />
          <SectionSacredGeometryPattern className="opacity-[0.2]" />
          <SoftIvoryGlow className="opacity-[0.7]" />
          <CornerFlourish position="bottom-right" className="opacity-60" />
          <OmMandalaWatermark className="left-[-3.5rem] top-1/2 h-40 w-40 -translate-y-1/2 opacity-[0.08]" />

          <div className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {utilities.map((tool) => (
              <Card key={tool.title} tone="light" interactive className="flex h-full flex-col gap-4">
                <SacredGeometryPattern className="opacity-45" />
                <div className="flex items-center justify-between gap-3">
                  {getUtilityIcon(tool.icon, "h-12 w-12")}
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

          <div className="relative mt-6">
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
        </div>
      </Section>

      <GoldSectionDivider />

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#100d1f_0%,#090d1f_52%,#1b1029_100%)] py-[var(--space-12)] text-white sm:py-[var(--space-14)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(138,92,246,0.26),transparent_32%),radial-gradient(circle_at_78%_34%,rgba(212,175,55,0.18),transparent_30%),radial-gradient(circle_at_50%_95%,rgba(212,175,55,0.1),transparent_34%)]" />
        <Container className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)] lg:items-center">
          <div className="space-y-6">
            <Badge tone="neutral" className="border-[rgba(244,213,143,0.34)] bg-[rgba(255,255,255,0.08)] text-[#f8e4a8]">
              NAVAGRAHA AI
            </Badge>
            <div className="space-y-4">
              <h2
                className="max-w-3xl font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-white"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Ask Anything. Get Cosmic Clarity.
              </h2>
              <p className="max-w-2xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[#f9efd3]">
                AI-powered insights based on your birth chart and Vedic wisdom.
              </p>
              <p className="inline-flex rounded-[var(--radius-pill)] border border-[rgba(244,213,143,0.26)] bg-[rgba(255,255,255,0.07)] px-4 py-2 text-[0.7rem] uppercase tracking-[0.14em] text-[#f8e4a8]">
                Powered by your birth chart
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiFeatureChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-[var(--radius-pill)] border border-[rgba(244,213,143,0.24)] bg-[rgba(255,255,255,0.08)] px-3 py-2 text-[0.66rem] uppercase tracking-[0.14em] text-[#f9efd3]"
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <TrackedLink
                href={localizeHref("/ai")}
                eventName="premium_ai_cta_click"
                eventPayload={{ page: "/", feature: "ai-dark-panel-primary" }}
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
                eventPayload={{ page: "/", feature: "ai-dark-panel-kundli" }}
                className={buttonStyles({
                  size: "lg",
                  tone: "secondary",
                  className: "w-full justify-center border-[rgba(244,213,143,0.44)] bg-[rgba(255,255,255,0.08)] text-[#f9efd3] hover:bg-[rgba(255,255,255,0.14)]",
                })}
              >
                Generate Kundli First
              </TrackedLink>
            </div>
          </div>

          <NavagrahaAiGraphic mode="banner" />
        </Container>
      </section>

      <GoldSectionDivider tone="light" />

      <Section
        tone="light"
        category="services"
        eyebrow="Reports + Consultation"
        title="Premium guidance paths for deeper life questions."
        description="Choose a structured report or a human consultation without mixing these service paths into the free utility tools."
      >
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[rgba(184,137,67,0.2)] bg-[rgba(255,255,255,0.52)] p-4 sm:p-5">
          <ParchmentTextureLayer className="opacity-[0.2]" />
          <SectionSacredGeometryPattern className="opacity-[0.18]" />
          <SoftIvoryGlow className="opacity-[0.66]" />
          <CornerFlourish position="top-left" className="opacity-60" />

          <div className="relative grid gap-5 lg:grid-cols-2">
            <Card tone="light" interactive className="flex h-full flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <ReportIcon className="h-12 w-12" />
              <Badge tone="trust">Premium Reports</Badge>
            </div>
            <PremiumReportsGraphic />
            <div className="space-y-3">
              <h3 className="mobile-safe-text text-[length:var(--font-size-title-sm)] font-medium text-[var(--color-ink-strong)]">
                Premium Reports
              </h3>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                In-depth life analysis reports with chart-aware interpretation,
                predictive context, and practical next steps.
              </p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {reportBenefits.map((benefit) => (
                <li
                  key={benefit}
                  className="rounded-[var(--radius-lg)] border border-[rgba(184,137,67,0.18)] bg-[rgba(255,253,248,0.72)] px-3 py-2 text-[length:var(--font-size-body-xs)] text-[var(--color-ink-body)]"
                >
                  {benefit}
                </li>
              ))}
            </ul>
            <TrackedLink
              href={localizeHref("/reports")}
              eventName="report_cta_click"
              eventPayload={{ page: "/", feature: "home-reports-premium-card" }}
              className={buttonStyles({
                size: "sm",
                tone: "tertiary",
                className: "mt-auto w-full justify-center",
              })}
            >
              Explore Reports
            </TrackedLink>
            </Card>

            <Card tone="accent" interactive className="flex h-full flex-col gap-5 border-[rgba(184,137,67,0.34)]">
              <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                <ConsultationGraphic className="h-28" />
                <div className="space-y-2 text-center sm:text-left">
                  <Badge tone="trust">Consultation</Badge>
                  <h3 className="mobile-safe-text text-[length:var(--font-size-title-sm)] font-medium text-[var(--color-ink-strong)]">
                    Joy Prakash Sarmah
                  </h3>
                  <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                    Chief Astrologer, NAVAGRAHA CENTRE
                  </p>
                </div>
              </div>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                Personal guidance for nuanced questions, chart interpretation,
                timing, remedies, and decisions that benefit from human review.
              </p>
              <div className="flex flex-wrap gap-2">
                {consultationBadges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.24)] bg-[rgba(255,255,255,0.7)] px-3 py-2 text-[0.66rem] uppercase tracking-[0.14em] text-[var(--color-trust-text)]"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <TrackedLink
                href={localizeHref("/consultation")}
                eventName="consultation_cta_click"
                eventPayload={{ page: "/", feature: "home-consultation-premium-card" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "accent",
                  className: "mt-auto w-full justify-center",
                })}
              >
                Book Consultation
              </TrackedLink>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        tone="muted"
        category="content"
        eyebrow="From the Desk + Shop"
        title="Editorial guidance and optional spiritual support stay in their own lane."
        description="Read expert-led content or explore spiritual products as optional support, never as fear-based remedy pressure."
      >
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[rgba(184,137,67,0.2)] bg-[rgba(255,255,255,0.52)] p-4 sm:p-5">
          <ParchmentTextureLayer className="opacity-[0.18]" />
          <SectionSacredGeometryPattern className="opacity-[0.16]" />
          <SoftIvoryGlow className="opacity-[0.64]" />
          <OmMandalaWatermark className="right-[-2.8rem] bottom-[-2.8rem] h-40 w-40 opacity-[0.08]" />
          <CornerFlourish position="bottom-left" className="opacity-60" />

          <div className="relative grid gap-5 lg:grid-cols-2">
            {contentCommerceCards.map((service) => (
              <Card key={service.title} tone="light" interactive className="flex h-full flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  {getHomeIcon(service.icon, "h-12 w-12")}
                  <Badge tone="trust">{service.label}</Badge>
                </div>
                {service.visualVariant === "editorial" ? <EditorialDeskGraphic /> : null}
                {service.visualVariant === "shop" ? <SpiritualShopGraphic /> : null}
                <h3 className="mobile-safe-text text-[length:var(--font-size-title-sm)] font-medium text-[var(--color-ink-strong)]">
                  {service.title}
                </h3>
                <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                  {service.description}
                </p>
                {service.visualVariant === "shop" ? (
                  <p className="rounded-[var(--radius-lg)] border border-[rgba(184,137,67,0.2)] bg-[rgba(255,253,248,0.72)] px-3 py-2 text-[length:var(--font-size-body-xs)] text-[var(--color-trust-text)]">
                    Optional spiritual support tools
                  </p>
                ) : null}
                <TrackedLink
                  href={localizeHref(service.href)}
                  eventName={mapServiceToEvent(service.feature)}
                  eventPayload={{ page: "/", feature: service.feature }}
                  className={buttonStyles({
                    size: "sm",
                    tone: "tertiary",
                    className: "w-full justify-center",
                  })}
                >
                  {service.ctaLabel}
                </TrackedLink>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <GoldSectionDivider />

      <section className="relative border-y border-[color:var(--color-border)] bg-[rgba(255,253,248,0.94)] py-6">
        <ParchmentTextureLayer className="opacity-[0.16]" />
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

      <GoldSectionDivider />

      <Section className="pt-0" tone="transparent">
        <Card
          tone="accent"
          className="relative border-[rgba(184,137,67,0.35)] bg-[linear-gradient(160deg,rgba(255,252,246,0.98)_0%,rgba(246,232,206,0.94)_58%,rgba(239,222,193,0.96)_100%)] shadow-[var(--shadow-md)] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8"
        >
          <ParchmentTextureLayer className="opacity-[var(--pattern-opacity-parchment)]" />
          <SectionSacredGeometryPattern className="opacity-[0.18]" />
          <SoftIvoryGlow className="opacity-[0.75]" />
          <OmMandalaWatermark className="right-[-1.5rem] top-[-1.5rem] h-36 w-36 opacity-[0.11]" />
          <CornerFlourish position="bottom-right" className="opacity-70" />
          <FinalCtaOrnament />
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
              The stars have answers. Let&apos;s help you find them.
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
          </div>
        </Card>
      </Section>
    </>
  );
}
