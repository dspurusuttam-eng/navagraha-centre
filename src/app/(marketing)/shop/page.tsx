import Link from "next/link";
import { buildPageMetadata } from "@/lib/metadata";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { EditorialPlaceholder } from "@/components/site/editorial-placeholder";
import { PageHero } from "@/components/site/page-hero";
import { ProductCard } from "@/modules/shop/components/product-card";
import {
  getShopCategorySummaries,
  getShopProductsByCategory,
  listFeaturedShopProducts,
} from "@/modules/shop";

export const metadata = buildPageMetadata({
  title: "Spiritual Shop",
  description:
    "Browse NAVAGRAHA CENTRE's premium spiritual shop for Rudraksha, malas, gemstones, yantras, idols, and mantra practice companions.",
  path: "/shop",
  keywords: [
    "spiritual shop",
    "rudraksha shop",
    "premium yantras",
    "mantra practice products",
    "astrology remedy products",
  ],
});

const featuredProducts = listFeaturedShopProducts();
const categorySummaries = getShopCategorySummaries();
const productsByCategory = getShopProductsByCategory();

export default function ShopPage() {
  return (
    <>
      <PageHero
        eyebrow="Spiritual Shop"
        title="A premium catalog of spiritual supports, merchandised with restraint."
        description="The NAVAGRAHA CENTRE shop is designed to feel composed, editorial, and calm. Every record is framed as a thoughtful support product rather than a hard claim, urgency trigger, or guaranteed result."
        highlights={[
          "Curated categories for Rudraksha, malas, gemstones, yantras, idols, and mantra remedies",
          "Cart and checkout foundation prepared without locking the UI to a payment gateway yet",
          "Remedy records can point to related products without turning them into prescriptions",
        ]}
        note="The catalog language stays transparent on purpose: spiritual products can support a practice, but they do not replace discernment, consultation, or practical judgment."
        primaryAction={{ href: "/shop/cart", label: "Review Cart" }}
        secondaryAction={{
          href: "/consultation",
          label: "Book Consultation",
        }}
        supportTitle="Commerce Principles"
      />

      <Section
        eyebrow="Categories"
        title="Browse by spiritual format, not by urgency."
        description="Each category has its own tone, material logic, and role within a disciplined practice. The merchandising stays calm so clients can move with clarity."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categorySummaries.map((category) => (
            <Link
              key={category.key}
              href={`#${category.anchorId}`}
              className="rounded-[var(--radius-2xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-5 py-5 transition [transition-duration:var(--motion-duration-base)] hover:border-[color:var(--color-border-strong)] hover:bg-[rgba(255,255,255,0.04)]"
            >
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                {category.label}
              </p>
              <p className="mt-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Featured Edit"
        title="A first premium edit for careful spiritual commerce."
        description="The featured selection keeps the early catalog focused, polished, and easy to understand before more complex inventory or payment workflows arrive."
        id="featured-edit"
        tone="muted"
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <EditorialPlaceholder
            eyebrow="Merchandising View"
            title="Thoughtful product framing matters as much as the catalog itself."
            description="The visual system keeps the shop premium and grounded: dark surfaces, refined material language, and a visible refusal to turn spiritual products into fear-based conversion devices."
            annotations={[
              "Clear category structure",
              "Elegant placeholder art until final photography arrives",
              "Checkout prepared without payment lock-in",
              "Remedy links kept optional and transparent",
            ]}
            tone="gold"
            className="h-full"
          />

          <div className="grid gap-6 md:grid-cols-2">
            {featuredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </Section>

      {productsByCategory.map((section) => (
        <Section
          key={section.category}
          eyebrow={section.summary.label}
          title={`${section.summary.label} presented with calm, premium detail.`}
          description={section.summary.description}
          id={section.summary.anchorId}
        >
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {section.products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </Section>
      ))}

      <Section
        eyebrow="Checkout Foundation"
        title="The cart flow is ready for the next commerce phase."
        description="This foundation already supports browsing, product detail, saved cart state, and draft checkout preparation. The next payment phase can plug in without reworking the public catalog."
        tone="muted"
      >
        <Card tone="accent" className="space-y-5">
          <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Orders and payment-ready records are prepared through a clean
            checkout abstraction. That keeps the commerce layer modular while
            the current phase stays focused on catalog, cart, and premium
            merchandising surfaces.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop/cart" className={buttonStyles({ size: "lg" })}>
              Open Cart
            </Link>
            <Link
              href="/consultation"
              className={buttonStyles({ tone: "secondary", size: "lg" })}
            >
              Ask For Guidance
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
