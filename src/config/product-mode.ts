export type ProductMode = "DESK_CONSULTATION";

export type ProductRouteDisposition =
  | "PUBLIC_ALLOWLIST"
  | "HIDDEN"
  | "REDIRECT_REQUIRED"
  | "RESERVED_PRIVATE"
  | "RESERVED_PRIVATE_ADMIN"
  | "STATIC_METADATA"
  | "PUBLIC_CONTENT_API"
  | "DISABLED_CALCULATION_API";

export type ProductRoutePattern = {
  readonly pattern: string;
  readonly disposition: ProductRouteDisposition;
  readonly localeAware?: boolean;
  readonly notes: string;
};

export type SwissExecutionEntryPoint = {
  readonly file: string;
  readonly entryPoint: string;
  readonly executionPath: string;
  readonly notes: string;
};

export const productModeContract = {
  PUBLIC_PRODUCT_MODE: "DESK_CONSULTATION",
  SWISS_RUNTIME_ENABLED: false,
  PUBLIC_CALCULATION_ENGINES_ENABLED: false,
  PUBLIC_ACCOUNTS_ENABLED: false,
  PRIVATE_ADMIN_CONSOLE_ENABLED: true,
  PRIVATE_ADMIN_AUTH_ENABLED: true,
  PUBLIC_AUTH_REGISTRATION_ENABLED: false,
} as const satisfies {
  readonly PUBLIC_PRODUCT_MODE: ProductMode;
  readonly SWISS_RUNTIME_ENABLED: boolean;
  readonly PUBLIC_CALCULATION_ENGINES_ENABLED: boolean;
  readonly PUBLIC_ACCOUNTS_ENABLED: boolean;
  readonly PRIVATE_ADMIN_CONSOLE_ENABLED: boolean;
  readonly PRIVATE_ADMIN_AUTH_ENABLED: boolean;
  readonly PUBLIC_AUTH_REGISTRATION_ENABLED: boolean;
};

export const twoUtilityLocalePrefixes = ["", "/en", "/as", "/hi"] as const;

export const twoUtilityPublicBaseRoutes = [
  "/",
  "/from-the-desk",
  "/from-the-desk/[slug]",
  "/consultation",
  "/joy-prakash-sarmah",
  "/methodology",
  "/support",
  "/contact",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/refund",
] as const;

export const twoUtilityStaticMetadataRoutes = [
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/icon.png",
  "/icon-16.png",
  "/icon-32.png",
  "/icon-48.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/manifest.webmanifest",
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image",
  "/twitter-image",
  "/_next/[asset]",
] as const;

export const twoUtilityRequiredPublicContentApis = [
  "/api/health",
  "/api/analytics/event",
  "/api/consultation/whatsapp-handoff",
  "/api/observability/web-vitals",
] as const;

export const twoUtilityReservedPrivatePrefixes = [] as const;

export const twoUtilityReservedPrivateAdminPrefixes = ["/admin", "/api/admin"] as const;

export const twoUtilityReservedPrivateAdminAuthApis = [
  "/api/auth/sign-in/email",
  "/api/auth/get-session",
  "/api/auth/sign-out",
] as const;

export const twoUtilityPublicAuthRegistrationApis = [
  "/api/auth/sign-up",
  "/api/auth/sign-up/email",
] as const;

export const twoUtilityAuthenticationEntryPoints = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/dashboard",
  "/account",
  "/settings",
] as const;

export const twoUtilityHiddenPublicRoutes = [
  "/about",
  "/ai",
  "/articles",
  "/blog",
  "/calculators",
  "/career-prediction",
  "/career-report",
  "/compatibility",
  "/compatibility-hub",
  "/consultation-explainer",
  "/daily-horoscope",
  "/daily-rashifal",
  "/dasha",
  "/dosha-yoga",
  "/finance-report",
  "/free-kundli-online",
  "/graha-hub",
  "/health-report",
  "/horoscope-hub",
  "/insights",
  "/kundli",
  "/kundli-ai",
  "/kundli-by-date-of-birth",
  "/learn",
  "/love-horoscope",
  "/marriage-compatibility",
  "/matchmaking",
  "/monthly-rashifal",
  "/muhurat",
  "/muhurta",
  "/nakshatra-hub",
  "/navagraha-ai",
  "/navagraha-ai-explainer",
  "/numerology",
  "/panchang",
  "/pricing",
  "/rashifal",
  "/refund-cancellation",
  "/remedies",
  "/reports",
  "/services",
  "/shop",
  "/style-guide",
  "/tools",
  "/transit",
] as const;

export const twoUtilityDisabledCalculationApis = [
  "/api/ai/ask-chart",
  "/api/astrology/birth-context/resolve",
  "/api/astrology/calculators",
  "/api/astrology/chart",
  "/api/astrology/daily-horoscope",
  "/api/astrology/muhurta-lite",
  "/api/astrology/panchang",
  "/api/astrology/today-decision",
  "/api/decision-desk/records",
  "/api/kundli/saved",
  "/api/platform/location-timezone",
  "/api/report/premium/generate",
  "/api/shop",
  "/api/subscriptions/checkout",
] as const;

export const twoUtilityRouteAuditInventory = [
  ...twoUtilityPublicBaseRoutes.map((pattern) => ({
    pattern,
    disposition: "PUBLIC_ALLOWLIST" as const,
    localeAware: true,
    notes: "Allowed public Desk and Consultation launch-mode route.",
  })),
  ...twoUtilityHiddenPublicRoutes.map((pattern) => ({
    pattern,
    disposition: "HIDDEN" as const,
    localeAware: true,
    notes: "Existing route preserved in code but hidden for Desk and Consultation launch mode.",
  })),
  ...twoUtilityAuthenticationEntryPoints.map((pattern) => ({
    pattern,
    disposition: "REDIRECT_REQUIRED" as const,
    localeAware: true,
    notes: "Account entry point is preserved but public accounts are disabled for launch mode.",
  })),
  ...twoUtilityStaticMetadataRoutes.map((pattern) => ({
    pattern,
    disposition: "STATIC_METADATA" as const,
    notes: "Required static or metadata route.",
  })),
  ...twoUtilityRequiredPublicContentApis.map((pattern) => ({
    pattern,
    disposition: "PUBLIC_CONTENT_API" as const,
    notes: "Required public operational content or telemetry API.",
  })),
  ...twoUtilityReservedPrivateAdminAuthApis.map((pattern) => ({
    pattern,
    disposition: "RESERVED_PRIVATE_ADMIN" as const,
    notes: "Better Auth endpoint preserved for future private Admin Console use while public accounts remain disabled.",
  })),
  ...twoUtilityDisabledCalculationApis.map((pattern) => ({
    pattern,
    disposition: "DISABLED_CALCULATION_API" as const,
    notes: "Calculation, account, shop, AI, or engine API preserved but disabled for public launch mode.",
  })),
  ...twoUtilityReservedPrivateAdminPrefixes.map((pattern) => ({
    pattern,
    disposition: "RESERVED_PRIVATE_ADMIN" as const,
    notes: "Reserved private Admin Console namespace; unavailable publicly until explicitly enabled.",
  })),
  ...twoUtilityReservedPrivatePrefixes.map((pattern) => ({
    pattern,
    disposition: "RESERVED_PRIVATE" as const,
    notes: "Reserved private namespace.",
  })),
] as const satisfies readonly ProductRoutePattern[];

export const twoUtilitySwissExecutionEntryPoints = [
  {
    file: "src/lib/astrology/swiss-module.ts",
    entryPoint: "getSwissEphModule",
    executionPath: "Lazy swisseph module loader used by astrology engines.",
    notes: "Uses require(\"swisseph\") and must remain preserved but not public-runtime reachable in launch mode.",
  },
  {
    file: "src/lib/astrology/ephemeris.ts",
    entryPoint: "getSwissEphemerisRuntime",
    executionPath: "Swiss Ephemeris runtime wrapper for chart calculation.",
    notes: "Calls swe_set_ephe_path, swe_set_sid_mode, swe_houses_ex, and swe_calc_ut.",
  },
  {
    file: "src/lib/astrology/chart-generator.ts",
    entryPoint: "generateCompleteChart",
    executionPath: "Complete Kundli chart generation path.",
    notes: "Consumes getSwissEphemerisRuntime for authenticated chart generation.",
  },
  {
    file: "src/lib/astrology/swiss-planetary-service.ts",
    entryPoint: "calculateCoreGrahaSiderealLongitudes*",
    executionPath: "Core planetary longitude calculations for Panchang, Gochar, and verification flows.",
    notes: "Calls swe_calc_ut and related Swiss setup functions.",
  },
  {
    file: "src/lib/astrology/lagna-engine.ts",
    entryPoint: "calculateLagna",
    executionPath: "Ascendant and house seed calculation path.",
    notes: "Uses getSwissEphModule and swe_houses_ex.",
  },
  {
    file: "src/lib/astrology/bhava-engine.ts",
    entryPoint: "calculateBhavaChalit",
    executionPath: "Bhava Chalit and house cusp calculation path.",
    notes: "Uses getSwissEphModule and swe_houses_ex2.",
  },
  {
    file: "src/modules/panchang/engine.ts",
    entryPoint: "calculatePanchang",
    executionPath: "Legacy Panchang engine path.",
    notes: "Uses planetary longitudes and swe_rise_trans.",
  },
  {
    file: "src/modules/panchang/premium/engine.ts",
    entryPoint: "buildPremiumPanchangSnapshot",
    executionPath: "Premium Panchang, Hora, and Choghadiya engine path.",
    notes: "Consumes Swiss-powered core planetary and rise/set calculations.",
  },
  {
    file: "src/modules/astrology/providers/swisseph-vedic-provider.ts",
    entryPoint: "SwissephVedicProvider",
    executionPath: "Provider abstraction over Swiss runtime.",
    notes: "Public engine surfaces should not instantiate it while Swiss runtime is disabled.",
  },
  {
    file: "src/modules/astrology/gochar/engine.ts",
    entryPoint: "calculateGocharSadeSati",
    executionPath: "Transit and Sade Sati calculation path.",
    notes: "Uses Swiss-powered samplers and core planetary longitude functions.",
  },
  {
    file: "src/lib/astrology/transit-engine.ts",
    entryPoint: "calculateTransits",
    executionPath: "Transit engine path.",
    notes: "Consumes calculateCoreGrahaSiderealLongitudesAtUtc.",
  },
  {
    file: "src/lib/astrology/house-engine.ts",
    entryPoint: "calculateHousePlacements",
    executionPath: "House placement path.",
    notes: "Consumes Swiss-powered planetary longitudes.",
  },
  {
    file: "src/lib/astrology/planetary-verifier.ts",
    entryPoint: "verifyPlanetaryPositions",
    executionPath: "Planetary verification and QA path.",
    notes: "Consumes calculateCoreGrahaSiderealLongitudes.",
  },
] as const satisfies readonly SwissExecutionEntryPoint[];


export const featureDisabledCode = "FEATURE_DISABLED" as const;

export class ProductModeFeatureDisabledError extends Error {
  readonly code = featureDisabledCode;

  constructor(message: string) {
    super(message);
    this.name = "ProductModeFeatureDisabledError";
  }
}

export function isSwissRuntimeEnabled() {
  return productModeContract.SWISS_RUNTIME_ENABLED;
}

export function isInternalSwissQaBypassEnabled() {
  return process.env.NAVAGRAHA_INTERNAL_SWISS_QA === "1";
}

export function assertSwissRuntimeEnabled(scope = "Swiss runtime") {
  if (!isSwissRuntimeEnabled() && !isInternalSwissQaBypassEnabled()) {
    throw new ProductModeFeatureDisabledError(
      `${scope} is disabled for Desk and Consultation launch mode.`
    );
  }
}

export function isPublicCalculationEnginesEnabled() {
  return productModeContract.PUBLIC_CALCULATION_ENGINES_ENABLED;
}

export function arePublicAccountsEnabled() {
  return productModeContract.PUBLIC_ACCOUNTS_ENABLED;
}

export function isPrivateAdminConsoleEnabled() {
  return productModeContract.PRIVATE_ADMIN_CONSOLE_ENABLED;
}

export function isPrivateAdminAuthEnabled() {
  return productModeContract.PRIVATE_ADMIN_AUTH_ENABLED;
}

export function isPublicAuthRegistrationEnabled() {
  return productModeContract.PUBLIC_AUTH_REGISTRATION_ENABLED;
}

export function canEnablePrivateAdminAccessWithoutReopeningPublicSurfaces() {
  return (
    isPrivateAdminConsoleEnabled() &&
    isPrivateAdminAuthEnabled() &&
    !arePublicAccountsEnabled() &&
    !isPublicAuthRegistrationEnabled() &&
    !isPublicCalculationEnginesEnabled() &&
    !isSwissRuntimeEnabled()
  );
}

export function isPrivateAdminAuthApi(pathname: string): boolean {
  const normalized = normalizeProductPath(pathname);

  return twoUtilityReservedPrivateAdminAuthApis.includes(
    normalized as (typeof twoUtilityReservedPrivateAdminAuthApis)[number]
  );
}

export function isPublicAuthRegistrationApi(pathname: string): boolean {
  const normalized = normalizeProductPath(pathname);

  return twoUtilityPublicAuthRegistrationApis.includes(
    normalized as (typeof twoUtilityPublicAuthRegistrationApis)[number]
  );
}

export function isPrivateAdminAuthRequestAllowed(
  pathname: string,
  method: string
): boolean {
  if (!isPrivateAdminAuthEnabled()) {
    return false;
  }

  const normalizedMethod = method.toUpperCase();
  const normalizedPath = normalizeProductPath(pathname);

  return (
    (normalizedMethod === "POST" &&
      (normalizedPath === "/api/auth/sign-in/email" ||
        normalizedPath === "/api/auth/sign-out")) ||
    (normalizedMethod === "GET" && normalizedPath === "/api/auth/get-session")
  );
}

const localePrefixesToStrip = twoUtilityLocalePrefixes.filter(
  (prefix): prefix is Exclude<(typeof twoUtilityLocalePrefixes)[number], ""> => prefix !== "",
);

export function normalizeProductPath(pathname: string): string {
  const withoutQuery = pathname.split(/[?#]/, 1)[0] ?? "/";
  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, "/");
  return collapsed.length > 1 ? collapsed.replace(/\/$/, "") : collapsed;
}

export function stripTwoUtilityLocalePrefix(pathname: string): string {
  const normalized = normalizeProductPath(pathname);
  for (const localePrefix of localePrefixesToStrip) {
    if (normalized === localePrefix) {
      return "/";
    }
    if (normalized.startsWith(`${localePrefix}/`)) {
      return normalizeProductPath(normalized.slice(localePrefix.length));
    }
  }
  return normalized;
}

function matchesPattern(pathname: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => pathname === pattern || pathname.startsWith(`${pattern}/`));
}

function matchesPublicAllowlist(pathname: string): boolean {
  if (pathname === "/from-the-desk" || pathname.startsWith("/from-the-desk/")) {
    return true;
  }

  return twoUtilityPublicBaseRoutes.some(
    (route) => route !== "/from-the-desk/[slug]" && pathname === route,
  );
}

function matchesStaticMetadataRoute(pathname: string): boolean {
  if (pathname.startsWith("/_next/") || pathname.startsWith("/icons/") || pathname.startsWith("/assets/")) {
    return true;
  }

  return twoUtilityStaticMetadataRoutes.some((route) => route !== "/_next/[asset]" && pathname === route);
}

export function isTwoUtilityPublicRoute(pathname: string): boolean {
  return matchesPublicAllowlist(stripTwoUtilityLocalePrefix(pathname));
}

export function classifyTwoUtilityPath(pathname: string): ProductRouteDisposition {
  const normalized = normalizeProductPath(pathname);
  const routePath = stripTwoUtilityLocalePrefix(normalized);

  if (matchesPattern(routePath, twoUtilityReservedPrivateAdminPrefixes)) {
    return "RESERVED_PRIVATE_ADMIN";
  }

  if (isPrivateAdminAuthApi(routePath)) {
    return "RESERVED_PRIVATE_ADMIN";
  }

  if (matchesPattern(routePath, twoUtilityReservedPrivatePrefixes)) {
    return "RESERVED_PRIVATE";
  }

  if (matchesPattern(routePath, twoUtilityDisabledCalculationApis)) {
    return "DISABLED_CALCULATION_API";
  }

  if (twoUtilityRequiredPublicContentApis.includes(routePath as (typeof twoUtilityRequiredPublicContentApis)[number])) {
    return "PUBLIC_CONTENT_API";
  }

  if (matchesStaticMetadataRoute(routePath)) {
    return "STATIC_METADATA";
  }

  if (matchesPublicAllowlist(routePath)) {
    return "PUBLIC_ALLOWLIST";
  }

  if (matchesPattern(routePath, twoUtilityAuthenticationEntryPoints)) {
    return "REDIRECT_REQUIRED";
  }

  if (matchesPattern(routePath, twoUtilityHiddenPublicRoutes)) {
    return "HIDDEN";
  }

  return "HIDDEN";
}
