import Link from "next/link";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { updateOrderFulfillmentNoteAction } from "@/modules/admin/actions";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import { formatAdminDateTime } from "@/modules/admin/format";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { getAdminOrderDetail } from "@/modules/admin/service";
import { requireAdminSession } from "@/modules/auth/server";

export const metadata = buildAdminMetadata({
  title: "Admin Order Detail",
  description:
    "Internal order detail view for payment-state visibility and fulfillment notes.",
  path: "/admin/orders",
  keywords: ["order detail admin", "fulfillment notes", "payment visibility"],
});

export default async function AdminOrderDetailPage({
  params,
}: Readonly<{
  params: Promise<{
    orderNumber: string;
  }>;
}>) {
  await requireAdminSession({
    allowedRoles: ["founder", "support"],
  });

  const { orderNumber } = await params;
  let resolvedOrderNumber = orderNumber;

  try {
    resolvedOrderNumber = decodeURIComponent(orderNumber);
  } catch {
    resolvedOrderNumber = orderNumber;
  }

  const order = await getAdminOrderDetail(resolvedOrderNumber);

  if (!order) {
    return (
      <div className="space-y-6">
        <AdminPageIntro
          eyebrow="Order Detail"
          title="This order reference could not be located."
          description="The record may be invalid or no longer available in the internal order ledger."
        />

        <Card className="space-y-4">
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Return to the order list and choose a valid order reference.
          </p>
          <Link
            href="/admin/orders"
            className={buttonStyles({ tone: "secondary", size: "sm" })}
          >
            Back To Orders
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Order Detail"
        title={`Order ${order.orderNumber}`}
        description="Payment truth remains read-only here. Internal notes can be updated for operational fulfillment context."
        actions={
          <Link
            href="/admin/orders"
            className={buttonStyles({ tone: "secondary", size: "sm" })}
          >
            Back To Orders
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <AdminStatusBadge status={order.status} />
            <AdminStatusBadge status={order.paymentStatus} />
            <AdminStatusBadge status={order.lifecycleState} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Customer
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                {order.customer.name}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                {order.customer.email}
              </p>
              {order.customer.userId ? (
                <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  User ID {order.customer.userId}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Contact
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                {order.customerPhone || "No phone captured"}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                Checkout reference {order.checkoutReference || "Not set"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Created
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                {formatAdminDateTime(order.createdAt)}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                Updated {formatAdminDateTime(order.updatedAt)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Amount Snapshot
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                Order total {order.totalLabel}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                Trusted amount {order.trustedAmountLabel}
              </p>
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Payment References
            </p>
            <div className="mt-3 space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
              <p>
                Provider:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {order.latestPaymentRecord?.providerLabel ||
                    order.paymentProviderLabel}
                </span>
              </p>
              <p>
                Provider reference:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {order.latestPaymentRecord?.providerReference || "Not set"}
                </span>
              </p>
              <p>
                Finalized at:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {order.finalizedAtUtc
                    ? formatAdminDateTime(order.finalizedAtUtc)
                    : "Awaiting paid finalization"}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Item Details
            </p>
            {order.items.length ? (
              <div className="mt-3 space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] px-3 py-3"
                  >
                    <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                      {item.titleSnapshot}
                    </p>
                    <p className="mt-1 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                      SKU {item.skuSnapshot || "N/A"} | Qty {item.quantity} |
                      Unit {item.unitAmountLabel} | Line {item.lineTotalLabel}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                No item rows are available for this order.
              </p>
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Fulfillment Notes
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Notes are internal only and operational. This update does not change
            verified payment state.
          </p>

          <form action={updateOrderFulfillmentNoteAction} className="space-y-3">
            <input type="hidden" name="orderId" value={order.id} />
            <label className="block space-y-2">
              <span className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                Internal note
              </span>
              <Textarea
                name="internalNote"
                rows={8}
                defaultValue={order.internalNotes}
                placeholder="Add fulfillment handling details, customer follow-up context, or internal operational notes."
              />
            </label>
            <Button size="sm" type="submit">
              Save Internal Note
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
