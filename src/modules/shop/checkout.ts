import "server-only";

import { draftShopCheckoutProvider } from "@/modules/shop/providers/draft-checkout-provider";
import type { PreparedCheckout, ShopCartLineInput } from "@/modules/shop/types";

export type PrepareShopCheckoutInput = {
  items: ShopCartLineInput[];
  billingName: string;
  customerEmail: string;
  customerPhone?: string;
  billingTimezone: string;
  notes?: string;
};

export interface ShopCheckoutProvider {
  key: "draft-order";
  prepareCheckout(input: PrepareShopCheckoutInput): Promise<PreparedCheckout>;
}

export function getShopCheckoutService(): ShopCheckoutProvider {
  return draftShopCheckoutProvider;
}
