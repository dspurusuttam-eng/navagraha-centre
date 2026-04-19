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
    <div className="grid gap-4 xl:grid-cols-3">
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
        </div>
      </Card>
    </div>
  );
}
