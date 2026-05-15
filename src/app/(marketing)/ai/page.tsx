import type { ReactNode } from "react";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { PremiumAICTA } from "@/components/monetization/PremiumAICTA";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import {
  ConsultationIcon,
  NavagrahaAiIcon,
  ReportIcon,
} from "@/components/icons/astrology-icons";
import { NavagrahaAiGraphic } from "@/components/graphics/navagraha-ai-graphic";
import { UtilityIcon } from "@/components/graphics/utility-icons";
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
    description:
      "Chart-first interpretation that explains placements, houses, and life themes from verified birth data.",
    bestFor: "Birth chart clarity",
    href: "/kundli-ai?tool=kundli-ai",
    ctaLabel: "Open Kundli AI",
  },
  {
    icon: "numerology",
    title: "Numerology AI",
    description:
      "Core number interpretation connected to personality patterns, strengths, and practical timing themes.",
    bestFor: "Name and date insight",
    href: "/numerology",
    ctaLabel: "Explore Numerology",
  },
  {
    icon: "compatibility",
    title: "Marriage Compatibility AI",
    description:
      "Relationship guidance framed through compatibility signals, communication themes, and next-step clarity.",
    bestFor: "Relationship questions",
    href: "/kundli-ai?tool=marriage-compatibility-ai",
    ctaLabel: "Explore Compatibility",
  },
  {
    icon: "reports",
    title: "Career Guidance AI",
    description:
      "Career direction and timing themes explained from chart context, not generic motivation text.",
    bestFor: "Career decisions",
    href: "/kundli-ai?tool=career-guidance-ai",
    ctaLabel: "Open Career AI",
  },
  {
    icon: "reports",
    title: "Finance AI",
    description:
      "Financial caution, planning, and stability themes presented as reflective guidance, not guarantees.",
    bestFor: "Money planning",
    href: "/kundli-ai?tool=finance-ai",
    ctaLabel: "Open Finance AI",
  },
  {
    icon: "consultation",
    title: "Health AI",
    description:
      "Wellness-oriented astrology signals with clear safety boundaries and no medical certainty claims.",
    bestFor: "Wellbeing reflection",
    href: "/kundli-ai?tool=health-ai",
    ctaLabel: "Open Health AI",
  },
  {
    icon: "rashifal",
    title: "Daily Prediction AI",
    description:
      "Daily guidance that connects current themes with practical action and calm caution areas.",
    bestFor: "Daily decisions",
    href: "/kundli-ai?tool=daily-prediction-ai",
    ctaLabel: "Open Daily AI",
  },
  {
    icon: "ai",
    title: "Ask My Chart",
    description:
      "Protected assistant surface for direct chart-aware questions after your chart foundation is ready.",
    bestFor: "Follow-up questions",
    href: "/ai",
    ctaLabel: "Ask My Chart",
  },
] as const;

function AiToolIconFrame({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(244,213,143,0.34)] bg-[radial-gradient(circle_at_30%_28%,rgba(255,255,255,0.16),rgba(255,255,255,0.06)_70%)] text-[#f9efd3] shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
      {children}
    </span>
  );
}

function getAiToolIcon(icon: (typeof aiTools)[number]["icon"]) {
  switch (icon) {
    case "kundli":
      return <UtilityIcon name="kundli" />;
    case "rashifal":
      return <UtilityIcon name="rashifal" />;
    case "compatibility":
      return <UtilityIcon name="compatibility" />;
    case "consultation":
      return (
        <AiToolIconFrame>
          <ConsultationIcon className="h-6 w-6" />
        </AiToolIconFrame>
      );
    case "numerology":
      return <UtilityIcon name="numerology" />;
    case "reports":
      return (
        <AiToolIconFrame>
          <ReportIcon className="h-6 w-6" />
        </AiToolIconFrame>
      );
    default:
      return (
        <AiToolIconFrame>
          <NavagrahaAiIcon className="h-6 w-6 text-[rgba(255,244,202,0.96)]" />
        </AiToolIconFrame>
      );
  }
}

const predictiveStack = [
  {
    label: "Birth Chart",
    description: "Validated birth context creates the chart foundation.",
  },
  {
    label: "Dasha Timing",
    description: "Periods help frame what kind of themes may be active.",
  },
  {
    label: "Transit Context",
    description: "Current planetary movement adds timing awareness.",
  },
  {
    label: "Yoga / Rule Signals",
    description: "Structured rule checks keep interpretation grounded.",
  },
  {
    label: "Predictive Synthesis",
    description: "Signals are combined before AI wording is shown.",
  },
  {
    label: "AI Guidance",
    description: "The final response stays practical, safe, and structured.",
  },
] as const;

const differentiationPoints = [
  "Chart-aware interpretation, not generic chatbot output.",
  "Structured around Vedic sidereal chart rules and verified pipeline layers.",
  "Dasha, transit, yoga, and synthesis context can support deeper guidance when available.",
  "Human-guided continuity through consultation when decisions require nuanced review.",
] as const;

const sampleResponseSections = [
  {
    label: "Active Period",
    value: "The response identifies the timing layer available for interpretation when that context is present.",
  },
  {
    label: "Focus Areas",
    value: "Career rhythm, relationship communication, daily discipline, or planning priorities.",
  },
  {
    label: "Supportive Factors",
    value: "Signals are explained as tendencies and opportunities, not fixed outcomes.",
  },
  {
    label: "Caution Areas",
    value: "The system highlights careful choices without fear-based language.",
  },
] as const;

const aiFaqs = [
  {
    question: "Is NAVAGRAHA AI a generic chatbot?",
    answer:
      "No. The flagship flow is designed around chart context, calculation outputs, and safety rules before guidance is shown.",
  },
  {
    question: "Can AI replace consultation?",
    answer:
      "No. AI is useful for structured self-guidance, while important personal decisions should be reviewed through human consultation.",
  },
  {
    question: "Is my birth data private?",
    answer:
      "Protected Ask My Chart flows use saved account context. Public discovery pages do not expose private birth details.",
  },
  {
    question: "What is free vs premium?",
    answer:
      "Free paths provide entry-level guidance. Premium-ready reports and consultation paths support deeper structured analysis when needed.",
  },
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

      <section className="relative overflow-hidden border-b border-[rgba(212,175,55,0.24)] bg-[linear-gradient(180deg,#0c1022_0%,#120f2c_52%,#1f1232_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(138,92,246,0.22),transparent_34%),radial-gradient(circle_at_84%_14%,rgba(212,175,55,0.18),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(212,175,55,0.12),transparent_38%)]" />
        <Container className="relative grid gap-8 py-12 sm:py-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] lg:items-center">
          <div className="space-y-6">
            <Badge
              tone="neutral"
              className="border-[rgba(244,213,143,0.34)] bg-[rgba(255,255,255,0.08)] text-[#f8e4a8]"
            >
              NAVAGRAHA AI Flagship
            </Badge>
            <div className="space-y-4">
              <h1
                className="font-[family-name:var(--font-display)] text-[length:var(--font-size-display-md)] text-white sm:text-[length:var(--font-size-display-lg)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                NAVAGRAHA AI - chart-aware Vedic astrology intelligence.
              </h1>
              <p className="max-w-[44rem] text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[#f9efd3]">
                NAVAGRAHA AI connects Kundli context, Dasha timing, transit signals, rule-based checks, and safe interpretation into one calm guidance layer.
              </p>
              <p className="inline-flex rounded-[var(--radius-pill)] border border-[rgba(244,213,143,0.28)] bg-[rgba(255,255,255,0.07)] px-4 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-[#f8e4a8]">
                Powered by your birth chart
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <TrackedLink
                href="/ai"
                eventName="cta_click"
                eventPayload={{ page: "/ai", feature: "ai-hero-ask-my-chart" }}
                className={buttonStyles({
                  size: "lg",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Chat with NAVAGRAHA AI
              </TrackedLink>
              <TrackedLink
                href="/kundli"
                eventName="cta_click"
                eventPayload={{ page: "/ai", feature: "ai-hero-generate-kundli" }}
                className={buttonStyles({
                  size: "lg",
                  tone: "secondary",
                  className: "w-full justify-center border-[rgba(244,213,143,0.44)] bg-[rgba(255,255,255,0.08)] text-[#f9efd3] hover:bg-[rgba(255,255,255,0.14)] sm:w-auto",
                })}
              >
                Generate Kundli First
              </TrackedLink>
              <TrackedLink
                href="#ai-tool-family"
                eventName="cta_click"
                eventPayload={{ page: "/ai", feature: "ai-hero-explore-tools" }}
                className={buttonStyles({
                  size: "lg",
                  tone: "ghost",
                  className: "w-full justify-center text-[#f9efd3] hover:text-white sm:w-auto",
                })}
              >
                Explore AI Tools
              </TrackedLink>
            </div>
          </div>

          <NavagrahaAiGraphic mode="hero" />
        </Container>
      </section>

      <TrustIndicatorStrip items={aiTrustIndicators} />

      <Section
        tone="light"
        category="ai"
        eyebrow="How It Works"
        title="From chart setup to structured AI guidance."
        description="The flow is deterministic at the calculation layer and careful at the interpretation layer."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              step: "Step 1",
              title: "Generate or load chart",
              description:
                "Create your chart foundation with validated birth context and sidereal settings.",
            },
            {
              step: "Step 2",
              title: "Understand chart context",
              description:
                "NAVAGRAHA AI reads only the available chart, Dasha, transit, and rule context.",
            },
            {
              step: "Step 3",
              title: "Apply predictive layers",
              description:
                "Timing and rule signals are combined before guidance is presented.",
            },
            {
              step: "Step 4",
              title: "Receive structured guidance",
              description:
                "Outputs are framed as practical guidance with safety boundaries and next steps.",
            },
          ].map((item) => (
            <Card
              key={item.title}
              tone="light"
              className="space-y-3 border-[rgba(184,137,67,0.2)]"
            >
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
        id="ai-tool-family"
        tone="light"
        category="ai"
        eyebrow="AI Tools"
        title="Choose the AI tool that matches your current question."
        description="Each card has a clear job and routes to an existing public or protected NAVAGRAHA path."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {aiTools.map((tool) => (
            <Card
              key={tool.title}
              tone="light"
              interactive
              className="flex h-full flex-col space-y-4 border-[rgba(184,137,67,0.22)]"
            >
              <div className="flex items-center justify-between">
                {getAiToolIcon(tool.icon)}
                <Badge tone="neutral">AI Tool</Badge>
              </div>
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {tool.title}
              </h2>
              <div className="rounded-[var(--radius-pill)] border border-[rgba(184,137,67,0.2)] bg-[rgba(255,250,240,0.82)] px-3 py-2 text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                Best for: {tool.bestFor}
              </div>
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
                  className: "mt-auto w-full justify-center",
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
        tone="light"
        category="ai"
        eyebrow="Predictive Intelligence"
        title="The intelligence stack behind NAVAGRAHA AI."
        description="This visual layer explains why the experience is different from a generic chatbot without exposing technical clutter."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {predictiveStack.map((item, index) => (
            <Card
              key={item.label}
              tone="light"
              className="relative min-h-full border-[rgba(184,137,67,0.22)] p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(184,137,67,0.28)] bg-[rgba(255,248,235,0.9)] text-[0.72rem] font-semibold text-[var(--color-trust-text)]">
                  {index + 1}
                </span>
                <span className="hidden h-px flex-1 bg-[linear-gradient(90deg,rgba(184,137,67,0.36),rgba(184,137,67,0))] xl:block" />
              </div>
              <h2 className="text-[length:var(--font-size-body-md)] font-medium text-[var(--color-ink-strong)]">
                {item.label}
              </h2>
              <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="contrast"
        category="ai"
        eyebrow="Sample Output"
        title="A safe preview of the response structure."
        description="This is generic sample copy. It does not represent a real user chart or fabricated planetary placement."
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
                  Which area needs the most attention right now?
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                Structured AI Response
              </p>
              <div className="grid gap-3">
                {sampleResponseSections.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.9)] p-4"
                  >
                    <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </Section>

      <Section
        tone="light"
        category="ai"
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

      <Section
        tone="light"
        category="ai"
        eyebrow="Free vs Premium AI"
        title="Clear depth levels without aggressive paywalls."
        description="The AI experience stays useful at entry level and gives users honest next steps when they need deeper structure."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Free Guidance",
              description:
                "Basic chart-aware orientation, utility pathways, and safe first-pass interpretation.",
              cta: "Generate Kundli",
              href: "/kundli",
            },
            {
              title: "Premium-Ready AI",
              description:
                "Deeper follow-up questions, saved chart continuity, and report-oriented interpretation paths.",
              cta: "Ask My Chart",
              href: "/ai",
            },
            {
              title: "Report / Consultation Depth",
              description:
                "Structured predictive reports and human review for important career, marriage, finance, or life decisions.",
              cta: "View Reports",
              href: "/reports",
            },
          ].map((item) => (
            <Card
              key={item.title}
              tone="light"
              className="flex h-full flex-col gap-4 border-[rgba(184,137,67,0.22)]"
            >
              <Badge tone="trust">{item.title}</Badge>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.description}
              </p>
              <TrackedLink
                href={item.href}
                eventName="cta_click"
                eventPayload={{ page: "/ai", feature: `ai-depth-${item.title}` }}
                className={buttonStyles({
                  tone: "tertiary",
                  size: "sm",
                  className: "mt-auto w-full justify-center",
                })}
              >
                {item.cta}
              </TrackedLink>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="muted"
        category="ai"
        eyebrow="Human Consultation Bridge"
        title="Use AI for clarity. Use consultation for high-context decisions."
        description="NAVAGRAHA AI can prepare better questions, but sensitive decisions deserve careful human interpretation."
      >
        <Card
          tone="light"
          className="grid gap-5 border-[rgba(184,137,67,0.24)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-3">
            <Badge tone="trust">Joy Prakash Sarmah</Badge>
            <p className="max-w-3xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              For marriage, career, finance, health-sensitive concerns, or major life timing, continue from AI guidance into a calm human review with chart context.
            </p>
          </div>
          <TrackedLink
            href="/consultation"
            eventName="cta_click"
            eventPayload={{ page: "/ai", feature: "ai-consultation-bridge" }}
            className={buttonStyles({
              size: "lg",
              tone: "secondary",
              className: "w-full justify-center lg:w-auto",
            })}
          >
            Book Consultation
          </TrackedLink>
        </Card>
      </Section>

      <Section
        tone="light"
        category="ai"
        eyebrow="FAQ + Safety"
        title="Clear expectations before using AI guidance."
        description="The flagship AI experience is designed to be helpful, non-fear-based, and honest about its limits."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {aiFaqs.map((item) => (
            <Card key={item.question} tone="light" className="space-y-3">
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {item.question}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.answer}
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

      <Section className="pt-0" tone="transparent">
        <PremiumAICTA pagePath="/ai" placement="ai_page_mid" />
      </Section>

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
              Start with your Kundli foundation, then continue into Ask My Chart for structured, chart-aware guidance.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <TrackedLink
              href="/ai"
              eventName="cta_click"
              eventPayload={{ page: "/ai", feature: "ai-final-cta-ask-my-chart" }}
              className={buttonStyles({
                size: "lg",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Ask My Chart
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
