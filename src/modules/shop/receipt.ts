import "server-only";

import {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
} from "@prisma/client";
import type { OrderConfirmationTarget } from "@/modules/shop/order-finalization";
import { formatShopPrice } from "@/modules/shop/service";

const paymentProviderLabels: Record<PaymentProvider, string> = {
  MANUAL_PLACEHOLDER: "Centre Payment Review",
  STRIPE: "Stripe",
};

export type ShopReceiptLineItem = {
  titleSnapshot: string;
  skuSnapshot: string | null;
  quantity: number;
  unitAmount: number;
  unitAmountLabel: string;
  lineTotalAmount: number;
  lineTotalLabel: string;
};

export type ShopReceiptCustomerDetails = {
  billingName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  billingTimezone: string | null;
};

export type ShopReceiptData = {
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider: PaymentProvider;
  paymentProviderLabel: string;
  trustedAmount: number;
  trustedAmountLabel: string;
  currencyCode: string;
  finalizedAtUtc: string;
  itemCount: number;
  items: ShopReceiptLineItem[];
  customer: ShopReceiptCustomerDetails;
  confirmationTarget?: OrderConfirmationTarget;
};

export function buildShopReceiptData(input: {
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider: PaymentProvider;
  trustedAmount: number;
  currencyCode: string;
  finalizedAtUtc: string;
  customer: ShopReceiptCustomerDetails;
  items: Array<{
    titleSnapshot: string;
    skuSnapshot: string | null;
    quantity: number;
    unitAmount: number;
  }>;
  confirmationTarget?: OrderConfirmationTarget;
}): ShopReceiptData {
  const items = input.items.map((item) => {
    const lineTotalAmount = item.unitAmount * item.quantity;

    return {
      titleSnapshot: item.titleSnapshot,
      skuSnapshot: item.skuSnapshot,
      quantity: item.quantity,
      unitAmount: item.unitAmount,
      unitAmountLabel: formatShopPrice(item.unitAmount, input.currencyCode),
      lineTotalAmount,
      lineTotalLabel: formatShopPrice(lineTotalAmount, input.currencyCode),
    } satisfies ShopReceiptLineItem;
  });

  return {
    orderId: input.orderId,
    orderNumber: input.orderNumber,
    orderStatus: input.orderStatus,
    paymentStatus: input.paymentStatus,
    paymentProvider: input.paymentProvider,
    paymentProviderLabel: paymentProviderLabels[input.paymentProvider],
    trustedAmount: input.trustedAmount,
    trustedAmountLabel: formatShopPrice(input.trustedAmount, input.currencyCode),
    currencyCode: input.currencyCode,
    finalizedAtUtc: input.finalizedAtUtc,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    items,
    customer: input.customer,
    confirmationTarget: input.confirmationTarget,
  };
}
