import { buildPageMetadata } from "@/lib/metadata";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buttonStyles } from "@/components/ui/button";
import Link from "next/link";
import { requireUserSession } from "@/modules/auth/server";
import { MemberOrderList } from "@/modules/shop/components/member-order-list";
import { listMemberOrders } from "@/modules/shop/member-orders";
import {
  createEmptyOfferRecommendationResult,
  getOfferRecommendations,
  type OfferRecommendationResult,
} from "@/modules/offers";

export const metadata = buildPageMetadata({
  title: "Orders",
  description:
    "Review protected member orders with trusted payment and status tracking in NAVAGRAHA CENTRE.",
  path: "/dashboard/orders",
  keywords: [
    "member orders",
    "order status",
    "protected payment status",
  ],
});

export default async function DashboardOrdersPage() {
  const session = await requireUserSession();

  try {
    const [orders, offers] = await Promise.all([
      listMemberOrders(session.user.id),
      (async (): Promise<OfferRecommendationResult> => {
        try {
          return await getOfferRecommendations({
            userId: session.user.id,
            surfaceKey: "dashboard",
          });
        } catch (error) {
          console.error("Orders surface offers failed", error);

          return createEmptyOfferRecommendationResult("dashboard");
        }
      })(),
    ]);

    return <MemberOrderList orders={orders} offers={offers} />;
  } catch {
    return (
      <Section
        eyebrow="Orders"
        title="Order history is temporarily unavailable."
        description="Your records remain secure. Please retry this route in a moment."
        tone="transparent"
        className="pt-0"
      >
        <Card className="space-y-5">
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            If this continues, open the cart for a fresh request or contact the
            centre for assistance.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/orders"
              className={buttonStyles({ size: "sm" })}
            >
              Retry Orders
            </Link>
            <Link
              href="/shop/cart"
              className={buttonStyles({ tone: "secondary", size: "sm" })}
            >
              Open Cart
            </Link>
            <Link
              href="/contact"
              className={buttonStyles({ tone: "ghost", size: "sm" })}
            >
              Contact Support
            </Link>
          </div>
        </Card>
      </Section>
    );
  }
}
