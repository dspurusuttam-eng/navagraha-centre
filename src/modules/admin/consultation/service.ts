// Claude Admin Console C2B1 — Prisma-backed ConsultationSettings repo + deps + route helpers.
import "server-only";

import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  PUBLIC_CONTENT_TAGS,
  invalidatePublicContent,
} from "@/lib/public-content-cache";
import { writeAuditLog } from "@/modules/admin/audit";
import { consultationConfigSchema, type ConsultationConfig } from "@/modules/admin/domain";
import type { AdminApiContext } from "@/modules/admin/api-guard";
import type { ConsultationSettingsRepository } from "@/modules/admin/consultation/repository";
import type { ConsultationActor, ConsultationServiceDeps, ServiceResult } from "@/modules/admin/consultation/service-core";

const SINGLETON_KEY = "default";

type Db = ReturnType<typeof getPrisma>;

/** JSON-clean the config (drops undefined) for Prisma Json storage. */
function toJson(config: ConsultationConfig): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(config)) as Prisma.InputJsonValue;
}

export function createPrismaConsultationRepository(db: Db): ConsultationSettingsRepository {
  return {
    async get() {
      const row = await db.consultationSettings.findUnique({ where: { singletonKey: SINGLETON_KEY } });
      if (!row || row.settingsJson == null) return null;
      const parsed = consultationConfigSchema.safeParse(row.settingsJson);
      return parsed.success ? parsed.data : null;
    },
    async save(config) {
      const data = toJson(config);
      const row = await db.consultationSettings.upsert({
        where: { singletonKey: SINGLETON_KEY },
        update: { settingsJson: data },
        create: { singletonKey: SINGLETON_KEY, settingsJson: data },
      });
      invalidatePublicContent(PUBLIC_CONTENT_TAGS.consultationSettings);
      const parsed = consultationConfigSchema.safeParse(row.settingsJson);
      return parsed.success ? parsed.data : config;
    },
  };
}

export function getConsultationDeps(): ConsultationServiceDeps {
  return { repo: createPrismaConsultationRepository(getPrisma()), audit: writeAuditLog };
}

export function consultationActorFromContext(context: AdminApiContext): ConsultationActor {
  return {
    userId: context.userId,
    roleKeys: context.adminRoles.map((role) => role.key),
    primaryRoleKey: context.primaryRoleKey,
  };
}

export function consultationServiceResponse<T>(result: ServiceResult<T>): NextResponse {
  if (result.ok) {
    return NextResponse.json(result.data, { status: result.status });
  }
  return NextResponse.json(
    { error: { code: result.code, message: result.message, ...(result.issues === undefined ? {} : { issues: result.issues }) } },
    { status: result.status },
  );
}
