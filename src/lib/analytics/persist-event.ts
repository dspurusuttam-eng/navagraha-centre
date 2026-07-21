// Durable write-through for the anonymous analytics stream. Persists only the
// sanitised safe fields (the route already clamps types); the opaque client
// token is hashed before storage and is never joinable to any identity.
// Failures are swallowed — analytics must never break the public API.
import "server-only";

import { createHash } from "crypto";
import { getPrisma } from "@/lib/prisma";
import type { AnalyticsEventPayload } from "@/lib/analytics/types";

const MAX_FIELD = 160;

function safeField(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, MAX_FIELD) : null;
}

export async function persistAnalyticsEvent(
  eventName: string,
  payload: AnalyticsEventPayload
): Promise<void> {
  try {
    const cidRaw = safeField(payload.cid);
    await getPrisma().analyticsEvent.create({
      data: {
        name: eventName.slice(0, 80),
        route: safeField(payload.route),
        locale: safeField(payload.locale)?.slice(0, 8) ?? null,
        source: safeField(payload.source),
        section: safeField(payload.section),
        status: safeField(payload.status),
        cid: cidRaw
          ? createHash("sha256").update(`navagraha-cid:${cidRaw}`).digest("hex")
          : null,
        day: new Date().toISOString().slice(0, 10),
      },
    });
  } catch {
    // Durable analytics is best-effort by design.
  }
}

/** Delete events older than the retention window (called opportunistically). */
export async function pruneAnalyticsEvents(days = 90): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await getPrisma().analyticsEvent.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    return result.count;
  } catch {
    return 0;
  }
}
