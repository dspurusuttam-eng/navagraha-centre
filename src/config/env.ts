type RawEnvironment = NodeJS.ProcessEnv | Record<string, string | undefined>;

export type EnvironmentValidationIssue = {
  key: string;
  severity: "error" | "warning";
  message: string;
};

export type LaunchEnvironmentValidation = {
  valid: boolean;
  issues: EnvironmentValidationIssue[];
  publicEnvironment: {
    siteUrl: string;
    siteName: string;
    analyticsEnabled: boolean;
    observabilityEndpoint: string;
  };
};

const defaultPublicEnvironment = {
  siteUrl: "http://localhost:3000",
  siteName: "NAVAGRAHA CENTRE",
  analyticsEnabled: false,
  observabilityEndpoint: "/api/observability/web-vitals",
} as const;

const productionPublicEnvironment = {
  siteUrl: "https://www.navagrahacentre.com",
} as const;

const allowedPublicEnvironmentKeys = new Set([
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SITE_NAME",
  "NEXT_PUBLIC_ANALYTICS_ENABLED",
  "NEXT_PUBLIC_OBSERVABILITY_ENDPOINT",
]);

const sensitivePublicEnvPattern =
  /(SECRET|TOKEN|PASSWORD|PRIVATE|WEBHOOK|API_KEY)/i;

function toHttpsUrl(host: string) {
  const normalizedHost = host.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  return normalizedHost ? `https://${normalizedHost}` : "";
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getStringValue(env: RawEnvironment, key: string) {
  const value = env[key];

  return typeof value === "string" ? value.trim() : "";
}

function pushIssue(
  issues: EnvironmentValidationIssue[],
  key: string,
  severity: EnvironmentValidationIssue["severity"],
  message: string
) {
  issues.push({ key, severity, message });
}

function validateTrustedOrigins(
  env: RawEnvironment,
  issues: EnvironmentValidationIssue[]
) {
  const rawOrigins = getStringValue(env, "BETTER_AUTH_TRUSTED_ORIGINS");

  if (!rawOrigins) {
    return;
  }

  for (const origin of rawOrigins.split(",")) {
    const normalizedOrigin = origin.trim();

    if (!normalizedOrigin) {
      continue;
    }

    if (!isValidUrl(normalizedOrigin)) {
      pushIssue(
        issues,
        "BETTER_AUTH_TRUSTED_ORIGINS",
        "error",
        `Trusted origin "${normalizedOrigin}" is not a valid URL.`
      );
    }
  }
}

function validatePublicEnvironmentExposure(
  env: RawEnvironment,
  issues: EnvironmentValidationIssue[]
) {
  for (const [key, rawValue] of Object.entries(env)) {
    if (!key.startsWith("NEXT_PUBLIC_")) {
      continue;
    }

    if (allowedPublicEnvironmentKeys.has(key)) {
      continue;
    }

    const value = typeof rawValue === "string" ? rawValue.trim() : "";

    if (!value) {
      continue;
    }

    if (sensitivePublicEnvPattern.test(key)) {
      pushIssue(
        issues,
        key,
        "error",
        "Sensitive server secret appears to be exposed with a NEXT_PUBLIC_ prefix."
      );
    }
  }
}

function isVercelProduction(env: RawEnvironment) {
  return getStringValue(env, "VERCEL_ENV") === "production";
}

export function getPublicEnvironment(env: RawEnvironment = process.env) {
  const configuredSiteUrl = getStringValue(env, "NEXT_PUBLIC_SITE_URL");
  const productionHost =
    getStringValue(env, "VERCEL_PROJECT_PRODUCTION_URL") ||
    getStringValue(env, "VERCEL_URL");
  const fallbackSiteUrl = productionHost ? toHttpsUrl(productionHost) : "";
  const siteUrl = isVercelProduction(env)
    ? productionPublicEnvironment.siteUrl
    : configuredSiteUrl || fallbackSiteUrl || defaultPublicEnvironment.siteUrl;

  return {
    siteUrl,
    siteName:
      getStringValue(env, "NEXT_PUBLIC_SITE_NAME") ||
      defaultPublicEnvironment.siteName,
    analyticsEnabled:
      getStringValue(env, "NEXT_PUBLIC_ANALYTICS_ENABLED") === "true",
    observabilityEndpoint:
      getStringValue(env, "NEXT_PUBLIC_OBSERVABILITY_ENDPOINT") ||
      defaultPublicEnvironment.observabilityEndpoint,
  };
}

export function getRequiredServerEnvironmentValue(
  key: string,
  env: RawEnvironment = process.env
) {
  const value = getStringValue(env, key);

  if (!value) {
    throw new Error(
      `${key} is not configured. Add it to your environment before using this feature.`
    );
  }

  return value;
}

function getResolvedAuthUrl(
  env: RawEnvironment,
  publicEnvironment = getPublicEnvironment(env)
) {
  return getStringValue(env, "BETTER_AUTH_URL") || publicEnvironment.siteUrl;
}

export function validateLaunchEnvironment(
  env: RawEnvironment = process.env
): LaunchEnvironmentValidation {
  const issues: EnvironmentValidationIssue[] = [];
  const publicEnvironment = getPublicEnvironment(env);
  const productionRuntime = isVercelProduction(env);
  const databaseUrl = getStringValue(env, "DATABASE_URL");
  const authSecret = getStringValue(env, "BETTER_AUTH_SECRET");
  const authUrl = getResolvedAuthUrl(env, publicEnvironment);
  const trustedOrigins = getStringValue(env, "BETTER_AUTH_TRUSTED_ORIGINS");
  const aiProvider = getStringValue(env, "AI_PROVIDER") || "mock-curated";
  const astrologyProvider =
    getStringValue(env, "ASTROLOGY_PROVIDER") || "mock-deterministic";
  const opsAlertsEnabled = getStringValue(env, "OPS_ALERTS_ENABLED") === "true";
  const opsAlertWebhookUrl = getStringValue(env, "OPS_ALERT_WEBHOOK_URL");
  const healthCheckUrl = getStringValue(env, "OPS_HEALTHCHECK_URL");
  const healthCheckTimeout = getStringValue(
    env,
    "OPS_HEALTHCHECK_TIMEOUT_MS"
  );
  const geocodingProvider =
    getStringValue(env, "GEOCODING_PROVIDER").toLowerCase() || "opencage";
  const geocodingApiKey =
    getStringValue(env, "GEOCODING_API_KEY") ||
    getStringValue(env, "OPENCAGE_API_KEY");
  const shopCheckoutProvider =
    getStringValue(env, "SHOP_CHECKOUT_PROVIDER").toLowerCase() ||
    "draft-order";
  const shopDraftWebhookSecret = getStringValue(
    env,
    "SHOP_DRAFT_WEBHOOK_SECRET"
  );
  const shopWebhookSecret = getStringValue(env, "SHOP_WEBHOOK_SECRET");
  const razorpayKeyId = getStringValue(env, "RAZORPAY_KEY_ID");
  const razorpayKeySecret = getStringValue(env, "RAZORPAY_KEY_SECRET");
  const razorpayWebhookSecret =
    getStringValue(env, "RAZORPAY_WEBHOOK_SECRET") ||
    shopWebhookSecret;
  const resendApiKey = getStringValue(env, "RESEND_API_KEY");
  const authResetFromEmail = getStringValue(env, "AUTH_RESET_FROM_EMAIL");

  if (!databaseUrl) {
    pushIssue(
      issues,
      "DATABASE_URL",
      "error",
      "Database access is required for launch readiness."
    );
  }

  if (!authSecret) {
    pushIssue(
      issues,
      "BETTER_AUTH_SECRET",
      "error",
      "Authentication secret is required for secure production sessions."
    );
  }

  if (!isValidUrl(authUrl)) {
    pushIssue(
      issues,
      "BETTER_AUTH_URL",
      "error",
      "Authentication base URL must be a valid absolute URL."
    );
  }

  if (productionRuntime && !trustedOrigins) {
    pushIssue(
      issues,
      "BETTER_AUTH_TRUSTED_ORIGINS",
      "error",
      "Trusted origins are required in production to avoid auth-origin failures."
    );
  }

  if (!isValidUrl(publicEnvironment.siteUrl)) {
    pushIssue(
      issues,
      "NEXT_PUBLIC_SITE_URL",
      "error",
      "Public site URL must be a valid absolute URL."
    );
  }

  if (
    publicEnvironment.observabilityEndpoint &&
    !publicEnvironment.observabilityEndpoint.startsWith("/") &&
    !isValidUrl(publicEnvironment.observabilityEndpoint)
  ) {
    pushIssue(
      issues,
      "NEXT_PUBLIC_OBSERVABILITY_ENDPOINT",
      "error",
      "Observability endpoint must be a relative path or a valid absolute URL."
    );
  }

  validateTrustedOrigins(env, issues);
  validatePublicEnvironmentExposure(env, issues);

  if (geocodingProvider !== "opencage") {
    pushIssue(
      issues,
      "GEOCODING_PROVIDER",
      "warning",
      `Unsupported geocoding provider "${geocodingProvider}". Use GEOCODING_PROVIDER=opencage.`
    );
  }

  if (!geocodingApiKey) {
    pushIssue(
      issues,
      "GEOCODING_API_KEY",
      productionRuntime ? "error" : "warning",
      productionRuntime
        ? "GEOCODING_API_KEY is required in production for birth place resolution."
        : "Birthplace geocoding/timezone resolution will be unavailable without GEOCODING_API_KEY."
    );
  }

  if (aiProvider === "openai-responses") {
    if (!getStringValue(env, "OPENAI_API_KEY")) {
      pushIssue(
        issues,
        "OPENAI_API_KEY",
        "error",
        "OpenAI API key is required when AI_PROVIDER=openai-responses."
      );
    }

    if (!getStringValue(env, "OPENAI_MODEL")) {
      pushIssue(
        issues,
        "OPENAI_MODEL",
        "error",
        "OpenAI model is required when AI_PROVIDER=openai-responses."
      );
    }
  }

  if (astrologyProvider === "circular-natal-real" && !databaseUrl) {
    pushIssue(
      issues,
      "ASTROLOGY_PROVIDER",
      "warning",
      "The live astrology adapter is enabled, but the database is not configured in this environment."
    );
  }

  if (opsAlertsEnabled && !opsAlertWebhookUrl) {
    pushIssue(
      issues,
      "OPS_ALERT_WEBHOOK_URL",
      "warning",
      "Ops alerting is enabled but no OPS_ALERT_WEBHOOK_URL is configured."
    );
  }

  if (healthCheckUrl && !isValidUrl(healthCheckUrl)) {
    pushIssue(
      issues,
      "OPS_HEALTHCHECK_URL",
      "error",
      "OPS_HEALTHCHECK_URL must be a valid absolute URL."
    );
  }

  if (healthCheckTimeout) {
    const timeout = Number(healthCheckTimeout);

    if (!Number.isFinite(timeout) || timeout <= 0) {
      pushIssue(
        issues,
        "OPS_HEALTHCHECK_TIMEOUT_MS",
        "error",
        "OPS_HEALTHCHECK_TIMEOUT_MS must be a positive number."
      );
    }
  }

  if (
    shopCheckoutProvider !== "draft-order" &&
    shopCheckoutProvider !== "razorpay" &&
    shopCheckoutProvider !== "stripe"
  ) {
    pushIssue(
      issues,
      "SHOP_CHECKOUT_PROVIDER",
      "error",
      `Unsupported SHOP_CHECKOUT_PROVIDER value "${shopCheckoutProvider}".`
    );
  }

  if (shopCheckoutProvider === "draft-order" && !shopDraftWebhookSecret) {
    pushIssue(
      issues,
      "SHOP_DRAFT_WEBHOOK_SECRET",
      productionRuntime ? "error" : "warning",
      productionRuntime
        ? "SHOP_DRAFT_WEBHOOK_SECRET is required in production for webhook verification."
        : "Draft webhook verification is not configured."
    );
  }

  if (shopCheckoutProvider === "razorpay") {
    if (!razorpayKeyId || !razorpayKeySecret) {
      pushIssue(
        issues,
        "RAZORPAY_KEY_ID",
        productionRuntime ? "error" : "warning",
        "Razorpay checkout is selected but RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET are not fully configured."
      );
    }

    if (!razorpayWebhookSecret) {
      pushIssue(
        issues,
        "RAZORPAY_WEBHOOK_SECRET",
        productionRuntime ? "error" : "warning",
        "Razorpay webhook verification is not fully configured."
      );
    }
  }

  if (productionRuntime && (!resendApiKey || !authResetFromEmail)) {
    pushIssue(
      issues,
      "RESEND_API_KEY",
      "error",
      "Password reset email delivery is not fully configured (RESEND_API_KEY and AUTH_RESET_FROM_EMAIL are required)."
    );
  }

  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    issues,
    publicEnvironment,
  };
}

export function formatEnvironmentValidation(
  validation: LaunchEnvironmentValidation
) {
  if (!validation.issues.length) {
    return "Environment validation passed.";
  }

  return validation.issues
    .map(
      (issue) =>
        `[${issue.severity.toUpperCase()}] ${issue.key}: ${issue.message}`
    )
    .join("\n");
}
