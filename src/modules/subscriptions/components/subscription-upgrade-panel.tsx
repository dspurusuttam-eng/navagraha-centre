"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/http";

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

export function SubscriptionUpgradePanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResponse | null>(null);

  async function startCheckout(planType: "PREMIUM" | "PRO") {
    if (isLoading) {
      return;
    }

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

  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
          Membership Upgrade
        </p>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          Start a monthly membership checkout when you want deeper AI and report access.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          size="sm"
          onClick={() => {
            void startCheckout("PREMIUM");
          }}
          disabled={isLoading}
        >
          Premium ₹99/month
        </Button>
        <Button
          size="sm"
          tone="secondary"
          onClick={() => {
            void startCheckout("PRO");
          }}
          disabled={isLoading}
        >
          Pro ₹299/month
        </Button>
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
        </div>
      ) : null}
    </Card>
  );
}
