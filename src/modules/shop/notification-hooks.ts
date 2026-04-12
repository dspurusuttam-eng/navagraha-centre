import "server-only";

import type {
  OrderStatus,
  PaymentStatus,
} from "@prisma/client";
import type { OrderConfirmationTarget } from "@/modules/shop/order-finalization";
import type { ShopReceiptCustomerDetails, ShopReceiptData } from "@/modules/shop/receipt";

export const shopNotificationEventNames = [
  "order.paid.confirmed",
  "order.payment.failed",
  "order.refunded",
] as const;

export type ShopNotificationEventName =
  (typeof shopNotificationEventNames)[number];

type ShopNotificationEventBase = {
  eventName: ShopNotificationEventName;
  occurredAtUtc: string;
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  trustedAmount: number;
  currencyCode: string;
  customer: ShopReceiptCustomerDetails;
};

export type ShopNotificationEvent =
  | (ShopNotificationEventBase & {
      eventName: "order.paid.confirmed";
      confirmationTarget: OrderConfirmationTarget;
      receipt: ShopReceiptData;
    })
  | (ShopNotificationEventBase & {
      eventName: "order.payment.failed" | "order.refunded";
      receipt?: ShopReceiptData;
      confirmationTarget?: OrderConfirmationTarget;
    });

export type ShopNotificationHookDispatchResult = {
  attempted: number;
  delivered: number;
  failed: number;
};

interface ShopNotificationHookAdapter {
  key: string;
  emit(event: ShopNotificationEvent): Promise<void>;
}

const localLogNotificationHook: ShopNotificationHookAdapter = {
  key: "local-log",
  async emit(event) {
    console.info("shop-notification-hook", {
      eventName: event.eventName,
      orderNumber: event.orderNumber,
      orderStatus: event.orderStatus,
      paymentStatus: event.paymentStatus,
      trustedAmount: event.trustedAmount,
      currencyCode: event.currencyCode,
      customerEmail: event.customer.customerEmail,
    });
  },
};

function getShopNotificationHookAdapters() {
  return [localLogNotificationHook];
}

export async function emitShopNotificationEventSafely(
  event: ShopNotificationEvent
): Promise<ShopNotificationHookDispatchResult> {
  try {
    const adapters = getShopNotificationHookAdapters();

    if (!adapters.length) {
      return {
        attempted: 0,
        delivered: 0,
        failed: 0,
      };
    }

    const settled = await Promise.allSettled(
      adapters.map(async (adapter) => {
        await adapter.emit(event);
        return adapter.key;
      })
    );

    let delivered = 0;
    let failed = 0;

    for (const result of settled) {
      if (result.status === "fulfilled") {
        delivered += 1;
        continue;
      }

      failed += 1;
      console.error("shop-notification-hook failed", {
        eventName: event.eventName,
        orderNumber: event.orderNumber,
        message:
          result.reason instanceof Error
            ? result.reason.message
            : "Unknown notification hook failure.",
      });
    }

    return {
      attempted: adapters.length,
      delivered,
      failed,
    };
  } catch (error) {
    console.error("shop-notification-hook pipeline failed", {
      eventName: event.eventName,
      orderNumber: event.orderNumber,
      message:
        error instanceof Error
          ? error.message
          : "Unknown notification pipeline failure.",
    });

    return {
      attempted: 0,
      delivered: 0,
      failed: 1,
    };
  }
}
