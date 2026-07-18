/**
 * Claude C10A — DRY-RUN import plan for the Consultation catalogue.
 *
 * Prints the exact tiers / utilities / modes the idempotent seed WOULD create (all DRAFT, with
 * only the approved structure/prices/flags). Deterministic; performs NO database access and NO
 * writes. Nothing is seeded here — execution belongs to a later card.
 *
 * Run:  npx tsx scripts/debug-consultation-catalogue-import-plan.ts          (human summary)
 *       npx tsx scripts/debug-consultation-catalogue-import-plan.ts --json   (machine-readable)
 */
import {
  buildCatalogueImportPlan,
  applyCatalogueImportPlan,
} from "@/modules/admin/consultation-catalogue/import-plan";
import {
  EXPECTED_TIER_COUNT,
  EXPECTED_UTILITY_COUNT,
} from "@/modules/admin/consultation-catalogue/catalogue-blueprint";
import type { CatalogueRepository } from "@/modules/admin/consultation-catalogue/repository";

/** An empty in-memory repo → every planned action is "create" (fresh install preview). */
function emptyRepo(): CatalogueRepository {
  const notFound = async () => null;
  return {
    listTiersWithUtilities: async () => [],
    findTierById: notFound,
    findTierBySlug: notFound,
    createTier: async () => { throw new Error("dry-run: no writes"); },
    updateTier: async () => { throw new Error("dry-run: no writes"); },
    removeTier: async () => {},
    countUtilitiesForTier: async () => 0,
    findUtilityById: notFound,
    findUtilityBySlug: notFound,
    createUtility: async () => { throw new Error("dry-run: no writes"); },
    updateUtility: async () => { throw new Error("dry-run: no writes"); },
    removeUtility: async () => {},
    findModeById: notFound,
    createMode: async () => { throw new Error("dry-run: no writes"); },
    updateMode: async () => { throw new Error("dry-run: no writes"); },
    removeMode: async () => {},
    listPublishedCatalogue: async () => [],
  };
}

async function main() {
  const plan = buildCatalogueImportPlan();
  const preview = await applyCatalogueImportPlan(emptyRepo(), plan, { dryRun: true });

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ plan, preview }, null, 2));
    return;
  }

  console.log("Claude C10A — Consultation catalogue DRY-RUN import plan");
  console.log("(no database access, no writes; nothing is seeded or published)\n");

  console.log(`Tiers (${plan.tiers.length}):`);
  for (const tier of plan.tiers) console.log(`  - ${tier.slug.padEnd(28)} ${tier.name}`);

  console.log(`\nUtilities (${plan.utilities.length}):`);
  for (const utility of plan.utilities) {
    const price = utility.launchPrice != null ? `₹${utility.launchPrice}` : utility.priceLabel ?? "(mode-priced)";
    const flags = [
      utility.isPriority ? "priority" : "",
      utility.requiresScopeReview ? "scope-review" : "",
      utility.travelExcluded ? "travel-excluded" : "",
    ].filter(Boolean).join(",");
    console.log(`  - ${utility.slug.padEnd(38)} ${utility.priceType.padEnd(5)} ${String(price).padEnd(14)} ${flags}`);
  }

  console.log(`\nModes (${plan.modes.length}):`);
  for (const mode of plan.modes) {
    console.log(`  - ${(`${mode.utilitySlug}/${mode.slug}`).padEnd(30)} ₹${mode.launchPrice}${mode.travelExcluded ? " (travel excluded)" : ""}`);
  }

  console.log("\nNotes:");
  for (const note of plan.notes) console.log(`  * ${note}`);

  const tiersOk = plan.tiers.length === EXPECTED_TIER_COUNT;
  const utilsOk = plan.utilities.length === EXPECTED_UTILITY_COUNT;
  console.log("\nPlan summary:");
  console.log(`  tiers = ${plan.tiers.length} (${tiersOk ? "OK" : "MISMATCH"}), utilities = ${plan.utilities.length} (${utilsOk ? "OK" : "MISMATCH"}), modes = ${plan.modes.length}`);
  console.log(`  dry-run actions: ${preview.created} create, ${preview.updated} update (fresh install → all create)`);
  console.log("\nDRY RUN ONLY — nothing was written. Execution belongs to a later card.");
  if (!tiersOk || !utilsOk) process.exit(1);
}

void main();
