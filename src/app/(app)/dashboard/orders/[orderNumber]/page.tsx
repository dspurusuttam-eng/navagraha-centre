import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { buildPageMetadata } from "@/lib/metadata";
import { requireUserSession } from "@/modules/auth/server";
import { MemberOrderDetailView } from "@/modules/shop/components/member-order-detail";
import { getMemberOrderDetail } from "@/modules/shop/member-orders";

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

  const order = await getMemberOrderDetail(
    session.user.id,
    resolvedOrderNumber
  );

  if (!order) {
    return (
      <Section
        eyebrow="Order Detail"
        title="This order could not be located."
        description="The reference may be invalid, or this order belongs to a different account."
        tone="transparent"
        className="pt-0"
      >
        <Card className="space-y-5">
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Your protected dashboard remains secure. Return to the order history
            to open a valid reference.
          </p>
          <Link
            href="/dashboard/orders"
            className={buttonStyles({ size: "sm", tone: "secondary" })}
          >
            Back To Orders
          </Link>
        </Card>
      </Section>
    );
  }

  return <MemberOrderDetailView order={order} />;
}
