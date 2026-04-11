import "server-only";

import {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  ProductStatus,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { curatedShopCatalog } from "@/modules/shop/catalog";
import type {
  PrepareShopCheckoutInput,
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

export const draftShopCheckoutProvider: ShopPaymentProvider = {
  key: "draft-order",
  label: "Draft Order",
  async prepareCheckout(input: PrepareShopCheckoutInput) {
    const lines = buildValidatedCartLines(input.items);
    const prisma = getPrisma();
    const orderNumber = buildOrderNumber();
    const checkoutReference = `shop_${crypto.randomUUID()}`;

    const preparedOrder = await prisma.$transaction(async (tx) => {
      const productIds = new Map<string, string>();

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
          },
        });

        productIds.set(record.slug, product.id);
      }

      const subtotalAmount = lines.reduce(
        (total, line) => total + line.product.priceInMinor * line.quantity,
        0
      );

      return tx.order.create({
        data: {
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
              product: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
      });
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
        const product = curatedShopCatalog.find(
          (entry) => entry.slug === item.product?.slug
        );
        const lineTotal = (product?.priceInMinor ?? 0) * item.quantity;

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
