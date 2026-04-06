"use server";

import { revalidatePath } from "next/cache";
import { assertRateLimit, buildRateLimitKey } from "@/lib/rate-limit";
import { saveProfileSettings } from "@/modules/account/service";
import { requireUserSession } from "@/modules/auth/server";

export type SettingsActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialSettingsActionState: SettingsActionState = {
  status: "idle",
};

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

export async function updateProfileSettings(
  _previousState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    const session = await requireUserSession();
    assertRateLimit({
      key: buildRateLimitKey([
        "user-action",
        "profile-settings",
        session.user.id,
      ]),
      limit: 12,
      windowMs: 10 * 60 * 1_000,
      message:
        "Too many profile updates in a short period. Please wait and try again.",
    });
    const name = formData.get("name")?.toString().trim() ?? "";

    if (name.length < 2) {
      return {
        status: "error",
        message:
          "Please enter the full name you want shown across your account.",
      };
    }

    await saveProfileSettings({
      userId: session.user.id,
      name,
      image: normalizeOptionalText(formData.get("image"), 500),
      phone: normalizeOptionalText(formData.get("phone"), 40),
      city: normalizeOptionalText(formData.get("city"), 80),
      region: normalizeOptionalText(formData.get("region"), 80),
      country: normalizeOptionalText(formData.get("country"), 80),
      timezone: normalizeOptionalText(formData.get("timezone"), 120),
      bio: normalizeOptionalText(formData.get("bio"), 600),
      notes: normalizeOptionalText(formData.get("notes"), 600),
    });

    revalidatePath("/dashboard");
    revalidatePath("/settings");

    return {
      status: "success",
      message: "Account settings saved.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We couldn't save your settings. Please try again.",
    };
  }
}
