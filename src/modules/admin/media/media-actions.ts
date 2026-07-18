"use server";

// Claude Admin Console C6A — Media create / update / delete server actions.
// Reuses the C2C media service (validation + reference-aware delete + audit) with the
// admin session actor. The service independently enforces founder/editor write access.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { getMediaDeps } from "@/modules/admin/media/service";
import { createMedia, updateMedia, deleteMedia } from "@/modules/admin/media/service-core";
import { formDataToMediaInput } from "@/modules/admin/media/media-form-config";
import type { MediaActor, ServiceResult } from "@/modules/admin/media/types";

export type MediaFormState = {
  error: string | null;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

async function adminActorOrNull(): Promise<MediaActor | null> {
  const session = await getAdminPageSessionOrNull();
  if (!session) return null;
  return {
    userId: session.user.id,
    roleKeys: session.adminRoles.map((role) => role.key),
    primaryRoleKey: session.adminRole.key,
  };
}

function mapServiceError<T>(result: Extract<ServiceResult<T>, { ok: false }>): MediaFormState {
  if (result.code === "VALIDATION_ERROR" && Array.isArray(result.issues)) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.issues as Array<{ path?: (string | number)[]; message?: string }>) {
      const field = issue.path?.[0];
      if (typeof field === "string" && !fieldErrors[field]) fieldErrors[field] = issue.message ?? "Invalid value.";
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  return { error: result.message };
}

export async function createMediaAction(_prev: MediaFormState, formData: FormData): Promise<MediaFormState> {
  const actor = await adminActorOrNull();
  if (!actor) return { error: "You are not authorized to manage media." };
  const result = await createMedia(getMediaDeps(), actor, formDataToMediaInput(formData));
  if (!result.ok) return mapServiceError(result);
  revalidatePath("/admin/media");
  redirect(`/admin/media/${result.data.id}`);
}

export async function updateMediaAction(id: string, _prev: MediaFormState, formData: FormData): Promise<MediaFormState> {
  const actor = await adminActorOrNull();
  if (!actor) return { error: "You are not authorized to manage media." };
  const result = await updateMedia(getMediaDeps(), actor, id, formDataToMediaInput(formData));
  if (!result.ok) return mapServiceError(result);
  revalidatePath("/admin/media");
  revalidatePath(`/admin/media/${id}`);
  return { error: null, ok: true };
}

/**
 * Permanent delete. The service blocks a referenced asset (409 REFERENCED) and requires
 * explicit confirmation; the UI confirms first and only enables this for unused assets.
 * Redirects to the library on success so the deleted asset's editor never re-renders.
 */
export async function deleteMediaAction(id: string): Promise<MediaFormState> {
  const actor = await adminActorOrNull();
  if (!actor) return { error: "You are not authorized to manage media." };
  const result = await deleteMedia(getMediaDeps(), actor, id, true);
  if (!result.ok) return mapServiceError(result);
  revalidatePath("/admin/media");
  redirect("/admin/media");
}
