import { buildPageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/site/page-hero";
import { Section } from "@/components/ui/section";
import { ShopCartPage } from "@/modules/shop/components/shop-cart-page";

export const metadata = buildPageMetadata({
  title: "Cart",
  description:
    "Review the NAVAGRAHA CENTRE cart and submit an order request for spiritual support products.",
  path: "/shop/cart",
  keywords: [
    "spiritual product cart",
    "order request",
    "premium remedy products",
  ],
});

export default function ShopCartRoutePage() {
  return (
    <>
      <PageHero
        eyebrow="Cart"
        title="Review your selections and send a clear order request."
        description="This step keeps the commerce journey explicit. You can review selected products, preserve a premium presentation, and submit a manual order request without forcing a rushed payment flow."
        highlights={[
          "Saved cart state across the public shop",
          "Manual order requests created without hard-selling the next step",
          "Clear boundaries around product review, confirmation, and payment",
        ]}
        note="Products remain optional spiritual support records. The cart does not make hard claims about remedies, outcomes, or urgency."
        primaryAction={{ href: "/shop", label: "Back To Shop" }}
        secondaryAction={{
          href: "/consultation",
          label: "Need Guidance First?",
        }}
        supportTitle="Order Review"
      />

      <Section
        eyebrow="Order Request"
        title="Review the cart and request a manual follow-up."
        description="The order is recorded clearly here so confirmation and payment can be handled with care."
      >
        <ShopCartPage />
      </Section>
    </>
  );
}
