import Link from "next/link";
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
    <Card interactive className="space-y-5 overflow-hidden p-0">
      <ProductMerchArt
        eyebrow={product.categoryLabel}
        title={product.name}
        annotations={[product.badge, product.priceLabel, product.materialLabel]}
        tone={product.imageTone}
        compact
      />

      <div className="space-y-5 px-6 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="accent">{product.categoryLabel}</Badge>
          <Badge tone="neutral">{product.typeLabel}</Badge>
        </div>

        <div className="space-y-3">
          <p className="text-[length:var(--font-size-body-lg)] text-[color:var(--color-foreground)]">
            {product.name}
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {product.summary}
          </p>
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            {product.ritualFocus}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={product.href}
            className={buttonStyles({ tone: "secondary", size: "sm" })}
          >
            View Product
          </Link>
          <AddToCartButton productSlug={product.slug} size="sm" />
        </div>
      </div>
    </Card>
  );
}
