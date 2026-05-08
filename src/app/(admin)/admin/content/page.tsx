import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { getAdminContentOverview } from "@/modules/admin/control-panel";
import { requireAdminSession } from "@/modules/auth/server";

export const metadata = buildAdminMetadata({
  title: "Admin Content",
  description:
    "Editorial overview for From the Desk articles and the catalog-backed content library.",
  path: "/admin/content",
  keywords: ["admin content", "from the desk", "editorial overview"],
});

export default async function AdminContentPage() {
  await requireAdminSession({
    allowedRoles: ["founder", "editor"],
  });

  const content = await getAdminContentOverview();

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Content"
        title="Editorial control stays separate from user-facing astrology calculations."
        description="This page gives the team a safe way to inspect article records and the code-backed public content library without exposing internal notes or private prompts."
        actions={
          <>
            <Link
              href="/admin/articles"
              className={buttonStyles({ tone: "secondary", size: "sm" })}
            >
              Review Articles
            </Link>
            <Link
              href="/admin/rashifal"
              className={buttonStyles({ tone: "ghost", size: "sm" })}
            >
              Review Daily Rashifal
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Articles
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {content.articles.length}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Published Catalog Entries
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {content.publishedCatalogEntries.length}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Rashifal Entries
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {content.rashifalEntries.length}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Draft Rashifal Templates
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {content.draftRashifalTemplates.length}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Articles
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]">
                Safe editorial records
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {content.articles.slice(0, 8).map((article) => (
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
                  <div className="flex flex-wrap gap-2">
                    <AdminStatusBadge status={article.status} />
                  </div>
                </div>
                <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  Author: {article.authorName}
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  Updated {article.updatedAtLabel}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Live Content Library
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]">
                From the Desk and daily editorial entries
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {content.publishedCatalogEntries.slice(0, 8).map((entry) => (
              <div
                key={`${entry.slug}-${entry.type}`}
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
                  Updated {entry.updatedAtLabel}
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  {entry.seoDescription}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
