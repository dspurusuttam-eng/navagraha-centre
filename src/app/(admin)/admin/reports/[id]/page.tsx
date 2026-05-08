import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { getAdminReportDetail } from "@/modules/admin/control-panel";
import { requireAdminSession } from "@/modules/auth/server";

export const metadata = buildAdminMetadata({
  title: "Admin Report Detail",
  description:
    "Read-only report metadata view for premium report generation history.",
  path: "/admin/reports",
  keywords: ["admin report detail", "premium report overview", "access state"],
});

export default async function AdminReportDetailPage({
  params,
}: Readonly<{
  params: Promise<{
    id: string;
  }>;
}>) {
  await requireAdminSession({
    allowedRoles: ["founder", "support"],
  });

  const { id } = await params;
  const report = await getAdminReportDetail(id);

  if (!report) {
    return (
      <div className="space-y-6">
        <AdminPageIntro
          eyebrow="Report Detail"
          title="This report run could not be located."
          description="The reference may be invalid or the run may no longer be available."
        />

        <Card className="space-y-4">
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Return to the report overview and choose a valid run reference.
          </p>
          <Link
            href="/admin/reports"
            className={buttonStyles({ tone: "secondary", size: "sm" })}
          >
            Back To Reports
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Report Detail"
        title={report.title}
        description="This view remains metadata-only. Premium report bodies stay inside the protected member experience."
        actions={
          <Link
            href="/admin/reports"
            className={buttonStyles({ tone: "secondary", size: "sm" })}
          >
            Back To Reports
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <Card className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <AdminStatusBadge status={report.reportType} />
            <AdminStatusBadge status={report.accessState} />
            <AdminStatusBadge status={report.paymentState} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Member
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                {report.ownerName}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                {report.ownerEmail}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                {report.ownerId}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Access State
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                {report.accessState}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                Payment state {report.paymentState}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                Plan type {report.planType ?? "Not recorded"}
              </p>
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Metadata Snapshot
            </p>
            <div className="mt-3 space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
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
              <p>
                Prompt version:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {report.promptVersionLabel ?? "Not available"}
                </span>
              </p>
              <p>
                Provider:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {report.providerKey}
                </span>
              </p>
              <p>
                Output status:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {report.normalizedOutputState ?? "Not available"}
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Member Surface Safety
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            This detail view stays intentionally narrow. It confirms the owner,
            report type, access state, and generation metadata without exposing
            premium report body content or raw chart internals.
          </p>
        </Card>
      </div>
    </div>
  );
}
