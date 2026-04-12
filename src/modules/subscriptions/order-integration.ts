import "server-only";

import type { Prisma } from "@prisma/client";
import { isSubscriptionPlanId } from "@/modules/subscriptions/plans";
import { createSubscriptionService } from "@/modules/subscriptions/service";
import type { SubscriptionPlanId, SubscriptionSnapshot } from "@/modules/subscriptions/types";

type SyncSubscriptionFromPaidOrderInput = {
  userId: string | null;
  orderId: string;
  orderNumber: string;
  paymentMetadata: Prisma.InputJsonObject | Prisma.JsonValue | null;
  finalizedAtUtc: string;
  providerKey: string;
};

function readPlanIdFromMetadata(
  metadata: Prisma.InputJsonObject | Prisma.JsonValue | null
): SubscriptionPlanId | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const candidate = (metadata as Prisma.JsonObject).subscriptionPlanId;

  if (typeof candidate !== "string") {
    return null;
  }

  const normalized = candidate.trim().toUpperCase();

  if (!normalized || !isSubscriptionPlanId(normalized)) {
    return null;
  }

  return normalized;
}

export async function syncSubscriptionFromPaidOrder(
  tx: Prisma.TransactionClient,
  input: SyncSubscriptionFromPaidOrderInput
): Promise<SubscriptionSnapshot | null> {
  if (!input.userId) {
    return null;
  }

  const planId = readPlanIdFromMetadata(input.paymentMetadata);

  if (!planId) {
    return null;
  }

  return createSubscriptionService(tx).createSubscription({
    userId: input.userId,
    planId,
    sourceOrderId: input.orderId,
    startDate: new Date(input.finalizedAtUtc),
    metadata: {
      source: "paid-order-finalization",
      sourceOrderNumber: input.orderNumber,
      providerKey: input.providerKey,
      finalizedAtUtc: input.finalizedAtUtc,
      subscriptionPlanId: planId,
    },
  });
}
