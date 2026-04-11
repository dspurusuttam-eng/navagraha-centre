import "server-only";

import { createHash } from "node:crypto";
import {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import type {
  ShopCheckoutProviderKey,
  ShopPaymentLifecycleStatus,
} from "@/modules/shop/payment-boundary";
import {
  getRegisteredShopCheckoutProvider,
  isShopCheckoutProviderKey,
} from "@/modules/shop/payment-registry";

export const SHOP_PROCESSABLE_WEBHOOK_EVENT_TYPES = [
  "payment.paid",
  "payment.failed",
  "payment.refunded",
] as const;

type ProcessableWebhookStatus = "PAID" | "FAILED" | "REFUNDED";

export type ShopWebhookProcessingOutcome =
  | "processed"
  | "duplicate"
  | "ignored"
  | "invalid-signature"
  | "unsupported-provider"
  | "missing-record";

export type ProcessShopPaymentWebhookInput = {
  providerKey?: string | null;
  rawBody: string;
  signature: string | null;
};

export type ProcessShopPaymentWebhookResult = {
  outcome: ShopWebhookProcessingOutcome;
  providerKey: ShopCheckoutProviderKey | "unknown";
  eventId?: string;
  eventType?: string;
  message: string;
  orderId?: string;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
};

function getWebhookMarkerId(providerKey: string, eventId: string) {
  const digest = createHash("sha256")
    .update(`${providerKey}:${eventId}`, "utf8")
    .digest("hex")
    .slice(0, 24);

  return `paywh_${digest}`;
}

function getFallbackEventId(rawBody: string) {
  return createHash("sha256").update(rawBody, "utf8").digest("hex").slice(0, 16);
}

function toPaymentProvider(providerKey: ShopCheckoutProviderKey) {
  if (providerKey === "stripe") {
    return PaymentProvider.STRIPE;
  }

  return PaymentProvider.MANUAL_PLACEHOLDER;
}

function toPaymentStatus(
  status: ProcessableWebhookStatus
): PaymentStatus {
  switch (status) {
    case "PAID":
      return PaymentStatus.PAID;
    case "FAILED":
      return PaymentStatus.FAILED;
    case "REFUNDED":
      return PaymentStatus.REFUNDED;
  }
}

function toOrderStatus(
  currentStatus: OrderStatus,
  status: ProcessableWebhookStatus
): OrderStatus {
  switch (status) {
    case "PAID":
      return OrderStatus.PAID;
    case "FAILED":
      return currentStatus === OrderStatus.PAID ? OrderStatus.PAID : OrderStatus.CANCELLED;
    case "REFUNDED":
      return OrderStatus.REFUNDED;
  }
}

function toProcessableStatus(
  status: ShopPaymentLifecycleStatus | undefined
): ProcessableWebhookStatus | null {
  if (status === "PAID" || status === "FAILED" || status === "REFUNDED") {
    return status;
  }

  return null;
}

function mergeMetadata(
  existing: Prisma.JsonValue | null,
  patch: Prisma.InputJsonObject
): Prisma.InputJsonObject {
  if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
    return patch;
  }

  return {
    ...(existing as Prisma.JsonObject),
    ...patch,
  };
}

export async function processShopPaymentWebhook(
  input: ProcessShopPaymentWebhookInput
): Promise<ProcessShopPaymentWebhookResult> {
  const providerKeyCandidate = input.providerKey ?? undefined;

  if (!isShopCheckoutProviderKey(providerKeyCandidate)) {
    return {
      outcome: "unsupported-provider",
      providerKey: "unknown",
      message: "Unsupported webhook provider key.",
    };
  }

  const provider = getRegisteredShopCheckoutProvider(providerKeyCandidate);

  if (!provider.verifyWebhookEvent) {
    return {
      outcome: "unsupported-provider",
      providerKey: provider.key,
      message: "The provider does not support webhook verification.",
    };
  }

  const webhookEvent = await provider.verifyWebhookEvent(
    input.rawBody,
    input.signature
  );
  const eventId =
    webhookEvent.eventId && webhookEvent.eventId !== "unknown"
      ? webhookEvent.eventId
      : getFallbackEventId(input.rawBody);
  const normalizedStatus = toProcessableStatus(
    webhookEvent.normalizedStatus ??
      provider.normalizeProviderStatus?.(webhookEvent.eventType)
  );

  if (!webhookEvent.verified) {
    return {
      outcome: "invalid-signature",
      providerKey: provider.key,
      eventId,
      eventType: webhookEvent.eventType,
      message: "Webhook signature verification failed.",
    };
  }

  if (!normalizedStatus) {
    return {
      outcome: "ignored",
      providerKey: provider.key,
      eventId,
      eventType: webhookEvent.eventType,
      message: "Webhook event type is not processable in this phase.",
    };
  }

  if (!webhookEvent.checkoutReference && !webhookEvent.orderNumber) {
    return {
      outcome: "ignored",
      providerKey: provider.key,
      eventId,
      eventType: webhookEvent.eventType,
      message: "Webhook event is missing order reference fields.",
    };
  }

  const order = await getPrisma().order.findFirst({
    where: {
      OR: [
        webhookEvent.checkoutReference
          ? { checkoutReference: webhookEvent.checkoutReference }
          : undefined,
        webhookEvent.orderNumber ? { orderNumber: webhookEvent.orderNumber } : undefined,
      ].filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      currencyCode: true,
    },
  });

  if (!order) {
    return {
      outcome: "missing-record",
      providerKey: provider.key,
      eventId,
      eventType: webhookEvent.eventType,
      message: "No matching order was found for this webhook event.",
    };
  }

  const nextPaymentStatus = toPaymentStatus(normalizedStatus);
  const nextOrderStatus = toOrderStatus(order.status, normalizedStatus);
  const providerReference =
    webhookEvent.paymentReference || `${provider.key}:${eventId}`;
  const eventEntityId = `${provider.key}:${eventId}`;
  const eventMarkerId = getWebhookMarkerId(provider.key, eventId);

  try {
    await getPrisma().$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          id: eventMarkerId,
          entityType: "PAYMENT_WEBHOOK_EVENT",
          entityId: eventEntityId,
          action: "processed",
          summary: "Payment webhook processed for order state transition.",
          metadata: {
            providerKey: provider.key,
            eventType: webhookEvent.eventType,
            orderId: order.id,
            checkoutReference: webhookEvent.checkoutReference ?? null,
            orderNumber: webhookEvent.orderNumber ?? null,
            processedAtUtc: new Date().toISOString(),
          },
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: nextOrderStatus,
          paymentStatus: nextPaymentStatus,
          paymentProvider: toPaymentProvider(provider.key),
        },
      });

      const latestRecord = await tx.paymentRecord.findFirst({
        where: {
          orderId: order.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          metadata: true,
        },
      });

      const resolvedAmount =
        typeof webhookEvent.amount === "number" ? webhookEvent.amount : order.totalAmount;
      const resolvedCurrencyCode =
        webhookEvent.currencyCode || order.currencyCode;

      const webhookMetadataPatch: Prisma.InputJsonObject = {
        webhookEventId: eventId,
        webhookEventType: webhookEvent.eventType,
        webhookProvider: provider.key,
        webhookOccurredAtUtc: webhookEvent.occurredAtUtc,
      };

      if (latestRecord) {
        await tx.paymentRecord.update({
          where: {
            id: latestRecord.id,
          },
          data: {
            provider: toPaymentProvider(provider.key),
            status: nextPaymentStatus,
            providerReference,
            amount: resolvedAmount,
            currencyCode: resolvedCurrencyCode,
            metadata: mergeMetadata(latestRecord.metadata, webhookMetadataPatch),
          },
        });
      } else {
        await tx.paymentRecord.create({
          data: {
            orderId: order.id,
            provider: toPaymentProvider(provider.key),
            status: nextPaymentStatus,
            providerReference,
            amount: resolvedAmount,
            currencyCode: resolvedCurrencyCode,
            metadata: webhookMetadataPatch,
          },
        });
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        outcome: "duplicate",
        providerKey: provider.key,
        eventId,
        eventType: webhookEvent.eventType,
        orderId: order.id,
        paymentStatus: nextPaymentStatus,
        orderStatus: nextOrderStatus,
        message: "Webhook event was already processed.",
      };
    }

    throw error;
  }

  return {
    outcome: "processed",
    providerKey: provider.key,
    eventId,
    eventType: webhookEvent.eventType,
    orderId: order.id,
    paymentStatus: nextPaymentStatus,
    orderStatus: nextOrderStatus,
    message: "Webhook event processed successfully.",
  };
}
