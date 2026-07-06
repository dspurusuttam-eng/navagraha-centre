import "server-only";

import { getPrisma } from "@/lib/prisma";
import { captureException } from "@/lib/observability";
import { normalizeBirthContextInput } from "@/lib/astrology/birth-input-normalizer";
import {
  resolveAstronomyReadyBirthContext,
  type AstronomyReadyBirthContext,
} from "@/lib/astrology/birth-context-engine";
import { validateBirthContextResolutionResult } from "@/lib/astrology/birth-context-validator";
import { buildSiderealBirthChart } from "@/lib/astrology/chart-builder";
import { getUserPlanModel, type UserPlanType } from "@/modules/subscriptions/user-plan";
import {
  invalidSavedKundliInput,
  parseManualPlaceText,
  savedKundliBirthInputFieldKeys,
  savedKundliFailure,
  validateSavedKundliWriteInput,
  type SavedKundliServiceResult,
} from "@/modules/account/saved-kundli-validation";

export {
  savedKundliErrorStatus,
  type SavedKundliErrorCode,
  type SavedKundliServiceFailure,
  type SavedKundliServiceResult,
} from "@/modules/account/saved-kundli-validation";

export type SavedKundliRecordDto = {
  id: string;
  label: string;
  gender: string | null;
  dateOfBirth: string;
  timeOfBirth: string | null;
  birthPlace: string;
  city: string;
  region: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  ascendantSign: string | null;
  moonSign: string | null;
  chartSummary: string | null;
  isDefault: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SavedKundliLimits = {
  used: number;
  max: number;
  planType: UserPlanType;
};

export type SavedKundliCatalogDto = {
  records: SavedKundliRecordDto[];
  activeRecordId: string | null;
  limits: SavedKundliLimits;
};

type ResolvedBirthFields = {
  birthDate: string;
  birthTime: string | null;
  timezone: string;
  city: string;
  region: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  ascendantSign: string | null;
  moonSign: string | null;
  chartSummary: string | null;
};

function readPositiveInt(key: string, fallback: number) {
  const value = Number(process.env[key]?.trim() ?? "");

  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.floor(value);
}

function getSavedKundliPlanLimit(planType: UserPlanType) {
  switch (planType) {
    case "PRO":
      return readPositiveInt("SAVED_KUNDLI_LIMIT_PRO", 25);
    case "PREMIUM":
      return readPositiveInt("SAVED_KUNDLI_LIMIT_PREMIUM", 10);
    default:
      return readPositiveInt("SAVED_KUNDLI_LIMIT_FREE", 3);
  }
}

function buildChartSummaryFields(
  context: AstronomyReadyBirthContext
): Pick<ResolvedBirthFields, "ascendantSign" | "moonSign" | "chartSummary"> {
  const empty = {
    ascendantSign: null,
    moonSign: null,
    chartSummary: null,
  };

  try {
    const chart = buildSiderealBirthChart(context);

    if (!chart.success) {
      return empty;
    }

    const moon = chart.data.planets.find((planet) => planet.name === "Moon");
    const ascendantSign = chart.data.lagna.sign ?? null;
    const moonSign = moon?.sign ?? null;
    const moonNakshatra = moon?.nakshatra ?? null;
    const summaryParts = [
      ascendantSign ? `Lagna ${ascendantSign}` : null,
      moonSign
        ? `Moon ${moonSign}${moonNakshatra ? ` (${moonNakshatra})` : ""}`
        : null,
    ].filter(Boolean);

    return {
      ascendantSign,
      moonSign,
      chartSummary: summaryParts.length > 0 ? summaryParts.join(" | ") : null,
    };
  } catch (error) {
    captureException(error, {
      area: "saved-kundli",
      stage: "chart-summary",
    });

    return empty;
  }
}

async function resolveBirthFields(input: {
  dateOfBirth: string;
  timeOfBirth: string | null;
  birthPlace: string;
  manualLatitude: number | null;
  manualLongitude: number | null;
  manualTimezone: string | null;
}): Promise<SavedKundliServiceResult<ResolvedBirthFields>> {
  const hasManualContext =
    input.manualLatitude !== null &&
    input.manualLongitude !== null &&
    Boolean(input.manualTimezone);
  // The noon placeholder only satisfies the resolver's UTC conversion for
  // timezone lookup; the stored birthTime stays null when time is unknown.
  const timeForResolution = input.timeOfBirth ?? "12:00";
  const normalized = normalizeBirthContextInput({
    dateLocalInput: input.dateOfBirth,
    timeLocalInput: timeForResolution,
    placeTextInput: input.birthPlace,
  });

  if (!normalized.success) {
    return invalidSavedKundliInput({
      birthInput:
        normalized.issues[0]?.message ?? "Birth input normalization failed.",
    });
  }

  if (hasManualContext) {
    const parsedPlace = parseManualPlaceText(input.birthPlace);

    if (!parsedPlace) {
      return invalidSavedKundliInput({
        birthPlace: "Birth place text could not be parsed.",
      });
    }

    return {
      success: true,
      data: {
        birthDate: normalized.data.date_local_normalized,
        birthTime: input.timeOfBirth,
        timezone: input.manualTimezone as string,
        city: parsedPlace.city,
        region: parsedPlace.region,
        country: parsedPlace.country,
        latitude: input.manualLatitude,
        longitude: input.manualLongitude,
        ascendantSign: null,
        moonSign: null,
        chartSummary: null,
      },
    };
  }

  const resolved = await resolveAstronomyReadyBirthContext(normalized.data).catch(
    (error) => {
      captureException(error, {
        area: "saved-kundli",
        stage: "resolve-birth-context",
      });

      return null;
    }
  );

  if (!resolved || !resolved.success) {
    return savedKundliFailure(
      "GEOCODING_FAILED",
      "Birthplace could not be resolved automatically. Add a clearer city, region, and country, or provide manual latitude, longitude, and timezone together."
    );
  }

  const validation = validateBirthContextResolutionResult(resolved);

  if (!validation.is_valid_for_chart) {
    return invalidSavedKundliInput({
      birthInput:
        validation.warnings[0]?.message ??
        "Resolved birth context is not valid for chart use.",
    });
  }

  const place = resolved.data.normalized_place;
  const summaryFields = input.timeOfBirth
    ? buildChartSummaryFields(resolved.data)
    : { ascendantSign: null, moonSign: null, chartSummary: null };

  return {
    success: true,
    data: {
      birthDate: normalized.data.date_local_normalized,
      birthTime: input.timeOfBirth,
      timezone: resolved.data.timezone.iana,
      city: place.city ?? input.birthPlace,
      region: place.region,
      country: place.country_name || place.country_code,
      latitude: place.latitude,
      longitude: place.longitude,
      ...summaryFields,
    },
  };
}

type BirthDataRecord = {
  id: string;
  label: string;
  gender: string | null;
  birthDate: string;
  birthTime: string | null;
  timezone: string;
  city: string;
  region: string | null;
  country: string;
  latitude: unknown;
  longitude: unknown;
  isPrimary: boolean;
  notes: string | null;
  ascendantSign: string | null;
  moonSign: string | null;
  chartSummary: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toCoordinateNumber(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function toSavedKundliRecordDto(record: BirthDataRecord): SavedKundliRecordDto {
  const birthPlace = [record.city, record.region, record.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");

  return {
    id: record.id,
    label: record.label,
    gender: record.gender,
    dateOfBirth: record.birthDate,
    timeOfBirth: record.birthTime,
    birthPlace,
    city: record.city,
    region: record.region,
    country: record.country,
    latitude: toCoordinateNumber(record.latitude),
    longitude: toCoordinateNumber(record.longitude),
    timezone: record.timezone,
    ascendantSign: record.ascendantSign,
    moonSign: record.moonSign,
    chartSummary: record.chartSummary,
    isDefault: record.isPrimary,
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function getLimitsForUser(userId: string): Promise<SavedKundliLimits> {
  const [plan, used] = await Promise.all([
    getUserPlanModel(userId),
    getPrisma().birthData.count({ where: { userId } }),
  ]);

  return {
    used,
    max: getSavedKundliPlanLimit(plan.plan_type),
    planType: plan.plan_type,
  };
}

export async function listSavedKundliRecords(
  userId: string
): Promise<SavedKundliServiceResult<SavedKundliCatalogDto>> {
  const prisma = getPrisma();
  const [records, limits] = await Promise.all([
    prisma.birthData.findMany({
      where: { userId },
      orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    }),
    getLimitsForUser(userId),
  ]);
  const dtos = records.map((record) => toSavedKundliRecordDto(record));

  return {
    success: true,
    data: {
      records: dtos,
      activeRecordId: dtos.find((record) => record.isDefault)?.id ?? null,
      limits,
    },
  };
}

export async function createSavedKundliRecord(
  userId: string,
  payload: Record<string, unknown>
): Promise<
  SavedKundliServiceResult<{
    record: SavedKundliRecordDto;
    limits: SavedKundliLimits;
  }>
> {
  const validated = validateSavedKundliWriteInput(payload, "create");

  if (!validated.success) {
    return validated;
  }

  const input = validated.data;
  const limits = await getLimitsForUser(userId);

  if (limits.used >= limits.max) {
    return savedKundliFailure(
      "LIMIT_REACHED",
      "Saved kundli limit reached for the current plan.",
      { used: limits.used, max: limits.max, planType: limits.planType }
    );
  }

  const resolvedFields = await resolveBirthFields({
    dateOfBirth: input.dateOfBirth as string,
    timeOfBirth: input.timeOfBirth ?? null,
    birthPlace: input.birthPlace as string,
    manualLatitude: input.latitude ?? null,
    manualLongitude: input.longitude ?? null,
    manualTimezone: input.timezone ?? null,
  });

  if (!resolvedFields.success) {
    return resolvedFields;
  }

  const prisma = getPrisma();
  const created = await prisma.$transaction(async (tx) => {
    const used = await tx.birthData.count({ where: { userId } });

    if (used >= limits.max) {
      return null;
    }

    return tx.birthData.create({
      data: {
        userId,
        label: input.label as string,
        gender: input.gender ?? null,
        notes: input.notes ?? null,
        isPrimary: false,
        ...resolvedFields.data,
      },
    });
  });

  if (!created) {
    return savedKundliFailure(
      "LIMIT_REACHED",
      "Saved kundli limit reached for the current plan.",
      { used: limits.used, max: limits.max, planType: limits.planType }
    );
  }

  return {
    success: true,
    data: {
      record: toSavedKundliRecordDto(created),
      limits: {
        ...limits,
        used: limits.used + 1,
      },
    },
  };
}

export async function updateSavedKundliRecord(
  userId: string,
  recordId: string,
  payload: Record<string, unknown>
): Promise<SavedKundliServiceResult<{ record: SavedKundliRecordDto }>> {
  const validated = validateSavedKundliWriteInput(payload, "update");

  if (!validated.success) {
    return validated;
  }

  const input = validated.data;
  const providedKeys = Object.keys(input);

  if (providedKeys.length === 0) {
    return savedKundliFailure(
      "EMPTY_UPDATE",
      "At least one saved kundli field must be provided for update."
    );
  }

  const prisma = getPrisma();
  const existing = await prisma.birthData.findFirst({
    where: { id: recordId, userId },
  });

  if (!existing) {
    return savedKundliFailure(
      "NOT_FOUND",
      "Saved kundli record could not be found."
    );
  }

  const touchesBirthInput = savedKundliBirthInputFieldKeys.some(
    (key) => key in input
  );

  if (existing.isPrimary && touchesBirthInput) {
    return savedKundliFailure(
      "PRIMARY_EDIT_VIA_ONBOARDING",
      "Birth details of the primary birth profile can only be changed through onboarding."
    );
  }

  const baseUpdate: Record<string, unknown> = {};

  if (input.label !== undefined) {
    baseUpdate.label = input.label;
  }

  if (input.gender !== undefined) {
    baseUpdate.gender = input.gender;
  }

  if (input.notes !== undefined) {
    baseUpdate.notes = input.notes;
  }

  if (touchesBirthInput) {
    const manualTouched =
      input.latitude !== undefined ||
      input.longitude !== undefined ||
      input.timezone !== undefined;
    const existingLatitude = toCoordinateNumber(existing.latitude);
    const existingLongitude = toCoordinateNumber(existing.longitude);
    const resolvedFields = await resolveBirthFields({
      dateOfBirth: input.dateOfBirth ?? existing.birthDate,
      timeOfBirth:
        input.timeOfBirth !== undefined ? input.timeOfBirth : existing.birthTime,
      birthPlace:
        input.birthPlace ??
        [existing.city, existing.region, existing.country]
          .map((part) => part?.trim())
          .filter(Boolean)
          .join(", "),
      manualLatitude:
        input.latitude !== undefined
          ? input.latitude
          : manualTouched
            ? null
            : existingLatitude,
      manualLongitude:
        input.longitude !== undefined
          ? input.longitude
          : manualTouched
            ? null
            : existingLongitude,
      manualTimezone: input.timezone !== undefined ? input.timezone : null,
    });

    if (!resolvedFields.success) {
      return resolvedFields;
    }

    Object.assign(baseUpdate, resolvedFields.data);
  }

  const updated = await prisma.birthData.update({
    where: { id: existing.id },
    data: baseUpdate,
  });

  return {
    success: true,
    data: {
      record: toSavedKundliRecordDto(updated),
    },
  };
}

export async function deleteSavedKundliRecord(
  userId: string,
  recordId: string
): Promise<SavedKundliServiceResult<{ id: string }>> {
  const prisma = getPrisma();
  const existing = await prisma.birthData.findFirst({
    where: { id: recordId, userId },
    select: { id: true, isPrimary: true },
  });

  if (!existing) {
    return savedKundliFailure(
      "NOT_FOUND",
      "Saved kundli record could not be found."
    );
  }

  if (existing.isPrimary) {
    return savedKundliFailure(
      "CANNOT_DELETE_PRIMARY",
      "The primary birth profile cannot be deleted from the saved kundli manager."
    );
  }

  await prisma.birthData.delete({ where: { id: existing.id } });

  return {
    success: true,
    data: { id: existing.id },
  };
}
