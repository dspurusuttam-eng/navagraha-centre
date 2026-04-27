import { NextResponse } from "next/server";
import {
  checkSecurityRateLimit,
  guardPayloadByteLength,
} from "@/lib/security";
import { trackServerEvent } from "@/lib/observability";
import { getClientAddress } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payloadGuard = guardPayloadByteLength(request);

  if (payloadGuard) {
    return payloadGuard;
  }

  const clientAddress = getClientAddress(request);
  const limit = checkSecurityRateLimit({
    request,
    policyKey: "web-vitals",
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: "Too many analytics events. Please retry later.",
      },
      {
        status: 429,
        headers: limit.headers,
      }
    );
  }

  const payload = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid analytics payload.",
      },
      {
        status: 400,
      }
    );
  }

  const metricName =
    typeof payload.name === "string" ? payload.name : "unknown";
  const metricId = typeof payload.id === "string" ? payload.id : "unknown";
  const metricRating =
    typeof payload.rating === "string" ? payload.rating : "unknown";

  trackServerEvent("web-vitals.received", {
    clientAddress,
    metricName,
    metricId,
    metricRating,
  });

  return NextResponse.json(
    {
      ok: true,
    },
    {
      headers: limit.headers,
    }
  );
}
