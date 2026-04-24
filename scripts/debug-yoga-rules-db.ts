import { config as loadDotenv } from "dotenv";
import { getPrisma } from "@/lib/prisma";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import { getYogaRuleContextForChart } from "@/modules/astrology/yoga-rule-context";

const envFiles = [
  ".env",
  ".env.local",
  ".env.development.local",
  ".env.development",
];

for (const envFile of envFiles) {
  loadDotenv({ path: envFile, override: false, quiet: true });
}

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function asUnifiedSiderealChart(value: unknown): UnifiedSiderealChart | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as Record<string, unknown>;
  const hasShape =
    typeof row.birth_context === "object" &&
    typeof row.settings === "object" &&
    Array.isArray(row.houses) &&
    Array.isArray(row.planets) &&
    typeof row.verification === "object";

  return hasShape ? (value as UnifiedSiderealChart) : null;
}

async function main() {
  const limitRaw = readArg("--limit");
  const limit = Number.isFinite(Number(limitRaw)) ? Number(limitRaw) : 2;
  const prisma = getPrisma();
  const profileRows = await prisma.profile.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    take: Math.max(3, limit * 4),
    select: {
      userId: true,
      updatedAt: true,
      chartData: true,
    },
  });
  const normalizedResults: Array<
    | {
        source: "profile_chart_data_sidereal_birth_chart";
        chart_id: string;
        user_id: string;
        updated_at: string;
        success: true;
        counts: {
          dignity_signals: number;
          conjunctions: number;
          house_lord_rules: number;
          yoga_signals: number;
        };
        top_yoga_signals: unknown[];
      }
    | {
        source: "profile_chart_data_sidereal_birth_chart";
        chart_id: string;
        user_id: string;
        updated_at: string;
        success: false;
        issue?: unknown;
        reason?: string;
      }
  > = [];

  for (const profile of profileRows) {
    if (normalizedResults.length >= Math.max(1, limit)) {
      break;
    }

    const rootPayload =
      profile.chartData !== null && profile.chartData !== undefined
        ? (profile.chartData as Record<string, unknown>)
        : null;
    const siderealContainer =
      rootPayload &&
      typeof rootPayload === "object" &&
      rootPayload.siderealBirthChart &&
      typeof rootPayload.siderealBirthChart === "object"
        ? (rootPayload.siderealBirthChart as Record<string, unknown>)
        : null;
    const unifiedChart = siderealContainer
      ? asUnifiedSiderealChart(siderealContainer.chart)
      : null;

    if (!unifiedChart) {
      continue;
    }

    const fingerprint =
      typeof siderealContainer?.fingerprint === "string"
        ? siderealContainer.fingerprint
        : `profile-${profile.userId}`;
    const yogaResult = getYogaRuleContextForChart({
      chart: unifiedChart,
    });

    if (!yogaResult.success) {
      normalizedResults.push({
        chart_id: fingerprint,
        user_id: profile.userId,
        updated_at: profile.updatedAt.toISOString(),
        success: false,
        source: "profile_chart_data_sidereal_birth_chart",
        issue: yogaResult.issue,
      });
      continue;
    }

    normalizedResults.push({
      chart_id: fingerprint,
      user_id: profile.userId,
      updated_at: profile.updatedAt.toISOString(),
      success: true,
      source: "profile_chart_data_sidereal_birth_chart",
      counts: {
        dignity_signals: yogaResult.data.dignity_signals.length,
        conjunctions: yogaResult.data.conjunctions.length,
        house_lord_rules: yogaResult.data.house_lord_rules.length,
        yoga_signals: yogaResult.data.yoga_signals.length,
      },
      top_yoga_signals: yogaResult.data.yoga_signals.slice(0, 3),
    });
  }

  console.log(
    JSON.stringify(
      {
        requested: limit,
        inspected_profile_rows: profileRows.length,
        checked: normalizedResults.length,
        verification: normalizedResults.slice(0, Math.max(1, limit)),
      },
      null,
      2
    )
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
