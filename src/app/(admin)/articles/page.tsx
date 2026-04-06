import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import { updateArticleStatusAction } from "@/modules/admin/actions";
import { formatAdminDate, formatAdminDateTime } from "@/modules/admin/format";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { listAdminArticles } from "@/modules/admin/service";
import { requireAdminSession } from "@/modules/auth/server";
import { contentTypeLabels } from "@/modules/content";

const articleStatusOptions = [
  "DRAFT",
  "REVIEW",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export const metadata = buildAdminMetadata({
  title: "Admin Articles",
  description:
    "Manage article approval states and review the current live content catalog from inside the NAVAGRAHA CENTRE admin panel.",
  path: "/admin/articles",
  keywords: ["article approval", "editorial review", "content governance"],
});

export default async function AdminArticlesPage() {
  await requireAdminSession({
    allowedRoles: ["founder", "editor"],
  });

  const { articles, liveEntries } = await listAdminArticles();

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Articles"
        title="Editorial records move through review states here before they deserve public trust."
        description="The database-backed article records hold the approval workflow, while the live insights catalog remains visible beside it so editorial governance stays grounded in what readers already see."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Approval Workflow
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Review is the explicit approval state before publication.
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3 text-left">
              <thead>
                <tr className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  <th className="px-3 py-2">Article</th>
                  <th className="px-3 py-2">State</th>
                  <th className="px-3 py-2">Controls</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td className="rounded-l-[var(--radius-xl)] border border-r-0 border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                            {article.title}
                          </p>
                          <AdminStatusBadge status={article.status} />
                        </div>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          {article.slug}
                        </p>
                        <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                          {article.author?.name
                            ? `Author: ${article.author.name}`
                            : "No author assigned"}
                        </p>
                      </div>
                    </td>

                    <td className="border-y border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                        <p>
                          Published:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {formatAdminDate(article.publishedAt)}
                          </span>
                        </p>
                        <p>
                          Updated:{" "}
                          <span className="text-[color:var(--color-foreground)]">
                            {formatAdminDateTime(article.updatedAt)}
                          </span>
                        </p>
                      </div>
                    </td>

                    <td className="rounded-r-[var(--radius-xl)] border border-l-0 border-[color:var(--color-border)] bg-[rgba(255,255,255,0.015)] px-3 py-4 align-top">
                      <form
                        action={updateArticleStatusAction}
                        className="space-y-3"
                      >
                        <input
                          type="hidden"
                          name="articleId"
                          value={article.id}
                        />
                        <label className="block space-y-2">
                          <span className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                            Approval state
                          </span>
                          <Select name="status" defaultValue={article.status}>
                            {articleStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </Select>
                        </label>
                        <Button size="sm" type="submit">
                          Save Article
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Live Content Catalog
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Current public insight entries from the code-backed content
              adapter.
            </h2>
          </div>

          <div className="space-y-4">
            {liveEntries.map((entry) => (
              <div
                key={entry.slug}
                className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                    {entry.title}
                  </p>
                  <AdminStatusBadge status={entry.status.toUpperCase()} />
                </div>
                <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  {contentTypeLabels[entry.type]}
                </p>
                <p className="mt-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  Updated {formatAdminDateTime(entry.updatedAt)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
