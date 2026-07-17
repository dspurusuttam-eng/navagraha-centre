// Claude C10A — public projection of the Consultation catalogue (pure; no DB, no server-only).
//
// This is the catalogue privacy boundary. The Admin catalogue records carry fields the public
// must never see (ids, timestamps, createdById, isActive, sortOrder, publicationState,
// publishedAt, tierId). Everything public is built by EXPLICIT field selection here — never by
// spreading an Admin record — so a new Admin field cannot leak by default. The projection also
// re-applies the publish/active filter defensively, so an unpublished or inactive record can
// never reach the public shape even if a caller passes it in.
//
// English-only (C10A language lock): the DTO carries `locale: "en"` and no localized fields.
// No CTA labels, no raw WhatsApp number, no Admin metadata, no intake — read-only.
import { availabilityLabel, type PublicSettingsLocale } from "@/modules/site-settings/public-settings-core";
import type {
  ConsultationPriceType,
  CatalogueAvailability,
} from "@/modules/admin/consultation-catalogue/domain";
import type { TierWithUtilities, UtilityRecord, ModeRecord } from "@/modules/admin/consultation-catalogue/types";

// --- Public shapes (allow-listed) -------------------------------------------
export type PublicPrice = {
  priceType: ConsultationPriceType;
  currency: string;
  /** Whole rupees, or null when not approved / priced by modes. Never invented. */
  launchPrice: number | null;
  regularPrice: number | null;
  priceLabel: string | null;
};

export type PublicMode = PublicPrice & {
  slug: string;
  name: string;
  shortDescription: string | null;
  travelExcluded: boolean;
};

export type PublicAvailability = {
  status: CatalogueAvailability;
  label: string;
};

export type PublicUtility = PublicPrice & {
  slug: string;
  name: string;
  shortDescription: string | null;
  detailedScope: string | null;
  bestFor: string | null;
  includedItems: string[];
  excludedItems: string[];
  responseDescription: string | null;
  requiresScopeReview: boolean;
  travelExcluded: boolean;
  isPriority: boolean;
  hasModes: boolean;
  availability: PublicAvailability;
  modes: PublicMode[];
};

export type PublicTier = {
  slug: string;
  name: string;
  shortDescription: string | null;
  detailedScope: string | null;
  bestFor: string | null;
  availability: PublicAvailability;
  utilities: PublicUtility[];
};

export type PublicConsultationCatalogue = {
  /** English-only in V1 (C10A language lock). */
  locale: PublicSettingsLocale;
  /** Global consultation availability (from published settings, else the safe off-state). */
  global: PublicAvailability;
  /** Derived wa.me base link (no message), or null. The raw number is never exposed. */
  whatsappBaseUrl: string | null;
  tiers: PublicTier[];
};

// --- Controlled empty catalogue ---------------------------------------------
// Used whenever nothing is published, or settings/catalogue are unreadable — the public
// surface then shows an empty, safe catalogue rather than 500-ing or leaking a draft.
export const EMPTY_PUBLIC_CATALOGUE: PublicConsultationCatalogue = {
  locale: "en",
  global: { status: "UNAVAILABLE", label: availabilityLabel("UNAVAILABLE") },
  whatsappBaseUrl: null,
  tiers: [],
};

function toAvailability(status: CatalogueAvailability): PublicAvailability {
  return { status, label: availabilityLabel(status) };
}

function projectMode(mode: ModeRecord): PublicMode {
  return {
    slug: mode.slug,
    name: mode.name,
    shortDescription: mode.shortDescription,
    priceType: mode.priceType,
    currency: mode.currency,
    launchPrice: mode.launchPrice,
    regularPrice: mode.regularPrice,
    priceLabel: mode.priceLabel,
    travelExcluded: mode.travelExcluded,
  };
}

function projectUtility(utility: UtilityRecord): PublicUtility {
  return {
    slug: utility.slug,
    name: utility.name,
    shortDescription: utility.shortDescription,
    detailedScope: utility.detailedScope,
    bestFor: utility.bestFor,
    includedItems: [...utility.includedItems],
    excludedItems: [...utility.excludedItems],
    responseDescription: utility.responseDescription,
    priceType: utility.priceType,
    currency: utility.currency,
    launchPrice: utility.launchPrice,
    regularPrice: utility.regularPrice,
    priceLabel: utility.priceLabel,
    requiresScopeReview: utility.requiresScopeReview,
    travelExcluded: utility.travelExcluded,
    isPriority: utility.isPriority,
    hasModes: utility.hasModes,
    availability: toAvailability(utility.availabilityStatus),
    // Defensive: only active modes are ever public.
    modes: utility.modes.filter((mode) => mode.isActive).map(projectMode),
  };
}

export type PublicCatalogueContext = {
  globalAvailability: CatalogueAvailability;
  whatsappBaseUrl: string | null;
};

/**
 * Project published, active tiers → the public catalogue shape.
 * Defensively drops any tier/utility that is not PUBLISHED + active, so a draft can never leak
 * even if the caller supplies unfiltered records.
 */
export function toPublicCatalogue(
  tiers: readonly TierWithUtilities[] | null | undefined,
  context: PublicCatalogueContext,
): PublicConsultationCatalogue {
  const global = toAvailability(context.globalAvailability);
  const projected = (tiers ?? [])
    .filter((tier) => tier.publicationState === "PUBLISHED" && tier.isActive)
    .map<PublicTier>((tier) => ({
      slug: tier.slug,
      name: tier.name,
      shortDescription: tier.shortDescription,
      detailedScope: tier.detailedScope,
      bestFor: tier.bestFor,
      availability: toAvailability(tier.availabilityStatus),
      utilities: tier.utilities
        .filter((utility) => utility.publicationState === "PUBLISHED" && utility.isActive)
        .map(projectUtility),
    }));
  return { locale: "en", global, whatsappBaseUrl: context.whatsappBaseUrl, tiers: projected };
}
