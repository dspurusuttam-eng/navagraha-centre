"use server";

import { revalidatePath } from "next/cache";
import { assertRateLimit, buildRateLimitKey } from "@/lib/rate-limit";
import {
  validateKundliRequestPayload,
  type KundliRequestPayload,
} from "@/lib/kundli/pending-kundli-draft";
import { getSession } from "@/modules/auth/server";
import { validateBirthDetails } from "@/modules/astrology/validation";
import { saveOnboardingAndGenerateChart } from "@/modules/onboarding/service";

export type PrepareKundliProfileResult =
  | { status: "success" }
  | { status: "unauthorized"; message: string }
  | { status: "error"; message: string };

const languageMap = {
  EN: "en",
  HI: "hi",
  AS: "as",
} as const;

export async function prepareKundliProfile(
  payload: KundliRequestPayload
): Promise<PrepareKundliProfileResult> {
  const session = await getSession().catch(() => null);
  if (!session) {
    return {
      status: "unauthorized",
      message: "Your sign-in session is not ready. Please sign in and try again.",
    };
  }

  try {
    assertRateLimit({
      key: buildRateLimitKey([
        "user-action",
        "kundli-profile-prepare",
        session.user.id,
      ]),
      limit: 6,
      windowMs: 30 * 60 * 1_000,
      message: "Too many Kundli preparation attempts. Please wait and retry.",
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Too many Kundli preparation attempts. Please wait and retry.",
    };
  }

  if (!validateKundliRequestPayload(payload)) {
    return {
      status: "error",
      message: "Birth details changed or became invalid. Please review them and retry.",
    };
  }

  const location = payload.location;
  const birthDetails = validateBirthDetails({
    dateLocal: payload.dateLocal,
    timeLocal: payload.timeLocal,
    timezone: location.timezone,
    place: {
      city:
        location.city ??
        location.district ??
        location.state ??
        location.displayName,
      region: location.state ?? location.district ?? undefined,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
    },
  });

  if (!birthDetails.success) {
    return {
      status: "error",
      message:
        birthDetails.issues[0]?.message ??
        "Birth details could not be validated for chart generation.",
    };
  }

  try {
    await saveOnboardingAndGenerateChart({
      userId: session.user.id,
      name: payload.name.trim(),
      preferredLanguage: languageMap[payload.language],
      birthDetails: birthDetails.data,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/chart");
    revalidatePath("/dashboard/kundli");
    revalidatePath("/settings");

    return { status: "success" };
  } catch {
    return {
      status: "error",
      message: "Birth details could not be saved safely. Please try again.",
    };
  }
}
