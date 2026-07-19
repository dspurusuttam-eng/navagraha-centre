// Claude Admin Console C2B2 — Prisma-backed BrandSettings repo + deps + route helpers.
import "server-only";

import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  PUBLIC_CONTENT_TAGS,
  invalidatePublicContent,
} from "@/lib/public-content-cache";
import { writeAuditLog } from "@/modules/admin/audit";
import { brandSettingsSchema, type BrandSettingsInput } from "@/modules/admin/domain";
import type { AdminApiContext } from "@/modules/admin/api-guard";
import type { BrandSettingsRepository } from "@/modules/admin/brand/repository";
import type { BrandActor, BrandServiceDeps, ServiceResult } from "@/modules/admin/brand/service-core";

const SINGLETON_KEY = "default";

type Db = ReturnType<typeof getPrisma>;

function toJson(config: BrandSettingsInput): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(config)) as Prisma.InputJsonValue;
}

export function createPrismaBrandRepository(db: Db): BrandSettingsRepository {
  return {
    async get() {
      const row = await db.brandSettings.findUnique({ where: { singletonKey: SINGLETON_KEY } });
      if (!row || row.settingsJson == null) return null;
      const parsed = brandSettingsSchema.safeParse(row.settingsJson);
      return parsed.success ? parsed.data : null;
    },
    async save(config) {
      const data = toJson(config);
      const row = await db.brandSettings.upsert({
        where: { singletonKey: SINGLETON_KEY },
        update: { settingsJson: data },
        create: { singletonKey: SINGLETON_KEY, settingsJson: data },
      });
      invalidatePublicContent(PUBLIC_CONTENT_TAGS.brandSettings);
      const parsed = brandSettingsSchema.safeParse(row.settingsJson);
      return parsed.success ? parsed.data : config;
    },
  };
}

export function getBrandDeps(): BrandServiceDeps {
  return { repo: createPrismaBrandRepository(getPrisma()), audit: writeAuditLog };
}

export function brandActorFromContext(context: AdminApiContext): BrandActor {
  return {
    userId: context.userId,
    roleKeys: context.adminRoles.map((role) => role.key),
    primaryRoleKey: context.primaryRoleKey,
  };
}

export function brandServiceResponse<T>(result: ServiceResult<T>): NextResponse {
  if (result.ok) {
    return NextResponse.json(result.data, { status: result.status });
  }
  return NextResponse.json(
    { error: { code: result.code, message: result.message, ...(result.issues === undefined ? {} : { issues: result.issues }) } },
    { status: result.status },
  );
}
