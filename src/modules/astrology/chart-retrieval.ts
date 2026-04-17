import "server-only";

import type { Prisma } from "@prisma/client";
import type { SiderealBirthChart } from "@/lib/astrology/chart-builder";
import { getPrisma } from "@/lib/prisma";
import { ensureUserProfile } from "@/modules/account/service";
import { buildSiderealChartContractForUser } from "@/modules/astrology/chart-contract";
import {
  buildBirthProfileFingerprint,
  readPersistedSiderealBirthChart,
  type PersistedSiderealBirthChart,
} from "@/modules/astrology/chart-persistence";

type RetrievalErrorCode =
  | "PROFILE_NOT_FOUND"
  | "MISSING_BIRTH_PROFILE"
  | "SAVED_CHART_NOT_FOUND"
  | "INVALID_SAVED_CHART"
  | "CHART_REFRESH_FAILED";

export type SavedChartStalenessReason =
  | "BIRTH_PROFILE_FINGERPRINT_MISSING"
  | "BIRTH_PROFILE_FINGERPRINT_MISMATCH"
  | null;

export type GetSavedBirthChartFailure = {
  success: false;
  error: {
    code: RetrievalErrorCode;
    message: string;
  };
};

export type GetSavedBirthChartSuccess = {
  success: true;
  data: {
    chart: SiderealBirthChart;
    persisted: PersistedSiderealBirthChart;
    stale: boolean;
    staleReason: SavedChartStalenessReason;
    currentBirthProfileFingerprint: string;
  };
};

export type GetSavedBirthChartResult =
  | GetSavedBirthChartFailure
  | GetSavedBirthChartSuccess;

export type RefreshBirthChartFailure = GetSavedBirthChartFailure;

export type RefreshBirthChartSuccess = {
  success: true;
  data: {
    chart: SiderealBirthChart;
    persistence: {
      fingerprint: string;
      birthProfileFingerprint: string | null;
      createdAtUtc: string;
      updatedAtUtc: string;
      policy: "updated-existing-for-user-profile" | "kept-existing-canonical-chart";
    };
  };
};

export type RefreshBirthChartResult =
  | RefreshBirthChartFailure
  | RefreshBirthChartSuccess;

export type RetrieveOrRefreshBirthChartResult =
  | GetSavedBirthChartFailure
  | {
      success: true;
      data: {
        chart: SiderealBirthChart;
        persistence: {
          fingerprint: string;
          birthProfileFingerprint: string | null;
          createdAtUtc: string;
          updatedAtUtc: string;
          policy:
            | "updated-existing-for-user-profile"
            | "kept-existing-canonical-chart";
        };
        retrieval: {
          policy:
            | "reused_saved_chart"
            | "refreshed_stale_chart"
            | "rebuilt_missing_saved_chart";
          staleDetected: boolean;
          staleReason: SavedChartStalenessReason;
        };
      };
    };

function toNumber(value: Prisma.Decimal | null) {
  return value === null ? null : Number(value);
}

function isValidSavedChartPayload(value: unknown): value is SiderealBirthChart {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as SiderealBirthChart;

  return (
    Boolean(candidate.birth_context) &&
    Boolean(candidate.settings) &&
    Boolean(candidate.lagna) &&
    Array.isArray(candidate.houses) &&
    Array.isArray(candidate.planets) &&
    candidate.settings.zodiac === "sidereal" &&
    candidate.settings.ayanamsha === "LAHIRI" &&
    candidate.settings.house_system === "whole_sign"
  );
}

function toPersistenceShape(saved: PersistedSiderealBirthChart) {
  return {
    fingerprint: saved.fingerprint,
    birthProfileFingerprint: saved.birthProfileFingerprint ?? null,
    createdAtUtc: saved.createdAtUtc,
    updatedAtUtc: saved.updatedAtUtc,
    policy: "kept-existing-canonical-chart" as const,
  };
}

export async function getSavedBirthChartForUser(
  userId: string
): Promise<GetSavedBirthChartResult> {
  const prisma = getPrisma();
  const profile = await ensureUserProfile(userId).catch(() => null);

  if (!profile) {
    return {
      success: false,
      error: {
        code: "PROFILE_NOT_FOUND",
        message: "Profile record is unavailable for this user.",
      },
    };
  }

  const birthProfile = await prisma.birthData.findFirst({
    where: { userId, isPrimary: true },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      birthDate: true,
      birthTime: true,
      timezone: true,
      city: true,
      region: true,
      country: true,
      latitude: true,
      longitude: true,
    },
  });

  if (!birthProfile) {
    return {
      success: false,
      error: {
        code: "MISSING_BIRTH_PROFILE",
        message:
          "Primary birth profile is missing. Complete onboarding before requesting chart data.",
      },
    };
  }

  const saved = readPersistedSiderealBirthChart(profile.chartData);

  if (!saved) {
    return {
      success: false,
      error: {
        code: "SAVED_CHART_NOT_FOUND",
        message:
          "No saved sidereal chart exists yet for this user profile.",
      },
    };
  }

  if (!isValidSavedChartPayload(saved.chart)) {
    return {
      success: false,
      error: {
        code: "INVALID_SAVED_CHART",
        message:
          "Saved chart payload is invalid or incomplete for safe reuse.",
      },
    };
  }

  const currentBirthProfileFingerprint = buildBirthProfileFingerprint({
    birthDate: birthProfile.birthDate,
    birthTime: birthProfile.birthTime,
    timezone: birthProfile.timezone,
    city: birthProfile.city,
    region: birthProfile.region,
    country: birthProfile.country,
    latitude: toNumber(birthProfile.latitude),
    longitude: toNumber(birthProfile.longitude),
  });
  const savedFingerprint = saved.birthProfileFingerprint;
  const staleReason: SavedChartStalenessReason = !savedFingerprint
    ? "BIRTH_PROFILE_FINGERPRINT_MISSING"
    : savedFingerprint !== currentBirthProfileFingerprint
      ? "BIRTH_PROFILE_FINGERPRINT_MISMATCH"
      : null;

  return {
    success: true,
    data: {
      chart: saved.chart,
      persisted: saved,
      stale: Boolean(staleReason),
      staleReason,
      currentBirthProfileFingerprint,
    },
  };
}

export async function refreshBirthChartForUser(
  userId: string
): Promise<RefreshBirthChartResult> {
  const refreshed = await buildSiderealChartContractForUser(userId);

  if (!refreshed.success) {
    return {
      success: false,
      error: {
        code: "CHART_REFRESH_FAILED",
        message: refreshed.error.message,
      },
    };
  }

  return {
    success: true,
    data: {
      chart: refreshed.data,
      persistence: refreshed.persistence,
    },
  };
}

export async function retrieveOrRefreshBirthChartForUser(
  userId: string
): Promise<RetrieveOrRefreshBirthChartResult> {
  const saved = await getSavedBirthChartForUser(userId);

  if (saved.success && !saved.data.stale) {
    return {
      success: true,
      data: {
        chart: saved.data.chart,
        persistence: toPersistenceShape(saved.data.persisted),
        retrieval: {
          policy: "reused_saved_chart",
          staleDetected: false,
          staleReason: null,
        },
      },
    };
  }

  if (saved.success && saved.data.stale) {
    const refreshed = await refreshBirthChartForUser(userId);

    if (!refreshed.success) {
      return refreshed;
    }

    return {
      success: true,
      data: {
        chart: refreshed.data.chart,
        persistence: refreshed.data.persistence,
        retrieval: {
          policy: "refreshed_stale_chart",
          staleDetected: true,
          staleReason: saved.data.staleReason,
        },
      },
    };
  }

  if (!saved.success && saved.error.code === "SAVED_CHART_NOT_FOUND") {
    const rebuilt = await refreshBirthChartForUser(userId);

    if (!rebuilt.success) {
      return rebuilt;
    }

    return {
      success: true,
      data: {
        chart: rebuilt.data.chart,
        persistence: rebuilt.data.persistence,
        retrieval: {
          policy: "rebuilt_missing_saved_chart",
          staleDetected: false,
          staleReason: null,
        },
      },
    };
  }

  if (!saved.success) {
    return saved;
  }

  return {
    success: true,
    data: {
      chart: saved.data.chart,
      persistence: toPersistenceShape(saved.data.persisted),
      retrieval: {
        policy: "reused_saved_chart",
        staleDetected: saved.data.stale,
        staleReason: saved.data.staleReason,
      },
    },
  };
}
