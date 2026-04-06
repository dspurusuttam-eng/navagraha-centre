import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import { formatAdminDateTime } from "@/modules/admin/format";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { getVisibleAdminRoutes } from "@/modules/admin/permissions";
import { getAdminDashboardData } from "@/modules/admin/service";
import { requireAdminSession } from "@/modules/auth/server";

export const metadata = buildAdminMetadata({
  title: "Admin Dashboard",
  description:
    "Internal control panel for NAVAGRAHA CENTRE operations, editorial review, catalog governance, and AI template stewardship.",
  path: "/admin",
  keywords: ["admin dashboard", "operations panel", "internal control panel"],
});

export default async function AdminPage() {
  const session = await requireAdminSession();
  const dashboard = await getAdminDashboardData();
  const quickLinks = getVisibleAdminRoutes(session.adminRoles).filter(
    (route) => route.href !== "/admin"
  );

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Admin Home"
        title="A single internal surface for operations, editorial control, and platform stewardship."
        description="The control panel is organized around the real workflow layers already in the product: members, consultation operations, merchandising, remedy governance, editorial review, and AI prompt versioning."
        actions={
          <>
            {quickLinks.slice(0, 3).map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={buttonStyles({
                  tone: "secondary",
                  size: "sm",
                })}
              >
                {route.label}
              </Link>
            ))}
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Users
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {dashboard.counts.totalUsers}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Registered accounts across member and admin surfaces.
          </p>
        </Card>

        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Consultation Queue
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {dashboard.counts.activeConsultations}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Requested or confirmed sessions awaiting active handling.
          </p>
        </Card>

        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Open Slots
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {dashboard.counts.openSlots}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Availability still open for booking under Joy Prakash Sarmah.
          </p>
        </Card>

        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Live Catalog
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {dashboard.counts.activeProducts}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Active products currently available in the merchandising layer.
          </p>
        </Card>

        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Published Remedies
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {dashboard.counts.publishedRemedies}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Approved remedies currently eligible for deterministic mapping.
          </p>
        </Card>

        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Editorial Review
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {dashboard.counts.contentInReview}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Article records currently sitting in a review approval state.
          </p>
        </Card>

        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Prompt Templates
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {dashboard.counts.promptTemplates}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Internal prompt templates ready for governed version changes.
          </p>
        </Card>

        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Live Insights
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {dashboard.counts.liveContentEntries}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Published code-backed content entries currently exposed publicly.
          </p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Recent Users
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              New accounts entering the ecosystem.
            </h2>
          </div>

          <div className="space-y-4">
            {dashboard.recentUsers.map((user) => (
              <div
                key={user.id}
                className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                      {user.name}
                    </p>
                    <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.adminAssignments.length ? (
                      user.adminAssignments.map((assignment) => (
                        <AdminStatusBadge
                          key={`${user.id}-${assignment.role.key}`}
                          status={assignment.role.key.toUpperCase()}
                        />
                      ))
                    ) : (
                      <AdminStatusBadge status="MEMBER" />
                    )}
                  </div>
                </div>
                <p className="mt-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  Joined {formatAdminDateTime(user.createdAt)}.
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Editorial Queue
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Content records waiting for movement or publication.
            </h2>
          </div>

          <div className="space-y-4">
            {dashboard.reviewQueue.map((article) => (
              <div
                key={article.id}
                className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                      {article.title}
                    </p>
                    <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                      {article.slug}
                    </p>
                  </div>
                  <AdminStatusBadge status={article.status} />
                </div>
                <p className="mt-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  {article.author?.name
                    ? `Author: ${article.author.name}`
                    : "No author assigned yet"}
                  {" • "}
                  Updated {formatAdminDateTime(article.updatedAt)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Consultation Queue
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Current requests and upcoming sessions.
            </h2>
          </div>

          <div className="space-y-4">
            {dashboard.consultationQueue.map((consultation) => (
              <div
                key={consultation.id}
                className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                      {consultation.serviceLabel}
                    </p>
                    <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                      {consultation.user.name} • {consultation.user.email}
                    </p>
                  </div>
                  <AdminStatusBadge status={consultation.status} />
                </div>
                <p className="mt-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  {consultation.scheduledFor
                    ? `${formatAdminDateTime(
                        consultation.scheduledFor,
                        consultation.clientTimezone ?? "Asia/Kolkata"
                      )} • ${consultation.clientTimezone ?? "Asia/Kolkata"}`
                    : "Awaiting confirmed scheduling"}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Recent Audit Trail
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Server-side admin activity snapshots.
            </h2>
          </div>

          <div className="space-y-4">
            {dashboard.auditTrail.length ? (
              dashboard.auditTrail.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <AdminStatusBadge status={entry.action.toUpperCase()} />
                    <p className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                      {formatAdminDateTime(entry.createdAt)}
                    </p>
                  </div>
                  <p className="mt-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-foreground)]">
                    {entry.summary}
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                    {entry.actor?.name
                      ? `${entry.actor.name} • ${entry.actorRoleKey ?? "admin"}`
                      : (entry.actorRoleKey ?? "system")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                Audit records will begin appearing here once admin actions are
                used.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
