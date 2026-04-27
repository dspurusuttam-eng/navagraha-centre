import { apiErrorResponse } from "@/lib/api/http";
import { validatePayloadSize, type SafetyIssue } from "@/lib/security/input-safety";
import { securityConfig, isTrustedOrigin } from "@/lib/security/security-config";

function issueToResponse(issue: SafetyIssue, statusCode: number, headers?: HeadersInit) {
  return apiErrorResponse({
    statusCode,
    code: issue.code,
    message: issue.message,
    headers,
  });
}

function resolveRequestOrigin(request: Request) {
  const originHeader = request.headers.get("origin");

  if (originHeader) {
    return originHeader;
  }

  const refererHeader = request.headers.get("referer");

  if (!refererHeader) {
    return null;
  }

  try {
    return new URL(refererHeader).origin;
  } catch {
    return null;
  }
}

export function guardPayloadByteLength(request: Request, headers?: HeadersInit) {
  const payloadSize = validatePayloadSize(request);

  if (!payloadSize.ok && payloadSize.issue) {
    return issueToResponse(payloadSize.issue, 413, headers);
  }

  return null;
}

export function guardTrustedOrigin(
  request: Request,
  options?: {
    allowMissingOrigin?: boolean;
    headers?: HeadersInit;
  }
) {
  const allowMissingOrigin = options?.allowMissingOrigin ?? true;
  const origin = resolveRequestOrigin(request);

  if (!origin) {
    if (allowMissingOrigin) {
      return null;
    }

    return apiErrorResponse({
      statusCode: 403,
      code: "ORIGIN_REQUIRED",
      message: "Request origin is required for this endpoint.",
      headers: options?.headers,
    });
  }

  if (isTrustedOrigin(origin)) {
    return null;
  }

  return apiErrorResponse({
    statusCode: 403,
    code: "UNTRUSTED_ORIGIN",
    message: "The request origin is not allowed.",
    details: {
      trustedDomains: securityConfig.trustedDomains,
    },
    headers: options?.headers,
  });
}

export function guardOptionalHoneypotAndTiming(input: {
  honeypotValue: unknown;
  startedAtValue: unknown;
  nowMs?: number;
}) {
  const honeypot =
    typeof input.honeypotValue === "string"
      ? input.honeypotValue.trim()
      : "";

  if (honeypot) {
    return {
      ok: false,
      issue: {
        code: "SPAM_DETECTED",
        message: "Spam protection blocked this submission.",
      },
    } as const;
  }

  const startedAtRaw =
    typeof input.startedAtValue === "string"
      ? input.startedAtValue.trim()
      : "";

  if (!startedAtRaw) {
    return {
      ok: true,
    } as const;
  }

  const startedAt = Number(startedAtRaw);
  const nowMs = input.nowMs ?? Date.now();

  if (!Number.isFinite(startedAt) || startedAt <= 0 || startedAt > nowMs) {
    return {
      ok: false,
      issue: {
        code: "INVALID_SUBMISSION_TIME",
        message: "Invalid submission timestamp.",
      },
    } as const;
  }

  if (nowMs - startedAt < securityConfig.spamProtection.minSubmitElapsedMs) {
    return {
      ok: false,
      issue: {
        code: "SUBMISSION_TOO_FAST",
        message: "Submission was too fast to verify safely.",
      },
    } as const;
  }

  return {
    ok: true,
  } as const;
}
