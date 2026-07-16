"use server";

// Claude Admin Console C5B — Brand/profile settings save action.
// Reuses the existing C2B2 brand service (validation + merge + audit) with the admin
// session actor. The service independently enforces founder/editor write access, so a
// support submission is rejected server-side even if the UI is bypassed.
import { revalidatePath } from "next/cache";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { getBrandDeps } from "@/modules/admin/brand/service";
import { updateBrandSettings, type ServiceResult } from "@/modules/admin/brand/service-core";
import { formDataToBrandPatch } from "@/modules/admin/brand/brand-form-config";

export type BrandFormState = {
  error: string | null;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

/** Map a Zod issue path to the form control that owns it (footer/socialLinks nest). */
function fieldNameForPath(path: (string | number)[] | undefined): string | null {
  const head = path?.[0];
  if (typeof head !== "string") return null;
  if (head === "footer") {
    const key = path?.[1];
    if (key === "addressLine") return "footerAddressLine";
    if (key === "copyright") return "footerCopyright";
    if (key === "note") return "footerNote";
    return "footerAddressLine";
  }
  return head; // socialLinks[i].url → "socialLinks"
}

function mapServiceError<T>(result: Extract<ServiceResult<T>, { ok: false }>): BrandFormState {
  if (result.code === "VALIDATION_ERROR" && Array.isArray(result.issues)) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.issues as Array<{ path?: (string | number)[]; message?: string }>) {
      const field = fieldNameForPath(issue.path);
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message ?? "Invalid value.";
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }
  return { error: result.message };
}

export async function updateBrandAction(_prev: BrandFormState, formData: FormData): Promise<BrandFormState> {
  const session = await getAdminPageSessionOrNull();
  if (!session) return { error: "You are not authorized to manage brand settings." };

  const actor = {
    userId: session.user.id,
    roleKeys: session.adminRoles.map((role) => role.key),
    primaryRoleKey: session.adminRole.key,
  };
  const result = await updateBrandSettings(getBrandDeps(), actor, formDataToBrandPatch(formData));
  if (!result.ok) return mapServiceError(result);
  revalidatePath("/admin/settings");
  return { error: null, ok: true };
}
