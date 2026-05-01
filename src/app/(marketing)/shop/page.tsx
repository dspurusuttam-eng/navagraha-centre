import Link from "next/link";
import { AnalyticsEventTracker } from "@/components/analytics/event-tracker";
import { GemstoneGuidanceCTA } from "@/components/monetization/GemstoneGuidanceCTA";
import { SponsoredDisclosure } from "@/components/monetization/SponsoredDisclosure";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { JsonLd } from "@/components/seo/json-ld";
import { createToolMetadata } from "@/lib/seo/metadata";
import { getCoreSeoCopy } from "@/lib/seo/seo-config";
import { createBreadcrumbSchema, createServiceSchema } from "@/lib/seo/schema";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { EditorialPlaceholder } from "@/components/site/editorial-placeholder";
import { PageHero } from "@/components/site/page-hero";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { ProductCard } from "@/modules/shop/components/product-card";
import {
  getShopCategorySummaries,
  getShopProductsByCategory,
  listFeaturedShopProducts,
} from "@/modules/shop";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const localized = getCoreSeoCopy("shop", locale);

  return createToolMetadata({
    title: localized.title,
    description: localized.description,
    path: "/shop",
    locale,
    explicitLocalePrefix: hasExplicitLocalePrefix,
    keywords: [
      "astrology shop",
      "gemstones",
      "rudraksha",
      "spiritual products",
      "gemstone guidance",
    ],
  });
}

const featuredProducts = listFeaturedShopProducts();
const categorySummaries = getShopCategorySummaries();
const productsByCategory = getShopProductsByCategory();

export default async function ShopPage() {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const shopSchemas = [
    createBreadcrumbSchema({
      locale,
      explicitLocalePrefix: hasExplicitLocalePrefix,
      items: [
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
      ],
    }),
    createServiceSchema({
      name: "Gemstone and Spiritual Product Guidance",
      description:
        "Explore gemstones, rudraksha, and spiritual products with calm, chart-aware guidance from NAVAGRAHA CENTRE.",
      path: "/shop",
      locale,
      serviceType: "Spiritual Product Guidance",
    }),
  ];

  return (
    <>
      <JsonLd id="shop-page-schema" data={shopSchemas} />
      <PageViewTracker page="/shop" feature="shop-page" />
      <AnalyticsEventTracker
        event="shop_interaction"
        payload={{ page: "/shop", feature: "shop-page" }}
      />

      <PageHero
        eyebrow="Spiritual Shop"
        title="Optional spiritual products, presented with care and restraint."
        description="Explore Rudraksha, gemstones, yantras, malas, idols, and practice companions as supportive spiritual products, never as fear-based remedies or guaranteed outcomes."
        highlights={[
          "Curated categories with calm product education and clear pricing",
          "Secure order-request path without rushed or noisy checkout language",
          "Gemstone and remedy products positioned as consultation-led support",
        ]}
        note="The catalog language stays transparent on purpose: spiritual products can support a practice, but they do not replace discernment, consultation, or practical judgment."
        primaryAction={{ href: "#featured-edit", label: "Explore Spiritual Shop" }}
        secondaryAction={{
          href: "/consultation",
          label: "Book Consultation for Guidance",
          tone: "secondary",
        }}
        supportTitle="Shop Trust Markers"
      />

      <Section
        category="services"
        eyebrow="Service Separation"
        title="Shop products remain separate from astrology service access."
        description="Reports, consultations, and NAVAGRAHA AI remain currently free under limited launch access. The shop is intentionally positioned as an optional spiritual add-on layer."
        tone="light"
      >
        <Card tone="light" className="service-card space-y-4">
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            Start with your chart and guidance journey first. Add spiritual products only when they align with your practice and personal intent.
          </p>
          <div className="flex flex-wrap gap-3">
            <TrackedLink
              href="/reports"
              eventName="shop_interaction"
              eventPayload={{ page: "/shop", feature: "shop-to-reports" }}
              className={buttonStyles({ size: "sm", tone: "secondary" })}
            >
              Get Free Report
            </TrackedLink>
            <TrackedLink
              href="/consultation"
              eventName="shop_interaction"
              eventPayload={{ page: "/shop", feature: "shop-to-consultation" }}
              className={buttonStyles({ size: "sm", tone: "tertiary" })}
            >
              Book Free Consultation
            </TrackedLink>
            <TrackedLink
              href="/ai"
              eventName="shop_interaction"
              eventPayload={{ page: "/shop", feature: "shop-to-ai" }}
              className={buttonStyles({ size: "sm", tone: "ghost" })}
            >
              Try NAVAGRAHA AI
            </TrackedLink>
          </div>
        </Card>
      </Section>

      <Section
        category="services"
        eyebrow="Categories"
        title="Browse by spiritual format, not by urgency."
        description="Each category has its own tone, material logic, and role within a disciplined practice. The merchandising stays calm so clients can move with clarity."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categorySummaries.map((category) => (
            <Link
              key={category.key}
              href={`#${category.anchorId}`}
              className="service-offering-card rounded-[var(--radius-2xl)] border px-5 py-5 transition [transition-duration:var(--motion-duration-base)] hover:border-[color:var(--color-border-strong)] hover:bg-[rgba(255,255,255,0.96)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-ivory)]"
            >
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                {category.label}
              </p>
              <p className="mt-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        category="services"
        eyebrow="Featured Edit"
        title="A first premium edit for careful spiritual commerce."
        description="The featured selection keeps the catalog focused, polished, and easy to understand."
        id="featured-edit"
        tone="muted"
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <EditorialPlaceholder
            eyebrow="Merchandising View"
            title="Thoughtful product framing matters as much as the catalog itself."
            description="The visual system keeps the shop premium and grounded: light editorial surfaces, refined material language, and a visible refusal to turn spiritual products into fear-based conversion devices."
            annotations={[
              "Clear category structure",
              "Elegant merchandising art with restrained warmth",
              "Order requests handled without pressure",
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
          category="services"
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

      <Section className="pt-0" tone="transparent">
        <GemstoneGuidanceCTA pagePath="/shop" placement="shop_pre_checkout" />
      </Section>

      <Section
        className="pt-0"
        tone="transparent"
        category="services"
        eyebrow="Ethical Product Guidance"
        title="Products are optional supports, not mandatory remedies."
        description="Gemstones, Rudraksha, yantras, and devotional items should be selected with discernment and proper chart review where needed."
      >
        <Card tone="light" className="service-offering-card grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Gemstone Safety",
              text: "Gemstones should be selected only after proper chart analysis and budget consideration.",
              href: "/consultation",
              label: "Book Guidance",
            },
            {
              title: "Checkout Clarity",
              text: "Order requests stay separate from astrology service access and do not create fake urgency.",
              href: "/terms",
              label: "Read Terms",
            },
            {
              title: "Support",
              text: "Use Contact for order questions, availability, and future shipping or fulfillment details.",
              href: "/contact",
              label: "Contact",
            },
          ].map((item) => (
            <div key={item.title} className="space-y-3">
              <Badge tone="trust">{item.title}</Badge>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
                {item.text}
              </p>
              <TrackedLink
                href={item.href}
                eventName="shop_interaction"
                eventPayload={{ page: "/shop", feature: `shop-guidance-${item.title}` }}
                className={buttonStyles({ size: "sm", tone: "ghost" })}
              >
                {item.label}
              </TrackedLink>
            </div>
          ))}
        </Card>
      </Section>

      <Section
        category="services"
        eyebrow="Order Requests"
        title="The cart lets visitors review selections and request a follow-up."
        description="Browsing, product detail, saved cart state, and order preparation are all kept explicit so the public commerce surface stays calm and honest."
        tone="muted"
      >
        <Card tone="accent" className="service-card space-y-5">
          <p className="text-[length:var(--font-size-body-md)] leading-[var(--line-height-copy)] text-[var(--color-ink-body)]">
            Orders are captured as structured requests so availability,
            confirmation, and payment can be handled with care through a
            deliberate order-confirmation process.
          </p>
          <div className="flex flex-wrap gap-3">
            <TrackedLink
              href="/shop/cart"
              eventName="shop_interaction"
              eventPayload={{ page: "/shop", feature: "shop-open-cart" }}
              className={buttonStyles({ size: "lg" })}
            >
              Open Cart
            </TrackedLink>
            <TrackedLink
              href="/consultation"
              eventName="shop_interaction"
              eventPayload={{ page: "/shop", feature: "shop-ask-guidance" }}
              className={buttonStyles({ tone: "secondary", size: "lg" })}
            >
              Book Consultation For Guidance
            </TrackedLink>
          </div>
          <SponsoredDisclosure />
        </Card>
      </Section>
    </>
  );
}
