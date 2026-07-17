import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";
import {
  buildRateLimitKey,
  checkRateLimit,
  getClientAddress,
  getRateLimitHeaders,
} from "@/lib/rate-limit";
import { trackServerEvent } from "@/lib/observability";
import {
  arePublicAccountsEnabled,
  isPrivateAdminAuthRequestAllowed,
} from "@/config/product-mode";
import { createFeatureDisabledApiResponse } from "@/lib/product-mode/responses";

export const dynamic = "force-dynamic";

function checkPublicAccountsEnabled(request: Request, method: string) {
  if (arePublicAccountsEnabled()) {
    return null;
  }

  if (isPrivateAdminAuthRequestAllowed(new URL(request.url).pathname, method)) {
    return null;
  }

  return createFeatureDisabledApiResponse(new URL(request.url).pathname);
}

function checkAuthRateLimit(request: Request, method: string) {
  const clientAddress = getClientAddress(request);
  const limit = checkRateLimit({
    key: buildRateLimitKey(["auth", method.toLowerCase(), clientAddress]),
    limit: 20,
    windowMs: 10 * 60 * 1_000,
  });

  if (!limit.allowed) {
    trackServerEvent(
      "auth.rate-limited",
      {
        method,
        clientAddress,
      },
      "warning"
    );

    return NextResponse.json(
      {
        ok: false,
        message: "Too many authentication requests. Please wait and try again.",
      },
      {
        status: 429,
        headers: getRateLimitHeaders(limit),
      }
    );
  }

  return null;
}

export async function GET(request: Request) {
  const disabled = checkPublicAccountsEnabled(request, "GET");

  if (disabled) {
    return disabled;
  }

  return toNextJsHandler(getAuth()).GET(request);
}

export async function HEAD(request: Request) {
  return (
    checkPublicAccountsEnabled(request, "HEAD") ??
    createFeatureDisabledApiResponse(new URL(request.url).pathname)
  );
}

export async function OPTIONS(request: Request) {
  return (
    checkPublicAccountsEnabled(request, "OPTIONS") ??
    createFeatureDisabledApiResponse(new URL(request.url).pathname)
  );
}

export async function POST(request: Request) {
  const disabled = checkPublicAccountsEnabled(request, "POST");

  if (disabled) {
    return disabled;
  }

  const limited = checkAuthRateLimit(request, "POST");

  if (limited) {
    return limited;
  }

  return toNextJsHandler(getAuth()).POST(request);
}

export async function PUT(request: Request) {
  const disabled = checkPublicAccountsEnabled(request, "PUT");

  if (disabled) {
    return disabled;
  }

  const limited = checkAuthRateLimit(request, "PUT");

  if (limited) {
    return limited;
  }

  return toNextJsHandler(getAuth()).PUT(request);
}

export async function PATCH(request: Request) {
  const disabled = checkPublicAccountsEnabled(request, "PATCH");

  if (disabled) {
    return disabled;
  }

  const limited = checkAuthRateLimit(request, "PATCH");

  if (limited) {
    return limited;
  }

  return toNextJsHandler(getAuth()).PATCH(request);
}

export async function DELETE(request: Request) {
  const disabled = checkPublicAccountsEnabled(request, "DELETE");

  if (disabled) {
    return disabled;
  }

  const limited = checkAuthRateLimit(request, "DELETE");

  if (limited) {
    return limited;
  }

  return toNextJsHandler(getAuth()).DELETE(request);
}
