import { NextResponse, type NextRequest } from "next/server";
import { persistAnalyticsEvent } from "@/lib/analytics/persist-event";
import { getPrisma } from "@/lib/prisma";
import { consultationConfigSchema } from "@/modules/admin/domain";
import { buildWhatsappUrl } from "@/modules/site-settings/public-settings-core";

export const dynamic = "force-dynamic";

const SINGLETON_KEY = "default";
const MAX_MESSAGE_LENGTH = 1600;

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid handoff request.");
  }

  const message =
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return jsonError(400, "INVALID_MESSAGE", "A valid consultation message is required.");
  }

  const row = await getPrisma().consultationSettings.findUnique({
    where: { singletonKey: SINGLETON_KEY },
    select: { settingsJson: true },
  });
  const parsed = consultationConfigSchema.safeParse(row?.settingsJson);
  if (
    !parsed.success ||
    parsed.data.isEnabled !== true ||
    parsed.data.availabilityStatus !== "AVAILABLE"
  ) {
    return jsonError(503, "CONSULTATION_UNAVAILABLE", "Consultation handoff is unavailable.");
  }

  const url = buildWhatsappUrl(parsed.data.whatsappNumber, message);
  if (!url) {
    return jsonError(503, "HANDOFF_UNAVAILABLE", "Consultation handoff is unavailable.");
  }

  // The handoff is the last measurable step of the consultation funnel and was
  // entirely uninstrumented, so the Admin console could show CTA clicks with no
  // way to tell how many became real enquiries. Only the fact of a successful
  // handoff is recorded. The message is the reader's private consultation
  // question and the WhatsApp number is a business secret; neither is passed to
  // the analytics writer, which persists nothing but the event name here.
  await persistAnalyticsEvent("consultation_whatsapp_handoff", {
    source: "consultation",
  });

  return NextResponse.json(
    { ok: true, url },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
