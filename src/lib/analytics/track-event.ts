"use client";

import type {
  AnalyticsEventPayload,
  TrackedEventName,
} from "@/lib/analytics/types";

type TrackEventInput = {
  userId?: string;
};

type AnalyticsEventRequest = {
  event: TrackedEventName;
  payload: AnalyticsEventPayload;
  userId?: string;
};

const analyticsEndpoint = "/api/analytics/event";

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

export function trackEvent(
  eventName: TrackedEventName,
  payload: AnalyticsEventPayload = {},
  input: TrackEventInput = {}
) {
  if (typeof window === "undefined") {
    return;
  }

  const requestPayload: AnalyticsEventRequest = {
    event: eventName,
    payload: {
      ...payload,
      timestamp: new Date().toISOString(),
    },
    userId: input.userId,
  };

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics:track]", requestPayload);
  }

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
