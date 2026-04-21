import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { PageHero } from "@/components/site/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import type { SeoEntryPage, SeoEntryPageKey } from "@/modules/marketing/seo-entry-pages";

type MemberFlowLink = {
  href: string;
  label: string;
  description: string;
};

type RelatedPage = Pick<SeoEntryPage, "key" | "path" | "hero" | "metadata">;

type ToolPageTemplateProps = {
  entry: SeoEntryPage;
  relatedPages: readonly RelatedPage[];
  memberFlowLinks: readonly MemberFlowLink[];
  acquisitionIntent: SeoEntryPageKey | null;
};

export function ToolPageTemplate({
  entry,
  relatedPages,
  memberFlowLinks,
  acquisitionIntent,
}: Readonly<ToolPageTemplateProps>) {
  return (
    <>
      <PageHero
        eyebrow={entry.hero.eyebrow}
        title={entry.hero.title}
        description={entry.hero.description}
        highlights={entry.hero.highlights}
        note={entry.hero.note}
        primaryAction={
          entry.hero.primaryAction
            ? {
                ...entry.hero.primaryAction,
                eventName: "cta_click",
                eventPayload: {
                  page: entry.path,
                  feature: `seo-hero-primary-${entry.key}`,
                },
              }
            : undefined
        }
        secondaryAction={
          entry.hero.secondaryAction
            ? {
                ...entry.hero.secondaryAction,
                eventName: "cta_click",
                eventPayload: {
                  page: entry.path,
                  feature: `seo-hero-secondary-${entry.key}`,
                },
              }
            : undefined
        }
        supportTitle="Tool Snapshot"
      />

      <Section
        eyebrow="Tool Workflow"
        title="Start with one clear flow and move into protected chart context."
        description="Use the primary action first. Deeper report and assistant context appears after your chart foundation is in place."
      >
        <Card
          tone="accent"
          className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
        >
          <div className="space-y-3">
            <Badge tone="accent">Primary next step</Badge>
            <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {memberFlowLinks[0]?.description}
            </p>
          </div>
          <TrackedLink
            href={memberFlowLinks[0]?.href ?? "/sign-up"}
            eventName="cta_click"
            eventPayload={{
              page: entry.path,
              feature: `seo-primary-member-journey-${entry.key}`,
            }}
            className={buttonStyles({ size: "lg", className: "w-full justify-center sm:w-auto" })}
          >
            {memberFlowLinks[0]?.label ?? "Create account"}
          </TrackedLink>
        </Card>

        <div className="grid gap-5 md:grid-cols-3">
          {entry.flowCards.map((card) => (
            <Card key={card.title} className="space-y-3">
              <Badge tone="outline">Step</Badge>
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
        eyebrow="What You Receive"
        title="A consistent output pattern across chart, report, and assistant paths."
        description="Each tool page is mapped to the same product system: trusted chart setup, reusable context, and optional deeper layers."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {entry.valueCards.map((card) => (
            <Card key={card.title} className="space-y-3">
              <Badge tone="neutral">Outcome</Badge>
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
              <TrackedLink
                href={link.href}
                eventName="cta_click"
                eventPayload={{
                  page: entry.path,
                  feature: `seo-member-flow-${entry.key}`,
                }}
                className={buttonStyles({
                  tone: link.href === memberFlowLinks[0]?.href ? "accent" : "tertiary",
                  size: "sm",
                  className: "w-full justify-center",
                })}
              >
                Go to {link.label}
              </TrackedLink>
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
            <Badge tone="accent">Premium Layer</Badge>
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
              Premium access remains optional and contextual. Your core chart workflow stays available first.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <TrackedLink
              href={entry.premiumTeaser.href}
              eventName="cta_click"
              className={buttonStyles({ size: "lg", className: "w-full justify-center sm:w-auto" })}
              eventPayload={{
                page: entry.path,
                feature: `seo-premium-${entry.key}`,
              }}
            >
              {entry.premiumTeaser.label}
            </TrackedLink>
            {acquisitionIntent ? (
              <TrackedLink
                href="/sign-in"
                eventName="cta_click"
                eventPayload={{
                  page: entry.path,
                  feature: `seo-secondary-acquisition-${entry.key}`,
                }}
                className={buttonStyles({
                  size: "lg",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Already a member?
              </TrackedLink>
            ) : (
              <Link
                href="/consultation"
                className={buttonStyles({
                  size: "lg",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Book Consultation
              </Link>
            )}
          </div>
        </Card>
      </Section>

      <Section
        eyebrow="FAQ + Related Tools"
        title="Common questions and related tools."
        description="Use related pages to continue your intent without restarting your flow."
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

        <div className="mt-6 grid gap-5 md:grid-cols-3">
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
    </>
  );
}
