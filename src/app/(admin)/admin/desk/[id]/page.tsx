// Claude Admin Console C4A — edit article page.
import type { Metadata } from "next";
import Link from "next/link";
import { ArticleForm } from "@/modules/admin/desk/article-form";
import { updateArticleAction, runArticleTransition, deleteArticlePermanently } from "@/modules/admin/desk/article-actions";
import { articleToFormValues } from "@/modules/admin/desk/article-form-config";
import { getAdminArticleDeps } from "@/modules/admin/articles/service";
import { getArticle } from "@/modules/admin/articles/service-core";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { getMediaPickerOptions } from "@/modules/admin/media/picker-options";
import { inspectDeskBody } from "@/modules/desk-sidecar/sidecar";
import { SIDECAR_MALFORMED_MESSAGE } from "@/modules/admin/desk/sidecar-notice";
import { hasAdminAccess } from "@/modules/admin/permissions";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Edit Article — Admin Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DeskEditArticlePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const [result, session, mediaOptions, likeCount] = await Promise.all([
    getArticle(getAdminArticleDeps(), id),
    getAdminPageSessionOrNull(),
    getMediaPickerOptions(),
    // Founder-facing engagement: anonymous public likes for this article.
    getPrisma()
      .articleLike.count({ where: { articleId: id } })
      .catch(() => null),
  ]);
  const roleKeys = session?.adminRoles.map((role) => role.key) ?? [];
  const canWrite = hasAdminAccess(session?.adminRoles ?? [], ["founder", "editor"]);

  if (!result.ok) {
    return (
      <section className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Article not found</h1>
        <p className="text-sm text-neutral-600">This article could not be loaded. It may have been removed.</p>
        <Link href="/admin/desk" className="inline-flex min-h-11 items-center rounded-md border px-4 py-2 text-sm">
          Back to list
        </Link>
      </section>
    );
  }

  // C8B2: a damaged sidecar blocks editing rather than risking an overwrite. Only the
  // human message crosses to the client — never the raw block.
  const sidecarWarning =
    inspectDeskBody(result.data.body).state === "malformed" ? SIDECAR_MALFORMED_MESSAGE : null;

  return (
    <>
      {likeCount !== null ? (
        <p className="mx-auto mb-3 max-w-3xl text-sm font-medium text-neutral-600">
          Reader likes: <span className="font-semibold text-neutral-900">{likeCount}</span>
        </p>
      ) : null}
      <ArticleForm
      mode="edit"
      action={updateArticleAction.bind(null, id)}
      initial={articleToFormValues(result.data)}
      enableAutosave
      previewHref={`/admin/desk/${id}/preview`}
      mediaOptions={mediaOptions}
      canWrite={canWrite}
      sidecarWarning={sidecarWarning}
      lifecycle={{
        articleId: id,
        status: result.data.status,
        roleKeys,
        transition: runArticleTransition,
        remove: deleteArticlePermanently,
      }}
      />
    </>
  );
}
