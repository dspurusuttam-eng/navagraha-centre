import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { RetentionDashboardSnapshot } from "@/modules/retention/types";

type RetentionSurfacePanelProps = {
  snapshot: RetentionDashboardSnapshot;
};

export function RetentionSurfacePanel({
  snapshot,
}: Readonly<RetentionSurfacePanelProps>) {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      <Card className="space-y-4">
        <div className="space-y-2">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Today&apos;s Insight
          </p>
          <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
            {snapshot.dailyInsight.title}
          </p>
        </div>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {snapshot.dailyInsight.summary}
        </p>
        <p className="text-[0.74rem] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {snapshot.dailyInsight.supportingLine}
        </p>
      </Card>

      <Card className="space-y-4">
        <div className="space-y-2">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Current Energy
          </p>
          <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
            {snapshot.currentEnergy.title}
          </p>
        </div>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {snapshot.currentEnergy.summary}
        </p>
        <p className="text-[0.74rem] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {snapshot.currentEnergy.supportingLine}
        </p>
      </Card>

      <Card className="space-y-4">
        <div className="space-y-2">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Today&apos;s Panchang
          </p>
          <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
            {snapshot.panchang.highlight}
          </p>
        </div>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {snapshot.panchang.spiritualTone}
        </p>
        <p className="text-[0.74rem] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          {snapshot.panchang.suitableFocus}
        </p>
        {snapshot.panchang.locationLabel ? (
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            {snapshot.panchang.locationLabel}
            {snapshot.panchang.asOfDate ? ` | ${snapshot.panchang.asOfDate}` : ""}
          </p>
        ) : null}
      </Card>

      <Card tone="accent" className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="accent">Recommended Next Step</Badge>
          <Badge tone="neutral">{snapshot.lifecycleLabel}</Badge>
        </div>
        <div className="space-y-2">
          <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
            {snapshot.recommendedNextStep.title}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {snapshot.recommendedNextStep.summary}
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            {snapshot.recommendedNextStep.emphasis === "PREMIUM"
              ? "Premium-aware prompt"
              : "Return guidance"}
          </p>
          <Link
            href={snapshot.recommendedNextStep.href}
            className={buttonStyles({ size: "sm", tone: "secondary" })}
          >
            {snapshot.recommendedNextStep.ctaLabel}
          </Link>
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.58)] p-3">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              {snapshot.panchang.returnPromptTitle}
            </p>
            <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {snapshot.panchang.returnPromptSummary}
            </p>
            <Link
              href={snapshot.panchang.returnPromptHref}
              className={buttonStyles({
                size: "sm",
                tone: "tertiary",
                className: "mt-3",
              })}
            >
              {snapshot.panchang.returnPromptCtaLabel}
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
