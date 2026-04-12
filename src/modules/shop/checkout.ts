import "server-only";

import type {
  InitializedShopCheckout,
  PrepareShopCheckoutInput,
  ShopPaymentProvider,
} from "@/modules/shop/payment-boundary";
import { emitCommerceAnalyticsEventSafely } from "@/modules/shop/analytics-audit";
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

  try {
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

    await emitCommerceAnalyticsEventSafely({
      eventName: "checkout.started",
      occurredAtUtc: new Date().toISOString(),
      orderId: checkout.orderId,
      orderNumber: checkout.orderNumber,
      providerKey: provider.key,
      paymentStatusTo: checkout.paymentStatus,
      amount: checkout.totalAmount,
      currencyCode: checkout.currencyCode,
      context: {
        hasUserId: Boolean(input.userId),
        itemCount: input.items.length,
      },
    });

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
  } catch (error) {
    await emitCommerceAnalyticsEventSafely({
      eventName: "checkout.init.failed",
      occurredAtUtc: new Date().toISOString(),
      providerKey: provider.key,
      reason:
        error instanceof Error
          ? error.message
          : "Checkout initialization failed unexpectedly.",
      context: {
        hasUserId: Boolean(input.userId),
        itemCount: input.items.length,
      },
    });

    throw error;
  }
}
