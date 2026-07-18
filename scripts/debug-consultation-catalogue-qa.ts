/**
 * Claude C10A — Consultation catalogue service/domain QA (pure; in-memory repo, no DB).
 * Covers: domain validation, founder/editor authorization, the draft→publish gate,
 * the exact 4-tier/18-utility fixture, Residential Vastu modes, pricing + scope-review
 * semantics, English-only content, and idempotent seed apply.
 */
import {
  listCatalogue,
  createTier,
  updateTier,
  deleteTier,
  transitionTier,
  createUtility,
  updateUtility,
  transitionUtility,
  createMode,
  deleteMode,
  type CatalogueServiceDeps,
} from "@/modules/admin/consultation-catalogue/service-core";
import type { CatalogueRepository } from "@/modules/admin/consultation-catalogue/repository";
import type { CatalogueActor, ModeRecord, TierRecord, UtilityRecord } from "@/modules/admin/consultation-catalogue/types";
import { utilityPublishableIssues, tierPublishableIssues } from "@/modules/admin/consultation-catalogue/domain";
import {
  CONSULTATION_CATALOGUE_BLUEPRINT,
  TIER_SLUGS,
  UTILITY_SLUGS,
  PRIORITY_UTILITY_SLUGS,
  EXPECTED_TIER_COUNT,
  EXPECTED_UTILITY_COUNT,
} from "@/modules/admin/consultation-catalogue/catalogue-blueprint";
import { buildCatalogueImportPlan, applyCatalogueImportPlan } from "@/modules/admin/consultation-catalogue/import-plan";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const founder: CatalogueActor = { userId: "u-f", roleKeys: ["founder"], primaryRoleKey: "founder" };
const editor: CatalogueActor = { userId: "u-e", roleKeys: ["editor"], primaryRoleKey: "editor" };
const support: CatalogueActor = { userId: "u-s", roleKeys: ["support"], primaryRoleKey: "support" };

// --- In-memory CatalogueRepository ------------------------------------------
function makeRepo(): CatalogueRepository {
  const tiers = new Map<string, TierRecord>();
  const utilities = new Map<string, Omit<UtilityRecord, "modes">>();
  const modes = new Map<string, ModeRecord>();
  let seq = 0;
  const id = (p: string) => `${p}_${++seq}`;

  const withModes = (u: Omit<UtilityRecord, "modes">): UtilityRecord => ({
    ...u,
    modes: [...modes.values()].filter((m) => m.utilityId === u.id).sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug)),
  });

  return {
    async listTiersWithUtilities() {
      return [...tiers.values()]
        .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug))
        .map((t) => ({ ...t, utilities: [...utilities.values()].filter((u) => u.tierId === t.id).map(withModes) }));
    },
    async findTierById(tid) { return tiers.get(tid) ?? null; },
    async findTierBySlug(slug) { return [...tiers.values()].find((t) => t.slug === slug) ?? null; },
    async createTier(data) {
      const now = new Date();
      const rec: TierRecord = { id: id("tier"), publicationState: "DRAFT", publishedAt: null, createdAt: now, updatedAt: now, ...data };
      tiers.set(rec.id, rec);
      return rec;
    },
    async updateTier(tid, data) {
      const cur = tiers.get(tid); if (!cur) throw new Error("tier missing");
      const next: TierRecord = { ...cur, ...data, updatedAt: new Date() };
      tiers.set(tid, next); return next;
    },
    async removeTier(tid) { tiers.delete(tid); },
    async countUtilitiesForTier(tid) { return [...utilities.values()].filter((u) => u.tierId === tid).length; },

    async findUtilityById(uid) { const u = utilities.get(uid); return u ? withModes(u) : null; },
    async findUtilityBySlug(slug) { const u = [...utilities.values()].find((x) => x.slug === slug); return u ? withModes(u) : null; },
    async createUtility(data) {
      const now = new Date();
      const rec: Omit<UtilityRecord, "modes"> = { id: id("util"), hasModes: false, publicationState: "DRAFT", publishedAt: null, createdAt: now, updatedAt: now, ...data };
      utilities.set(rec.id, rec);
      return withModes(rec);
    },
    async updateUtility(uid, data) {
      const cur = utilities.get(uid); if (!cur) throw new Error("utility missing");
      const next = { ...cur, ...data, updatedAt: new Date() };
      utilities.set(uid, next); return withModes(next);
    },
    async removeUtility(uid) {
      utilities.delete(uid);
      for (const [mid, m] of modes) if (m.utilityId === uid) modes.delete(mid);
    },

    async findModeById(mid) { return modes.get(mid) ?? null; },
    async createMode(data) {
      const now = new Date();
      const rec: ModeRecord = { id: id("mode"), createdAt: now, updatedAt: now, ...data };
      modes.set(rec.id, rec); return rec;
    },
    async updateMode(mid, data) {
      const cur = modes.get(mid); if (!cur) throw new Error("mode missing");
      const next: ModeRecord = { ...cur, ...data, updatedAt: new Date() };
      modes.set(mid, next); return next;
    },
    async removeMode(mid) { modes.delete(mid); },

    async listPublishedCatalogue() {
      return [...tiers.values()]
        .filter((t) => t.publicationState === "PUBLISHED" && t.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((t) => ({
          ...t,
          utilities: [...utilities.values()]
            .filter((u) => u.tierId === t.id && u.publicationState === "PUBLISHED" && u.isActive)
            .map((u) => ({ ...withModes(u), modes: withModes(u).modes.filter((m) => m.isActive) })),
        }));
    },
  };
}

function makeDeps(): { deps: CatalogueServiceDeps; audits: string[] } {
  const audits: string[] = [];
  const deps: CatalogueServiceDeps = {
    repo: makeRepo(),
    audit: async (input) => { audits.push(input.action); return { ok: true, id: `a${audits.length}` }; },
    now: () => new Date("2026-07-17T00:00:00.000Z"),
  };
  return { deps, audits };
}

type Group = { name: string; run: () => Promise<void> | void };
const groups: Group[] = [
  {
    name: "AUTH: founder/editor may write; support is rejected 403",
    run: async () => {
      const { deps } = makeDeps();
      const denied = await createTier(deps, support, { slug: "quick-insight", name: "Quick Insight" });
      assert(!denied.ok && denied.status === 403, "support create tier → 403");
      assert((await createTier(deps, editor, { slug: "quick-insight", name: "Quick Insight" })).ok, "editor create ok");
      assert((await createTier(deps, founder, { slug: "focused-guidance", name: "Focused Guidance" })).ok, "founder create ok");
      const list = await listCatalogue(deps);
      assert(list.ok && list.data.length === 2, "both tiers listed (any admin reads)");
    },
  },
  {
    name: "VALIDATION: slug shape, name required, price bounds",
    run: async () => {
      const { deps } = makeDeps();
      assert((await createTier(deps, founder, { slug: "Bad Slug", name: "x" })).status === 422, "bad slug rejected");
      assert((await createTier(deps, founder, { slug: "ok-slug", name: "" })).status === 422, "empty name rejected");
      await createTier(deps, founder, { slug: "premium-cases", name: "Premium Cases" });
      const badPrice = await createUtility(deps, founder, { slug: "x-util", tierSlug: "premium-cases", name: "X", launchPrice: -5 });
      assert(badPrice.status === 422, "negative price rejected");
      const missingTier = await createUtility(deps, founder, { slug: "y-util", tierSlug: "no-such-tier", name: "Y" });
      assert(missingTier.status === 422 && !missingTier.ok && missingTier.code === "TIER_NOT_FOUND", "utility needs an existing tier");
    },
  },
  {
    name: "SLUG uniqueness: duplicate tier/utility slug → 409",
    run: async () => {
      const { deps } = makeDeps();
      await createTier(deps, founder, { slug: "quick-insight", name: "Quick Insight" });
      assert((await createTier(deps, founder, { slug: "quick-insight", name: "Dup" })).status === 409, "dup tier slug → 409");
      await createUtility(deps, founder, { slug: "numerology-guidance", tierSlug: "quick-insight", name: "Numerology" });
      assert((await createUtility(deps, founder, { slug: "numerology-guidance", tierSlug: "quick-insight", name: "Dup" })).status === 409, "dup utility slug → 409");
    },
  },
  {
    name: "PUBLICATION GATE: incomplete draft cannot publish; complete can; saving stays draft",
    run: async () => {
      const { deps } = makeDeps();
      const tier = await createTier(deps, founder, { slug: "quick-insight", name: "Quick Insight" });
      assert(tier.ok, "tier created");
      if (!tier.ok) return;
      // A freshly created tier has no short description → cannot publish.
      const early = await transitionTier(deps, founder, tier.data.id, "PUBLISH");
      assert(!early.ok && early.status === 422 && early.code === "INCOMPLETE_DRAFT", "incomplete tier cannot publish");
      assert(tier.data.publicationState === "DRAFT", "creation leaves a DRAFT");
      // Add a short description → now publishable.
      await updateTier(deps, founder, tier.data.id, { shortDescription: "Fast, focused answers." });
      const published = await transitionTier(deps, founder, tier.data.id, "PUBLISH");
      assert(published.ok && published.data.publicationState === "PUBLISHED" && published.data.publishedAt != null, "publishes + stamps publishedAt");
      // Utility publish gate needs a pricing signal.
      const util = await createUtility(deps, founder, { slug: "complete-kundli-overview", tierSlug: "quick-insight", name: "Complete Kundli Overview" });
      assert(util.ok, "utility created");
      if (!util.ok) return;
      assert(!(await transitionUtility(deps, founder, util.data.id, "PUBLISH")).ok, "utility with no description/price cannot publish");
      await updateUtility(deps, founder, util.data.id, { shortDescription: "Whole-chart overview.", launchPrice: 299 });
      const upub = await transitionUtility(deps, founder, util.data.id, "PUBLISH");
      assert(upub.ok && upub.data.publicationState === "PUBLISHED", "priced+described utility publishes");
    },
  },
  {
    name: "RESIDENTIAL VASTU: one utility, two modes (remote/on-site), on-site travel-excluded",
    run: async () => {
      const { deps } = makeDeps();
      await createTier(deps, founder, { slug: "premium-cases", name: "Premium Cases" });
      const util = await createUtility(deps, founder, { slug: "residential-vastu", tierSlug: "premium-cases", name: "Residential Vastu", isPriority: true });
      assert(util.ok, "utility created");
      if (!util.ok) return;
      assert(util.data.hasModes === false, "no modes yet");
      const remote = await createMode(deps, founder, util.data.id, { slug: "remote", name: "Remote", launchPrice: 1999 });
      const onsite = await createMode(deps, founder, util.data.id, { slug: "on-site", name: "On-site", launchPrice: 2499, travelExcluded: true });
      assert(remote.ok && onsite.ok, "both modes created");
      assert((await createMode(deps, founder, util.data.id, { slug: "remote", name: "Dup", launchPrice: 1 })).status === 409, "duplicate mode slug rejected");
      const reread = await deps.repo.findUtilityById(util.data.id);
      assert(reread?.hasModes === true, "hasModes derived true once a mode exists");
      assert(reread?.modes.length === 2, "two modes");
      const on = reread!.modes.find((m) => m.slug === "on-site")!;
      assert(on.launchPrice === 2499 && on.travelExcluded === true, "on-site ₹2499, travel excluded");
      const rem = reread!.modes.find((m) => m.slug === "remote")!;
      assert(rem.launchPrice === 1999 && rem.travelExcluded === false, "remote ₹1999, travel included");
      // A mode-priced utility publishes on the strength of an active mode + description.
      await updateUtility(deps, founder, util.data.id, { shortDescription: "Home vastu assessment." });
      assert((await transitionUtility(deps, founder, util.data.id, "PUBLISH")).ok, "mode-priced utility publishes with an active mode");
      // Removing the last active mode flips hasModes back off.
      await deleteMode(deps, founder, remote.data.id, true);
      await deleteMode(deps, founder, onsite.data.id, true);
      assert((await deps.repo.findUtilityById(util.data.id))?.hasModes === false, "hasModes false after all modes removed");
    },
  },
  {
    name: "PRICING + SCOPE REVIEW: commercial vastu FROM ₹4999 requiresScopeReview; regular price null",
    run: async () => {
      const { deps } = makeDeps();
      await createTier(deps, founder, { slug: "premium-cases", name: "Premium Cases" });
      const util = await createUtility(deps, founder, {
        slug: "commercial-vastu-business-premises",
        tierSlug: "premium-cases",
        name: "Commercial Vastu",
        priceType: "FROM",
        launchPrice: 4999,
        priceLabel: "From ₹4,999",
        requiresScopeReview: true,
      });
      assert(util.ok, "utility created");
      if (!util.ok) return;
      assert(util.data.priceType === "FROM" && util.data.launchPrice === 4999, "FROM ₹4999");
      assert(util.data.requiresScopeReview === true, "requiresScopeReview true");
      assert(util.data.regularPrice === null, "regular price null (never invented)");
    },
  },
  {
    name: "DELETE: confirmation required; non-empty tier guarded",
    run: async () => {
      const { deps } = makeDeps();
      const tier = await createTier(deps, founder, { slug: "quick-insight", name: "Quick Insight" });
      assert(tier.ok, "tier"); if (!tier.ok) return;
      assert((await deleteTier(deps, founder, tier.data.id, false)).status === 400, "delete needs confirmation");
      await createUtility(deps, founder, { slug: "numerology-guidance", tierSlug: "quick-insight", name: "Numerology" });
      assert((await deleteTier(deps, founder, tier.data.id, true)).status === 409, "cannot delete a tier with utilities");
    },
  },
  {
    name: "ENGLISH-ONLY: no locale field exists on catalogue records",
    run: async () => {
      const { deps } = makeDeps();
      const tier = await createTier(deps, founder, { slug: "quick-insight", name: "Quick Insight" });
      assert(tier.ok, "tier"); if (!tier.ok) return;
      const util = await createUtility(deps, founder, { slug: "numerology-guidance", tierSlug: "quick-insight", name: "Numerology" });
      assert(util.ok, "util"); if (!util.ok) return;
      for (const key of Object.keys({ ...tier.data, ...util.data })) {
        assert(!/locale|language|lang$|_as$|_hi$/i.test(key), `no locale field on catalogue records (found ${key})`);
      }
    },
  },
  {
    name: "FIXTURE: exactly four tiers and eighteen utilities, six priority",
    run: () => {
      assert(TIER_SLUGS.length === EXPECTED_TIER_COUNT, `4 tiers (${TIER_SLUGS.length})`);
      assert(UTILITY_SLUGS.length === EXPECTED_UTILITY_COUNT, `18 utilities (${UTILITY_SLUGS.length})`);
      assert(new Set(UTILITY_SLUGS).size === 18, "utility slugs unique");
      const expectedTiers = ["quick-insight", "focused-guidance", "match-timing", "premium-cases"];
      assert(JSON.stringify(TIER_SLUGS) === JSON.stringify(expectedTiers), "exact tier slugs");
      const expectedPriority = ["complete-kundli-overview", "career-guidance", "marriage-guidance", "business-consultation", "kundli-milan", "residential-vastu"];
      assert(JSON.stringify([...PRIORITY_UTILITY_SLUGS].sort()) === JSON.stringify([...expectedPriority].sort()), "exact six priority utilities");
      // Spot-check approved launch prices.
      const flat = CONSULTATION_CATALOGUE_BLUEPRINT.flatMap((t) => t.utilities);
      const price = (slug: string) => flat.find((u) => u.slug === slug)?.launchPrice ?? null;
      assert(price("complete-kundli-overview") === 299 && price("varshaphal-yearly-forecast") === 1499, "launch prices");
      assert(price("comprehensive-multi-issue-consultation") === 2499, "comprehensive ₹2499");
      assert(price("residential-vastu") === null, "residential vastu has no single launch price (mode-priced)");
    },
  },
  {
    name: "IDEMPOTENT APPLY: first apply creates 24; second apply only updates (no duplicates)",
    run: async () => {
      const repo = makeRepo();
      const plan = buildCatalogueImportPlan();
      const first = await applyCatalogueImportPlan(repo, plan, { dryRun: false });
      assert(first.created === 24 && first.updated === 0, `first apply all-create (${first.created}/${first.updated})`);
      const tiers = await repo.listTiersWithUtilities();
      assert(tiers.length === 4, "4 tiers seeded");
      const utils = tiers.flatMap((t) => t.utilities);
      assert(utils.length === 18, "18 utilities seeded");
      assert(utils.every((u) => u.publicationState === "DRAFT"), "everything seeded as DRAFT (nothing published)");
      const residential = utils.find((u) => u.slug === "residential-vastu")!;
      assert(residential.hasModes === true && residential.modes.length === 2, "residential vastu has 2 modes");
      // Second apply is idempotent: no new rows, only updates.
      const second = await applyCatalogueImportPlan(repo, plan, { dryRun: false });
      assert(second.created === 0 && second.updated === 24, `second apply all-update (${second.created}/${second.updated})`);
      const after = await repo.listTiersWithUtilities();
      assert(after.length === 4 && after.flatMap((t) => t.utilities).length === 18, "still exactly 4/18 (no duplicates)");
    },
  },
  {
    name: "PUBLISH GATE UNITS: pure publishable-issue helpers",
    run: () => {
      assert(tierPublishableIssues({ name: "", shortDescription: null }).length === 2, "empty tier → 2 issues");
      assert(tierPublishableIssues({ name: "Quick", shortDescription: "desc" }).length === 0, "complete tier → 0 issues");
      const base = { name: "X", shortDescription: "d", priceType: "FIXED" as const, launchPrice: null, priceLabel: null, requiresScopeReview: false, hasModes: false, activeModeCount: 0 };
      assert(utilityPublishableIssues(base).length === 1, "no pricing signal → 1 issue");
      assert(utilityPublishableIssues({ ...base, launchPrice: 299 }).length === 0, "priced → publishable");
      assert(utilityPublishableIssues({ ...base, requiresScopeReview: true }).length === 0, "scope-review counts as a pricing signal");
      assert(utilityPublishableIssues({ ...base, hasModes: true, activeModeCount: 0 }).length === 1, "mode-priced with no active mode → 1 issue");
      assert(utilityPublishableIssues({ ...base, hasModes: true, activeModeCount: 1 }).length === 0, "mode-priced with an active mode → publishable");
    },
  },
];

async function main() {
  console.log("Claude C10A — Consultation catalogue service/domain QA (pure):");
  let passed = 0;
  let failed = 0;
  for (const group of groups) {
    try {
      await group.run();
      console.log(`  ✓ ${group.name}`);
      passed += 1;
    } catch (error) {
      console.log(`  ✗ ${group.name} -- ${error instanceof Error ? error.message : String(error)}`);
      failed += 1;
    }
  }
  console.log(`\nconsultation catalogue QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
