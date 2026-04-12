import "server-only";

import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  type Product,
} from "@prisma/client";

type InventoryTransactionClient = Prisma.TransactionClient;

export type ReservableInventoryLine = {
  productId: string;
  slug: string;
  name: string;
  quantity: number;
  inventoryCount: number | null;
};

const reservingOrderStatuses = [OrderStatus.PENDING] as const;
const reservingPaymentStatuses = [
  PaymentStatus.NOT_STARTED,
  PaymentStatus.PENDING,
  PaymentStatus.AUTHORIZED,
] as const;

function buildAvailabilityError(name: string, availableUnits: number) {
  if (availableUnits <= 0) {
    return `${name} is currently out of stock. Please remove it from the cart before checkout.`;
  }

  return `Only ${availableUnits} units are currently available for ${name}.`;
}

export async function getReservedQuantityByProductId(
  tx: InventoryTransactionClient,
  productIds: string[],
  excludeOrderId?: string
) {
  if (!productIds.length) {
    return new Map<string, number>();
  }

  const reservedItems = await tx.orderItem.findMany({
    where: {
      productId: {
        in: productIds,
      },
      order: {
        status: {
          in: [...reservingOrderStatuses],
        },
        paymentStatus: {
          in: [...reservingPaymentStatuses],
        },
        ...(excludeOrderId
          ? {
              id: {
                not: excludeOrderId,
              },
            }
          : {}),
      },
    },
    select: {
      productId: true,
      quantity: true,
    },
  });

  const reservedByProductId = new Map<string, number>();

  for (const item of reservedItems) {
    if (!item.productId) {
      continue;
    }

    reservedByProductId.set(
      item.productId,
      (reservedByProductId.get(item.productId) ?? 0) + item.quantity
    );
  }

  return reservedByProductId;
}

export async function assertReservableInventory(
  tx: InventoryTransactionClient,
  lines: ReservableInventoryLine[],
  excludeOrderId?: string
) {
  const finiteInventoryLines = lines.filter(
    (line) => typeof line.inventoryCount === "number"
  );

  if (!finiteInventoryLines.length) {
    return;
  }

  const reservedByProductId = await getReservedQuantityByProductId(
    tx,
    finiteInventoryLines.map((line) => line.productId),
    excludeOrderId
  );

  for (const line of finiteInventoryLines) {
    const reservedQuantity = reservedByProductId.get(line.productId) ?? 0;
    const availableUnits = Math.max(0, (line.inventoryCount ?? 0) - reservedQuantity);

    if (line.quantity > availableUnits) {
      throw new Error(buildAvailabilityError(line.name, availableUnits));
    }
  }
}

export function buildInventoryReservationMetadata(
  lines: ReservableInventoryLine[]
) {
  return {
    inventoryReservationStatus: "ACTIVE",
    inventoryReservedAtUtc: new Date().toISOString(),
    reservedItems: lines
      .filter((line) => typeof line.inventoryCount === "number")
      .map((line) => ({
        productId: line.productId,
        slug: line.slug,
        quantity: line.quantity,
      })),
  } as const;
}

export async function applyPaidInventoryDeduction(
  tx: InventoryTransactionClient,
  items: Array<{
    quantity: number;
    product: Pick<Product, "id" | "name" | "inventoryCount"> | null;
  }>
) {
  for (const item of items) {
    if (!item.product || item.product.inventoryCount === null) {
      continue;
    }

    const result = await tx.product.updateMany({
      where: {
        id: item.product.id,
        inventoryCount: {
          gte: item.quantity,
        },
      },
      data: {
        inventoryCount: {
          decrement: item.quantity,
        },
      },
    });

    if (result.count === 0) {
      throw new Error(
        `Paid finalization could not deduct stock for ${item.product.name} safely.`
      );
    }
  }
}
