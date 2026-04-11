import "server-only";

import { ChartStatus, ChartType, type Prisma } from "@prisma/client";
import { ensureUserProfile } from "@/modules/account/service";
import type { NatalChartResponse } from "@/modules/astrology";
import {
  getAstrologyService,
  getDefaultAstrologyProviderKey,
  type AstrologyProviderKey,
  type AstrologyService,
} from "@/modules/astrology/server";
import type { BirthDetails } from "@/modules/astrology/types";
import { getPrisma } from "@/lib/prisma";
import {
  defaultPreferredLanguage,
  getPreferredLanguageLabel,
  isPreferredLanguage,
  type PreferredLanguage,
} from "@/modules/onboarding/constants";

const primaryBirthLabel = "Primary Birth Profile";

type PersistedBirthProfile = {
  id: string;
  birthDate: string;
  birthTime: string | null;
  timezone: string;
  city: string;
  region: string | null;
  country: string;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
};

export type OnboardingDefaults = {
  name: string;
  preferredLanguage: PreferredLanguage;
  birthDate: string;
  birthTime: string;
  city: string;
  region: string;
  country: string;
  timezone: string;
  latitude: string;
  longitude: string;
};

export type OnboardingSnapshot = {
  defaults: OnboardingDefaults;
  status: {
    hasBirthProfile: boolean;
    hasChart: boolean;
    generatedAtUtc: string | null;
    providerKey: string | null;
    preferredLanguageLabel: string;
  };
};

export type ChartOverview = {
  preferredLanguage: string | null;
  preferredLanguageLabel: string;
  birthProfile: {
    label: string;
    birthDate: string;
    birthTime: string | null;
    timezone: string;
    city: string;
    region: string | null;
    country: string;
    latitude: number | null;
    longitude: number | null;
  } | null;
  chartRecord: {
    id: string;
    providerKey: string;
    calculationVersion: string | null;
    generatedAtUtc: string | null;
  } | null;
  chart: NatalChartResponse | null;
};

type SaveOnboardingInput = {
  userId: string;
  name: string;
  preferredLanguage: PreferredLanguage;
  birthDetails: BirthDetails;
  astrologyServiceOverride?: AstrologyService;
};

type SnapshotUserRecord = {
  name: string;
} | null;

type SnapshotBirthRecord = {
  birthDate: string;
  birthTime: string | null;
  city: string;
  region: string | null;
  country: string;
  timezone: string;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
} | null;

type SnapshotChartRecord = {
  providerKey: string;
  generatedAt: Date | null;
} | null;

function decimalToNumber(value: Prisma.Decimal | null) {
  return value === null ? null : Number(value);
}

function numberToInputValue(value: Prisma.Decimal | null) {
  return value === null ? "" : Number(value).toString();
}

function birthProfileToDetails(profile: PersistedBirthProfile): BirthDetails {
  return {
    dateLocal: profile.birthDate,
    timeLocal: profile.birthTime ?? "00:00",
    timezone: profile.timezone,
    place: {
      city: profile.city,
      region: profile.region ?? undefined,
      country: profile.country,
      latitude: decimalToNumber(profile.latitude),
      longitude: decimalToNumber(profile.longitude),
    },
  };
}

function serializeChartPayload(
  chart: NatalChartResponse
): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(chart)) as Prisma.InputJsonValue;
}

function parseStoredNatalChart(payload: Prisma.JsonValue | null) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const candidate = payload as { kind?: unknown };

  if (candidate.kind !== "NATAL") {
    return null;
  }

  return payload as unknown as NatalChartResponse;
}

function toPreferredLanguage(
  value: string | null | undefined
): PreferredLanguage {
  const candidate = value ?? "";

  return isPreferredLanguage(candidate) ? candidate : defaultPreferredLanguage;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "unknown-error";
}

function logOnboardingSnapshotIssue(
  userId: string,
  segment: string,
  error: unknown
) {
  console.error("[onboarding][snapshot] read failure", {
    routeKey: "dashboard:onboarding",
    userId,
    segment,
    error: getErrorMessage(error),
  });
}

function buildFallbackOnboardingSnapshot(input: {
  userName?: string | null;
  preferredLanguage?: string | null;
  primaryBirthProfile?: SnapshotBirthRecord;
  latestNatalChart?: SnapshotChartRecord;
}): OnboardingSnapshot {
  const preferredLanguage = toPreferredLanguage(input.preferredLanguage);

  return {
    defaults: {
      name: input.userName ?? "Member",
      preferredLanguage,
      birthDate: input.primaryBirthProfile?.birthDate ?? "",
      birthTime: input.primaryBirthProfile?.birthTime ?? "",
      city: input.primaryBirthProfile?.city ?? "",
      region: input.primaryBirthProfile?.region ?? "",
      country: input.primaryBirthProfile?.country ?? "",
      timezone: input.primaryBirthProfile?.timezone ?? "",
      latitude: numberToInputValue(input.primaryBirthProfile?.latitude ?? null),
      longitude: numberToInputValue(
        input.primaryBirthProfile?.longitude ?? null
      ),
    },
    status: {
      hasBirthProfile: Boolean(input.primaryBirthProfile),
      hasChart: Boolean(input.latestNatalChart),
      generatedAtUtc: input.latestNatalChart?.generatedAt?.toISOString() ?? null,
      providerKey: input.latestNatalChart?.providerKey ?? null,
      preferredLanguageLabel: getPreferredLanguageLabel(preferredLanguage),
    },
  };
}

function resolveProviderKey(birthDetails: BirthDetails): AstrologyProviderKey {
  const defaultProvider = getDefaultAstrologyProviderKey();
  const hasCoordinates =
    birthDetails.place.latitude !== null &&
    birthDetails.place.latitude !== undefined &&
    birthDetails.place.longitude !== null &&
    birthDetails.place.longitude !== undefined;

  if (
    (defaultProvider === "circular-natal-real" ||
      defaultProvider === "swisseph-vedic") &&
    !hasCoordinates
  ) {
    return "mock-deterministic";
  }

  return defaultProvider;
}

export async function getOnboardingSnapshot(
  userId: string
): Promise<OnboardingSnapshot> {
  const prisma = getPrisma();
  const [profileResult, userResult, primaryBirthProfileResult, latestChartResult] =
    await Promise.allSettled([
      ensureUserProfile(userId),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      }),
      prisma.birthData.findFirst({
        where: { userId, isPrimary: true },
        orderBy: [{ updatedAt: "desc" }],
      }),
      prisma.chart.findFirst({
        where: {
          userId,
          type: ChartType.NATAL,
          status: ChartStatus.READY,
        },
        orderBy: [{ generatedAt: "desc" }, { updatedAt: "desc" }],
        select: {
          providerKey: true,
          generatedAt: true,
        },
      }),
    ]);

  if (profileResult.status === "rejected") {
    logOnboardingSnapshotIssue(userId, "profile", profileResult.reason);
  }

  if (userResult.status === "rejected") {
    logOnboardingSnapshotIssue(userId, "user", userResult.reason);
  }

  if (primaryBirthProfileResult.status === "rejected") {
    logOnboardingSnapshotIssue(
      userId,
      "birth-data",
      primaryBirthProfileResult.reason
    );
  }

  if (latestChartResult.status === "rejected") {
    logOnboardingSnapshotIssue(userId, "chart", latestChartResult.reason);
  }

  const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
  const user = userResult.status === "fulfilled" ? userResult.value : null;
  const primaryBirthProfile =
    primaryBirthProfileResult.status === "fulfilled"
      ? primaryBirthProfileResult.value
      : null;
  const latestNatalChart =
    latestChartResult.status === "fulfilled" ? latestChartResult.value : null;

  if (!user) {
    return buildFallbackOnboardingSnapshot({
      userName: null,
      preferredLanguage: profile?.preferredLanguage,
      primaryBirthProfile,
      latestNatalChart,
    });
  }

  const preferredLanguage = toPreferredLanguage(profile?.preferredLanguage);

  return {
    defaults: {
      name: user.name,
      preferredLanguage,
      birthDate: primaryBirthProfile?.birthDate ?? "",
      birthTime: primaryBirthProfile?.birthTime ?? "",
      city: primaryBirthProfile?.city ?? profile?.city ?? "",
      region: primaryBirthProfile?.region ?? profile?.region ?? "",
      country: primaryBirthProfile?.country ?? profile?.country ?? "",
      timezone: primaryBirthProfile?.timezone ?? profile?.timezone ?? "",
      latitude: numberToInputValue(
        primaryBirthProfile?.latitude ?? profile?.latitude ?? null
      ),
      longitude: numberToInputValue(
        primaryBirthProfile?.longitude ?? profile?.longitude ?? null
      ),
    },
    status: {
      hasBirthProfile: Boolean(primaryBirthProfile),
      hasChart: Boolean(latestNatalChart),
      generatedAtUtc: latestNatalChart?.generatedAt?.toISOString() ?? null,
      providerKey: latestNatalChart?.providerKey ?? null,
      preferredLanguageLabel: getPreferredLanguageLabel(preferredLanguage),
    },
  };
}

export async function saveOnboardingAndGenerateChart({
  userId,
  name,
  preferredLanguage,
  birthDetails,
  astrologyServiceOverride,
}: SaveOnboardingInput) {
  const prisma = getPrisma();

  const birthProfile = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { name },
    });

    await tx.profile.upsert({
      where: { userId },
      update: {
        preferredLanguage,
        dob: birthDetails.dateLocal,
        tob: birthDetails.timeLocal,
        city: birthDetails.place.city,
        region: birthDetails.place.region ?? null,
        country: birthDetails.place.country,
        timezone: birthDetails.timezone,
        latitude: birthDetails.place.latitude ?? null,
        longitude: birthDetails.place.longitude ?? null,
      },
      create: {
        userId,
        preferredLanguage,
        dob: birthDetails.dateLocal,
        tob: birthDetails.timeLocal,
        city: birthDetails.place.city,
        region: birthDetails.place.region ?? null,
        country: birthDetails.place.country,
        timezone: birthDetails.timezone,
        latitude: birthDetails.place.latitude ?? null,
        longitude: birthDetails.place.longitude ?? null,
      },
    });

    const existingPrimary = await tx.birthData.findFirst({
      where: { userId, isPrimary: true },
      orderBy: [{ updatedAt: "desc" }],
      select: { id: true },
    });

    await tx.birthData.updateMany({
      where: { userId },
      data: { isPrimary: false },
    });

    const birthProfileData = {
      label: primaryBirthLabel,
      birthDate: birthDetails.dateLocal,
      birthTime: birthDetails.timeLocal,
      timezone: birthDetails.timezone,
      city: birthDetails.place.city,
      region: birthDetails.place.region ?? null,
      country: birthDetails.place.country,
      latitude: birthDetails.place.latitude ?? null,
      longitude: birthDetails.place.longitude ?? null,
      isPrimary: true,
    };

    if (existingPrimary) {
      return tx.birthData.update({
        where: { id: existingPrimary.id },
        data: birthProfileData,
      });
    }

    return tx.birthData.create({
      data: {
        userId,
        ...birthProfileData,
      },
    });
  });

  const providerKey = resolveProviderKey(birthProfileToDetails(birthProfile));
  const astrologyService =
    astrologyServiceOverride ?? getAstrologyService(providerKey);
  const chart = await astrologyService.getNatalChart({
    kind: "NATAL",
    requestId: crypto.randomUUID(),
    subjectId: userId,
    locale: preferredLanguage,
    birthDetails: birthProfileToDetails(birthProfile),
    requestedDivisionalCharts: [],
  });

  const chartRecord = await prisma.$transaction(async (tx) => {
    const existingChart = await tx.chart.findFirst({
      where: {
        userId,
        type: ChartType.NATAL,
      },
      orderBy: [{ generatedAt: "desc" }, { updatedAt: "desc" }],
      select: { id: true },
    });

    const chartData = {
      birthDataId: birthProfile.id,
      type: ChartType.NATAL,
      status: ChartStatus.READY,
      providerKey: chart.metadata.providerKey,
      calculationVersion: chart.metadata.fixtureKey,
      chartPayload: serializeChartPayload(chart),
      generatedAt: new Date(chart.metadata.generatedAtUtc),
    };

    if (existingChart) {
      const updatedChart = await tx.chart.update({
        where: { id: existingChart.id },
        data: chartData,
        select: { id: true },
      });

      await tx.profile.update({
        where: { userId },
        data: {
          chartData: serializeChartPayload(chart),
        },
      });

      return updatedChart;
    }

    const createdChart = await tx.chart.create({
      data: {
        userId,
        ...chartData,
      },
      select: { id: true },
    });

    await tx.profile.update({
      where: { userId },
      data: {
        chartData: serializeChartPayload(chart),
      },
    });

    return createdChart;
  });

  return {
    chartId: chartRecord.id,
    providerKey: chart.metadata.providerKey,
  };
}

export async function getChartOverview(userId: string): Promise<ChartOverview> {
  const prisma = getPrisma();
  const profile = await ensureUserProfile(userId);
  const [primaryBirthProfile, latestNatalChart] = await Promise.all([
    prisma.birthData.findFirst({
      where: { userId, isPrimary: true },
      orderBy: [{ updatedAt: "desc" }],
    }),
    prisma.chart.findFirst({
      where: {
        userId,
        type: ChartType.NATAL,
        status: ChartStatus.READY,
      },
      orderBy: [{ generatedAt: "desc" }, { updatedAt: "desc" }],
    }),
  ]);

  return {
    preferredLanguage: profile.preferredLanguage,
    preferredLanguageLabel: getPreferredLanguageLabel(
      profile.preferredLanguage
    ),
    birthProfile: primaryBirthProfile
      ? {
          label: primaryBirthProfile.label,
          birthDate: primaryBirthProfile.birthDate,
          birthTime: primaryBirthProfile.birthTime,
          timezone: primaryBirthProfile.timezone,
          city: primaryBirthProfile.city,
          region: primaryBirthProfile.region,
          country: primaryBirthProfile.country,
          latitude: decimalToNumber(primaryBirthProfile.latitude),
          longitude: decimalToNumber(primaryBirthProfile.longitude),
        }
      : null,
    chartRecord: latestNatalChart
      ? {
          id: latestNatalChart.id,
          providerKey: latestNatalChart.providerKey,
          calculationVersion: latestNatalChart.calculationVersion,
          generatedAtUtc: latestNatalChart.generatedAt?.toISOString() ?? null,
        }
      : null,
    chart: parseStoredNatalChart(latestNatalChart?.chartPayload ?? null),
  };
}
