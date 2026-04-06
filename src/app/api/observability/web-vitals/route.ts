import { NextResponse } from "next/server";
import {
  buildRateLimitKey,
  checkRateLimit,
  getClientAddress,
  getRateLimitHeaders,
} from "@/lib/rate-limit";
import { trackServerEvent } from "@/lib/observability";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const clientAddress = getClientAddress(request);
  const limit = checkRateLimit({
    key: buildRateLimitKey(["web-vitals", clientAddress]),
    limit: 120,
    windowMs: 5 * 60 * 1_000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: "Too many analytics events. Please retry later.",
      },
      {
        status: 429,
        headers: getRateLimitHeaders(limit),
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

  trackServerEvent("web-vitals.received", {
    clientAddress,
    ...payload,
  });

  return NextResponse.json(
    {
      ok: true,
    },
    {
      headers: getRateLimitHeaders(limit),
    }
  );
}
