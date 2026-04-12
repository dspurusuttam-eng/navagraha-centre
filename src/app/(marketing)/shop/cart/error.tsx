"use client";

import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";

export default function ShopCartError({
  reset,
}: Readonly<{
  reset: () => void;
}>) {
  return (
    <Section
      eyebrow="Cart Recovery"
      title="The cart surface needs a quick refresh."
      description="Your selections are still safe in this browser. Retry now, or reopen the shop and continue."
      tone="transparent"
      className="pt-0"
    >
      <Card className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className={buttonStyles({ size: "sm" })}
        >
          Retry Cart
        </button>
        <Link
          href="/shop/cart"
          className={buttonStyles({ tone: "secondary", size: "sm" })}
        >
          Reload Cart
        </Link>
        <Link href="/shop" className={buttonStyles({ tone: "ghost", size: "sm" })}>
          Back To Shop
        </Link>
      </Card>
    </Section>
  );
}
