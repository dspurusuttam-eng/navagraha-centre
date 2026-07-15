import "server-only";

import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  writeAuditLogWith,
  type AuditEntryInput,
  type AuditLogClient,
  type AuditWriteResult,
} from "@/modules/admin/audit-core";

export type { AuditEntryInput, AuditWriteResult } from "@/modules/admin/audit-core";
export { buildAuditEntry, sanitizeAuditMetadata } from "@/modules/admin/audit-core";

type RecordAuditLogInput = {
  actorUserId?: string | null;
  actorRoleKey?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  metadata?: Prisma.InputJsonValue;
};

/**
 * Legacy audit writer (throws on failure; caller-supplied metadata is trusted).
 * Retained for existing admin actions; new Admin-console code should prefer
 * `writeAuditLog`, which sanitises metadata and never throws.
 */
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

/**
 * C1B hardened audit service: sanitises metadata (redacts secret-like keys) and is
 * failure-tolerant (audit writes must never break the request path).
 */
export function writeAuditLog(input: AuditEntryInput): Promise<AuditWriteResult> {
  return writeAuditLogWith(getPrisma() as unknown as AuditLogClient, input);
}
