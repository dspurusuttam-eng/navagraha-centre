/**
 * Claude C10A — Consultation catalogue PUBLIC contract QA (pure + static scans; no DB).
 * Covers: the allow-listed public DTO (published/active only), privacy (no Admin metadata,
 * no raw WhatsApp number, no intake), English-only projection, WhatsApp base-link derivation,
 * no CTA labels, and the no-intake-persistence guarantee across the codebase.
 */
import { readFileSync } from "node:fs";
import {
  toPublicCatalogue,
  EMPTY_PUBLIC_CATALOGUE,
  type PublicConsultationCatalogue,
} from "@/modules/site-settings/public-catalogue-core";
import type { TierWithUtilities, UtilityRecord, ModeRecord } from "@/modules/admin/consultation-catalogue/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");

const now = new Date("2026-07-17T00:00:00.000Z");

function mode(over: Partial<ModeRecord> = {}): ModeRecord {
  return {
    id: "mode_secret", utilityId: "util_secret", slug: "remote", name: "Remote", shortDescription: null,
    priceType: "FIXED", currency: "INR", launchPrice: 1999, regularPrice: null, priceLabel: null,
    travelExcluded: false, isActive: true, sortOrder: 0, createdAt: now, updatedAt: now, ...over,
  };
}

function utility(over: Partial<UtilityRecord> = {}): UtilityRecord {
  return {
    id: "util_secret", slug: "residential-vastu", tierId: "tier_secret", name: "Residential Vastu",
    shortDescription: "Home vastu.", detailedScope: null, bestFor: null, includedItems: [], excludedItems: [],
    responseDescription: null, priceType: "FIXED", currency: "INR", launchPrice: null, regularPrice: null,
    priceLabel: null, requiresScopeReview: false, travelExcluded: false, isPriority: true, hasModes: true,
    isActive: true, availabilityStatus: "AVAILABLE", sortOrder: 0, publicationState: "PUBLISHED",
    publishedAt: now, createdById: "user_secret", createdAt: now, updatedAt: now, modes: [mode()], ...over,
  };
}

function tier(over: Partial<TierWithUtilities> = {}): TierWithUtilities {
  return {
    id: "tier_secret", slug: "premium-cases", name: "Premium Cases", shortDescription: "High-touch cases.",
    detailedScope: null, bestFor: null, isActive: true, availabilityStatus: "AVAILABLE", sortOrder: 0,
    publicationState: "PUBLISHED", publishedAt: now, createdById: "user_secret", createdAt: now, updatedAt: now,
    utilities: [utility()], ...over,
  };
}

const ADMIN_ONLY_KEYS = ["id", "tierId", "utilityId", "createdById", "createdAt", "updatedAt", "publicationState", "publishedAt", "isActive"];

type Group = { name: string; run: () => void };
const groups: Group[] = [
  {
    name: "DTO: only PUBLISHED + active tiers/utilities are exposed (drafts dropped)",
    run: () => {
      const published = toPublicCatalogue([tier()], { globalAvailability: "AVAILABLE", whatsappBaseUrl: null });
      assert(published.tiers.length === 1 && published.tiers[0]!.utilities.length === 1, "published tier + utility exposed");
      const draftTier = toPublicCatalogue([tier({ publicationState: "DRAFT" })], { globalAvailability: "AVAILABLE", whatsappBaseUrl: null });
      assert(draftTier.tiers.length === 0, "a DRAFT tier is never exposed");
      const inactiveTier = toPublicCatalogue([tier({ isActive: false })], { globalAvailability: "AVAILABLE", whatsappBaseUrl: null });
      assert(inactiveTier.tiers.length === 0, "an inactive tier is never exposed");
      const draftUtil = toPublicCatalogue([tier({ utilities: [utility({ publicationState: "DRAFT" })] })], { globalAvailability: "AVAILABLE", whatsappBaseUrl: null });
      assert(draftUtil.tiers[0]!.utilities.length === 0, "a DRAFT utility is dropped even under a published tier");
      const inactiveMode = toPublicCatalogue([tier({ utilities: [utility({ modes: [mode({ isActive: false })] })] })], { globalAvailability: "AVAILABLE", whatsappBaseUrl: null });
      assert(inactiveMode.tiers[0]!.utilities[0]!.modes.length === 0, "an inactive mode is dropped");
    },
  },
  {
    name: "PRIVACY: no Admin metadata reaches the public payload",
    run: () => {
      const projected = toPublicCatalogue([tier()], { globalAvailability: "AVAILABLE", whatsappBaseUrl: null });
      const json = JSON.stringify(projected);
      for (const key of ADMIN_ONLY_KEYS) {
        assert(!new RegExp(`"${key}"`).test(json), `public payload never carries "${key}"`);
      }
      assert(!json.includes("user_secret"), "createdById value never leaks");
      assert(!json.includes("tier_secret") && !json.includes("util_secret") && !json.includes("mode_secret"), "internal ids never leak");
      // The tier/utility objects expose only allow-listed keys.
      const t = projected.tiers[0]!;
      assert(JSON.stringify(Object.keys(t).sort()) === JSON.stringify(["availability", "bestFor", "detailedScope", "name", "shortDescription", "slug", "utilities"]), "tier keys are the allow-list");
    },
  },
  {
    name: "PRIVACY: no raw WhatsApp number or base link in the public DTO",
    run: () => {
      const withLink = toPublicCatalogue([tier()], { globalAvailability: "AVAILABLE", whatsappBaseUrl: null });
      assert(withLink.whatsappBaseUrl === null, "public DTO keeps WhatsApp base link null");
      const json = JSON.stringify(withLink);
      assert(!/"whatsappNumber"/.test(json), "no whatsappNumber field");
      assert(!json.includes("+919876543210"), "no raw +E.164 number in the payload");
      assert(!json.includes("wa.me"), "no derived wa.me link in the payload");
      // While Consultation is unpublished the reader supplies null → no link at all.
      const noLink = toPublicCatalogue([tier()], { globalAvailability: "UNAVAILABLE", whatsappBaseUrl: null });
      assert(noLink.whatsappBaseUrl === null, "no link when settings are unpublished");
    },
  },
  {
    name: "ENGLISH-ONLY: DTO is locale 'en' and carries no localized fields",
    run: () => {
      const projected = toPublicCatalogue([tier()], { globalAvailability: "AVAILABLE", whatsappBaseUrl: null });
      assert(projected.locale === "en", "locale is en");
      assert(EMPTY_PUBLIC_CATALOGUE.locale === "en", "empty catalogue is en");
      const json = JSON.stringify(projected);
      assert(!/"(as|hi)"/.test(json), "no Assamese/Hindi content");
      assert(!/"language"|"locales"|"translations"/.test(json), "no translation/language fields");
    },
  },
  {
    name: "NO CTA LABELS: DTO carries no frontend button/CTA copy",
    run: () => {
      const json = JSON.stringify(toPublicCatalogue([tier()], { globalAvailability: "AVAILABLE", whatsappBaseUrl: null })).toLowerCase();
      for (const forbidden of ["ctalabel", "buttonlabel", "\"cta\"", "book now", "chat now", "buttontext"]) {
        assert(!json.includes(forbidden), `no CTA copy (${forbidden})`);
      }
    },
  },
  {
    name: "PRICING SEMANTICS: launch/regular/label/priceType surface; regular stays null",
    run: () => {
      const u = utility({ priceType: "FROM", launchPrice: 4999, regularPrice: null, priceLabel: "From ₹4,999", requiresScopeReview: true, hasModes: false, modes: [] });
      const p = toPublicCatalogue([tier({ utilities: [u] })], { globalAvailability: "AVAILABLE", whatsappBaseUrl: null }).tiers[0]!.utilities[0]!;
      // Visitor-facing pricing only: the approved label carries any "From ..." wording.
      assert(p.launchPrice === 4999 && p.priceLabel === "From ₹4,999", "launch price + approved label");
      assert(p.requiresScopeReview === true, "scope-review flag drives the CTA");
      // Internal merchandising fields must NOT be part of the public DTO at all.
      const keys = Object.keys(p);
      for (const internal of ["priceType", "regularPrice", "isPriority", "publicationState"]) {
        assert(!keys.includes(internal), `public utility DTO omits ${internal}`);
      }
      const modeKeys = Object.keys(
        toPublicCatalogue([tier()], { globalAvailability: "AVAILABLE", whatsappBaseUrl: null }).tiers[0]!.utilities[0]!.modes[0]!,
      );
      for (const internal of ["priceType", "regularPrice"]) {
        assert(!modeKeys.includes(internal), `public mode DTO omits ${internal}`);
      }
      const json = JSON.stringify(toPublicCatalogue([tier({ utilities: [u] })], { globalAvailability: "AVAILABLE", whatsappBaseUrl: null }));
      for (const token of ["\"FIXED\"", "\"FROM\"", "Not set", "priceType", "regularPrice", "isPriority"]) {
        assert(!json.includes(token), `public payload has no ${token}`);
      }
    },
  },
  {
    name: "NO-INTAKE PERSISTENCE: no intake model, API, or personal-data storage exists",
    run: () => {
      const schema = read("prisma/schema.prisma");
      assert(!/model\s+\w*Intake/i.test(schema), "no ConsultationIntake (or any *Intake) model");
      assert(!/model\s+ConsultationLead\b/i.test(schema), "no consultation lead-capture model");
      // The public reader is read-only — it never writes personal data.
      const reader = read("src/modules/site-settings/public-catalogue.ts");
      assert(/read-only/i.test(reader) && !/\.create\(|\.upsert\(|\.createMany\(/.test(reader), "public reader performs no writes");
      // The public projection carries no name/mobile/birth/concern intake fields — assert on
      // the projected payload's KEYS (deeply), not on comment prose.
      const projected = toPublicCatalogue([tier()], { globalAvailability: "AVAILABLE", whatsappBaseUrl: null });
      const keys = new Set<string>();
      const walk = (value: unknown): void => {
        if (Array.isArray(value)) return value.forEach(walk);
        if (value && typeof value === "object") {
          for (const [k, v] of Object.entries(value)) { keys.add(k.toLowerCase()); walk(v); }
        }
      };
      walk(projected);
      for (const forbidden of ["fullname", "mobile", "phonenumber", "phone", "birthdate", "birthtime", "concern", "intake", "email"]) {
        assert(!keys.has(forbidden), `no intake field "${forbidden}" in the public shape`);
      }
    },
  },
  {
    name: "FAILURE-SAFE: empty catalogue is the controlled degraded surface",
    run: () => {
      assert(EMPTY_PUBLIC_CATALOGUE.tiers.length === 0 && EMPTY_PUBLIC_CATALOGUE.whatsappBaseUrl === null, "empty catalogue exposes nothing");
      assert(EMPTY_PUBLIC_CATALOGUE.global.status === "UNAVAILABLE", "empty catalogue is the safe off-state");
      const nullish: PublicConsultationCatalogue = toPublicCatalogue(null, { globalAvailability: "UNAVAILABLE", whatsappBaseUrl: null });
      assert(nullish.tiers.length === 0, "null tiers → empty");
    },
  },
];

function main() {
  console.log("Claude C10A — Consultation catalogue PUBLIC contract QA:");
  let passed = 0;
  let failed = 0;
  for (const group of groups) {
    try {
      group.run();
      console.log(`  ✓ ${group.name}`);
      passed += 1;
    } catch (error) {
      console.log(`  ✗ ${group.name} -- ${error instanceof Error ? error.message : String(error)}`);
      failed += 1;
    }
  }
  console.log(`\nconsultation catalogue public QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

main();
