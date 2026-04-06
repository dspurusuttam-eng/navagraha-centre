import { buildPageMetadata } from "@/lib/metadata";
import { requireUserSession } from "@/modules/auth/server";
import { ChartReportPage } from "@/modules/report/components/chart-report-page";
import { getChartReport } from "@/modules/report/service";

export const metadata = buildPageMetadata({
  title: "Chart Report",
  description:
    "Review the first private NAVAGRAHA CENTRE chart report with structured chart facts, AI interpretation, and approved remedies.",
  path: "/dashboard/report",
  keywords: [
    "private astrology report",
    "chart interpretation",
    "approved remedies",
  ],
});

export default async function DashboardReportPage() {
  const session = await requireUserSession();
  const report = await getChartReport(session.user.id, session.user.name);

  return <ChartReportPage report={report} />;
}
