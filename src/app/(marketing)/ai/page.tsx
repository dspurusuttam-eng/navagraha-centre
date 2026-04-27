import { TrackedLink } from "@/components/analytics/tracked-link";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import {
  ConsultationIcon,
  KundliIcon,
  NavagrahaAiIcon,
  NumerologyIcon,
  RashifalIcon,
  ReportIcon,
} from "@/components/icons/astrology-icons";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { getRequestLocale, hasExplicitLocalePrefixInRequest } from "@/modules/localization/request";
import {
  CredibilityMarkersSection,
  ExpectationSettingSection,
  TestimonialsSection,
  TrustIndicatorStrip,
} from "@/modules/marketing/components/trust-conversion-sections";
import {
  AiMonetizationPrepSection,
  RevenuePathwaysCard,
} from "@/modules/subscriptions/components/revenue-readiness-panels";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("navagrahaAi", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/ai",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "navagraha ai",
      "ai astrology guidance",
      "kundli interpretation",
      "vedic astrology ai",
      "chart assistant",
    ],
  });
}
export const revalidate = 3600;

const aiTools = [
  {
    icon: "kundli",
    title: "Kundli AI",
    description: "Chart-first AI reading with planetary and house emphasis.",
    href: "/kundli-ai?tool=kundli-ai",
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
    icon: "consultation",
    title: "Marriage Compatibility AI",
    description: "Relationship dynamics interpreted through structured chart context.",
    href: "/kundli-ai?tool=marriage-compatibility-ai",
    ctaLabel: "Try Free",
  },
  {
    icon: "reports",
    title: "Career Guidance AI",
    description: "Decision-focused career insight from your chart baseline.",
    href: "/kundli-ai?tool=career-guidance-ai",
    ctaLabel: "Try Free",
  },
  {
    icon: "reports",
    title: "Finance AI",
    description: "Financial timing and caution themes in a clear AI summary.",
    href: "/kundli-ai?tool=finance-ai",
    ctaLabel: "Try Free",
  },
  {
    icon: "consultation",
    title: "Health AI",
    description: "Wellness-oriented guidance signals framed responsibly.",
    href: "/kundli-ai?tool=health-ai",
    ctaLabel: "Try Free",
  },
  {
    icon: "rashifal",
    title: "Daily Prediction AI",
    description: "Daily chart-aware prompts for calm and practical action.",
    href: "/kundli-ai?tool=daily-prediction-ai",
    ctaLabel: "Try Free",
  },
] as const;

function getAiToolIcon(icon: (typeof aiTools)[number]["icon"]) {
  switch (icon) {
    case "kundli":
      return <KundliIcon />;
    case "rashifal":
      return <RashifalIcon />;
    case "consultation":
      return <ConsultationIcon />;
    case "numerology":
      return <NumerologyIcon />;
    case "reports":
      return <ReportIcon />;
    default:
      return <NavagrahaAiIcon />;
  }
}

const differentiationPoints = [
  "Chart-based AI, not generic prompt output.",
  "Structured around Vedic sidereal chart rules and verified pipeline layers.",
  "Context-aware insights from your saved chart and profile state.",
  "Human-guided continuity through consultation when deeper interpretation is required.",
] as const;

const aiTrustIndicators = [
  "Vedic chart-based system",
  "Lahiri sidereal foundation",
  "Human-guided interpretation",
  "Limited-time free access",
  "Structured astrology workflow",
] as const;

const aiTestimonials = [
  {
    name: "N. Mehta",
    quote:
      "The AI answers felt specific to my chart and not like generic astrology text.",
    tag: "Ask My Chart",
  },
  {
    name: "P. Bora",
    quote:
      "I used AI first, then moved to consultation with clearer questions and better outcomes.",
    tag: "AI + Consultation",
  },
  {
    name: "S. Iyer",
    quote:
      "The reasoning and confidence structure made the guidance easier to trust and apply.",
    tag: "Structured Response",
  },
] as const;

export default function AiPage() {
  return (
    <>
      <PageViewTracker page="/ai" feature="ai-page" />
      <AnalyticsEventTracker
        event="ai_opened"
        payload={{ page: "/ai", feature: "ai-page" }}
      />

      <section className="relative overflow-hidden border-b border-[color:var(--color-border)] bg-[linear-gradient(180deg,#fffefb_0%,#fdf7ea_48%,#faefdd_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(214,171,95,0.2),transparent_36%),radial-gradient(circle_at_84%_16%,rgba(216,173,114,0.16),transparent_34%),radial-gradient(circle_at_72%_90%,rgba(190,148,92,0.12),transparent_38%)]" />
        <Container className="relative grid gap-8 py-12 sm:py-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] lg:items-center">
          <div className="space-y-6">
            <Badge tone="trust">NAVAGRAHA AI Flagship</Badge>
            <div className="space-y-4">
              <h1
                className="font-[family-name:var(--font-display)] text-[length:var(--font-size-display-md)] text-[var(--color-ink-strong)] sm:text-[length:var(--font-size-display-lg)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                NAVAGRAHA AI - Your Personal Astrology Intelligence System
              </h1>
              <p className="max-w-[44rem] text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                NAVAGRAHA AI combines Kundli structure, Vedic astrology rules, and intelligent interpretation to deliver clear personal guidance across life decisions.
              </p>
            </div>

            <TrackedLink
              href="/kundli-ai"
              eventName="cta_click"
              eventPayload={{ page: "/ai", feature: "ai-hero-primary-cta" }}
              className={buttonStyles({
                size: "lg",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Start Free AI Analysis
            </TrackedLink>
          </div>

          <Card className="space-y-4 border-[rgba(184,137,67,0.28)] bg-[linear-gradient(165deg,rgba(255,255,255,0.96)_0%,rgba(248,237,218,0.9)_100%)]">
            <Badge tone="trust">Astrology Intelligence Preview</Badge>
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.86)] p-4">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                Current Chart Context
              </p>
              <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                Lagna: Leo | Moon: Pisces | Saturn in 7th house emphasis
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                "Priority: communication rhythm",
                "Career signal: disciplined growth",
                "Compatibility: calm response needed",
                "Daily cue: avoid rushed decisions",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.84)] px-3 py-2 text-[0.68rem] uppercase tracking-[0.13em] text-[var(--color-ink-body)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </Card>
        </Container>
      </section>

      <TrustIndicatorStrip items={aiTrustIndicators} />

      <Section
        tone="light"
        eyebrow="How It Works"
        title="Three steps from chart setup to AI insight."
        description="The flow is deterministic at the chart layer and intelligent at the interpretation layer."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              step: "Step 1",
              title: "Generate Kundli",
              description:
                "Create your chart foundation with validated birth context and sidereal settings.",
            },
            {
              step: "Step 2",
              title: "AI reads planetary data",
              description:
                "NAVAGRAHA AI consumes your chart context and structured planetary placements.",
            },
            {
              step: "Step 3",
              title: "Get insights",
              description:
                "Receive clear, chart-grounded guidance with premium depth options when needed.",
            },
          ].map((item) => (
            <Card key={item.title} tone="light" className="space-y-3">
              <Badge tone="trust">{item.step}</Badge>
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
        eyebrow="AI Tools"
        title="Choose the AI tool that matches your current question."
        description="Each tool starts free and routes into the same chart-aware intelligence system."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {aiTools.map((tool) => (
            <Card key={tool.title} tone="light" interactive className="space-y-4">
              <div className="flex items-center justify-between">
                {getAiToolIcon(tool.icon)}
                <Badge tone="neutral">AI Tool</Badge>
              </div>
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {tool.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {tool.description}
              </p>
              <TrackedLink
                href={tool.href}
                eventName="cta_click"
                eventPayload={{ page: "/ai", feature: `ai-tool-${tool.title}` }}
                className={buttonStyles({
                  tone: "tertiary",
                  size: "sm",
                  className: "w-full justify-center",
                })}
              >
                {tool.ctaLabel}
              </TrackedLink>
            </Card>
          ))}
        </div>
        <Card
          tone="light"
          className="mt-5 grid gap-4 border-[rgba(184,137,67,0.24)] bg-[rgba(255,255,255,0.9)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-2">
            <Badge tone="trust">Utility Discovery</Badge>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Need chart, Panchang, numerology, or quick calculators first? Open the utility hub to choose the best starting point.
            </p>
          </div>
          <TrackedLink
            href="/tools"
            eventName="utility_card_click"
            eventPayload={{ page: "/ai", feature: "ai-tools-hub-discovery" }}
            className={buttonStyles({
              size: "sm",
              tone: "tertiary",
              className: "w-full justify-center lg:w-auto",
            })}
          >
            Explore All Tools
          </TrackedLink>
        </Card>
      </Section>

      <Section
        tone="contrast"
        eyebrow="Interactive Preview"
        title="A quick view of how NAVAGRAHA AI responds."
        description="This is a UI preview of the interaction structure."
      >
        <Card
          tone="accent"
          className="border-[var(--color-section-contrast-edge)] bg-[linear-gradient(155deg,rgba(255,250,240,0.96)_0%,rgba(246,230,199,0.92)_100%)]"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                Input
              </p>
              <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.9)] p-4">
                <p className="text-[length:var(--font-size-body-sm)] text-[var(--color-ink-body)]">
                  Sample query:
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-md)] text-[var(--color-ink-strong)]">
                  Why is my career progress feeling slow this year?
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                Structured AI Response
              </p>
              <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.9)] p-4">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  Answer
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                  Your chart shows a Saturn timing phase, which rewards consistency over short-term speed.
                </p>
                <p className="mt-3 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  Reasoning
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                  Saturn influence in career houses often delays visible outcomes while strengthening long-term stability.
                </p>
                <p className="mt-3 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  Confidence: Medium
                </p>
              </div>
            </div>
          </div>
        </Card>
      </Section>

      <Section
        tone="light"
        eyebrow="Differentiation"
        title="Why NAVAGRAHA AI is different"
        description="The intelligence layer is built on chart context, Vedic structure, and human-guided continuity."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {differentiationPoints.map((item) => (
            <Card key={item} tone="light" className="p-4">
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <TestimonialsSection
        pagePath="/ai"
        testimonials={aiTestimonials}
        tone="light"
        title="Members trust NAVAGRAHA AI for chart-grounded interpretation."
        description="User feedback highlights clarity, context depth, and smooth handoff into consultation when needed."
      />

      <ExpectationSettingSection tone="transparent" />

      <CredibilityMarkersSection
        pagePath="/ai"
        publishedOn="April 22, 2026"
        updatedOn="April 22, 2026"
        tone="transparent"
      />

      <AiMonetizationPrepSection pagePath="/ai" tone="muted" />

      <section className="border-y border-[color:var(--color-border)] bg-[linear-gradient(180deg,rgba(255,249,239,0.94)_0%,rgba(245,231,204,0.9)_100%)]">
        <Container className="py-5 text-center">
          <p className="text-[0.72rem] uppercase tracking-[0.16em] text-[var(--color-trust-text)] sm:text-[0.75rem]">
            Currently free for limited time
          </p>
        </Container>
      </section>

      <Section className="pt-0" tone="transparent">
        <Card
          tone="accent"
          className="border-[rgba(184,137,67,0.34)] bg-[linear-gradient(160deg,rgba(255,252,246,0.98)_0%,rgba(246,232,206,0.94)_58%,rgba(239,222,193,0.96)_100%)] shadow-[var(--shadow-md)] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8"
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
              Continue with NAVAGRAHA AI Intelligence
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Start with free AI analysis now, or generate your Kundli first to unlock deeper chart-grounded guidance.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <TrackedLink
              href="/kundli-ai"
              eventName="cta_click"
              eventPayload={{ page: "/ai", feature: "ai-final-cta-start-free-ai" }}
              className={buttonStyles({
                size: "lg",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Start Free AI
            </TrackedLink>
            <TrackedLink
              href="/kundli"
              eventName="cta_click"
              eventPayload={{ page: "/ai", feature: "ai-final-cta-generate-kundli" }}
              className={buttonStyles({
                size: "lg",
                tone: "secondary",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Generate Kundli
            </TrackedLink>
          </div>
        </Card>
      </Section>

      <Section className="pt-0" tone="transparent">
        <RevenuePathwaysCard
          pagePath="/ai"
          title="Continue from AI insight into full guidance pathways"
          description="Ask your first chart question for free, then move into reports, consultation, or spiritual support based on your current need."
        />
      </Section>
    </>
  );
}
