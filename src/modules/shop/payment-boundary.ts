import type { PreparedCheckout, ShopCartLineInput } from "@/modules/shop/types";

export type ShopCheckoutProviderKey = "draft-order" | "stripe";

export type PrepareShopCheckoutInput = {
  items: ShopCartLineInput[];
  billingName: string;
  customerEmail: string;
  customerPhone?: string;
  billingTimezone: string;
  notes?: string;
  userId?: string;
  idempotencyKey?: string;
  subscriptionPlanId?: string;
};

export type ShopCheckoutSessionInput = {
  orderId: string;
  orderNumber: string;
  amount: number;
  currencyCode: string;
  customerEmail: string;
  customerName: string;
  returnUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

export type ShopCheckoutSession = {
  providerKey: ShopCheckoutProviderKey;
  sessionReference: string;
  redirectUrl?: string;
  clientSecret?: string;
  expiresAtUtc?: string;
};

export type InitializedShopCheckout = {
  orderId: string;
  orderNumber: string;
  providerKey: ShopCheckoutProviderKey;
  amount: number;
  amountLabel: string;
  currencyCode: string;
  paymentStatus: ShopPaymentLifecycleStatus;
  session: ShopCheckoutSession;
};

export type ShopPaymentLifecycleStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type ShopPaymentWebhookEvent = {
  providerKey: ShopCheckoutProviderKey;
  eventId: string;
  eventType: string;
  occurredAtUtc: string;
  verified: boolean;
  payload: unknown;
  checkoutReference?: string;
  orderNumber?: string;
  paymentReference?: string;
  amount?: number;
  currencyCode?: string;
  normalizedStatus?: ShopPaymentLifecycleStatus;
};

export interface ShopPaymentProvider {
  key: ShopCheckoutProviderKey;
  label: string;
  prepareCheckout(input: PrepareShopCheckoutInput): Promise<PreparedCheckout>;
  createCheckoutSession?(
    input: ShopCheckoutSessionInput
  ): Promise<ShopCheckoutSession>;
  verifyWebhookEvent?(
    rawBody: string,
    signature: string | null
  ): Promise<ShopPaymentWebhookEvent>;
  normalizeProviderStatus?(
    providerStatus: string
  ): ShopPaymentLifecycleStatus;
}
