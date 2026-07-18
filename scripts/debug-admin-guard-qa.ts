/**
 * Claude Admin Console C1B — deterministic guard + audit QA (pure).
 * Tests the authorization decision policy and the audit core with a mock client.
 * No DB, no session, no network. (The server-only route wrappers are typecheck/
 * build-verified; live session auth is exercised on a deployed environment later.)
 */
import {
  evaluateAdminApiAccess,
  adminApiDenialBody,
  UNAUTHENTICATED_DENIAL,
  FORBIDDEN_DENIAL,
} from "@/modules/admin/access-policy";
import {
  sanitizeAuditMetadata,
  buildAuditEntry,
  writeAuditLogWith,
  type AuditLogClient,
} from "@/modules/admin/audit-core";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const SECRET_KEYS = ["password", "token", "secret", "cookie", "authorization", "session", "apiKey", "bearer", "credential"];
const SECRET_VALUES = ["supersecret", "tok_live_123", "Bearer abc", "sess_cookie_xyz"];

type Group = { name: string; run: () => void | Promise<void> };
const groups: Group[] = [
  {
    name: "G1 unauthenticated → 401 UNAUTHENTICATED",
    run: () => {
      const d = evaluateAdminApiAccess({ authenticated: false, adminRoles: [] });
      assert(!d.ok && d.denial.status === 401 && d.denial.code === "UNAUTHENTICATED", "401 expected");
      assert(d.ok === false && d.denial === UNAUTHENTICATED_DENIAL, "uses shared denial");
    },
  },
  {
    name: "G2 authenticated non-admin → 403 FORBIDDEN",
    run: () => {
      const d = evaluateAdminApiAccess({ authenticated: true, adminRoles: [] });
      assert(!d.ok && d.denial.status === 403 && d.denial.code === "FORBIDDEN", "403 expected");
      assert(d.ok === false && d.denial === FORBIDDEN_DENIAL, "uses shared denial");
    },
  },
  {
    name: "G3 approved admin → allowed (200 path) incl. role scoping + founder superuser",
    run: () => {
      assert(evaluateAdminApiAccess({ authenticated: true, adminRoles: [{ key: "founder" }] }).ok, "founder ok");
      assert(evaluateAdminApiAccess({ authenticated: true, adminRoles: [{ key: "support" }], allowedRoles: ["support"] }).ok, "support scoped ok");
      // editor accessing a founder-only resource → forbidden
      const denied = evaluateAdminApiAccess({ authenticated: true, adminRoles: [{ key: "editor" }], allowedRoles: ["founder"] });
      assert(!denied.ok && denied.denial.status === 403, "editor→founder-only 403");
      // founder is superuser over any scope
      assert(evaluateAdminApiAccess({ authenticated: true, adminRoles: [{ key: "founder" }], allowedRoles: ["support"] }).ok, "founder superuser");
    },
  },
  {
    name: "G4 denial body: only { error: { code, message } }, no leakage",
    run: () => {
      const body = adminApiDenialBody(FORBIDDEN_DENIAL);
      assert(Object.keys(body).length === 1 && "error" in body, "single error key");
      assert(Object.keys(body.error).sort().join(",") === "code,message", "error has only code+message");
      const blob = JSON.stringify(body).toLowerCase();
      for (const k of SECRET_KEYS) assert(!blob.includes(k.toLowerCase() + "\""), `no secret key ${k}`);
    },
  },
  {
    name: "G5 audit metadata sanitisation (nested, redacts secrets)",
    run: () => {
      const sanitized = sanitizeAuditMetadata({
        userId: "u1",
        password: "supersecret",
        token: "tok_live_123",
        nested: { authorization: "Bearer abc", ok: 1, deep: { sessionCookie: "sess_cookie_xyz", safe: true } },
        list: [{ apiKey: "k" }, "plain"],
      }) as Record<string, unknown>;
      assert(sanitized.userId === "u1", "safe kept");
      assert(sanitized.password === "[redacted]" && sanitized.token === "[redacted]", "top-level redacted");
      const nested = sanitized.nested as Record<string, unknown>;
      assert(nested.authorization === "[redacted]" && nested.ok === 1, "nested redacted+kept");
      const blob = JSON.stringify(sanitized);
      for (const v of SECRET_VALUES) assert(!blob.includes(v), `secret value ${v} not present`);
    },
  },
  {
    name: "G6 buildAuditEntry: actor/action/target/metadata + summary truncation",
    run: () => {
      const entry = buildAuditEntry({
        actorUserId: "u1", actorRoleKey: "founder", entityType: "article", entityId: "a1",
        action: "article.publish", summary: "x".repeat(900), metadata: { token: "t", note: "ok" },
      });
      assert(entry.actorUserId === "u1" && entry.actorRoleKey === "founder", "actor recorded");
      assert(entry.entityType === "article" && entry.entityId === "a1" && entry.action === "article.publish", "target+action");
      assert(entry.summary.length === 500, "summary truncated to 500");
      assert((entry.metadata as Record<string, unknown>).token === "[redacted]", "metadata sanitised");
      assert(buildAuditEntry({ entityType: "x", entityId: "y", action: "a", summary: "s" }).actorUserId === null, "actor defaults null");
    },
  },
  {
    name: "G7 audit write success (mock client)",
    run: async () => {
      let captured: Record<string, unknown> | null = null;
      const client: AuditLogClient = { auditLog: { create: async ({ data }) => { captured = data; return { id: "audit_1" }; } } };
      const result = await writeAuditLogWith(client, {
        actorUserId: "u1", entityType: "admin_health", entityId: "health", action: "admin.health.check",
        summary: "ok", metadata: { secret: "supersecret", roleCount: 2 },
      });
      assert(result.ok && result.id === "audit_1", "write ok with id");
      assert(captured !== null, "client called");
      const meta = (captured as unknown as { metadata: Record<string, unknown> }).metadata;
      assert(meta.secret === "[redacted]" && meta.roleCount === 2, "persisted metadata sanitised");
    },
  },
  {
    name: "G8 audit write failure handling (never throws)",
    run: async () => {
      const client: AuditLogClient = { auditLog: { create: async () => { throw new Error("db down"); } } };
      const result = await writeAuditLogWith(client, { entityType: "x", entityId: "y", action: "a", summary: "s" });
      assert(result.ok === false, "failure returns ok:false, no throw");
    },
  },
  {
    name: "G9 no secret/session leakage across denial body + audit entry",
    run: () => {
      const denialBlob = JSON.stringify(adminApiDenialBody(UNAUTHENTICATED_DENIAL));
      const entryBlob = JSON.stringify(buildAuditEntry({
        entityType: "x", entityId: "y", action: "a", summary: "s",
        metadata: { password: "supersecret", token: "tok_live_123", sessionCookie: "sess_cookie_xyz" },
      }));
      for (const v of SECRET_VALUES) {
        assert(!denialBlob.includes(v), `denial free of ${v}`);
        assert(!entryBlob.includes(v), `audit free of ${v}`);
      }
    },
  },
];

async function main() {
  console.log("Admin Console C1B — API guard + audit QA (pure):");
  let passed = 0;
  let failed = 0;
  for (const group of groups) {
    try {
      await group.run();
      console.log(`  ✓ ${group.name}`);
      passed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`  ✗ ${group.name} -- ${message}`);
      failed += 1;
    }
  }
  console.log(`\nadmin guard/audit QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
