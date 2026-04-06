"use client";

import { useReportWebVitals } from "next/web-vitals";
import { trackBrowserMetric } from "@/lib/observability";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    trackBrowserMetric({
      id: metric.id,
      name: metric.name,
      label: metric.label,
      rating: metric.rating,
      value: metric.value,
    });
  });

  return null;
}
