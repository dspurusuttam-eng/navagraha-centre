// Claude Admin Console C2A — Prisma-backed Article repository + bound deps + route helpers.
import "server-only";

import { NextResponse } from "next/server";
import { ArticleStatus, type Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { writeAuditLog } from "@/modules/admin/audit";
import type { AdminApiContext } from "@/modules/admin/api-guard";
import type { ArticleActor, ArticleRecord, ServiceResult } from "@/modules/admin/articles/types";
import type { ArticleRepository } from "@/modules/admin/articles/repository";
import type { ArticleServiceDeps } from "@/modules/admin/articles/service-core";

type Db = ReturnType<typeof getPrisma>;
type ArticleRow = Awaited<ReturnType<Db["article"]["findUniqueOrThrow"]>>;

function mapRow(row: ArticleRow): ArticleRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    summary: row.summary,
    body: row.body,
    language: row.language,
    category: row.category,
    coverImageAssetId: row.coverImageAssetId,
    status: row.status,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    readingTimeMinutes: row.readingTimeMinutes,
    isFeatured: row.isFeatured,
    displayOrder: row.displayOrder,
    publishedAt: row.publishedAt,
    unpublishedAt: row.unpublishedAt,
    archivedAt: row.archivedAt,
    authorId: row.authorId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function createPrismaArticleRepository(db: Db): ArticleRepository {
  return {
    async list(filters) {
      const where: Prisma.ArticleWhereInput = {
        ...(filters.status ? { status: filters.status as ArticleStatus } : {}),
        ...(filters.language ? { language: filters.language } : {}),
        ...(filters.search
          ? {
              OR: [
                { title: { contains: filters.search, mode: "insensitive" } },
                { summary: { contains: filters.search, mode: "insensitive" } },
                { slug: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {}),
      };
      const [rows, total] = await Promise.all([
        db.article.findMany({ where, orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }], skip: filters.skip, take: filters.take }),
        db.article.count({ where }),
      ]);
      return { items: rows.map(mapRow), total };
    },
    async findById(id) {
      const row = await db.article.findUnique({ where: { id } });
      return row ? mapRow(row) : null;
    },
    async findBySlug(slug) {
      const row = await db.article.findUnique({ where: { slug } });
      return row ? mapRow(row) : null;
    },
    async create(data) {
      const row = await db.article.create({ data: { ...data, status: data.status as ArticleStatus } });
      return mapRow(row);
    },
    async update(id, data) {
      const row = await db.article.update({ where: { id }, data: data as Prisma.ArticleUpdateInput });
      return mapRow(row);
    },
    async remove(id) {
      await db.article.delete({ where: { id } });
    },
    async listRecentByUpdated(limit) {
      const rows = await db.article.findMany({ orderBy: { updatedAt: "desc" }, take: limit });
      return rows.map(mapRow);
    },
  };
}

export function getAdminArticleDeps(): ArticleServiceDeps {
  return { repo: createPrismaArticleRepository(getPrisma()), audit: writeAuditLog, now: () => new Date() };
}

export function articleActorFromContext(context: AdminApiContext): ArticleActor {
  return {
    userId: context.userId,
    roleKeys: context.adminRoles.map((role) => role.key),
    primaryRoleKey: context.primaryRoleKey,
  };
}

export function articleServiceResponse<T>(result: ServiceResult<T>): NextResponse {
  if (result.ok) {
    return NextResponse.json(result.data, { status: result.status });
  }
  return NextResponse.json(
    { error: { code: result.code, message: result.message, ...(result.issues === undefined ? {} : { issues: result.issues }) } },
    { status: result.status },
  );
}
