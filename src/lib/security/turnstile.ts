import { securityConfig } from "@/lib/security/security-config";
import { logSecurityEvent } from "@/lib/security/safe-logger";
import { apiErrorResponse } from "@/lib/api/http";
import { getClientAddress } from "@/lib/rate-limit";

type TurnstileApiResponse = {
  success: boolean;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
};

export type TurnstileVerificationResult =
  | {
      status: "skipped";
    }
  | {
      status: "passed";
    }
  | {
      status: "failed";
      reason: string;
    };

function normalizeToken(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function resolveTurnstileToken(
  payload: Record<string, unknown> | null,
  request?: Request
) {
  const candidates: unknown[] = [
    payload?.turnstileToken,
    payload?.turnstile_token,
    payload?.["cf-turnstile-response"],
  ];

  if (request) {
    candidates.push(
      request.headers.get("x-turnstile-token"),
      request.headers.get("cf-turnstile-response")
    );
  }

  for (const candidate of candidates) {
    const token = normalizeToken(candidate);

    if (token) {
      return token;
    }
  }

  return "";
}

async function verifyTurnstileToken(input: {
  token: string;
  remoteIp?: string | null;
  action?: string;
}) {
  const form = new URLSearchParams();
  form.set("secret", securityConfig.turnstile.secretKey);
  form.set("response", input.token);

  if (input.remoteIp) {
    form.set("remoteip", input.remoteIp);
  }

  const response = await fetch(securityConfig.turnstile.verifyEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      success: false,
      errorCodes: ["verification-http-error"],
    };
  }

  const payload = (await response.json()) as TurnstileApiResponse;

  if (!payload.success) {
    return {
      success: false,
      errorCodes: payload["error-codes"] ?? ["verification-failed"],
    };
  }

  return {
    success: true,
    errorCodes: [] as string[],
  };
}

export async function verifyTurnstileOrSkip(input: {
  token: string;
  remoteIp?: string | null;
  route: string;
}): Promise<TurnstileVerificationResult> {
  if (!securityConfig.turnstile.enabled) {
    return {
      status: "skipped",
    };
  }

  const token = normalizeToken(input.token);

  if (!token) {
    if (securityConfig.turnstile.enforce) {
      logSecurityEvent("warning", "turnstile.missing-token", {
        route: input.route,
      });

      return {
        status: "failed",
        reason: "Turnstile verification token is required.",
      };
    }

    return {
      status: "skipped",
    };
  }

  try {
    const verification = await verifyTurnstileToken({
      token,
      remoteIp: input.remoteIp,
    });

    if (!verification.success) {
      logSecurityEvent("warning", "turnstile.verification-failed", {
        route: input.route,
        errorCodes: verification.errorCodes,
      });

      return {
        status: "failed",
        reason: "Turnstile verification failed.",
      };
    }

    return {
      status: "passed",
    };
  } catch (error) {
    logSecurityEvent("error", "turnstile.verification-error", {
      route: input.route,
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    if (securityConfig.turnstile.enforce) {
      return {
        status: "failed",
        reason: "Turnstile verification is temporarily unavailable.",
      };
    }

    return {
      status: "skipped",
    };
  }
}

export async function guardTurnstileForPayload(input: {
  request: Request;
  payload: Record<string, unknown> | null;
  route: string;
  headers?: HeadersInit;
}) {
  const token = resolveTurnstileToken(input.payload, input.request);
  const verification = await verifyTurnstileOrSkip({
    token,
    remoteIp: getClientAddress(input.request),
    route: input.route,
  });

  if (verification.status === "failed") {
    return apiErrorResponse({
      statusCode: 403,
      code: "TURNSTILE_VERIFICATION_FAILED",
      message: verification.reason,
      headers: input.headers,
    });
  }

  return null;
}
