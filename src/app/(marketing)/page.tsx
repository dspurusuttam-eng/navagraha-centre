import { TrackedLink } from "@/components/analytics/tracked-link";
import { AdReadyZone } from "@/components/site/ad-ready-zone";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { curatedContentEntries } from "@/modules/content/catalog";
import { contentHubs } from "@/modules/content/hubs";
import { contentTypeLabels } from "@/modules/content";
import { recommendConsultationNextAction } from "@/modules/consultations";
import { globalCtaCopy } from "@/modules/localization/copy";
import { AiProductFamilySection } from "@/modules/marketing/components/ai-product-family-section";
import { homePage } from "@/modules/marketing/content";
import { listFeaturedShopProducts } from "@/modules/shop";

export const metadata = buildPageMetadata({
  ...homePage.metadata,
});

function formatPublishedDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    dateStyle: "medium",
  });
}

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
    .slice(0, 4);
  const featuredKnowledgeHubs = contentHubs.slice(0, 4);

  const heroCta = {
    primary: { href: "/sign-up", label: globalCtaCopy.generateKundli },
    secondary: { href: "/kundli-ai", label: globalCtaCopy.exploreAi },
    support: { href: "/consultation", label: globalCtaCopy.bookConsultation },
  } as const;

  const quickTools = [
    {
      icon: "KU",
      title: "Kundli",
      href: "/sign-up",
      feature: "home-quick-kundli",
    },
    {
      icon: "CO",
      title: "Compatibility",
      href: "/marriage-compatibility",
      feature: "home-quick-compatibility",
    },
    {
      icon: "RA",
      title: "Daily Rashifal",
      href: "/daily-rashifal",
      feature: "home-quick-rashifal",
    },
    {
      icon: "RE",
      title: "Reports",
      href: "/career-report",
      feature: "home-quick-reports",
    },
    {
      icon: "AI",
      title: "Ask My Chart",
      href: "/dashboard/ask-my-chart",
      feature: "home-quick-ask-my-chart",
    },
    {
      icon: "CS",
      title: "Consultation",
      href: "/consultation",
      feature: "home-quick-consultation",
    },
  ] as const;

  const trustStripItems = [
    "Vedic Calculation Engine",
    "AI-Powered Insights",
    "Secure Birth Data Handling",
    "Trusted Guidance",
  ] as const;

  const howItWorksSteps = [
    {
      step: "Step 1",
      title: "Enter Birth Details",
      description:
        "Create your account and provide date, time, and place for chart generation.",
    },
    {
      step: "Step 2",
      title: "Generate Chart",
      description:
        "Build your sidereal chart foundation with validated context and deterministic calculation.",
    },
    {
      step: "Step 3",
      title: "Explore AI Guidance",
      description:
        "Use NAVAGRAHA AI for chart-aware exploration across personal and decision-focused topics.",
    },
    {
      step: "Step 4",
      title: "Unlock Deeper Insight",
      description:
        "Continue into premium reports or astrologer consultation for deeper interpretation.",
    },
  ] as const;

  const consultationShowcase = [
    {
      title: "Private Reading",
      description:
        "One-to-one consultation for timing-sensitive decisions and personal clarity.",
      href: "/consultation?intent=consultation-ready",
    },
    {
      title: "Compatibility Session",
      description:
        "Dedicated relationship interpretation with compatibility-focused structure.",
      href: "/consultation?intent=compatibility-focused",
    },
    {
      title: "Remedy Guidance",
      description:
        "Practical remedy discussion with calm boundaries and non-fear framing.",
      href: "/consultation?intent=remedy-focused",
    },
  ] as const;

  const reportHighlights = [
    {
      title: "Career Report",
      description:
        "Structured direction for professional timing, strengths, and practical focus areas.",
      href: "/career-report",
      ctaLabel: "View Career Report",
    },
    {
      title: "Finance Report",
      description:
        "Chart-aware financial insight themes for risk awareness and long-term planning rhythm.",
      href: "/finance-report",
      ctaLabel: "View Finance Report",
    },
    {
      title: "Health Report",
      description:
        "Wellness-oriented interpretation framed responsibly and designed for reflective action.",
      href: "/health-report",
      ctaLabel: "View Health Report",
    },
  ] as const;

  const stackedCtaClass = "w-full justify-center sm:w-auto";

  return (
    <>
      <section className="relative overflow-hidden border-b border-[color:var(--color-border)] bg-[linear-gradient(180deg,var(--color-section-light)_0%,var(--color-section-light-muted)_60%,var(--color-section-light-strong)_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(226,194,124,0.2),transparent_36%),radial-gradient(circle_at_86%_12%,rgba(210,165,135,0.16),transparent_34%),radial-gradient(circle_at_72%_88%,rgba(204,170,112,0.12),transparent_38%)]" />
        <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-[rgba(226,194,124,0.16)] blur-[72px] sm:h-56 sm:w-56" />
        <div className="pointer-events-none absolute -right-14 top-14 h-40 w-40 rounded-full bg-[rgba(210,165,135,0.14)] blur-[72px] sm:h-52 sm:w-52" />

        <Container className="relative grid gap-8 py-12 sm:py-14 lg:grid-cols-[minmax(0,1.14fr)_minmax(340px,0.86fr)] lg:items-center">
          <div className="home-reveal home-reveal-delay-1 space-y-6">
            <Badge tone="trust">Global Vedic + AI Platform</Badge>
            <div className="space-y-4">
              <h1
                className="max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-md)] text-[var(--color-ink-strong)] sm:text-[length:var(--font-size-display-lg)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Unlock Your Destiny with AI-Powered Astrology
              </h1>
              <p className="max-w-[42rem] text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                Accurate Kundli charts, deeper insights, and personalized guidance.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <TrackedLink
                href={heroCta.primary.href}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "hero-generate-kundli" }}
                className={buttonStyles({
                  size: "lg",
                  className: stackedCtaClass,
                })}
              >
                {heroCta.primary.label}
              </TrackedLink>
              <TrackedLink
                href={heroCta.secondary.href}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: "hero-explore-ai" }}
                className={buttonStyles({
                  size: "lg",
                  tone: "secondary",
                  className: stackedCtaClass,
                })}
              >
                {heroCta.secondary.label}
              </TrackedLink>
            </div>

            <TrackedLink
              href={heroCta.support.href}
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "hero-support-consultation" }}
              className="inline-flex text-[0.78rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)] transition [transition-duration:var(--motion-duration-base)] hover:text-[var(--color-ink-strong)]"
            >
              {heroCta.support.label}
            </TrackedLink>
          </div>

          <div className="home-reveal home-reveal-delay-2">
            <Card className="home-polish-surface space-y-5 border-[color:var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(248,241,229,0.92)_56%,rgba(246,236,221,0.92)_100%)] p-6 shadow-[0_22px_56px_rgba(86,67,43,0.14)] sm:p-7">
              <Badge tone="trust">Premium Chart Intelligence</Badge>
              <h2
                className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[var(--color-ink-strong)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Built for global users who want clear astrology guidance without noisy prediction portals.
              </h2>
              <ul className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                  Deterministic Vedic chart foundation with validated birth context.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                  NAVAGRAHA AI responses grounded in actual chart structure.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                  Direct continuation to reports and consultation when depth is needed.
                </li>
              </ul>
            </Card>
          </div>
        </Container>

        <Container className="relative pb-5 sm:pb-6">
          <div className="home-reveal home-reveal-delay-3 grid gap-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.78)] p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
            {quickTools.map((tool) => (
              <TrackedLink
                key={tool.title}
                href={tool.href}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: tool.feature }}
                className="home-polish-surface group flex min-h-20 items-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.92)] px-4 py-3 shadow-[0_12px_24px_rgba(86,67,43,0.08)] transition [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--ease-standard)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[rgba(184,137,67,0.34)] motion-safe:hover:bg-[rgba(255,255,255,0.98)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f5ee]"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-trust-border)] bg-[var(--color-trust-bg)] text-[0.66rem] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  {tool.icon}
                </span>
                <span className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--color-ink-body)] sm:tracking-[var(--tracking-label)]">
                  {tool.title}
                </span>
              </TrackedLink>
            ))}
          </div>
        </Container>

        <Container className="relative pb-9 sm:pb-11">
          <div className="home-reveal home-reveal-delay-4 grid gap-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.72)] p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-4">
            {trustStripItems.map((item) => (
              <div
                key={item}
                className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.9)] px-4 py-3 text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]"
              >
                {item}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <div className="home-reveal home-reveal-delay-5">
        <AiProductFamilySection
          surface="public"
          pagePath="/"
          tone="light"
          eyebrow="NAVAGRAHA AI Flagship"
          title="A chart-first AI product family, not a single generic chatbot."
          description="NAVAGRAHA AI unifies Kundli reading, compatibility, career, remedies, and Ask My Chart with clear progression from free value to premium depth."
        />
      </div>

      <Section
        className="home-reveal home-reveal-delay-6"
        tone="light"
        eyebrow="How It Works"
        title="A simple path from first input to deeper insight."
        description="The full journey remains concise and globally understandable: from birth details to chart, AI guidance, and expert depth."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {howItWorksSteps.map((step) => (
            <Card
              key={step.title}
              tone="light"
              className="flex h-full flex-col gap-4"
            >
              <Badge tone="trust">{step.step}</Badge>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {step.title}
              </h3>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {step.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-7"
        tone="light"
        eyebrow="Consultation + Authority"
        title="When nuance matters, move into astrologer-led consultation."
        description="NAVAGRAHA CENTRE pairs AI utility with visible human authority so high-stakes questions can be handled with depth and care."
      >
        <Card
          tone="accent"
          className="mb-6 border-[var(--color-section-contrast-edge)] bg-[linear-gradient(160deg,rgba(255,251,244,0.97)_0%,rgba(244,231,205,0.9)_100%)] shadow-[var(--shadow-md)] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6"
        >
          <div className="space-y-3">
            <Badge tone="accent">Expert Consultation</Badge>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {conversion.guidanceLine}
            </p>
            <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {conversion.bestNextAction.description}
            </p>
          </div>
          <TrackedLink
            href="/consultation?intent=consultation-ready"
            eventName="cta_click"
            eventPayload={{ page: "/", feature: "consultation-primary-cta" }}
            className={buttonStyles({
              size: "lg",
              tone: "secondary",
              className: stackedCtaClass,
            })}
          >
            Book Consultation
          </TrackedLink>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {consultationShowcase.map((item) => (
            <Card
              key={item.title}
              interactive
              className="flex h-full flex-col gap-4 border-[rgba(184,137,67,0.24)] bg-[linear-gradient(165deg,rgba(255,255,255,0.96)_0%,rgba(246,236,218,0.92)_100%)]"
            >
              <Badge tone="neutral">Consultation Format</Badge>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {item.title}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {item.description}
              </p>
              <TrackedLink
                href={item.href}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: `consultation-card-${item.title}` }}
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center",
                })}
              >
                Open Session
              </TrackedLink>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-[rgba(184,137,67,0.24)] bg-[rgba(255,255,255,0.8)]">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="space-y-3">
              <Badge tone="neutral">Astrologer Authority</Badge>
              <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                Joy Prakash Sarmah remains the visible consultation authority behind interpretation quality, tone, and accountability.
              </p>
            </div>
            <TrackedLink
              href="/joy-prakash-sarmah"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "authority-profile-cta" }}
              className={buttonStyles({
                size: "sm",
                tone: "tertiary",
                className: stackedCtaClass,
              })}
            >
              View Astrologer Profile
            </TrackedLink>
          </div>
        </Card>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-8"
        tone="light"
        eyebrow="Premium Reports"
        title="Go deeper with focused report layers."
        description="Premium reports convert chart complexity into structured guidance that remains clear, calm, and action-oriented."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {reportHighlights.map((report) => (
            <Card
              key={report.title}
              tone="light"
              interactive
              className="flex h-full flex-col gap-4"
            >
              <Badge tone="trust">Report Layer</Badge>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {report.title}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {report.description}
              </p>
              <TrackedLink
                href={report.href}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: `reports-${report.title}` }}
                className={buttonStyles({
                  size: "sm",
                  tone: "tertiary",
                  className: "w-full justify-center",
                })}
              >
                {report.ctaLabel}
              </TrackedLink>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-8"
        tone="light"
        eyebrow="Remedies + Shop"
        title="Curated spiritual support, kept secondary to chart and guidance."
        description="Remedies and products are presented as optional and contextual supports, not primary conversion pressure."
      >
        <Card
          tone="light"
          className="mb-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6"
        >
          <div className="space-y-3">
            <Badge tone="trust">Editorial Remedy Philosophy</Badge>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Remedy pathways are framed with proportion and discretion. Purchase is optional; context and consultation remain primary.
            </p>
          </div>
          <TrackedLink
            href="/shop"
            eventName="cta_click"
            eventPayload={{ page: "/", feature: "shop-primary-cta" }}
            className={buttonStyles({
              size: "sm",
              tone: "secondary",
              className: stackedCtaClass,
            })}
          >
            Visit Shop
          </TrackedLink>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {featuredShopPreview.map((product) => (
            <Card
              key={product.slug}
              tone="light"
              interactive
              className="flex h-full flex-col gap-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="trust">{product.categoryLabel}</Badge>
                <Badge tone="outline">{product.typeLabel}</Badge>
              </div>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {product.name}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {product.summary}
              </p>
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                {product.priceLabel}
              </p>
              <TrackedLink
                href={product.href}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: `shop-product-${product.slug}` }}
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
      </Section>

      <Section
        className="home-reveal home-reveal-delay-8"
        tone="light"
        eyebrow="Latest Insights"
        title="Fresh editorial insights from NAVAGRAHA CENTRE."
        description="Read the latest astrology articles, forecasts, and guidance notes in one clean publishing surface."
      >
        <Card
          tone="light"
          className="mb-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6"
        >
          <div className="space-y-3">
            <Badge tone="trust">Insights Library</Badge>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
              Browse recent posts and then open the full insights library for deeper reading.
            </p>
          </div>
          <TrackedLink
            href="/insights"
            eventName="cta_click"
            eventPayload={{ page: "/", feature: "insights-library-cta" }}
            className={buttonStyles({
              size: "sm",
              tone: "secondary",
              className: stackedCtaClass,
            })}
          >
            View All Insights
          </TrackedLink>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {insightPreviewEntries.map((entry) => (
            <Card
              key={entry.slug}
              tone="light"
              interactive
              className="flex h-full flex-col gap-4"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge tone="trust">{contentTypeLabels[entry.type]}</Badge>
                <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                  {entry.readingTimeMinutes} min
                </p>
              </div>
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-trust-text)]">
                Published {formatPublishedDate(entry.publishedAt)}
              </p>
              <h3
                className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]"
                style={{ letterSpacing: "var(--tracking-display)" }}
              >
                {entry.title}
              </h3>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {entry.excerpt}
              </p>
              <TrackedLink
                href={entry.path}
                eventName="cta_click"
                eventPayload={{ page: "/", feature: `insight-${entry.slug}` }}
                className={buttonStyles({
                  size: "sm",
                  tone: "tertiary",
                  className: "w-full justify-center",
                })}
              >
                Read Article
              </TrackedLink>
            </Card>
          ))}
        </div>

        <AdReadyZone className="mt-6" />

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {featuredKnowledgeHubs.map((hub) => (
            <TrackedLink
              key={hub.slug}
              href={hub.path}
              eventName="cta_click"
              eventPayload={{ page: "/", feature: `knowledge-hub-${hub.slug}` }}
              className="home-polish-surface flex min-h-20 items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.92)] px-4 py-3 text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-ink-body)] transition [transition-duration:var(--motion-duration-base)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[rgba(184,137,67,0.34)]"
            >
              <span>{hub.title}</span>
              <span className="text-[var(--color-trust-text)]">Hub</span>
            </TrackedLink>
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-8"
        tone="light"
        eyebrow="FAQ"
        title="Common questions before you begin"
        description="Short answers to reduce hesitation and help users choose the right next step."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {homePage.faqTeaser.map((item) => (
            <Card key={item.question} tone="light">
              <details className="group">
                <summary className="cursor-pointer list-none rounded-[var(--radius-md)] pr-6 text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)] marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f5ee]">
                  {item.question}
                  <span className="ml-2 inline-block text-[var(--color-trust-text)] transition [transition-duration:var(--motion-duration-base)] group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                  {item.answer}
                </p>
              </details>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        className="home-reveal home-reveal-delay-8 pt-0"
        tone="transparent"
      >
        <Card
          tone="accent"
          className="home-polish-surface border-[var(--color-section-contrast-edge)] bg-[linear-gradient(165deg,rgba(255,252,246,0.98)_0%,rgba(244,231,205,0.94)_58%,rgba(239,224,197,0.96)_100%)] shadow-[var(--shadow-md)] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8"
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
              Begin with your Kundli. Continue with AI, reports, and expert consultation.
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Create your account, generate your chart foundation, and move into the guidance path that fits your current need.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <TrackedLink
              href="/sign-up"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "final-generate-kundli" }}
              className={buttonStyles({
                size: "lg",
                className: stackedCtaClass,
              })}
            >
              Generate Your Kundli
            </TrackedLink>
            <TrackedLink
              href="/consultation?intent=consultation-ready"
              eventName="cta_click"
              eventPayload={{ page: "/", feature: "final-book-consultation" }}
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
