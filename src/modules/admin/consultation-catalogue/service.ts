// Claude C10A — Prisma-backed Consultation catalogue repository + deps + route helpers.
import "server-only";

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import {
  PUBLIC_CONTENT_TAGS,
  invalidatePublicContent,
} from "@/lib/public-content-cache";
import { writeAuditLog } from "@/modules/admin/audit";
import type { AdminApiContext } from "@/modules/admin/api-guard";
import type {
  CatalogueRepository,
  TierCreateData,
  TierUpdateData,
  UtilityCreateData,
  UtilityUpdateData,
  ModeCreateData,
  ModeUpdateData,
} from "@/modules/admin/consultation-catalogue/repository";
import type { CatalogueServiceDeps } from "@/modules/admin/consultation-catalogue/service-core";
import type {
  CatalogueActor,
  ServiceResult,
  TierRecord,
  TierWithUtilities,
  UtilityRecord,
  ModeRecord,
} from "@/modules/admin/consultation-catalogue/types";
import type {
  ConsultationPriceType,
  ConsultationPublicationState,
  CatalogueAvailability,
} from "@/modules/admin/consultation-catalogue/domain";

type Db = ReturnType<typeof getPrisma>;

// --- Row → Record mappers (explicit; never spread a Prisma row) --------------
type ModeRow = {
  id: string; utilityId: string; slug: string; name: string; shortDescription: string | null;
  priceType: string; currency: string; launchPrice: number | null; regularPrice: number | null;
  priceLabel: string | null; travelExcluded: boolean; isActive: boolean; sortOrder: number;
  createdAt: Date; updatedAt: Date;
};
type UtilityRow = {
  id: string; slug: string; tierId: string; name: string; shortDescription: string | null;
  detailedScope: string | null; bestFor: string | null; includedItems: string[]; excludedItems: string[];
  responseDescription: string | null; priceType: string; currency: string; launchPrice: number | null;
  regularPrice: number | null; priceLabel: string | null; requiresScopeReview: boolean;
  travelExcluded: boolean; isPriority: boolean; hasModes: boolean; isActive: boolean;
  availabilityStatus: string; sortOrder: number; publicationState: string; publishedAt: Date | null;
  createdById: string | null; createdAt: Date; updatedAt: Date; modes?: ModeRow[];
};
type TierRow = {
  id: string; slug: string; name: string; shortDescription: string | null; detailedScope: string | null;
  bestFor: string | null; isActive: boolean; availabilityStatus: string; sortOrder: number;
  publicationState: string; publishedAt: Date | null; createdById: string | null;
  createdAt: Date; updatedAt: Date; utilities?: UtilityRow[];
};

function mapMode(row: ModeRow): ModeRecord {
  return {
    id: row.id,
    utilityId: row.utilityId,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    priceType: row.priceType as ConsultationPriceType,
    currency: row.currency,
    launchPrice: row.launchPrice,
    regularPrice: row.regularPrice,
    priceLabel: row.priceLabel,
    travelExcluded: row.travelExcluded,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapUtility(row: UtilityRow): UtilityRecord {
  return {
    id: row.id,
    slug: row.slug,
    tierId: row.tierId,
    name: row.name,
    shortDescription: row.shortDescription,
    detailedScope: row.detailedScope,
    bestFor: row.bestFor,
    includedItems: row.includedItems,
    excludedItems: row.excludedItems,
    responseDescription: row.responseDescription,
    priceType: row.priceType as ConsultationPriceType,
    currency: row.currency,
    launchPrice: row.launchPrice,
    regularPrice: row.regularPrice,
    priceLabel: row.priceLabel,
    requiresScopeReview: row.requiresScopeReview,
    travelExcluded: row.travelExcluded,
    isPriority: row.isPriority,
    hasModes: row.hasModes,
    isActive: row.isActive,
    availabilityStatus: row.availabilityStatus as CatalogueAvailability,
    sortOrder: row.sortOrder,
    publicationState: row.publicationState as ConsultationPublicationState,
    publishedAt: row.publishedAt,
    createdById: row.createdById,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    modes: (row.modes ?? []).map(mapMode),
  };
}

function mapTier(row: TierRow): TierRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    detailedScope: row.detailedScope,
    bestFor: row.bestFor,
    isActive: row.isActive,
    availabilityStatus: row.availabilityStatus as CatalogueAvailability,
    sortOrder: row.sortOrder,
    publicationState: row.publicationState as ConsultationPublicationState,
    publishedAt: row.publishedAt,
    createdById: row.createdById,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapTierWithUtilities(row: TierRow): TierWithUtilities {
  return { ...mapTier(row), utilities: (row.utilities ?? []).map(mapUtility) };
}

const MODE_ORDER = [{ sortOrder: "asc" as const }, { slug: "asc" as const }];
const UTILITY_ORDER = [{ sortOrder: "asc" as const }, { slug: "asc" as const }];
const TIER_ORDER = [{ sortOrder: "asc" as const }, { slug: "asc" as const }];

export function createPrismaCatalogueRepository(db: Db): CatalogueRepository {
  const utilityInclude = { modes: { orderBy: MODE_ORDER } } as const;
  const tierInclude = { utilities: { orderBy: UTILITY_ORDER, include: utilityInclude } } as const;

  return {
    async listTiersWithUtilities() {
      const rows = await db.consultationTier.findMany({ orderBy: TIER_ORDER, include: tierInclude });
      return (rows as unknown as TierRow[]).map(mapTierWithUtilities);
    },
    async findTierById(id) {
      const row = await db.consultationTier.findUnique({ where: { id } });
      return row ? mapTier(row as unknown as TierRow) : null;
    },
    async findTierBySlug(slug) {
      const row = await db.consultationTier.findUnique({ where: { slug } });
      return row ? mapTier(row as unknown as TierRow) : null;
    },
    async createTier(data: TierCreateData) {
      const row = await db.consultationTier.create({ data });
      invalidatePublicContent(PUBLIC_CONTENT_TAGS.consultationCatalogue);
      return mapTier(row as unknown as TierRow);
    },
    async updateTier(id, data: TierUpdateData) {
      const row = await db.consultationTier.update({ where: { id }, data });
      invalidatePublicContent(PUBLIC_CONTENT_TAGS.consultationCatalogue);
      return mapTier(row as unknown as TierRow);
    },
    async removeTier(id) {
      await db.consultationTier.delete({ where: { id } });
      invalidatePublicContent(PUBLIC_CONTENT_TAGS.consultationCatalogue);
    },
    async countUtilitiesForTier(tierId) {
      return db.consultationUtility.count({ where: { tierId } });
    },

    async findUtilityById(id) {
      const row = await db.consultationUtility.findUnique({ where: { id }, include: utilityInclude });
      return row ? mapUtility(row as unknown as UtilityRow) : null;
    },
    async findUtilityBySlug(slug) {
      const row = await db.consultationUtility.findUnique({ where: { slug }, include: utilityInclude });
      return row ? mapUtility(row as unknown as UtilityRow) : null;
    },
    async createUtility(data: UtilityCreateData) {
      const row = await db.consultationUtility.create({ data, include: utilityInclude });
      invalidatePublicContent(PUBLIC_CONTENT_TAGS.consultationCatalogue);
      return mapUtility(row as unknown as UtilityRow);
    },
    async updateUtility(id, data: UtilityUpdateData) {
      const row = await db.consultationUtility.update({ where: { id }, data, include: utilityInclude });
      invalidatePublicContent(PUBLIC_CONTENT_TAGS.consultationCatalogue);
      return mapUtility(row as unknown as UtilityRow);
    },
    async removeUtility(id) {
      await db.consultationUtility.delete({ where: { id } });
      invalidatePublicContent(PUBLIC_CONTENT_TAGS.consultationCatalogue);
    },

    async findModeById(id) {
      const row = await db.consultationUtilityMode.findUnique({ where: { id } });
      return row ? mapMode(row as unknown as ModeRow) : null;
    },
    async createMode(data: ModeCreateData) {
      const row = await db.consultationUtilityMode.create({ data });
      invalidatePublicContent(PUBLIC_CONTENT_TAGS.consultationCatalogue);
      return mapMode(row as unknown as ModeRow);
    },
    async updateMode(id, data: ModeUpdateData) {
      const row = await db.consultationUtilityMode.update({ where: { id }, data });
      invalidatePublicContent(PUBLIC_CONTENT_TAGS.consultationCatalogue);
      return mapMode(row as unknown as ModeRow);
    },
    async removeMode(id) {
      await db.consultationUtilityMode.delete({ where: { id } });
      invalidatePublicContent(PUBLIC_CONTENT_TAGS.consultationCatalogue);
    },

    async listPublishedCatalogue() {
      const rows = await db.consultationTier.findMany({
        where: { publicationState: "PUBLISHED", isActive: true },
        orderBy: TIER_ORDER,
        include: {
          utilities: {
            where: { publicationState: "PUBLISHED", isActive: true },
            orderBy: UTILITY_ORDER,
            include: { modes: { where: { isActive: true }, orderBy: MODE_ORDER } },
          },
        },
      });
      return (rows as unknown as TierRow[]).map(mapTierWithUtilities);
    },
  };
}

export function getCatalogueDeps(): CatalogueServiceDeps {
  return { repo: createPrismaCatalogueRepository(getPrisma()), audit: writeAuditLog, now: () => new Date() };
}

export function catalogueActorFromContext(context: AdminApiContext): CatalogueActor {
  return {
    userId: context.userId,
    roleKeys: context.adminRoles.map((role) => role.key),
    primaryRoleKey: context.primaryRoleKey,
  };
}

export function catalogueServiceResponse<T>(result: ServiceResult<T>): NextResponse {
  if (result.ok) {
    return NextResponse.json(result.data, { status: result.status });
  }
  return NextResponse.json(
    { error: { code: result.code, message: result.message, ...(result.issues === undefined ? {} : { issues: result.issues }) } },
    { status: result.status },
  );
}
