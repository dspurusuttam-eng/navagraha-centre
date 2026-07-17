// Claude Admin Console C2B2 — Brand/profile settings service operations (pure; DI).
import {
  brandSettingsSchema,
  brandSettingsPatchSchema,
  defaultBrandSettings,
  type BrandSettingsInput,
} from "@/modules/admin/domain";
import { hasAdminAccess } from "@/modules/admin/permissions";
import type { AuditEntryInput, AuditWriteResult } from "@/modules/admin/audit-core";
import type { BrandSettingsRepository } from "@/modules/admin/brand/repository";

export type BrandActor = {
  userId: string;
  roleKeys: readonly string[];
  primaryRoleKey: string | null;
};

export type BrandServiceDeps = {
  repo: BrandSettingsRepository;
  audit: (input: AuditEntryInput) => Promise<AuditWriteResult>;
};

export type ServiceResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; code: string; message: string; issues?: unknown };

function canWrite(actor: BrandActor): boolean {
  return hasAdminAccess(actor.roleKeys.map((key) => ({ key })), ["founder", "editor"]);
}

export async function getBrandSettings(deps: BrandServiceDeps): Promise<ServiceResult<BrandSettingsInput>> {
  const current = await deps.repo.get();
  return { ok: true, status: 200, data: current ?? defaultBrandSettings() };
}

export async function updateBrandSettings(
  deps: BrandServiceDeps,
  actor: BrandActor,
  input: unknown,
): Promise<ServiceResult<BrandSettingsInput>> {
  if (!canWrite(actor)) {
    return { ok: false, status: 403, code: "FORBIDDEN", message: "You do not have write access to brand settings." };
  }
  const patch = brandSettingsPatchSchema.safeParse(input);
  if (!patch.success) {
    return { ok: false, status: 422, code: "VALIDATION_ERROR", message: "Invalid brand settings.", issues: patch.error.issues };
  }
  const current = (await deps.repo.get()) ?? defaultBrandSettings();
  // C8E — activation: the FIRST successful founder/editor save publishes the brand
  // settings, and every later save preserves that. There is deliberately no separate
  // toggle. Enforced here so the Admin form and the PATCH API behave identically.
  const merged = { ...current, ...patch.data, isEnabled: true };
  const validated = brandSettingsSchema.safeParse(merged);
  if (!validated.success) {
    return { ok: false, status: 422, code: "VALIDATION_ERROR", message: "Invalid brand settings.", issues: validated.error.issues };
  }
  const saved = await deps.repo.save(validated.data);
  await deps.audit({
    actorUserId: actor.userId,
    actorRoleKey: actor.primaryRoleKey,
    entityType: "brand_settings",
    entityId: "default",
    action: "brand.settings.update",
    summary: "Updated brand/profile settings.",
    // Non-sensitive presence flags only — no raw email / WhatsApp / biography stored.
    metadata: {
      hasProfileImage: Boolean(saved.profileImageAssetId),
      hasWhatsapp: Boolean(saved.whatsappNumber),
      hasSupportEmail: Boolean(saved.supportEmail),
      socialLinkCount: saved.socialLinks.length,
    },
  });
  return { ok: true, status: 200, data: saved };
}
