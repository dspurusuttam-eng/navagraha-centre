"use server";

// Claude Admin Console C4A/C4B2 — Desk article create / Save-Draft / lifecycle actions.
// Reuses the C2A article service (validation + audit) with the admin session actor.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { getAdminArticleDeps } from "@/modules/admin/articles/service";
import { createArticle, updateArticle, transitionArticle, deleteArticle } from "@/modules/admin/articles/service-core";
import { formDataToArticleInput } from "@/modules/admin/desk/article-form-config";
import type { ArticleTransitionAction } from "@/modules/admin/domain";
import type { ArticleActor, ServiceResult } from "@/modules/admin/articles/types";

export type ArticleFormState = {
  error: string | null;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

async function adminActorOrNull(): Promise<ArticleActor | null> {
  const session = await getAdminPageSessionOrNull();
  if (!session) return null;
  return {
    userId: session.user.id,
    roleKeys: session.adminRoles.map((role) => role.key),
    primaryRoleKey: session.adminRole.key,
  };
}

function mapServiceError<T>(result: Extract<ServiceResult<T>, { ok: false }>): ArticleFormState {
  if ((result.code === "VALIDATION_ERROR" || result.code === "INCOMPLETE_DRAFT") && Array.isArray(result.issues)) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.issues as Array<{ path?: (string | number)[]; message?: string }>) {
      const field = issue.path?.[0];
      if (typeof field === "string" && !fieldErrors[field]) fieldErrors[field] = issue.message ?? "Invalid value.";
    }
    const error =
      result.code === "INCOMPLETE_DRAFT"
        ? "This draft isn't ready to publish. Complete the required fields (title, slug and body) first."
        : "Please fix the highlighted fields.";
    return { error, fieldErrors };
  }
  if (result.code === "SLUG_TAKEN") {
    return { error: result.message, fieldErrors: { slug: "This slug is already in use." } };
  }
  return { error: result.message };
}

export async function createArticleAction(_prev: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  const actor = await adminActorOrNull();
  if (!actor) return { error: "You are not authorized to manage articles." };
  const result = await createArticle(getAdminArticleDeps(), actor, formDataToArticleInput(formData));
  if (!result.ok) return mapServiceError(result);
  revalidatePath("/admin/desk");
  redirect(`/admin/desk/${result.data.id}`);
}

export async function updateArticleAction(id: string, _prev: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  const actor = await adminActorOrNull();
  if (!actor) return { error: "You are not authorized to manage articles." };
  // preserveEmptyBody: a DRAFT autosave may intentionally clear the body ("" persists).
  const result = await updateArticle(getAdminArticleDeps(), actor, id, formDataToArticleInput(formData, { preserveEmptyBody: true }));
  if (!result.ok) return mapServiceError(result);
  revalidatePath("/admin/desk");
  revalidatePath(`/admin/desk/${id}`);
  return { error: null, ok: true };
}

// --- C4B2 lifecycle transitions (Publish/Republish/Unpublish/Archive/Restore) --------
// Direct-call server actions (invoked from the client lifecycle controls, not a form).
// The service re-checks role (403) + state machine (409) + publish completeness (422).
export async function runArticleTransition(id: string, action: ArticleTransitionAction): Promise<ArticleFormState> {
  const actor = await adminActorOrNull();
  if (!actor) return { error: "You are not authorized to manage articles." };
  const result = await transitionArticle(getAdminArticleDeps(), actor, id, action);
  if (!result.ok) return mapServiceError(result);
  revalidatePath("/admin/desk");
  revalidatePath(`/admin/desk/${id}`);
  return { error: null, ok: true };
}

// Permanent delete: confirmation is enforced in the UI; redirects to the list on success
// so the now-deleted article's editor is never re-rendered.
export async function deleteArticlePermanently(id: string): Promise<ArticleFormState> {
  const actor = await adminActorOrNull();
  if (!actor) return { error: "You are not authorized to manage articles." };
  const result = await deleteArticle(getAdminArticleDeps(), actor, id, true);
  if (!result.ok) return mapServiceError(result);
  revalidatePath("/admin/desk");
  redirect("/admin/desk");
}
