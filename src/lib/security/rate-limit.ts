import {
  buildRateLimitKey,
  checkRateLimit,
  getClientAddress,
  getRateLimitHeaders,
  type RateLimitResult,
} from "@/lib/rate-limit";
import {
  getRateLimitPolicy,
  securityConfig,
  type SecurityRateLimitPolicyKey,
} from "@/lib/security/security-config";

export type SecurityRateLimitCheck = {
  allowed: boolean;
  headers: Record<string, string>;
  result: RateLimitResult | null;
};

export function checkSecurityRateLimit(input: {
  request: Request;
  policyKey: SecurityRateLimitPolicyKey;
  identityParts?: ReadonlyArray<string | number | null | undefined>;
  forceEnable?: boolean;
}): SecurityRateLimitCheck {
  const enabled = input.forceEnable ?? securityConfig.rateLimit.enabled;

  if (!enabled) {
    return {
      allowed: true,
      headers: {},
      result: null,
    };
  }

  if (
    input.policyKey.startsWith("ai-") &&
    !securityConfig.rateLimit.aiEnabled
  ) {
    return {
      allowed: true,
      headers: {},
      result: null,
    };
  }

  const policy = getRateLimitPolicy(input.policyKey);
  const clientAddress = getClientAddress(input.request);
  const key = buildRateLimitKey([
    "security",
    input.policyKey,
    clientAddress,
    ...(input.identityParts ?? []),
  ]);
  const result = checkRateLimit({
    key,
    limit: policy.limit,
    windowMs: policy.windowMs,
  });

  return {
    allowed: result.allowed,
    headers: getRateLimitHeaders(result),
    result,
  };
}
