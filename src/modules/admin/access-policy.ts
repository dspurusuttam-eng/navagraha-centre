// Claude Admin Console C1B — pure admin-API access policy (no server-only, no DB).
// Testable in isolation; the server-only guard (api-guard.ts) composes this with the
// live session + role lookup.
import {
  hasAdminAccess,
  type AdminRoleKey,
  type AdminRoleSummary,
} from "@/modules/admin/permissions";

export type AdminApiDenial = {
  status: 401 | 403;
  code: "UNAUTHENTICATED" | "FORBIDDEN";
  message: string;
};

/** Controlled, non-revealing denials (no session/user/role detail leaked). */
export const UNAUTHENTICATED_DENIAL: AdminApiDenial = {
  status: 401,
  code: "UNAUTHENTICATED",
  message: "Authentication required.",
};
export const FORBIDDEN_DENIAL: AdminApiDenial = {
  status: 403,
  code: "FORBIDDEN",
  message: "You do not have access to this resource.",
};

export type AdminApiAccessInput = {
  authenticated: boolean;
  adminRoles: readonly Pick<AdminRoleSummary, "key">[];
  allowedRoles?: readonly AdminRoleKey[];
};

export type AdminApiAccessDecision = { ok: true } | { ok: false; denial: AdminApiDenial };

/** Deterministic authorization decision for an /api/admin/* request. */
export function evaluateAdminApiAccess(input: AdminApiAccessInput): AdminApiAccessDecision {
  if (!input.authenticated) return { ok: false, denial: UNAUTHENTICATED_DENIAL };
  if (!input.adminRoles.length) return { ok: false, denial: FORBIDDEN_DENIAL };
  if (input.allowedRoles?.length && !hasAdminAccess(input.adminRoles, input.allowedRoles)) {
    return { ok: false, denial: FORBIDDEN_DENIAL };
  }
  return { ok: true };
}

/** The exact JSON body returned to the client — only { error: { code, message } }. */
export function adminApiDenialBody(denial: AdminApiDenial): { error: { code: string; message: string } } {
  return { error: { code: denial.code, message: denial.message } };
}
