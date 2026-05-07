import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DashboardHubData } from "@/modules/account/dashboard-hub";

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusTone(value: string) {
  if (value === "Ready" || value === "Unlocked") {
    return "accent" as const;
  }

  if (value === "Preview") {
    return "trust" as const;
  }

  return "neutral" as const;
}

export function DashboardReportDetail({
  hub,
  reportId,
}: Readonly<{
  hub: DashboardHubData;
  reportId: string;
}>) {
  const report = hub.reports.saved.recent.find((item) => item.id === reportId) ?? null;

  return (
    <div className="space-y-6">
      <Card tone="accent" className="space-y-3">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
          Report Details
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[#111111]">
          Safe report summary and access state
        </h1>
        <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
          This view does not expose premium report body content. It only shows report metadata, access state, and safe next actions.
        </p>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <Badge tone={report ? "accent" : "neutral"}>{report?.type ?? "Unknown report"}</Badge>
            <h2 className="text-[1.15rem] text-[#111111]">{report?.title ?? "Report not available"}</h2>
          </div>
          <div className="space-y-1 text-right text-[0.82rem] text-[#4A4A4A]">
            <p>Report ID: {reportId}</p>
            <p>Generated: {formatDateTime(report?.generatedAtUtc ?? null)}</p>
          </div>
        </div>

        {report ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Access</p>
              <p className="mt-1 text-[0.92rem] text-[#111111]">{report.accessLabel}</p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Payment</p>
              <p className="mt-1 text-[0.92rem] text-[#111111]">{report.paymentLabel}</p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Related Kundli</p>
              <p className="mt-1 text-[0.92rem] text-[#111111]">{report.relatedKundliId ?? "Unavailable"}</p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Last viewed</p>
              <p className="mt-1 text-[0.92rem] text-[#111111]">{formatDateTime(report.lastViewedAtUtc)}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4 text-[0.92rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            This report is not available in the current safe dashboard summary.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Preview safety</p>
            <p className="mt-2 text-[0.92rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
              Preview and full access remain protected by the Phase 20 premium gating system.
            </p>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Status</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone={statusTone(report?.accessLabel ?? "Locked")}>{report ? report.accessLabel : "Locked"}</Badge>
              {report ? <Badge tone={report.previewAllowed ? "trust" : "neutral"}>{report.previewAllowed ? "Preview allowed" : "Preview locked"}</Badge> : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={hub.reports.saved.historyHref} className={buttonStyles({ size: "sm", tone: "secondary" })}>
            Back to Reports
          </Link>
          <Link href={report?.previewHref ?? hub.reports.saved.historyHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
            View Preview
          </Link>
          <Link href={report?.unlockHref ?? hub.reports.saved.historyHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
            Unlock Full Report
          </Link>
          <Link href={report?.generateHref ?? "/dashboard/kundli/new"} className={buttonStyles({ size: "sm", tone: "ghost" })}>
            Generate New Report
          </Link>
        </div>
      </Card>
    </div>
  );
}
