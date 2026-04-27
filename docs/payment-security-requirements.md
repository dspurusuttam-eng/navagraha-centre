# Payment Security Requirements

## Current Implementation Status

- Checkout initialization is server-driven.
- Item totals and currency are derived server-side in shop provider logic.
- Webhook verification exists for draft and Razorpay providers.
- Webhook processing includes duplicate-event handling and idempotent markers.

## Required Secrets

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `SHOP_DRAFT_WEBHOOK_SECRET` (for draft provider)
- `SHOP_WEBHOOK_SECRET` (fallback/shared webhook secret)

## Security Requirements

1. Never trust client-provided amount or currency.
2. Always verify provider webhook signature before state transition.
3. Do not mark order/report as paid until verified webhook or equivalent trusted callback confirms payment.
4. Store minimal payment metadata only.
5. Mask payment references in logs when possible; never log secret keys/signatures.
6. Reject unsupported provider keys and malformed webhook payloads safely.
7. Keep checkout and webhook routes rate protected where appropriate.

## Operational Checklist

- Ensure production secrets are configured in Vercel.
- Ensure webhook endpoint URL uses HTTPS only.
- Confirm signature verification path in staging before production cutover.
- Confirm duplicate webhook events do not double-fulfill orders.
- Confirm payment failed/refunded transitions are handled safely.
