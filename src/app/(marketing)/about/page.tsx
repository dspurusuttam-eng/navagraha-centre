import Link from "next/link";
import { EditorialPlaceholder } from "@/components/site/editorial-placeholder";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { aboutPage } from "@/modules/marketing/content";

export const metadata = buildPageMetadata({
  ...aboutPage.metadata,
});

export default function AboutPage() {
  return (
    <>
      <PageHero {...aboutPage.hero} />

      <Section
        description="The public experience is shaped to feel precise, calm, and premium so trust can build without visual noise."
        eyebrow="Values"
        title="The brand is built around a quieter standard of spiritual presentation"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="grid gap-4 sm:grid-cols-3">
            {aboutPage.values.map((value) => (
              <Card
                key={value.title}
                interactive
                className="flex h-full flex-col gap-4"
              >
                <Badge tone="neutral">Brand Value</Badge>
                <div className="space-y-3">
                  <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                    {value.title}
                  </h3>
                  <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                    {value.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <EditorialPlaceholder
            annotations={[
              "Editorial pacing over website clutter",
              "Light premium palette with gold accents",
              "Public trust shaped by clarity",
            ]}
            description="A restrained visual composition preserves the editorial rhythm of the page while keeping the brand language warm and composed."
            eyebrow="Brand Atmosphere"
            title="A premium spiritual website should feel composed before it feels complex"
          />
        </div>
      </Section>

      <Section
        tone="muted"
        description="The public promise is as important as the visual design: it tells visitors what kind of experience they are stepping into and what they will not be pressured into."
        eyebrow="Promise"
        title="What NAVAGRAHA CENTRE stands for"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {aboutPage.promise.map((item) => (
            <Card key={item.title} className="space-y-4">
              <Badge tone="outline">Public Standard</Badge>
              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {item.title}
              </h3>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="pt-0" tone="transparent">
        <Card
          tone="accent"
          className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-4">
            <Badge tone="accent">Next Step</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-foreground)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              Explore the astrologer profile or move directly to inquiry.
            </h2>
            <p className="max-w-2xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              The public-facing site is designed to make the brand and the
              human authority legible before a client moves into direct contact.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/joy-prakash-sarmah"
              className={buttonStyles({ size: "lg" })}
            >
              Meet Joy Prakash Sarmah
            </Link>
            <Link
              href="/contact"
              className={buttonStyles({ size: "lg", tone: "secondary" })}
            >
              Contact NAVAGRAHA CENTRE
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
