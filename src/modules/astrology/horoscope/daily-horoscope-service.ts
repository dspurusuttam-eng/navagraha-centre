import "server-only";

import type { Prisma } from "@prisma/client";
import { captureException } from "@/lib/observability";
import { getPrisma } from "@/lib/prisma";
import {
  buildSiderealBirthChart,
  type SiderealBirthChart,
} from "@/lib/astrology/chart-builder";
import { validateAstronomyReadyBirthContext } from "@/lib/astrology/birth-context-validator";
import {
  buildBirthContextFromProfile,
  type BirthProfileRecord,
} from "@/modules/astrology/chart-contract";
import {
  buildDailyHoroscopeSnapshot,
  HOROSCOPE_CATEGORY_KEYS,
  type DailyHoroscopeSnapshot,
  type EvidenceToken,
  type HoroscopeCategoryKey,
} from "@/modules/astrology/horoscope";
import type { PanchangLocationInput } from "@/modules/panchang";

type StoredKundliRecord = BirthProfileRecord & {
  id: string;
  label: string;
  ascendantSign: string | null;
  moonSign: string | null;
  chartSummary: string | null;
};

export type DailyHoroscopeLocationInput = {
  displayName: string;
  latitude: number;
  longitude: number;
  timezoneIana: string;
  countryCode?: string | null;
  countryName?: string | null;
  region?: string | null;
  city?: string | null;
};

export type DailyHoroscopeCategoryView = {
  key: HoroscopeCategoryKey;
  label: string;
  status: "available" | "unavailable";
  ratingBand: DailyHoroscopeSnapshot["categories"][number]["ratingBand"];
  confidence: DailyHoroscopeSnapshot["categories"][number]["confidence"];
  supportiveEvidence: DailyHoroscopeEvidenceView[];
  cautionEvidence: DailyHoroscopeEvidenceView[];
  neutralEvidence: DailyHoroscopeEvidenceView[];
  contradictionFlags: string[];
  calculationReferences: string[];
  unavailableReason: string | null;
};

export type DailyHoroscopeEvidenceView = {
  ruleId: string;
  sourceSystem: EvidenceToken["sourceSystem"];
  tier: EvidenceToken["tier"];
  basis: string;
  frame: EvidenceToken["reference"]["frame"];
  referenceLabel: string;
  calculationReference: string;
};

export type DailyHoroscopeViewModel = {
  status: DailyHoroscopeSnapshot["status"];
  contractVersion: DailyHoroscopeSnapshot["contractVersion"];
  periodType: "DAILY";
  queryInstant: string | null;
  localDate: string;
  timezone: string | null;
  selectedKundli: {
    id: string;
    label: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    ascendantSign: string | null;
    moonSign: string | null;
    chartSummary: string | null;
  };
  calculationLocation: DailyHoroscopeLocationInput;
  generalDayQuality: DailyHoroscopeCategoryView | null;
  categories: DailyHoroscopeCategoryView[];
  timeWindows: DailyHoroscopeSnapshot["timeWindows"];
  dashaContext: DailyHoroscopeSnapshot["dashaContext"];
  sadeSati: DailyHoroscopeSnapshot["sadeSati"];
  sourceSystems: DailyHoroscopeSnapshot["sourceSystems"];
  confidence: DailyHoroscopeSnapshot["confidence"];
  unavailableReasons: DailyHoroscopeSnapshot["unavailableReasons"];
  calculationReferences: string[];
  flags: DailyHoroscopeSnapshot["flags"];
  conventions: DailyHoroscopeSnapshot["conventions"];
  disclaimer: string;
};

type DailyHoroscopeFailureCode =
  | "INVALID_REQUEST"
  | "KUNDLI_NOT_FOUND"
  | "MISSING_BIRTH_TIME"
  | "MISSING_LOCATION"
  | "INVALID_LOCATION"
  | "INVALID_BIRTH_CONTEXT"
  | "CHART_BUILD_FAILED"
  | "HOROSCOPE_UNAVAILABLE"
  | "HOROSCOPE_CALCULATION_FAILED";

export type DailyHoroscopeServiceResult =
  | {
      success: true;
      data: DailyHoroscopeViewModel;
    }
  | {
      success: false;
      error: {
        code: DailyHoroscopeFailureCode;
        message: string;
      };
      details?: unknown;
    };

type DailyHoroscopeServiceFailure = Extract<
  DailyHoroscopeServiceResult,
  { success: false }
>;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const categoryLabels: Record<HoroscopeCategoryKey, string> = {
  general_day_quality: "General day quality",
  career_work: "Career / work",
  finance_resources: "Finance / resources",
  relationships: "Relationships",
  health_routine: "Health / routine",
  study_planning: "Study / planning",
  travel_mobility: "Travel / mobility",
};

function toNumber(value: Prisma.Decimal | null) {
  return value === null ? null : Number(value);
}

function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function isValidLocation(location: DailyHoroscopeLocationInput) {
  return (
    location.displayName.trim().length > 0 &&
    Number.isFinite(location.latitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    Number.isFinite(location.longitude) &&
    location.longitude >= -180 &&
    location.longitude <= 180 &&
    isValidTimeZone(location.timezoneIana)
  );
}

function buildStoredLocation(record: StoredKundliRecord): DailyHoroscopeLocationInput | null {
  const latitude = toNumber(record.latitude);
  const longitude = toNumber(record.longitude);

  if (latitude === null || longitude === null) {
    return null;
  }

  return {
    displayName: [record.city, record.region, record.country]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(", "),
    latitude,
    longitude,
    timezoneIana: record.timezone,
    countryName: record.country,
    region: record.region,
    city: record.city,
  };
}

function toPanchangLocation(
  location: DailyHoroscopeLocationInput
): PanchangLocationInput {
  return {
    displayName: location.displayName,
    latitude: location.latitude,
    longitude: location.longitude,
    timezoneIana: location.timezoneIana,
    countryCode: location.countryCode ?? null,
    countryName: location.countryName ?? null,
    region: location.region ?? null,
    city: location.city ?? null,
  };
}

function buildReferenceLabel(reference: EvidenceToken["reference"]) {
  const parts = [
    reference.frame,
    reference.house ? `house ${reference.house}` : null,
    reference.sign !== undefined ? `sign ${reference.sign + 1}` : null,
    reference.planet ?? null,
  ].filter(Boolean);

  return parts.join(" / ");
}

function mapEvidence(token: EvidenceToken): DailyHoroscopeEvidenceView {
  return {
    ruleId: token.ruleId,
    sourceSystem: token.sourceSystem,
    tier: token.tier,
    basis: token.basis,
    frame: token.reference.frame,
    referenceLabel: buildReferenceLabel(token.reference),
    calculationReference: token.calculationReference,
  };
}

function mapCategory(
  category: DailyHoroscopeSnapshot["categories"][number]
): DailyHoroscopeCategoryView {
  return {
    key: category.category,
    label: categoryLabels[category.category],
    status: category.status,
    ratingBand: category.ratingBand,
    confidence: category.confidence,
    supportiveEvidence: category.supportiveEvidence.map(mapEvidence),
    cautionEvidence: category.cautionEvidence.map(mapEvidence),
    neutralEvidence: category.neutralEvidence.map(mapEvidence),
    contradictionFlags: category.contradictionFlags,
    calculationReferences: category.calculationReferences,
    unavailableReason: category.unavailableReason,
  };
}

function mapSnapshot(input: {
  record: StoredKundliRecord;
  location: DailyHoroscopeLocationInput;
  snapshot: DailyHoroscopeSnapshot;
}): DailyHoroscopeViewModel {
  const categories = HOROSCOPE_CATEGORY_KEYS.map((key) => {
    const category = input.snapshot.categories.find((item) => item.category === key);

    return category
      ? mapCategory(category)
      : {
          key,
          label: categoryLabels[key],
          status: "unavailable" as const,
          ratingBand: null,
          confidence: {
            completenessRatio: 0,
            ruleCoverageRatio: 0,
            contradictionPenalty: 0,
            value: 0,
            level: "insufficient" as const,
            missingCriticalSystems: [],
            unavailableLayers: [],
          },
          supportiveEvidence: [],
          cautionEvidence: [],
          neutralEvidence: [],
          contradictionFlags: [],
          calculationReferences: [],
          unavailableReason: "Category calculation was unavailable.",
        };
  });
  const generalDayQuality =
    categories.find((category) => category.key === "general_day_quality") ?? null;

  return {
    status: input.snapshot.status,
    contractVersion: input.snapshot.contractVersion,
    periodType: "DAILY",
    queryInstant: input.snapshot.queryInstant,
    localDate: input.snapshot.localDate,
    timezone: input.snapshot.timezone,
    selectedKundli: {
      id: input.record.id,
      label: input.record.label,
      birthDate: input.record.birthDate,
      birthTime: input.record.birthTime ?? "Not available",
      birthPlace: [input.record.city, input.record.region, input.record.country]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(", "),
      ascendantSign: input.record.ascendantSign,
      moonSign: input.record.moonSign,
      chartSummary: input.record.chartSummary,
    },
    calculationLocation: input.location,
    generalDayQuality,
    categories,
    timeWindows: input.snapshot.timeWindows,
    dashaContext: input.snapshot.dashaContext,
    sadeSati: input.snapshot.sadeSati,
    sourceSystems: input.snapshot.sourceSystems,
    confidence: input.snapshot.confidence,
    unavailableReasons: input.snapshot.unavailableReasons,
    calculationReferences: input.snapshot.calculationReferences,
    flags: input.snapshot.flags,
    conventions: input.snapshot.conventions,
    disclaimer: input.snapshot.disclaimer,
  };
}

function buildChartFromRecord(
  record: StoredKundliRecord
): DailyHoroscopeServiceFailure | {
  success: true;
  data: SiderealBirthChart;
} {
  const contextResult = buildBirthContextFromProfile(record);

  if (!contextResult.success) {
    return {
      success: false,
      error: {
        code: contextResult.error.code === "INVALID_BIRTH_CONTEXT"
          ? "INVALID_BIRTH_CONTEXT"
          : "HOROSCOPE_UNAVAILABLE",
        message: contextResult.error.message,
      },
      details: contextResult.details,
    };
  }

  const validation = validateAstronomyReadyBirthContext(contextResult.data);

  if (!validation.is_valid_for_chart) {
    return {
      success: false,
      error: {
        code: "INVALID_BIRTH_CONTEXT",
        message:
          "Saved birth context is not valid for daily horoscope calculation.",
      },
      details: validation,
    };
  }

  const chart = buildSiderealBirthChart(contextResult.data);

  if (!chart.success) {
    return {
      success: false,
      error: {
        code: "CHART_BUILD_FAILED",
        message: chart.issue.message,
      },
      details: chart.issue,
    };
  }

  return {
    success: true,
    data: chart.data,
  };
}

export async function buildDailyHoroscopeForSavedKundli(input: {
  userId: string;
  savedKundliId: string;
  localDate: string;
  calculationLocation?: DailyHoroscopeLocationInput | null;
}): Promise<DailyHoroscopeServiceResult> {
  if (!input.savedKundliId.trim() || !DATE_RE.test(input.localDate)) {
    return {
      success: false,
      error: {
        code: "INVALID_REQUEST",
        message: "Select a saved Kundli and a valid daily date.",
      },
    };
  }

  const record = await getPrisma().birthData.findFirst({
    where: {
      id: input.savedKundliId,
      userId: input.userId,
    },
    select: {
      id: true,
      label: true,
      birthDate: true,
      birthTime: true,
      timezone: true,
      city: true,
      region: true,
      country: true,
      latitude: true,
      longitude: true,
      ascendantSign: true,
      moonSign: true,
      chartSummary: true,
    },
  });

  if (!record) {
    return {
      success: false,
      error: {
        code: "KUNDLI_NOT_FOUND",
        message: "Saved Kundli was not found for this account.",
      },
    };
  }

  if (!record.birthTime) {
    return {
      success: false,
      error: {
        code: "MISSING_BIRTH_TIME",
        message:
          "Daily horoscope requires a saved Kundli with birth time for verified chart context.",
      },
    };
  }

  const storedLocation = buildStoredLocation(record);
  const calculationLocation = input.calculationLocation ?? storedLocation;

  if (!calculationLocation) {
    return {
      success: false,
      error: {
        code: "MISSING_LOCATION",
        message:
          "Saved Kundli is missing coordinates. Update the saved birth details before daily calculation.",
      },
    };
  }

  if (!isValidLocation(calculationLocation)) {
    return {
      success: false,
      error: {
        code: "INVALID_LOCATION",
        message:
          "Calculation location is invalid. Confirm place, coordinates, and timezone.",
      },
    };
  }

  const chart = buildChartFromRecord(record);

  if (!chart.success) {
    return chart;
  }

  try {
    const snapshot = await buildDailyHoroscopeSnapshot({
      chart: chart.data,
      localDate: input.localDate,
      location: toPanchangLocation(calculationLocation),
    });

    return {
      success: true,
      data: mapSnapshot({
        record,
        location: calculationLocation,
        snapshot,
      }),
    };
  } catch (error) {
    captureException(error, {
      area: "daily-horoscope",
      stage: "build-snapshot",
      userId: input.userId,
      savedKundliId: input.savedKundliId,
    });

    return {
      success: false,
      error: {
        code: "HOROSCOPE_CALCULATION_FAILED",
        message:
          "Daily horoscope calculation could not be completed. Please try again.",
      },
    };
  }
}
