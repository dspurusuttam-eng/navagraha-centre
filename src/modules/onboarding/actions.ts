"use server";

import { revalidatePath } from "next/cache";
import { assertRateLimit, buildRateLimitKey } from "@/lib/rate-limit";
import { requireUserSession } from "@/modules/auth/server";
import {
  defaultPreferredLanguage,
  isPreferredLanguage,
} from "@/modules/onboarding/constants";
import { saveOnboardingAndGenerateChart } from "@/modules/onboarding/service";
import {
  AstrologyValidationError,
  validateBirthDetails,
} from "@/modules/astrology/validation";

export type OnboardingActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  redirectTo?: string;
};

export const initialOnboardingActionState: OnboardingActionState = {
  status: "idle",
};

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
    throw new Error(`${label} is required for accurate chart generation.`);
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} must be a valid number between ${min} and ${max}.`);
  }

  return parsed;
}

function formatValidationError(error: AstrologyValidationError) {
  return (
    error.issues[0]?.message ?? "Please review the birth details and try again."
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

    const birthDetailsResult = validateBirthDetails({
      dateLocal: normalizeRequiredText(
        formData.get("birthDate"),
        "Birth date",
        10
      ),
      timeLocal: normalizeRequiredText(
        formData.get("birthTime"),
        "Birth time",
        5
      ),
      timezone: normalizeRequiredText(
        formData.get("timezone"),
        "Timezone",
        120
      ),
      place: {
        city: normalizeRequiredText(formData.get("city"), "Birth city", 80),
        region: normalizeOptionalText(formData.get("region"), 80) ?? undefined,
        country: normalizeRequiredText(formData.get("country"), "Country", 80),
        latitude: normalizeCoordinate(
          formData.get("latitude"),
          "Latitude",
          -90,
          90
        ),
        longitude: normalizeCoordinate(
          formData.get("longitude"),
          "Longitude",
          -180,
          180
        ),
      },
    });

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
