// Claude C10A — Consultation catalogue seed/import tooling (pure; DI: CatalogueRepository).
//
// Turns the canonical blueprint (exactly 4 tiers, 18 utilities, Residential Vastu's two modes)
// into an IDEMPOTENT create-or-update plan keyed by slug. `apply` with { dryRun: true } computes
// the actions without writing; a real apply is create-if-missing / update-if-present, so running
// it twice performs no second create. Everything is seeded as a DRAFT with only the approved
// structure/prices/flags — descriptions are left blank so nothing unapproved is ever published.
//
// NOTE: this tooling is DEFINED but NOT executed in the C10A phase.
import {
  createTierSchema,
  createUtilitySchema,
  createModeSchema,
} from "@/modules/admin/consultation-catalogue/domain";
import {
  CONSULTATION_CATALOGUE_BLUEPRINT,
  EXPECTED_TIER_COUNT,
  EXPECTED_UTILITY_COUNT,
  type BlueprintTier,
  type BlueprintUtility,
  type BlueprintMode,
} from "@/modules/admin/consultation-catalogue/catalogue-blueprint";
import type {
  CatalogueRepository,
  TierCreateData,
  UtilityCreateData,
  ModeCreateData,
} from "@/modules/admin/consultation-catalogue/repository";

export type PlannedTier = TierCreateData;
export type PlannedUtility = Omit<UtilityCreateData, "tierId"> & { tierSlug: string };
export type PlannedMode = Omit<ModeCreateData, "utilityId"> & { utilitySlug: string };

export type CatalogueImportPlan = {
  tiers: PlannedTier[];
  utilities: PlannedUtility[];
  modes: PlannedMode[];
  notes: string[];
};

function tierDocument(tier: BlueprintTier, sortOrder: number): PlannedTier {
  const doc: TierCreateData = {
    slug: tier.slug,
    name: tier.name,
    shortDescription: null,
    detailedScope: null,
    bestFor: null,
    isActive: true,
    availabilityStatus: "AVAILABLE",
    sortOrder,
    createdById: null,
  };
  // Validate the approved fields against the domain schema (blank content stays null).
  createTierSchema.parse({ slug: doc.slug, name: doc.name, sortOrder });
  return doc;
}

function utilityDocument(tierSlug: string, utility: BlueprintUtility, sortOrder: number): PlannedUtility {
  const doc: PlannedUtility = {
    slug: utility.slug,
    tierSlug,
    name: utility.name,
    shortDescription: null,
    detailedScope: null,
    bestFor: null,
    includedItems: [],
    excludedItems: [],
    responseDescription: null,
    priceType: utility.priceType,
    currency: "INR",
    launchPrice: utility.launchPrice,
    regularPrice: null, // never invented
    priceLabel: utility.priceLabel ?? null,
    requiresScopeReview: Boolean(utility.requiresScopeReview),
    travelExcluded: Boolean(utility.travelExcluded),
    isPriority: Boolean(utility.isPriority),
    isActive: true,
    availabilityStatus: "AVAILABLE",
    sortOrder,
    createdById: null,
  };
  createUtilitySchema.parse({
    slug: doc.slug,
    tierSlug,
    name: doc.name,
    priceType: doc.priceType,
    launchPrice: doc.launchPrice ?? undefined,
    priceLabel: doc.priceLabel ?? undefined,
    requiresScopeReview: doc.requiresScopeReview,
    sortOrder,
  });
  return doc;
}

function modeDocument(utilitySlug: string, mode: BlueprintMode, sortOrder: number): PlannedMode {
  const doc: PlannedMode = {
    utilitySlug,
    slug: mode.slug,
    name: mode.name,
    shortDescription: null,
    priceType: mode.priceType,
    currency: "INR",
    launchPrice: mode.launchPrice,
    regularPrice: null,
    priceLabel: null,
    travelExcluded: Boolean(mode.travelExcluded),
    isActive: true,
    sortOrder,
  };
  createModeSchema.parse({ slug: doc.slug, name: doc.name, priceType: doc.priceType, launchPrice: doc.launchPrice ?? undefined, sortOrder });
  return doc;
}

/** Build the deterministic, schema-valid import plan from the canonical blueprint. */
export function buildCatalogueImportPlan(): CatalogueImportPlan {
  const tiers: PlannedTier[] = [];
  const utilities: PlannedUtility[] = [];
  const modes: PlannedMode[] = [];

  CONSULTATION_CATALOGUE_BLUEPRINT.forEach((tier, tierIndex) => {
    tiers.push(tierDocument(tier, tierIndex));
    tier.utilities.forEach((utility, utilityIndex) => {
      utilities.push(utilityDocument(tier.slug, utility, utilityIndex));
      (utility.modes ?? []).forEach((mode, modeIndex) => {
        modes.push(modeDocument(utility.slug, mode, modeIndex));
      });
    });
  });

  const notes = [
    `Exactly ${EXPECTED_TIER_COUNT} tiers and ${EXPECTED_UTILITY_COUNT} utilities (assert: ${tiers.length}/${utilities.length}).`,
    "Everything is seeded as a DRAFT (publicationState defaults to DRAFT) — nothing is published.",
    "Only approved fields are set: names, launch prices, price types, priority/scope-review/travel flags, and modes.",
    "Descriptions / included / excluded / best-for / delivery copy are intentionally blank — never invented.",
    "regularPrice is null for every entry until an editor approves one.",
    "Residential Vastu carries two modes (remote / on-site); on-site is travel-excluded.",
    "Commercial Vastu is priceType=FROM with launchPrice 4999 and requiresScopeReview=true.",
    "Apply is idempotent (create-if-missing / update-by-slug). NOT executed in the C10A phase.",
  ];

  return { tiers, utilities, modes, notes };
}

export type ApplyAction = "create" | "update";
export type ApplyEntry = { slug: string; action: ApplyAction };
export type CatalogueApplyResult = {
  dryRun: boolean;
  tiers: ApplyEntry[];
  utilities: ApplyEntry[];
  modes: ApplyEntry[];
  created: number;
  updated: number;
};

/**
 * Apply the plan idempotently through the repository. With { dryRun: true } nothing is written;
 * the returned actions still reflect what WOULD happen (create vs update), so a caller can
 * preview. A real apply is create-if-missing / update-if-present keyed by slug, so re-running
 * yields only "update" actions and never a duplicate.
 *
 * This function is provided for a later card; it is NOT called during C10A.
 */
export async function applyCatalogueImportPlan(
  repo: CatalogueRepository,
  plan: CatalogueImportPlan,
  options: { dryRun: boolean } = { dryRun: true },
): Promise<CatalogueApplyResult> {
  const result: CatalogueApplyResult = { dryRun: options.dryRun, tiers: [], utilities: [], modes: [], created: 0, updated: 0 };

  for (const tier of plan.tiers) {
    const existing = await repo.findTierBySlug(tier.slug);
    const action: ApplyAction = existing ? "update" : "create";
    result.tiers.push({ slug: tier.slug, action });
    if (!options.dryRun) {
      if (existing) {
        await repo.updateTier(existing.id, {
          name: tier.name,
          isActive: tier.isActive,
          availabilityStatus: tier.availabilityStatus,
          sortOrder: tier.sortOrder,
        });
      } else {
        await repo.createTier(tier);
      }
    }
    if (action === "create") result.created += 1;
    else result.updated += 1;
  }

  for (const utility of plan.utilities) {
    const existing = await repo.findUtilityBySlug(utility.slug);
    const action: ApplyAction = existing ? "update" : "create";
    result.utilities.push({ slug: utility.slug, action });
    if (!options.dryRun) {
      const tier = await repo.findTierBySlug(utility.tierSlug);
      if (!tier) throw new Error(`Import: parent tier ${utility.tierSlug} missing for utility ${utility.slug}`);
      const hasModes = plan.modes.some((mode) => mode.utilitySlug === utility.slug);
      const { tierSlug: _tierSlug, ...rest } = utility;
      void _tierSlug;
      if (existing) {
        await repo.updateUtility(existing.id, { ...rest, hasModes });
      } else {
        await repo.createUtility({ ...rest, tierId: tier.id });
        if (hasModes) {
          const created = await repo.findUtilityBySlug(utility.slug);
          if (created) await repo.updateUtility(created.id, { hasModes: true });
        }
      }
    }
    if (action === "create") result.created += 1;
    else result.updated += 1;
  }

  for (const mode of plan.modes) {
    const utility = await repo.findUtilityBySlug(mode.utilitySlug);
    const existing = utility?.modes.find((candidate) => candidate.slug === mode.slug) ?? null;
    const action: ApplyAction = existing ? "update" : "create";
    result.modes.push({ slug: `${mode.utilitySlug}/${mode.slug}`, action });
    if (!options.dryRun && utility) {
      const { utilitySlug: _utilitySlug, ...rest } = mode;
      void _utilitySlug;
      if (existing) {
        await repo.updateMode(existing.id, rest);
      } else {
        await repo.createMode({ ...rest, utilityId: utility.id });
      }
    }
    if (action === "create") result.created += 1;
    else result.updated += 1;
  }

  return result;
}
