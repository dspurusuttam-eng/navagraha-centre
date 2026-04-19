import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { EditorialPlaceholder } from "@/components/site/editorial-placeholder";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { recommendConsultationNextAction } from "@/modules/consultations";
import { homePage } from "@/modules/marketing/content";
import { listSeoEntryPages } from "@/modules/marketing/seo-entry-pages";

export const metadata = buildPageMetadata({
  ...homePage.metadata,
});

export default function HomePage() {
  const conversion = recommendConsultationNextAction({
    surface: "home",
  });
  const seoEntryPages = listSeoEntryPages();
  const ctaHierarchy = {
    primary: {
      href: "/sign-up",
      label: "Generate Your Kundli",
    },
    secondary: {
      href: "/kundli-ai",
      label: "Explore NAVAGRAHA AI",
    },
    tertiary: {
      href: "/consultation?intent=consultation-ready",
      label: "Book Consultation Instead",
    },
  } as const;
  const trustStripItems = [
    {
      title: "Real Sidereal Math",
      description: "Lahiri-based chart calculations with deterministic engine outputs.",
    },
    {
      title: "Private by Design",
      description: "Birth details and chart context remain protected in member flows.",
    },
    {
      title: "Calm Guidance Tone",
      description: "No fear-based language, no guaranteed outcomes, clear boundaries.",
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

  return (
    <>
      <section className="relative overflow-hidden border-b border-[color:var(--color-border)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(215,187,131,0.26),transparent_34%),radial-gradient(circle_at_88%_12%,rgba(215,187,131,0.12),transparent_28%),radial-gradient(circle_at_56%_100%,rgba(215,187,131,0.08),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.016)_0%,rgba(255,255,255,0)_100%)]" />
        <div className="pointer-events-none absolute -left-10 top-8 h-44 w-44 rounded-full bg-[rgba(215,187,131,0.14)] blur-[72px] transition-opacity duration-700 sm:h-56 sm:w-56" />
        <Container className="relative grid gap-8 py-[var(--space-12)] sm:py-[var(--space-14)] lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
          <div className="space-y-6">
            <Badge tone="accent">NAVAGRAHA CENTRE</Badge>
            <div className="space-y-4">
              <h1
                className="max-w-4xl font-[family-name:var(--font-display)] text-[length:var(--font-size-display-lg)] text-[color:var(--color-foreground)] sm:text-[length:var(--font-size-display-xl)]"
                style={{
                  letterSpacing: "var(--tracking-display)",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Premium cosmic clarity, beginning with your exact Kundli.
              </h1>
              <p className="max-w-[42rem] text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                Start with a precise birth chart foundation, then move into AI
                guidance, consultation, and report layers through one calm,
                trusted journey.
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

            <Link
              href={ctaHierarchy.tertiary.href}
              className="inline-flex text-[0.76rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)] transition [transition-duration:var(--motion-duration-base)] hover:text-[color:var(--color-accent-strong)]"
            >
              {ctaHierarchy.tertiary.label}
            </Link>
          </div>

          <Card tone="accent" className="flex flex-col gap-5 p-6 sm:p-7">
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

        <Container className="relative pb-6 sm:pb-8">
          <div className="grid gap-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] p-3 sm:grid-cols-3">
            {trustStripItems.map((item) => (
              <div
                key={item.title}
                className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[rgba(14,12,10,0.65)] px-4 py-3"
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
              className={buttonStyles({ size: "lg", className: "w-full justify-center sm:w-auto" })}
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
                className: "w-full justify-center sm:w-auto",
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
                className={buttonStyles({ size: "sm", tone: "secondary" })}
              >
                {tool.ctaLabel}
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
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
                className={buttonStyles({ size: "sm", tone: "secondary" })}
              >
                {step.ctaLabel}
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
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
        description="Search-intent pages connect high-value topics to the same protected chart, report, and assistant journey."
        eyebrow="Popular Searches"
        title="Entry pages built for high-intent astrology needs"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {seoEntryPages.map((entry) => (
            <Card key={entry.path} interactive className="space-y-4">
              <Badge tone="neutral">{entry.hero.eyebrow}</Badge>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {entry.metadata.title}
              </h3>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {entry.metadata.description}
              </p>
              <Link
                href={entry.path}
                className={buttonStyles({ size: "sm", tone: "secondary" })}
              >
                Explore {entry.hero.eyebrow}
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        description="Remedies are part of the spiritual language of the brand, but they are framed with care, proportion, and transparency."
        eyebrow="Remedies"
        title="A careful remedies philosophy"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <EditorialPlaceholder
            annotations={[
              "Supportive, not coercive",
              "Spiritual, not fear-driven",
              "Transparent in scope and intent",
            ]}
            description="The visual language reinforces a remedies philosophy rooted in proportion, transparency, and care."
            eyebrow="Spiritual Support"
            title="Remedies should feel clear, proportionate, and respectfully explained"
            tone="midnight"
          />

          <div className="grid gap-4">
            {homePage.remedyPrinciples.map((principle) => (
              <Card key={principle.title} className="flex flex-col gap-3">
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
        </div>
      </Section>

      <Section
        tone="muted"
        description="The shop extends the public experience with the same premium restraint, careful storytelling, and editorial polish."
        eyebrow="Shop"
        title="A calm catalog of spiritual products and ritual objects"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <Card className="space-y-5">
            <Badge tone="accent">Spiritual Shop</Badge>
            <h3
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Product storytelling should feel ceremonial, not transactional.
            </h3>
            <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              The shop presents thoughtfully selected spiritual products with a
              premium, non-sensational tone so visitors can browse with clarity.
            </p>
            <Link href="/shop" className={buttonStyles({ tone: "secondary" })}>
              Visit Shop
            </Link>
          </Card>

          <EditorialPlaceholder
            annotations={[
              "Product storytelling with warmth",
              "Editorial merchandising over clutter",
              "Material detail without visual noise",
            ]}
            description="A stylized composition keeps the shop presentation premium and ceremonial without leaning on clutter or urgency."
            eyebrow="Merchandising View"
            title="Objects, ritual tools, and spiritual products shown with warmth and restraint"
          />
        </div>
      </Section>

      <Section
        description="The first FAQ layer answers trust questions early, so visitors understand the tone and boundaries of the platform before they reach out."
        eyebrow="FAQ Teaser"
        title="Questions the homepage answers immediately"
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
      </Section>

      <Section className="pt-0" tone="transparent">
        <Card
          tone="accent"
          className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_auto] lg:items-center"
        >
          <div className="space-y-4">
            <Badge tone="accent">Consultation CTA</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-foreground)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Start with a calm inquiry, then decide the right next step.
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {conversion.guidanceLine}
            </p>
            <p className="max-w-2xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {conversion.bestNextAction.description}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link
              href={conversion.bestNextAction.href}
              className={buttonStyles({ size: "lg", className: "w-full justify-center sm:w-auto" })}
            >
              {conversion.bestNextAction.label}
            </Link>
            <Link
              href={conversion.alternateAction.href}
              className={buttonStyles({
                size: "lg",
                tone: "secondary",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              {conversion.alternateAction.label}
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
