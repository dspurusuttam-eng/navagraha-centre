"use server";

// Claude Admin Console C5A — Consultation settings save action.
// Reuses the existing C2B1 consultation service (validation + merge + audit) with the
// admin session actor. The service independently enforces founder/editor write access,
// so a support submission is rejected server-side even if the UI is bypassed.
import { revalidatePath } from "next/cache";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { getConsultationDeps } from "@/modules/admin/consultation/service";
import { updateConsultationSettings, type ServiceResult } from "@/modules/admin/consultation/service-core";
import { formDataToConsultationPatch } from "@/modules/admin/consultation/consultation-form-config";

export type ConsultationFormState = {
  error: string | null;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

function mapServiceError<T>(result: Extract<ServiceResult<T>, { ok: false }>): ConsultationFormState {
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

export async function updateConsultationAction(
  _prev: ConsultationFormState,
  formData: FormData,
): Promise<ConsultationFormState> {
  const session = await getAdminPageSessionOrNull();
  if (!session) return { error: "You are not authorized to manage consultation settings." };

  const actor = {
    userId: session.user.id,
    roleKeys: session.adminRoles.map((role) => role.key),
    primaryRoleKey: session.adminRole.key,
  };
  const result = await updateConsultationSettings(getConsultationDeps(), actor, formDataToConsultationPatch(formData));
  if (!result.ok) return mapServiceError(result);
  revalidatePath("/admin/consultation");
  return { error: null, ok: true };
}
