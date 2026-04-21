import Link from "next/link";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import {
  isPremiumProductUnlocked,
  listPremiumProductCatalog,
  resolvePremiumProductCtaLabel,
  resolvePremiumProductHref,
  type PremiumProductKey,
  type PremiumProductSurface,
} from "@/modules/report/premium-product-catalog";
import { globalCtaCopy } from "@/modules/localization/copy";
import type { MonetizationPlanType } from "@/modules/subscriptions/monetization-content";

type PremiumProductCatalogSectionProps = {
  surface: PremiumProductSurface;
  pagePath: string;
  planType: MonetizationPlanType;
  includeKeys?: readonly PremiumProductKey[];
  unlockedKeys?: readonly PremiumProductKey[];
  upgradeHref: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  tone?: "default" | "muted" | "transparent" | "light" | "contrast";
};

export function PremiumProductCatalogSection({
  surface,
  pagePath,
  planType,
  includeKeys,
  unlockedKeys,
  upgradeHref,
  eyebrow = "Premium Product Layer",
  title = "Reports, AI depth, and consultation pathways in one coherent catalog.",
  description = "Start with useful previews, unlock deeper layers when needed, and continue across connected products without friction.",
  tone = "muted",
}: Readonly<PremiumProductCatalogSectionProps>) {
  const catalogItems = listPremiumProductCatalog(includeKeys);

  return (
    <Section eyebrow={eyebrow} title={title} description={description} tone={tone}>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {catalogItems.map((item) => {
          const unlocked = isPremiumProductUnlocked({
            item,
            planType,
            unlockedKeys,
          });

          return (
            <Card key={item.key} interactive className="flex h-full flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{item.categoryLabel}</Badge>
                <Badge tone={unlocked ? "accent" : "outline"}>
                  {unlocked ? "Unlocked" : "Preview + Upgrade"}
                </Badge>
              </div>

              <h3 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                {item.title}
              </h3>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {item.helpsWith}
              </p>

              <div className="space-y-2 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Best for
                </p>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {item.bestFor}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Includes
                </p>
                {item.includes.map((line) => (
                  <p
                    key={`${item.key}-${line}`}
                    className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
                  >
                    {line}
                  </p>
                ))}
              </div>

              <div className="space-y-2 rounded-[var(--radius-xl)] border border-[rgba(215,187,131,0.18)] bg-[rgba(215,187,131,0.06)] px-4 py-4">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Locked vs unlocked
                </p>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {unlocked ? item.premiumValue : item.previewValue}
                </p>
              </div>

              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {item.relationshipNote}
              </p>

              <div className="mt-auto flex flex-col gap-3">
                <TrackedLink
                  href={resolvePremiumProductHref(item, surface)}
                  eventName="cta_click"
                  eventPayload={{
                    page: pagePath,
                    surface,
                    feature: `premium-catalog-${item.key}`,
                  }}
                  className={buttonStyles({ size: "sm", className: "w-full justify-center" })}
                >
                  {resolvePremiumProductCtaLabel(item, surface)}
                </TrackedLink>

                {!unlocked ? (
                  <Link
                    href={upgradeHref}
                    className={buttonStyles({
                      size: "sm",
                      tone: "tertiary",
                      className: "w-full justify-center",
                    })}
                  >
                    {globalCtaCopy.unlockFullReport}
                  </Link>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
