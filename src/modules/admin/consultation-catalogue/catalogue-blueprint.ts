// Claude C10A — Canonical Consultation catalogue blueprint (pure; no DB, no server-only).
//
// The single source of truth for the EXACT four tiers and eighteen utilities, their approved
// launch prices, priority flags, and the Residential Vastu remote/on-site modes. Consumed by
// the idempotent seed/import tooling and by the fixture tests.
//
// APPROVED here = structure, slugs, names (English titles derived from the approved slugs),
// launch prices, price types, scope-review + travel flags, and priority selection — all given
// explicitly by the C10A card. NOT approved here (and therefore intentionally absent, left
// blank so entries stay safely incomplete drafts): short/detailed descriptions, best-for copy,
// included/excluded items, delivery copy, and regular/reference prices. Nothing is invented.
import type { ConsultationPriceType } from "@/modules/admin/consultation-catalogue/domain";

export type BlueprintMode = {
  slug: string;
  name: string;
  priceType: ConsultationPriceType;
  /** Whole rupees. */
  launchPrice: number;
  travelExcluded?: boolean;
};

export type BlueprintUtility = {
  slug: string;
  name: string;
  priceType: ConsultationPriceType;
  /** Whole rupees, or null when the utility is priced by its modes / by quote. */
  launchPrice: number | null;
  /** Explicit display label where the card gives one (e.g. "From ₹4,999"). */
  priceLabel?: string;
  requiresScopeReview?: boolean;
  travelExcluded?: boolean;
  isPriority?: boolean;
  modes?: BlueprintMode[];
};

export type BlueprintTier = {
  slug: string;
  name: string;
  utilities: BlueprintUtility[];
};

export const CONSULTATION_CATALOGUE_BLUEPRINT: readonly BlueprintTier[] = [
  {
    slug: "quick-insight",
    name: "Quick Insight",
    utilities: [
      { slug: "complete-kundli-overview", name: "Complete Kundli Overview", priceType: "FIXED", launchPrice: 299, isPriority: true },
      { slug: "numerology-guidance", name: "Numerology Guidance", priceType: "FIXED", launchPrice: 299 },
      { slug: "name-number-guidance", name: "Name Number Guidance", priceType: "FIXED", launchPrice: 299 },
      { slug: "prashna-consultation", name: "Prashna Consultation", priceType: "FIXED", launchPrice: 399 },
    ],
  },
  {
    slug: "focused-guidance",
    name: "Focused Guidance",
    utilities: [
      { slug: "education-guidance", name: "Education Guidance", priceType: "FIXED", launchPrice: 499 },
      { slug: "career-guidance", name: "Career Guidance", priceType: "FIXED", launchPrice: 499, isPriority: true },
      { slug: "marriage-guidance", name: "Marriage Guidance", priceType: "FIXED", launchPrice: 499, isPriority: true },
      { slug: "relationship-guidance", name: "Relationship Guidance", priceType: "FIXED", launchPrice: 499 },
      { slug: "business-consultation", name: "Business Consultation", priceType: "FIXED", launchPrice: 699, isPriority: true },
      { slug: "dosha-consultation", name: "Dosha Consultation", priceType: "FIXED", launchPrice: 699 },
      { slug: "foreign-travel-relocation", name: "Foreign Travel & Relocation", priceType: "FIXED", launchPrice: 699 },
    ],
  },
  {
    slug: "match-timing",
    name: "Match & Timing",
    utilities: [
      { slug: "kundli-milan", name: "Kundli Milan", priceType: "FIXED", launchPrice: 699, isPriority: true },
      { slug: "shubh-muhurat", name: "Shubh Muhurat", priceType: "FIXED", launchPrice: 699 },
      { slug: "monthly-short-range-forecast", name: "Monthly Short-Range Forecast", priceType: "FIXED", launchPrice: 699 },
      { slug: "varshaphal-yearly-forecast", name: "Varshaphal Yearly Forecast", priceType: "FIXED", launchPrice: 1499 },
    ],
  },
  {
    slug: "premium-cases",
    name: "Premium Cases",
    utilities: [
      {
        slug: "residential-vastu",
        name: "Residential Vastu",
        priceType: "FIXED",
        // Priced by its two modes — no single utility-level launch price.
        launchPrice: null,
        isPriority: true,
        modes: [
          { slug: "remote", name: "Remote", priceType: "FIXED", launchPrice: 1999 },
          { slug: "on-site", name: "On-site", priceType: "FIXED", launchPrice: 2499, travelExcluded: true },
        ],
      },
      { slug: "comprehensive-multi-issue-consultation", name: "Comprehensive Multi-Issue Consultation", priceType: "FIXED", launchPrice: 2499 },
      {
        slug: "commercial-vastu-business-premises",
        name: "Commercial Vastu (Business Premises)",
        priceType: "FROM",
        launchPrice: 4999,
        priceLabel: "From ₹4,999",
        requiresScopeReview: true,
      },
    ],
  },
] as const;

/** The exact four tier slugs, in canonical order. */
export const TIER_SLUGS: readonly string[] = CONSULTATION_CATALOGUE_BLUEPRINT.map((tier) => tier.slug);

/** The exact eighteen utility slugs, in canonical order. */
export const UTILITY_SLUGS: readonly string[] = CONSULTATION_CATALOGUE_BLUEPRINT.flatMap((tier) =>
  tier.utilities.map((utility) => utility.slug),
);

/** The six priority utility slugs. */
export const PRIORITY_UTILITY_SLUGS: readonly string[] = CONSULTATION_CATALOGUE_BLUEPRINT.flatMap((tier) =>
  tier.utilities.filter((utility) => utility.isPriority).map((utility) => utility.slug),
);

export const EXPECTED_TIER_COUNT = 4;
export const EXPECTED_UTILITY_COUNT = 18;
