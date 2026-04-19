"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/track-event";

type PageViewTrackerProps = {
  page: string;
  feature?: string;
};

export function PageViewTracker({ page, feature }: Readonly<PageViewTrackerProps>) {
  useEffect(() => {
    const payload = {
      page,
      feature: feature ?? "page",
    };

    trackEvent("page_view", payload);
    trackEvent("page_visit", payload);
  }, [feature, page]);

  return null;
}
