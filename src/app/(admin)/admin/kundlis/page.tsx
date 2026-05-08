import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import {
  getAdminLaunchMetrics,
  listAdminKundliOverview,
} from "@/modules/admin/control-panel";
import { requireAdminSession } from "@/modules/auth/server";

export const metadata = buildAdminMetadata({
  title: "Admin Kundlis",
  description:
    "Read-only operational overview of saved Kundli records, active profiles, and recent chart activity.",
  path: "/admin/kundlis",
  keywords: ["admin kundlis", "saved charts", "chart overview"],
});

export default async function AdminKundlisPage() {
  await requireAdminSession({
    allowedRoles: ["founder", "support"],
  });

  const [metrics, kundlis] = await Promise.all([
    getAdminLaunchMetrics(),
    listAdminKundliOverview(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Kundlis"
        title="Saved chart records remain owner-scoped, readable, and safe for admin review."
        description="This overview keeps the admin team focused on the operational shape of saved charts without exposing raw chart JSON or private birth details beyond the summary fields needed for internal support."
        actions={
          <Link
            href="/admin/users"
            className={buttonStyles({ tone: "secondary", size: "sm" })}
          >
            View Users
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Total Kundlis
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {metrics.savedKundlis}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Ready Charts
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {metrics.readyKundlis}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Primary Profiles
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {kundlis.filter((item) => item.isPrimary).length}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Recent Review
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            {kundlis[0]?.ownerName ?? "No Kundli data yet"}
          </p>
        </Card>
      </div>

      <Card className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Recent Kundli Records
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]">
              Summary-first chart inventory
            </h2>
          </div>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Detailed private chart bodies remain outside this list.
          </p>
        </div>

        {kundlis.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3 text-left">
              <thead>
                <tr className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  <th className="px-3 py-2">Owner</th>
                  <th className="px-3 py-2">Birth Profile</th>
                  <th className="px-3 py-2">Chart Summary</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {kundlis.map((kundli) => (
                  <tr key={kundli.id}>
                    <td className="rounded-l-[var(--radius-xl)] border border-r-0 border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-2">
                        <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                          {kundli.ownerName}
                        </p>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          {kundli.ownerEmail}
                        </p>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          {kundli.ownerId}
                        </p>
                      </div>
                    </td>
                    <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                        <p>
                          Label:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {kundli.label}
                          </span>
                        </p>
                        <p>
                          Birth:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {kundli.birthDateLabel}
                          </span>
                        </p>
                        <p>
                          Place:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {kundli.birthPlace}
                          </span>
                        </p>
                      </div>
                    </td>
                    <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {kundli.isPrimary ? (
                            <AdminStatusBadge status="CURRENT" />
                          ) : null}
                          <AdminStatusBadge status={kundli.chartStatus} />
                          <AdminStatusBadge status={kundli.chartType} />
                        </div>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          Ascendant:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {kundli.ascendantSign ?? "Not available"}
                          </span>
                        </p>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          Moon:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {kundli.moonSign ?? "Not available"}
                          </span>
                        </p>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          {kundli.chartSummary}
                        </p>
                      </div>
                    </td>
                    <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                        <p>
                          Generated:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {kundli.generatedAtLabel}
                          </span>
                        </p>
                        <p>
                          Updated:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {kundli.updatedAtLabel}
                          </span>
                        </p>
                      </div>
                    </td>
                    <td className="rounded-r-[var(--radius-xl)] border border-l-0 border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <Link
                        href={kundli.detailHref}
                        className={buttonStyles({
                          tone: "secondary",
                          size: "sm",
                        })}
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
            No saved Kundlis are available yet. The admin view will populate
            once members save birth profiles and generate charts.
          </div>
        )}
      </Card>
    </div>
  );
}
