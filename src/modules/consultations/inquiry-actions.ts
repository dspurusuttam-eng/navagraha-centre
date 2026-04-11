"use server";

import { revalidatePath } from "next/cache";
import type { InquiryLifecycleStage, InquiryUrgencyLevel } from "@prisma/client";
import { assertRateLimit, buildRateLimitKey } from "@/lib/rate-limit";
import { getSession } from "@/modules/auth/server";
import {
  createInquiryLead,
  parseInquiryType,
} from "@/modules/consultations/inquiry-lifecycle";

export type PublicInquiryActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  leadId?: string;
  lifecycleStage?: InquiryLifecycleStage;
  urgencyLevel?: InquiryUrgencyLevel;
};

export const initialPublicInquiryActionState: PublicInquiryActionState = {
  status: "idle",
  message: null,
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function submitPublicInquiryLead(
  _previousState: PublicInquiryActionState,
  formData: FormData
): Promise<PublicInquiryActionState> {
  const fullName = getStringValue(formData, "fullName");
  const email = getStringValue(formData, "email");
  const inquiryTypeValue = getStringValue(formData, "inquiryType");
  const desiredServiceSlug = getStringValue(formData, "desiredServiceSlug");
  const message = getStringValue(formData, "message");
  const sourcePath = getStringValue(formData, "sourcePath");
  const phone = getStringValue(formData, "phone");
  const timezone = getStringValue(formData, "timezone");

  try {
    assertRateLimit({
      key: buildRateLimitKey([
        "public-action",
        "inquiry-lead",
        email || fullName || "anonymous",
      ]),
      limit: 8,
      windowMs: 10 * 60 * 1_000,
      message:
        "Too many inquiry submissions. Please wait a little and try again.",
    });

    const session = await getSession().catch(() => null);
    const lead = await createInquiryLead({
      userId: session?.user.id ?? null,
      fullName,
      email,
      phone: phone || null,
      timezone: timezone || null,
      inquiryType: parseInquiryType(inquiryTypeValue),
      desiredServiceSlug: desiredServiceSlug || null,
      message,
      sourcePath: sourcePath || "/contact",
    });

    revalidatePath("/contact");
    revalidatePath("/consultation");

    return {
      status: "success",
      message:
        "Your inquiry has been received. The centre will review it carefully and guide you to the right next step.",
      leadId: lead.id,
      lifecycleStage: lead.lifecycleStage,
      urgencyLevel: lead.urgencyLevel,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We couldn't submit your inquiry right now.",
    };
  }
}
