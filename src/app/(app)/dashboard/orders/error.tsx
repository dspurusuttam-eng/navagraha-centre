"use client";

import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";

export default function DashboardOrdersError({
  reset,
}: Readonly<{
  reset: () => void;
}>) {
  return (
    <Section
      eyebrow="Order Recovery"
      title="The order surface needs a quick retry."
      description="Your protected order records remain intact. You can retry now or return to a stable route."
      tone="transparent"
      className="pt-0"
    >
      <Card className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className={buttonStyles({ size: "sm" })}
        >
          Retry Orders
        </button>
        <Link
          href="/dashboard/orders"
          className={buttonStyles({ tone: "secondary", size: "sm" })}
        >
          Back To Order List
        </Link>
        <Link
          href="/shop/cart"
          className={buttonStyles({ tone: "ghost", size: "sm" })}
        >
          Open Cart
        </Link>
      </Card>
    </Section>
  );
}
