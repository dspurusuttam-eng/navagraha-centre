import {
  buildPremiumPanchangSnapshot,
  type BuildPremiumPanchangInput,
} from "@/modules/panchang/premium/engine";
import {
  PREMIUM_PANCHANG_ADAPTER_VERSION,
  type PremiumPanchangAdapterRequest,
} from "@/modules/panchang/premium/adapter-contract";
import type {
  PremiumPanchangFailureCode,
  PremiumPanchangSnapshot,
} from "@/modules/panchang/premium/types";

export { PREMIUM_PANCHANG_ADAPTER_VERSION };
export type { PremiumPanchangAdapterRequest };

export type PremiumPanchangAdapterInput = {
  localDate: string;
  queryInstant?: string | null;
  location: {
    latitude: number;
    longitude: number;
    timezoneIana: string;
  };
  locale?: string | null;
  injected?: BuildPremiumPanchangInput["injected"];
};

export type PremiumPanchangAdapterPayload = {
  adapterVersion: typeof PREMIUM_PANCHANG_ADAPTER_VERSION;
  data: PremiumPanchangSnapshot;
};

export type PremiumPanchangAdapterResult =
  | {
      success: true;
      payload: PremiumPanchangAdapterPayload;
    }
  | {
      success: false;
      error: {
        code: PremiumPanchangFailureCode;
        message: string;
        statusCode: number;
      };
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isPremiumPanchangAdapterRequested(value: unknown) {
  return (
    isRecord(value) &&
    value.adapterVersion === PREMIUM_PANCHANG_ADAPTER_VERSION
  );
}

function getPremiumFailureStatus(code: PremiumPanchangFailureCode) {
  switch (code) {
    case "MISSING_DATE_OR_INSTANT":
    case "INVALID_DATE":
    case "INVALID_QUERY_INSTANT":
    case "DATE_INSTANT_MISMATCH":
    case "INVALID_COORDINATES":
    case "INVALID_TIMEZONE":
    case "UNSUPPORTED_DATE_RANGE":
      return 422;
    case "EPHEMERIS_UNAVAILABLE":
    case "SUN_EVENT_CALCULATION_FAILED":
    case "TRANSITION_CALCULATION_FAILED":
      return 503;
    default:
      return 500;
  }
}

export function buildPremiumPanchangAdapterSnapshot(
  input: PremiumPanchangAdapterInput
): PremiumPanchangAdapterResult {
  const result = buildPremiumPanchangSnapshot({
    localDate: input.localDate,
    queryInstant: input.queryInstant ?? undefined,
    latitude: input.location.latitude,
    longitude: input.location.longitude,
    timezoneIana: input.location.timezoneIana,
    locale: input.locale ?? undefined,
    injected: input.injected,
  });

  if (!result.success) {
    return {
      success: false,
      error: {
        code: result.error.code,
        message: result.error.message,
        statusCode: getPremiumFailureStatus(result.error.code),
      },
    };
  }

  return {
    success: true,
    payload: {
      adapterVersion: PREMIUM_PANCHANG_ADAPTER_VERSION,
      data: result.data,
    },
  };
}
