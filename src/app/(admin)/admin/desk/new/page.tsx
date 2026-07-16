// Claude Admin Console C4A — new article (create) page.
import type { Metadata } from "next";
import { ArticleForm } from "@/modules/admin/desk/article-form";
import { createArticleAction } from "@/modules/admin/desk/article-actions";
import { emptyArticleFormValues } from "@/modules/admin/desk/article-form-config";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { getMediaPickerOptions } from "@/modules/admin/media/picker-options";
import { hasAdminAccess } from "@/modules/admin/permissions";

export const metadata: Metadata = {
  title: "New Article — Admin Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DeskNewArticlePage() {
  const [session, mediaOptions] = await Promise.all([
    getAdminPageSessionOrNull(),
    getMediaPickerOptions(),
  ]);
  const canWrite = hasAdminAccess(session?.adminRoles ?? [], ["founder", "editor"]);

  return (
    <ArticleForm
      mode="create"
      action={createArticleAction}
      initial={emptyArticleFormValues()}
      mediaOptions={mediaOptions}
      canWrite={canWrite}
    />
  );
}
