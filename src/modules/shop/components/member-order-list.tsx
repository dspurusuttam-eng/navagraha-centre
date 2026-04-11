import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import type { MemberOrderListItem } from "@/modules/shop/member-orders";

type MemberOrderListProps = {
  orders: MemberOrderListItem[];
};

function getLifecycleTone(state: MemberOrderListItem["lifecycleState"]) {
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

function getLifecycleLabel(state: MemberOrderListItem["lifecycleState"]) {
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

export function MemberOrderList({ orders }: Readonly<MemberOrderListProps>) {
  if (!orders.length) {
    return (
      <Section
        eyebrow="Orders"
        title="No member order has been recorded yet."
        description="When you complete checkout from the cart, your order history appears here with secure status tracking."
        tone="transparent"
        className="pt-0"
      >
        <Card className="space-y-5">
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            This protected surface stays ready for pending, paid, and follow-up
            order visibility.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className={buttonStyles({ size: "lg" })}>
              Browse Shop
            </Link>
            <Link
              href="/shop/cart"
              className={buttonStyles({ size: "lg", tone: "secondary" })}
            >
              Open Cart
            </Link>
          </div>
        </Card>
      </Section>
    );
  }

  return (
    <Section
      eyebrow="Orders"
      title="Your protected order history"
      description="Each order keeps payment state, amount snapshot, and line summary in one secure member view."
      tone="transparent"
      className="pt-0"
    >
      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.orderId} className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={getLifecycleTone(order.lifecycleState)}>
                    {getLifecycleLabel(order.lifecycleState)}
                  </Badge>
                  <Badge tone="neutral">{order.orderNumber}</Badge>
                </div>
                <h2
                  className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
                  style={{ letterSpacing: "var(--tracking-display)" }}
                >
                  {order.totalLabel}
                </h2>
              </div>

              <Link
                href={`/dashboard/orders/${encodeURIComponent(order.orderNumber)}`}
                className={buttonStyles({ tone: "secondary", size: "sm" })}
              >
                View Order
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                  Order Status
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                  {order.status}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Payment Status
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                  {order.paymentStatus}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  Items
                </p>
                <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                  {order.itemCount}
                </p>
              </div>
            </div>

            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {order.itemSummary}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
