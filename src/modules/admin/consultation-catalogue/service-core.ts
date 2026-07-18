// Claude C10A — Consultation catalogue service operations (pure; DI: repo + audit + clock).
// Enforces founder/editor write access, C10A validation, slug uniqueness, the draft/publish
// gate (incomplete drafts can never go live), and delete confirmation/guards. Every mutation
// is audited through the injected writer. No DB, no route, no server-only.
import {
  createTierSchema,
  updateTierSchema,
  createUtilitySchema,
  updateUtilitySchema,
  createModeSchema,
  updateModeSchema,
  tierPublishableIssues,
  utilityPublishableIssues,
  type ConsultationPublicationState,
} from "@/modules/admin/consultation-catalogue/domain";
import { hasAdminAccess } from "@/modules/admin/permissions";
import type { AuditEntryInput, AuditWriteResult } from "@/modules/admin/audit-core";
import type { CatalogueRepository } from "@/modules/admin/consultation-catalogue/repository";
import type {
  CatalogueActor,
  ServiceResult,
  TierRecord,
  TierWithUtilities,
  UtilityRecord,
  ModeRecord,
  PublicationAction,
} from "@/modules/admin/consultation-catalogue/types";

export type CatalogueServiceDeps = {
  repo: CatalogueRepository;
  audit: (input: AuditEntryInput) => Promise<AuditWriteResult>;
  now: () => Date;
};

function canWrite(actor: CatalogueActor): boolean {
  return hasAdminAccess(actor.roleKeys.map((key) => ({ key })), ["founder", "editor"]);
}

function err<T>(status: number, code: string, message: string, issues?: unknown): ServiceResult<T> {
  return { ok: false, status, code, message, ...(issues === undefined ? {} : { issues }) };
}

const nn = (value: string | null | undefined): string | null => {
  const t = (value ?? "").trim();
  return t === "" ? null : t;
};

// --- Reads (any admin) -------------------------------------------------------
export async function listCatalogue(deps: CatalogueServiceDeps): Promise<ServiceResult<TierWithUtilities[]>> {
  const items = await deps.repo.listTiersWithUtilities();
  return { ok: true, status: 200, data: items };
}

export async function getTier(deps: CatalogueServiceDeps, id: string): Promise<ServiceResult<TierRecord>> {
  const record = await deps.repo.findTierById(id);
  if (!record) return err(404, "NOT_FOUND", "Tier not found.");
  return { ok: true, status: 200, data: record };
}

export async function getUtility(deps: CatalogueServiceDeps, id: string): Promise<ServiceResult<UtilityRecord>> {
  const record = await deps.repo.findUtilityById(id);
  if (!record) return err(404, "NOT_FOUND", "Utility not found.");
  return { ok: true, status: 200, data: record };
}

// --- Tier writes (founder/editor) -------------------------------------------
export async function createTier(deps: CatalogueServiceDeps, actor: CatalogueActor, input: unknown): Promise<ServiceResult<TierRecord>> {
  if (!canWrite(actor)) return err(403, "FORBIDDEN", "You do not have write access to the consultation catalogue.");
  const parsed = createTierSchema.safeParse(input);
  if (!parsed.success) return err(422, "VALIDATION_ERROR", "Invalid tier payload.", parsed.error.issues);
  const data = parsed.data;

  if (await deps.repo.findTierBySlug(data.slug)) return err(409, "SLUG_TAKEN", "A tier with this slug already exists.");

  const created = await deps.repo.createTier({
    slug: data.slug,
    name: data.name,
    shortDescription: nn(data.shortDescription),
    detailedScope: nn(data.detailedScope),
    bestFor: nn(data.bestFor),
    isActive: data.isActive,
    availabilityStatus: data.availabilityStatus,
    sortOrder: data.sortOrder,
    createdById: actor.userId,
  });
  await audit(deps, actor, "tier", created.id, "consultation.tier.create", `Created tier ${created.slug}`, { slug: created.slug });
  return { ok: true, status: 201, data: created };
}

export async function updateTier(deps: CatalogueServiceDeps, actor: CatalogueActor, id: string, input: unknown): Promise<ServiceResult<TierRecord>> {
  if (!canWrite(actor)) return err(403, "FORBIDDEN", "You do not have write access to the consultation catalogue.");
  const current = await deps.repo.findTierById(id);
  if (!current) return err(404, "NOT_FOUND", "Tier not found.");
  const parsed = updateTierSchema.safeParse(input);
  if (!parsed.success) return err(422, "VALIDATION_ERROR", "Invalid tier payload.", parsed.error.issues);
  const d = parsed.data;

  const updated = await deps.repo.updateTier(id, {
    ...(d.name !== undefined ? { name: d.name } : {}),
    ...(d.shortDescription !== undefined ? { shortDescription: nn(d.shortDescription) } : {}),
    ...(d.detailedScope !== undefined ? { detailedScope: nn(d.detailedScope) } : {}),
    ...(d.bestFor !== undefined ? { bestFor: nn(d.bestFor) } : {}),
    ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
    ...(d.availabilityStatus !== undefined ? { availabilityStatus: d.availabilityStatus } : {}),
    ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
  });
  await audit(deps, actor, "tier", id, "consultation.tier.update", `Updated tier ${updated.slug}`, { slug: updated.slug });
  return { ok: true, status: 200, data: updated };
}

export async function deleteTier(deps: CatalogueServiceDeps, actor: CatalogueActor, id: string, confirmed: boolean): Promise<ServiceResult<{ id: string }>> {
  if (!canWrite(actor)) return err(403, "FORBIDDEN", "You do not have write access to the consultation catalogue.");
  if (!confirmed) return err(400, "CONFIRMATION_REQUIRED", "Permanent deletion requires explicit confirmation.");
  const current = await deps.repo.findTierById(id);
  if (!current) return err(404, "NOT_FOUND", "Tier not found.");
  const utilityCount = await deps.repo.countUtilitiesForTier(id);
  if (utilityCount > 0) return err(409, "TIER_NOT_EMPTY", "Move or delete this tier's utilities before deleting the tier.");
  await deps.repo.removeTier(id);
  await audit(deps, actor, "tier", id, "consultation.tier.delete", `Deleted tier ${current.slug}`, { slug: current.slug });
  return { ok: true, status: 200, data: { id } };
}

// --- Utility writes (founder/editor) ----------------------------------------
export async function createUtility(deps: CatalogueServiceDeps, actor: CatalogueActor, input: unknown): Promise<ServiceResult<UtilityRecord>> {
  if (!canWrite(actor)) return err(403, "FORBIDDEN", "You do not have write access to the consultation catalogue.");
  const parsed = createUtilitySchema.safeParse(input);
  if (!parsed.success) return err(422, "VALIDATION_ERROR", "Invalid utility payload.", parsed.error.issues);
  const data = parsed.data;

  const tier = await deps.repo.findTierBySlug(data.tierSlug);
  if (!tier) return err(422, "TIER_NOT_FOUND", "The parent tier does not exist.");
  if (await deps.repo.findUtilityBySlug(data.slug)) return err(409, "SLUG_TAKEN", "A utility with this slug already exists.");

  const created = await deps.repo.createUtility({
    slug: data.slug,
    tierId: tier.id,
    name: data.name,
    shortDescription: nn(data.shortDescription),
    detailedScope: nn(data.detailedScope),
    bestFor: nn(data.bestFor),
    includedItems: data.includedItems,
    excludedItems: data.excludedItems,
    responseDescription: nn(data.responseDescription),
    priceType: data.priceType,
    currency: data.currency,
    launchPrice: data.launchPrice ?? null,
    regularPrice: data.regularPrice ?? null,
    priceLabel: nn(data.priceLabel),
    requiresScopeReview: data.requiresScopeReview,
    travelExcluded: data.travelExcluded,
    isPriority: data.isPriority,
    isActive: data.isActive,
    availabilityStatus: data.availabilityStatus,
    sortOrder: data.sortOrder,
    createdById: actor.userId,
  });
  await audit(deps, actor, "utility", created.id, "consultation.utility.create", `Created utility ${created.slug}`, { slug: created.slug, tier: tier.slug });
  return { ok: true, status: 201, data: created };
}

export async function updateUtility(deps: CatalogueServiceDeps, actor: CatalogueActor, id: string, input: unknown): Promise<ServiceResult<UtilityRecord>> {
  if (!canWrite(actor)) return err(403, "FORBIDDEN", "You do not have write access to the consultation catalogue.");
  const current = await deps.repo.findUtilityById(id);
  if (!current) return err(404, "NOT_FOUND", "Utility not found.");
  const parsed = updateUtilitySchema.safeParse(input);
  if (!parsed.success) return err(422, "VALIDATION_ERROR", "Invalid utility payload.", parsed.error.issues);
  const d = parsed.data;

  let tierId: string | undefined;
  if (d.tierSlug !== undefined) {
    const tier = await deps.repo.findTierBySlug(d.tierSlug);
    if (!tier) return err(422, "TIER_NOT_FOUND", "The parent tier does not exist.");
    tierId = tier.id;
  }

  const updated = await deps.repo.updateUtility(id, {
    ...(tierId !== undefined ? { tierId } : {}),
    ...(d.name !== undefined ? { name: d.name } : {}),
    ...(d.shortDescription !== undefined ? { shortDescription: nn(d.shortDescription) } : {}),
    ...(d.detailedScope !== undefined ? { detailedScope: nn(d.detailedScope) } : {}),
    ...(d.bestFor !== undefined ? { bestFor: nn(d.bestFor) } : {}),
    ...(d.includedItems !== undefined ? { includedItems: d.includedItems } : {}),
    ...(d.excludedItems !== undefined ? { excludedItems: d.excludedItems } : {}),
    ...(d.responseDescription !== undefined ? { responseDescription: nn(d.responseDescription) } : {}),
    ...(d.priceType !== undefined ? { priceType: d.priceType } : {}),
    ...(d.currency !== undefined ? { currency: d.currency } : {}),
    ...(d.launchPrice !== undefined ? { launchPrice: d.launchPrice ?? null } : {}),
    ...(d.regularPrice !== undefined ? { regularPrice: d.regularPrice ?? null } : {}),
    ...(d.priceLabel !== undefined ? { priceLabel: nn(d.priceLabel) } : {}),
    ...(d.requiresScopeReview !== undefined ? { requiresScopeReview: d.requiresScopeReview } : {}),
    ...(d.travelExcluded !== undefined ? { travelExcluded: d.travelExcluded } : {}),
    ...(d.isPriority !== undefined ? { isPriority: d.isPriority } : {}),
    ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
    ...(d.availabilityStatus !== undefined ? { availabilityStatus: d.availabilityStatus } : {}),
    ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
  });
  await audit(deps, actor, "utility", id, "consultation.utility.update", `Updated utility ${updated.slug}`, { slug: updated.slug });
  return { ok: true, status: 200, data: updated };
}

export async function deleteUtility(deps: CatalogueServiceDeps, actor: CatalogueActor, id: string, confirmed: boolean): Promise<ServiceResult<{ id: string }>> {
  if (!canWrite(actor)) return err(403, "FORBIDDEN", "You do not have write access to the consultation catalogue.");
  if (!confirmed) return err(400, "CONFIRMATION_REQUIRED", "Permanent deletion requires explicit confirmation.");
  const current = await deps.repo.findUtilityById(id);
  if (!current) return err(404, "NOT_FOUND", "Utility not found.");
  await deps.repo.removeUtility(id); // modes cascade at the DB layer
  await audit(deps, actor, "utility", id, "consultation.utility.delete", `Deleted utility ${current.slug}`, { slug: current.slug });
  return { ok: true, status: 200, data: { id } };
}

// --- Mode writes (founder/editor) -------------------------------------------
export async function createMode(deps: CatalogueServiceDeps, actor: CatalogueActor, utilityId: string, input: unknown): Promise<ServiceResult<ModeRecord>> {
  if (!canWrite(actor)) return err(403, "FORBIDDEN", "You do not have write access to the consultation catalogue.");
  const utility = await deps.repo.findUtilityById(utilityId);
  if (!utility) return err(404, "NOT_FOUND", "Utility not found.");
  const parsed = createModeSchema.safeParse(input);
  if (!parsed.success) return err(422, "VALIDATION_ERROR", "Invalid mode payload.", parsed.error.issues);
  const data = parsed.data;
  if (utility.modes.some((mode) => mode.slug === data.slug)) return err(409, "SLUG_TAKEN", "A mode with this slug already exists on this utility.");

  const created = await deps.repo.createMode({
    utilityId,
    slug: data.slug,
    name: data.name,
    shortDescription: nn(data.shortDescription),
    priceType: data.priceType,
    currency: data.currency,
    launchPrice: data.launchPrice ?? null,
    regularPrice: data.regularPrice ?? null,
    priceLabel: nn(data.priceLabel),
    travelExcluded: data.travelExcluded,
    isActive: data.isActive,
    sortOrder: data.sortOrder,
  });
  // A utility with any mode is mode-priced; keep the derived flag in sync.
  await deps.repo.updateUtility(utilityId, { hasModes: true });
  await audit(deps, actor, "mode", created.id, "consultation.mode.create", `Added mode ${created.slug} to ${utility.slug}`, { utility: utility.slug, slug: created.slug });
  return { ok: true, status: 201, data: created };
}

export async function updateMode(deps: CatalogueServiceDeps, actor: CatalogueActor, id: string, input: unknown): Promise<ServiceResult<ModeRecord>> {
  if (!canWrite(actor)) return err(403, "FORBIDDEN", "You do not have write access to the consultation catalogue.");
  const current = await deps.repo.findModeById(id);
  if (!current) return err(404, "NOT_FOUND", "Mode not found.");
  const parsed = updateModeSchema.safeParse(input);
  if (!parsed.success) return err(422, "VALIDATION_ERROR", "Invalid mode payload.", parsed.error.issues);
  const d = parsed.data;

  const updated = await deps.repo.updateMode(id, {
    ...(d.name !== undefined ? { name: d.name } : {}),
    ...(d.shortDescription !== undefined ? { shortDescription: nn(d.shortDescription) } : {}),
    ...(d.priceType !== undefined ? { priceType: d.priceType } : {}),
    ...(d.currency !== undefined ? { currency: d.currency } : {}),
    ...(d.launchPrice !== undefined ? { launchPrice: d.launchPrice ?? null } : {}),
    ...(d.regularPrice !== undefined ? { regularPrice: d.regularPrice ?? null } : {}),
    ...(d.priceLabel !== undefined ? { priceLabel: nn(d.priceLabel) } : {}),
    ...(d.travelExcluded !== undefined ? { travelExcluded: d.travelExcluded } : {}),
    ...(d.isActive !== undefined ? { isActive: d.isActive } : {}),
    ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
  });
  await audit(deps, actor, "mode", id, "consultation.mode.update", `Updated mode ${updated.slug}`, { slug: updated.slug });
  return { ok: true, status: 200, data: updated };
}

export async function deleteMode(deps: CatalogueServiceDeps, actor: CatalogueActor, id: string, confirmed: boolean): Promise<ServiceResult<{ id: string }>> {
  if (!canWrite(actor)) return err(403, "FORBIDDEN", "You do not have write access to the consultation catalogue.");
  if (!confirmed) return err(400, "CONFIRMATION_REQUIRED", "Permanent deletion requires explicit confirmation.");
  const current = await deps.repo.findModeById(id);
  if (!current) return err(404, "NOT_FOUND", "Mode not found.");
  await deps.repo.removeMode(id);
  const utility = await deps.repo.findUtilityById(current.utilityId);
  if (utility) await deps.repo.updateUtility(utility.id, { hasModes: utility.modes.length > 0 });
  await audit(deps, actor, "mode", id, "consultation.mode.delete", `Deleted mode ${current.slug}`, { slug: current.slug });
  return { ok: true, status: 200, data: { id } };
}

// --- Publication transitions (founder/editor) -------------------------------
// Publication is the ONLY way content becomes public. It is an explicit action, separate from
// every ordinary edit, so incomplete edits stay private until a deliberate publish.
function resolvePublicationTarget(action: PublicationAction): ConsultationPublicationState {
  switch (action) {
    case "PUBLISH":
      return "PUBLISHED";
    case "UNPUBLISH":
      return "DRAFT";
    case "ARCHIVE":
      return "ARCHIVED";
  }
}

export async function transitionTier(deps: CatalogueServiceDeps, actor: CatalogueActor, id: string, action: PublicationAction): Promise<ServiceResult<TierRecord>> {
  if (!canWrite(actor)) return err(403, "FORBIDDEN", "You do not have write access to the consultation catalogue.");
  const current = await deps.repo.findTierById(id);
  if (!current) return err(404, "NOT_FOUND", "Tier not found.");
  const to = resolvePublicationTarget(action);
  if (to === "PUBLISHED") {
    const issues = tierPublishableIssues(current);
    if (issues.length > 0) return err(422, "INCOMPLETE_DRAFT", "This tier is missing required fields and cannot be published.", issues);
  }
  const updated = await deps.repo.updateTier(id, { publicationState: to, publishedAt: to === "PUBLISHED" ? deps.now() : current.publishedAt });
  await audit(deps, actor, "tier", id, `consultation.tier.${action.toLowerCase()}`, `Tier ${updated.slug} → ${to}`, { from: current.publicationState, to });
  return { ok: true, status: 200, data: updated };
}

export async function transitionUtility(deps: CatalogueServiceDeps, actor: CatalogueActor, id: string, action: PublicationAction): Promise<ServiceResult<UtilityRecord>> {
  if (!canWrite(actor)) return err(403, "FORBIDDEN", "You do not have write access to the consultation catalogue.");
  const current = await deps.repo.findUtilityById(id);
  if (!current) return err(404, "NOT_FOUND", "Utility not found.");
  const to = resolvePublicationTarget(action);
  if (to === "PUBLISHED") {
    const issues = utilityPublishableIssues({
      name: current.name,
      shortDescription: current.shortDescription,
      priceType: current.priceType,
      launchPrice: current.launchPrice,
      priceLabel: current.priceLabel,
      requiresScopeReview: current.requiresScopeReview,
      hasModes: current.hasModes,
      activeModeCount: current.modes.filter((mode) => mode.isActive).length,
    });
    if (issues.length > 0) return err(422, "INCOMPLETE_DRAFT", "This utility is missing required fields and cannot be published.", issues);
  }
  const updated = await deps.repo.updateUtility(id, { publicationState: to, publishedAt: to === "PUBLISHED" ? deps.now() : current.publishedAt });
  await audit(deps, actor, "utility", id, `consultation.utility.${action.toLowerCase()}`, `Utility ${updated.slug} → ${to}`, { from: current.publicationState, to });
  return { ok: true, status: 200, data: updated };
}

// --- shared audit helper -----------------------------------------------------
async function audit(
  deps: CatalogueServiceDeps,
  actor: CatalogueActor,
  entity: "tier" | "utility" | "mode",
  entityId: string,
  action: string,
  summary: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  await deps.audit({
    actorUserId: actor.userId,
    actorRoleKey: actor.primaryRoleKey,
    entityType: `consultation_${entity}`,
    entityId,
    action,
    summary,
    metadata,
  });
}
