// Claude C9C1C — Preview-only founder bootstrap eligibility gate (server-only).
// Every condition is re-checked at submit time in the server action, not just on page load,
// so a stale render can never authorize a write (defense against TOCTOU).
import "server-only";

import { createHash } from "node:crypto";
import { getPrisma } from "@/lib/prisma";
import { getRequiredServerEnvironmentValue } from "@/config/env";

export const FOUNDER_BOOTSTRAP_EMAIL = "navagrahacentre@gmail.com";
export const FOUNDER_BOOTSTRAP_BRANCH = "feat/navagraha-admin-console-v1";

const PREVIEW_DB_FINGERPRINT = "d473188247c5";
const PRODUCTION_DB_FINGERPRINT = "7a73c028b15f";

export type FounderBootstrapGateResult = { eligible: true } | { eligible: false; reason: string };

function hostFingerprint(): string {
  const url = getRequiredServerEnvironmentValue("DATABASE_URL");
  const host = new URL(url).hostname;
  return createHash("sha256").update(host).digest("hex").slice(0, 12);
}

export async function checkFounderBootstrapEligible(): Promise<FounderBootstrapGateResult> {
  if (process.env.VERCEL_ENV !== "preview") {
    return { eligible: false, reason: "not a Preview deployment" };
  }
  if (process.env.VERCEL_GIT_COMMIT_REF !== FOUNDER_BOOTSTRAP_BRANCH) {
    return { eligible: false, reason: "not the target branch" };
  }

  const fp = hostFingerprint();
  if (fp === PRODUCTION_DB_FINGERPRINT) {
    return { eligible: false, reason: "Production database detected" };
  }
  if (fp !== PREVIEW_DB_FINGERPRINT) {
    return { eligible: false, reason: "database fingerprint mismatch" };
  }

  const prisma = getPrisma();

  const founderAssignments = await prisma.adminRoleAssignment.count({
    where: { role: { key: "founder" } },
  });
  if (founderAssignments > 0) {
    return { eligible: false, reason: "a founder assignment already exists" };
  }

  const existingUser = await prisma.user.findFirst({ where: { email: FOUNDER_BOOTSTRAP_EMAIL } });
  if (existingUser) {
    return { eligible: false, reason: "the account already exists" };
  }

  return { eligible: true };
}
