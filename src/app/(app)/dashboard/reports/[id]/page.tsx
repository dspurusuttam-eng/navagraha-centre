import { DashboardReportDetail } from "@/modules/account/components/dashboard-report-detail";
import { buildDashboardHubData } from "@/modules/account/dashboard-hub";
import type { CSSProperties } from "react";

const dashboardTheme = {
  "--color-foreground": "#111111",
  "--color-muted": "#4A4A4A",
  "--color-ink-body": "#1C1C1C",
  "--color-ink-strong": "#111111",
  "--color-accent": "#C89B2C",
  "--color-accent-foreground": "#111111",
  "--color-border": "#EAEAEA",
} as CSSProperties;

export default async function DashboardReportsDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const hub = buildDashboardHubData();
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#FFFFFF] px-4 py-6 text-[#111111] sm:px-6 lg:px-8" style={dashboardTheme}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <DashboardReportDetail hub={hub} reportId={id} />
      </div>
    </main>
  );
}
