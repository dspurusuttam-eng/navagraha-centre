import type { NavagrahaIconRegistryKey } from "@/components/icons/navagraha-icon-registry";

export type FeatureVisibility = "LIVE" | "COMING_SOON" | "HIDDEN" | "INTERNAL_ONLY";
export type FeatureAccess = "PUBLIC" | "AUTHENTICATED" | "ADMIN";
export type FeatureIconKey = NavagrahaIconRegistryKey | "text-fallback";
export type FeatureNavigationSurface =
  | "PRIMARY"
  | "SECONDARY"
  | "FOOTER_ONLY"
  | "HIDDEN"
  | "MISSING";

export type FeatureStatusRegistryEntry = {
  featureKey: string;
  label: string;
  route: string;
  iconKey: FeatureIconKey;
  visibility: FeatureVisibility;
  runtimeEnabled: boolean;
  dependsOnSwiss: boolean;
  access: FeatureAccess;
  navigationSurface?: FeatureNavigationSurface;
};

export const featureStatusRegistry = [
  {
    featureKey: "home",
    label: "Home",
    route: "/",
    iconKey: "Home",
    visibility: "LIVE",
    runtimeEnabled: true,
    dependsOnSwiss: false,
    access: "PUBLIC",
    navigationSurface: "PRIMARY",
  },
  {
    featureKey: "desk",
    label: "Desk",
    route: "/from-the-desk",
    iconKey: "text-fallback",
    visibility: "LIVE",
    runtimeEnabled: true,
    dependsOnSwiss: false,
    access: "PUBLIC",
    navigationSurface: "PRIMARY",
  },
  {
    featureKey: "consult",
    label: "Consult",
    route: "/consultation",
    iconKey: "Consult",
    visibility: "LIVE",
    runtimeEnabled: true,
    dependsOnSwiss: false,
    access: "PUBLIC",
    navigationSurface: "PRIMARY",
  },
  {
    featureKey: "acharya",
    label: "Acharya",
    route: "/joy-prakash-sarmah",
    iconKey: "Consult",
    visibility: "LIVE",
    runtimeEnabled: true,
    dependsOnSwiss: false,
    access: "PUBLIC",
  },
  {
    featureKey: "search",
    label: "Search",
    route: "/from-the-desk?q=",
    iconKey: "text-fallback",
    visibility: "LIVE",
    runtimeEnabled: true,
    dependsOnSwiss: false,
    access: "PUBLIC",
  },
  {
    featureKey: "account",
    label: "Account",
    route: "/dashboard",
    iconKey: "Account",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: false,
    access: "AUTHENTICATED",
    navigationSurface: "HIDDEN",
  },
  {
    featureKey: "sign-in",
    label: "Sign In",
    route: "/sign-in",
    iconKey: "Account",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: false,
    access: "PUBLIC",
  },
  {
    featureKey: "support",
    label: "Support",
    route: "/support",
    iconKey: "text-fallback",
    visibility: "LIVE",
    runtimeEnabled: true,
    dependsOnSwiss: false,
    access: "PUBLIC",
  },
  {
    featureKey: "contact",
    label: "Contact",
    route: "/contact",
    iconKey: "text-fallback",
    visibility: "LIVE",
    runtimeEnabled: true,
    dependsOnSwiss: false,
    access: "PUBLIC",
    navigationSurface: "FOOTER_ONLY",
  },
  {
    featureKey: "privacy",
    label: "Privacy",
    route: "/privacy",
    iconKey: "text-fallback",
    visibility: "LIVE",
    runtimeEnabled: true,
    dependsOnSwiss: false,
    access: "PUBLIC",
  },
  {
    featureKey: "terms",
    label: "Terms",
    route: "/terms",
    iconKey: "text-fallback",
    visibility: "LIVE",
    runtimeEnabled: true,
    dependsOnSwiss: false,
    access: "PUBLIC",
  },
  {
    featureKey: "disclaimer",
    label: "Disclaimer",
    route: "/disclaimer",
    iconKey: "text-fallback",
    visibility: "LIVE",
    runtimeEnabled: true,
    dependsOnSwiss: false,
    access: "PUBLIC",
  },
  {
    featureKey: "methodology",
    label: "Method",
    route: "/methodology",
    iconKey: "text-fallback",
    visibility: "LIVE",
    runtimeEnabled: true,
    dependsOnSwiss: false,
    access: "PUBLIC",
    navigationSurface: "FOOTER_ONLY",
  },
  {
    featureKey: "refund-cancellation",
    label: "Refund",
    route: "/refund",
    iconKey: "text-fallback",
    visibility: "LIVE",
    runtimeEnabled: true,
    dependsOnSwiss: false,
    access: "PUBLIC",
  },
  {
    featureKey: "learn",
    label: "Learn",
    route: "/learn",
    iconKey: "Learn",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: false,
    access: "PUBLIC",
    navigationSurface: "HIDDEN",
  },
  {
    featureKey: "shop",
    label: "Shop",
    route: "/shop",
    iconKey: "Shop",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: false,
    access: "PUBLIC",
    navigationSurface: "HIDDEN",
  },
  {
    featureKey: "about",
    label: "About",
    route: "/about",
    iconKey: "text-fallback",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: false,
    access: "PUBLIC",
    navigationSurface: "MISSING",
  },
  {
    featureKey: "ask-ni",
    label: "Ask NI",
    route: "/ai",
    iconKey: "Ask NI",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: false,
    access: "PUBLIC",
  },
  {
    featureKey: "kundli",
    label: "Kundli",
    route: "/kundli",
    iconKey: "Kundli",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: true,
    access: "PUBLIC",
  },
  {
    featureKey: "saved-kundli",
    label: "Saved Kundli",
    route: "/dashboard/kundli",
    iconKey: "Kundli",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: true,
    access: "AUTHENTICATED",
  },
  {
    featureKey: "panchang",
    label: "Panchang",
    route: "/panchang",
    iconKey: "Panchang",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: true,
    access: "PUBLIC",
  },
  {
    featureKey: "rashifal",
    label: "Rashifal",
    route: "/rashifal",
    iconKey: "Rashifal",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: true,
    access: "PUBLIC",
  },
  {
    featureKey: "daily-horoscope",
    label: "Daily Horoscope",
    route: "/daily-horoscope",
    iconKey: "Rashifal",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: true,
    access: "PUBLIC",
  },
  {
    featureKey: "today-decision",
    label: "Today Decision",
    route: "/dashboard",
    iconKey: "Panchang",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: true,
    access: "AUTHENTICATED",
  },
  {
    featureKey: "dasha",
    label: "Dasha",
    route: "/dasha",
    iconKey: "Dasha",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: true,
    access: "PUBLIC",
  },
  {
    featureKey: "gochar",
    label: "Gochar",
    route: "/transit",
    iconKey: "Gochar",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: true,
    access: "PUBLIC",
  },
  {
    featureKey: "ashtakavarga",
    label: "Ashtakavarga",
    route: "/dashboard/chart",
    iconKey: "Kundli",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: true,
    access: "AUTHENTICATED",
  },
  {
    featureKey: "shodashvarga",
    label: "Shodashvarga",
    route: "/dashboard/chart",
    iconKey: "Kundli",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: true,
    access: "AUTHENTICATED",
  },
  {
    featureKey: "muhurat",
    label: "Muhurat",
    route: "/muhurat",
    iconKey: "Muhurat",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: true,
    access: "PUBLIC",
  },
  {
    featureKey: "muhurta",
    label: "Muhurta",
    route: "/muhurta",
    iconKey: "Muhurat",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: true,
    access: "PUBLIC",
  },
  {
    featureKey: "matchmaking",
    label: "Matchmaking",
    route: "/matchmaking",
    iconKey: "Marriage Matching",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: true,
    access: "PUBLIC",
  },
  {
    featureKey: "reports",
    label: "Reports",
    route: "/reports",
    iconKey: "Report",
    visibility: "HIDDEN",
    runtimeEnabled: false,
    dependsOnSwiss: true,
    access: "PUBLIC",
  },
  {
    featureKey: "numerology",
    label: "Numerology",
    route: "/numerology",
    iconKey: "Name Number",
    visibility: "COMING_SOON",
    runtimeEnabled: false,
    dependsOnSwiss: false,
    access: "PUBLIC",
  },
  {
    featureKey: "remedies",
    label: "Remedies",
    route: "/remedies",
    iconKey: "Remedy",
    visibility: "COMING_SOON",
    runtimeEnabled: false,
    dependsOnSwiss: false,
    access: "PUBLIC",
  },
  {
    featureKey: "admin",
    label: "Admin",
    route: "/admin",
    iconKey: "text-fallback",
    visibility: "INTERNAL_ONLY",
    runtimeEnabled: true,
    dependsOnSwiss: false,
    access: "ADMIN",
  },
] as const satisfies readonly FeatureStatusRegistryEntry[];

export type FeatureKey = (typeof featureStatusRegistry)[number]["featureKey"];
export type FeatureStatusRecord = (typeof featureStatusRegistry)[number];

export function getFeatureStatus(featureKey: FeatureKey) {
  const feature = featureStatusRegistry.find(
    (entry) => entry.featureKey === featureKey
  );

  if (!feature) {
    throw new Error(`Unknown feature status key: ${featureKey}`);
  }

  return feature;
}

export const liveFeatures = featureStatusRegistry.filter(
  (feature) => feature.visibility === "LIVE"
);

export const hiddenFeatures = featureStatusRegistry.filter(
  (feature) => feature.visibility === "HIDDEN"
);

export const swissDependentFeatures = featureStatusRegistry.filter(
  (feature) => feature.dependsOnSwiss
);

export const runtimeDisabledFeatures = featureStatusRegistry.filter(
  (feature) => !feature.runtimeEnabled
);

export const primaryNavigationFeatures = featureStatusRegistry.filter(
  (feature) =>
    "navigationSurface" in feature && feature.navigationSurface === "PRIMARY"
);
