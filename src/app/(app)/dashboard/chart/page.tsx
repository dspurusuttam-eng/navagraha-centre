import { buildPageMetadata } from "@/lib/metadata";
import { requireUserSession } from "@/modules/auth/server";
import { ChartContractPanel } from "@/modules/astrology/components/chart-contract-panel";
import { getUpgradeHrefForUserPlan, getUserPlanUsageModel } from "@/modules/subscriptions";

export const metadata = buildPageMetadata({
  title: "Chart Overview",
  description:
    "Review the first structured natal chart stored on your private NAVAGRAHA CENTRE member account.",
  path: "/dashboard/chart",
  keywords: ["natal chart overview", "private chart dashboard", "member chart"],
});

export default async function DashboardChartPage() {
  const session = await requireUserSession();
  const { plan } = await getUserPlanUsageModel(session.user.id);

  return (
    <ChartContractPanel
      planType={plan.plan_type}
      upgradeHref={getUpgradeHrefForUserPlan(plan.plan_type)}
    />
  );
}
