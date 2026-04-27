function readBoolean(value: string | undefined, fallback = false) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return fallback;
}

function readList(value: string | undefined, fallback: readonly string[]) {
  if (typeof value !== "string" || !value.trim()) {
    return [...fallback];
  }

  const list = value
    .split(",")
    .map((entry) => entry.trim().toUpperCase())
    .filter(Boolean);

  return list.length ? list : [...fallback];
}

const currencyFallback = ["INR", "USD"] as const;
const adsensePublisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID?.trim() || "";
const adsenseDefaultSlotId =
  process.env.NEXT_PUBLIC_ADSENSE_DEFAULT_SLOT_ID?.trim() || "";
const enableAdsenseFlag = readBoolean(process.env.NEXT_PUBLIC_ENABLE_ADSENSE, false);
const enableAdPlaceholdersDefault = process.env.NODE_ENV !== "production";
const enableMonetizationTrackingFlag = readBoolean(
  process.env.NEXT_PUBLIC_ENABLE_MONETIZATION_TRACKING,
  readBoolean(process.env.NEXT_PUBLIC_ANALYTICS_ENABLED, false)
);

export const monetizationPlacements = [
  "blog_after_intro",
  "blog_mid_article",
  "blog_before_related",
  "rashifal_after_intro",
  "rashifal_mid_content",
  "panchang_after_summary",
  "tool_result_bottom",
  "homepage_soft_slot",
  "sidebar_desktop",
] as const;

export type MonetizationPlacement = (typeof monetizationPlacements)[number];

export const monetizationConfig = {
  enableAdsense: enableAdsenseFlag && Boolean(adsensePublisherId),
  adsensePublisherId,
  adsenseDefaultSlotId,
  enableAdPlaceholders: readBoolean(
    process.env.NEXT_PUBLIC_ENABLE_AD_PLACEHOLDERS,
    enableAdPlaceholdersDefault
  ),
  enableConsultationCTA: readBoolean(process.env.NEXT_PUBLIC_ENABLE_CONSULTATION_CTA, true),
  enableReportCTA: readBoolean(process.env.NEXT_PUBLIC_ENABLE_REPORT_CTA, true),
  enableShopCTA: readBoolean(process.env.NEXT_PUBLIC_ENABLE_SHOP_CTA, true),
  enablePremiumAICTA: readBoolean(process.env.NEXT_PUBLIC_ENABLE_PREMIUM_AI_CTA, true),
  enableAffiliateLinks: readBoolean(process.env.NEXT_PUBLIC_ENABLE_AFFILIATE_LINKS, false),
  trackingEnabled: enableMonetizationTrackingFlag,
  defaultCurrency: "INR",
  supportedCurrencies: readList(
    process.env.NEXT_PUBLIC_SUPPORTED_CURRENCIES,
    currencyFallback
  ),
  consultationUrl: "/consultation",
  reportsUrl: "/reports",
  shopUrl: "/shop",
  navagrahaAIUrl: "/ai",
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "",
} as const;

export function isMonetizationTrackingEnabled() {
  return monetizationConfig.trackingEnabled;
}

export function isAdSenseReady() {
  return Boolean(
    monetizationConfig.enableAdsense &&
      monetizationConfig.adsensePublisherId &&
      monetizationConfig.adsenseDefaultSlotId
  );
}

export function shouldRenderMonetizationPlacement(placement: MonetizationPlacement) {
  return monetizationPlacements.includes(placement);
}
