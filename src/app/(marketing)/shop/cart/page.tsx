import { buildPageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/site/page-hero";
import { Section } from "@/components/ui/section";
import { ShopCartPage } from "@/modules/shop/components/shop-cart-page";

export const metadata = buildPageMetadata({
  title: "Cart",
  description:
    "Review the NAVAGRAHA CENTRE cart and prepare a draft checkout for spiritual support products.",
  path: "/shop/cart",
  keywords: [
    "spiritual product cart",
    "draft checkout",
    "premium remedy products",
  ],
});

export default function ShopCartRoutePage() {
  return (
    <>
      <PageHero
        eyebrow="Cart"
        title="A calm cart flow, prepared for future payment integration."
        description="This step keeps the commerce journey explicit. You can review the selected products, preserve a premium presentation, and prepare the draft order without forcing a payment gateway into this phase."
        highlights={[
          "Saved cart state across the public shop",
          "Draft checkout records created without live payment capture",
          "Clear boundaries around what the current commerce phase does and does not do",
        ]}
        note="Products remain optional spiritual support records. The cart and checkout abstraction do not make hard claims about remedies, outcomes, or urgency."
        primaryAction={{ href: "/shop", label: "Back To Shop" }}
        secondaryAction={{
          href: "/consultation",
          label: "Need Guidance First?",
        }}
        supportTitle="Current Flow"
      />

      <Section
        eyebrow="Checkout Preparation"
        title="Review the cart and prepare the next commerce layer."
        description="The order foundation and payment-ready records are created here, while live payment collection stays intentionally outside this phase."
      >
        <ShopCartPage />
      </Section>
    </>
  );
}
