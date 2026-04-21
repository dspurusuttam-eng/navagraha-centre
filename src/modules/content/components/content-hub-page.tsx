import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { PageHero } from "@/components/site/page-hero";
import type { ContentHub } from "@/modules/content/hubs";

type ContentHubPageProps = {
  hub: ContentHub;
  relatedHubs: readonly ContentHub[];
};

export function ContentHubPage({
  hub,
  relatedHubs,
}: Readonly<ContentHubPageProps>) {
  return (
    <>
      <PageHero
        eyebrow={hub.heroEyebrow}
        title={hub.heroTitle}
        description={hub.heroDescription}
        highlights={hub.heroHighlights}
        note={hub.heroNote}
        primaryAction={hub.conversionCtas[0]}
        secondaryAction={hub.conversionCtas[1]}
        supportTitle="Hub Focus"
      />

      <Section
        eyebrow="Featured Topics"
        title={hub.title}
        description={hub.description}
        tone="light"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {hub.subtopics.map((subtopic) => (
            <Card
              key={subtopic.title}
              tone="light"
              interactive
              className="flex h-full flex-col gap-4"
            >
              <h2 className="text-[length:var(--font-size-title-sm)] text-[var(--color-ink-strong)]">
                {subtopic.title}
              </h2>
              <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {subtopic.description}
              </p>
              <Link
                href={subtopic.href}
                className={buttonStyles({
                  size: "sm",
                  tone: "tertiary",
                  className: "w-full justify-center",
                })}
              >
                Explore
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Conversion Paths"
        title="Move into personalized guidance when you are ready."
        description="Each hub stays useful by itself and also connects cleanly to chart generation, AI interpretation, reports, and consultation."
      >
        <Card tone="accent" className="space-y-5">
          <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            The authority model stays practical: high-signal content first, then
            clear pathways into personalized tools and premium guidance.
          </p>
          <div className="flex flex-wrap gap-3">
            {hub.conversionCtas.map((cta) => (
              <Link
                key={cta.label}
                href={cta.href}
                className={buttonStyles({
                  size: "sm",
                  tone: cta === hub.conversionCtas[0] ? "accent" : "secondary",
                })}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </Card>
      </Section>

      {relatedHubs.length ? (
        <Section
          eyebrow="Related Hubs"
          title="Continue through connected knowledge pathways."
          description="Each hub links to adjacent high-intent content areas so users can navigate naturally without dead ends."
          tone="muted"
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {relatedHubs.map((relatedHub) => (
              <Card
                key={relatedHub.slug}
                interactive
                className="flex h-full flex-col gap-4"
              >
                <h2 className="text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]">
                  {relatedHub.title}
                </h2>
                <p className="flex-1 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {relatedHub.description}
                </p>
                <Link
                  href={relatedHub.path}
                  className={buttonStyles({
                    size: "sm",
                    tone: "secondary",
                    className: "w-full justify-center",
                  })}
                >
                  Open Hub
                </Link>
              </Card>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
