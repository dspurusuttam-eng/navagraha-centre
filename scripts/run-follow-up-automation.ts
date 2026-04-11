import { config as loadDotenv } from "dotenv";
import { getPrisma } from "../src/lib/prisma";
import { runFollowUpAutomation } from "../src/modules/consultations/follow-up-automation";

const envFiles = [
  ".env",
  ".env.local",
  ".env.development.local",
  ".env.development",
];

for (const envFile of envFiles) {
  loadDotenv({ path: envFile, override: false });
}

function readFlag(flag: string) {
  return process.argv.includes(flag);
}

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function parseLimit() {
  const rawLimit = readArg("--limit");

  if (!rawLimit) {
    return undefined;
  }

  const parsed = Number.parseInt(rawLimit, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("`--limit` must be a positive integer.");
  }

  return parsed;
}

function parseUserId() {
  const userId = readArg("--user-id");

  if (!userId) {
    return undefined;
  }

  const normalized = userId.trim();

  if (!normalized) {
    return undefined;
  }

  return normalized;
}

function parseActorUserId() {
  const userId = readArg("--actor-user-id");

  if (!userId) {
    return undefined;
  }

  const normalized = userId.trim();

  if (!normalized) {
    return undefined;
  }

  return normalized;
}

function parseActorRoleKey() {
  const roleKey = readArg("--actor-role-key");

  if (!roleKey) {
    return undefined;
  }

  const normalized = roleKey.trim();

  if (!normalized) {
    return undefined;
  }

  return normalized;
}

async function main() {
  const dryRun = readFlag("--dry-run");
  const recordAudit = readFlag("--record-audit");
  const limit = parseLimit();
  const userId = parseUserId();
  const actorUserId = parseActorUserId();
  const actorRoleKey = parseActorRoleKey();

  const result = await runFollowUpAutomation({
    dryRun,
    limit,
    userId,
    recordAudit,
    actorUserId,
    actorRoleKey,
  });

  console.log(
    JSON.stringify(
      {
        runAtUtc: result.runAtUtc,
        dryRun: result.dryRun,
        evaluated: result.evaluated,
        transitionedCount: result.transitionedLeads.length,
        reminderCandidateCount: result.reminderCandidates.length,
        skippedByReason: result.skipped.byReason,
        auditRecorded: recordAudit,
        transitionedLeads: result.transitionedLeads,
        reminderCandidates: result.reminderCandidates,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
