"use client";

import { isMonetizationTrackingEnabled } from "@/lib/monetization/monetization-config";
import { trackEvent } from "@/lib/analytics/track-event";
import type { AnalyticsEventPayload } from "@/lib/analytics/types";

export const revenueEventNames = [
  "consultation_cta_click",
  "report_cta_click",
  "shop_cta_click",
  "gemstone_guidance_click",
  "premium_ai_cta_click",
  "adsense_slot_view",
  "article_ad_slot_rendered",
  "report_purchase_start",
  "checkout_start",
  "payment_success",
  "payment_failed",
] as const;

export type RevenueEventName = (typeof revenueEventNames)[number];

export function trackRevenueEvent(
  eventName: RevenueEventName,
  payload: AnalyticsEventPayload = {}
) {
  if (!isMonetizationTrackingEnabled()) {
    return;
  }

  trackEvent(eventName, payload);
}

