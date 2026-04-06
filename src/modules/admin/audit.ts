import "server-only";

import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

type RecordAuditLogInput = {
  actorUserId?: string | null;
  actorRoleKey?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  metadata?: Prisma.InputJsonValue;
};

export async function recordAuditLog({
  actorUserId,
  actorRoleKey,
  entityType,
  entityId,
  action,
  summary,
  metadata,
}: RecordAuditLogInput) {
  await getPrisma().auditLog.create({
    data: {
      actorUserId: actorUserId ?? null,
      actorRoleKey: actorRoleKey ?? null,
      entityType,
      entityId,
      action,
      summary,
      metadata,
    },
  });
}
