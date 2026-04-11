import "server-only";

import { createHash } from "node:crypto";
import {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { ShopCheckoutProviderKey } from "@/modules/shop/payment-boundary";

export type OrderConfirmationTarget = {
  orderNumber: string;
  confirmationToken: string;
  lookupKey: string;
  lookupPath: string;
};

export type FinalizePaidOrderFromWebhookInput = {
  providerKey: ShopCheckoutProviderKey;
  eventId: string;
  eventType: string;
  occurredAtUtc: string;
  checkoutReference?: string;
  orderNumber?: string;
  paymentReference?: string;
  providerSessionReference?: string;
  amount?: number;
  currencyCode?: string;
};

export type FinalizePaidOrderFromWebhookOutcome =
  | "finalized"
  | "duplicate-event"
  | "already-finalized"
  | "missing-record";

export type FinalizePaidOrderFromWebhookResult = {
  outcome: FinalizePaidOrderFromWebhookOutcome;
  orderId?: string;
  orderNumber?: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  confirmationTarget?: OrderConfirmationTarget;
  message: string;
};

function toPaymentProvider(providerKey: ShopCheckoutProviderKey) {
  if (providerKey === "stripe") {
    return PaymentProvider.STRIPE;
  }

  return PaymentProvider.MANUAL_PLACEHOLDER;
}

function buildEventMarkerId(providerKey: string, eventId: string) {
  const digest = createHash("sha256")
    .update(`${providerKey}:${eventId}`, "utf8")
    .digest("hex")
    .slice(0, 24);

  return `paywh_${digest}`;
}

function buildFinalizationMarkerId(orderId: string) {
  const digest = createHash("sha256")
    .update(`paid-finalization:${orderId}`, "utf8")
    .digest("hex")
    .slice(0, 24);

  return `payfin_${digest}`;
}

function buildConfirmationToken(orderId: string) {
  return createHash("sha256")
    .update(`confirmation:${orderId}`, "utf8")
    .digest("hex")
    .slice(0, 24);
}

function buildConfirmationTarget(orderId: string, orderNumber: string) {
  const token = buildConfirmationToken(orderId);

  return {
    orderNumber,
    confirmationToken: token,
    lookupKey: orderNumber,
    lookupPath: `/shop/confirmation?order=${encodeURIComponent(orderNumber)}`,
  } satisfies OrderConfirmationTarget;
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

function readConfirmationTarget(
  metadata: Prisma.JsonValue | null
): OrderConfirmationTarget | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const candidate = (metadata as Prisma.JsonObject)
    .confirmationTarget as Prisma.JsonValue | undefined;

  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return null;
  }

  const value = candidate as Prisma.JsonObject;

  if (
    typeof value.orderNumber === "string" &&
    typeof value.confirmationToken === "string" &&
    typeof value.lookupKey === "string" &&
    typeof value.lookupPath === "string"
  ) {
    return {
      orderNumber: value.orderNumber,
      confirmationToken: value.confirmationToken,
      lookupKey: value.lookupKey,
      lookupPath: value.lookupPath,
    };
  }

  return null;
}

export async function finalizePaidOrderFromWebhook(
  input: FinalizePaidOrderFromWebhookInput
): Promise<FinalizePaidOrderFromWebhookResult> {
  if (!input.checkoutReference && !input.orderNumber) {
    return {
      outcome: "missing-record",
      message: "Finalization requires an orderNumber or checkoutReference.",
    };
  }

  const eventMarkerId = buildEventMarkerId(input.providerKey, input.eventId);
  const existingEventMarker = await getPrisma().auditLog.findUnique({
    where: {
      id: eventMarkerId,
    },
    select: {
      id: true,
    },
  });

  if (existingEventMarker) {
    return {
      outcome: "duplicate-event",
      message: "Webhook event was already processed.",
    };
  }

  const matchedOrder = await getPrisma().order.findFirst({
    where: {
      OR: [
        input.checkoutReference
          ? { checkoutReference: input.checkoutReference }
          : undefined,
        input.orderNumber ? { orderNumber: input.orderNumber } : undefined,
      ].filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    },
    select: {
      id: true,
      userId: true,
      orderNumber: true,
      checkoutReference: true,
      status: true,
      paymentStatus: true,
      currencyCode: true,
      totalAmount: true,
      paymentRecords: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          metadata: true,
        },
      },
    },
  });

  if (!matchedOrder) {
    return {
      outcome: "missing-record",
      message: "No matching order was found for paid finalization.",
    };
  }

  const confirmationTarget = buildConfirmationTarget(
    matchedOrder.id,
    matchedOrder.orderNumber
  );

  if (
    matchedOrder.status === OrderStatus.PAID &&
    matchedOrder.paymentStatus === PaymentStatus.PAID
  ) {
    return {
      outcome: "already-finalized",
      orderId: matchedOrder.id,
      orderNumber: matchedOrder.orderNumber,
      orderStatus: matchedOrder.status,
      paymentStatus: matchedOrder.paymentStatus,
      confirmationTarget:
        readConfirmationTarget(matchedOrder.paymentRecords[0]?.metadata) ??
        confirmationTarget,
      message: "Order is already finalized as paid.",
    };
  }

  const resolvedAmount =
    typeof input.amount === "number" ? input.amount : matchedOrder.totalAmount;
  const resolvedCurrencyCode = input.currencyCode || matchedOrder.currencyCode;
  const providerReference =
    input.paymentReference || `${input.providerKey}:${input.eventId}`;
  const finalizationMarkerId = buildFinalizationMarkerId(matchedOrder.id);
  const finalizedAtUtc = new Date().toISOString();

  try {
    await getPrisma().$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          id: eventMarkerId,
          entityType: "PAYMENT_WEBHOOK_EVENT",
          entityId: `${input.providerKey}:${input.eventId}`,
          action: "processed",
          summary: "Verified payment webhook accepted for paid finalization.",
          metadata: {
            providerKey: input.providerKey,
            eventType: input.eventType,
            orderId: matchedOrder.id,
            orderNumber: matchedOrder.orderNumber,
            checkoutReference:
              input.checkoutReference ?? matchedOrder.checkoutReference ?? null,
            processedAtUtc: finalizedAtUtc,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          id: finalizationMarkerId,
          entityType: "ORDER_PAYMENT_FINALIZATION",
          entityId: matchedOrder.id,
          action: "paid_finalized",
          summary: "Order payment finalized to a stable paid state.",
          metadata: {
            providerKey: input.providerKey,
            eventId: input.eventId,
            eventType: input.eventType,
            providerReference,
            providerSessionReference:
              input.providerSessionReference ??
              input.checkoutReference ??
              matchedOrder.checkoutReference ??
              null,
            trustedAmount: resolvedAmount,
            trustedCurrencyCode: resolvedCurrencyCode,
            finalizedAtUtc,
            confirmationTarget,
          },
        },
      });

      await tx.order.update({
        where: { id: matchedOrder.id },
        data: {
          status: OrderStatus.PAID,
          paymentStatus: PaymentStatus.PAID,
          paymentProvider: toPaymentProvider(input.providerKey),
        },
      });

      const latestRecord = await tx.paymentRecord.findFirst({
        where: {
          orderId: matchedOrder.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          metadata: true,
        },
      });

      const finalizationMetadataPatch: Prisma.InputJsonObject = {
        finalizedAtUtc,
        finalizedByEventId: input.eventId,
        finalizedByEventType: input.eventType,
        providerKey: input.providerKey,
        providerReference,
        providerSessionReference:
          input.providerSessionReference ??
          input.checkoutReference ??
          matchedOrder.checkoutReference ??
          null,
        trustedAmount: resolvedAmount,
        trustedCurrencyCode: resolvedCurrencyCode,
        confirmationTarget,
      };

      if (latestRecord) {
        await tx.paymentRecord.update({
          where: {
            id: latestRecord.id,
          },
          data: {
            provider: toPaymentProvider(input.providerKey),
            status: PaymentStatus.PAID,
            providerReference,
            amount: resolvedAmount,
            currencyCode: resolvedCurrencyCode,
            metadata: mergeMetadata(latestRecord.metadata, finalizationMetadataPatch),
          },
        });
      } else {
        await tx.paymentRecord.create({
          data: {
            orderId: matchedOrder.id,
            provider: toPaymentProvider(input.providerKey),
            status: PaymentStatus.PAID,
            providerReference,
            amount: resolvedAmount,
            currencyCode: resolvedCurrencyCode,
            metadata: finalizationMetadataPatch,
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
        outcome: "already-finalized",
        orderId: matchedOrder.id,
        orderNumber: matchedOrder.orderNumber,
        orderStatus: OrderStatus.PAID,
        paymentStatus: PaymentStatus.PAID,
        confirmationTarget,
        message:
          "Paid finalization was already completed for this order or event.",
      };
    }

    throw error;
  }

  return {
    outcome: "finalized",
    orderId: matchedOrder.id,
    orderNumber: matchedOrder.orderNumber,
    orderStatus: OrderStatus.PAID,
    paymentStatus: PaymentStatus.PAID,
    confirmationTarget,
    message: "Order finalized successfully.",
  };
}
