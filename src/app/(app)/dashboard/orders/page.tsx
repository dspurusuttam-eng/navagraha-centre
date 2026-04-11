import { buildPageMetadata } from "@/lib/metadata";
import { requireUserSession } from "@/modules/auth/server";
import { MemberOrderList } from "@/modules/shop/components/member-order-list";
import { listMemberOrders } from "@/modules/shop/member-orders";

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
  const orders = await listMemberOrders(session.user.id);

  return <MemberOrderList orders={orders} />;
}
