import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  PrepareShopCheckoutInput,
  ShopCheckoutSession,
  ShopPaymentLifecycleStatus,
  ShopPaymentProvider,
  ShopPaymentWebhookEvent,
} from "@/modules/shop/payment-boundary";
import { draftShopCheckoutProvider } from "@/modules/shop/providers/draft-checkout-provider";

type RazorpayOrderResponse = {
  id: string;
};

type RazorpayWebhookPayload = {
  event?: string;
  created_at?: number;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        amount?: number;
        currency?: string;
        order_id?: string;
        notes?: {
          checkoutReference?: string;
          orderNumber?: string;
          [key: string]: string | undefined;
        };
      };
    };
    refund?: {
      entity?: {
        id?: string;
        amount?: number;
        currency?: string;
        order_id?: string;
        notes?: {
          checkoutReference?: string;
          orderNumber?: string;
          [key: string]: string | undefined;
        };
      };
    };
  };
};

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    return null;
  }

  return {
    keyId,
    keySecret,
  };
}

function getRazorpayWebhookSecret() {
  const candidate =
    process.env.RAZORPAY_WEBHOOK_SECRET?.trim() ??
    process.env.SHOP_WEBHOOK_SECRET?.trim();

  if (!candidate) {
    return null;
  }

  return candidate;
}

function verifyRazorpaySignature(rawBody: string, signature: string | null) {
  const secret = getRazorpayWebhookSecret();

  if (!secret || !signature) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const candidateBuffer = Buffer.from(signature.trim(), "utf8");

  if (expectedBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, candidateBuffer);
}

function normalizeRazorpayEventStatus(
  eventType: string
): ShopPaymentLifecycleStatus | null {
  if (eventType === "payment.captured") {
    return "PAID";
  }

  if (eventType === "payment.failed") {
    return "FAILED";
  }

  if (eventType === "refund.processed") {
    return "REFUNDED";
  }

  return null;
}

function toRazorpayWebhookEvent(
  rawBody: string,
  signature: string | null
): ShopPaymentWebhookEvent {
  const verified = verifyRazorpaySignature(rawBody, signature);
  let parsedPayload: RazorpayWebhookPayload | null = null;

  if (verified) {
    try {
      parsedPayload = JSON.parse(rawBody) as RazorpayWebhookPayload;
    } catch {
      parsedPayload = null;
    }
  }

  const payload = parsedPayload ?? {};
  const eventType = payload.event ?? "unknown";
  const paymentEntity = payload.payload?.payment?.entity;
  const refundEntity = payload.payload?.refund?.entity;
  const entity = paymentEntity ?? refundEntity;
  const normalizedStatus = normalizeRazorpayEventStatus(eventType);
  const notes = entity?.notes;

  return {
    providerKey: "razorpay",
    eventId:
      entity?.id ??
      `${eventType}:${payload.created_at ?? new Date().toISOString()}`,
    eventType,
    occurredAtUtc: payload.created_at
      ? new Date(payload.created_at * 1000).toISOString()
      : new Date().toISOString(),
    verified,
    payload,
    checkoutReference: notes?.checkoutReference ?? entity?.order_id,
    orderNumber: notes?.orderNumber,
    paymentReference: entity?.id,
    amount: typeof entity?.amount === "number" ? entity.amount : undefined,
    currencyCode: typeof entity?.currency === "string" ? entity.currency : undefined,
    normalizedStatus: normalizedStatus ?? undefined,
  };
}

async function createRazorpayOrder(
  input: {
    amount: number;
    currencyCode: string;
    orderNumber: string;
    notes: Record<string, string>;
  },
  credentials: {
    keyId: string;
    keySecret: string;
  }
) {
  const authorization = Buffer.from(
    `${credentials.keyId}:${credentials.keySecret}`
  ).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authorization}`,
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currencyCode,
      receipt: input.orderNumber,
      notes: input.notes,
    }),
  });

  if (!response.ok) {
    throw new Error("Razorpay order creation failed.");
  }

  const payload = (await response.json()) as RazorpayOrderResponse;

  return payload;
}

async function createRazorpayCheckoutSession(
  input: {
    amount: number;
    currencyCode: string;
    orderNumber: string;
    checkoutReference: string;
    customerEmail: string;
    customerName: string;
    metadata?: Record<string, string>;
  }
): Promise<ShopCheckoutSession> {
  const credentials = getRazorpayCredentials();

  if (!credentials) {
    return {
      providerKey: "razorpay",
      sessionReference: `rzp_draft_${input.orderNumber}`,
    };
  }

  const order = await createRazorpayOrder(
    {
      amount: input.amount,
      currencyCode: input.currencyCode,
      orderNumber: input.orderNumber,
      notes: {
        checkoutReference: input.checkoutReference,
        orderNumber: input.orderNumber,
        ...(input.metadata ?? {}),
      },
    },
    credentials
  );

  return {
    providerKey: "razorpay",
    sessionReference: order.id,
    clientSecret: credentials.keyId,
  };
}

export const razorpayCheckoutProvider: ShopPaymentProvider = {
  key: "razorpay",
  label: "Razorpay",
  async prepareCheckout(input: PrepareShopCheckoutInput) {
    return draftShopCheckoutProvider.prepareCheckout(input);
  },
  async createCheckoutSession(input) {
    return createRazorpayCheckoutSession({
      amount: input.amount,
      currencyCode: input.currencyCode,
      orderNumber: input.orderNumber,
      checkoutReference: input.orderNumber,
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      metadata: input.metadata,
    });
  },
  async verifyWebhookEvent(rawBody, signature) {
    return toRazorpayWebhookEvent(rawBody, signature);
  },
  normalizeProviderStatus(providerStatus) {
    return normalizeRazorpayEventStatus(providerStatus) ?? "PENDING";
  },
};
