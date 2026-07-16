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
import { hasAdminAccess } from "@/modules/admin/permissions";

export const metadata: Metadata = {
  title: "Edit Article — Admin Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DeskEditArticlePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const [result, session, mediaOptions] = await Promise.all([
    getArticle(getAdminArticleDeps(), id),
    getAdminPageSessionOrNull(),
    getMediaPickerOptions(),
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

  return (
    <ArticleForm
      mode="edit"
      action={updateArticleAction.bind(null, id)}
      initial={articleToFormValues(result.data)}
      enableAutosave
      previewHref={`/admin/desk/${id}/preview`}
      mediaOptions={mediaOptions}
      canWrite={canWrite}
      lifecycle={{
        articleId: id,
        status: result.data.status,
        roleKeys,
        transition: runArticleTransition,
        remove: deleteArticlePermanently,
      }}
    />
  );
}
