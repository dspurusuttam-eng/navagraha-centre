// Claude Admin Console C2C — Prisma MediaAsset repo + reference checker + route helpers.
import "server-only";

import { NextResponse } from "next/server";
import { MediaAssetKind, type Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  PUBLIC_CONTENT_TAGS,
  invalidatePublicContent,
} from "@/lib/public-content-cache";
import { writeAuditLog } from "@/modules/admin/audit";
import { brandSettingsSchema } from "@/modules/admin/domain";
import type { AdminApiContext } from "@/modules/admin/api-guard";
import type { MediaActor, MediaRecord, ServiceResult } from "@/modules/admin/media/types";
import type { MediaRepository, MediaReferenceChecker } from "@/modules/admin/media/repository";
import type { MediaServiceDeps } from "@/modules/admin/media/service-core";

const BRAND_SINGLETON_KEY = "default";

type Db = ReturnType<typeof getPrisma>;
type MediaRow = Awaited<ReturnType<Db["mediaAsset"]["findUniqueOrThrow"]>>;

function mapRow(row: MediaRow): MediaRecord {
  return {
    id: row.id,
    kind: row.kind,
    url: row.url,
    filename: row.filename,
    mimeType: row.mimeType,
    byteSize: row.byteSize,
    width: row.width,
    height: row.height,
    altText: row.altText,
    caption: row.caption,
    createdById: row.createdById,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function createPrismaMediaRepository(db: Db): MediaRepository {
  return {
    async list(filters) {
      const where: Prisma.MediaAssetWhereInput = {
        ...(filters.kind ? { kind: filters.kind as MediaAssetKind } : {}),
        ...(filters.search
          ? {
              OR: [
                { filename: { contains: filters.search, mode: "insensitive" } },
                { altText: { contains: filters.search, mode: "insensitive" } },
                { caption: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [rows, total] = await Promise.all([
        db.mediaAsset.findMany({ where, orderBy: { createdAt: "desc" }, skip: filters.skip, take: filters.take }),
        db.mediaAsset.count({ where }),
      ]);
      return { items: rows.map(mapRow), total };
    },
    async findById(id) {
      const row = await db.mediaAsset.findUnique({ where: { id } });
      return row ? mapRow(row) : null;
    },
    async create(data) {
      const { kind, ...rest } = data;
      const row = await db.mediaAsset.create({ data: { ...rest, kind: kind as MediaAssetKind } });
      invalidatePublicContent(PUBLIC_CONTENT_TAGS.deskContent, PUBLIC_CONTENT_TAGS.brandSettings);
      return mapRow(row);
    },
    async update(id, data) {
      const { kind, ...rest } = data;
      const row = await db.mediaAsset.update({
        where: { id },
        data: { ...rest, ...(kind !== undefined ? { kind: kind as MediaAssetKind } : {}) },
      });
      invalidatePublicContent(PUBLIC_CONTENT_TAGS.deskContent, PUBLIC_CONTENT_TAGS.brandSettings);
      return mapRow(row);
    },
    async remove(id) {
      await db.mediaAsset.delete({ where: { id } });
      invalidatePublicContent(PUBLIC_CONTENT_TAGS.deskContent, PUBLIC_CONTENT_TAGS.brandSettings);
    },
  };
}

/** Counts Article.coverImageAssetId + BrandSettings profile-image references. */
export function createPrismaMediaReferenceChecker(db: Db): MediaReferenceChecker {
  return async (assetId) => {
    const articles = await db.article.count({ where: { coverImageAssetId: assetId } });
    let brand = 0;
    const brandRow = await db.brandSettings.findUnique({ where: { singletonKey: BRAND_SINGLETON_KEY } });
    if (brandRow?.settingsJson != null) {
      const parsed = brandSettingsSchema.safeParse(brandRow.settingsJson);
      if (parsed.success && parsed.data.profileImageAssetId === assetId) brand = 1;
    }
    return { articles, brand, total: articles + brand };
  };
}

export function getMediaDeps(): MediaServiceDeps {
  const db = getPrisma();
  return { repo: createPrismaMediaRepository(db), refs: createPrismaMediaReferenceChecker(db), audit: writeAuditLog };
}

export function mediaActorFromContext(context: AdminApiContext): MediaActor {
  return {
    userId: context.userId,
    roleKeys: context.adminRoles.map((role) => role.key),
    primaryRoleKey: context.primaryRoleKey,
  };
}

export function mediaServiceResponse<T>(result: ServiceResult<T>): NextResponse {
  if (result.ok) {
    return NextResponse.json(result.data, { status: result.status });
  }
  return NextResponse.json(
    { error: { code: result.code, message: result.message, ...(result.issues === undefined ? {} : { issues: result.issues }) } },
    { status: result.status },
  );
}
