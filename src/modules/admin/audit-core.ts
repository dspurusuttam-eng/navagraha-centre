// Claude Admin Console C1B — pure audit-entry construction + sanitisation (no server-only).
// The DB write is injected (AuditLogClient) so this is fully testable; the server-only
// wrapper (audit.ts) binds it to Prisma. Audit failures never throw into the request path.

const SENSITIVE_KEY_PATTERN =
  /(password|token|secret|cookie|authorization|session|api[-_]?key|bearer|credential|otp|pin)/i;
const MAX_DEPTH = 6;
const MAX_SUMMARY = 500;

/** Recursively redact sensitive keys; never emits secrets into the audit trail. */
export function sanitizeAuditMetadata(metadata: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return "[truncated]";
  if (metadata === null || typeof metadata !== "object") return metadata;
  if (Array.isArray(metadata)) return metadata.map((value) => sanitizeAuditMetadata(value, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
    out[key] = SENSITIVE_KEY_PATTERN.test(key) ? "[redacted]" : sanitizeAuditMetadata(value, depth + 1);
  }
  return out;
}

export type AuditEntryInput = {
  actorUserId?: string | null;
  actorRoleKey?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  metadata?: unknown;
};

export type AuditEntryRecord = {
  actorUserId: string | null;
  actorRoleKey: string | null;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  metadata: unknown;
};

/** Deterministic, sanitised audit record (timestamp is set by AuditLog.createdAt @default(now())). */
export function buildAuditEntry(input: AuditEntryInput): AuditEntryRecord {
  return {
    actorUserId: input.actorUserId ?? null,
    actorRoleKey: input.actorRoleKey ?? null,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    summary: input.summary.slice(0, MAX_SUMMARY),
    metadata: input.metadata === undefined ? null : sanitizeAuditMetadata(input.metadata),
  };
}

/** Minimal client contract (satisfied by Prisma and by test mocks). */
export type AuditLogClient = {
  auditLog: { create: (args: { data: Record<string, unknown> }) => Promise<{ id: string }> };
};

export type AuditWriteResult = { ok: true; id: string } | { ok: false };

/** Write an audit entry via an injected client; swallows failures (audit must not break requests). */
export async function writeAuditLogWith(client: AuditLogClient, input: AuditEntryInput): Promise<AuditWriteResult> {
  try {
    const entry = buildAuditEntry(input);
    const created = await client.auditLog.create({
      data: {
        actorUserId: entry.actorUserId,
        actorRoleKey: entry.actorRoleKey,
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        summary: entry.summary,
        metadata: entry.metadata,
      },
    });
    return { ok: true, id: created.id };
  } catch {
    return { ok: false };
  }
}
