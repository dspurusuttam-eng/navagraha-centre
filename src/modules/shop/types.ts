import type {
  PaymentProvider,
  PaymentStatus,
  ProductCategory,
  ProductType,
  RemedyType,
} from "@prisma/client";

export type ShopProductVisualTone = "gold" | "midnight" | "ember";

export type CuratedShopProductRecord = {
  slug: string;
  sku: string;
  name: string;
  summary: string;
  description: string;
  category: ProductCategory;
  type: ProductType;
  priceInMinor: number;
  currencyCode: "INR";
  badge: string;
  materialLabel: string;
  ritualFocus: string;
  inventoryCount: number | null;
  isFeatured: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  imageTone: ShopProductVisualTone;
  highlights: readonly string[];
  notes: readonly string[];
  relatedRemedySlugs: readonly string[];
  relationshipNote: string;
};

export type ShopCategorySummary = {
  key: ProductCategory;
  label: string;
  description: string;
  anchorId: string;
};

export type ShopRelatedRemedy = {
  slug: string;
  title: string;
  summary: string;
  type: RemedyType;
  typeLabel: string;
};

export type ShopProductPreview = {
  slug: string;
  name: string;
  summary: string;
  category: ProductCategory;
  categoryLabel: string;
  typeLabel: string;
  priceInMinor: number;
  priceLabel: string;
  badge: string;
  materialLabel: string;
  ritualFocus: string;
  isFeatured: boolean;
  inventoryCount: number | null;
  href: string;
  imageTone: ShopProductVisualTone;
};

export type ShopProductDetail = ShopProductPreview & {
  description: string;
  notes: readonly string[];
  highlights: readonly string[];
  relatedRemedies: ShopRelatedRemedy[];
};

export type RemedyLinkedProduct = {
  slug: string;
  name: string;
  summary: string;
  categoryLabel: string;
  priceLabel: string;
  href: string;
  relationshipNote: string;
};

export type ShopCartLineInput = {
  slug: string;
  quantity: number;
};

export type ShopCartItem = ShopProductPreview & {
  quantity: number;
  lineTotalInMinor: number;
  lineTotalLabel: string;
};

export type PreparedCheckoutLineItem = {
  slug: string;
  titleSnapshot: string;
  quantity: number;
  lineTotalLabel: string;
  href: string;
};

export type PreparedCheckout = {
  orderId: string;
  orderNumber: string;
  currencyCode: string;
  subtotalAmount: number;
  subtotalLabel: string;
  totalAmount: number;
  totalLabel: string;
  paymentProvider: PaymentProvider;
  paymentProviderLabel: string;
  paymentStatus: PaymentStatus;
  paymentStatusLabel: string;
  nextStep: string;
  items: PreparedCheckoutLineItem[];
};
