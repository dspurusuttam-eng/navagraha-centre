import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import type { MemberOrderDetail } from "@/modules/shop/member-orders";

type MemberOrderDetailProps = {
  order: MemberOrderDetail;
};

function getLifecycleTone(state: MemberOrderDetail["lifecycleState"]) {
  switch (state) {
    case "PAID":
      return "accent" as const;
    case "FAILED":
    case "REFUNDED":
      return "neutral" as const;
    default:
      return "outline" as const;
  }
}

function getLifecycleLabel(state: MemberOrderDetail["lifecycleState"]) {
  switch (state) {
    case "PAID":
      return "Paid";
    case "FAILED":
      return "Payment Retry Needed";
    case "REFUNDED":
      return "Refunded";
    default:
      return "Pending";
  }
}

export function MemberOrderDetailView({
  order,
}: Readonly<MemberOrderDetailProps>) {
  return (
    <Section
      eyebrow="Order Detail"
      title={`Order ${order.orderNumber}`}
      description="This protected view keeps the payment status, trusted amount snapshot, and next-step guidance in one place."
      tone="transparent"
      className="pt-0"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={getLifecycleTone(order.lifecycleState)}>
              {getLifecycleLabel(order.lifecycleState)}
            </Badge>
            <Badge tone="neutral">{order.paymentStatus}</Badge>
          </div>

          <div className="space-y-2">
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              {order.statusMessage.title}
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {order.statusMessage.description}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Trusted Amount Snapshot
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                {order.trustedAmountLabel}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Payment Method
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                {order.paymentProviderLabel}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Created
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                {new Date(order.createdAtUtc).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Finalized
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                {order.finalizedAtUtc
                  ? new Date(order.finalizedAtUtc).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Awaiting final payment confirmation"}
              </p>
            </div>
          </div>

          {order.providerReference ? (
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Provider reference:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {order.providerReference}
              </span>
            </p>
          ) : null}

          {order.statusMessage.nextStepHref && order.statusMessage.nextStepLabel ? (
            <Link
              href={order.statusMessage.nextStepHref}
              className={buttonStyles({ size: "sm" })}
            >
              {order.statusMessage.nextStepLabel}
            </Link>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card tone="accent" className="space-y-4">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Item Summary
            </p>

            {!order.items.length ? (
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                Line items are not available yet for this order.
              </p>
            ) : (
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={`${item.titleSnapshot}-${item.quantity}`}
                    className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4"
                  >
                    <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                      {item.titleSnapshot}
                    </p>
                    <p className="mt-1 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                      Quantity {item.quantity} - {item.lineTotalLabel}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Confirmation Readiness
            </p>
            {order.confirmationTarget ? (
              <div className="space-y-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                <p>
                  A stable confirmation reference has been prepared for this paid
                  order.
                </p>
                <p>
                  Lookup key:{" "}
                  <span className="text-[color:var(--color-foreground)]">
                    {order.confirmationTarget.lookupKey}
                  </span>
                </p>
                <p>
                  Reference token:{" "}
                  <span className="text-[color:var(--color-foreground)]">
                    {order.confirmationTarget.confirmationToken}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                Confirmation reference fields appear automatically after paid
                finalization.
              </p>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/dashboard/orders"
          className={buttonStyles({ tone: "secondary", size: "sm" })}
        >
          Back To Orders
        </Link>
      </div>
    </Section>
  );
}
