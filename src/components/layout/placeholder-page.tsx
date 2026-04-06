import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import type { PageContent } from "@/modules/site/content";

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  highlights,
  note,
  primaryAction,
  secondaryAction,
}: PageContent) {
  return (
    <>
      <PageHero
        description={description}
        eyebrow={eyebrow}
        highlights={highlights}
        note={note}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        title={title}
      />

      <Section
        description="Each placeholder route now inherits the premium shell, hero rhythm, and reusable component styling that future product phases can build on safely."
        eyebrow="Route Foundation"
        title="Prepared for the next layer of functionality"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((highlight, index) => (
              <Card
                key={highlight}
                interactive
                className="flex h-full flex-col gap-4 p-5"
              >
                <Badge tone="neutral">{`0${index + 1}`}</Badge>
                <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-foreground)]">
                  {highlight}
                </p>
              </Card>
            ))}
          </div>

          <Card tone="muted" className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <Badge tone="outline">Current State</Badge>
              <div className="space-y-3">
                <h2
                  className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
                  style={{
                    letterSpacing: "var(--tracking-display)",
                    lineHeight: "var(--line-height-tight)",
                  }}
                >
                  Minimal by design
                </h2>
                <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {note}
                </p>
              </div>
            </div>

            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              No business logic or integrations are attached in this phase.
            </p>
          </Card>
        </div>
      </Section>
    </>
  );
}
