export type ShopCheckoutErrorCode =
  | "CHECKOUT_INIT_FAILED"
  | "CHECKOUT_STATE_INVALID_OR_EXPIRED"
  | "INSUFFICIENT_STOCK"
  | "ITEM_UNAVAILABLE"
  | "RATE_LIMITED";

export type ShopRecoveryAction = {
  label: string;
  href: string;
};

export type ShopCheckoutErrorState = {
  code: ShopCheckoutErrorCode;
  title: string;
  message: string;
  recoveryActions: ShopRecoveryAction[];
};

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error && typeof error.message === "string") {
    return error.message.trim();
  }

  return "";
}

export function resolveShopCheckoutErrorState(
  error: unknown
): ShopCheckoutErrorState {
  const sourceMessage = normalizeErrorMessage(error);
  const normalized = sourceMessage.toLowerCase();

  if (
    normalized.includes("too many checkout attempts") ||
    normalized.includes("please wait")
  ) {
    return {
      code: "RATE_LIMITED",
      title: "Please pause before trying again.",
      message:
        "We received several checkout attempts in a short window. Please wait a moment, then submit the order request again.",
      recoveryActions: [
        { label: "Review Cart", href: "/shop/cart" },
        { label: "Contact The Centre", href: "/contact" },
      ],
    };
  }

  if (
    normalized.includes("out of stock") ||
    (normalized.includes("only") && normalized.includes("units"))
  ) {
    return {
      code: "INSUFFICIENT_STOCK",
      title: "This item quantity is no longer available.",
      message:
        "Please adjust the quantity in your cart, then submit the order request again.",
      recoveryActions: [
        { label: "Return To Cart", href: "/shop/cart" },
        { label: "Browse Shop", href: "/shop" },
      ],
    };
  }

  if (normalized.includes("no longer available")) {
    return {
      code: "ITEM_UNAVAILABLE",
      title: "One selected item is no longer available.",
      message:
        "Please refresh your cart selection and continue with available items.",
      recoveryActions: [
        { label: "Return To Cart", href: "/shop/cart" },
        { label: "Browse Shop", href: "/shop" },
      ],
    };
  }

  if (
    normalized.includes("add at least one product") ||
    normalized.includes("invalid checkout payload") ||
    normalized.includes("invalid checkout")
  ) {
    return {
      code: "CHECKOUT_STATE_INVALID_OR_EXPIRED",
      title: "Your checkout state needs a refresh.",
      message:
        "The cart snapshot is no longer valid. Please return to the cart and submit the request again.",
      recoveryActions: [
        { label: "Return To Cart", href: "/shop/cart" },
        { label: "Browse Shop", href: "/shop" },
      ],
    };
  }

  return {
    code: "CHECKOUT_INIT_FAILED",
    title: "The order request could not be prepared.",
    message:
      "Your cart is still saved. Please retry now, or return to the cart and continue when ready.",
    recoveryActions: [
      { label: "Return To Cart", href: "/shop/cart" },
      { label: "Review Orders", href: "/dashboard/orders" },
    ],
  };
}
