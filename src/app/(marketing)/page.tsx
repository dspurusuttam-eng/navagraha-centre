import { TrackedLink } from "@/components/analytics/tracked-link";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import {
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
import { buildPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/config/site";
import { contentTypeLabels } from "@/modules/content";
import { curatedContentEntries } from "@/modules/content/catalog";
import { contentHubs } from "@/modules/content/hubs";
import { globalCtaCopy } from "@/modules/localization/copy";
import {
  AstrologerAuthoritySection,
  CredibilityMarkersSection,
  ExpectationSettingSection,
  TestimonialsSection,
  TrustFaqSection,
  TrustIndicatorStrip,
} from "@/modules/marketing/components/trust-conversion-sections";
import { homePage } from "@/modules/marketing/content";
import { RevenuePathwaysCard } from "@/modules/subscriptions/components/revenue-readiness-panels";

export const metadata = buildPageMetadata({
  ...homePage.metadata,
});
export const revalidate = 3600;

function formatPublishedDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    dateStyle: "medium",
  });
}

const trustItems = [
  "Vedic chart-first analysis",
  "Lahiri sidereal foundation",
  "AI-assisted interpretation",
  "Human-guided consultation",
  "Free limited-time access",
] as const;

const tools = [
  {
    icon: "kundli",
    title: "Kundli Chart",
    description: "Generate your sidereal Kundli and Lagna-centered chart map.",
    href: "/kundli",
    ctaLabel: "Generate Kundli",
    feature: "home-tools-kundli",
  },
  {
    icon: "consultation",
    title: "Marriage Compatibility",
    description: "Review relationship potential with chart-aware compatibility layers.",
    href: "/compatibility",
    ctaLabel: "Check Compatibility",
    feature: "home-tools-compatibility",
  },
  {
    icon: "rashifal",
    title: "Daily Rashifal",
    description: "Get concise daily guidance with premium editorial clarity.",
    href: "/rashifal",
    ctaLabel: "Open Rashifal",
    feature: "home-tools-rashifal",
  },
  {
    icon: "panchang",
    title: "Daily Panchang",
    description:
      "Check Tithi, Vara, Nakshatra, Yoga, Karana, sunrise, and moon sign for your day.",
    href: "/panchang",
    ctaLabel: "Open Panchang",
    feature: "home-tools-panchang",
  },
  {
    icon: "numerology",
    title: "Numerology",
    description:
      "Generate a premium numerology profile with core and compound numbers.",
    href: "/numerology",
    ctaLabel: "Open Numerology",
    feature: "home-tools-numerology",
  },
  {
    icon: "ai",
    title: "NAVAGRAHA AI",
    description: "Ask chart-grounded questions with structured Vedic intelligence.",
    href: "/ai",
    ctaLabel: "Try NAVAGRAHA AI",
    feature: "home-tools-ai",
  },
  {
    icon: "reports",
    title: "Premium Reports",
    description: "Unlock focused reports for career, relationships, finance, and health.",
    href: "/reports",
    ctaLabel: "Get Free Report",
    feature: "home-tools-reports",
  },
  {
    icon: "consultation",
    title: "Consultation",
    description: "Continue with human interpretation led by Joy Prakash Sarmah.",
    href: "/consultation",
    ctaLabel: "Book Free Consultation",
    feature: "home-tools-consultation",
  },
] as const;

function getToolIcon(toolIcon: (typeof tools)[number]["icon"]) {
  switch (toolIcon) {
    case "kundli":
      return <KundliIcon />;
    case "ai":
      return <NavagrahaAiIcon />;
    case "rashifal":
      return <RashifalIcon />;
    case "reports":
      return <ReportIcon />;
    case "consultation":
      return <ConsultationIcon />;
    case "numerology":
      return <NumerologyIcon />;
    case "panchang":
      return <PanchangIcon />;
    default:
      return <KundliIcon />;
  }
}

const aiServices = [
  {
    icon: "kundli",
    title: "Kundli AI",
    description: "Chart summary, planetary emphasis, and structured guidance.",
    href: "/ai?tool=kundli",
    ctaLabel: "Try Free",
  },
  {
    icon: "numerology",
    title: "Numerology AI",
    description:
      "Discover your core numbers, personality patterns, strengths, growth and life direction through premium numerology insights.",
    href: "/numerology",
    ctaLabel: "Explore Numerology",
  },
  {
    icon: "reports",
    title: "Career Guidance AI",
    description: "Decision-focused interpretation for professional direction.",
    href: "/ai?tool=career",
    ctaLabel: "Try Free",
  },
  {
    icon: "consultation",
    title: "Marriage Compatibility AI",
    description: "Relationship dynamics interpreted through chart structure.",
    href: "/ai?tool=compatibility",
    ctaLabel: "Try Free",
  },
  {
    icon: "rashifal",
    title: "Daily Guidance AI",
    description: "Daily chart-aware prompts for calm, actionable reflection.",
    href: "/ai?tool=daily-guidance",
    ctaLabel: "Try Free",
  },
] as const;

function getAiServiceIcon(icon: (typeof aiServices)[number]["icon"]) {
  switch (icon) {
    case "kundli":
      return <KundliIcon className="h-9 w-9" />;
    case "numerology":
      return <NumerologyIcon className="h-9 w-9" />;
    case "reports":
      return <ReportIcon className="h-9 w-9" />;
    case "consultation":
      return <ConsultationIcon className="h-9 w-9" />;
    case "rashifal":
      return <RashifalIcon className="h-9 w-9" />;
    default:
      return <NavagrahaAiIcon className="h-9 w-9" />;
  }
}

const sampleOutputCards = [
  {
    label: "Chart Preview",
    title: "Lagna: Leo | Moon: Pisces",
    body: "Planet placements and house structure surfaced in one clean chart object.",
  },
  {
    label: "AI Insight Preview",
    title: "Current emphasis: discipline + timing",
    body: "NAVAGRAHA AI explains why Saturn/Mars themes are active and what to prioritize.",
  },
  {
    label: "Compatibility Preview",
    title: "Compatibility pulse: Stable with communication sensitivity",
    body: "Highlights strengths and friction zones before moving into deeper report layers.",
  },
  {
    label: "Report Preview",
    title: "Career signal: high growth window",
    body: "Premium report shows timing windows, strengths, cautions, and next steps.",
  },
  {
    label: "Remedy Preview",
    title: "Remedy pathway: gentle and optional",
    body: "Recommendations are framed responsibly, without fear-driven pressure.",
  },
] as const;

const differentiators = [
  "Vedic chart-based foundation, not generic horoscope outputs.",
  "Calm and trustworthy guidance with clarity-first communication.",
  "AI plus human wisdom for structured and nuanced interpretation.",
  "No fear-based astrology or exaggerated guarantee language.",
  "Premium guided experience from first chart to deeper consultation.",
] as const;

const insightCategories = [
  { title: "Daily Rashifal", href: "/rashifal" },
  { title: "Monthly Forecast", href: "/insights/april-2026-monthly-forecast" },
  {
    title: "Remedies",
    href: "/insights/how-to-approach-remedies-with-discernment",
  },
  { title: "Relationship Guidance", href: "/compatibility-hub" },
  { title: "Spiritual Guidance", href: "/navagraha-ai-explainer" },
] as const;

const testimonials = [
  {
    name: "R. Sharma",
    quote:
      "The chart flow was clear and the interpretation stayed calm. I could actually use the guidance for decisions.",
    tag: "Chart + AI",
  },
  {
    name: "M. Das",
    quote:
      "I started with free access and later booked consultation. The transition felt natural and trustworthy.",
    tag: "Consultation",
  },
  {
    name: "A. Roy",
    quote:
      "The report preview gave enough value first, then deeper layers made sense without aggressive upsell pressure.",
    tag: "Reports",
  },
] as const;

export default function HomePage() {
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/insights?query={search_term_string}`,
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
  const featuredHubs = contentHubs.slice(0, 4);

  return (
    <>
      <PageViewTracker page="/" feature="home-page" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />

      <section className="relative overflow-hidden border-b border-[color:var(--color-border)] bg-[linear-gradient(180deg,#fffefb_0%,#fdf8ef_52%,#faf2e4_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(214,171,95,0.22),transparent_34%),radial-gradient(circle_at_84%_14%,rgba(219,178,121,0.18),transparent_34%),radial-gradient(circle_at_68%_88%,rgba(198,148,86,0.12),transparent_38%)]" />
        <Container className="relative grid gap-8 py-12 sm:py-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(340px,0.98fr)] lg:items-center">
          <div className="home-reveal home-reveal-delay-1 space-y-6">
            <Badge tone="trust">NAVAGRAHA CENTRE</Badge>
            <div className="space-y-4">
              <h1
                className="max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-md)] text-[var(--color-ink-strong)] sm:text-[length:var(--font-size-display-lg)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                India&apos;s Premium Vedic Astrology Platform with NAVAGRAHA AI
              </h1>
              <p className="max-w-[42rem] text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                Build your Kundli, explore AI-powered chart insights, review compatibility, and return daily for structured Rashifal guidance.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <TrackedLink
                href="/kundli"
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
                href="/ai"
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "hero-secondary-ai" }}
                className={buttonStyles({
                  size: "lg",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Try NAVAGRAHA AI
              </TrackedLink>
            </div>
          </div>

          <div className="home-reveal home-reveal-delay-2">
            <Card className="home-polish-surface space-y-5 border-[color:var(--color-border)] bg-[linear-gradient(165deg,rgba(255,255,255,0.96)_0%,rgba(252,244,232,0.92)_55%,rgba(246,232,209,0.92)_100%)] shadow-[0_26px_60px_rgba(95,67,28,0.14)]">
              <div className="flex items-center justify-between gap-2">
                <Badge tone="trust">Chart Preview</Badge>
                <span className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  Lahiri Sidereal
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(120px,0.7fr)] sm:items-center">
                <div className="space-y-3 rounded-[var(--radius-xl)] border border-[rgba(184,137,67,0.26)] bg-[rgba(255,255,255,0.78)] p-4">
                  <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                    Kundli Snapshot
                  </p>
                  <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                    Lagna: Leo | Moon: Pisces | 12 Whole Sign Houses
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {["Su 12 deg", "Mo 4 deg", "Ma 21 deg", "Me 19 deg", "Ju 8 deg", "Sa 2 deg"].map(
                      (item) => (
                        <span
                          key={item}
                          className="rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.84)] px-2 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-ink-body)]"
                        >
                          {item}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border border-[rgba(184,137,67,0.4)] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.98)_0%,rgba(248,235,210,0.86)_58%,rgba(232,205,156,0.38)_100%)] shadow-[0_14px_30px_rgba(113,81,33,0.16)]">
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[rgba(184,137,67,0.34)]">
                    <span className="text-[0.62rem] uppercase tracking-[0.16em] text-[var(--color-trust-text)]">
                      Zodiac
                    </span>
                    <span className="absolute left-1/2 top-1/2 h-0.5 w-24 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[rgba(184,137,67,0.22)]" />
                    <span className="absolute left-1/2 top-1/2 h-0.5 w-24 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[rgba(184,137,67,0.22)]" />
                    <span className="absolute left-1/2 top-1/2 h-24 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-[rgba(184,137,67,0.16)]" />
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  "Planetary insight: Mercury supports communication clarity.",
                  "Daily cue: prioritize structured decisions over haste.",
                  "Compatibility note: emotional rhythm is stable this week.",
                  "Report signal: career timing window is opening.",
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
          </div>
        </Container>
      </section>

      <TrustIndicatorStrip items={trustItems} />

      <Section
        tone="light"
        eyebrow="Core Tools"
        title="Everything essential for your astrology journey in one premium toolkit."
        description="Choose the entry point you need now, then continue into deeper layers as your guidance path evolves."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <Card
              key={tool.title}
              tone="light"
              interactive
              className="flex h-full flex-col gap-4 border-[rgba(184,137,67,0.26)]"
            >
              <div className="flex items-center justify-between gap-3">
                {getToolIcon(tool.icon)}
                <Badge tone="neutral">Tool</Badge>
              </div>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {tool.title}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {tool.description}
              </p>
              <TrackedLink
                href={tool.href}
                eventName="cta_click"
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
        eyebrow="NAVAGRAHA AI Spotlight"
        title="Chart-aware AI intelligence built as a premium Vedic guidance layer."
        description="NAVAGRAHA AI is structured as a focused product family so users can move from chart generation to practical interpretation without generic chatbot drift."
      >
        <Card
          tone="accent"
          className="border-[var(--color-section-contrast-edge)] bg-[linear-gradient(155deg,rgba(255,250,240,0.96)_0%,rgba(249,236,208,0.9)_50%,rgba(241,222,189,0.92)_100%)]"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="space-y-4">
              <p className="max-w-3xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                Ask deeper chart questions, compare interpretation layers, and continue seamlessly into reports or consultation when needed.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {aiServices.map((service) => (
                  <TrackedLink
                    key={service.title}
                    href={service.href}
                    eventName="cta_click"
                    eventPayload={{
                      page: "/",
                      feature: `ai-spotlight-${service.title}`,
                    }}
                    className="rounded-[var(--radius-lg)] border border-[rgba(184,137,67,0.28)] bg-[rgba(255,255,255,0.86)] px-4 py-3 transition [transition-duration:var(--motion-duration-base)] hover:border-[rgba(184,137,67,0.44)]"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      {getAiServiceIcon(service.icon)}
                      <Badge tone="neutral">AI Tool</Badge>
                    </div>
                    <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                      {service.title}
                    </p>
                    <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                      {service.description}
                    </p>
                    <p className="mt-3 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-accent)]">
                      {service.ctaLabel}
                    </p>
                  </TrackedLink>
                ))}
              </div>
            </div>

            <TrackedLink
              href="/ai"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "ai-spotlight-primary-cta" }}
              className={buttonStyles({
                size: "lg",
                className: "w-full justify-center lg:w-auto",
              })}
            >
              Try NAVAGRAHA AI Free
            </TrackedLink>
          </div>
        </Card>
      </Section>

      <section className="border-y border-[color:var(--color-border)] bg-[linear-gradient(180deg,rgba(255,249,240,0.92)_0%,rgba(247,236,214,0.9)_100%)]">
        <Container className="py-5 text-center">
          <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[var(--color-trust-text)] sm:text-[0.75rem]">
            Limited Launch Access: All Core Astrology Services Are Currently Free
          </p>
        </Container>
      </section>

      <Section
        tone="light"
        eyebrow="Sample Output"
        title="A clear preview of the experience before you start."
        description="From chart structure to AI interpretation, every layer is designed to feel concrete, readable, and premium."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {sampleOutputCards.map((card) => (
            <Card
              key={card.label}
              tone="light"
              className="flex h-full flex-col gap-3 border-[rgba(184,137,67,0.24)]"
            >
              <Badge tone="trust">{card.label}</Badge>
              <p className="text-[length:var(--font-size-body-sm)] font-medium text-[var(--color-ink-strong)]">
                {card.title}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {card.body}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        eyebrow="Why NAVAGRAHA CENTRE"
        title="Designed for users who want grounded, premium astrology guidance."
        description="The platform combines deterministic Vedic structure, calm communication, and guided depth without fear-based pressure."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {differentiators.map((item) => (
            <Card
              key={item}
              tone="light"
              className="border-[rgba(184,137,67,0.22)] bg-[rgba(255,255,255,0.9)] p-4"
            >
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        eyebrow="Insights Ecosystem"
        title="A richer content ecosystem built for trust, discovery, and return engagement."
        description="Navigate structured categories, then continue into tools, AI, and consultation from relevant content paths."
      >
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {insightCategories.map((category) => (
            <TrackedLink
              key={category.title}
              href={category.href}
              eventName="cta_click"
              eventPayload={{
                page: "/",
                feature: `insight-category-${category.title}`,
              }}
              className="rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.9)] px-4 py-3 text-center text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-trust-text)] transition [transition-duration:var(--motion-duration-base)] hover:border-[rgba(184,137,67,0.38)]"
            >
              {category.title}
            </TrackedLink>
          ))}
        </div>

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
                Published {formatPublishedDate(entry.publishedAt)}
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
                href={entry.path}
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

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {featuredHubs.map((hub) => (
            <TrackedLink
              key={hub.slug}
              href={hub.path}
              eventName="cta_click"
              eventPayload={{ page: "/", feature: `hub-open-${hub.slug}` }}
              className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.9)] px-4 py-3 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-ink-body)] transition [transition-duration:var(--motion-duration-base)] hover:border-[rgba(184,137,67,0.34)]"
            >
              {hub.title}
            </TrackedLink>
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        eyebrow="Astrologer Authority"
        title="Guided by Joy Prakash Sarmah"
        description="NAVAGRAHA CENTRE combines technology and human discernment, with Joy Prakash Sarmah as the visible astrologer behind interpretive depth and consultation quality."
      >
        <Card
          tone="light"
          className="border-[rgba(184,137,67,0.24)] bg-[linear-gradient(165deg,rgba(255,255,255,0.96)_0%,rgba(247,236,216,0.9)_100%)] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6"
        >
          <div className="space-y-3">
            <Badge tone="trust">Human-Led Interpretation</Badge>
            <p className="max-w-3xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Consultation pathways are kept calm and trust-oriented so users can move from self-service outputs into nuanced, context-aware interpretation.
            </p>
          </div>
          <TrackedLink
            href="/consultation"
            eventName="cta_click"
            eventPayload={{ page: "/", feature: "authority-book-consultation" }}
            className={buttonStyles({
              size: "lg",
              tone: "secondary",
              className: "w-full justify-center lg:w-auto",
            })}
          >
            Book Free Consultation
          </TrackedLink>
        </Card>
      </Section>

      <AstrologerAuthoritySection pagePath="/" tone="light" />

      <TestimonialsSection
        pagePath="/"
        testimonials={testimonials}
        tone="light"
        title="Trusted by members who moved from curiosity to clarity."
        description="These reflections show how chart-first guidance, NAVAGRAHA AI, and consultation work together in a calm premium flow."
      />

      <ExpectationSettingSection tone="transparent" />

      <TrustFaqSection tone="muted" />

      <CredibilityMarkersSection
        pagePath="/"
        publishedOn="April 22, 2026"
        updatedOn="April 22, 2026"
        tone="transparent"
      />

      <Section className="pt-0" tone="transparent">
        <RevenuePathwaysCard
          pagePath="/"
          title="Move from free value to deeper premium-ready pathways"
          description="Generate your Kundli, continue with NAVAGRAHA AI, then step into reports, consultation, or optional spiritual add-ons as needed."
        />
      </Section>

      <Section className="pt-0" tone="transparent">
        <Card
          tone="accent"
          className="border-[rgba(184,137,67,0.35)] bg-[linear-gradient(160deg,rgba(255,252,246,0.98)_0%,rgba(246,232,206,0.94)_58%,rgba(239,222,193,0.96)_100%)] shadow-[var(--shadow-md)] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8"
        >
          <div className="space-y-4">
            <Badge tone="accent">Final CTA</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[var(--color-ink-strong)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Start Your Astrology Journey with Clarity
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Begin with your Kundli, continue with NAVAGRAHA AI, and step into consultation when deeper interpretation is needed.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <TrackedLink
              href="/kundli"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "final-cta-kundli" }}
              className={buttonStyles({
                size: "lg",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Generate Kundli
            </TrackedLink>
            <TrackedLink
              href="/ai"
              eventName="cta_click"
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
