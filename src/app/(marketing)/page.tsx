import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { EditorialPlaceholder } from "@/components/site/editorial-placeholder";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { curatedContentEntries } from "@/modules/content/catalog";
import { recommendConsultationNextAction } from "@/modules/consultations";
import { homePage } from "@/modules/marketing/content";
import { listFeaturedShopProducts } from "@/modules/shop";

export const metadata = buildPageMetadata({
  ...homePage.metadata,
});

export default function HomePage() {
  const conversion = recommendConsultationNextAction({
    surface: "home",
  });
  const featuredShopPreview = listFeaturedShopProducts().slice(0, 3);
  const insightPreviewEntries = [...curatedContentEntries]
    .filter((entry) => entry.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 3);
  const ctaHierarchy = {
    primary: {
      href: "/sign-up",
      label: "Generate Your Kundli",
    },
    secondary: {
      href: "/kundli-ai",
      label: "Explore NAVAGRAHA AI",
    },
  } as const;
  const trustStripItems = [
    {
      title: "Vedic Calculation Engine",
      description: "Deterministic sidereal chart math with Lahiri alignment.",
    },
    {
      title: "AI-Powered Insights",
      description: "Chart-aware assistant guidance across protected journeys.",
    },
    {
      title: "Secure Birth Data Handling",
      description: "Birth details remain protected in authenticated flows.",
    },
    {
      title: "Trusted Astrology Guidance",
      description: "Calm interpretation boundaries with accountable authorship.",
    },
  ] as const;
  const quickTools = [
    {
      icon: "KG",
      title: "Kundli Generator",
      href: "/sign-up",
      feature: "quick-tools-kundli-generator",
    },
    {
      icon: "MC",
      title: "Marriage Compatibility",
      href: "/marriage-compatibility",
      feature: "quick-tools-marriage-compatibility",
    },
    {
      icon: "DR",
      title: "Daily Rashifal",
      href: "/daily-rashifal",
      feature: "quick-tools-daily-rashifal",
    },
    {
      icon: "NU",
      title: "Numerology",
      href: "/services",
      feature: "quick-tools-numerology",
    },
    {
      icon: "PA",
      title: "Panchang",
      href: "/daily-horoscope",
      feature: "quick-tools-panchang",
    },
    {
      icon: "AI",
      title: "AI Chat / Ask My Chart",
      href: "/kundli-ai",
      feature: "quick-tools-ai-chat",
    },
  ] as const;
  const aiFlagshipTools = [
    {
      title: "AI Kundli Reading",
      description:
        "Generate your chart foundation and begin an AI-guided reading path with deterministic astrology context.",
      href: "/kundli-ai",
      ctaLabel: "Start AI Kundli Reading",
      feature: "ai-flagship-kundli-reading",
    },
    {
      title: "AI Compatibility",
      description:
        "Open a compatibility-first flow for relationship timing, communication patterns, and shared chart guidance.",
      href: "/marriage-compatibility",
      ctaLabel: "View AI Compatibility",
      feature: "ai-flagship-compatibility",
    },
    {
      title: "AI Career Insights",
      description:
        "Route into career-focused chart analysis and structured next-step insights without generic forecasting noise.",
      href: "/career-prediction",
      ctaLabel: "Open Career Insights",
      feature: "ai-flagship-career-insights",
    },
    {
      title: "Ask My Chart",
      description:
        "Ask direct chart-aware questions inside the protected assistant surface when you need precise follow-up.",
      href: "/dashboard/ask-my-chart",
      ctaLabel: "Open Ask My Chart",
      feature: "ai-flagship-ask-chart",
    },
  ] as const;
  const howItWorksSteps = [
    {
      step: "Step 1",
      title: "Enter Birth Details",
      description:
        "Create your protected account and add birth date, birth time, and birthplace with private handling.",
      href: "/sign-up",
      ctaLabel: "Begin Secure Onboarding",
    },
    {
      step: "Step 2",
      title: "Generate Kundli",
      description:
        "Build your validated sidereal chart baseline with deterministic calculation and structured context.",
      href: "/sign-up",
      ctaLabel: "Generate Your Kundli",
    },
    {
      step: "Step 3",
      title: "Explore AI Guidance",
      description:
        "Open NAVAGRAHA AI to ask chart-aware questions and continue into guided interpretation pathways.",
      href: "/kundli-ai",
      ctaLabel: "Explore NAVAGRAHA AI",
    },
    {
      step: "Step 4",
      title: "Unlock Deeper Insight",
      description:
        "Move into expert consultation when decisions require deeper human judgment and nuance.",
      href: "/consultation?intent=consultation-ready",
      ctaLabel: "Book Expert Consultation",
    },
  ] as const;
  const consultationShowcase = [
    {
      title: "Private Reading",
      description:
        "A one-to-one consultation for timing-sensitive choices, transitions, and decision clarity.",
      href: "/consultation?intent=consultation-ready",
      ctaLabel: "Book Private Reading",
    },
    {
      title: "Compatibility Session",
      description:
        "A dedicated session for relationship dynamics, communication patterns, and shared timing context.",
      href: "/consultation?intent=compatibility-focused",
      ctaLabel: "Book Compatibility Session",
    },
    {
      title: "Remedy Guidance Session",
      description:
        "A structured remedy conversation with calm framing, practical boundaries, and spiritual care.",
      href: "/consultation?intent=remedy-focused",
      ctaLabel: "Book Remedy Session",
    },
  ] as const;
  const authoritySignals = [
    "Visible astrologer-led interpretation by Joy Prakash Sarmah",
    "Deterministic chart foundation before any AI reasoning layer",
    "Consultation tone focused on clarity, discretion, and proportion",
  ] as const;
  const stackedCtaClass = "w-full justify-center sm:w-auto";
  const fullWidthCtaClass = "w-full justify-center";
  const lightCardFrameClass =
    "border-[rgba(20,22,38,0.12)] bg-[rgba(255,255,255,0.9)] shadow-[0_12px_28px_rgba(33,31,52,0.08)]";
  const lightRaisedCardFrameClass =
    "home-polish-surface border-[rgba(20,22,38,0.12)] bg-[rgba(255,255,255,0.9)] shadow-[0_12px_28px_rgba(33,31,52,0.08)] motion-safe:hover:border-[rgba(79,58,134,0.22)] motion-safe:hover:shadow-[0_18px_38px_rgba(33,31,52,0.12)]";

  return (
    <>
      <section className="relative overflow-hidden border-b border-[rgba(19,22,38,0.12)] bg-[linear-gradient(180deg,#f9f7f2_0%,#f6f4ef_62%,#f2efe8_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(215,187,131,0.24),transparent_38%),radial-gradient(circle_at_88%_12%,rgba(103,84,170,0.16),transparent_34%),radial-gradient(circle_at_70%_94%,rgba(39,66,126,0.14),transparent_42%)]" />
        <div className="pointer-events-none absolute -left-12 top-8 h-40 w-40 rounded-full bg-[rgba(215,187,131,0.2)] blur-[70px] sm:h-52 sm:w-52" />
        <div className="pointer-events-none absolute -right-10 top-12 h-36 w-36 rounded-full bg-[rgba(103,84,170,0.18)] blur-[76px] sm:h-48 sm:w-48" />
        <Container className="relative grid gap-7 py-10 sm:py-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center">
          <div className="home-reveal home-reveal-delay-1 space-y-6">
            <span className="inline-flex rounded-[var(--radius-pill)] border border-[rgba(79,58,134,0.2)] bg-[rgba(79,58,134,0.07)] px-3 py-1 text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#4f3a86]">
              NAVAGRAHA CENTRE
            </span>
            <div className="space-y-4">
              <h1
                className="max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-lg)] text-[#181727] sm:text-[length:var(--font-size-display-xl)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Unlock Your Destiny with AI-Powered Astrology
              </h1>
              <p className="max-w-[42rem] text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[#4f4d60]">
                Accurate Kundli, Deep Insights, Personalized Guidance.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <TrackedLink
                href={ctaHierarchy.primary.href}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "hero-generate-kundli" }}
                className={buttonStyles({
                  tone: "accent",
                  size: "lg",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                {ctaHierarchy.primary.label}
              </TrackedLink>
              <TrackedLink
                href={ctaHierarchy.secondary.href}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "hero-navagraha-ai" }}
                className={buttonStyles({
                  tone: "secondary",
                  size: "lg",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                {ctaHierarchy.secondary.label}
              </TrackedLink>
            </div>
          </div>

          <div className="home-reveal home-reveal-delay-2">
            <div className="home-polish-surface relative overflow-hidden rounded-[var(--radius-xl)] border border-[rgba(21,26,46,0.16)] bg-[linear-gradient(160deg,rgba(255,255,255,0.95)_0%,rgba(244,240,234,0.92)_62%,rgba(236,230,246,0.9)_100%)] p-6 shadow-[0_22px_55px_rgba(31,33,56,0.12)] sm:p-7">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(103,84,170,0.22),transparent_40%),radial-gradient(circle_at_15%_88%,rgba(215,187,131,0.25),transparent_38%)]" />
              <div className="relative space-y-5">
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#4f3a86]">
                  Premium Chart + AI Layer
                </p>
                <h2
                  className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[#191827]"
                  style={{
                    letterSpacing: "var(--tracking-display)",
                    lineHeight: "var(--line-height-tight)",
                  }}
                >
                  Vedic chart precision with structured AI guidance.
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4f4d60]">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#6a4faa]" />
                    Accurate birth context, timezone, and sidereal chart generation.
                  </li>
                  <li className="flex items-start gap-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4f4d60]">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#6a4faa]" />
                    Chart-aware AI responses grounded in your personal placements.
                  </li>
                  <li className="flex items-start gap-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4f4d60]">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#6a4faa]" />
                    Clear continuation to consultation when deeper interpretation is needed.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Container>

        <Container className="relative pb-4 sm:pb-5">
          <div className="home-reveal home-reveal-delay-3 grid gap-3 rounded-[var(--radius-xl)] border border-[rgba(20,22,38,0.12)] bg-[rgba(255,255,255,0.74)] p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
            {quickTools.map((tool) => (
              <TrackedLink
                key={tool.title}
                href={tool.href}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: tool.feature }}
                className="home-polish-surface group flex min-h-20 items-center gap-3 rounded-[var(--radius-lg)] border border-[rgba(20,22,38,0.12)] bg-[rgba(255,255,255,0.9)] px-4 py-3 shadow-[0_10px_22px_rgba(33,31,52,0.07)] transition [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--ease-standard)] motion-safe:hover:-translate-y-0.5 hover:border-[rgba(79,58,134,0.34)] hover:bg-[rgba(255,255,255,0.97)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ec]"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(79,58,134,0.24)] bg-[rgba(79,58,134,0.09)] text-[0.66rem] font-semibold uppercase tracking-[var(--tracking-label)] text-[#4f3a86] transition [transition-duration:var(--motion-duration-base)] group-hover:border-[rgba(79,58,134,0.34)] group-hover:bg-[rgba(79,58,134,0.16)]">
                  {tool.icon}
                </span>
                <span className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[#26243a] transition [transition-duration:var(--motion-duration-base)] group-hover:text-[#1a1830] sm:tracking-[var(--tracking-label)]">
                  {tool.title}
                </span>
              </TrackedLink>
            ))}
          </div>
        </Container>

        <Container className="relative pb-8 sm:pb-10">
          <div className="home-reveal home-reveal-delay-4 grid gap-3 rounded-[var(--radius-xl)] border border-[rgba(20,22,38,0.12)] bg-[rgba(255,255,255,0.66)] p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-4">
            {trustStripItems.map((item) => (
              <div
                key={item.title}
                className="home-polish-surface rounded-[var(--radius-lg)] border border-[rgba(20,22,38,0.12)] bg-[rgba(255,255,255,0.9)] px-4 py-3 shadow-[0_10px_22px_rgba(33,31,52,0.07)] transition [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--ease-standard)] hover:border-[rgba(20,22,38,0.2)] hover:bg-[rgba(255,255,255,0.95)]"
              >
                <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[#4f3a86]">
                  {item.title}
                </p>
                <p className="mt-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#58566a]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Section
        className="home-reveal home-reveal-delay-5 relative overflow-hidden border-y border-[rgba(214,186,132,0.2)] bg-[radial-gradient(circle_at_14%_10%,rgba(214,186,132,0.22),transparent_32%),radial-gradient(circle_at_84%_18%,rgba(97,78,163,0.32),transparent_38%),linear-gradient(180deg,#131019_0%,#0b0a12_58%,#09080f_100%)]"
        tone="transparent"
        eyebrow="NAVAGRAHA AI Flagship"
        title="One flagship intelligence layer for chart-led decision clarity."
        description="NAVAGRAHA AI combines deterministic chart context with focused guidance surfaces, presented in a curated premium stack instead of fragmented tools."
      >
        <Card
          tone="accent"
          className="mb-6 border-[rgba(214,186,132,0.36)] bg-[linear-gradient(160deg,rgba(48,37,62,0.9)_0%,rgba(20,16,28,0.96)_56%,rgba(14,11,20,0.98)_100%)] shadow-[0_20px_55px_rgba(9,8,18,0.45)] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6"
        >
          <div className="space-y-3">
            <Badge tone="accent">Flagship Layer</Badge>
            <h3
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Dark contrast, calm structure, and chart-grounded intelligence from the first click.
            </h3>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Begin with your Kundli baseline, move into AI responses, then
              continue to deeper report or consultation surfaces without
              breaking conversion flow.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
            <TrackedLink
              href="/sign-up"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "ai-flagship-generate-kundli" }}
              className={buttonStyles({ size: "lg", className: stackedCtaClass })}
            >
              Generate Your Kundli
            </TrackedLink>
            <TrackedLink
              href="/kundli-ai"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "ai-flagship-explore-navagraha-ai" }}
              className={buttonStyles({
                tone: "secondary",
                size: "lg",
                className: stackedCtaClass,
              })}
            >
              Explore NAVAGRAHA AI
            </TrackedLink>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {aiFlagshipTools.map((tool) => (
            <Card
              key={tool.title}
              interactive
              className="flex h-full flex-col gap-4 border-[rgba(214,186,132,0.24)] bg-[linear-gradient(165deg,rgba(35,28,48,0.88)_0%,rgba(13,12,20,0.92)_100%)]"
            >
              <Badge tone="neutral">AI Surface</Badge>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {tool.title}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {tool.description}
              </p>
              <TrackedLink
                href={tool.href}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: tool.feature }}
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
      </Section>

      <Section
        className="home-reveal home-reveal-delay-6 border-y border-[rgba(20,22,38,0.1)] bg-[linear-gradient(180deg,rgba(250,248,244,0.96)_0%,rgba(245,242,236,0.92)_100%)]"
        tone="transparent"
        eyebrow="How It Works"
        title="A clear four-step journey from birth input to deeper guidance."
        description="Simple on desktop and mobile: enter birth details, generate Kundli, explore AI guidance, then continue into deeper expert insight when needed."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {howItWorksSteps.map((step) => (
            <Card
              key={step.title}
              className="flex h-full flex-col gap-4 border-[rgba(20,22,38,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(247,244,238,0.92)_100%)] shadow-[0_16px_36px_rgba(33,31,52,0.1)]"
            >
              <Badge tone="accent">{step.step}</Badge>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[#1f1d31]">
                {step.title}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#57556a]">
                {step.description}
              </p>
              <Link
                href={step.href}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: fullWidthCtaClass,
                })}
              >
                {step.ctaLabel}
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-7 relative overflow-hidden border-y border-[rgba(214,186,132,0.22)] bg-[radial-gradient(circle_at_18%_12%,rgba(214,186,132,0.2),transparent_36%),radial-gradient(circle_at_82%_16%,rgba(92,73,150,0.2),transparent_38%),linear-gradient(180deg,#171320_0%,#0f0d16_100%)]"
        tone="transparent"
        eyebrow="Consultation Showcase"
        title="Expert consultation for decisions that need deeper human nuance."
        description="When digital guidance is not enough, move into a premium astrologer-led consultation path with clear scope and calm authority."
      >
        <Card
          tone="accent"
          className="mb-6 border-[rgba(214,186,132,0.34)] bg-[linear-gradient(160deg,rgba(50,38,64,0.9)_0%,rgba(23,18,32,0.96)_100%)] shadow-[0_22px_52px_rgba(9,8,18,0.45)] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6"
        >
          <div className="space-y-3">
            <Badge tone="accent">Expert Consultation</Badge>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {conversion.guidanceLine}
            </p>
            <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {conversion.bestNextAction.description}
            </p>
            <p className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[rgba(214,186,132,0.88)]">
              Prefer to begin digitally?{" "}
              <TrackedLink
                href="/sign-up"
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "consultation-showcase-generate-kundli" }}
                className="underline decoration-[rgba(214,186,132,0.65)] underline-offset-4 transition [transition-duration:var(--motion-duration-base)] hover:text-[color:var(--color-foreground)]"
              >
                Generate Your Kundli
              </TrackedLink>
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <TrackedLink
              href="/consultation?intent=consultation-ready"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "consultation-showcase-primary" }}
              className={buttonStyles({
                size: "lg",
                tone: "secondary",
                className: stackedCtaClass,
              })}
            >
              Reserve Consultation
            </TrackedLink>
            <TrackedLink
              href={conversion.alternateAction.href}
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "consultation-showcase-alternate" }}
              className={buttonStyles({
                size: "lg",
                tone: "ghost",
                className: stackedCtaClass,
              })}
            >
              {conversion.alternateAction.label}
            </TrackedLink>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {consultationShowcase.map((item) => (
            <Card
              key={item.title}
              interactive
              className="flex h-full flex-col gap-4 border-[rgba(214,186,132,0.24)] bg-[linear-gradient(165deg,rgba(39,31,52,0.88)_0%,rgba(16,14,24,0.94)_100%)]"
            >
              <Badge tone="neutral">Consultation Format</Badge>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {item.title}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {item.description}
              </p>
              <Link
                href={item.href}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center",
                })}
              >
                {item.ctaLabel}
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-7"
        eyebrow="Astrologer Authority"
        title="Trust built on visible authorship and disciplined interpretation."
        description="NAVAGRAHA CENTRE positions the astrologer and method clearly, so guidance feels credible, calm, and accountable."
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <Card tone="accent" className="space-y-5">
            <Badge tone="accent">Joy Prakash Sarmah</Badge>
            <h3
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              A premium consultation house led by a named astrologer, not an anonymous feed.
            </h3>
            <ul className="space-y-3">
              {authoritySignals.map((signal) => (
                <li
                  key={signal}
                  className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
                >
                  {signal}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <TrackedLink
                href="/joy-prakash-sarmah"
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "authority-profile" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: stackedCtaClass,
                })}
              >
                View Astrologer Profile
              </TrackedLink>
              <TrackedLink
                href="/consultation?intent=consultation-ready"
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "authority-book-consultation" }}
                className={buttonStyles({
                  size: "sm",
                  className: stackedCtaClass,
                })}
              >
                Book Consultation
              </TrackedLink>
            </div>
          </Card>

          <EditorialPlaceholder
            annotations={[
              "Human-led authority over anonymous predictions",
              "Calm language with explicit boundaries",
              "Premium consultation pacing from inquiry to booking",
            ]}
            description="Authority is presented through method, tone, and visible authorship rather than exaggerated claims."
            eyebrow="Authority Framework"
            title="A trust model grounded in clear authorship and accountable interpretation"
          />
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-8"
        description="Luxury and trust are expressed through tone, restraint, and clarity from the very first visit."
        eyebrow="Trust"
        title="A public experience built to feel composed from the first visit"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="grid gap-4 sm:grid-cols-3">
            {homePage.trustPillars.map((pillar) => (
              <Card
                key={pillar.title}
                interactive
                className="flex h-full flex-col gap-4"
              >
                <Badge tone="neutral">Trust Pillar</Badge>
                <div className="space-y-3">
                  <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                    {pillar.title}
                  </h3>
                  <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                    {pillar.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <EditorialPlaceholder
            annotations={[
              "Editorial layout instead of template clutter",
              "Spiritual tone without mystical excess",
              "Luxury pacing designed for trust",
            ]}
            description="A composed visual motif gives the page atmosphere and narrative weight while preserving the restrained editorial direction."
            eyebrow="Editorial Atmosphere"
            title="Premium visual rhythm shaped for calm trust"
          />
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-8"
        tone="muted"
        description="The core offer is framed as a clear, elevated set of guidance surfaces rather than a crowded menu of dramatic promises."
        eyebrow="Services Overview"
        title="Structured offerings for thoughtful clients"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {homePage.services.map((service) => (
            <Card
              key={service.title}
              interactive
              className="flex h-full flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <Badge tone="accent">Offering</Badge>
                <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                  {service.title}
                </h3>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {service.description}
                </p>
              </div>

              {service.href && service.label ? (
                <Link
                  href={service.href}
                  className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className:
                      "w-full justify-center whitespace-normal text-center sm:w-auto sm:whitespace-nowrap",
                  })}
                >
                  {service.label}
                </Link>
              ) : null}
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-8 border-y border-[rgba(20,22,38,0.1)] bg-[linear-gradient(180deg,rgba(249,247,242,0.92)_0%,rgba(243,239,231,0.86)_100%)]"
        tone="transparent"
        description="A concise editorial preview supports browsing and SEO depth while staying clearly secondary to chart and consultation conversion."
        eyebrow="Insights Preview"
        title="Recent insight and blog entries from the editorial desk"
      >
        <Card className="mb-6 grid gap-5 border-[rgba(20,22,38,0.12)] bg-[rgba(255,255,255,0.88)] shadow-[0_14px_30px_rgba(33,31,52,0.08)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-3">
            <Badge tone="outline">Editorial Layer</Badge>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[#5b596d]">
              Explore forecasts, FAQs, and long-form articles reviewed for tone,
              safety, and clarity.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <TrackedLink
              href="/insights"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "insights-preview-open-library" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: stackedCtaClass,
                })}
              >
                Explore Full Insights
            </TrackedLink>
            <TrackedLink
              href="/insights/guidance-and-remedies-frequently-asked-questions"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "insights-preview-faq-entry" }}
                className={buttonStyles({
                  size: "sm",
                  className: stackedCtaClass,
                })}
              >
                Read FAQ Article
            </TrackedLink>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {insightPreviewEntries.map((entry) => (
            <Card
              key={entry.slug}
              interactive
              className={`flex h-full flex-col gap-4 ${lightRaisedCardFrameClass}`}
            >
              <div className="flex items-center justify-between gap-3">
                <Badge tone="neutral">{entry.type.replaceAll("_", " ")}</Badge>
                <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[#4f3a86]">
                  {entry.readingTimeMinutes} min
                </p>
              </div>
              <h3
                className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[#1f1d31]"
                style={{ letterSpacing: "var(--tracking-display)" }}
              >
                {entry.title}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#5c5a6d]">
                {entry.excerpt}
              </p>
              <Link
                href={entry.path}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: fullWidthCtaClass,
                })}
              >
                Read Insight
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-8 border-y border-[rgba(20,22,38,0.1)] bg-[linear-gradient(180deg,rgba(248,246,241,0.95)_0%,rgba(242,238,230,0.9)_100%)]"
        tone="transparent"
        description="Remedies are framed as optional spiritual supports, presented with calm editorial clarity and practical boundaries."
        eyebrow="Premium Remedies Philosophy"
        title="A spiritual philosophy rooted in discretion, proportion, and context."
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
          <Card className="space-y-5 border-[rgba(20,22,38,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(246,242,236,0.92)_100%)] shadow-[0_16px_36px_rgba(33,31,52,0.1)]">
            <Badge tone="accent">Editorial Remedy Framework</Badge>
            <h3
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[#1d1c2f]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Remedies support practice, but they never replace judgment or guarantee outcomes.
            </h3>
            <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[#57556b]">
              NAVAGRAHA CENTRE keeps remedy guidance calm and transparent. We
              prioritize personal context, consultation-led discernment, and
              measured recommendations over urgency or fear-based language.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <TrackedLink
                href="/consultation?intent=remedy-focused"
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "remedy-philosophy-consultation" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: stackedCtaClass,
                })}
              >
                Discuss Remedy Guidance
              </TrackedLink>
              <TrackedLink
                href="/dashboard/ask-my-chart"
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "remedy-philosophy-ask-chart" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "ghost",
                  className: stackedCtaClass,
                })}
              >
                Ask My Chart First
              </TrackedLink>
            </div>
          </Card>

          <EditorialPlaceholder
            annotations={[
              "Supportive and optional",
              "No fear-based remedy language",
              "Context-led consultation first",
            ]}
            description="The remedies layer is intentionally restrained: spiritually respectful, commercially calm, and explicit about boundaries."
            eyebrow="Remedy Tone"
            title="A premium spiritual voice should feel grounded, clear, and never coercive"
            tone="midnight"
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {homePage.remedyPrinciples.map((principle) => (
            <Card
              key={principle.title}
              className={`flex h-full flex-col gap-3 ${lightCardFrameClass}`}
            >
              <Badge tone="outline">Guiding Principle</Badge>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[#201f33]">
                {principle.title}
              </h3>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#5c5a6d]">
                {principle.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-8 border-y border-[rgba(20,22,38,0.1)] bg-[linear-gradient(180deg,rgba(246,243,236,0.92)_0%,rgba(241,237,229,0.86)_100%)]"
        tone="transparent"
        description="The shop remains a secondary discovery layer after chart, AI, and consultation paths are established."
        eyebrow="Curated Shop Preview"
        title="A restrained edit for premium product discovery."
      >
        <Card
          className="mb-6 grid gap-5 border-[rgba(20,22,38,0.12)] bg-[rgba(255,255,255,0.86)] shadow-[0_14px_30px_rgba(33,31,52,0.08)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-3">
            <Badge tone="outline">Secondary Discovery Layer</Badge>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[#5b596c]">
              Browse spiritual products only when relevant to your practice.
              The core path remains chart context, NAVAGRAHA AI, and consultation.
            </p>
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#4f3a86]">
              Curated mix: Rudraksha, gemstone review, and yantra-focused records.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <TrackedLink
              href="/shop"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "shop-preview-open-shop" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: stackedCtaClass,
                })}
              >
                Visit Full Shop
            </TrackedLink>
            <TrackedLink
              href="/shop#featured-edit"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "shop-preview-featured-edit" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "ghost",
                  className: stackedCtaClass,
                })}
              >
                View Featured Edit
            </TrackedLink>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredShopPreview.map((product) => (
            <Card
              key={product.slug}
              interactive
              className={`flex h-full flex-col gap-4 ${lightRaisedCardFrameClass}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{product.categoryLabel}</Badge>
                <Badge tone="outline">{product.typeLabel}</Badge>
              </div>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[#1f1d31]">
                {product.name}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#5c5a6d]">
                {product.summary}
              </p>
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#4f3a86]">
                {product.priceLabel}
              </p>
              <Link
                href={product.href}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: fullWidthCtaClass,
                })}
              >
                View Product
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-8 border-y border-[rgba(20,22,38,0.1)] bg-[linear-gradient(180deg,rgba(250,248,244,0.94)_0%,rgba(244,240,233,0.88)_100%)]"
        tone="transparent"
        description="A clear FAQ layer reduces hesitation and helps visitors choose the right next action with confidence."
        eyebrow="Homepage FAQ"
        title="Common questions before clients begin the journey"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {homePage.faqTeaser.map((item) => (
            <Card
              key={item.question}
              className={lightCardFrameClass}
            >
              <details className="group">
                <summary className="cursor-pointer list-none rounded-[var(--radius-md)] pr-7 text-[length:var(--font-size-body-lg)] font-medium text-[#1f1d31] marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ec]">
                  {item.question}
                  <span className="pointer-events-none ml-2 inline-block text-[#4f3a86] transition [transition-duration:var(--motion-duration-base)] group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#5c5a6d]">
                  {item.answer}
                </p>
              </details>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-[rgba(20,22,38,0.12)] bg-[rgba(255,255,255,0.88)] shadow-[0_14px_30px_rgba(33,31,52,0.08)]">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="space-y-3">
              <Badge tone="outline">Next Step Options</Badge>
              <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[#5b596c]">
                Ready to continue? Generate your Kundli first, or choose consultation when you want deeper expert interpretation.
              </p>
            </div>
            <TrackedLink
              href="/sign-up"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "faq-next-generate-kundli" }}
              className={buttonStyles({
                size: "sm",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Generate Your Kundli
            </TrackedLink>
          </div>
        </Card>
      </Section>

      <Section className="pt-0 home-reveal home-reveal-delay-8" tone="transparent">
        <Card
          tone="accent"
          className="home-polish-surface border-[rgba(214,186,132,0.36)] bg-[linear-gradient(165deg,rgba(47,35,61,0.92)_0%,rgba(20,16,28,0.97)_58%,rgba(13,10,19,0.99)_100%)] shadow-[0_22px_55px_rgba(9,8,18,0.45)] lg:grid lg:grid-cols-[minmax(0,1.1fr)_auto] lg:items-center lg:gap-8"
        >
          <div className="space-y-4">
            <Badge tone="accent">Final CTA</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-foreground)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Begin with your Kundli foundation, then continue with AI, reports, and consultation.
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Create your account, complete onboarding, and unlock the full
              guided flow with chart context at the center.
            </p>
            <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {conversion.guidanceLine}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <TrackedLink
              href="/sign-up"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "final-cta-generate-kundli" }}
              className={buttonStyles({ size: "lg", className: stackedCtaClass })}
            >
              Generate Your Kundli
            </TrackedLink>
            <TrackedLink
              href="/consultation?intent=consultation-ready"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "final-cta-book-consultation" }}
              className={buttonStyles({
                size: "lg",
                tone: "secondary",
                className: stackedCtaClass,
              })}
            >
              Book Consultation
            </TrackedLink>
          </div>
        </Card>
      </Section>
    </>
  );
}
