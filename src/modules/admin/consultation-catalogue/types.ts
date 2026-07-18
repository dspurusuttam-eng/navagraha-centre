// Claude C10A — Consultation catalogue DTOs (pure; no DB, no server-only).
import type {
  ConsultationPriceType,
  ConsultationPublicationState,
  CatalogueAvailability,
} from "@/modules/admin/consultation-catalogue/domain";

export type ModeRecord = {
  id: string;
  utilityId: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  priceType: ConsultationPriceType;
  currency: string;
  launchPrice: number | null;
  regularPrice: number | null;
  priceLabel: string | null;
  travelExcluded: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type UtilityRecord = {
  id: string;
  slug: string;
  tierId: string;
  name: string;
  shortDescription: string | null;
  detailedScope: string | null;
  bestFor: string | null;
  includedItems: string[];
  excludedItems: string[];
  responseDescription: string | null;
  priceType: ConsultationPriceType;
  currency: string;
  launchPrice: number | null;
  regularPrice: number | null;
  priceLabel: string | null;
  requiresScopeReview: boolean;
  travelExcluded: boolean;
  isPriority: boolean;
  hasModes: boolean;
  isActive: boolean;
  availabilityStatus: CatalogueAvailability;
  sortOrder: number;
  publicationState: ConsultationPublicationState;
  publishedAt: Date | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  modes: ModeRecord[];
};

export type TierRecord = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  detailedScope: string | null;
  bestFor: string | null;
  isActive: boolean;
  availabilityStatus: CatalogueAvailability;
  sortOrder: number;
  publicationState: ConsultationPublicationState;
  publishedAt: Date | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** A tier with its utilities (each with modes) — the shape Admin list/read returns. */
export type TierWithUtilities = TierRecord & { utilities: UtilityRecord[] };

export type CatalogueActor = {
  userId: string;
  roleKeys: readonly string[];
  primaryRoleKey: string | null;
};

export type ServiceResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; code: string; message: string; issues?: unknown };

export type PublicationAction = "PUBLISH" | "UNPUBLISH" | "ARCHIVE";
