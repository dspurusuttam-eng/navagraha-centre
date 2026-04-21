import Link from "next/link";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import {
  getAiFamilyUpgradeHref,
  listAiProductFamilyItems,
  resolveAiProductCtaLabel,
  resolveAiProductHref,
  type AiProductFamilySurface,
} from "@/modules/marketing/ai-product-family";

type AiProductFamilySectionProps = {
  surface: AiProductFamilySurface;
  pagePath: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  tone?: "default" | "muted" | "transparent" | "light" | "contrast";
};

export function AiProductFamilySection({
  surface,
  pagePath,
  eyebrow = "NAVAGRAHA AI Product Family",
  title = "One intelligence ecosystem across Kundli, compatibility, reports, remedies, and assistant guidance.",
  description = "Each tool keeps a distinct job while sharing the same chart-grounded foundation and premium progression.",
  tone = "contrast",
}: Readonly<AiProductFamilySectionProps>) {
  const items = listAiProductFamilyItems();
  const upgradeHref = getAiFamilyUpgradeHref(surface);
  const upgradeLabel =
    surface === "protected" ? "Manage Premium Access" : "View Premium Plans";

  return (
    <Section eyebrow={eyebrow} title={title} description={description} tone={tone}>
      <AnalyticsEventTracker
        event="upgrade_prompt_view"
        payload={{
          page: pagePath,
          surface,
          feature: "ai-product-family",
        }}
      />

      <Card
        tone="accent"
        className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
      >
        <div className="space-y-3">
          <Badge tone="accent">Premium AI Progression</Badge>
          <p className="max-w-2xl text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Free access starts with practical chart value. Premium and Pro add deeper reasoning, wider continuity, and richer tool depth.
          </p>
        </div>
        <TrackedLink
          href={upgradeHref}
          eventName="upgrade_started"
          eventPayload={{
            page: pagePath,
            surface,
            feature: "ai-product-family-upgrade",
          }}
          className={buttonStyles({
            size: "lg",
            tone: "secondary",
            className: "w-full justify-center sm:w-auto",
          })}
        >
          {upgradeLabel}
        </TrackedLink>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.key} interactive className="flex h-full flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">AI Tool</Badge>
              <Badge tone="outline">
                {surface === "protected" ? "Member Surface" : "Public Entry"}
              </Badge>
            </div>
            <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[var(--color-ink-strong)]">
              {item.title}
            </h3>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {item.description}
            </p>
            <div className="space-y-2 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.74)] px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Helps with
              </p>
              {item.helpsWith.map((line) => (
                <p
                  key={`${item.key}-${line}`}
                  className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
                >
                  {line}
                </p>
              ))}
            </div>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {item.premiumDepth}
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {item.trustNote}
            </p>
            <div className="mt-auto flex flex-col gap-3">
              <TrackedLink
                href={resolveAiProductHref(item, surface)}
                eventName="cta_click"
                eventPayload={{
                  page: pagePath,
                  surface,
                  feature: `ai-family-${item.key}-primary`,
                }}
                className={buttonStyles({
                  size: "sm",
                  className: "w-full justify-center",
                })}
              >
                {resolveAiProductCtaLabel(item, surface)}
              </TrackedLink>
              <div className="flex flex-wrap gap-2">
                {item.relatedTools.map((related) => (
                  <Link
                    key={`${item.key}-${related.href}`}
                    href={related.href}
                    className={buttonStyles({ size: "sm", tone: "ghost" })}
                  >
                    {related.label}
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="space-y-2">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Methodology
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            NAVAGRAHA AI uses chart context built from Vedic sidereal calculations aligned to Lahiri ayanamsha, then adds interpretation layers.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Authority
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Joy Prakash Sarmah remains the visible consultation authority for cases that require nuanced human interpretation.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Privacy
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Birth details and account records are handled inside protected member flows. Premium guidance remains optional and non-pressure.
          </p>
        </div>
      </Card>
    </Section>
  );
}
