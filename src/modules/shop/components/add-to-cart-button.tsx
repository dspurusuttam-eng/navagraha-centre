"use client";

import { Button, type ButtonSize } from "@/components/ui/button";
import { useShopCart } from "@/modules/shop/components/shop-cart-provider";

type AddToCartButtonProps = {
  productSlug: string;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export function AddToCartButton({
  productSlug,
  size = "md",
  fullWidth = false,
}: Readonly<AddToCartButtonProps>) {
  const { addItem } = useShopCart();

  return (
    <Button
      type="button"
      size={size}
      fullWidth={fullWidth}
      onClick={() => addItem(productSlug, 1)}
    >
      Add To Cart
    </Button>
  );
}
