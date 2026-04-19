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
import { ContentCard } from "@/modules/content/components/content-card";
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
      title: "Vedic Precision",
      description: "Lahiri sidereal calculations for accurate Kundli outputs.",
    },
    {
      title: "AI Chart Insights",
      description: "Assistant responses grounded in your verified chart context.",
    },
    {
      title: "Private by Design",
      description: "Birth details and chart records stay in protected account flows.",
    },
    {
      title: "Reliable Guidance",
      description: "Calm interpretation with clear boundaries and no fear-based framing.",
    },
  ] as const;
  const aiFlagshipTools = [
    {
      title: "Ask My Chart",
      description:
        "Ask chart-aware questions using the validated Kundli context inside protected member flows.",
      href: "/dashboard/ask-my-chart",
      ctaLabel: "Open Ask My Chart",
    },
    {
      title: "Kundli AI Entry",
      description:
        "Explore the NAVAGRAHA AI public entry path and continue into onboarding with intent preserved.",
      href: "/kundli-ai",
      ctaLabel: "Explore NAVAGRAHA AI",
    },
    {
      title: "Report Intelligence",
      description:
        "Move from chart baseline to deeper report layers with premium-ready guidance surfaces.",
      href: "/dashboard/report",
      ctaLabel: "Open Report Workspace",
    },
  ] as const;
  const howItWorksSteps = [
    {
      step: "Step 1",
      title: "Create your account",
      description:
        "Start with a protected member account and enter your birth details securely.",
      href: "/sign-up",
      ctaLabel: "Generate Your Kundli",
    },
    {
      step: "Step 2",
      title: "Generate chart foundation",
      description:
        "Complete onboarding so the system resolves place, timezone, and validated chart context.",
      href: "/dashboard/onboarding",
      ctaLabel: "Go To Onboarding",
    },
    {
      step: "Step 3",
      title: "Use NAVAGRAHA AI",
      description:
        "Ask your chart-focused questions and receive grounded responses from the assistant layer.",
      href: "/dashboard/ask-my-chart",
      ctaLabel: "Ask My Chart",
    },
    {
      step: "Step 4",
      title: "Continue with depth",
      description:
        "Review report layers or choose consultation when you need deeper human interpretation.",
      href: "/consultation",
      ctaLabel: "Book Consultation",
    },
  ] as const;
  const consultationShowcase = [
    {
      title: "Private Reading",
      description:
        "A focused one-to-one consultation for timing, decisions, and life transitions.",
      href: "/consultation?intent=consultation-ready",
      ctaLabel: "Book Private Reading",
    },
    {
      title: "Compatibility Session",
      description:
        "A dedicated route for relationship dynamics, communication themes, and shared timing context.",
      href: "/consultation?intent=compatibility-focused",
      ctaLabel: "Book Compatibility Session",
    },
    {
      title: "Remedy Guidance Session",
      description:
        "Structured remedy conversation with careful, non-fear-based spiritual framing.",
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
  const inlineFocusLinkClass =
    "rounded-[var(--radius-pill)] px-1 py-1 transition [transition-duration:var(--motion-duration-base)] focus-visible:bg-[rgba(215,187,131,0.12)] focus-visible:text-[color:var(--color-accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] hover:text-[color:var(--color-accent-strong)]";

  return (
    <>
      <section className="relative overflow-hidden border-b border-[color:var(--color-border)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_6%,rgba(215,187,131,0.24),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(102,78,167,0.22),transparent_30%),radial-gradient(circle_at_58%_96%,rgba(33,50,97,0.22),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_100%)]" />
        <div className="pointer-events-none absolute -left-10 top-8 h-44 w-44 rounded-full bg-[rgba(215,187,131,0.14)] blur-[72px] transition-opacity duration-700 sm:h-56 sm:w-56" />
        <div className="pointer-events-none absolute -right-10 top-10 h-40 w-40 rounded-full bg-[rgba(101,85,170,0.2)] blur-[74px] transition-opacity duration-700 sm:h-52 sm:w-52" />
        <Container className="relative grid gap-8 py-[var(--space-10)] sm:py-[var(--space-12)] lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
          <div className="home-reveal home-reveal-delay-1 space-y-6">
            <Badge tone="accent">NAVAGRAHA CENTRE</Badge>
            <div className="space-y-4">
              <h1
                className="max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-lg)] text-[color:var(--color-foreground)] sm:text-[length:var(--font-size-display-xl)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Unlock Your Destiny with AI-Powered Astrology
              </h1>
              <p className="max-w-[42rem] text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                Accurate Kundli, Deep Insights, Personalized Guidance.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <TrackedLink
                href={ctaHierarchy.primary.href}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "hero-generate-kundli" }}
                className={buttonStyles({
                  tone: "accent",
                  size: "lg",
                  className: stackedCtaClass,
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
                  className: stackedCtaClass,
                })}
              >
                {ctaHierarchy.secondary.label}
              </TrackedLink>
            </div>
          </div>

          <Card tone="accent" className="home-reveal home-reveal-delay-2 home-polish-surface flex flex-col gap-5 p-6 sm:p-7">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Conversion Path Foundation
            </p>
            <ul className="space-y-4">
              <li className="border-b border-[color:var(--color-border)] pb-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                1. Generate the chart baseline with birth context validation.
              </li>
              <li className="border-b border-[color:var(--color-border)] pb-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                2. Explore NAVAGRAHA AI with chart-grounded assistant responses.
              </li>
              <li className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                3. Continue into consultation and premium reports when needed.
              </li>
            </ul>
          </Card>
        </Container>

        <Container className="relative pb-8 sm:pb-10">
          <div className="home-reveal home-reveal-delay-3 grid gap-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] p-3 sm:grid-cols-2 lg:grid-cols-4">
            {trustStripItems.map((item) => (
              <div
                key={item.title}
                className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[rgba(14,12,10,0.65)] px-4 py-3 transition [transition-duration:var(--motion-duration-base)] hover:border-[color:var(--color-border-strong)] hover:bg-[rgba(22,19,16,0.78)]"
              >
                <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  {item.title}
                </p>
                <p className="mt-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Section
        className="home-reveal home-reveal-delay-4"
        tone="muted"
        eyebrow="NAVAGRAHA AI Flagship"
        title="One flagship intelligence layer from chart foundation to guided decisions."
        description="NAVAGRAHA AI is positioned as a curated guidance stack, not a noisy tools list: chart baseline first, assistant depth next, then report and consultation continuity."
      >
        <Card
          tone="accent"
          className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
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
              NAVAGRAHA AI works best when your chart context is generated first.
            </h3>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Begin with onboarding and Kundli generation, then continue into
              AI guidance and report depth without changing routes or flow
              integrity.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
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
            <Card key={tool.title} interactive className="flex h-full flex-col gap-4">
              <Badge tone="neutral">AI Surface</Badge>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {tool.title}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {tool.description}
              </p>
              <Link
                href={tool.href}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center",
                })}
              >
                {tool.ctaLabel}
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-5"
        eyebrow="How It Works"
        title="A clear journey from first click to meaningful guidance."
        description="The path remains simple on desktop and mobile: create account, generate chart context, ask NAVAGRAHA AI, then continue with report or consultation."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {howItWorksSteps.map((step) => (
            <Card key={step.title} className="flex h-full flex-col gap-4">
              <Badge tone="outline">{step.step}</Badge>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {step.title}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {step.description}
              </p>
              <Link
                href={step.href}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center",
                })}
              >
                {step.ctaLabel}
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-6"
        tone="muted"
        eyebrow="Consultation Showcase"
        title="Consultation formats designed for high-trust decisions."
        description="Choose the right consultation path with clear scope first, then continue into booking with minimal friction."
      >
        <Card
          tone="accent"
          className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-3">
            <Badge tone="accent">Consultation Conversion</Badge>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {conversion.guidanceLine}
            </p>
            <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {conversion.bestNextAction.description}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <TrackedLink
              href="/consultation?intent=consultation-ready"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "consultation-showcase-primary" }}
              className={buttonStyles({ size: "lg", className: stackedCtaClass })}
            >
              Reserve Consultation
            </TrackedLink>
            <TrackedLink
              href={conversion.alternateAction.href}
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "consultation-showcase-alternate" }}
              className={buttonStyles({
                size: "lg",
                tone: "secondary",
                className: stackedCtaClass,
              })}
            >
              {conversion.alternateAction.label}
            </TrackedLink>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {consultationShowcase.map((item) => (
            <Card key={item.title} interactive className="flex h-full flex-col gap-4">
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
                  className: "w-full justify-center sm:w-auto",
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
                  className: "w-full justify-center sm:w-auto",
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
                  className={buttonStyles({ size: "sm", tone: "secondary" })}
                >
                  {service.label}
                </Link>
              ) : null}
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-8"
        tone="muted"
        description="A light editorial preview supports SEO exploration without distracting from the primary chart and consultation funnel."
        eyebrow="Insights Preview"
        title="Recent insight and blog entries from the editorial desk"
      >
        <Card tone="accent" className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-3">
            <Badge tone="accent">Editorial Layer</Badge>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
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
                className: "w-full justify-center sm:w-auto",
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
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Read FAQ Article
            </TrackedLink>
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {insightPreviewEntries.map((entry) => (
            <ContentCard key={entry.slug} entry={entry} />
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-8"
        description="Remedies are part of the spiritual language of the brand, but they are framed with care, proportion, and transparency."
        eyebrow="Premium Remedies Philosophy"
        title="Spiritual supports should be contextual, optional, and responsibly framed."
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
          <Card tone="accent" className="space-y-5">
            <Badge tone="accent">Editorial Remedy Framework</Badge>
            <h3
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Remedies are presented as supportive practices, never as guaranteed outcomes.
            </h3>
            <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              NAVAGRAHA CENTRE keeps remedy guidance calm and transparent. We
              prioritize personal context, timing, and consultation-led
              discernment over pressure, urgency, or fear-based language.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <TrackedLink
                href="/consultation?intent=remedy-focused"
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "remedy-philosophy-consultation" }}
                className={buttonStyles({ size: "sm", className: stackedCtaClass })}
              >
                Discuss Remedy Guidance
              </TrackedLink>
              <TrackedLink
                href="/dashboard/ask-my-chart"
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "remedy-philosophy-ask-chart" }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
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
            <Card key={principle.title} className="flex h-full flex-col gap-3">
              <Badge tone="outline">Guiding Principle</Badge>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {principle.title}
              </h3>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {principle.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-8"
        tone="muted"
        description="The shop remains a secondary discovery layer after chart, AI, and consultation paths are clear."
        eyebrow="Curated Shop Preview"
        title="A selective edit for calm product discovery."
      >
        <Card
          tone="accent"
          className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-3">
            <Badge tone="accent">Secondary Discovery Layer</Badge>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Browse spiritual products only when relevant to your practice.
              The core path remains chart context, NAVAGRAHA AI, and consultation.
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
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Visit Full Shop
            </TrackedLink>
            <TrackedLink
              href="/consultation?intent=consultation-ready"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "shop-preview-book-consultation" }}
              className={buttonStyles({
                size: "sm",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              Book Consultation First
            </TrackedLink>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredShopPreview.map((product) => (
            <Card key={product.slug} interactive className="flex h-full flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{product.categoryLabel}</Badge>
                <Badge tone="outline">{product.typeLabel}</Badge>
              </div>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {product.name}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {product.summary}
              </p>
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                {product.priceLabel}
              </p>
              <Link
                href={product.href}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center",
                })}
              >
                View Product
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-8"
        description="These answers reduce uncertainty and route visitors toward the right next step without heavy sales language."
        eyebrow="Homepage FAQ"
        title="Common questions before clients begin the journey"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {homePage.faqTeaser.map((item) => (
            <Card key={item.question} className="space-y-4">
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {item.question}
              </h3>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {item.answer}
              </p>
            </Card>
          ))}
        </div>

        <Card tone="accent" className="mt-6 space-y-5">
          <Badge tone="accent">Next Step Options</Badge>
          <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            If the basics are clear, begin with chart onboarding. If you need
            context first, use NAVAGRAHA AI or reserve consultation directly.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <TrackedLink
              href="/sign-up"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "faq-next-generate-kundli" }}
              className={buttonStyles({ size: "sm", className: stackedCtaClass })}
            >
              Generate Your Kundli
            </TrackedLink>
            <TrackedLink
              href="/kundli-ai"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "faq-next-navagraha-ai" }}
              className={buttonStyles({
                size: "sm",
                tone: "secondary",
                className: stackedCtaClass,
              })}
            >
              Explore NAVAGRAHA AI
            </TrackedLink>
            <TrackedLink
              href="/consultation?intent=consultation-ready"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "faq-next-consultation" }}
              className={buttonStyles({
                size: "sm",
                tone: "secondary",
                className: stackedCtaClass,
              })}
            >
              Book Consultation
            </TrackedLink>
          </div>
        </Card>
      </Section>

      <Section className="pt-0 home-reveal home-reveal-delay-8" tone="transparent">
        <Card
          tone="accent"
          className="home-polish-surface grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_auto] lg:items-center"
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
            <div className="flex flex-wrap items-center gap-3 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              <Link href="/dashboard/onboarding" className={inlineFocusLinkClass}>
                Onboarding
              </Link>
              <Link href="/dashboard/ask-my-chart" className={inlineFocusLinkClass}>
                AI Tools
              </Link>
              <Link href="/consultation?intent=consultation-ready" className={inlineFocusLinkClass}>
                Consultation
              </Link>
              <Link href="/dashboard/report" className={inlineFocusLinkClass}>
                Reports
              </Link>
            </div>
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
              href="/kundli-ai"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "final-cta-navagraha-ai" }}
              className={buttonStyles({
                size: "lg",
                tone: "secondary",
                className: stackedCtaClass,
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
