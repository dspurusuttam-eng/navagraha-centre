"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  initialShopCheckoutActionState,
  prepareShopCheckout,
} from "@/modules/shop/actions";
import { useShopCart } from "@/modules/shop/components/shop-cart-provider";
import type { PreparedCheckout } from "@/modules/shop/types";

function getPreparedOrderRecoveryState(checkout: PreparedCheckout) {
  if (checkout.paymentStatus === "PAID") {
    return {
      title: "This order is already confirmed.",
      description:
        "The order is in a paid state. You can review the finalized record in your protected orders dashboard.",
      actions: [{ label: "Review Orders", href: "/dashboard/orders" }],
    };
  }

  if (checkout.paymentStatus === "FAILED") {
    return {
      title: "This request needs a fresh checkout attempt.",
      description:
        "Payment was not completed for this order. Return to the cart to submit a fresh request whenever you are ready.",
      actions: [
        { label: "Retry From Cart", href: "/shop/cart" },
        { label: "Review Orders", href: "/dashboard/orders" },
      ],
    };
  }

  if (checkout.paymentStatus === "REFUNDED") {
    return {
      title: "This request has moved to a refunded state.",
      description:
        "If you want help with a follow-up order, contact the centre with your order reference.",
      actions: [{ label: "Contact The Centre", href: "/contact" }],
    };
  }

  return {
    title: "Payment confirmation is still in progress.",
    description:
      "Your request is safely recorded. Please check your protected orders for the next status update.",
    actions: [{ label: "Review Orders", href: "/dashboard/orders" }],
  };
}

export function ShopCartPage() {
  const [state, formAction, isPending] = useActionState(
    prepareShopCheckout,
    initialShopCheckoutActionState
  );
  const {
    clearCart,
    isHydrated,
    itemCount,
    items,
    removeItem,
    subtotalLabel,
    updateQuantity,
  } = useShopCart();
  const [billingTimezone, setBillingTimezone] = useState("Asia/Kolkata");

  if (!isHydrated) {
    return (
      <Card className="space-y-4">
        <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
          Cart
        </p>
        <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-muted)]">
          Opening your saved cart...
        </p>
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card className="space-y-5">
        <Badge tone="neutral">Empty Cart</Badge>
        <div className="space-y-3">
          <p className="text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]">
            The cart is ready when you are.
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Browse the catalog, add spiritual support records thoughtfully, and
            return here when you want to prepare an order request.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/shop" className={buttonStyles({ size: "lg" })}>
            Browse The Shop
          </Link>
          <Link
            href="/consultation"
            className={buttonStyles({ tone: "secondary", size: "lg" })}
          >
            Book Consultation
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <div className="space-y-6">
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Cart Lines
              </p>
              <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-muted)]">
                Adjust quantities, remove records, or continue into the order
                request step.
              </p>
            </div>
            <Button type="button" tone="ghost" size="sm" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.slug}
                className="rounded-[var(--radius-2xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-5 py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Link
                      href={item.href}
                      className="text-[length:var(--font-size-body-lg)] text-[color:var(--color-foreground)] transition hover:text-[color:var(--color-accent)]"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                      {item.summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge tone="accent">{item.categoryLabel}</Badge>
                      <Badge tone="neutral">{item.priceLabel}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label
                      htmlFor={`cart-quantity-${item.slug}`}
                      className="sr-only"
                    >
                      Quantity for {item.name}
                    </label>
                    <Input
                      id={`cart-quantity-${item.slug}`}
                      type="number"
                      min={1}
                      max={item.inventoryCount ?? 99}
                      value={item.quantity}
                      onChange={(event) => {
                        const nextValue = Number(event.target.value);
                        const maxValue = item.inventoryCount ?? 99;
                        const safeValue = Number.isFinite(nextValue)
                          ? Math.max(1, Math.min(maxValue, nextValue))
                          : 1;

                        updateQuantity(item.slug, safeValue);
                      }}
                      className="w-20"
                    />
                    <Button
                      type="button"
                      tone="ghost"
                      size="sm"
                      onClick={() => removeItem(item.slug)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  <span>{item.ritualFocus}</span>
                  <span>{item.lineTotalLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Order Request
            </p>
            <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-muted)]">
              Share your details so the centre can review the order and confirm
              the next step without pushing you into a rushed checkout.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            <input
              type="hidden"
              name="cartPayload"
              value={JSON.stringify(
                items.map((item) => ({
                  slug: item.slug,
                  quantity: item.quantity,
                }))
              )}
            />
            <input
              type="hidden"
              name="billingTimezone"
              value={billingTimezone}
            />

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="shop-billing-name"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Billing Name
                </label>
                <Input
                  id="shop-billing-name"
                  name="billingName"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="shop-customer-email"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Email
                </label>
                <Input
                  id="shop-customer-email"
                  name="customerEmail"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="shop-customer-phone"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Phone
                </label>
                <Input
                  id="shop-customer-phone"
                  name="customerPhone"
                  autoComplete="tel"
                  placeholder="+91"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="shop-billing-timezone"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Timezone
                </label>
                <Input
                  id="shop-billing-timezone"
                  value={billingTimezone}
                  onChange={(event) => setBillingTimezone(event.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="shop-order-notes"
                  className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
                >
                  Notes
                </label>
                <Textarea
                  id="shop-order-notes"
                  name="notes"
                  placeholder="Optional notes for sourcing, gifting, or consultation-led follow-up."
                />
              </div>
            </div>

            {state.message ? (
              <div
                aria-live="polite"
                className="space-y-3 rounded-[var(--radius-xl)] border px-4 py-4 text-[length:var(--font-size-body-sm)]"
                style={{
                  borderColor:
                    state.status === "error"
                      ? "rgba(205,143,143,0.35)"
                      : "rgba(215,187,131,0.25)",
                  background:
                    state.status === "error"
                      ? "rgba(90,30,30,0.2)"
                      : "rgba(215,187,131,0.08)",
                }}
              >
                {state.errorTitle ? (
                  <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                    {state.errorTitle}
                  </p>
                ) : null}
                <p className="text-[color:var(--color-foreground)]">{state.message}</p>
                {state.status === "error" && state.recoveryActions.length ? (
                  <div className="flex flex-wrap gap-3">
                    {state.recoveryActions.map((action) => (
                      <Link
                        key={`${action.href}-${action.label}`}
                        href={action.href}
                        className={buttonStyles({ tone: "secondary", size: "sm" })}
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Saving Request..." : "Submit Order Request"}
            </Button>
          </form>
        </Card>
      </div>

      <div className="space-y-6">
        <Card tone="accent" className="space-y-5">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Cart Summary
          </p>
          <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            <p>
              Items:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {itemCount}
              </span>
            </p>
            <p>
              Subtotal:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {subtotalLabel}
              </span>
            </p>
            <p>
              Payment handling:{" "}
              <span className="text-[color:var(--color-foreground)]">
                Confirmed separately
              </span>
            </p>
          </div>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            The order request is recorded here first so confirmation,
            availability, and payment can be handled with clarity.
          </p>
        </Card>

        {state.checkout ? (
          <Card className="space-y-5">
            {(() => {
              const recoveryState = getPreparedOrderRecoveryState(state.checkout);

              return (
                <div className="space-y-3 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    Checkout Recovery
                  </p>
                  <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                    {recoveryState.title}
                  </p>
                  <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                    {recoveryState.description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {recoveryState.actions.map((action) => (
                      <Link
                        key={`${action.href}-${action.label}`}
                        href={action.href}
                        className={buttonStyles({ tone: "secondary", size: "sm" })}
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="space-y-2">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Prepared Order
              </p>
              <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                {state.checkout.orderNumber}
              </p>
            </div>

            <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              <p>
                Handling:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {state.checkout.paymentProviderLabel}
                </span>
              </p>
              <p>
                Status:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {state.checkout.paymentStatusLabel}
                </span>
              </p>
              <p>
                Total:{" "}
                <span className="text-[color:var(--color-foreground)]">
                  {state.checkout.totalLabel}
                </span>
              </p>
            </div>

            <div className="space-y-3">
              {state.checkout.items.map((item) => (
                <Link
                  key={`${item.slug}-${item.quantity}`}
                  href={item.href}
                  className="block rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-foreground)]"
                >
                  {item.titleSnapshot} x {item.quantity} - {item.lineTotalLabel}
                </Link>
              ))}
            </div>

            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {state.checkout.nextStep}
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
