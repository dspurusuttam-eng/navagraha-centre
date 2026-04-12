import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { requireUserSession } from "@/modules/auth/server";
import { MemberOrderDetailView } from "@/modules/shop/components/member-order-detail";
import { getMemberOrderDetail } from "@/modules/shop/member-orders";
import {
  createEmptyOfferRecommendationResult,
  getOfferRecommendations,
  type OfferRecommendationResult,
} from "@/modules/offers";

export const metadata = buildPageMetadata({
  title: "Order Detail",
  description:
    "Open a protected member order detail with trusted payment snapshot and clear next-step guidance.",
  path: "/dashboard/orders",
  keywords: ["order detail", "member payment status", "protected order view"],
});

export default async function DashboardOrderDetailPage({
  params,
}: Readonly<{
  params: Promise<{
    orderNumber: string;
  }>;
}>) {
  const session = await requireUserSession();
  const { orderNumber } = await params;
  let resolvedOrderNumber = orderNumber;

  try {
    resolvedOrderNumber = decodeURIComponent(orderNumber);
  } catch {
    resolvedOrderNumber = orderNumber;
  }

  let order = null;
  let offers: OfferRecommendationResult =
    createEmptyOfferRecommendationResult("dashboard");

  try {
    [order, offers] = await Promise.all([
      getMemberOrderDetail(session.user.id, resolvedOrderNumber),
      (async (): Promise<OfferRecommendationResult> => {
        try {
          return await getOfferRecommendations({
            userId: session.user.id,
            surfaceKey: "dashboard",
          });
        } catch (error) {
          console.error("Order detail offers failed", error);

          return createEmptyOfferRecommendationResult("dashboard");
        }
      })(),
    ]);
  } catch {
    return (
      <Section
        eyebrow="Order Detail"
        title="This order cannot be loaded right now."
        description="Your order record is still protected. Please retry this route in a moment."
        tone="transparent"
        className="pt-0"
      >
        <Card className="space-y-5">
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            You can return to your order list now and try this order again
            shortly.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/dashboard/orders/${encodeURIComponent(resolvedOrderNumber)}`}
              className={buttonStyles({ size: "sm" })}
            >
              Retry This Order
            </Link>
            <Link
              href="/dashboard/orders"
              className={buttonStyles({ size: "sm", tone: "secondary" })}
            >
              Back To Orders
            </Link>
            <Link
              href="/contact"
              className={buttonStyles({ size: "sm", tone: "ghost" })}
            >
              Contact Support
            </Link>
          </div>
        </Card>
      </Section>
    );
  }

  if (!order) {
    return (
      <Section
        eyebrow="Order Detail"
        title="This order reference is not available."
        description="The order may not exist in this account, or the reference may have expired."
        tone="transparent"
        className="pt-0"
      >
        <Card className="space-y-5">
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Your protected dashboard remains secure. Please return to your order
            list and select a valid order, or begin a fresh cart request.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/orders"
              className={buttonStyles({ size: "sm", tone: "secondary" })}
            >
              Back To Orders
            </Link>
            <Link href="/shop/cart" className={buttonStyles({ size: "sm" })}>
              Open Cart
            </Link>
            <Link
              href="/contact"
              className={buttonStyles({ size: "sm", tone: "ghost" })}
            >
              Contact Support
            </Link>
          </div>
        </Card>
      </Section>
    );
  }

  return <MemberOrderDetailView order={order} offers={offers} />;
}
