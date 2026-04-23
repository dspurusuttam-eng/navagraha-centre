"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics/track-event";
import { getPlanComparisonRows } from "@/modules/subscriptions/monetization-content";

export function SubscriptionPricingPanel() {
  const planRows = getPlanComparisonRows();

  useEffect(() => {
    trackEvent("pricing_view", {
      page: "/settings",
      surface: "protected",
      feature: "settings-membership-pricing",
    });
  }, []);

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
          Service Access
        </p>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          Currently Free (Limited Launch Access)
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {planRows.map((row) => (
          <div
            key={row.planType}
            className="space-y-4 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={row.planType === "PREMIUM" ? "accent" : "neutral"}>
                {row.title}
              </Badge>
              {row.featuredLabel ? <Badge tone="outline">Most Popular</Badge> : null}
            </div>
            <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
              {row.priceLabel}
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {row.shortDescription}
            </p>
            <div className="space-y-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              <p>{row.aiQuestions}</p>
              <p>{row.reports}</p>
              <p>{row.assistantDepth}</p>
              <p>{row.advancedInsights}</p>
              <p>{row.continuity}</p>
            </div>
            <p className="text-[0.7rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Best for: {row.bestFor}
            </p>
            <Link
              href={
                row.planType === "PRO"
                  ? "/dashboard/consultations"
                  : row.planType === "PREMIUM"
                    ? "/dashboard/ask-my-chart"
                    : "/dashboard/report"
              }
              className={buttonStyles({
                size: "sm",
                tone: row.planType === "PREMIUM" ? "accent" : "secondary",
              })}
            >
              {row.planType === "PRO"
                ? "Book Free Consultation"
                : row.planType === "PREMIUM"
                  ? "Try NAVAGRAHA AI"
                  : "Get Free Report"}
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
}
