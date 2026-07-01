"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/track-event";

type PageViewTrackerProps = {
  page: string;
  feature?: string;
};

export function PageViewTracker({ page, feature }: Readonly<PageViewTrackerProps>) {
  const lastTrackedKeyRef = useRef<string | null>(null);
  const featureName = feature ?? "page";

  useEffect(() => {
    const eventKey = `${page}:${featureName}`;

    if (lastTrackedKeyRef.current === eventKey) {
      return;
    }

    lastTrackedKeyRef.current = eventKey;

    const payload = {
      page,
      feature: featureName,
    };

    trackEvent("page_view", payload, { dispatch: "idle" });
  }, [featureName, page]);

  return null;
}
