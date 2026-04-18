import "server-only";

import { OrderStatus, PaymentProvider, PaymentStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { formatShopPrice } from "@/modules/shop/service";
import {
  getRegisteredShopCheckoutProvider,
  resolveShopCheckoutProviderKey,
} from "@/modules/shop/payment-registry";

export const monetizationPlanKeys = ["FREE", "PREMIUM", "PRO"] as const;

export type MonetizationPlanKey = (typeof monetizationPlanKeys)[number];

type PaidMonetizationPlanKey = Exclude<MonetizationPlanKey, "FREE">;

export type MonetizationPlanDefinition = {
  key: MonetizationPlanKey;
  title: string;
  summary: string;
  monthlyAmountInMinor: number;
  currencyCode: "INR";
  linkedSubscriptionPlanId: "PREMIUM" | "PRO" | null;
};

export const monetizationPlanCatalog: Record<
  MonetizationPlanKey,
  MonetizationPlanDefinition
> = {
  FREE: {
    key: "FREE",
    title: "Free",
    summary: "Core chart access with limited daily assistant questions.",
    monthlyAmountInMinor: 0,
    currencyCode: "INR",
    linkedSubscriptionPlanId: null,
  },
  PREMIUM: {
    key: "PREMIUM",
    title: "Premium",
    summary: "Deeper assistant reasoning, premium report access, and higher usage limits.",
    monthlyAmountInMinor: 9900,
    currencyCode: "INR",
    linkedSubscriptionPlanId: "PREMIUM",
  },
  PRO: {
    key: "PRO",
    title: "Pro",
    summary: "Full plan access with highest limits and expanded premium AI depth.",
    monthlyAmountInMinor: 29900,
    currencyCode: "INR",
    linkedSubscriptionPlanId: "PRO",
  },
};

export function getMonetizationPlans() {
  return Object.values(monetizationPlanCatalog);
}

export function isPaidMonetizationPlanKey(
  value: string
): value is PaidMonetizationPlanKey {
  return value === "PREMIUM" || value === "PRO";
}

export function getMonetizationPlan(planKey: MonetizationPlanKey) {
  return monetizationPlanCatalog[planKey];
}

function buildOrderNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();

  return `NCSUB-${stamp}-${suffix}`;
}

function mapProviderToPaymentProvider(
  providerKey: "draft-order" | "stripe" | "razorpay"
) {
  if (providerKey === "draft-order") {
    return PaymentProvider.MANUAL_PLACEHOLDER;
  }

  return PaymentProvider.STRIPE;
}

export async function initializeSubscriptionCheckout(input: {
  userId: string;
  planKey: PaidMonetizationPlanKey;
  customerEmail: string;
  customerName: string;
  billingTimezone?: string;
}) {
  const plan = getMonetizationPlan(input.planKey);
  const linkedPlanId = plan.linkedSubscriptionPlanId;

  if (!linkedPlanId) {
    throw new Error("Selected plan is not payable.");
  }

  const providerKey = resolveShopCheckoutProviderKey();
  const provider = getRegisteredShopCheckoutProvider(providerKey);
  const orderNumber = buildOrderNumber();
  const checkoutReference = `sub_${crypto.randomUUID()}`;

  const order = await getPrisma().order.create({
    data: {
      userId: input.userId,
      orderNumber,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.NOT_STARTED,
      paymentProvider: mapProviderToPaymentProvider(provider.key),
      checkoutReference,
      currencyCode: plan.currencyCode,
      subtotalAmount: plan.monthlyAmountInMinor,
      totalAmount: plan.monthlyAmountInMinor,
      billingName: input.customerName,
      customerEmail: input.customerEmail,
      billingTimezone: input.billingTimezone ?? "Asia/Kolkata",
      notes: `${plan.title} plan checkout`,
      paymentRecords: {
        create: {
          provider: mapProviderToPaymentProvider(provider.key),
          status: PaymentStatus.NOT_STARTED,
          amount: plan.monthlyAmountInMinor,
          currencyCode: plan.currencyCode,
          metadata: {
            type: "subscription-plan-checkout",
            subscriptionPlanId: linkedPlanId,
            monetizationPlanKey: plan.key,
          },
        },
      },
    },
    select: {
      id: true,
      orderNumber: true,
      totalAmount: true,
      currencyCode: true,
      checkoutReference: true,
    },
  });

  const session = provider.createCheckoutSession
    ? await provider.createCheckoutSession({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        currencyCode: order.currencyCode,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        returnUrl: "/settings",
        cancelUrl: "/settings",
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          checkoutReference: order.checkoutReference ?? order.orderNumber,
          subscriptionPlanId: linkedPlanId,
          monetizationPlanKey: plan.key,
        },
      })
    : {
        providerKey: provider.key,
        sessionReference: order.orderNumber,
      };

  await getPrisma().paymentRecord.updateMany({
    where: {
      orderId: order.id,
    },
    data: {
      providerReference: session.sessionReference,
      redirectUrl: session.redirectUrl ?? null,
      metadata: {
        type: "subscription-plan-checkout",
        subscriptionPlanId: linkedPlanId,
        monetizationPlanKey: plan.key,
        checkoutReference: order.checkoutReference ?? order.orderNumber,
        providerKey: provider.key,
      },
    },
  });

  return {
    plan: {
      key: plan.key,
      title: plan.title,
      summary: plan.summary,
      amountLabel: formatShopPrice(plan.monthlyAmountInMinor, plan.currencyCode),
      monthlyAmountInMinor: plan.monthlyAmountInMinor,
      currencyCode: plan.currencyCode,
      linkedSubscriptionPlanId: linkedPlanId,
    },
    checkout: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      providerKey: provider.key,
      amount: order.totalAmount,
      amountLabel: formatShopPrice(order.totalAmount, order.currencyCode),
      currencyCode: order.currencyCode,
      paymentStatus: "NOT_STARTED" as const,
      session,
    },
  };
}
