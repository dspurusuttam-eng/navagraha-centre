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
  const databaseUrl = getStringValue(env, "DATABASE_URL");
  const authSecret = getStringValue(env, "BETTER_AUTH_SECRET");
  const authUrl = getResolvedAuthUrl(env, publicEnvironment);
  const aiProvider = getStringValue(env, "AI_PROVIDER") || "mock-curated";
  const astrologyProvider =
    getStringValue(env, "ASTROLOGY_PROVIDER") || "mock-deterministic";

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
