import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import {
  getSeoEntryPage,
  getSeoEntryStructuredData,
  type SeoEntryPage,
  type SeoEntryPageKey,
} from "@/modules/marketing/seo-entry-pages";

const memberFlowLinks = [
  {
    href: "/sign-up",
    label: "Create account",
    description: "Create your member profile and unlock chart setup.",
  },
  {
    href: "/dashboard/onboarding",
    label: "Complete onboarding",
    description:
      "Add birth details and generate your validated chart foundation.",
  },
  {
    href: "/dashboard/ask-my-chart",
    label: "Use Ask My Chart",
    description:
      "Ask chart-aware questions in the protected assistant workflow.",
  },
  {
    href: "/dashboard/report",
    label: "Open report surface",
    description:
      "Review report context and premium depth options in one place.",
  },
  {
    href: "/pricing",
    label: "View plans",
    description:
      "Compare Free, Premium, and Pro plans starting from INR 99/month.",
  },
] as const;

function getRelatedPages(relatedPages: readonly SeoEntryPageKey[]) {
  return relatedPages.map((key) => getSeoEntryPage(key));
}

export function SeoEntryPageView({ entry }: Readonly<{ entry: SeoEntryPage }>) {
  const relatedPages = getRelatedPages(entry.relatedPages);
  const structuredData = getSeoEntryStructuredData(entry);

  return (
    <>
      <PageViewTracker page={entry.path} feature={`seo-${entry.key}`} />

      {structuredData.map((item, index) => (
        <script
          key={`${entry.key}-structured-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      <PageHero
        eyebrow={entry.hero.eyebrow}
        title={entry.hero.title}
        description={entry.hero.description}
        highlights={entry.hero.highlights}
        note={entry.hero.note}
        primaryAction={entry.hero.primaryAction}
        secondaryAction={entry.hero.secondaryAction}
        supportTitle="Entry Page Focus"
      />

      <Section
        eyebrow="Why This Page"
        title="A high-intent route that connects search to real product value."
        description="Each section below is designed to route visitors into the existing member flows: chart, report, assistant, and consultation."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {entry.valueCards.map((card) => (
            <Card key={card.title} className="space-y-3">
              <Badge tone="neutral">Value</Badge>
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {card.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {card.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="muted"
        eyebrow="Member Journey"
        title="How this intent flows into your protected astrology surfaces."
        description="The route is simple: enter from search, create your chart foundation, then continue with assistant and report context."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {entry.flowCards.map((card) => (
            <Card key={card.title} className="space-y-3">
              <Badge tone="outline">Flow</Badge>
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {card.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {card.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {memberFlowLinks.map((link) => (
            <Card key={link.href} interactive className="space-y-3">
              <Badge tone="accent">{link.label}</Badge>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {link.description}
              </p>
              <Link
                href={link.href}
                className={buttonStyles({ tone: "secondary", size: "sm" })}
              >
                Go to {link.label}
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Related Intents"
        title="Explore related entry pages"
        description="Internal linking helps visitors move to the closest next intent without navigation friction."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {relatedPages.map((page) => (
            <Card key={page.key} interactive className="space-y-3">
              <Badge tone="neutral">{page.hero.eyebrow}</Badge>
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {page.hero.title}
              </h2>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {page.metadata.description}
              </p>
              <Link
                href={page.path}
                className={buttonStyles({ tone: "secondary", size: "sm" })}
              >
                View {page.hero.eyebrow}
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        tone="muted"
        eyebrow="FAQ"
        title="Common questions for this entry path"
        description="These answers keep the page useful for both visitors and search while preserving trust-safe boundaries."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {entry.faqItems.map((item) => (
            <Card key={item.question} className="space-y-3">
              <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {item.question}
              </h2>
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
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-4">
            <Badge tone="accent">Premium Teaser</Badge>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{
                letterSpacing: "var(--tracking-display)",
                lineHeight: "var(--line-height-tight)",
              }}
            >
              {entry.premiumTeaser.title}
            </h2>
            <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {entry.premiumTeaser.description}
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Plans are visible on the pricing page and inside member settings, starting from INR 99/month.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <TrackedLink
              href={entry.premiumTeaser.href}
              className={buttonStyles({ size: "lg" })}
              eventPayload={{
                page: entry.path,
                feature: `seo-premium-${entry.key}`,
              }}
            >
              {entry.premiumTeaser.label}
            </TrackedLink>
            <Link
              href="/consultation"
              className={buttonStyles({ size: "lg", tone: "secondary" })}
            >
              Book Consultation
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
