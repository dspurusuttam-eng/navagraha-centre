// Claude C10A — Consultation catalogue domain (pure Zod; no DB, no server-only).
// The structured, English-only replacement for the flat global-topics model: tiers, their
// utilities, and (where required) priced utility modes. Draft/publication semantics keep
// incomplete edits private until an explicit publish action.
import { z } from "zod";
import { CONSULTATION_AVAILABILITY } from "@/modules/admin/domain/consultation-config";

// --- Enumerations ------------------------------------------------------------
export const CONSULTATION_PRICE_TYPES = ["FIXED", "FROM"] as const;
export type ConsultationPriceType = (typeof CONSULTATION_PRICE_TYPES)[number];

export const CONSULTATION_PUBLICATION_STATES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type ConsultationPublicationState = (typeof CONSULTATION_PUBLICATION_STATES)[number];

// Availability re-uses the settings vocabulary so Admin and catalogue speak one language.
export const CATALOGUE_AVAILABILITY = CONSULTATION_AVAILABILITY;
export type CatalogueAvailability = (typeof CATALOGUE_AVAILABILITY)[number];

// --- Primitive field schemas -------------------------------------------------
/** Lower-kebab-case stable identifier (letters, digits, single hyphens). */
export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lower-case words joined by single hyphens.");

const nameSchema = z.string().trim().min(1).max(160);
const shortTextSchema = z.string().trim().max(500);
const longTextSchema = z.string().trim().max(6000);
const bestForSchema = z.string().trim().max(1000);
const priceLabelSchema = z.string().trim().max(120);
const responseSchema = z.string().trim().max(1000);

/** Whole-rupee price. Never negative; capped defensively. Null means "not approved yet". */
const priceSchema = z.number().int().min(0).max(100_000_000);

const itemsSchema = z.array(z.string().trim().min(1).max(300)).max(50);

const priceTypeSchema = z.enum(CONSULTATION_PRICE_TYPES);
const availabilitySchema = z.enum(CATALOGUE_AVAILABILITY);
const sortOrderSchema = z.number().int().min(0).max(100_000);

// --- Tier schemas ------------------------------------------------------------
export const createTierSchema = z.object({
  slug: slugSchema,
  name: nameSchema,
  shortDescription: shortTextSchema.nullish(),
  detailedScope: longTextSchema.nullish(),
  bestFor: bestForSchema.nullish(),
  isActive: z.boolean().default(true),
  availabilityStatus: availabilitySchema.default("AVAILABLE"),
  sortOrder: sortOrderSchema.default(0),
});
export type CreateTierInput = z.infer<typeof createTierSchema>;

// Update never allows the publication state or slug to be flipped by an ordinary edit —
// publication is a dedicated transition, and the slug is a stable identifier.
export const updateTierSchema = createTierSchema.partial().omit({ slug: true });
export type UpdateTierInput = z.infer<typeof updateTierSchema>;

// --- Utility mode schemas ----------------------------------------------------
export const createModeSchema = z.object({
  slug: slugSchema,
  name: nameSchema,
  shortDescription: shortTextSchema.nullish(),
  priceType: priceTypeSchema.default("FIXED"),
  currency: z.literal("INR").default("INR"),
  launchPrice: priceSchema.nullish(),
  regularPrice: priceSchema.nullish(),
  priceLabel: priceLabelSchema.nullish(),
  travelExcluded: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: sortOrderSchema.default(0),
});
export type CreateModeInput = z.infer<typeof createModeSchema>;

export const updateModeSchema = createModeSchema.partial().omit({ slug: true });
export type UpdateModeInput = z.infer<typeof updateModeSchema>;

// --- Utility schemas ---------------------------------------------------------
export const createUtilitySchema = z.object({
  slug: slugSchema,
  tierSlug: slugSchema,
  name: nameSchema,
  shortDescription: shortTextSchema.nullish(),
  detailedScope: longTextSchema.nullish(),
  bestFor: bestForSchema.nullish(),
  includedItems: itemsSchema.default([]),
  excludedItems: itemsSchema.default([]),
  responseDescription: responseSchema.nullish(),
  priceType: priceTypeSchema.default("FIXED"),
  currency: z.literal("INR").default("INR"),
  launchPrice: priceSchema.nullish(),
  regularPrice: priceSchema.nullish(),
  priceLabel: priceLabelSchema.nullish(),
  requiresScopeReview: z.boolean().default(false),
  travelExcluded: z.boolean().default(false),
  isPriority: z.boolean().default(false),
  isActive: z.boolean().default(true),
  availabilityStatus: availabilitySchema.default("AVAILABLE"),
  sortOrder: sortOrderSchema.default(0),
});
export type CreateUtilityInput = z.infer<typeof createUtilitySchema>;

// tierSlug can be changed (re-parenting) but the utility slug stays stable.
export const updateUtilitySchema = createUtilitySchema.partial().omit({ slug: true });
export type UpdateUtilityInput = z.infer<typeof updateUtilitySchema>;

// --- Publication completeness gate ------------------------------------------
// Incomplete drafts must never go live. These pure checks are the single source of the
// "can this be published?" rule, shared by the service and its tests.
export type PublishableTier = {
  name: string;
  shortDescription: string | null;
};

export function tierPublishableIssues(tier: PublishableTier): string[] {
  const issues: string[] = [];
  if (!tier.name?.trim()) issues.push("A published tier needs a name.");
  if (!tier.shortDescription?.trim()) issues.push("A published tier needs a short description.");
  return issues;
}

export type PublishableUtility = {
  name: string;
  shortDescription: string | null;
  priceType: ConsultationPriceType;
  launchPrice: number | null;
  priceLabel: string | null;
  requiresScopeReview: boolean;
  hasModes: boolean;
  activeModeCount: number;
};

export function utilityPublishableIssues(utility: PublishableUtility): string[] {
  const issues: string[] = [];
  if (!utility.name?.trim()) issues.push("A published utility needs a name.");
  if (!utility.shortDescription?.trim()) issues.push("A published utility needs a short description.");
  // Pricing signal: mode-priced utilities need at least one active mode; otherwise a concrete
  // launch price, an explicit price label (e.g. "From ₹4,999"), or an explicit scope-review flag.
  const hasPricingSignal = utility.hasModes
    ? utility.activeModeCount > 0
    : utility.launchPrice != null || Boolean(utility.priceLabel?.trim()) || utility.requiresScopeReview;
  if (!hasPricingSignal) {
    issues.push(
      utility.hasModes
        ? "A published mode-priced utility needs at least one active mode."
        : "A published utility needs a launch price, a price label, or a scope-review flag.",
    );
  }
  return issues;
}

export function isPublicationState(value: string): value is ConsultationPublicationState {
  return (CONSULTATION_PUBLICATION_STATES as readonly string[]).includes(value);
}
