import { apiErrorResponse, readJsonObjectBody } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import { assertRateLimit, buildRateLimitKey } from "@/lib/rate-limit";
import {
  checkSecurityRateLimit,
  guardTurnstileForPayload,
  guardPayloadByteLength,
  guardTrustedOrigin,
  isValidEmail,
  normalizeSafeText,
} from "@/lib/security";
import { getSession } from "@/modules/auth/server";
import { initializeShopCheckout } from "@/modules/shop/checkout";
import { resolveShopCheckoutErrorState } from "@/modules/shop/error-states";
import type { ShopCartLineInput } from "@/modules/shop/types";

export const dynamic = "force-dynamic";

type CheckoutInitPayload = {
  items?: Array<{
    slug?: unknown;
    quantity?: unknown;
  }>;
  billingName?: unknown;
  customerEmail?: unknown;
  customerPhone?: unknown;
  billingTimezone?: unknown;
  notes?: unknown;
  idempotencyKey?: unknown;
  subscriptionPlanId?: unknown;
};

function parseCartLines(payload: CheckoutInitPayload): ShopCartLineInput[] {
  if (!Array.isArray(payload.items)) {
    return [];
  }

  return payload.items
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      if (typeof item.slug !== "string") {
        return null;
      }

      const quantity =
        typeof item.quantity === "number"
          ? item.quantity
          : Number(item.quantity ?? Number.NaN);

      if (!Number.isFinite(quantity)) {
        return null;
      }

      return {
        slug: item.slug,
        quantity,
      } satisfies ShopCartLineInput;
    })
    .filter((item): item is ShopCartLineInput => item !== null);
}

function readSafeString(
  value: unknown,
  fieldName: string,
  maxLength: number,
  allowEmpty = true
) {
  const normalized = normalizeSafeText(value ?? "", {
    fieldName,
    maxLength,
    allowEmpty,
  });

  return normalized.ok ? normalized.data : "";
}

export async function POST(request: Request) {
  const originGuard = guardTrustedOrigin(request, {
    allowMissingOrigin: true,
  });

  if (originGuard) {
    return originGuard;
  }

  const payloadGuard = guardPayloadByteLength(request);

  if (payloadGuard) {
    return payloadGuard;
  }

  const routeLimit = checkSecurityRateLimit({
    request,
    policyKey: "shop-checkout-init",
  });

  if (!routeLimit.allowed) {
    return apiErrorResponse({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many checkout requests. Please retry shortly.",
      headers: routeLimit.headers,
    });
  }

  const payload = (await readJsonObjectBody(request)) as
    | CheckoutInitPayload
    | null;

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Invalid checkout payload.",
      headers: routeLimit.headers,
    });
  }

  const turnstileGuard = await guardTurnstileForPayload({
    request,
    payload: payload as Record<string, unknown>,
    route: "api.shop.checkout.init",
    headers: routeLimit.headers,
  });

  if (turnstileGuard) {
    return turnstileGuard;
  }

  const billingName = readSafeString(payload.billingName, "Billing name", 120, false);
  const customerEmail = readSafeString(payload.customerEmail, "Customer email", 160, false);
  const customerPhone = readSafeString(payload.customerPhone, "Customer phone", 30);
  const billingTimezone =
    readSafeString(payload.billingTimezone, "Billing timezone", 120) || "Asia/Kolkata";
  const notes = readSafeString(payload.notes, "Notes", 800);
  const subscriptionPlanId = readSafeString(
    payload.subscriptionPlanId,
    "Subscription plan",
    80
  );
  const idempotencyKey =
    readSafeString(payload.idempotencyKey, "Idempotency key", 128) ||
    readSafeString(request.headers.get("x-idempotency-key"), "Idempotency key", 128);
  const items = parseCartLines(payload);

  if (!billingName) {
    return apiErrorResponse({
      statusCode: 400,
      code: "BILLING_NAME_REQUIRED",
      message: "Billing name is required.",
      headers: routeLimit.headers,
    });
  }

  if (!customerEmail || !isValidEmail(customerEmail)) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_CUSTOMER_EMAIL",
      message: "A valid customer email is required.",
      headers: routeLimit.headers,
    });
  }

  try {
    assertRateLimit({
      key: buildRateLimitKey([
        "api-shop-checkout-init",
        customerEmail || billingName || "anonymous",
      ]),
      limit: 8,
      windowMs: 10 * 60 * 1_000,
      message:
        "Too many checkout attempts. Please wait a little before trying again.",
    });

    const session = await getSession();
    const checkout = await initializeShopCheckout({
      items,
      billingName,
      customerEmail,
      customerPhone: customerPhone || undefined,
      billingTimezone,
      notes: notes || undefined,
      userId: session?.user.id,
      idempotencyKey: idempotencyKey || undefined,
      subscriptionPlanId: subscriptionPlanId || undefined,
    });

    return Response.json(
      {
        checkout,
      },
      {
        status: 201,
        headers: routeLimit.headers,
      }
    );
  } catch (error) {
    const checkoutError = resolveShopCheckoutErrorState(error);
    captureException(error, {
      route: "api.shop.checkout.init",
      customerEmail,
      checkoutErrorCode: checkoutError.code,
    });

    return apiErrorResponse({
      statusCode: 400,
      code: checkoutError.code,
      message: checkoutError.message,
      details: {
        title: checkoutError.title,
        recoveryActions: checkoutError.recoveryActions,
      },
      headers: routeLimit.headers,
    });
  }
}
