import "server-only";

import { createHash } from "node:crypto";
import {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { recordAnalyticsEventSafely } from "@/lib/analytics/event-store";
import { applyPaidInventoryDeduction } from "@/modules/shop/inventory";
import { emitCommerceAnalyticsEventSafely } from "@/modules/shop/analytics-audit";
import { emitShopNotificationEventSafely } from "@/modules/shop/notification-hooks";
import type { ShopCheckoutProviderKey } from "@/modules/shop/payment-boundary";
import { buildShopReceiptData, type ShopReceiptData } from "@/modules/shop/receipt";
import { syncSubscriptionFromPaidOrder } from "@/modules/subscriptions";
import { isSubscriptionPlanId } from "@/modules/subscriptions/plans";

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
  receipt?: ShopReceiptData;
  message: string;
};

function toPaymentProvider(providerKey: ShopCheckoutProviderKey) {
  if (providerKey === "stripe" || providerKey === "razorpay") {
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

function readCompletedUpgradePlanId(
  metadata: Prisma.JsonValue | Prisma.InputJsonValue | null
): "PREMIUM" | "PRO" | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const planId = (metadata as Prisma.JsonObject).subscriptionPlanId;

  if (typeof planId !== "string") {
    return null;
  }

  const normalized = planId.trim().toUpperCase();

  if (!isSubscriptionPlanId(normalized)) {
    return null;
  }

  if (normalized === "PREMIUM" || normalized === "PRO") {
    return normalized;
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
    await emitCommerceAnalyticsEventSafely({
      eventName: "order.finalization.skipped_duplicate",
      occurredAtUtc: new Date().toISOString(),
      providerKey: input.providerKey,
      reason: "Webhook event marker already existed.",
      context: {
        eventId: input.eventId,
        eventType: input.eventType,
      },
    });

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
      billingName: true,
      customerEmail: true,
      customerPhone: true,
      billingTimezone: true,
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
      items: {
        select: {
          titleSnapshot: true,
          skuSnapshot: true,
          unitAmount: true,
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              inventoryCount: true,
            },
          },
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
    await emitCommerceAnalyticsEventSafely({
      eventName: "order.finalization.skipped_duplicate",
      occurredAtUtc: new Date().toISOString(),
      orderId: matchedOrder.id,
      orderNumber: matchedOrder.orderNumber,
      checkoutReference: matchedOrder.checkoutReference ?? undefined,
      providerKey: input.providerKey,
      orderStatusFrom: matchedOrder.status,
      orderStatusTo: matchedOrder.status,
      paymentStatusFrom: matchedOrder.paymentStatus,
      paymentStatusTo: matchedOrder.paymentStatus,
      amount: matchedOrder.totalAmount,
      currencyCode: matchedOrder.currencyCode,
      reason: "Order was already in a stable paid state.",
      context: {
        eventId: input.eventId,
        eventType: input.eventType,
      },
    });

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
  let completedUpgradePlanId: "PREMIUM" | "PRO" | null = null;
  const receipt = buildShopReceiptData({
    orderId: matchedOrder.id,
    orderNumber: matchedOrder.orderNumber,
    orderStatus: OrderStatus.PAID,
    paymentStatus: PaymentStatus.PAID,
    paymentProvider: toPaymentProvider(input.providerKey),
    trustedAmount: resolvedAmount,
    currencyCode: resolvedCurrencyCode,
    finalizedAtUtc,
    customer: {
      billingName: matchedOrder.billingName,
      customerEmail: matchedOrder.customerEmail,
      customerPhone: matchedOrder.customerPhone,
      billingTimezone: matchedOrder.billingTimezone,
    },
    items: matchedOrder.items.map((item) => ({
      titleSnapshot: item.titleSnapshot,
      skuSnapshot: item.skuSnapshot,
      quantity: item.quantity,
      unitAmount: item.unitAmount,
    })),
    confirmationTarget,
  });

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

      await applyPaidInventoryDeduction(tx, matchedOrder.items);

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
        inventoryReservationStatus: "COMMITTED",
        inventoryCommittedAtUtc: finalizedAtUtc,
      };

      if (latestRecord) {
        const mergedPaymentMetadata = mergeMetadata(
          latestRecord.metadata,
          finalizationMetadataPatch
        );

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
            metadata: mergedPaymentMetadata,
          },
        });

        await syncSubscriptionFromPaidOrder(tx, {
          userId: matchedOrder.userId,
          orderId: matchedOrder.id,
          orderNumber: matchedOrder.orderNumber,
          paymentMetadata: mergedPaymentMetadata,
          finalizedAtUtc,
          providerKey: input.providerKey,
        });
        completedUpgradePlanId = readCompletedUpgradePlanId(mergedPaymentMetadata);
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

        await syncSubscriptionFromPaidOrder(tx, {
          userId: matchedOrder.userId,
          orderId: matchedOrder.id,
          orderNumber: matchedOrder.orderNumber,
          paymentMetadata: finalizationMetadataPatch,
          finalizedAtUtc,
          providerKey: input.providerKey,
        });
        completedUpgradePlanId = readCompletedUpgradePlanId(finalizationMetadataPatch);
      }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      await emitCommerceAnalyticsEventSafely({
        eventName: "order.finalization.skipped_duplicate",
        occurredAtUtc: finalizedAtUtc,
        orderId: matchedOrder.id,
        orderNumber: matchedOrder.orderNumber,
        checkoutReference: matchedOrder.checkoutReference ?? undefined,
        providerKey: input.providerKey,
        orderStatusFrom: matchedOrder.status,
        orderStatusTo: OrderStatus.PAID,
        paymentStatusFrom: matchedOrder.paymentStatus,
        paymentStatusTo: PaymentStatus.PAID,
        amount: resolvedAmount,
        currencyCode: resolvedCurrencyCode,
        reason: "Paid finalization unique constraint prevented a duplicate commit.",
        context: {
          eventId: input.eventId,
          eventType: input.eventType,
        },
      });

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

  await emitShopNotificationEventSafely({
    eventName: "order.paid.confirmed",
    occurredAtUtc: finalizedAtUtc,
    orderId: matchedOrder.id,
    orderNumber: matchedOrder.orderNumber,
    orderStatus: OrderStatus.PAID,
    paymentStatus: PaymentStatus.PAID,
    trustedAmount: resolvedAmount,
    currencyCode: resolvedCurrencyCode,
    customer: receipt.customer,
    confirmationTarget,
    receipt,
  });

  await emitCommerceAnalyticsEventSafely({
    eventName: "order.finalized",
    occurredAtUtc: finalizedAtUtc,
    orderId: matchedOrder.id,
    orderNumber: matchedOrder.orderNumber,
    checkoutReference: matchedOrder.checkoutReference ?? undefined,
    providerKey: input.providerKey,
    providerReference,
    orderStatusFrom: matchedOrder.status,
    orderStatusTo: OrderStatus.PAID,
    paymentStatusFrom: matchedOrder.paymentStatus,
    paymentStatusTo: PaymentStatus.PAID,
    amount: resolvedAmount,
    currencyCode: resolvedCurrencyCode,
    context: {
      eventId: input.eventId,
      eventType: input.eventType,
    },
  });

  recordAnalyticsEventSafely({
    event: "payment_success",
    userId: matchedOrder.userId,
    payload: {
      page: "/shop/checkout",
      feature: "checkout-finalized",
      orderNumber: matchedOrder.orderNumber,
      amount: resolvedAmount,
      currencyCode: resolvedCurrencyCode,
    },
  });

  if (completedUpgradePlanId) {
    recordAnalyticsEventSafely({
      event: "upgrade_completed",
      userId: matchedOrder.userId,
      payload: {
        page: "/settings",
        surface: "protected",
        plan: completedUpgradePlanId,
        feature: "subscription-upgrade-completed",
        orderNumber: matchedOrder.orderNumber,
      },
    });
  }

  return {
    outcome: "finalized",
    orderId: matchedOrder.id,
    orderNumber: matchedOrder.orderNumber,
    orderStatus: OrderStatus.PAID,
    paymentStatus: PaymentStatus.PAID,
    confirmationTarget,
    receipt,
    message: "Order finalized successfully.",
  };
}
