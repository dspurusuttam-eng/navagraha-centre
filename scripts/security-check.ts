import { securityConfig } from "../src/lib/security/security-config";
import { localeDefinitions } from "../src/modules/localization/config";

type CheckResult = {
  ok: boolean;
  check: string;
  details: string;
};

function pass(check: string, details: string): CheckResult {
  return { ok: true, check, details };
}

function fail(check: string, details: string): CheckResult {
  return { ok: false, check, details };
}

function runChecks() {
  const results: CheckResult[] = [];

  results.push(
    securityConfig.trustedOrigins.length > 0
      ? pass(
          "trusted-origins",
          `Configured trusted origins: ${securityConfig.trustedOrigins.length}`
        )
      : fail("trusted-origins", "No trusted origins detected.")
  );

  const invalidPolicies = Object.entries(securityConfig.rateLimit.policies).filter(
    ([, policy]) =>
      !Number.isFinite(policy.limit) ||
      policy.limit <= 0 ||
      !Number.isFinite(policy.windowMs) ||
      policy.windowMs <= 0
  );

  results.push(
    invalidPolicies.length === 0
      ? pass(
          "rate-limit-policies",
          `Loaded ${Object.keys(securityConfig.rateLimit.policies).length} policies.`
        )
      : fail(
          "rate-limit-policies",
          `Invalid policies: ${invalidPolicies.map(([key]) => key).join(", ")}`
        )
  );

  const localeCodes = new Set(localeDefinitions.map((locale) => locale.code));
  const requiredLocales = ["en", "as", "hi"] as const;
  const missingLocales = requiredLocales.filter((locale) => !localeCodes.has(locale));

  results.push(
    missingLocales.length === 0
      ? pass("core-locales", "en/as/hi locale configuration is present.")
      : fail("core-locales", `Missing locales: ${missingLocales.join(", ")}`)
  );

  const suspiciousPublicKeys = Object.keys(process.env).filter((key) => {
    if (!key.startsWith("NEXT_PUBLIC_")) {
      return false;
    }

    return /(SECRET|TOKEN|PASSWORD|PRIVATE|WEBHOOK|API_KEY)/i.test(key);
  });

  results.push(
    suspiciousPublicKeys.length === 0
      ? pass("public-env-scan", "No suspicious NEXT_PUBLIC_* secret-looking keys detected.")
      : fail(
          "public-env-scan",
          `Suspicious public env keys: ${suspiciousPublicKeys.join(", ")}`
        )
  );

  const cspMode = securityConfig.headers.applyCsp
    ? securityConfig.headers.cspReportOnly
      ? "report-only"
      : "enforced"
    : "disabled";

  results.push(
    pass("csp-mode", `CSP mode: ${cspMode}`)
  );

  if (securityConfig.turnstile.enabled) {
    let endpointOk = false;

    try {
      const endpoint = new URL(securityConfig.turnstile.verifyEndpoint);
      endpointOk = endpoint.protocol === "https:";
    } catch {
      endpointOk = false;
    }

    results.push(
      endpointOk
        ? pass(
            "turnstile-config",
            "Turnstile is enabled with HTTPS verification endpoint."
          )
        : fail(
            "turnstile-config",
            "Turnstile verify endpoint must be a valid HTTPS URL."
          )
    );
  } else {
    results.push(
      pass(
        "turnstile-config",
        "Turnstile is disabled (safe default) until keys are configured."
      )
    );
  }

  return results;
}

const results = runChecks();
const failed = results.filter((result) => !result.ok);

for (const result of results) {
  const level = result.ok ? "PASS" : "FAIL";
  console.log(`[${level}] ${result.check}: ${result.details}`);
}

if (failed.length > 0) {
  process.exitCode = 1;
}
