import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import { updateRemedyAction } from "@/modules/admin/actions";
import { formatAdminDate, formatAdminDateTime } from "@/modules/admin/format";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { listAdminRemedies } from "@/modules/admin/service";
import { requireAdminSession } from "@/modules/auth/server";

export const metadata = buildAdminMetadata({
  title: "Admin Remedies",
  description:
    "Manage approved remedy records, publication state, and featured visibility for deterministic recommendation workflows.",
  path: "/admin/remedies",
  keywords: ["remedy admin", "approved remedies", "content governance"],
});

export default async function AdminRemediesPage() {
  await requireAdminSession({
    allowedRoles: ["founder", "editor"],
  });

  const remedies = await listAdminRemedies();

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Remedies"
        title="Approved remedy records stay curated, reviewable, and intentionally scoped."
        description="Publishing here determines whether a remedy is eligible for deterministic recommendation. This keeps remedy visibility governed by approved records rather than ad hoc generation."
      />

      <Card className="space-y-5">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3 text-left">
            <thead>
              <tr className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                <th className="px-3 py-2">Remedy</th>
                <th className="px-3 py-2">State</th>
                <th className="px-3 py-2">Connections</th>
                <th className="px-3 py-2">Controls</th>
              </tr>
            </thead>
            <tbody>
              {remedies.map((remedy) => (
                <tr key={remedy.id}>
                  <td className="rounded-l-[var(--radius-xl)] border border-r-0 border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                          {remedy.title}
                        </p>
                        {remedy.publishedAt ? (
                          <AdminStatusBadge status="PUBLISHED" />
                        ) : (
                          <AdminStatusBadge status="HELD" />
                        )}
                        {remedy.isFeatured ? (
                          <AdminStatusBadge status="FEATURED" />
                        ) : null}
                      </div>
                      <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                        {remedy.slug}
                      </p>
                      <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                        {remedy.type}
                      </p>
                    </div>
                  </td>

                  <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                    <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                      <p>
                        Published on:{" "}
                        <span className="text-[color:var(--color-foreground)]">
                          {formatAdminDate(remedy.publishedAt)}
                        </span>
                      </p>
                      <p>
                        Updated:{" "}
                        <span className="text-[color:var(--color-foreground)]">
                          {formatAdminDateTime(remedy.updatedAt)}
                        </span>
                      </p>
                    </div>
                  </td>

                  <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                    <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                      <p>
                        Linked products:{" "}
                        <span className="text-[color:var(--color-foreground)]">
                          {remedy._count.productLinks}
                        </span>
                      </p>
                    </div>
                  </td>

                  <td className="rounded-r-[var(--radius-xl)] border border-l-0 border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                    <form action={updateRemedyAction} className="space-y-3">
                      <input type="hidden" name="remedyId" value={remedy.id} />
                      <label className="block space-y-2">
                        <span className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                          Publication state
                        </span>
                        <Select
                          name="publicationState"
                          defaultValue={
                            remedy.publishedAt ? "published" : "hold"
                          }
                        >
                          <option value="published">Published</option>
                          <option value="hold">
                            Hold from recommendations
                          </option>
                        </Select>
                      </label>
                      <label className="flex items-center gap-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                        <input
                          className="h-4 w-4 rounded border border-[color:var(--color-border-strong)] bg-transparent accent-[color:var(--color-accent)]"
                          type="checkbox"
                          name="isFeatured"
                          defaultChecked={remedy.isFeatured}
                        />
                        Keep featured in curated remedy surfaces
                      </label>
                      <Button size="sm" type="submit">
                        Save Remedy
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
