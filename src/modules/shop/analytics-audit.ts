import "server-only";

import { createHash } from "node:crypto";
import type { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { trackServerEvent } from "@/lib/observability";
import { getPrisma } from "@/lib/prisma";

export const commerceAnalyticsEventNames = [
  "checkout.started",
  "checkout.init.failed",
  "payment.webhook.received",
  "payment.verified",
  "payment.failed",
  "order.finalized",
  "order.finalization.skipped_duplicate",
] as const;

export type CommerceAnalyticsEventName =
  (typeof commerceAnalyticsEventNames)[number];

export type CommerceAuditEntryShape = {
  eventName: CommerceAnalyticsEventName;
  occurredAtUtc: string;
  orderId?: string;
  orderNumber?: string;
  checkoutReference?: string;
  providerKey?: string;
  providerReference?: string;
  paymentRecordId?: string;
  orderStatusFrom?: OrderStatus;
  orderStatusTo?: OrderStatus;
  paymentStatusFrom?: PaymentStatus;
  paymentStatusTo?: PaymentStatus;
  amount?: number;
  currencyCode?: string;
  reason?: string;
  context?: Record<string, string | number | boolean | null | undefined>;
};

type CommerceAnalyticsDispatchResult = {
  tracked: boolean;
  audited: boolean;
};

const eventSummaries: Record<CommerceAnalyticsEventName, string> = {
  "checkout.started": "Commerce checkout initialization completed.",
  "checkout.init.failed": "Commerce checkout initialization failed.",
  "payment.webhook.received": "Commerce payment webhook received.",
  "payment.verified": "Commerce payment webhook verified.",
  "payment.failed": "Commerce payment failed or was marked unsuccessful.",
  "order.finalized": "Commerce order finalized to paid state.",
  "order.finalization.skipped_duplicate":
    "Commerce order finalization was skipped because it was already handled.",
};

function buildAuditEntityId(event: CommerceAuditEntryShape) {
  if (event.orderId) {
    return event.orderId;
  }

  if (event.orderNumber) {
    return event.orderNumber;
  }

  if (event.providerReference) {
    return event.providerReference;
  }

  const digest = createHash("sha256")
    .update(
      `${event.eventName}:${event.providerKey ?? "unknown"}:${event.occurredAtUtc}`,
      "utf8"
    )
    .digest("hex")
    .slice(0, 24);

  return `commerce_${digest}`;
}

function toAuditMetadata(
  event: CommerceAuditEntryShape
): Prisma.InputJsonObject {
  return {
    eventName: event.eventName,
    occurredAtUtc: event.occurredAtUtc,
    orderNumber: event.orderNumber ?? null,
    checkoutReference: event.checkoutReference ?? null,
    providerKey: event.providerKey ?? null,
    providerReference: event.providerReference ?? null,
    paymentRecordId: event.paymentRecordId ?? null,
    orderStatusTransition:
      event.orderStatusFrom || event.orderStatusTo
        ? {
            from: event.orderStatusFrom ?? null,
            to: event.orderStatusTo ?? null,
          }
        : null,
    paymentStatusTransition:
      event.paymentStatusFrom || event.paymentStatusTo
        ? {
            from: event.paymentStatusFrom ?? null,
            to: event.paymentStatusTo ?? null,
          }
        : null,
    amount: typeof event.amount === "number" ? event.amount : null,
    currencyCode: event.currencyCode ?? null,
    reason: event.reason ?? null,
    context: event.context ?? null,
  };
}

function toTrackedContext(event: CommerceAuditEntryShape) {
  return {
    orderId: event.orderId,
    orderNumber: event.orderNumber,
    checkoutReference: event.checkoutReference,
    providerKey: event.providerKey,
    providerReference: event.providerReference,
    paymentRecordId: event.paymentRecordId,
    orderStatusFrom: event.orderStatusFrom,
    orderStatusTo: event.orderStatusTo,
    paymentStatusFrom: event.paymentStatusFrom,
    paymentStatusTo: event.paymentStatusTo,
    amount: event.amount,
    currencyCode: event.currencyCode,
    reason: event.reason,
    ...(event.context ?? {}),
  };
}

export async function emitCommerceAnalyticsEventSafely(
  event: CommerceAuditEntryShape
): Promise<CommerceAnalyticsDispatchResult> {
  let tracked = false;
  let audited = false;

  try {
    trackServerEvent(`commerce.${event.eventName}`, toTrackedContext(event));
    tracked = true;
  } catch (error) {
    console.error("commerce-analytics tracking failed", {
      eventName: event.eventName,
      orderNumber: event.orderNumber,
      message:
        error instanceof Error
          ? error.message
          : "Unknown commerce analytics tracking failure.",
    });
  }

  try {
    await getPrisma().auditLog.create({
      data: {
        entityType: "COMMERCE_EVENT",
        entityId: buildAuditEntityId(event),
        action: event.eventName,
        summary: eventSummaries[event.eventName],
        metadata: toAuditMetadata(event),
      },
    });
    audited = true;
  } catch (error) {
    console.error("commerce-analytics audit failed", {
      eventName: event.eventName,
      orderNumber: event.orderNumber,
      message:
        error instanceof Error
          ? error.message
          : "Unknown commerce analytics audit failure.",
    });
  }

  return {
    tracked,
    audited,
  };
}
