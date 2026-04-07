"use server";

import { assertRateLimit, buildRateLimitKey } from "@/lib/rate-limit";
import { getShopCheckoutService } from "@/modules/shop/checkout";
import type { PreparedCheckout, ShopCartLineInput } from "@/modules/shop/types";

export type ShopCheckoutActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  checkout: PreparedCheckout | null;
};

export const initialShopCheckoutActionState: ShopCheckoutActionState = {
  status: "idle",
  message: null,
  checkout: null,
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function parseCartPayload(payload: string): ShopCartLineInput[] {
  if (!payload) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(payload) as unknown;
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const candidate = entry as { slug?: unknown; quantity?: unknown };

      if (
        typeof candidate.slug !== "string" ||
        typeof candidate.quantity !== "number"
      ) {
        return null;
      }

      return {
        slug: candidate.slug,
        quantity: candidate.quantity,
      } satisfies ShopCartLineInput;
    })
    .filter((entry): entry is ShopCartLineInput => entry !== null);
}

export async function prepareShopCheckout(
  _previousState: ShopCheckoutActionState,
  formData: FormData
): Promise<ShopCheckoutActionState> {
  const billingName = getStringValue(formData, "billingName");
  const customerEmail = getStringValue(formData, "customerEmail");
  const customerPhone = getStringValue(formData, "customerPhone");
  const billingTimezone =
    getStringValue(formData, "billingTimezone") || "Asia/Kolkata";
  const notes = getStringValue(formData, "notes");
  const items = parseCartPayload(getStringValue(formData, "cartPayload"));

  if (!billingName) {
    return {
      status: "error",
      message: "Add the billing name before submitting the order request.",
      checkout: null,
    };
  }

  if (!customerEmail || !customerEmail.includes("@")) {
    return {
      status: "error",
      message: "Add a valid email address before submitting the order request.",
      checkout: null,
    };
  }

  try {
    assertRateLimit({
      key: buildRateLimitKey([
        "public-action",
        "shop-checkout",
        customerEmail || billingName,
      ]),
      limit: 8,
      windowMs: 10 * 60 * 1_000,
      message:
        "Too many checkout attempts. Please wait a little before trying again.",
    });
    const checkout = await getShopCheckoutService().prepareCheckout({
      items,
      billingName,
      customerEmail,
      customerPhone: customerPhone || undefined,
      billingTimezone,
      notes: notes || undefined,
    });

    return {
      status: "success",
      message:
        "Your order request has been recorded. The centre can now review the details and confirm the next step.",
      checkout,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "The order request could not be prepared.",
      checkout: null,
    };
  }
}
