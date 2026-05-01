import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AddToCartButton } from "@/modules/shop/components/add-to-cart-button";
import { ProductMerchArt } from "@/modules/shop/components/product-merch-art";
import type { ShopProductPreview } from "@/modules/shop/types";

export function ProductCard({
  product,
}: Readonly<{
  product: ShopProductPreview;
}>) {
  return (
    <Card
      tone="light"
      interactive
      className="service-offering-card flex h-full flex-col space-y-5 overflow-hidden p-0"
    >
      <ProductMerchArt
        eyebrow={product.categoryLabel}
        title={product.name}
        annotations={[product.badge, product.priceLabel, product.materialLabel]}
        tone={product.imageTone}
        compact
      />

      <div className="flex flex-1 flex-col space-y-5 px-6 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="accent">{product.categoryLabel}</Badge>
          <Badge tone="neutral">{product.typeLabel}</Badge>
        </div>

        <div className="space-y-3">
          <p className="text-[length:var(--font-size-body-lg)] text-[var(--color-ink-strong)]">
            {product.name}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            {product.summary}
          </p>
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            {product.ritualFocus}
          </p>
        </div>

        <div className="mt-auto grid gap-3 sm:grid-cols-2">
          <TrackedLink
            href={product.href}
            eventName="shop_interaction"
            eventPayload={{
              page: "/shop",
              feature: `shop-product-view-${product.slug}`,
            }}
            className={buttonStyles({
              tone: "secondary",
              size: "sm",
              className: "w-full justify-center",
            })}
          >
            View Product
          </TrackedLink>
          <AddToCartButton productSlug={product.slug} size="sm" fullWidth />
        </div>
      </div>
    </Card>
  );
}
