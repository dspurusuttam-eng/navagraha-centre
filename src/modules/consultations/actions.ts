"use server";

import { revalidatePath } from "next/cache";
import { assertRateLimit, buildRateLimitKey } from "@/lib/rate-limit";
import { requireUserSession } from "@/modules/auth/server";
import { createConsultationBooking } from "@/modules/consultations/service";

export type ConsultationBookingActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  redirectTo?: string;
};

export const initialConsultationBookingActionState: ConsultationBookingActionState =
  {
    status: "idle",
  };

function getFormValue(formData: FormData, key: string) {
  return formData.get(key)?.toString() ?? "";
}

export async function submitConsultationBooking(
  _previousState: ConsultationBookingActionState,
  formData: FormData
): Promise<ConsultationBookingActionState> {
  try {
    const session = await requireUserSession();
    assertRateLimit({
      key: buildRateLimitKey([
        "user-action",
        "consultation-booking",
        session.user.id,
      ]),
      limit: 5,
      windowMs: 15 * 60 * 1_000,
      message:
        "Too many consultation booking attempts. Please wait a few minutes and try again.",
    });
    const booking = await createConsultationBooking({
      userId: session.user.id,
      packageSlug: getFormValue(formData, "packageSlug"),
      slotId: getFormValue(formData, "slotId"),
      birthDataId: getFormValue(formData, "birthDataId") || null,
      clientTimezone: getFormValue(formData, "clientTimezone"),
      preferredLanguage: getFormValue(formData, "preferredLanguage"),
      contactPhone: getFormValue(formData, "contactPhone") || null,
      topicFocus: getFormValue(formData, "topicFocus"),
      intakeSummary: getFormValue(formData, "intakeSummary"),
    });

    revalidatePath("/consultation");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/consultations");
    revalidatePath("/admin");
    revalidatePath("/settings");

    return {
      status: "success",
      message: "Consultation booked successfully.",
      redirectTo: `/dashboard/consultations/${booking.id}`,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We couldn't reserve that consultation. Please try again.",
    };
  }
}
