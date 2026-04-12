import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  ProductStatus,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  assertReservableInventory,
  buildInventoryReservationMetadata,
} from "@/modules/shop/inventory";
import type {
  PrepareShopCheckoutInput,
  ShopPaymentLifecycleStatus,
  ShopPaymentProvider,
} from "@/modules/shop/payment-boundary";
import {
  buildValidatedCartLines,
  formatShopPrice,
} from "@/modules/shop/service";

function buildOrderNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();

  return `NC-${stamp}-${suffix}`;
}

function getDraftWebhookSecret() {
  const candidate =
    process.env.SHOP_DRAFT_WEBHOOK_SECRET ?? process.env.SHOP_WEBHOOK_SECRET;

  if (!candidate) {
    return null;
  }

  const trimmed = candidate.trim();

  return trimmed.length ? trimmed : null;
}

function buildDraftWebhookSignature(body: string, secret: string) {
  return createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

function verifyDraftWebhookSignature(signature: string | null, body: string) {
  const secret = getDraftWebhookSecret();

  if (!secret) {
    return false;
  }

  if (!signature) {
    return false;
  }

  const candidate = signature.trim();

  if (!candidate) {
    return false;
  }

  const expected = buildDraftWebhookSignature(body, secret);
  const expectedBuffer = Buffer.from(expected, "utf8");
  const candidateBuffer = Buffer.from(candidate, "utf8");

  if (expectedBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, candidateBuffer);
}

function normalizeDraftEventTypeToStatus(
  eventType: string
): ShopPaymentLifecycleStatus | null {
  switch (eventType) {
    case "payment.pending":
      return "PENDING";
    case "payment.authorized":
      return "AUTHORIZED";
    case "payment.paid":
      return "PAID";
    case "payment.failed":
      return "FAILED";
    case "payment.refunded":
      return "REFUNDED";
    default:
      return null;
  }
}

function buildCheckoutReference(idempotencyKey?: string) {
  if (idempotencyKey) {
    const normalized = idempotencyKey
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 64);

    if (normalized) {
      return `shop_${normalized}`;
    }
  }

  return `shop_${crypto.randomUUID()}`;
}

const paymentProviderLabels: Record<PaymentProvider, string> = {
  MANUAL_PLACEHOLDER: "Manual Review",
  STRIPE: "Stripe",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  NOT_STARTED: "Not Started",
  PENDING: "Pending",
  AUTHORIZED: "Authorized",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

type DraftWebhookPayload = {
  id?: unknown;
  type?: unknown;
  createdAtUtc?: unknown;
  data?: {
    checkoutReference?: unknown;
    orderNumber?: unknown;
    paymentReference?: unknown;
    amount?: unknown;
    currencyCode?: unknown;
  };
};

export const draftShopCheckoutProvider: ShopPaymentProvider = {
  key: "draft-order",
  label: "Draft Order",
  normalizeProviderStatus(providerStatus) {
    return normalizeDraftEventTypeToStatus(providerStatus) ?? "PENDING";
  },
  async verifyWebhookEvent(rawBody, signature) {
    const verified = verifyDraftWebhookSignature(signature, rawBody);
    let parsedPayload: DraftWebhookPayload | null = null;

    if (verified) {
      try {
        parsedPayload = JSON.parse(rawBody) as DraftWebhookPayload;
      } catch {
        parsedPayload = null;
      }
    }

    const payload: DraftWebhookPayload = parsedPayload ?? {
      id: "unverified",
      type: "unverified",
      createdAtUtc: new Date().toISOString(),
      data: {},
    };

    const eventType =
      typeof payload.type === "string" ? payload.type : "unknown";
    const occurredAtUtc =
      typeof payload.createdAtUtc === "string"
        ? payload.createdAtUtc
        : new Date().toISOString();
    const normalizedStatus = normalizeDraftEventTypeToStatus(eventType);

    return {
      providerKey: "draft-order",
      eventId: typeof payload.id === "string" ? payload.id : "unknown",
      eventType,
      occurredAtUtc,
      verified,
      payload,
      checkoutReference:
        typeof payload.data?.checkoutReference === "string"
          ? payload.data.checkoutReference
          : undefined,
      orderNumber:
        typeof payload.data?.orderNumber === "string"
          ? payload.data.orderNumber
          : undefined,
      paymentReference:
        typeof payload.data?.paymentReference === "string"
          ? payload.data.paymentReference
          : undefined,
      amount:
        typeof payload.data?.amount === "number" ? payload.data.amount : undefined,
      currencyCode:
        typeof payload.data?.currencyCode === "string"
          ? payload.data.currencyCode
          : undefined,
      normalizedStatus: normalizedStatus ?? undefined,
    };
  },
  async createCheckoutSession(input) {
    return {
      providerKey: "draft-order",
      sessionReference: `draft_${input.orderNumber}`,
    };
  },
  async prepareCheckout(input: PrepareShopCheckoutInput) {
    const lines = buildValidatedCartLines(input.items);
    const prisma = getPrisma();
    const orderNumber = buildOrderNumber();
    const checkoutReference = buildCheckoutReference(input.idempotencyKey);

    const existingOrder = await prisma.order.findUnique({
      where: {
        checkoutReference,
      },
      select: {
        id: true,
        orderNumber: true,
        currencyCode: true,
        subtotalAmount: true,
        totalAmount: true,
        paymentProvider: true,
        paymentStatus: true,
        items: {
          select: {
            titleSnapshot: true,
            quantity: true,
            unitAmount: true,
            product: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    });

    if (existingOrder) {
      return {
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
        currencyCode: existingOrder.currencyCode,
        subtotalAmount: existingOrder.subtotalAmount,
        subtotalLabel: formatShopPrice(existingOrder.subtotalAmount),
        totalAmount: existingOrder.totalAmount,
        totalLabel: formatShopPrice(existingOrder.totalAmount),
        paymentProvider: existingOrder.paymentProvider,
        paymentProviderLabel:
          paymentProviderLabels[existingOrder.paymentProvider],
        paymentStatus: existingOrder.paymentStatus,
        paymentStatusLabel: paymentStatusLabels[existingOrder.paymentStatus],
        nextStep:
          "The order request has been recorded. NAVAGRAHA CENTRE can confirm availability and the next step before any payment is requested.",
        items: existingOrder.items.map((item) => {
          const lineTotal = item.unitAmount * item.quantity;

          return {
            slug: item.product?.slug ?? "",
            titleSnapshot: item.titleSnapshot,
            quantity: item.quantity,
            lineTotalLabel: formatShopPrice(lineTotal),
            href: item.product?.slug ? `/shop/${item.product.slug}` : "/shop",
          };
        }),
      };
    }

    const preparedOrder = await prisma.$transaction(async (tx) => {
      const productIds = new Map<string, string>();
      const reservableLines: Array<{
        productId: string;
        slug: string;
        name: string;
        quantity: number;
        inventoryCount: number | null;
      }> = [];

      for (const line of lines) {
        const record = line.product;
        const product = await tx.product.upsert({
          where: { slug: record.slug },
          update: {
            sku: record.sku,
            name: record.name,
            summary: record.summary,
            description: record.description,
            category: record.category,
            type: record.type,
            status: ProductStatus.ACTIVE,
            priceInMinor: record.priceInMinor,
            currencyCode: record.currencyCode,
            badge: record.badge,
            materialLabel: record.materialLabel,
            ritualFocus: record.ritualFocus,
            isFeatured: record.isFeatured,
            sortOrder: record.sortOrder,
            metadata: {
              highlights: record.highlights,
              notes: record.notes,
              imageTone: record.imageTone,
              relationshipNote: record.relationshipNote,
            },
            seoTitle: record.seoTitle,
            seoDescription: record.seoDescription,
          },
          create: {
            slug: record.slug,
            sku: record.sku,
            name: record.name,
            summary: record.summary,
            description: record.description,
            category: record.category,
            type: record.type,
            status: ProductStatus.ACTIVE,
            priceInMinor: record.priceInMinor,
            currencyCode: record.currencyCode,
            badge: record.badge,
            materialLabel: record.materialLabel,
            ritualFocus: record.ritualFocus,
            inventoryCount: record.inventoryCount,
            isFeatured: record.isFeatured,
            sortOrder: record.sortOrder,
            metadata: {
              highlights: record.highlights,
              notes: record.notes,
              imageTone: record.imageTone,
              relationshipNote: record.relationshipNote,
            },
            seoTitle: record.seoTitle,
            seoDescription: record.seoDescription,
          },
          select: {
            id: true,
            inventoryCount: true,
          },
        });

        productIds.set(record.slug, product.id);
        reservableLines.push({
          productId: product.id,
          slug: record.slug,
          name: record.name,
          quantity: line.quantity,
          inventoryCount: product.inventoryCount,
        });
      }

      await assertReservableInventory(tx, reservableLines);

      const subtotalAmount = lines.reduce(
        (total, line) => total + line.product.priceInMinor * line.quantity,
        0
      );
      const inventoryReservation = buildInventoryReservationMetadata(
        reservableLines
      );

      return tx.order.create({
        data: {
          userId: input.userId ?? null,
          orderNumber,
          status: OrderStatus.PENDING,
          paymentProvider: PaymentProvider.MANUAL_PLACEHOLDER,
          paymentStatus: PaymentStatus.NOT_STARTED,
          checkoutReference,
          currencyCode: "INR",
          subtotalAmount,
          totalAmount: subtotalAmount,
          billingName: input.billingName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone ?? null,
          billingTimezone: input.billingTimezone,
          notes: input.notes ?? null,
          items: {
            create: lines.map((line) => ({
              productId: productIds.get(line.product.slug) ?? null,
              titleSnapshot: line.product.name,
              skuSnapshot: line.product.sku,
              categorySnapshot: line.product.category,
              unitAmount: line.product.priceInMinor,
              quantity: line.quantity,
            })),
          },
          paymentRecords: {
            create: {
              provider: PaymentProvider.MANUAL_PLACEHOLDER,
              status: PaymentStatus.NOT_STARTED,
              amount: subtotalAmount,
              currencyCode: "INR",
              metadata: {
                type: "shop-foundation-draft",
                productSlugs: lines.map((line) => line.product.slug),
                trustedSubtotalAmount: subtotalAmount,
                trustedCurrencyCode: "INR",
                idempotencyKey: input.idempotencyKey ?? null,
                ...inventoryReservation,
              },
            },
          },
        },
        select: {
          id: true,
          orderNumber: true,
          currencyCode: true,
          subtotalAmount: true,
          totalAmount: true,
          paymentProvider: true,
          paymentStatus: true,
          items: {
            select: {
              titleSnapshot: true,
              quantity: true,
              unitAmount: true,
              product: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    return {
      orderId: preparedOrder.id,
      orderNumber: preparedOrder.orderNumber,
      currencyCode: preparedOrder.currencyCode,
      subtotalAmount: preparedOrder.subtotalAmount,
      subtotalLabel: formatShopPrice(preparedOrder.subtotalAmount),
      totalAmount: preparedOrder.totalAmount,
      totalLabel: formatShopPrice(preparedOrder.totalAmount),
      paymentProvider: preparedOrder.paymentProvider,
      paymentProviderLabel:
        paymentProviderLabels[preparedOrder.paymentProvider],
      paymentStatus: preparedOrder.paymentStatus,
      paymentStatusLabel: paymentStatusLabels[preparedOrder.paymentStatus],
      nextStep:
        "The order request has been recorded. NAVAGRAHA CENTRE can confirm availability and the next step before any payment is requested.",
      items: preparedOrder.items.map((item) => {
        const lineTotal = item.unitAmount * item.quantity;

        return {
          slug: item.product?.slug ?? "",
          titleSnapshot: item.titleSnapshot,
          quantity: item.quantity,
          lineTotalLabel: formatShopPrice(lineTotal),
          href: item.product?.slug ? `/shop/${item.product.slug}` : "/shop",
        };
      }),
    };
  },
};
