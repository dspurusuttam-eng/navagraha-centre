import "server-only";

import { trackServerEvent } from "@/lib/observability";
import {
  type ShopCheckoutProviderKey,
  type ShopPaymentProvider,
} from "@/modules/shop/payment-boundary";
import { draftShopCheckoutProvider } from "@/modules/shop/providers/draft-checkout-provider";
import { razorpayCheckoutProvider } from "@/modules/shop/providers/razorpay-checkout-provider";

const DEFAULT_SHOP_CHECKOUT_PROVIDER_KEY: ShopCheckoutProviderKey =
  "draft-order";

const registeredProviders: Partial<
  Record<ShopCheckoutProviderKey, ShopPaymentProvider>
> = {
  "draft-order": draftShopCheckoutProvider,
  razorpay: razorpayCheckoutProvider,
};

type ShopRuntimeWarningStore = {
  keys: Set<string>;
};

declare global {
  var __navagrahaShopRuntimeWarnings: ShopRuntimeWarningStore | undefined;
}

function getShopRuntimeWarningStore() {
  if (!globalThis.__navagrahaShopRuntimeWarnings) {
    globalThis.__navagrahaShopRuntimeWarnings = {
      keys: new Set<string>(),
    };
  }

  return globalThis.__navagrahaShopRuntimeWarnings;
}

function warnShopRuntimeOnce(key: string, message: string) {
  const store = getShopRuntimeWarningStore();

  if (store.keys.has(key)) {
    return;
  }

  store.keys.add(key);

  trackServerEvent(
    "commerce.env.warning",
    {
      key,
      message,
    },
    "warning"
  );
}

function warnIfMissingDraftWebhookSecret() {
  const hasDraftSecret = Boolean(process.env.SHOP_DRAFT_WEBHOOK_SECRET?.trim());
  const hasSharedSecret = Boolean(process.env.SHOP_WEBHOOK_SECRET?.trim());

  if (!hasDraftSecret && !hasSharedSecret) {
    warnShopRuntimeOnce(
      "SHOP_DRAFT_WEBHOOK_SECRET",
      "Draft payment webhook verification is not fully configured. Set SHOP_DRAFT_WEBHOOK_SECRET (or SHOP_WEBHOOK_SECRET fallback) in runtime environment."
    );
  }
}

function warnIfMissingRazorpayConfiguration() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  const webhookSecret =
    process.env.RAZORPAY_WEBHOOK_SECRET?.trim() ??
    process.env.SHOP_WEBHOOK_SECRET?.trim();

  if (!keyId || !keySecret) {
    warnShopRuntimeOnce(
      "RAZORPAY_KEY_ID",
      "Razorpay checkout provider is selected but RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET are not fully configured."
    );
  }

  if (!webhookSecret) {
    warnShopRuntimeOnce(
      "RAZORPAY_WEBHOOK_SECRET",
      "Razorpay webhook verification is not fully configured. Set RAZORPAY_WEBHOOK_SECRET (or SHOP_WEBHOOK_SECRET fallback)."
    );
  }
}

export function isShopCheckoutProviderKey(
  value: string | undefined
): value is ShopCheckoutProviderKey {
  return value === "draft-order" || value === "stripe" || value === "razorpay";
}

export function resolveShopCheckoutProviderKey(
  envValue = process.env.SHOP_CHECKOUT_PROVIDER
): ShopCheckoutProviderKey {
  const configuredProvider = envValue?.trim();

  if (!configuredProvider) {
    return DEFAULT_SHOP_CHECKOUT_PROVIDER_KEY;
  }

  if (!isShopCheckoutProviderKey(configuredProvider)) {
    warnShopRuntimeOnce(
      "SHOP_CHECKOUT_PROVIDER",
      `Unsupported SHOP_CHECKOUT_PROVIDER value "${configuredProvider}". Falling back to "${DEFAULT_SHOP_CHECKOUT_PROVIDER_KEY}".`
    );
    return DEFAULT_SHOP_CHECKOUT_PROVIDER_KEY;
  }

  if (!registeredProviders[configuredProvider]) {
    warnShopRuntimeOnce(
      "SHOP_CHECKOUT_PROVIDER_NOT_REGISTERED",
      `SHOP_CHECKOUT_PROVIDER is set to "${configuredProvider}" but no provider is registered for this key. Falling back to "${DEFAULT_SHOP_CHECKOUT_PROVIDER_KEY}".`
    );
    return DEFAULT_SHOP_CHECKOUT_PROVIDER_KEY;
  }

  return configuredProvider;
}

export function getRegisteredShopCheckoutProvider(
  providerKey = resolveShopCheckoutProviderKey()
): ShopPaymentProvider {
  if (providerKey === "draft-order") {
    warnIfMissingDraftWebhookSecret();
  }
  if (providerKey === "razorpay") {
    warnIfMissingRazorpayConfiguration();
  }

  const provider =
    registeredProviders[providerKey] ??
    registeredProviders[DEFAULT_SHOP_CHECKOUT_PROVIDER_KEY];

  if (!provider) {
    throw new Error(
      "No checkout provider is registered. Add at least one provider in payment-registry."
    );
  }

  return provider;
}
