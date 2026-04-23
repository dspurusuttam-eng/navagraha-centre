import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SubscriptionUpgradePanel() {
  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
          Astrology Service Access
        </p>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          All astrology services are currently available under limited launch free access.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge tone="accent">Currently Free (Limited Time)</Badge>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/report" className={buttonStyles({ size: "sm" })}>
          Get Free Report
        </Link>
        <Link
          href="/dashboard/ask-my-chart"
          className={buttonStyles({ size: "sm", tone: "secondary" })}
        >
          Try NAVAGRAHA AI
        </Link>
        <Link
          href="/dashboard/consultations"
          className={buttonStyles({ size: "sm", tone: "tertiary" })}
        >
          Book Free Consultation
        </Link>
      </div>
    </Card>
  );
}
