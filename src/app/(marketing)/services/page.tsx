import Link from "next/link";
import { EditorialPlaceholder } from "@/components/site/editorial-placeholder";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { servicesPage } from "@/modules/marketing/content";

export const metadata = buildPageMetadata({
  ...servicesPage.metadata,
});

export default function ServicesPage() {
  return (
    <>
      <PageHero {...servicesPage.hero} />

      <Section
        description="The public service structure keeps the offer legible and premium before booking, billing, and operational layers are introduced."
        eyebrow="Offerings"
        title="Service categories with clear boundaries"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {servicesPage.offerings.map((offering) => (
            <Card
              key={offering.title}
              interactive
              className="flex h-full flex-col gap-4"
            >
              <Badge tone="neutral">Service</Badge>
              <div className="space-y-3">
                <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                  {offering.title}
                </h3>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {offering.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="muted"
        description="A premium consultation journey should help the client feel oriented at every step, even before live workflows are added."
        eyebrow="Process"
        title="How the experience is meant to feel"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <div className="grid gap-4">
            {servicesPage.process.map((step) => (
              <Card key={step.title} className="space-y-3">
                <Badge tone="outline">{step.title}</Badge>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>

          <EditorialPlaceholder
            annotations={[
              "Inquiry before automation",
              "Human-led interpretation",
              "Calm remedy framing",
            ]}
            description="The visual placeholder suggests a future consultation atmosphere without pretending that booking and fulfillment flows already exist."
            eyebrow="Experience"
            title="A premium service page should explain the journey before it explains the tools"
            tone="midnight"
          />
        </div>
      </Section>

      <Section className="pt-0" tone="transparent">
        <Card
          tone="accent"
          className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
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
              Move from service exploration to a direct inquiry.
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Once the visitor understands the structure, the best next step is
              a calm inquiry that can later connect to the manual consultation
              workflow.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className={buttonStyles({ size: "lg" })}>
              Start an Inquiry
            </Link>
            <Link
              href="/joy-prakash-sarmah"
              className={buttonStyles({ size: "lg", tone: "secondary" })}
            >
              View Astrologer Profile
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
