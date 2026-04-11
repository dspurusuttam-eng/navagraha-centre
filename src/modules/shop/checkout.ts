import "server-only";

import type {
  PrepareShopCheckoutInput,
  ShopPaymentProvider,
} from "@/modules/shop/payment-boundary";
import { getRegisteredShopCheckoutProvider } from "@/modules/shop/payment-registry";

export type { PrepareShopCheckoutInput };
export type ShopCheckoutProvider = ShopPaymentProvider;

export function getShopCheckoutService(): ShopCheckoutProvider {
  return getRegisteredShopCheckoutProvider();
}
