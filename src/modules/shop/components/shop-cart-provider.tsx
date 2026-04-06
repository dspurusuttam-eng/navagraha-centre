"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  buildShopCartItems,
  formatShopPrice,
  getCartSubtotal,
} from "@/modules/shop";
import type { ShopCartItem, ShopCartLineInput } from "@/modules/shop";

const storageKey = "navagraha-centre.shop.cart";

type ShopCartContextValue = {
  isHydrated: boolean;
  items: ShopCartItem[];
  itemCount: number;
  subtotalLabel: string;
  addItem: (slug: string, quantity?: number) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
};

const ShopCartContext = createContext<ShopCartContextValue | null>(null);

function sanitizeCartLines(items: ShopCartLineInput[]) {
  const quantityBySlug = new Map<string, number>();

  for (const item of items) {
    const quantity = Number(item.quantity);

    if (!item.slug || !Number.isFinite(quantity) || quantity <= 0) {
      continue;
    }

    quantityBySlug.set(
      item.slug,
      (quantityBySlug.get(item.slug) ?? 0) + quantity
    );
  }

  return Array.from(quantityBySlug.entries()).map(([slug, quantity]) => ({
    slug,
    quantity,
  }));
}

export function ShopCartProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [lines, setLines] = useState<ShopCartLineInput[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(storageKey);

      if (!storedValue) {
        setIsHydrated(true);
        return;
      }

      const parsed = JSON.parse(storedValue) as ShopCartLineInput[];
      setLines(sanitizeCartLines(parsed));
    } catch {
      setLines([]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(lines));
  }, [isHydrated, lines]);

  let items: ShopCartItem[] = [];
  let subtotalLabel = formatShopPrice(0);

  try {
    items = buildShopCartItems(lines);
    subtotalLabel = formatShopPrice(getCartSubtotal(lines));
  } catch {
    items = [];
    subtotalLabel = formatShopPrice(0);
  }

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const value: ShopCartContextValue = {
    isHydrated,
    items,
    itemCount,
    subtotalLabel,
    addItem(slug, quantity = 1) {
      setLines((current) => {
        const quantityBySlug = new Map(
          current.map((entry) => [entry.slug, entry.quantity])
        );
        quantityBySlug.set(slug, (quantityBySlug.get(slug) ?? 0) + quantity);

        return sanitizeCartLines(
          Array.from(quantityBySlug.entries()).map(
            ([itemSlug, itemQuantity]) => ({
              slug: itemSlug,
              quantity: itemQuantity,
            })
          )
        );
      });
    },
    updateQuantity(slug, quantity) {
      setLines((current) =>
        sanitizeCartLines(
          current.map((entry) =>
            entry.slug === slug ? { ...entry, quantity } : entry
          )
        )
      );
    },
    removeItem(slug) {
      setLines((current) => current.filter((entry) => entry.slug !== slug));
    },
    clearCart() {
      setLines([]);
    },
  };

  return (
    <ShopCartContext.Provider value={value}>
      {children}
    </ShopCartContext.Provider>
  );
}

export function useShopCart() {
  const context = useContext(ShopCartContext);

  if (!context) {
    throw new Error("useShopCart must be used within ShopCartProvider.");
  }

  return context;
}
