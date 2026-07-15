// Claude Admin Console C2C — Media service operations (pure; DI: repo + refs + audit).
// Reference-aware deletion: blocks removal while an Article or BrandSettings points at
// the asset, and requires explicit confirmation. Every mutation is audited.
import { createMediaAssetSchema, updateMediaAssetSchema, MEDIA_ASSET_KINDS } from "@/modules/admin/domain";
import { hasAdminAccess } from "@/modules/admin/permissions";
import type { AuditEntryInput, AuditWriteResult } from "@/modules/admin/audit-core";
import type { MediaActor, MediaListFilters, MediaListResult, MediaRecord, MediaReferenceCount, ServiceResult } from "@/modules/admin/media/types";
import type { MediaRepository, MediaReferenceChecker } from "@/modules/admin/media/repository";

export type MediaServiceDeps = {
  repo: MediaRepository;
  refs: MediaReferenceChecker;
  audit: (input: AuditEntryInput) => Promise<AuditWriteResult>;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function canWrite(actor: MediaActor): boolean {
  return hasAdminAccess(actor.roleKeys.map((key) => ({ key })), ["founder", "editor"]);
}

function err<T>(status: number, code: string, message: string, issues?: unknown): ServiceResult<T> {
  return { ok: false, status, code, message, ...(issues === undefined ? {} : { issues }) };
}

function clampPage(value: number | null | undefined, fallback: number, min: number, max: number): number {
  const n = Math.trunc(Number(value ?? fallback));
  if (!Number.isFinite(n) || n < min) return min;
  return Math.min(n, max);
}

// --- Read (any admin) ------------------------------------------------------
export async function listMedia(deps: MediaServiceDeps, filters: MediaListFilters): Promise<ServiceResult<MediaListResult>> {
  const page = clampPage(filters.page, 1, 1, 1_000_000);
  const pageSize = clampPage(filters.pageSize, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  const kind = filters.kind && (MEDIA_ASSET_KINDS as readonly string[]).includes(filters.kind) ? filters.kind : undefined;
  const search = filters.search?.trim() ? filters.search.trim().slice(0, 200) : undefined;
  const { items, total } = await deps.repo.list({ kind, search, skip: (page - 1) * pageSize, take: pageSize });
  return { ok: true, status: 200, data: { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) } };
}

export async function getMedia(deps: MediaServiceDeps, id: string): Promise<ServiceResult<MediaRecord>> {
  const record = await deps.repo.findById(id);
  if (!record) return err(404, "NOT_FOUND", "Media asset not found.");
  return { ok: true, status: 200, data: record };
}

/** Reference report for a media asset (used by the admin UI + delete guard). */
export async function getMediaReferences(deps: MediaServiceDeps, id: string): Promise<ServiceResult<MediaReferenceCount>> {
  const record = await deps.repo.findById(id);
  if (!record) return err(404, "NOT_FOUND", "Media asset not found.");
  return { ok: true, status: 200, data: await deps.refs(id) };
}

// --- Write (founder/editor) ------------------------------------------------
export async function createMedia(deps: MediaServiceDeps, actor: MediaActor, input: unknown): Promise<ServiceResult<MediaRecord>> {
  if (!canWrite(actor)) return err(403, "FORBIDDEN", "You do not have write access to media.");
  const parsed = createMediaAssetSchema.safeParse(input);
  if (!parsed.success) return err(422, "VALIDATION_ERROR", "Invalid media payload.", parsed.error.issues);
  const d = parsed.data;
  const created = await deps.repo.create({
    kind: d.kind,
    url: d.url,
    filename: d.filename ?? null,
    mimeType: d.mimeType ?? null,
    byteSize: d.byteSize ?? null,
    width: d.width ?? null,
    height: d.height ?? null,
    altText: d.altText,
    caption: d.caption ?? null,
    createdById: actor.userId,
  });
  await deps.audit({ actorUserId: actor.userId, actorRoleKey: actor.primaryRoleKey, entityType: "media_asset", entityId: created.id, action: "media.create", summary: `Registered media ${created.filename ?? created.id}`, metadata: { kind: created.kind, mimeType: created.mimeType } });
  return { ok: true, status: 201, data: created };
}

export async function updateMedia(deps: MediaServiceDeps, actor: MediaActor, id: string, input: unknown): Promise<ServiceResult<MediaRecord>> {
  if (!canWrite(actor)) return err(403, "FORBIDDEN", "You do not have write access to media.");
  const current = await deps.repo.findById(id);
  if (!current) return err(404, "NOT_FOUND", "Media asset not found.");
  const parsed = updateMediaAssetSchema.safeParse(input);
  if (!parsed.success) return err(422, "VALIDATION_ERROR", "Invalid media payload.", parsed.error.issues);
  const d = parsed.data;
  const updated = await deps.repo.update(id, {
    ...(d.kind !== undefined ? { kind: d.kind } : {}),
    ...(d.url !== undefined ? { url: d.url } : {}),
    ...(d.filename !== undefined ? { filename: d.filename ?? null } : {}),
    ...(d.mimeType !== undefined ? { mimeType: d.mimeType ?? null } : {}),
    ...(d.byteSize !== undefined ? { byteSize: d.byteSize ?? null } : {}),
    ...(d.width !== undefined ? { width: d.width ?? null } : {}),
    ...(d.height !== undefined ? { height: d.height ?? null } : {}),
    ...(d.altText !== undefined ? { altText: d.altText } : {}),
    ...(d.caption !== undefined ? { caption: d.caption ?? null } : {}),
  });
  await deps.audit({ actorUserId: actor.userId, actorRoleKey: actor.primaryRoleKey, entityType: "media_asset", entityId: id, action: "media.update", summary: `Updated media ${updated.filename ?? id}`, metadata: { kind: updated.kind } });
  return { ok: true, status: 200, data: updated };
}

export async function deleteMedia(deps: MediaServiceDeps, actor: MediaActor, id: string, confirmed: boolean): Promise<ServiceResult<{ id: string }>> {
  if (!canWrite(actor)) return err(403, "FORBIDDEN", "You do not have write access to media.");
  if (!confirmed) return err(400, "CONFIRMATION_REQUIRED", "Permanent deletion requires explicit confirmation.");
  const current = await deps.repo.findById(id);
  if (!current) return err(404, "NOT_FOUND", "Media asset not found.");
  const references = await deps.refs(id);
  if (references.total > 0) {
    return err(409, "REFERENCED", "Media is referenced and cannot be deleted. Remove the references first.", references);
  }
  await deps.repo.remove(id);
  await deps.audit({ actorUserId: actor.userId, actorRoleKey: actor.primaryRoleKey, entityType: "media_asset", entityId: id, action: "media.delete", summary: `Deleted media ${current.filename ?? id}`, metadata: { kind: current.kind } });
  return { ok: true, status: 200, data: { id } };
}
