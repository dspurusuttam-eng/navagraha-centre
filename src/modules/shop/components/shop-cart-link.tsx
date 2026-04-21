"use client";

import Link from "next/link";
import { useShopCart } from "@/modules/shop/components/shop-cart-provider";

export function ShopCartLink() {
  const { itemCount } = useShopCart();

  return (
    <Link
      href="/shop/cart"
      className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.86)] px-4 py-2 text-[0.76rem] uppercase tracking-[var(--tracking-label)] text-[var(--color-ink-body)] shadow-[var(--shadow-sm)] transition [transition-duration:var(--motion-duration-base)] hover:border-[color:var(--color-border-strong)] hover:bg-[rgba(255,255,255,0.96)]"
    >
      <span>Cart</span>
      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[color:var(--color-accent-soft)] px-2 py-1 text-[0.68rem] text-[color:var(--color-accent)]">
        {itemCount}
      </span>
    </Link>
  );
}
