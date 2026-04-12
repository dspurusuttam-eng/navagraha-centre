import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import { formatAdminDateTime } from "@/modules/admin/format";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { listAdminOrders } from "@/modules/admin/service";
import { requireAdminSession } from "@/modules/auth/server";

export const metadata = buildAdminMetadata({
  title: "Admin Orders",
  description:
    "Internal commerce review for order status, payment visibility, and operational follow-up notes.",
  path: "/admin/orders",
  keywords: ["admin orders", "commerce operations", "internal fulfillment"],
});

export default async function AdminOrdersPage() {
  await requireAdminSession({
    allowedRoles: ["founder", "support"],
  });

  const orders = await listAdminOrders();

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Orders"
        title="A focused internal commerce view for payment visibility and fulfillment readiness."
        description="This surface is intentionally minimal: order status, payment state, trusted amount snapshots, and direct access to internal fulfillment notes."
      />

      <Card className="space-y-5">
        {orders.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3 text-left">
              <thead>
                <tr className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="rounded-l-[var(--radius-xl)] border border-r-0 border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-2">
                        <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                          {order.orderNumber}
                        </p>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          Created {formatAdminDateTime(order.createdAt)}
                        </p>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          Items {order.itemCount}
                        </p>
                      </div>
                    </td>

                    <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-2">
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                          {order.customer.name}
                        </p>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          {order.customer.email}
                        </p>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          {order.customer.userId
                            ? `User ID ${order.customer.userId}`
                            : "Guest checkout record"}
                        </p>
                      </div>
                    </td>

                    <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        <AdminStatusBadge status={order.status} />
                        <AdminStatusBadge status={order.paymentStatus} />
                        <AdminStatusBadge status={order.lifecycleState} />
                      </div>
                    </td>

                    <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-2">
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                          {order.totalLabel}
                        </p>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          {order.paymentProviderLabel}
                        </p>
                      </div>
                    </td>

                    <td className="rounded-r-[var(--radius-xl)] border border-l-0 border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <Link
                        href={`/admin/orders/${encodeURIComponent(order.orderNumber)}`}
                        className={buttonStyles({ size: "sm", tone: "secondary" })}
                      >
                        View Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            No orders are available yet. This internal view will populate after
            checkout requests are created.
          </div>
        )}
      </Card>
    </div>
  );
}
