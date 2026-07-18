// Claude C10A — Consultation catalogue repository interface (pure DI boundary).
// The Prisma-backed implementation lives in service.ts (server-only); tests provide an
// in-memory implementation.
import type {
  ConsultationPriceType,
  ConsultationPublicationState,
  CatalogueAvailability,
} from "@/modules/admin/consultation-catalogue/domain";
import type { TierRecord, TierWithUtilities, UtilityRecord, ModeRecord } from "@/modules/admin/consultation-catalogue/types";

export type TierCreateData = {
  slug: string;
  name: string;
  shortDescription: string | null;
  detailedScope: string | null;
  bestFor: string | null;
  isActive: boolean;
  availabilityStatus: CatalogueAvailability;
  sortOrder: number;
  createdById: string | null;
};

export type TierUpdateData = Partial<
  Omit<TierCreateData, "slug" | "createdById"> & {
    publicationState: ConsultationPublicationState;
    publishedAt: Date | null;
  }
>;

export type UtilityCreateData = {
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
  isActive: boolean;
  availabilityStatus: CatalogueAvailability;
  sortOrder: number;
  createdById: string | null;
};

export type UtilityUpdateData = Partial<
  Omit<UtilityCreateData, "slug" | "createdById"> & {
    hasModes: boolean;
    publicationState: ConsultationPublicationState;
    publishedAt: Date | null;
  }
>;

export type ModeCreateData = {
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
};

export type ModeUpdateData = Partial<Omit<ModeCreateData, "utilityId" | "slug">>;

export interface CatalogueRepository {
  // Tiers
  listTiersWithUtilities(): Promise<TierWithUtilities[]>;
  findTierById(id: string): Promise<TierRecord | null>;
  findTierBySlug(slug: string): Promise<TierRecord | null>;
  createTier(data: TierCreateData): Promise<TierRecord>;
  updateTier(id: string, data: TierUpdateData): Promise<TierRecord>;
  removeTier(id: string): Promise<void>;
  countUtilitiesForTier(tierId: string): Promise<number>;

  // Utilities
  findUtilityById(id: string): Promise<UtilityRecord | null>;
  findUtilityBySlug(slug: string): Promise<UtilityRecord | null>;
  createUtility(data: UtilityCreateData): Promise<UtilityRecord>;
  updateUtility(id: string, data: UtilityUpdateData): Promise<UtilityRecord>;
  removeUtility(id: string): Promise<void>;

  // Modes
  findModeById(id: string): Promise<ModeRecord | null>;
  createMode(data: ModeCreateData): Promise<ModeRecord>;
  updateMode(id: string, data: ModeUpdateData): Promise<ModeRecord>;
  removeMode(id: string): Promise<void>;

  /** Published + active tiers, each with published + active utilities and active modes. */
  listPublishedCatalogue(): Promise<TierWithUtilities[]>;
}
