import "server-only";

import {
  Prisma,
  type PrismaClient,
  SubscriptionStatus,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  getSubscriptionPlan,
  isSubscriptionPlanId,
} from "@/modules/subscriptions/plans";
import type {
  SubscriptionPlanId,
  SubscriptionSnapshot,
} from "@/modules/subscriptions/types";

type SubscriptionDbClient = Prisma.TransactionClient | PrismaClient;

type CreateSubscriptionInput = {
  userId: string;
  planId: SubscriptionPlanId;
  startDate?: Date;
  nextBillingDate?: Date | null;
  metadata?: Prisma.InputJsonObject;
  sourceOrderId?: string | null;
};

type ActivateSubscriptionInput = {
  subscriptionId: string;
  nextBillingDate?: Date | null;
  metadata?: Prisma.InputJsonObject;
};

type CancelSubscriptionInput = {
  subscriptionId: string;
  endDate?: Date;
  metadata?: Prisma.InputJsonObject;
};

type ExpireSubscriptionInput = {
  subscriptionId: string;
  endDate?: Date;
  metadata?: Prisma.InputJsonObject;
};

type PlanSubscriptionRecord = {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date;
  nextBillingDate: Date | null;
  endDate: Date | null;
  sourceOrderId: string | null;
  metadata: Prisma.JsonValue | null;
};

function addDays(value: Date, days: number) {
  return new Date(value.getTime() + days * 24 * 60 * 60 * 1_000);
}

function mergeMetadata(
  existing: Prisma.JsonValue | null,
  patch: Prisma.InputJsonObject | undefined
) {
  if (!patch) {
    return existing ?? Prisma.JsonNull;
  }

  if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
    return patch;
  }

  return {
    ...(existing as Prisma.JsonObject),
    ...patch,
  };
}

function toSnapshot(record: PlanSubscriptionRecord): SubscriptionSnapshot {
  if (!isSubscriptionPlanId(record.planId)) {
    throw new Error("Invalid subscription plan id found in database.");
  }

  return {
    id: record.id,
    userId: record.userId,
    planId: record.planId,
    status: record.status,
    startDateUtc: record.startDate.toISOString(),
    nextBillingDateUtc: record.nextBillingDate?.toISOString() ?? null,
    endDateUtc: record.endDate?.toISOString() ?? null,
    sourceOrderId: record.sourceOrderId,
    metadata:
      record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata)
        ? (record.metadata as Record<string, unknown>)
        : null,
  };
}

async function readSubscriptionById(
  db: SubscriptionDbClient,
  subscriptionId: string
) {
  return db.subscription.findUnique({
    where: { id: subscriptionId },
    select: {
      id: true,
      userId: true,
      planId: true,
      status: true,
      startDate: true,
      nextBillingDate: true,
      endDate: true,
      sourceOrderId: true,
      metadata: true,
    },
  });
}

export function createSubscriptionService(db: SubscriptionDbClient = getPrisma()) {
  return {
    async createSubscription(input: CreateSubscriptionInput) {
      getSubscriptionPlan(input.planId);

      const startDate = input.startDate ?? new Date();
      const nextBillingDate =
        input.nextBillingDate === undefined
          ? addDays(startDate, 30)
          : input.nextBillingDate;
      const sourceOrderId = input.sourceOrderId ?? null;

      await db.subscription.updateMany({
        where: {
          userId: input.userId,
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAUSED],
          },
          ...(sourceOrderId ? { NOT: { sourceOrderId } } : {}),
        },
        data: {
          status: SubscriptionStatus.EXPIRED,
          endDate: startDate,
        },
      });

      const metadata = mergeMetadata(null, input.metadata);

      const record = sourceOrderId
        ? await db.subscription.upsert({
            where: {
              sourceOrderId,
            },
            update: {
              planId: input.planId,
              status: SubscriptionStatus.ACTIVE,
              startDate,
              nextBillingDate,
              endDate: null,
              metadata,
            },
            create: {
              userId: input.userId,
              planId: input.planId,
              status: SubscriptionStatus.ACTIVE,
              startDate,
              nextBillingDate,
              endDate: null,
              sourceOrderId,
              metadata,
            },
            select: {
              id: true,
              userId: true,
              planId: true,
              status: true,
              startDate: true,
              nextBillingDate: true,
              endDate: true,
              sourceOrderId: true,
              metadata: true,
            },
          })
        : await db.subscription.create({
            data: {
              userId: input.userId,
              planId: input.planId,
              status: SubscriptionStatus.ACTIVE,
              startDate,
              nextBillingDate,
              endDate: null,
              metadata,
            },
            select: {
              id: true,
              userId: true,
              planId: true,
              status: true,
              startDate: true,
              nextBillingDate: true,
              endDate: true,
              sourceOrderId: true,
              metadata: true,
            },
          });

      return toSnapshot(record);
    },

    async activateSubscription(input: ActivateSubscriptionInput) {
      const existing = await readSubscriptionById(db, input.subscriptionId);

      if (!existing) {
        return null;
      }

      const nextBillingDate =
        input.nextBillingDate === undefined
          ? existing.nextBillingDate ?? addDays(new Date(), 30)
          : input.nextBillingDate;

      const record = await db.subscription.update({
        where: {
          id: existing.id,
        },
        data: {
          status: SubscriptionStatus.ACTIVE,
          endDate: null,
          nextBillingDate,
          metadata: mergeMetadata(existing.metadata, input.metadata),
        },
        select: {
          id: true,
          userId: true,
          planId: true,
          status: true,
          startDate: true,
          nextBillingDate: true,
          endDate: true,
          sourceOrderId: true,
          metadata: true,
        },
      });

      return toSnapshot(record);
    },

    async cancelSubscription(input: CancelSubscriptionInput) {
      const existing = await readSubscriptionById(db, input.subscriptionId);

      if (!existing) {
        return null;
      }

      const record = await db.subscription.update({
        where: {
          id: existing.id,
        },
        data: {
          status: SubscriptionStatus.CANCELLED,
          endDate: input.endDate ?? new Date(),
          nextBillingDate: null,
          metadata: mergeMetadata(existing.metadata, input.metadata),
        },
        select: {
          id: true,
          userId: true,
          planId: true,
          status: true,
          startDate: true,
          nextBillingDate: true,
          endDate: true,
          sourceOrderId: true,
          metadata: true,
        },
      });

      return toSnapshot(record);
    },

    async expireSubscription(input: ExpireSubscriptionInput) {
      const existing = await readSubscriptionById(db, input.subscriptionId);

      if (!existing) {
        return null;
      }

      const record = await db.subscription.update({
        where: {
          id: existing.id,
        },
        data: {
          status: SubscriptionStatus.EXPIRED,
          endDate: input.endDate ?? new Date(),
          nextBillingDate: null,
          metadata: mergeMetadata(existing.metadata, input.metadata),
        },
        select: {
          id: true,
          userId: true,
          planId: true,
          status: true,
          startDate: true,
          nextBillingDate: true,
          endDate: true,
          sourceOrderId: true,
          metadata: true,
        },
      });

      return toSnapshot(record);
    },

    async getActiveSubscription(userId: string) {
      const record = await db.subscription.findFirst({
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE,
          OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
        },
        orderBy: [{ startDate: "desc" }],
        select: {
          id: true,
          userId: true,
          planId: true,
          status: true,
          startDate: true,
          nextBillingDate: true,
          endDate: true,
          sourceOrderId: true,
          metadata: true,
        },
      });

      if (!record) {
        return null;
      }

      return toSnapshot(record);
    },

    async getLatestSubscription(userId: string) {
      const record = await db.subscription.findFirst({
        where: {
          userId,
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          userId: true,
          planId: true,
          status: true,
          startDate: true,
          nextBillingDate: true,
          endDate: true,
          sourceOrderId: true,
          metadata: true,
        },
      });

      if (!record) {
        return null;
      }

      return toSnapshot(record);
    },

    async hasActiveSubscription(userId: string) {
      const active = await db.subscription.count({
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE,
          OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
        },
      });

      return active > 0;
    },
  };
}

export function getSubscriptionService() {
  return createSubscriptionService();
}
