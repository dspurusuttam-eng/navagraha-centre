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
  const payload = (await request.json().catch(() => null)) as
    | CheckoutInitPayload
    | null;

  if (!payload) {
    return Response.json(
      { error: "Invalid checkout payload." },
      {
        status: 400,
      }
    );
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
    return Response.json(
      { error: "Billing name is required." },
      {
        status: 400,
      }
    );
  }

  if (!customerEmail || !customerEmail.includes("@")) {
    return Response.json(
      { error: "A valid customer email is required." },
      {
        status: 400,
      }
    );
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

    return Response.json(
      {
        error: checkoutError.message,
        code: checkoutError.code,
        title: checkoutError.title,
        recoveryActions: checkoutError.recoveryActions,
      },
      {
        status: 400,
      }
    );
  }
}
