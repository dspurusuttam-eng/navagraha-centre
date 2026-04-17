import "server-only";

import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import type { SiderealBirthChart } from "@/lib/astrology/chart-builder";
import { getPrisma } from "@/lib/prisma";
import { ensureUserProfile } from "@/modules/account/service";

type PersistenceErrorCode = "PROFILE_NOT_FOUND" | "PERSISTENCE_WRITE_FAILED";

export type BirthProfileFingerprintInput = {
  birthDate: string;
  birthTime: string | null;
  timezone: string;
  city: string;
  region: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
};

export type PersistedSiderealChartSettings = {
  zodiac: "sidereal";
  ayanamsha: "LAHIRI";
  house_system: "whole_sign";
};

export type PersistedSiderealBirthChart = {
  version: "1";
  fingerprint: string;
  birthProfileFingerprint: string | null;
  settings: PersistedSiderealChartSettings;
  chart: SiderealBirthChart;
  savedAtUtc: string;
  createdAtUtc: string;
  updatedAtUtc: string;
};

type ProfileChartDataEnvelope = {
  siderealBirthChart?: PersistedSiderealBirthChart;
  legacyNatalChart?: Prisma.JsonValue;
};

export type SaveBirthChartFailure = {
  success: false;
  error: {
    code: PersistenceErrorCode;
    message: string;
  };
};

export type SaveBirthChartSuccess = {
  success: true;
  data: {
    fingerprint: string;
    birthProfileFingerprint: string | null;
    createdAtUtc: string;
    updatedAtUtc: string;
    policy: "updated-existing-for-user-profile" | "kept-existing-canonical-chart";
  };
};

export type SaveBirthChartResult = SaveBirthChartFailure | SaveBirthChartSuccess;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTextValue(value: string | null | undefined) {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeCoordinateValue(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "null";
  }

  return value.toFixed(6);
}

export function buildBirthProfileFingerprint(input: BirthProfileFingerprintInput) {
  const canonicalInput = {
    birthDate: normalizeTextValue(input.birthDate),
    birthTime: normalizeTextValue(input.birthTime ?? ""),
    timezone: normalizeTextValue(input.timezone),
    city: normalizeTextValue(input.city),
    region: normalizeTextValue(input.region ?? ""),
    country: normalizeTextValue(input.country),
    latitude: normalizeCoordinateValue(input.latitude),
    longitude: normalizeCoordinateValue(input.longitude),
  };

  return createHash("sha256")
    .update(JSON.stringify(canonicalInput))
    .digest("hex");
}

function toEnvelope(input: Prisma.JsonValue | null): ProfileChartDataEnvelope {
  if (!isRecord(input)) {
    return {};
  }

  const siderealBirthChart = input.siderealBirthChart;
  const legacyNatalChart = input.legacyNatalChart;

  if (siderealBirthChart || legacyNatalChart) {
    return {
      siderealBirthChart: isRecord(siderealBirthChart)
        ? (siderealBirthChart as unknown as PersistedSiderealBirthChart)
        : undefined,
      legacyNatalChart: legacyNatalChart as Prisma.JsonValue,
    };
  }

  if (input.kind === "NATAL") {
    return {
      legacyNatalChart: input as unknown as Prisma.JsonValue,
    };
  }

  return {};
}

export function readPersistedSiderealBirthChart(
  chartData: Prisma.JsonValue | null
) {
  const envelope = toEnvelope(chartData);

  return envelope.siderealBirthChart ?? null;
}

function buildChartFingerprint(chart: SiderealBirthChart) {
  const canonicalInput = {
    birth_context: chart.birth_context,
    settings: chart.settings,
    lagna: chart.lagna,
    houses: chart.houses,
    planets: chart.planets.map((planet) => ({
      name: planet.name,
      sign: planet.sign,
      house: planet.house,
      longitude: planet.longitude,
    })),
  };

  return createHash("sha256")
    .update(JSON.stringify(canonicalInput))
    .digest("hex");
}

function toJsonValue(input: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(input)) as Prisma.InputJsonValue;
}

export async function saveBirthChartForUser(input: {
  userId: string;
  chart: SiderealBirthChart;
  birthProfileFingerprint?: string;
}): Promise<SaveBirthChartResult> {
  const prisma = getPrisma();
  const profile = await ensureUserProfile(input.userId).catch(() => null);

  if (!profile) {
    return {
      success: false,
      error: {
        code: "PROFILE_NOT_FOUND",
        message:
          "Could not find or create a profile for this account before saving chart data.",
      },
    };
  }

  const nowIso = new Date().toISOString();
  const fingerprint = buildChartFingerprint(input.chart);
  const existingEnvelope = toEnvelope(profile.chartData);
  const existingSidereal = existingEnvelope.siderealBirthChart;
  const nextBirthProfileFingerprint =
    input.birthProfileFingerprint ?? existingSidereal?.birthProfileFingerprint ?? null;
  const createdAtUtc = existingSidereal?.createdAtUtc ?? nowIso;
  const shouldKeepExisting =
    existingSidereal?.fingerprint === fingerprint &&
    existingSidereal.birthProfileFingerprint === nextBirthProfileFingerprint &&
    existingSidereal.chart.birth_context.birth_utc ===
      input.chart.birth_context.birth_utc;

  if (shouldKeepExisting) {
    return {
      success: true,
      data: {
        fingerprint,
        birthProfileFingerprint: nextBirthProfileFingerprint,
        createdAtUtc,
        updatedAtUtc: existingSidereal.updatedAtUtc,
        policy: "kept-existing-canonical-chart",
      },
    };
  }

  const nextSiderealChart: PersistedSiderealBirthChart = {
    version: "1",
    fingerprint,
    birthProfileFingerprint: nextBirthProfileFingerprint,
    settings: {
      zodiac: "sidereal",
      ayanamsha: "LAHIRI",
      house_system: "whole_sign",
    },
    chart: input.chart,
    savedAtUtc: nowIso,
    createdAtUtc,
    updatedAtUtc: nowIso,
  };

  const nextEnvelope: ProfileChartDataEnvelope = {
    siderealBirthChart: nextSiderealChart,
    legacyNatalChart: existingEnvelope.legacyNatalChart,
  };

  try {
    await prisma.profile.update({
      where: {
        userId: input.userId,
      },
      data: {
        chartData: toJsonValue(nextEnvelope),
      },
    });
  } catch {
    return {
      success: false,
      error: {
        code: "PERSISTENCE_WRITE_FAILED",
        message: "Chart persistence failed while writing profile chart data.",
      },
    };
  }

  return {
    success: true,
    data: {
      fingerprint,
      birthProfileFingerprint: nextBirthProfileFingerprint,
      createdAtUtc,
      updatedAtUtc: nowIso,
      policy: "updated-existing-for-user-profile",
    },
  };
}
