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
} from "@/components/graphics/premium-vedic-graphics";
import { HomepagePremiumHeroVisual } from "@/components/graphics/homepage-premium-hero-visual";
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

type HomeCardItem = {
  icon: HomeIcon;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  feature: string;
};

type ServiceCard = HomeCardItem & {
  label: string;
  visualVariant: "report" | "consultation" | "editorial" | "shop";
};

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

      <section className="border-b border-black/8 bg-white">
        <Container className="py-4 sm:py-5">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {trustStripItems.map((item) => (
              <span
                key={item}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-black/8 bg-white px-3.5 py-2 text-[0.64rem] uppercase tracking-[0.16em] text-[color:var(--color-ink-strong)] shadow-[0_8px_20px_rgba(17,24,39,0.04)]"
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
                  className="border border-black/8 bg-white px-3 py-2 text-[0.64rem] uppercase tracking-[0.16em] text-[color:var(--color-ink-strong)] shadow-[0_8px_20px_rgba(17,24,39,0.04)]"
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
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-[color:var(--color-ink-muted)]">
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
              <p className="text-[0.66rem] uppercase tracking-[0.16em] text-[color:var(--color-ink-muted)]">
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
