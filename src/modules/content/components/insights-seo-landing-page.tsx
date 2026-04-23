import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import type { ContentEntry } from "@/modules/content/types";
import type { InsightsSeoLandingConfig } from "@/modules/content/insights-authority";
import { ContentCard } from "@/modules/content/components/content-card";

export function InsightsSeoLandingPage({
  landing,
  entries,
}: Readonly<{
  landing: InsightsSeoLandingConfig;
  entries: readonly ContentEntry[];
}>) {
  return (
    <>
      <Section
        eyebrow={landing.eyebrow}
        title={landing.title}
        description={landing.description}
      >
        <Card tone="accent" className="space-y-4">
          <Badge tone="accent">SEO Authority Surface</Badge>
          <ul className="space-y-2">
            {landing.highlightPoints.map((point) => (
              <li
                key={point}
                className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
              >
                - {point}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link href="/rashifal" className={buttonStyles({ size: "sm" })}>
              Open Rashifal
            </Link>
            <Link
              href="/kundli"
              className={buttonStyles({ tone: "secondary", size: "sm" })}
            >
              Generate Kundli
            </Link>
            <Link
              href="/ai"
              className={buttonStyles({ tone: "tertiary", size: "sm" })}
            >
              Try NAVAGRAHA AI
            </Link>
          </div>
        </Card>
      </Section>

      <Section
        tone="light"
        eyebrow="Recommended Reading"
        title="Guides connected to this SEO surface."
        description="Read trusted insight entries and continue into chart-aware product flows."
      >
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <ContentCard key={entry.slug} entry={entry} />
          ))}
        </div>
      </Section>
    </>
  );
}
