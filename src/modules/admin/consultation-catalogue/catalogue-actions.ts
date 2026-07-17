"use server";

// Claude C10A — Consultation catalogue Admin server actions.
// Reuses the pure catalogue service (validation + publish gate + audit) with the admin
// session actor. The service independently enforces founder/editor write access, so a support
// submission is rejected server-side even if the UI is bypassed. Publication is a dedicated
// action, separate from ordinary edits — incomplete edits stay private until an explicit publish.
import { revalidatePath } from "next/cache";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { getCatalogueDeps } from "@/modules/admin/consultation-catalogue/service";
import {
  createTier,
  updateTier,
  deleteTier,
  transitionTier,
  createUtility,
  updateUtility,
  deleteUtility,
  transitionUtility,
  createMode,
  updateMode,
  deleteMode,
} from "@/modules/admin/consultation-catalogue/service-core";
import type { ServiceResult, CatalogueActor, PublicationAction } from "@/modules/admin/consultation-catalogue/types";
import {
  formToTierInput,
  formToTierUpdate,
  formToUtilityInput,
  formToUtilityUpdate,
  formToModeInput,
  formToModeUpdate,
} from "@/modules/admin/consultation-catalogue/catalogue-form";

const CATALOGUE_PATH = "/admin/consultation-catalogue";

export type CatalogueFormState = {
  error: string | null;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

async function actorOrNull(): Promise<CatalogueActor | null> {
  const session = await getAdminPageSessionOrNull();
  if (!session) return null;
  return {
    userId: session.user.id,
    roleKeys: session.adminRoles.map((role) => role.key),
    primaryRoleKey: session.adminRole.key,
  };
}

function mapError<T>(result: Extract<ServiceResult<T>, { ok: false }>): CatalogueFormState {
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

const NOT_AUTHORIZED: CatalogueFormState = { error: "You are not authorized to manage the consultation catalogue." };

// --- Tier actions (useActionState) ------------------------------------------
export async function createTierAction(_prev: CatalogueFormState, formData: FormData): Promise<CatalogueFormState> {
  const actor = await actorOrNull();
  if (!actor) return NOT_AUTHORIZED;
  const result = await createTier(getCatalogueDeps(), actor, formToTierInput(formData));
  if (!result.ok) return mapError(result);
  revalidatePath(CATALOGUE_PATH);
  return { error: null, ok: true };
}

export async function updateTierAction(_prev: CatalogueFormState, formData: FormData): Promise<CatalogueFormState> {
  const actor = await actorOrNull();
  if (!actor) return NOT_AUTHORIZED;
  const id = String(formData.get("id") ?? "");
  const result = await updateTier(getCatalogueDeps(), actor, id, formToTierUpdate(formData));
  if (!result.ok) return mapError(result);
  revalidatePath(CATALOGUE_PATH);
  return { error: null, ok: true };
}

export async function createUtilityAction(_prev: CatalogueFormState, formData: FormData): Promise<CatalogueFormState> {
  const actor = await actorOrNull();
  if (!actor) return NOT_AUTHORIZED;
  const result = await createUtility(getCatalogueDeps(), actor, formToUtilityInput(formData));
  if (!result.ok) return mapError(result);
  revalidatePath(CATALOGUE_PATH);
  return { error: null, ok: true };
}

export async function updateUtilityAction(_prev: CatalogueFormState, formData: FormData): Promise<CatalogueFormState> {
  const actor = await actorOrNull();
  if (!actor) return NOT_AUTHORIZED;
  const id = String(formData.get("id") ?? "");
  const result = await updateUtility(getCatalogueDeps(), actor, id, formToUtilityUpdate(formData));
  if (!result.ok) return mapError(result);
  revalidatePath(CATALOGUE_PATH);
  return { error: null, ok: true };
}

export async function createModeAction(_prev: CatalogueFormState, formData: FormData): Promise<CatalogueFormState> {
  const actor = await actorOrNull();
  if (!actor) return NOT_AUTHORIZED;
  const utilityId = String(formData.get("utilityId") ?? "");
  const result = await createMode(getCatalogueDeps(), actor, utilityId, formToModeInput(formData));
  if (!result.ok) return mapError(result);
  revalidatePath(CATALOGUE_PATH);
  return { error: null, ok: true };
}

export async function updateModeAction(_prev: CatalogueFormState, formData: FormData): Promise<CatalogueFormState> {
  const actor = await actorOrNull();
  if (!actor) return NOT_AUTHORIZED;
  const id = String(formData.get("id") ?? "");
  const result = await updateMode(getCatalogueDeps(), actor, id, formToModeUpdate(formData));
  if (!result.ok) return mapError(result);
  revalidatePath(CATALOGUE_PATH);
  return { error: null, ok: true };
}

// --- Publication + delete actions (plain form actions) ----------------------
function toPublicationAction(value: unknown): PublicationAction | null {
  return value === "PUBLISH" || value === "UNPUBLISH" || value === "ARCHIVE" ? value : null;
}

export async function transitionTierAction(formData: FormData): Promise<void> {
  const actor = await actorOrNull();
  if (!actor) return;
  const id = String(formData.get("id") ?? "");
  const action = toPublicationAction(formData.get("action"));
  if (id && action) await transitionTier(getCatalogueDeps(), actor, id, action);
  revalidatePath(CATALOGUE_PATH);
}

export async function transitionUtilityAction(formData: FormData): Promise<void> {
  const actor = await actorOrNull();
  if (!actor) return;
  const id = String(formData.get("id") ?? "");
  const action = toPublicationAction(formData.get("action"));
  if (id && action) await transitionUtility(getCatalogueDeps(), actor, id, action);
  revalidatePath(CATALOGUE_PATH);
}

export async function deleteTierAction(formData: FormData): Promise<void> {
  const actor = await actorOrNull();
  if (!actor) return;
  const id = String(formData.get("id") ?? "");
  if (id) await deleteTier(getCatalogueDeps(), actor, id, formData.get("confirm") === "on");
  revalidatePath(CATALOGUE_PATH);
}

export async function deleteUtilityAction(formData: FormData): Promise<void> {
  const actor = await actorOrNull();
  if (!actor) return;
  const id = String(formData.get("id") ?? "");
  if (id) await deleteUtility(getCatalogueDeps(), actor, id, formData.get("confirm") === "on");
  revalidatePath(CATALOGUE_PATH);
}

export async function deleteModeAction(formData: FormData): Promise<void> {
  const actor = await actorOrNull();
  if (!actor) return;
  const id = String(formData.get("id") ?? "");
  if (id) await deleteMode(getCatalogueDeps(), actor, id, formData.get("confirm") === "on");
  revalidatePath(CATALOGUE_PATH);
}
