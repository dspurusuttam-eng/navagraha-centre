import { apiErrorResponse, readJsonObjectBody } from "@/lib/api/http";
import { captureException } from "@/lib/observability";
import { assertRateLimit, buildRateLimitKey } from "@/lib/rate-limit";
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

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const payload = (await readJsonObjectBody(request)) as
    | CheckoutInitPayload
    | null;

  if (!payload) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "Invalid checkout payload.",
    });
  }

  const billingName = readString(payload.billingName);
  const customerEmail = readString(payload.customerEmail);
  const customerPhone = readString(payload.customerPhone);
  const billingTimezone = readString(payload.billingTimezone) || "Asia/Kolkata";
  const notes = readString(payload.notes);
  const subscriptionPlanId = readString(payload.subscriptionPlanId);
  const idempotencyKey =
    readString(payload.idempotencyKey) ||
    readString(request.headers.get("x-idempotency-key"));
  const items = parseCartLines(payload);

  if (!billingName) {
    return apiErrorResponse({
      statusCode: 400,
      code: "BILLING_NAME_REQUIRED",
      message: "Billing name is required.",
    });
  }

  if (!customerEmail || !customerEmail.includes("@")) {
    return apiErrorResponse({
      statusCode: 400,
      code: "INVALID_CUSTOMER_EMAIL",
      message: "A valid customer email is required.",
    });
  }

  try {
    assertRateLimit({
      key: buildRateLimitKey([
        "api-shop-checkout-init",
        customerEmail || billingName,
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
    });
  }
}
