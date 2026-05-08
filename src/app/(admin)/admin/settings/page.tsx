import { Card } from "@/components/ui/card";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { getAdminHealthOverview } from "@/modules/admin/control-panel";
import { requireAdminSession } from "@/modules/auth/server";

export const metadata = buildAdminMetadata({
  title: "Admin Settings / Health",
  description:
    "Operational health snapshot, admin readiness notes, and safe control panel status.",
  path: "/admin/settings",
  keywords: ["admin health", "admin settings", "control panel readiness"],
});

export default async function AdminSettingsPage() {
  await requireAdminSession({
    allowedRoles: ["founder", "support"],
  });

  const health = await getAdminHealthOverview();

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Settings / Health"
        title="Operational status stays visible without exposing any secrets or environment values."
        description="This page is a stable MVP health surface. It is intentionally conservative and reads only from safe internal counts and readiness notes."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Snapshot Time
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
            {health.generatedAtLabel}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Admin Access
          </p>
          <AdminStatusBadge status="READY" />
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Build / Deploy
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Verified through local typecheck, lint, and build runs.
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Secrets
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            No secrets, env values, or raw tokens are surfaced here.
          </p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Users
          </p>
          <p className="font-[family-name:var(--font-display)] text-4xl text-[color:var(--color-foreground)]">
            {health.counts.users}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Kundlis
          </p>
          <p className="font-[family-name:var(--font-display)] text-4xl text-[color:var(--color-foreground)]">
            {health.counts.savedKundlis}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Consultations
          </p>
          <p className="font-[family-name:var(--font-display)] text-4xl text-[color:var(--color-foreground)]">
            {health.counts.consultations}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Editorial Records
          </p>
          <p className="font-[family-name:var(--font-display)] text-4xl text-[color:var(--color-foreground)]">
            {health.counts.editorialRecords}
          </p>
        </Card>
      </div>

      <Card className="space-y-5">
        <div className="space-y-2">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Readiness Notes
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]">
            Safe operational signals
          </h2>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4">
            {health.readySignals.map((line) => (
              <p
                key={line}
                className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
              >
                {line}
              </p>
            ))}
          </div>
          <div className="space-y-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4">
            {health.followUps.map((line) => (
              <p
                key={line}
                className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
