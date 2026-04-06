import { curatedRemedyCatalog } from "@/modules/remedies/catalog";
import {
  curatedShopCatalog,
  productTypeLabels,
  shopCategoryLabels,
  shopCategoryOrder,
  shopCategorySummaries,
} from "@/modules/shop/catalog";
import type {
  CuratedShopProductRecord,
  RemedyLinkedProduct,
  ShopCartItem,
  ShopCartLineInput,
  ShopCategorySummary,
  ShopProductDetail,
  ShopProductPreview,
  ShopRelatedRemedy,
} from "@/modules/shop/types";

const remedyTypeLabels = {
  MANTRA: "Mantra",
  RUDRAKSHA: "Rudraksha",
  MALA: "Mala",
  GEMSTONE: "Gemstone",
  YANTRA: "Yantra",
  PUJA: "Puja",
  DONATION: "Donation",
  FASTING: "Fasting",
  SPIRITUAL_DISCIPLINE: "Spiritual Discipline",
} as const;

function sortCatalogRecords(
  a: CuratedShopProductRecord,
  b: CuratedShopProductRecord
) {
  if (a.sortOrder !== b.sortOrder) {
    return a.sortOrder - b.sortOrder;
  }

  return a.name.localeCompare(b.name, "en");
}

function getCatalogRecord(slug: string) {
  return curatedShopCatalog.find((product) => product.slug === slug) ?? null;
}

function toProductPreview(
  product: CuratedShopProductRecord
): ShopProductPreview {
  return {
    slug: product.slug,
    name: product.name,
    summary: product.summary,
    category: product.category,
    categoryLabel: shopCategoryLabels[product.category],
    typeLabel: productTypeLabels[product.type],
    priceInMinor: product.priceInMinor,
    priceLabel: formatShopPrice(product.priceInMinor, product.currencyCode),
    badge: product.badge,
    materialLabel: product.materialLabel,
    ritualFocus: product.ritualFocus,
    isFeatured: product.isFeatured,
    inventoryCount: product.inventoryCount,
    href: buildProductHref(product.slug),
    imageTone: product.imageTone,
  };
}

export function buildProductHref(slug: string) {
  return `/shop/${slug}`;
}

export function formatShopPrice(priceInMinor: number, currencyCode = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(priceInMinor / 100);
}

export function listShopProducts() {
  return [...curatedShopCatalog].sort(sortCatalogRecords).map(toProductPreview);
}

export function listFeaturedShopProducts() {
  return listShopProducts().filter((product) => product.isFeatured);
}

export function getShopCategorySummaries(): readonly ShopCategorySummary[] {
  return shopCategorySummaries;
}

export function getShopProductsByCategory() {
  const records = [...curatedShopCatalog].sort(sortCatalogRecords);

  return shopCategoryOrder
    .map((category) => {
      const summary = shopCategorySummaries.find(
        (item) => item.key === category
      );

      return {
        category,
        summary: summary as ShopCategorySummary,
        products: records
          .filter((product) => product.category === category)
          .map(toProductPreview),
      };
    })
    .filter((section) => section.products.length);
}

export function getShopProduct(slug: string): ShopProductDetail | null {
  const record = getCatalogRecord(slug);

  if (!record) {
    return null;
  }

  const relatedRemedies: ShopRelatedRemedy[] = curatedRemedyCatalog
    .filter((remedy) => record.relatedRemedySlugs.includes(remedy.slug))
    .map((remedy) => ({
      slug: remedy.slug,
      title: remedy.title,
      summary: remedy.summary,
      type: remedy.type,
      typeLabel: remedyTypeLabels[remedy.type],
    }));

  return {
    ...toProductPreview(record),
    description: record.description,
    notes: record.notes,
    highlights: record.highlights,
    relatedRemedies,
  };
}

export function buildValidatedCartLines(items: ShopCartLineInput[]) {
  const quantityBySlug = new Map<string, number>();

  for (const item of items) {
    const quantity = Number(item.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      continue;
    }

    quantityBySlug.set(
      item.slug,
      (quantityBySlug.get(item.slug) ?? 0) + quantity
    );
  }

  const lines = Array.from(quantityBySlug.entries()).map(([slug, quantity]) => {
    const product = getCatalogRecord(slug);

    if (!product) {
      throw new Error("One or more cart items are no longer available.");
    }

    if (product.inventoryCount !== null && quantity > product.inventoryCount) {
      throw new Error(
        `Only ${product.inventoryCount} units are available for ${product.name}.`
      );
    }

    return {
      product,
      quantity,
    };
  });

  if (!lines.length) {
    throw new Error("Add at least one product before preparing checkout.");
  }

  return lines.sort((a, b) => sortCatalogRecords(a.product, b.product));
}

export function buildShopCartItems(items: ShopCartLineInput[]): ShopCartItem[] {
  return buildValidatedCartLines(items).map(({ product, quantity }) => {
    const preview = toProductPreview(product);
    const lineTotalInMinor = product.priceInMinor * quantity;

    return {
      ...preview,
      quantity,
      lineTotalInMinor,
      lineTotalLabel: formatShopPrice(lineTotalInMinor, product.currencyCode),
    };
  });
}

export function getCartSubtotal(items: ShopCartLineInput[]) {
  return buildValidatedCartLines(items).reduce(
    (total, line) => total + line.product.priceInMinor * line.quantity,
    0
  );
}

export function getRelatedProductsForRemedySlugs(remedySlugs: string[]) {
  const remedyMap = new Map<string, RemedyLinkedProduct[]>(
    remedySlugs.map((slug) => [slug, []])
  );

  for (const product of [...curatedShopCatalog].sort(sortCatalogRecords)) {
    for (const remedySlug of product.relatedRemedySlugs) {
      const entries = remedyMap.get(remedySlug);

      if (!entries) {
        continue;
      }

      entries.push({
        slug: product.slug,
        name: product.name,
        summary: product.summary,
        categoryLabel: shopCategoryLabels[product.category],
        priceLabel: formatShopPrice(product.priceInMinor, product.currencyCode),
        href: buildProductHref(product.slug),
        relationshipNote: product.relationshipNote,
      });
    }
  }

  return remedyMap;
}
