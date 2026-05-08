import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { getAdminContentOverview } from "@/modules/admin/control-panel";
import { requireAdminSession } from "@/modules/auth/server";

export const metadata = buildAdminMetadata({
  title: "Admin Daily Rashifal",
  description:
    "Manual daily Rashifal publishing inventory and template coverage for the content team.",
  path: "/admin/rashifal",
  keywords: ["admin rashifal", "daily rashifal", "manual publishing"],
});

export default async function AdminDailyRashifalPage() {
  await requireAdminSession({
    allowedRoles: ["founder", "editor"],
  });

  const content = await getAdminContentOverview();

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Daily Rashifal"
        title="Daily Rashifal stays manual, editorial, and carefully reviewed."
        description="These entries are catalog-backed and do not auto-generate astrology content. This page helps the team review the live Rashifal inventory and the draft templates that still need editorial attention."
        actions={
          <Link
            href="/admin/content"
            className={buttonStyles({ tone: "secondary", size: "sm" })}
          >
            Back To Content
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Published Rashifal
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {content.rashifalEntries.length}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Draft Templates
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {content.draftRashifalTemplates.length}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Language Safety
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            Assamese text and manual editorial cadence remain supported through the content catalog.
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Editorial Policy
          </p>
          <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
            No automatic astrology generation happens from this admin surface.
          </p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Published Rashifal Entries
          </p>
          <div className="space-y-3">
            {content.rashifalEntries.length ? (
              content.rashifalEntries.map((entry) => (
                <div
                  key={entry.slug}
                  className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                        {entry.title}
                      </p>
                      <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                        {entry.category}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AdminStatusBadge status={entry.status} />
                    </div>
                  </div>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                    {entry.seoDescription}
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                    Updated {entry.updatedAtLabel}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                No published Daily Rashifal entries are available yet.
              </p>
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Draft Rashifal Templates
          </p>
          <div className="space-y-3">
            {content.draftRashifalTemplates.length ? (
              content.draftRashifalTemplates.map((entry) => (
                <div
                  key={entry.slug}
                  className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                        {entry.title}
                      </p>
                      <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                        {entry.typeLabel} | {entry.category}
                      </p>
                  </div>
                  <AdminStatusBadge status={entry.status} />
                </div>
                <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  {entry.seoDescription}
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  Updated {entry.updatedAtLabel}
                </p>
              </div>
            ))
            ) : (
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                No Daily Rashifal templates are waiting for review.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
