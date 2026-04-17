import {
  normalizeBirthContextInput,
  type BirthInputNormalizationIssue,
  type NormalizedBirthContextInput,
} from "@/lib/astrology/birth-input-normalizer";
import {
  resolveAstronomyReadyBirthContext,
  type BirthContextResolutionIssue,
  type ResolvedBirthPlace,
  type ResolvedBirthTimezone,
} from "@/lib/astrology/birth-context-engine";
import {
  validateBirthContextResolutionResult,
  type BirthContextValidationResult,
} from "@/lib/astrology/birth-context-validator";

export type BirthContextDebugInput = {
  dateLocalInput: string;
  timeLocalInput: string;
  placeTextInput: string;
};

export type BirthContextDebugPayload = {
  birth_input_original: {
    date_local_input: string;
    time_local_input: string;
    place_text_input: string;
  };
  birth_input_normalized: NormalizedBirthContextInput | null;
  place_query_normalized: string | null;
  resolved_place: {
    display_name: string | null;
    latitude: number | null;
    longitude: number | null;
    country_code: string | null;
    region: string | null;
    city: string | null;
  };
  timezone: {
    iana: string | null;
    utc_offset_at_birth: string | null;
  };
  birth_utc: string | null;
  resolution: {
    success: boolean;
    issue: BirthContextResolutionIssue | null;
  };
  validation: BirthContextValidationResult;
};

function mapPlaceForDebug(place: ResolvedBirthPlace | null) {
  return {
    display_name: place?.display_name ?? null,
    latitude: place?.latitude ?? null,
    longitude: place?.longitude ?? null,
    country_code: place?.country_code ?? null,
    region: place?.region ?? null,
    city: place?.city ?? null,
  };
}

function mapTimezoneForDebug(timezone: ResolvedBirthTimezone | null) {
  return {
    iana: timezone?.iana ?? null,
    utc_offset_at_birth: timezone?.utc_offset_at_birth ?? null,
  };
}

function mapNormalizationIssuesToValidation(
  issues: BirthInputNormalizationIssue[]
): BirthContextValidationResult {
  return {
    is_valid_for_chart: false,
    normalization_status: "INVALID",
    location_confidence: "unknown",
    timezone_status: "missing",
    overall_confidence: "low",
    errors: issues.map((issue) => ({
      severity: "error" as const,
      code: "RESOLUTION_FAILED" as const,
      message: issue.message,
    })),
    warnings: [],
  };
}

export async function buildBirthContextDebugPayload(
  input: BirthContextDebugInput
): Promise<BirthContextDebugPayload> {
  const normalized = normalizeBirthContextInput(input);

  if (!normalized.success) {
    return {
      birth_input_original: {
        date_local_input: input.dateLocalInput,
        time_local_input: input.timeLocalInput,
        place_text_input: input.placeTextInput,
      },
      birth_input_normalized: null,
      place_query_normalized: normalized.partial.place_query_normalized,
      resolved_place: mapPlaceForDebug(null),
      timezone: mapTimezoneForDebug(null),
      birth_utc: null,
      resolution: {
        success: false,
        issue: null,
      },
      validation: mapNormalizationIssuesToValidation(normalized.issues),
    };
  }

  const resolution = await resolveAstronomyReadyBirthContext(normalized.data);
  const validation = validateBirthContextResolutionResult(resolution);

  if (!resolution.success) {
    return {
      birth_input_original: {
        date_local_input: input.dateLocalInput,
        time_local_input: input.timeLocalInput,
        place_text_input: input.placeTextInput,
      },
      birth_input_normalized: normalized.data,
      place_query_normalized: normalized.data.place_query_normalized,
      resolved_place: mapPlaceForDebug(resolution.partial.normalized_place),
      timezone: mapTimezoneForDebug(resolution.partial.timezone),
      birth_utc: null,
      resolution: {
        success: false,
        issue: resolution.issue,
      },
      validation,
    };
  }

  return {
    birth_input_original: {
      date_local_input: input.dateLocalInput,
      time_local_input: input.timeLocalInput,
      place_text_input: input.placeTextInput,
    },
    birth_input_normalized: normalized.data,
    place_query_normalized: normalized.data.place_query_normalized,
    resolved_place: mapPlaceForDebug(resolution.data.normalized_place),
    timezone: mapTimezoneForDebug(resolution.data.timezone),
    birth_utc: resolution.data.birth_utc,
    resolution: {
      success: true,
      issue: null,
    },
    validation,
  };
}
