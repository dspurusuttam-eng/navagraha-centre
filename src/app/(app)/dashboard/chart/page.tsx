import { buildPageMetadata } from "@/lib/metadata";
import { requireUserSession } from "@/modules/auth/server";
import { ChartContractPanel } from "@/modules/astrology/components/chart-contract-panel";

export const metadata = buildPageMetadata({
  title: "Chart Overview",
  description:
    "Review the first structured natal chart stored on your private NAVAGRAHA CENTRE member account.",
  path: "/dashboard/chart",
  keywords: ["natal chart overview", "private chart dashboard", "member chart"],
});

export default async function DashboardChartPage() {
  await requireUserSession();

  return <ChartContractPanel />;
}
