import Link from "next/link";
import { EditorialPlaceholder } from "@/components/site/editorial-placeholder";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { homePage } from "@/modules/marketing/content";

export const metadata = buildPageMetadata({
  ...homePage.metadata,
});

export default function HomePage() {
  return (
    <>
      <PageHero {...homePage.hero} />

      <Section
        description="Luxury and trust are expressed through tone, restraint, and clarity long before any consultation flow becomes operational."
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
            description="A placeholder visual block stands in for future photography or illustration while still giving the page atmosphere and narrative weight."
            eyebrow="Placeholder Imagery"
            title="Premium visual rhythm without waiting for final assets"
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
            description="This placeholder illustration block signals the future remedies editorial direction without overstating what the platform offers today."
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
        description="A future shop can enter the public experience with the same premium restraint, careful storytelling, and editorial polish."
        eyebrow="Shop Teaser"
        title="Space reserved for spiritual products and ritual objects"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <Card className="space-y-5">
            <Badge tone="accent">Future Commerce</Badge>
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
              The shop layer is intentionally teaser-only for now, but the
              public site already makes space for thoughtfully presented
              spiritual products when the commerce phase begins.
            </p>
            <Link href="/shop" className={buttonStyles({ tone: "secondary" })}>
              View Shop Teaser
            </Link>
          </Card>

          <EditorialPlaceholder
            annotations={[
              "Product storytelling with warmth",
              "Editorial merchandising over clutter",
              "Prepared for later commerce integration",
            ]}
            description="A stylized placeholder gives the shop teaser a premium visual anchor until final brand imagery is available."
            eyebrow="Placeholder Visual"
            title="Objects, ritual tools, and spiritual products can enter later without breaking the brand language"
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
              The public website leads with trust, but the next step is simple:
              learn about the astrologer or begin a direct inquiry for a future
              consultation workflow.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className={buttonStyles({ size: "lg" })}>
              Contact NAVAGRAHA CENTRE
            </Link>
            <Link
              href="/joy-prakash-sarmah"
              className={buttonStyles({ size: "lg", tone: "secondary" })}
            >
              Meet Joy Prakash Sarmah
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
