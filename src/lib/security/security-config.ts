type SecurityRuntime = "development" | "test" | "production";

export type SecurityRateLimitPolicy = {
  limit: number;
  windowMs: number;
};

export type SecurityRateLimitPolicyKey =
  | "ai-session-create"
  | "ai-session-read"
  | "ai-message"
  | "birth-context-resolve"
  | "panchang-public"
  | "muhurta-public"
  | "calculators-public"
  | "premium-report-generate"
  | "admin-snapshot-events"
  | "shop-checkout-init"
  | "subscriptions-checkout"
  | "analytics-event"
  | "web-vitals";

export type SecurityConfig = {
  runtime: SecurityRuntime;
  isProduction: boolean;
  siteUrl: string;
  trustedOrigins: string[];
  trustedDomains: string[];
  rateLimit: {
    enabled: boolean;
    aiEnabled: boolean;
    policies: Record<SecurityRateLimitPolicyKey, SecurityRateLimitPolicy>;
    formSubmissionLimits: {
      contact: number;
      consultation: number;
      reportRequest: number;
    };
  };
  payload: {
    maxJsonBytes: number;
    maxPromptLength: number;
    maxMessageLength: number;
  };
  spamProtection: {
    minSubmitElapsedMs: number;
    honeypotField: string;
    startedAtField: string;
  };
  headers: {
    applyCsp: boolean;
    cspReportOnly: boolean;
  };
  logging: {
    includeDebugContext: boolean;
  };
  payment: {
    webhookSecretConfigured: boolean;
  };
  admin: {
    allowlistedEmails: string[];
  };
  turnstile: {
    secretKey: string;
    siteKey: string;
    enabled: boolean;
    enforce: boolean;
    verifyEndpoint: string;
  };
};

function readString(key: string) {
  return process.env[key]?.trim() ?? "";
}

function readBoolean(key: string, fallback: boolean) {
  const value = readString(key).toLowerCase();

  if (!value) {
    return fallback;
  }

  return value === "1" || value === "true" || value === "yes";
}

function readPositiveInt(key: string, fallback: number) {
  const value = Number(readString(key));

  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.floor(value);
}

function normalizeOrigin(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    try {
      return new URL(`https://${trimmed}`).origin;
    } catch {
      return null;
    }
  }
}

function parseOrigins(value: string) {
  return value
    .split(/[\s,;]+/g)
    .map((entry) => normalizeOrigin(entry))
    .filter((entry): entry is string => Boolean(entry));
}

function getSiteUrl() {
  const configuredSiteUrl =
    readString("SITE_URL") || readString("NEXT_PUBLIC_SITE_URL");

  return (
    normalizeOrigin(configuredSiteUrl) ??
    normalizeOrigin(readString("BETTER_AUTH_URL")) ??
    "http://localhost:3000"
  );
}

function getTrustedOrigins(siteUrl: string) {
  const trustedOrigins = new Set<string>([siteUrl]);
  const sources = [
    readString("BETTER_AUTH_TRUSTED_ORIGINS"),
    readString("SECURITY_ALLOWED_ORIGINS"),
    readString("BETTER_AUTH_URL"),
    readString("NEXT_PUBLIC_SITE_URL"),
    readString("SITE_URL"),
    readString("VERCEL_PROJECT_PRODUCTION_URL"),
    readString("VERCEL_BRANCH_URL"),
    readString("VERCEL_URL"),
  ];

  for (const source of sources) {
    for (const origin of parseOrigins(source)) {
      trustedOrigins.add(origin);
    }
  }

  return [...trustedOrigins];
}

function extractTrustedDomains(origins: string[]) {
  const domains = new Set<string>();

  for (const origin of origins) {
    try {
      domains.add(new URL(origin).hostname.toLowerCase());
    } catch {
      continue;
    }
  }

  return [...domains];
}

function resolveRuntime(): SecurityRuntime {
  const runtime = readString("NODE_ENV").toLowerCase();

  if (runtime === "production") {
    return "production";
  }

  if (runtime === "test") {
    return "test";
  }

  return "development";
}

function buildRateLimitPolicies(): Record<
  SecurityRateLimitPolicyKey,
  SecurityRateLimitPolicy
> {
  return {
    "ai-session-create": {
      limit: readPositiveInt("AI_SESSION_CREATE_RATE_LIMIT", 20),
      windowMs: readPositiveInt("AI_SESSION_CREATE_RATE_WINDOW_MS", 10 * 60 * 1_000),
    },
    "ai-session-read": {
      limit: readPositiveInt("AI_SESSION_READ_RATE_LIMIT", 80),
      windowMs: readPositiveInt("AI_SESSION_READ_RATE_WINDOW_MS", 10 * 60 * 1_000),
    },
    "ai-message": {
      limit: readPositiveInt("AI_MESSAGE_RATE_LIMIT", 24),
      windowMs: readPositiveInt("AI_MESSAGE_RATE_WINDOW_MS", 10 * 60 * 1_000),
    },
    "birth-context-resolve": {
      limit: readPositiveInt("BIRTH_CONTEXT_RESOLVE_RATE_LIMIT", 12),
      windowMs: readPositiveInt(
        "BIRTH_CONTEXT_RESOLVE_RATE_WINDOW_MS",
        10 * 60 * 1_000
      ),
    },
    "panchang-public": {
      limit: readPositiveInt("PANCHANG_RATE_LIMIT", 30),
      windowMs: readPositiveInt("PANCHANG_RATE_WINDOW_MS", 10 * 60 * 1_000),
    },
    "muhurta-public": {
      limit: readPositiveInt("MUHURTA_RATE_LIMIT", 30),
      windowMs: readPositiveInt("MUHURTA_RATE_WINDOW_MS", 10 * 60 * 1_000),
    },
    "calculators-public": {
      limit: readPositiveInt("CALCULATORS_RATE_LIMIT", 45),
      windowMs: readPositiveInt("CALCULATORS_RATE_WINDOW_MS", 10 * 60 * 1_000),
    },
    "premium-report-generate": {
      limit: readPositiveInt("REPORT_REQUEST_RATE_LIMIT", 8),
      windowMs: readPositiveInt("REPORT_REQUEST_RATE_WINDOW_MS", 10 * 60 * 1_000),
    },
    "admin-snapshot-events": {
      limit: readPositiveInt("ADMIN_SNAPSHOT_EVENT_RATE_LIMIT", 30),
      windowMs: readPositiveInt(
        "ADMIN_SNAPSHOT_EVENT_RATE_WINDOW_MS",
        10 * 60 * 1_000
      ),
    },
    "shop-checkout-init": {
      limit: readPositiveInt("SHOP_CHECKOUT_RATE_LIMIT", 8),
      windowMs: readPositiveInt("SHOP_CHECKOUT_RATE_WINDOW_MS", 10 * 60 * 1_000),
    },
    "subscriptions-checkout": {
      limit: readPositiveInt("SUBSCRIPTION_CHECKOUT_RATE_LIMIT", 10),
      windowMs: readPositiveInt(
        "SUBSCRIPTION_CHECKOUT_RATE_WINDOW_MS",
        10 * 60 * 1_000
      ),
    },
    "analytics-event": {
      limit: readPositiveInt("ANALYTICS_EVENT_RATE_LIMIT", 180),
      windowMs: readPositiveInt("ANALYTICS_EVENT_RATE_WINDOW_MS", 5 * 60 * 1_000),
    },
    "web-vitals": {
      limit: readPositiveInt("WEB_VITALS_RATE_LIMIT", 120),
      windowMs: readPositiveInt("WEB_VITALS_RATE_WINDOW_MS", 5 * 60 * 1_000),
    },
  };
}

function buildSecurityConfig(): SecurityConfig {
  const runtime = resolveRuntime();
  const isProduction = runtime === "production";
  const siteUrl = getSiteUrl();
  const trustedOrigins = getTrustedOrigins(siteUrl);

  return {
    runtime,
    isProduction,
    siteUrl,
    trustedOrigins,
    trustedDomains: extractTrustedDomains(trustedOrigins),
    rateLimit: {
      enabled: readBoolean("RATE_LIMIT_ENABLED", true),
      aiEnabled: readBoolean("AI_RATE_LIMIT_ENABLED", true),
      policies: buildRateLimitPolicies(),
      formSubmissionLimits: {
        contact: readPositiveInt("CONTACT_FORM_RATE_LIMIT", 10),
        consultation: readPositiveInt("CONSULTATION_RATE_LIMIT", 5),
        reportRequest: readPositiveInt("REPORT_REQUEST_RATE_LIMIT", 8),
      },
    },
    payload: {
      maxJsonBytes: readPositiveInt("SECURITY_MAX_JSON_BYTES", 20_000),
      maxPromptLength: readPositiveInt("SECURITY_MAX_PROMPT_LENGTH", 1_200),
      maxMessageLength: readPositiveInt("SECURITY_MAX_MESSAGE_LENGTH", 700),
    },
    spamProtection: {
      minSubmitElapsedMs: readPositiveInt("SPAM_MIN_SUBMIT_MS", 800),
      honeypotField: readString("SPAM_HONEYPOT_FIELD") || "company",
      startedAtField: readString("SPAM_STARTED_AT_FIELD") || "startedAt",
    },
    headers: {
      applyCsp: readBoolean("SECURITY_ENABLE_CSP", true),
      cspReportOnly: readBoolean("SECURITY_CSP_REPORT_ONLY", false),
    },
    logging: {
      includeDebugContext: !isProduction,
    },
    payment: {
      webhookSecretConfigured: Boolean(
        readString("RAZORPAY_WEBHOOK_SECRET") || readString("SHOP_WEBHOOK_SECRET")
      ),
    },
    admin: {
      allowlistedEmails: readString("ADMIN_EMAILS")
        .split(/[\s,;]+/g)
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    },
    turnstile: {
      secretKey: readString("TURNSTILE_SECRET_KEY"),
      siteKey: readString("NEXT_PUBLIC_TURNSTILE_SITE_KEY"),
      enabled: Boolean(
        readString("TURNSTILE_SECRET_KEY") &&
          readString("NEXT_PUBLIC_TURNSTILE_SITE_KEY")
      ),
      enforce: readBoolean("TURNSTILE_ENFORCE", false),
      verifyEndpoint:
        readString("TURNSTILE_VERIFY_ENDPOINT") ||
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    },
  };
}

export const securityConfig = buildSecurityConfig();

export function isTrustedOrigin(origin: string | null) {
  if (!origin) {
    return false;
  }

  return securityConfig.trustedOrigins.includes(origin);
}

export function getRateLimitPolicy(policyKey: SecurityRateLimitPolicyKey) {
  return securityConfig.rateLimit.policies[policyKey];
}
