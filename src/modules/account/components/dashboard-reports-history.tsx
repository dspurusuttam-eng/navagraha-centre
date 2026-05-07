"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DashboardHubData, DashboardReportItem } from "@/modules/account/dashboard-hub";

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

function statusLabel(report: DashboardReportItem) {
  if (report.paymentLabel === "Pending") {
    return "Pending";
  }

  if (report.accessLabel === "Ready") {
    return "Unlocked";
  }

  if (report.accessLabel === "Preview") {
    return "Preview";
  }

  return "Locked";
}

export function DashboardReportsHistory({
  hub,
}: Readonly<{
  hub: DashboardHubData;
}>) {
  const [selectedType, setSelectedType] = useState<string>("All");
  const reportTypes = useMemo(
    () => ["All", ...new Set(hub.reports.saved.recent.map((report) => report.type))],
    [hub.reports.saved.recent]
  );

  const visibleReports = useMemo(() => {
    if (selectedType === "All") {
      return hub.reports.saved.recent;
    }

    return hub.reports.saved.recent.filter((report) => report.type === selectedType);
  }, [hub.reports.saved.recent, selectedType]);

  return (
    <div className="space-y-6">
      <Card tone="accent" className="space-y-3">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
          Saved Reports
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[#111111]">
          Unlock history and report access
        </h1>
        <p className="max-w-3xl text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[#4A4A4A]">
          This dashboard view shows only safe report metadata, access state, and actions. Report bodies remain in the protected report flow.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Total saved</p>
          <p className="mt-2 text-[1.25rem] text-[#111111]">{hub.reports.saved.totalCount}</p>
        </Card>
        <Card>
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Unlocked</p>
          <p className="mt-2 text-[1.25rem] text-[#111111]">{hub.reports.saved.unlockedCount}</p>
        </Card>
        <Card>
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Preview</p>
          <p className="mt-2 text-[1.25rem] text-[#111111]">{hub.reports.saved.previewCount}</p>
        </Card>
        <Card>
          <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">Locked</p>
          <p className="mt-2 text-[1.25rem] text-[#111111]">{hub.reports.saved.lockedCount}</p>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
              Filter by report type
            </p>
            <p className="text-[length:var(--font-size-body-sm)] text-[#4A4A4A]">
              Simple filters keep the list readable without exposing report content.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {reportTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={buttonStyles({
                  size: "sm",
                  tone: selectedType === type ? "secondary" : "ghost",
                })}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hub.reports.saved.filterLabels.map((label) => (
            <Badge key={label} tone={label === "Unlocked" ? "accent" : label === "Preview" ? "trust" : "neutral"}>
              {label}
            </Badge>
          ))}
        </div>

        {visibleReports.length === 0 ? (
          <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-5 text-[0.92rem] leading-[var(--line-height-copy)] text-[#4A4A4A]">
            {hub.reports.saved.emptyStateLabel}
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleReports.map((report) => (
              <article
                key={report.id}
                className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white p-4 shadow-[0_10px_28px_rgba(17,17,17,0.04)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="accent">{report.type}</Badge>
                      <Badge tone={statusTone(statusLabel(report))}>{statusLabel(report)}</Badge>
                      <Badge tone={report.previewAllowed ? "trust" : "neutral"}>
                        {report.previewAllowed ? "Preview allowed" : "Preview locked"}
                      </Badge>
                    </div>
                    <h2 className="text-[1rem] text-[#111111]">{report.title}</h2>
                  </div>
                  <div className="text-right text-[0.82rem] text-[#4A4A4A]">
                    <p>Generated {formatDateTime(report.generatedAtUtc)}</p>
                    <p>Viewed {formatDateTime(report.lastViewedAtUtc)}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                      Related Kundli
                    </p>
                    <p className="mt-1 text-[0.92rem] text-[#111111]">
                      {report.relatedKundliId ?? "Unavailable"}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                      Payment
                    </p>
                    <p className="mt-1 text-[0.92rem] text-[#111111]">{report.paymentLabel}</p>
                  </div>
                  <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                      Access
                    </p>
                    <p className="mt-1 text-[0.92rem] text-[#111111]">{report.accessLabel}</p>
                  </div>
                  <div className="rounded-[var(--radius-xl)] border border-[#EAEAEA] bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[#C89B2C]">
                      Status
                    </p>
                    <p className="mt-1 text-[0.92rem] text-[#111111]">{statusLabel(report)}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={report.previewHref} className={buttonStyles({ size: "sm", tone: "secondary" })}>
                    View Preview
                  </Link>
                  <Link href={report.fullHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
                    Open Full Report
                  </Link>
                  <Link href={report.unlockHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
                    Unlock Full Report
                  </Link>
                  <Link href={report.generateHref} className={buttonStyles({ size: "sm", tone: "ghost" })}>
                    Generate New Report
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
