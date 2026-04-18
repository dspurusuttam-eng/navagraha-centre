"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/track-event";
import type {
  AnalyticsEventPayload,
  TrackedEventName,
} from "@/lib/analytics/types";

type AnalyticsEventTrackerProps = {
  event: TrackedEventName;
  payload?: AnalyticsEventPayload;
};

export function AnalyticsEventTracker({
  event,
  payload,
}: Readonly<AnalyticsEventTrackerProps>) {
  useEffect(() => {
    trackEvent(event, payload ?? {});
  }, [event, payload]);

  return null;
}
