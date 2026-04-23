import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import type { ContentEntry } from "@/modules/content/types";
import type {
  InsightsCategoryConfig,
  InsightsCategorySlug,
} from "@/modules/content/insights-authority";
import { ContentCard } from "@/modules/content/components/content-card";

export function InsightsCategoryPage({
  category,
  entries,
  relatedCategories,
}: Readonly<{
  category: InsightsCategoryConfig;
  entries: readonly ContentEntry[];
  relatedCategories: readonly InsightsCategoryConfig[];
}>) {
  return (
    <>
      <Section
        eyebrow={category.eyebrow}
        title={category.title}
        description={category.description}
      >
        <Card tone="accent" className="space-y-4">
          <Badge tone="accent">Category Focus</Badge>
          <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Explore this category, then continue into personalized chart workflows when you need deeper context.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/kundli" className={buttonStyles({ size: "sm" })}>
              Generate Kundli
            </Link>
            <Link
              href="/ai"
              className={buttonStyles({ tone: "secondary", size: "sm" })}
            >
              Try NAVAGRAHA AI
            </Link>
            <Link
              href="/rashifal"
              className={buttonStyles({ tone: "tertiary", size: "sm" })}
            >
              Open Rashifal
            </Link>
          </div>
        </Card>
      </Section>

      <Section
        tone="light"
        eyebrow="Featured Articles"
        title={`${category.title} for authority and practical guidance.`}
        description="Curated entries in this category support discoverability and trust while routing into product flows."
      >
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <ContentCard key={entry.slug} entry={entry} />
          ))}
        </div>
      </Section>

      <Section
        tone="muted"
        eyebrow="Related Categories"
        title="Continue through related insights categories."
        description="Use internal category links to discover relevant topics without leaving the insights ecosystem."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {relatedCategories.map((item) => (
            <Card key={item.slug} interactive className="space-y-3">
              <Badge tone="neutral">{item.eyebrow}</Badge>
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
                {item.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {item.description}
              </p>
              <Link
                href={item.path}
                className={buttonStyles({ tone: "secondary", size: "sm" })}
              >
                Open Category
              </Link>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}

export function selectRelatedCategoryConfigs(
  allCategories: readonly InsightsCategoryConfig[],
  currentSlug: InsightsCategorySlug
) {
  return allCategories.filter((item) => item.slug !== currentSlug).slice(0, 3);
}
