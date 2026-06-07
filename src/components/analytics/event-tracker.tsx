"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/track-event";
import type {
  AnalyticsEventPayload,
  AnalyticsEventPayloadValue,
  TrackedEventName,
} from "@/lib/analytics/types";

type AnalyticsEventTrackerProps = {
  event: TrackedEventName;
  payload?: AnalyticsEventPayload;
};

function getPayloadKey(payload: AnalyticsEventPayload) {
  return JSON.stringify(
    Object.entries(payload)
      .filter(([, value]) => value !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
  );
}

function getPayloadFromKey(payloadKey: string): AnalyticsEventPayload {
  return Object.fromEntries(
    JSON.parse(payloadKey) as Array<[string, AnalyticsEventPayloadValue]>
  );
}

export function AnalyticsEventTracker({
  event,
  payload,
}: Readonly<AnalyticsEventTrackerProps>) {
  const lastTrackedKeyRef = useRef<string | null>(null);
  const payloadValue = payload ?? {};
  const payloadKey = getPayloadKey(payloadValue);

  useEffect(() => {
    const eventKey = `${event}:${payloadKey}`;

    if (lastTrackedKeyRef.current === eventKey) {
      return;
    }

    lastTrackedKeyRef.current = eventKey;
    trackEvent(event, getPayloadFromKey(payloadKey), { dispatch: "idle" });
  }, [event, payloadKey]);

  return null;
}
