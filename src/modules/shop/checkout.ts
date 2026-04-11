import "server-only";

import type {
  InitializedShopCheckout,
  PrepareShopCheckoutInput,
  ShopPaymentProvider,
} from "@/modules/shop/payment-boundary";
import { getRegisteredShopCheckoutProvider } from "@/modules/shop/payment-registry";
import { formatShopPrice } from "@/modules/shop/service";

export type { PrepareShopCheckoutInput };
export type ShopCheckoutProvider = ShopPaymentProvider;

export function getShopCheckoutService(): ShopCheckoutProvider {
  return getRegisteredShopCheckoutProvider();
}

export async function initializeShopCheckout(
  input: PrepareShopCheckoutInput
): Promise<InitializedShopCheckout> {
  const provider = getShopCheckoutService();
  const checkout = await provider.prepareCheckout(input);

  const session = provider.createCheckoutSession
    ? await provider.createCheckoutSession({
        orderId: checkout.orderId,
        orderNumber: checkout.orderNumber,
        amount: checkout.totalAmount,
        currencyCode: checkout.currencyCode,
        customerEmail: input.customerEmail,
        customerName: input.billingName,
        returnUrl: "/shop/cart",
        cancelUrl: "/shop/cart",
        metadata: {
          orderId: checkout.orderId,
          orderNumber: checkout.orderNumber,
          providerKey: provider.key,
        },
      })
    : {
        providerKey: provider.key,
        sessionReference: checkout.orderNumber,
      };

  return {
    orderId: checkout.orderId,
    orderNumber: checkout.orderNumber,
    providerKey: provider.key,
    amount: checkout.totalAmount,
    amountLabel: formatShopPrice(checkout.totalAmount, checkout.currencyCode),
    currencyCode: checkout.currencyCode,
    paymentStatus: checkout.paymentStatus,
    session,
  };
}
