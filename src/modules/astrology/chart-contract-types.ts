import type { DivisionalChartReadiness } from "@/modules/astrology/types";
import type { AstrologyDignityStatus } from "@/modules/astrology/core/types";

export type ChartContractVerificationIssue = {
  code: string;
  message: string;
  graha: string | null;
};

export type UnifiedSiderealChart = {
  birth_context: {
    date_local: string;
    time_local: string;
    place: string;
    latitude: number;
    longitude: number;
    timezone: string;
    birth_utc: string;
  };
  settings: {
    zodiac: "sidereal";
    ayanamsha: "LAHIRI";
    house_system: "whole_sign";
  };
  lagna: {
    longitude: number;
    sign: string;
    degree_in_sign: number;
  };
  houses: Array<{
    house: number;
    sign: string;
  }>;
  planets: Array<{
    name: string;
    longitude: number;
    sign: string;
    degree_in_sign: number;
    nakshatra: string;
    pada: number;
    is_retrograde: boolean;
    is_combust: boolean;
    house: number;
    speed?: number | null;
    dignity?: AstrologyDignityStatus;
    divisionalPlacement?: {
      code: "D1";
      sign: string;
      house: number;
    } | null;
  }>;
  verification: {
    is_verified_for_chart_logic: boolean;
    verification_status: "VERIFIED" | "WARNINGS" | "FAILED";
    warnings: ChartContractVerificationIssue[];
    errors: ChartContractVerificationIssue[];
  };
  divisionalReadiness?: DivisionalChartReadiness[];
};

export type ChartContractSuccessResponse = {
  chart: UnifiedSiderealChart;
  persistence?: {
    fingerprint: string;
    birthProfileFingerprint: string | null;
    createdAtUtc: string;
    updatedAtUtc: string;
    policy: "updated-existing-for-user-profile" | "kept-existing-canonical-chart";
  };
  retrieval?: {
    policy:
      | "reused_saved_chart"
      | "refreshed_stale_chart"
      | "rebuilt_missing_saved_chart";
    staleDetected: boolean;
    staleReason:
      | "BIRTH_PROFILE_FINGERPRINT_MISSING"
      | "BIRTH_PROFILE_FINGERPRINT_MISMATCH"
      | null;
  };
};

export type ChartContractErrorResponse = {
  error: {
    code: string;
    message: string;
  };
  details?: unknown;
};
