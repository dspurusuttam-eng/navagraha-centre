"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/track-event";

type PageViewTrackerProps = {
  page: string;
  feature?: string;
};

export function PageViewTracker({ page, feature }: Readonly<PageViewTrackerProps>) {
  useEffect(() => {
    trackEvent("page_view", {
      page,
      feature: feature ?? "page",
    });
  }, [feature, page]);

  return null;
}
