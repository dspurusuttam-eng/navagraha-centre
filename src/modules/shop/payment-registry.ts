import "server-only";

import {
  type ShopCheckoutProviderKey,
  type ShopPaymentProvider,
} from "@/modules/shop/payment-boundary";
import { draftShopCheckoutProvider } from "@/modules/shop/providers/draft-checkout-provider";

const DEFAULT_SHOP_CHECKOUT_PROVIDER_KEY: ShopCheckoutProviderKey =
  "draft-order";

const registeredProviders: Partial<
  Record<ShopCheckoutProviderKey, ShopPaymentProvider>
> = {
  "draft-order": draftShopCheckoutProvider,
};

export function isShopCheckoutProviderKey(
  value: string | undefined
): value is ShopCheckoutProviderKey {
  return value === "draft-order" || value === "stripe";
}

export function resolveShopCheckoutProviderKey(
  envValue = process.env.SHOP_CHECKOUT_PROVIDER
): ShopCheckoutProviderKey {
  if (!isShopCheckoutProviderKey(envValue)) {
    return DEFAULT_SHOP_CHECKOUT_PROVIDER_KEY;
  }

  if (!registeredProviders[envValue]) {
    return DEFAULT_SHOP_CHECKOUT_PROVIDER_KEY;
  }

  return envValue;
}

export function getRegisteredShopCheckoutProvider(
  providerKey = resolveShopCheckoutProviderKey()
): ShopPaymentProvider {
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
