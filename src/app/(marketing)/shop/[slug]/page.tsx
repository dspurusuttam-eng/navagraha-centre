import Link from "next/link";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { PageHero } from "@/components/site/page-hero";
import { AddToCartButton } from "@/modules/shop/components/add-to-cart-button";
import { ProductMerchArt } from "@/modules/shop/components/product-merch-art";
import { curatedShopCatalog } from "@/modules/shop/catalog";
import { getShopProduct } from "@/modules/shop";

type ShopProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return curatedShopCatalog.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ShopProductPageProps) {
  const { slug } = await params;
  const product = getShopProduct(slug);

  if (!product) {
    return buildPageMetadata({
      title: "Product",
      description: "Premium spiritual product detail from NAVAGRAHA CENTRE.",
      path: `/shop/${slug}`,
    });
  }

  return buildPageMetadata({
    title: product.name,
    description: product.summary,
    path: product.href,
    keywords: [
      product.categoryLabel,
      "premium spiritual products",
      "NAVAGRAHA CENTRE shop",
    ],
  });
}

export default async function ShopProductPage({
  params,
}: Readonly<ShopProductPageProps>) {
  const { slug } = await params;
  const product = getShopProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow={product.categoryLabel}
        title={product.name}
        description={product.summary}
        highlights={product.highlights.slice(0, 3)}
        note="This product is presented as a carefully framed spiritual support record, never as a guarantee, compulsion, or substitute for judgment."
        primaryAction={{ href: "/shop/cart", label: "Review Cart" }}
        secondaryAction={{
          href: "/consultation",
          label: "Book Consultation",
        }}
        supportTitle="Product Positioning"
      />

      <Section
        eyebrow="Product Overview"
        title="Merchandising detail without hard claims."
        description="The product page keeps sourcing language, spiritual framing, and operational intent explicit so browsing stays calm and informed."
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <ProductMerchArt
            eyebrow={product.categoryLabel}
            title={product.name}
            annotations={[
              product.priceLabel,
              product.materialLabel,
              product.ritualFocus,
            ]}
            tone={product.imageTone}
          />

          <Card className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="accent">{product.categoryLabel}</Badge>
              <Badge tone="neutral">{product.typeLabel}</Badge>
            </div>

            <div className="space-y-3">
              <p className="text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]">
                {product.priceLabel}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {product.description}
              </p>
            </div>

            <div className="space-y-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.84)] px-4 py-4 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              <p>
                Material:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {product.materialLabel}
                </span>
              </p>
              <p>
                Focus:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {product.ritualFocus}
                </span>
              </p>
              <p>
                Framing:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  Presented as an optional support product only
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <AddToCartButton productSlug={product.slug} size="lg" />
              <Link
                href="/shop/cart"
                className={buttonStyles({ tone: "secondary", size: "lg" })}
              >
                Open Cart
              </Link>
            </div>
          </Card>
        </div>
      </Section>

      <Section
        eyebrow="Approach"
        title="How this record should be approached."
        description="The notes stay transparent so the product sits inside a calm spiritual context rather than a transactional promise."
        tone="muted"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {product.notes.map((note) => (
            <Card key={note} className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Product Note
              </p>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {note}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Approved Remedy Context"
        title="Where this product can appear alongside approved remedy records."
        description="Related remedy contexts remain optional and transparent. They help connect the report layer to the catalog without turning product links into unsupported claims."
      >
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {product.relatedRemedies.map((remedy) => (
            <Card key={remedy.slug} className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone="accent">{remedy.typeLabel}</Badge>
                <Badge tone="neutral">Approved Remedy</Badge>
              </div>
              <div className="space-y-3">
                <p className="text-[length:var(--font-size-body-lg)] text-[color:var(--color-foreground)]">
                  {remedy.title}
                </p>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  {remedy.summary}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
