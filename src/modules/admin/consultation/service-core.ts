// Claude Admin Console C2B1 — Consultation settings service operations (pure; DI).
import {
  consultationConfigSchema,
  consultationConfigPatchSchema,
  defaultConsultationConfig,
  type ConsultationConfig,
} from "@/modules/admin/domain";
import { hasAdminAccess } from "@/modules/admin/permissions";
import type { AuditEntryInput, AuditWriteResult } from "@/modules/admin/audit-core";
import type { ConsultationSettingsRepository } from "@/modules/admin/consultation/repository";

export type ConsultationActor = {
  userId: string;
  roleKeys: readonly string[];
  primaryRoleKey: string | null;
};

export type ConsultationServiceDeps = {
  repo: ConsultationSettingsRepository;
  audit: (input: AuditEntryInput) => Promise<AuditWriteResult>;
};

export type ServiceResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; code: string; message: string; issues?: unknown };

function canWrite(actor: ConsultationActor): boolean {
  return hasAdminAccess(actor.roleKeys.map((key) => ({ key })), ["founder", "editor"]);
}

export async function getConsultationSettings(deps: ConsultationServiceDeps): Promise<ServiceResult<ConsultationConfig>> {
  const current = await deps.repo.get();
  return { ok: true, status: 200, data: current ?? defaultConsultationConfig() };
}

export async function updateConsultationSettings(
  deps: ConsultationServiceDeps,
  actor: ConsultationActor,
  input: unknown,
): Promise<ServiceResult<ConsultationConfig>> {
  if (!canWrite(actor)) {
    return { ok: false, status: 403, code: "FORBIDDEN", message: "You do not have write access to consultation settings." };
  }
  const patch = consultationConfigPatchSchema.safeParse(input);
  if (!patch.success) {
    return { ok: false, status: 422, code: "VALIDATION_ERROR", message: "Invalid consultation settings.", issues: patch.error.issues };
  }
  const current = (await deps.repo.get()) ?? defaultConsultationConfig();
  // C10A — publication is DEFERRED. Saving configuration must NOT publish or enable
  // Consultation: `isEnabled` is hard-locked to false here (regardless of any crafted patch)
  // and stays false until a future explicit activation phase. This deliberately reverses the
  // C8D1 first-save auto-activation so an editor can build the catalogue/settings privately.
  const merged = { ...current, ...patch.data, isEnabled: false };
  const validated = consultationConfigSchema.safeParse(merged);
  if (!validated.success) {
    return { ok: false, status: 422, code: "VALIDATION_ERROR", message: "Invalid consultation settings.", issues: validated.error.issues };
  }
  const saved = await deps.repo.save(validated.data);
  await deps.audit({
    actorUserId: actor.userId,
    actorRoleKey: actor.primaryRoleKey,
    entityType: "consultation_settings",
    entityId: "default",
    action: "consultation.settings.update",
    summary: "Updated consultation settings.",
    // Do NOT store the WhatsApp number itself; only a presence flag + non-sensitive state.
    metadata: {
      availabilityStatus: saved.availabilityStatus,
      isEnabled: saved.isEnabled,
      languages: saved.languages,
      hasWhatsapp: Boolean(saved.whatsappNumber),
    },
  });
  return { ok: true, status: 200, data: saved };
}
