"use server";

import { revalidatePath } from "next/cache";
import { assertRateLimit, buildRateLimitKey } from "@/lib/rate-limit";
import { normalizeBirthContextInput } from "@/lib/astrology/birth-input-normalizer";
import { resolveAstronomyReadyBirthContext } from "@/lib/astrology/birth-context-engine";
import { validateBirthContextResolutionResult } from "@/lib/astrology/birth-context-validator";
import { requireUserSession } from "@/modules/auth/server";
import type { OnboardingActionState } from "@/modules/onboarding/action-state";
import {
  defaultPreferredLanguage,
  isPreferredLanguage,
} from "@/modules/onboarding/constants";
import { saveOnboardingAndGenerateChart } from "@/modules/onboarding/service";
import {
  AstrologyValidationError,
  validateBirthDetails,
} from "@/modules/astrology/validation";

function normalizeRequiredText(
  value: FormDataEntryValue | null,
  label: string,
  maxLength: number
) {
  const normalized = value?.toString().trim() ?? "";

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  if (normalized.length > maxLength) {
    throw new Error(`${label} must stay within ${maxLength} characters.`);
  }

  return normalized;
}

function normalizeOptionalText(
  value: FormDataEntryValue | null,
  maxLength: number
) {
  const normalized = value?.toString().trim() ?? "";

  if (!normalized) {
    return null;
  }

  if (normalized.length > maxLength) {
    throw new Error(
      `Please shorten entries to ${maxLength} characters or less.`
    );
  }

  return normalized;
}

function normalizeCoordinate(
  value: FormDataEntryValue | null,
  label: string,
  min: number,
  max: number
) {
  const normalized = value?.toString().trim() ?? "";

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} is invalid. Please enter a value between ${min} and ${max}.`);
  }

  return parsed;
}

function formatValidationError(error: AstrologyValidationError) {
  return (
    error.issues[0]?.message ?? "Please review the birth details and try again."
  );
}

function formatBirthNormalizationError(input: {
  issues: {
    message: string;
  }[];
}) {
  return (
    input.issues[0]?.message ??
    "Birth input could not be normalized. Please review date, time, and place."
  );
}

function formatBirthContextResolutionError(input: {
  issue: {
    message: string;
  };
}) {
  return (
    input.issue.message ??
    "Birth context resolution failed. Please provide a more precise birthplace."
  );
}

function formatBirthContextValidationError(input: {
  errors: {
    message: string;
  }[];
}) {
  return (
    input.errors[0]?.message ??
    "Birth details could not be validated safely for chart generation. Please review and try again."
  );
}

export async function completeBirthOnboarding(
  _previousState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  try {
    const session = await requireUserSession();
    assertRateLimit({
      key: buildRateLimitKey([
        "user-action",
        "birth-onboarding",
        session.user.id,
      ]),
      limit: 6,
      windowMs: 30 * 60 * 1_000,
      message:
        "Too many onboarding attempts. Please wait a little and try again.",
    });
    const preferredLanguageValue =
      formData.get("preferredLanguage")?.toString().trim() ??
      defaultPreferredLanguage;

    if (!isPreferredLanguage(preferredLanguageValue)) {
      return {
        status: "error",
        message: "Please choose a supported preferred language.",
      };
    }

    const birthDateInput = normalizeRequiredText(
      formData.get("birthDate"),
      "Birth date",
      32
    );
    const birthTimeInput = normalizeRequiredText(
      formData.get("birthTime"),
      "Birth time",
      32
    );
    const birthCity = normalizeRequiredText(formData.get("city"), "Birth city", 80);
    const birthRegion = normalizeOptionalText(formData.get("region"), 80);
    const birthCountry = normalizeRequiredText(formData.get("country"), "Country", 80);
    const birthTimezone = normalizeRequiredText(
      formData.get("timezone"),
      "Timezone",
      120
    );
    const manualLatitude = normalizeCoordinate(
      formData.get("latitude"),
      "Latitude",
      -90,
      90
    );
    const manualLongitude = normalizeCoordinate(
      formData.get("longitude"),
      "Longitude",
      -180,
      180
    );
    const placeTextInput = [birthCity, birthRegion, birthCountry]
      .filter((value) => Boolean(value))
      .join(", ");
    const normalizedBirthContext = normalizeBirthContextInput({
      dateLocalInput: birthDateInput,
      timeLocalInput: birthTimeInput,
      placeTextInput,
    });

    if (!normalizedBirthContext.success) {
      return {
        status: "error",
        message: formatBirthNormalizationError(normalizedBirthContext),
      };
    }
    const resolvedBirthContext = await resolveAstronomyReadyBirthContext(
      normalizedBirthContext.data
    );
    const birthDetailsResult = resolvedBirthContext.success
      ? (() => {
          const birthContextValidation =
            validateBirthContextResolutionResult(resolvedBirthContext);

          if (!birthContextValidation.is_valid_for_chart) {
            return {
              success: false as const,
              issues: [
                {
                  field: "birthContext",
                  code: "CONTEXT_VALIDATION_FAILED",
                  message: formatBirthContextValidationError(birthContextValidation),
                },
              ],
            };
          }

          const resolvedPlace = resolvedBirthContext.data.normalized_place;

          return validateBirthDetails({
            dateLocal: normalizedBirthContext.data.date_local_normalized,
            timeLocal: normalizedBirthContext.data.time_local_normalized,
            timezone: resolvedBirthContext.data.timezone.iana,
            place: {
              city: resolvedPlace.city ?? birthCity,
              region: resolvedPlace.region ?? birthRegion ?? undefined,
              country: resolvedPlace.country_name || birthCountry,
              latitude: resolvedPlace.latitude,
              longitude: resolvedPlace.longitude,
            },
          });
        })()
      : (() => {
          console.warn("[onboarding] falling back to manual birth coordinates", {
            issueCode: resolvedBirthContext.issue.code,
          });

          return validateBirthDetails({
            dateLocal: normalizedBirthContext.data.date_local_normalized,
            timeLocal: normalizedBirthContext.data.time_local_normalized,
            timezone: birthTimezone,
            place: {
              city: birthCity,
              region: birthRegion ?? undefined,
              country: birthCountry,
              latitude: manualLatitude,
              longitude: manualLongitude,
            },
          });
        })();

    if (!birthDetailsResult.success) {
      return {
        status: "error",
        message:
          birthDetailsResult.issues[0]?.message ??
          "Please review the birth details and try again.",
      };
    }

    await saveOnboardingAndGenerateChart({
      userId: session.user.id,
      name: normalizeRequiredText(formData.get("name"), "Full name", 120),
      preferredLanguage: preferredLanguageValue,
      birthDetails: birthDetailsResult.data,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/onboarding");
    revalidatePath("/dashboard/chart");
    revalidatePath("/settings");

    return {
      status: "success",
      message: "Birth profile saved and initial chart generated.",
      redirectTo: "/dashboard/chart",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof AstrologyValidationError
          ? formatValidationError(error)
          : error instanceof Error
            ? error.message
            : "We couldn't complete onboarding. Please try again.",
    };
  }
}
