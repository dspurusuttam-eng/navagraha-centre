"use client";

import type {
  AnalyticsEventPayload,
  TrackedEventName,
} from "@/lib/analytics/types";

type TrackEventInput = {
  dispatch?: "immediate" | "idle";
  userId?: string;
};

type AnalyticsEventRequest = {
  event: TrackedEventName;
  payload: AnalyticsEventPayload;
  userId?: string;
};

const analyticsEndpoint = "/api/analytics/event";
const CID_STORAGE_KEY = "nvg-device-token";

/**
 * Same opaque random per-browser token the like system uses (shared key);
 * generated on first use, never derived from any identity.
 */
function readClientCid(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const existing = window.localStorage.getItem(CID_STORAGE_KEY);
    if (existing && /^[A-Za-z0-9_-]{16,64}$/.test(existing)) return existing;
    const bytes = new Uint8Array(24);
    window.crypto.getRandomValues(bytes);
    const token = Array.from(
      bytes,
      (b) => "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"[b % 64]
    ).join("");
    window.localStorage.setItem(CID_STORAGE_KEY, token);
    return token;
  } catch {
    return null;
  }
}

const idleDispatchTimeoutMs = 2000;
const duplicateEventWindowMs = 5000;
const maxRecentEventKeys = 80;

const recentIdleEventKeys = new Map<string, number>();

type IdleCapableWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout?: number }
  ) => number;
};

function getStablePayloadKey(payload: AnalyticsEventPayload) {
  return JSON.stringify(
    Object.entries(payload)
      .filter(([key, value]) => key !== "timestamp" && value !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
  );
}

function shouldSkipDuplicateIdleEvent(requestPayload: AnalyticsEventRequest) {
  const now = Date.now();
  const key = `${requestPayload.event}:${requestPayload.userId ?? ""}:${getStablePayloadKey(
    requestPayload.payload
  )}`;
  const previous = recentIdleEventKeys.get(key);

  if (previous && now - previous < duplicateEventWindowMs) {
    return true;
  }

  recentIdleEventKeys.set(key, now);

  if (recentIdleEventKeys.size > maxRecentEventKeys) {
    const staleBefore = now - duplicateEventWindowMs;

    for (const [eventKey, timestamp] of recentIdleEventKeys) {
      if (timestamp < staleBefore || recentIdleEventKeys.size > maxRecentEventKeys) {
        recentIdleEventKeys.delete(eventKey);
      }
    }
  }

  return false;
}

function dispatchWhenIdle(callback: () => void) {
  const idleWindow = window as IdleCapableWindow;

  if (typeof idleWindow.requestIdleCallback === "function") {
    idleWindow.requestIdleCallback(callback, {
      timeout: idleDispatchTimeoutMs,
    });
    return;
  }

  window.setTimeout(callback, 900);
}

function sendWithFetch(payload: AnalyticsEventRequest) {
  void fetch(analyticsEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
    keepalive: true,
    cache: "no-store",
  }).catch(() => {
    // Analytics must stay non-blocking.
  });
}

function sendAnalyticsRequest(requestPayload: AnalyticsEventRequest) {
  try {
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const beaconBlob = new Blob([JSON.stringify(requestPayload)], {
        type: "application/json",
      });
      const queued = navigator.sendBeacon(analyticsEndpoint, beaconBlob);

      if (queued) {
        return;
      }
    }

    sendWithFetch(requestPayload);
  } catch {
    // Never allow analytics calls to break UX flows.
  }
}

export function trackEvent(
  eventName: TrackedEventName,
  payload: AnalyticsEventPayload = {},
  input: TrackEventInput = {}
) {
  if (typeof window === "undefined") {
    return;
  }

  const cid = readClientCid();
  const requestPayload: AnalyticsEventRequest = {
    event: eventName,
    payload: {
      ...payload,
      ...(cid ? { cid } : {}),
      timestamp: new Date().toISOString(),
    },
    userId: input.userId,
  };

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics:track]", requestPayload);
  }

  if (input.dispatch === "idle") {
    if (shouldSkipDuplicateIdleEvent(requestPayload)) {
      return;
    }

    dispatchWhenIdle(() => sendAnalyticsRequest(requestPayload));
    return;
  }

  sendAnalyticsRequest(requestPayload);
}
