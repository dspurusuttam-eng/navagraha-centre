import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import {
  getAdminLaunchMetrics,
  listAdminReportOverview,
} from "@/modules/admin/control-panel";
import { requireAdminSession } from "@/modules/auth/server";

export const metadata = buildAdminMetadata({
  title: "Admin Reports",
  description:
    "Operational overview for premium report generation, preview state, and access continuity snapshots.",
  path: "/admin/reports",
  keywords: ["admin reports", "premium report history", "unlock overview"],
});

export default async function AdminReportsPage() {
  await requireAdminSession({
    allowedRoles: ["founder", "support"],
  });

  const [metrics, reports] = await Promise.all([
    getAdminLaunchMetrics(),
    listAdminReportOverview(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Reports"
        title="Premium report generation stays observable without exposing locked report bodies."
        description="This surface tracks report status, owner linkage, and access state while keeping the actual premium sections inside the protected member flow."
        actions={
          <Link
            href="/admin/content"
            className={buttonStyles({ tone: "secondary", size: "sm" })}
          >
            View Content
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Recent Runs
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {metrics.premiumReportRuns}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Unlocked
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {metrics.unlockedPremiumReportRuns}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Preview
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {metrics.previewPremiumReportRuns}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Paid Orders
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {metrics.paidOrders}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Payment activity remains visible through the order ledger only.
          </p>
        </Card>
      </div>

      <Card className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Report Ledger
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]">
              Safe report metadata only
            </h2>
          </div>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Report bodies remain in the protected member experience.
          </p>
        </div>

        {reports.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3 text-left">
              <thead>
                <tr className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  <th className="px-3 py-2">Member</th>
                  <th className="px-3 py-2">Report</th>
                  <th className="px-3 py-2">Access</th>
                  <th className="px-3 py-2">Timing</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="rounded-l-[var(--radius-xl)] border border-r-0 border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-2">
                        <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                          {report.ownerName}
                        </p>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          {report.ownerEmail}
                        </p>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          {report.ownerId}
                        </p>
                      </div>
                    </td>
                    <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <AdminStatusBadge status={report.reportType} />
                          <AdminStatusBadge status={report.accessState} />
                          <AdminStatusBadge status={report.paymentState} />
                        </div>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                          {report.title}
                        </p>
                      </div>
                    </td>
                    <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                        <p>
                          Unlock state:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {report.accessState}
                          </span>
                        </p>
                        <p>
                          Payment state:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {report.paymentState}
                          </span>
                        </p>
                      </div>
                    </td>
                    <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                        <p>
                          Generated:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {report.generatedAtLabel}
                          </span>
                        </p>
                        <p>
                          Updated:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {report.updatedAtLabel}
                          </span>
                        </p>
                      </div>
                    </td>
                    <td className="rounded-r-[var(--radius-xl)] border border-l-0 border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <Link
                        href={report.detailHref}
                        className={buttonStyles({ tone: "secondary", size: "sm" })}
                      >
                        View Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            No premium report generation runs are available yet. The ledger will
            populate once members generate premium report tasks.
          </div>
        )}
      </Card>
    </div>
  );
}
