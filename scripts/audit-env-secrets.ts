import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

type AuditIssue = {
  level: "error" | "warning";
  message: string;
};

const approvedKeys = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "BETTER_AUTH_TRUSTED_ORIGINS",
  "ASTROLOGY_PROVIDER",
  "AI_PROVIDER",
  "AI_USAGE_LOGGING",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SITE_NAME",
  "NEXT_PUBLIC_ANALYTICS_ENABLED",
  "NEXT_PUBLIC_OBSERVABILITY_ENDPOINT",
  "OPS_ALERTS_ENABLED",
  "OPS_ALERT_WEBHOOK_URL",
  "OPS_ALERT_ON_WARNINGS",
  "OPS_HEALTHCHECK_URL",
  "OPS_HEALTHCHECK_TIMEOUT_MS",
  "SMOKE_BASE_URL",
] as const;

const requiredKeys = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "BETTER_AUTH_TRUSTED_ORIGINS",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SITE_NAME",
] as const;

function parseEnvFile(envFilePath: string) {
  const file = readFileSync(envFilePath, "utf8");
  const entries = new Map<string, string>();

  for (const line of file.split(/\r?\n/g)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const index = trimmed.indexOf("=");

    if (index <= 0) {
      continue;
    }

    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (key) {
      entries.set(key, value);
    }
  }

  return entries;
}

function isPlaceholderSecret(value: string) {
  const normalized = value.toLowerCase();

  return (
    !value ||
    normalized.includes("replace") ||
    normalized.includes("example") ||
    normalized.includes("your_") ||
    normalized.includes("your-") ||
    normalized.includes("some_secret")
  );
}

function isAbsoluteUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function runAudit() {
  const envPath = path.join(process.cwd(), ".env");
  const source = existsSync(envPath)
    ? parseEnvFile(envPath)
    : new Map<string, string>(
        approvedKeys.map((key) => [key, process.env[key] ?? ""])
      );
  const issues: AuditIssue[] = [];
  const approvedSet = new Set<string>(approvedKeys);

  for (const key of source.keys()) {
    if (!approvedSet.has(key)) {
      issues.push({
        level: "warning",
        message: `${key} is not in the approved env contract. Confirm if it should be documented.`,
      });
    }
  }

  for (const key of requiredKeys) {
    const value = source.get(key)?.trim() ?? "";

    if (!value) {
      issues.push({
        level: "error",
        message: `${key} is required but missing.`,
      });
    }
  }

  const authSecret = source.get("BETTER_AUTH_SECRET")?.trim() ?? "";

  if (authSecret && authSecret.length < 32) {
    issues.push({
      level: "error",
      message: "BETTER_AUTH_SECRET must be at least 32 characters.",
    });
  }

  if (isPlaceholderSecret(authSecret)) {
    issues.push({
      level: "error",
      message: "BETTER_AUTH_SECRET appears to be placeholder text.",
    });
  }

  const databaseUrl = source.get("DATABASE_URL")?.trim() ?? "";

  if (
    databaseUrl &&
    !databaseUrl.startsWith("postgresql://") &&
    !databaseUrl.startsWith("postgres://")
  ) {
    issues.push({
      level: "error",
      message: "DATABASE_URL must use postgresql:// or postgres://",
    });
  }

  for (const key of ["BETTER_AUTH_URL", "NEXT_PUBLIC_SITE_URL"] as const) {
    const value = source.get(key)?.trim() ?? "";

    if (value && !isAbsoluteUrl(value)) {
      issues.push({
        level: "error",
        message: `${key} must be a valid absolute URL.`,
      });
    }
  }

  const trustedOrigins = source.get("BETTER_AUTH_TRUSTED_ORIGINS")?.trim() ?? "";

  if (trustedOrigins) {
    for (const origin of trustedOrigins.split(",")) {
      const normalizedOrigin = origin.trim();

      if (!normalizedOrigin) {
        continue;
      }

      if (!isAbsoluteUrl(normalizedOrigin)) {
        issues.push({
          level: "error",
          message: `BETTER_AUTH_TRUSTED_ORIGINS contains invalid URL: ${normalizedOrigin}`,
        });
      }
    }
  }

  const errors = issues.filter((issue) => issue.level === "error");

  console.log(`Env audit source: ${existsSync(envPath) ? ".env file" : "process.env"}`);
  console.log(`Approved contract keys: ${approvedKeys.length}`);
  console.log(`Detected keys: ${source.size}`);

  if (issues.length) {
    for (const issue of issues) {
      console.log(`[${issue.level.toUpperCase()}] ${issue.message}`);
    }
  } else {
    console.log("Environment audit passed.");
  }

  if (errors.length) {
    process.exitCode = 1;
  }
}

runAudit();
