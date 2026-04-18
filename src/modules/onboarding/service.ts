import "server-only";

import { ChartStatus, ChartType, type Prisma } from "@prisma/client";
import {
  nakshatraCatalog,
  nakshatraSpanDegrees,
  signRulerMap,
  zodiacSignLabelMap,
} from "@/lib/astrology/constants";
import { ensureUserProfile } from "@/modules/account/service";
import type { SiderealBirthChart } from "@/lib/astrology/chart-builder";
import {
  getAstrologyService,
  getDefaultAstrologyProviderKey,
  type AstrologyProviderKey,
  type AstrologyService,
} from "@/modules/astrology/server";
import {
  retrieveOrRefreshBirthChartForUser,
  type RetrieveOrRefreshBirthChartResult,
} from "@/modules/astrology/chart-retrieval";
import type {
  BirthDetails,
  HouseNumber,
  NakshatraName,
  NatalChartResponse,
  PlanetaryBody,
  ZodiacSign,
} from "@/modules/astrology/types";
import { getPrisma } from "@/lib/prisma";
import { trackChartCreated } from "@/modules/conversion/events";
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

export type GetChartOverviewOptions = {
  preloadedSavedChartResult?: RetrieveOrRefreshBirthChartResult;
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

type BirthProfileForChartAdapter = {
  birthDate: string;
  birthTime: string | null;
  timezone: string;
  city: string;
  region: string | null;
  country: string;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
};

const planetNameToBodyMap: Record<string, PlanetaryBody> = {
  sun: "SUN",
  moon: "MOON",
  mars: "MARS",
  mercury: "MERCURY",
  jupiter: "JUPITER",
  venus: "VENUS",
  saturn: "SATURN",
  rahu: "RAHU",
  ketu: "KETU",
};

const dominantHouseWeights: Record<HouseNumber, number> = {
  1: 12,
  2: 5,
  3: 4,
  4: 7,
  5: 8,
  6: 3,
  7: 10,
  8: 2,
  9: 8,
  10: 11,
  11: 6,
  12: 2,
};

const zodiacLabelToEnumMap = new Map<Lowercase<string>, ZodiacSign>(
  Object.entries(zodiacSignLabelMap).map(([key, label]) => [
    label.toLowerCase() as Lowercase<string>,
    key as ZodiacSign,
  ])
);

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

function normalizeLongitude(longitude: number) {
  const normalized = longitude % 360;

  return normalized < 0 ? normalized + 360 : normalized;
}

function toHouseNumber(value: number): HouseNumber {
  const safeValue = Math.max(1, Math.min(12, Math.round(value)));

  return safeValue as HouseNumber;
}

function toSignEnum(value: string): ZodiacSign {
  const normalized = value.trim().toLowerCase() as Lowercase<string>;

  return zodiacLabelToEnumMap.get(normalized) ?? "ARIES";
}

function toPlanetaryBody(value: string): PlanetaryBody {
  const normalized = value.trim().toLowerCase();

  return planetNameToBodyMap[normalized] ?? "SUN";
}

function toDegreeMinute(longitude: number) {
  const normalized = normalizeLongitude(longitude);
  const degreeFloat = normalized % 30;
  let degree = Math.floor(degreeFloat);
  let minute = Math.round((degreeFloat - degree) * 60);

  if (minute === 60) {
    minute = 0;
    degree += 1;
  }

  if (degree >= 30) {
    degree = 29;
    minute = 59;
  }

  return {
    degree,
    minute,
    degreeInSign: Number(degreeFloat.toFixed(6)),
  };
}

function toNakshatraPlacement(longitude: number) {
  const normalized = normalizeLongitude(longitude);
  const nakshatraIndex = Math.floor(normalized / nakshatraSpanDegrees);
  const safeIndex = Math.min(nakshatraCatalog.length - 1, Math.max(0, nakshatraIndex));
  const degreesIntoNakshatra = Number(
    (normalized - safeIndex * nakshatraSpanDegrees).toFixed(6)
  );
  const pada = Math.min(
    4,
    Math.max(1, Math.floor(degreesIntoNakshatra / (nakshatraSpanDegrees / 4)) + 1)
  ) as 1 | 2 | 3 | 4;
  const nakshatra = nakshatraCatalog[safeIndex] ?? nakshatraCatalog[0];

  return {
    name: nakshatra.name as NakshatraName,
    pada,
    ruler: nakshatra.ruler,
    degreesIntoNakshatra,
  };
}

function deriveDominantBodies(
  planets: Array<{ body: PlanetaryBody; house: HouseNumber; retrograde: boolean }>
) {
  return planets
    .map((planet) => {
      const houseWeight = dominantHouseWeights[planet.house] ?? 1;
      const retrogradeBonus = planet.retrograde ? 0.25 : 0;

      return {
        body: planet.body,
        weight: houseWeight + retrogradeBonus,
      };
    })
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 3)
    .map((entry) => entry.body);
}

function toBirthDetailsFromProfile(
  profile: BirthProfileForChartAdapter | null,
  fallback: SiderealBirthChart["birth_context"]
): BirthDetails {
  if (!profile) {
    return {
      dateLocal: fallback.date_local,
      timeLocal: fallback.time_local,
      timezone: fallback.timezone,
      place: {
        city: fallback.place.split(",")[0]?.trim() ?? fallback.place,
        country: fallback.place.split(",").at(-1)?.trim() ?? "Unknown",
        latitude: fallback.latitude,
        longitude: fallback.longitude,
      },
    };
  }

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

function buildNatalCompatibilityChart(input: {
  siderealChart: SiderealBirthChart;
  profileBirthData: BirthProfileForChartAdapter | null;
  generatedAtUtc: string;
  requestId: string;
}): NatalChartResponse {
  const birthDetails = toBirthDetailsFromProfile(
    input.profileBirthData,
    input.siderealChart.birth_context
  );
  const lagnaSign = toSignEnum(input.siderealChart.lagna.sign);
  const lagnaPlacement = toNakshatraPlacement(input.siderealChart.lagna.longitude);
  const houses = input.siderealChart.houses.map((house) => {
    const sign = toSignEnum(house.sign);

    return {
      house: toHouseNumber(house.house),
      sign,
      ruler: signRulerMap[sign],
    };
  });
  const planets = input.siderealChart.planets.map((planet) => {
    const body = toPlanetaryBody(planet.name);
    const sign = toSignEnum(planet.sign);
    const degrees = toDegreeMinute(planet.longitude);
    const house = toHouseNumber(planet.house);
    const nakshatra = toNakshatraPlacement(planet.longitude);

    return {
      body,
      sign,
      longitude: Number(normalizeLongitude(planet.longitude).toFixed(6)),
      degree: degrees.degree,
      minute: degrees.minute,
      house,
      retrograde: planet.is_retrograde,
      speed: planet.is_retrograde ? -0.001 : 0.001,
      nakshatra,
    };
  });
  const dominantBodies = deriveDominantBodies(
    planets.map((planet) => ({
      body: planet.body,
      house: planet.house,
      retrograde: planet.retrograde,
    }))
  );
  const challengingPlanets = planets
    .filter((planet) => [6, 8, 12].includes(planet.house))
    .map((planet) => planet.body);
  const challengingHouses = houses
    .map((house) => house.house)
    .filter((house): house is HouseNumber => [6, 8, 12].includes(house));

  return {
    kind: "NATAL",
    metadata: {
      providerKey: "swisseph-sidereal-saved",
      fixtureKey: input.siderealChart.verification.verification_status,
      requestId: input.requestId,
      generatedAtUtc: input.generatedAtUtc,
      deterministic: true,
      disclaimer:
        "This chart view is generated from the persisted sidereal chart pipeline. Interpretive guidance remains advisory.",
    },
    birthDetails,
    houseSystem: "WHOLE_SIGN",
    ascendantSign: lagnaSign,
    lagna: {
      sign: lagnaSign,
      longitude: Number(normalizeLongitude(input.siderealChart.lagna.longitude).toFixed(6)),
      degree: toDegreeMinute(input.siderealChart.lagna.longitude).degree,
      minute: toDegreeMinute(input.siderealChart.lagna.longitude).minute,
      nakshatra: lagnaPlacement,
    },
    planets,
    houses,
    aspects: [],
    divisionalCharts: [],
    remedySignals: [],
    nakshatras: planets.map((planet) => ({
      body: planet.body,
      placement: planet.nakshatra!,
    })),
    summary: {
      dominantBodies,
      narrative:
        "Saved sidereal chart data is in use. Continue with chart, report, and consultation surfaces for grounded interpretation.",
      strongestPlanets: dominantBodies,
      challengingPlanets,
      challengingHouses,
    },
  };
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

  trackChartCreated({
    userId,
    source: "onboarding-save",
    providerKey: chart.metadata.providerKey,
    metadata: {
      chartId: chartRecord.id,
      preferredLanguage,
    },
  });

  return {
    chartId: chartRecord.id,
    providerKey: chart.metadata.providerKey,
  };
}

export async function getChartOverview(
  userId: string,
  options: GetChartOverviewOptions = {}
): Promise<ChartOverview> {
  const prisma = getPrisma();
  const profile = await ensureUserProfile(userId);
  const [primaryBirthProfile, latestNatalChart, savedChartResult] = await Promise.all([
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
    options.preloadedSavedChartResult
      ? Promise.resolve(options.preloadedSavedChartResult)
      : retrieveOrRefreshBirthChartForUser(userId),
  ]);
  const legacyChart = parseStoredNatalChart(latestNatalChart?.chartPayload ?? null);
  const compatibilityChart =
    savedChartResult.success && savedChartResult.data.chart
      ? buildNatalCompatibilityChart({
          siderealChart: savedChartResult.data.chart,
          profileBirthData: primaryBirthProfile,
          generatedAtUtc:
            savedChartResult.data.persistence.updatedAtUtc ??
            new Date().toISOString(),
          requestId:
            latestNatalChart?.id ??
            `saved-${savedChartResult.data.persistence.fingerprint.slice(0, 16)}`,
        })
      : null;
  const chart = compatibilityChart ?? legacyChart;

  if (!savedChartResult.success && savedChartResult.error.code !== "SAVED_CHART_NOT_FOUND") {
    console.warn("[onboarding][chart-overview] saved chart retrieval fallback", {
      userId,
      code: savedChartResult.error.code,
    });
  }

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
    chartRecord: chart
      ? {
          id:
            latestNatalChart?.id ??
            (savedChartResult.success
              ? `saved-${savedChartResult.data.persistence.fingerprint.slice(0, 16)}`
              : "saved-chart"),
          providerKey:
            latestNatalChart?.providerKey ??
            (savedChartResult.success
              ? "swisseph-sidereal-saved"
              : "deterministic-placeholder"),
          calculationVersion:
            latestNatalChart?.calculationVersion ??
            (savedChartResult.success
              ? savedChartResult.data.persistence.fingerprint
              : null),
          generatedAtUtc:
            latestNatalChart?.generatedAt?.toISOString() ??
            (savedChartResult.success
              ? savedChartResult.data.persistence.updatedAtUtc
              : null),
        }
      : null,
    chart,
  };
}
