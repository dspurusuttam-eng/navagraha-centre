"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics/track-event";
import { getApiErrorMessage } from "@/lib/api/http";
import {
  getPlanComparisonRows,
  getPostUpgradeNextAction,
  type MonetizationPlanType,
} from "@/modules/subscriptions/monetization-content";

type CheckoutResponse = {
  status: "ok";
  plan: {
    key: "PREMIUM" | "PRO";
    title: string;
    amountLabel: string;
  };
  checkout: {
    orderId: string;
    orderNumber: string;
    providerKey: string;
    amountLabel: string;
    session: {
      sessionReference: string;
      redirectUrl?: string;
      clientSecret?: string;
    };
  };
};

type PaidPlanType = Extract<MonetizationPlanType, "PREMIUM" | "PRO">;

function isPaidPlanType(planType: MonetizationPlanType): planType is PaidPlanType {
  return planType === "PREMIUM" || planType === "PRO";
}

export function SubscriptionPricingPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResponse | null>(null);
  const planRows = getPlanComparisonRows();

  useEffect(() => {
    trackEvent("pricing_view", {
      page: "/settings",
      surface: "protected",
      feature: "settings-membership-pricing",
    });
  }, []);

  async function startCheckout(planType: PaidPlanType) {
    if (isLoading) {
      return;
    }

    trackEvent("plan_selected", {
      page: "/settings",
      surface: "protected",
      plan: planType,
      feature: "settings-plan-selection",
    });
    trackEvent("upgrade_started", {
      page: "/settings",
      surface: "protected",
      plan: planType,
      feature: "subscription-checkout-init",
    });

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType,
        }),
      });
      const payload = (await response.json()) as CheckoutResponse & {
        message?: string;
      };

      if (!response.ok || payload.status !== "ok") {
        throw new Error(getApiErrorMessage(payload, "Subscription checkout failed."));
      }

      setResult(payload);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Subscription checkout failed."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handlePaidPlanCheckout(planType: MonetizationPlanType) {
    if (!isPaidPlanType(planType)) {
      return;
    }

    void startCheckout(planType);
  }

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
          Membership Pricing
        </p>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          Compare free, premium, and pro clearly before starting monthly checkout.
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
            {isPaidPlanType(row.planType) ? (
              <Button
                size="sm"
                tone={row.planType === "PREMIUM" ? "accent" : "secondary"}
                disabled={isLoading}
                onClick={() => {
                  handlePaidPlanCheckout(row.planType);
                }}
              >
                {row.ctaLabel}
              </Button>
            ) : (
              <Badge tone="outline">Current free baseline</Badge>
            )}
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-[var(--radius-xl)] border border-[rgba(214,116,90,0.32)] bg-[rgba(214,116,90,0.08)] px-4 py-4">
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
            {error}
          </p>
        </div>
      ) : null}

      {result ? (
        <div className="space-y-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="accent">{result.plan.title}</Badge>
            <Badge tone="neutral">{result.checkout.providerKey}</Badge>
          </div>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Checkout initialized for {result.plan.amountLabel}. Order reference:{" "}
            <span className="text-[color:var(--color-foreground)]">
              {result.checkout.orderNumber}
            </span>
            .
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Session reference:{" "}
            <span className="text-[color:var(--color-foreground)]">
              {result.checkout.session.sessionReference}
            </span>
            .
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Complete payment first. After payment is confirmed, the membership surface will guide you directly into the first premium action instead of leaving you at a dead end.
          </p>
          <div className="flex flex-wrap gap-3">
            {result.checkout.session.redirectUrl ? (
              <a
                href={result.checkout.session.redirectUrl}
                className={buttonStyles({ size: "sm", tone: "accent" })}
              >
                Continue to Payment
              </a>
            ) : null}
            <Link
              href={getPostUpgradeNextAction(result.plan.key).secondaryHref}
              className={buttonStyles({ size: "sm", tone: "secondary" })}
            >
              Review Premium Surfaces
            </Link>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
