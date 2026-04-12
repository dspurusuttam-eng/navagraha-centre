import "server-only";

import {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { formatShopPrice } from "@/modules/shop/service";

export type MemberOrderLifecycleState =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type MemberOrderStatusMessage = {
  title: string;
  description: string;
  nextStepLabel?: string;
  nextStepHref?: string;
  secondaryStepLabel?: string;
  secondaryStepHref?: string;
};

export type MemberOrderConfirmationTarget = {
  orderNumber: string;
  confirmationToken: string;
  lookupKey: string;
  lookupPath: string;
};

export type MemberOrderListItem = {
  orderId: string;
  orderNumber: string;
  createdAtUtc: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  lifecycleState: MemberOrderLifecycleState;
  totalAmount: number;
  totalLabel: string;
  currencyCode: string;
  itemSummary: string;
  itemCount: number;
};

export type MemberOrderDetailItem = {
  titleSnapshot: string;
  quantity: number;
  lineTotal: number;
  lineTotalLabel: string;
};

export type MemberOrderDetail = {
  orderId: string;
  orderNumber: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  lifecycleState: MemberOrderLifecycleState;
  statusMessage: MemberOrderStatusMessage;
  totalAmount: number;
  totalLabel: string;
  currencyCode: string;
  trustedAmountSnapshot: number;
  trustedAmountLabel: string;
  trustedCurrencyCode: string;
  itemCount: number;
  items: MemberOrderDetailItem[];
  paymentProvider: PaymentProvider;
  paymentProviderLabel: string;
  providerReference: string | null;
  finalizedAtUtc: string | null;
  confirmationTarget: MemberOrderConfirmationTarget | null;
};

const paymentProviderLabels: Record<PaymentProvider, string> = {
  MANUAL_PLACEHOLDER: "Centre Payment Review",
  STRIPE: "Stripe",
};

function toLifecycleState(
  status: OrderStatus,
  paymentStatus: PaymentStatus
): MemberOrderLifecycleState {
  if (paymentStatus === "REFUNDED" || status === "REFUNDED") {
    return "REFUNDED";
  }

  if (
    paymentStatus === "PAID" ||
    status === "PAID" ||
    status === "FULFILLED"
  ) {
    return "PAID";
  }

  if (paymentStatus === "FAILED" || status === "CANCELLED") {
    return "FAILED";
  }

  return "PENDING";
}

function getStatusMessage(
  lifecycleState: MemberOrderLifecycleState
): MemberOrderStatusMessage {
  switch (lifecycleState) {
    case "PAID":
      return {
        title: "Payment confirmed",
        description:
          "Your order is secured. The centre now handles the next fulfillment step and updates will remain visible in your protected account.",
        nextStepLabel: "Review Orders",
        nextStepHref: "/dashboard/orders",
        secondaryStepLabel: "Back To Dashboard",
        secondaryStepHref: "/dashboard",
      };
    case "FAILED":
      return {
        title: "Payment needs another attempt",
        description:
          "This order could not be completed. You can begin a fresh checkout from your cart whenever you are ready.",
        nextStepLabel: "Retry From Cart",
        nextStepHref: "/shop/cart",
        secondaryStepLabel: "Review Orders",
        secondaryStepHref: "/dashboard/orders",
      };
    case "REFUNDED":
      return {
        title: "Refund completed",
        description:
          "This order has moved to a refunded state. If you need support, use the contact route and include your order reference.",
        nextStepLabel: "Contact The Centre",
        nextStepHref: "/contact",
        secondaryStepLabel: "Browse Shop",
        secondaryStepHref: "/shop",
      };
    default:
      return {
        title: "Payment is being confirmed",
        description:
          "The order is recorded and awaiting final payment confirmation. No action is required until status updates here.",
        nextStepLabel: "Refresh Orders",
        nextStepHref: "/dashboard/orders",
        secondaryStepLabel: "Open Cart",
        secondaryStepHref: "/shop/cart",
      };
  }
}

function summarizeItems(
  items: Array<{
    titleSnapshot: string;
    quantity: number;
  }>,
  itemCount: number
) {
  if (!items.length) {
    return "Item details will appear once the order line records are available.";
  }

  const visible = items
    .map((item) => `${item.titleSnapshot} x${item.quantity}`)
    .join(", ");
  const hiddenCount = itemCount - items.length;

  if (hiddenCount <= 0) {
    return visible;
  }

  return `${visible} +${hiddenCount} more`;
}

function readJsonObject(
  value: Prisma.JsonValue | null | undefined
): Prisma.JsonObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Prisma.JsonObject;
}

function readStringFromObject(object: Prisma.JsonObject | null, key: string) {
  if (!object) {
    return null;
  }

  const value = object[key];

  return typeof value === "string" ? value : null;
}

function readConfirmationTarget(
  metadata: Prisma.JsonValue | null
): MemberOrderConfirmationTarget | null {
  const metaObject = readJsonObject(metadata);
  const confirmationCandidate = readJsonObject(
    metaObject?.confirmationTarget as Prisma.JsonValue | null
  );

  if (!confirmationCandidate) {
    return null;
  }

  const orderNumber = readStringFromObject(confirmationCandidate, "orderNumber");
  const confirmationToken = readStringFromObject(
    confirmationCandidate,
    "confirmationToken"
  );
  const lookupKey = readStringFromObject(confirmationCandidate, "lookupKey");
  const lookupPath = readStringFromObject(confirmationCandidate, "lookupPath");

  if (!orderNumber || !confirmationToken || !lookupKey || !lookupPath) {
    return null;
  }

  return {
    orderNumber,
    confirmationToken,
    lookupKey,
    lookupPath,
  };
}

export async function listMemberOrders(userId: string) {
  const rows = await getPrisma().order.findMany({
    where: {
      userId,
    },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      currencyCode: true,
      createdAt: true,
      items: {
        orderBy: [{ createdAt: "asc" }],
        take: 2,
        select: {
          titleSnapshot: true,
          quantity: true,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  return rows.map((row) => {
    const lifecycleState = toLifecycleState(row.status, row.paymentStatus);

    return {
      orderId: row.id,
      orderNumber: row.orderNumber,
      createdAtUtc: row.createdAt.toISOString(),
      status: row.status,
      paymentStatus: row.paymentStatus,
      lifecycleState,
      totalAmount: row.totalAmount,
      totalLabel: formatShopPrice(row.totalAmount, row.currencyCode),
      currencyCode: row.currencyCode,
      itemSummary: summarizeItems(row.items, row._count.items),
      itemCount: row._count.items,
    } satisfies MemberOrderListItem;
  });
}

export async function getMemberOrderDetail(
  userId: string,
  orderNumber: string
): Promise<MemberOrderDetail | null> {
  const row = await getPrisma().order.findFirst({
    where: {
      userId,
      orderNumber,
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentProvider: true,
      totalAmount: true,
      currencyCode: true,
      createdAt: true,
      updatedAt: true,
      items: {
        orderBy: [{ createdAt: "asc" }],
        select: {
          titleSnapshot: true,
          quantity: true,
          unitAmount: true,
        },
      },
      paymentRecords: {
        orderBy: [{ createdAt: "desc" }],
        take: 1,
        select: {
          providerReference: true,
          amount: true,
          currencyCode: true,
          metadata: true,
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  const lifecycleState = toLifecycleState(row.status, row.paymentStatus);
  const latestPayment = row.paymentRecords[0] ?? null;
  const paymentMetadata = latestPayment?.metadata ?? null;
  const metadataObject = readJsonObject(paymentMetadata);
  const finalizedAtUtc = readStringFromObject(metadataObject, "finalizedAtUtc");
  const trustedAmountSnapshot = latestPayment?.amount ?? row.totalAmount;
  const trustedCurrencyCode = latestPayment?.currencyCode ?? row.currencyCode;

  return {
    orderId: row.id,
    orderNumber: row.orderNumber,
    createdAtUtc: row.createdAt.toISOString(),
    updatedAtUtc: row.updatedAt.toISOString(),
    status: row.status,
    paymentStatus: row.paymentStatus,
    lifecycleState,
    statusMessage: getStatusMessage(lifecycleState),
    totalAmount: row.totalAmount,
    totalLabel: formatShopPrice(row.totalAmount, row.currencyCode),
    currencyCode: row.currencyCode,
    trustedAmountSnapshot,
    trustedAmountLabel: formatShopPrice(
      trustedAmountSnapshot,
      trustedCurrencyCode
    ),
    trustedCurrencyCode,
    itemCount: row._count.items,
    items: row.items.map((item) => ({
      titleSnapshot: item.titleSnapshot,
      quantity: item.quantity,
      lineTotal: item.unitAmount * item.quantity,
      lineTotalLabel: formatShopPrice(
        item.unitAmount * item.quantity,
        row.currencyCode
      ),
    })),
    paymentProvider: row.paymentProvider,
    paymentProviderLabel: paymentProviderLabels[row.paymentProvider],
    providerReference: latestPayment?.providerReference ?? null,
    finalizedAtUtc,
    confirmationTarget: readConfirmationTarget(paymentMetadata),
  };
}
