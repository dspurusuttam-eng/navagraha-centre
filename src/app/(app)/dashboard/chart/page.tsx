import { buildPageMetadata } from "@/lib/metadata";
import { requireUserSession } from "@/modules/auth/server";
import { ChartOverviewPanel } from "@/modules/onboarding/components/chart-overview";
import { getChartOverview } from "@/modules/onboarding/service";

export const metadata = buildPageMetadata({
  title: "Chart Overview",
  description:
    "Review the first structured natal chart stored on your private NAVAGRAHA CENTRE member account.",
  path: "/dashboard/chart",
  keywords: ["natal chart overview", "private chart dashboard", "member chart"],
});

export default async function DashboardChartPage() {
  const session = await requireUserSession();
  const overview = await getChartOverview(session.user.id);

  return <ChartOverviewPanel overview={overview} />;
}
