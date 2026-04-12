# Commerce Setup (Phase 10.12)

This guide covers the checkout, webhook, and order-finalization setup for NAVAGRAHA CENTRE.

## 1) Environment Variables

Set these in both places:
- local development: `.env` or `.env.local`
- production: Vercel Project Settings -> Environment Variables (Production)

### Required

| Variable | Why it is required | Local | Vercel Production |
| --- | --- | --- | --- |
| `DATABASE_URL` | Persists checkout orders, payment records, webhook transitions, and inventory reservation metadata | Required | Required |
| `SHOP_DRAFT_WEBHOOK_SECRET` | Verifies webhook signatures for the current `draft-order` provider flow | Required for webhook simulation/processing | Required |

### Optional (recommended)

| Variable | Default behavior if missing | Notes |
| --- | --- | --- |
| `SHOP_CHECKOUT_PROVIDER` | Falls back to `draft-order` | Valid keys: `draft-order`, `stripe` (only `draft-order` is currently registered in this repo) |
| `SHOP_WEBHOOK_SECRET` | Used as fallback if `SHOP_DRAFT_WEBHOOK_SECRET` is empty | Keep if you want one shared webhook secret key pattern |
| `BETTER_AUTH_URL` | Falls back to resolved site URL | Needed for stable protected member/admin order surfaces in production |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Uses internal defaults | Include both apex + www in production |
| `NEXT_PUBLIC_SITE_URL` | Falls back based on runtime host | Used for canonical URL behavior across the app |

Note: There is no `PAYMENT_PROVIDER_KEY` variable in this codebase. The active provider key is `SHOP_CHECKOUT_PROVIDER`.

## 2) Webhook Setup Guide

- Endpoint: `/api/shop/webhooks/payment`
- Method: `POST`
- Provider selector:
  - default: `draft-order`
  - optional override by query/header:
    - `?provider=draft-order`
    - `x-shop-provider: draft-order`
- Signature header:
  - `x-shop-signature` (preferred)
  - `stripe-signature` (accepted alias by current route)

High-level verification flow:
1. API route reads raw body.
2. Draft provider computes HMAC SHA256 using `SHOP_DRAFT_WEBHOOK_SECRET` (or `SHOP_WEBHOOK_SECRET` fallback).
3. If signature mismatch, endpoint returns `401` with `invalid-signature`.
4. If verified, event is normalized and applied to trusted order/payment records.

## 3) Local Testing Flow

1. Install and prepare:

```bash
npm install
npm run build
npm run start
```

2. Ensure env values are present locally:
- `DATABASE_URL`
- `SHOP_DRAFT_WEBHOOK_SECRET`

3. Create a checkout session/order from backend API:

```powershell
$payload = @{
  billingName = "QA Member"
  customerEmail = "qa-member@navagraha.local"
  billingTimezone = "Asia/Kolkata"
  idempotencyKey = "local-checkout-001"
  items = @(
    @{ slug = "sandalwood-japa-mala"; quantity = 1 }
  )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:3000/api/shop/checkout/init" `
  -ContentType "application/json" `
  -Body $payload
```

Expected:
- HTTP `201`
- response includes `checkout.orderNumber`

## 4) Test Payment Flow (Simulation)

Use the returned `orderNumber` from checkout init.

### 4.1 Simulate success (`payment.paid`)

```powershell
$orderNumber = "NC-20260412-ABC12345"
$body = (@{
  id = "evt_local_paid_001"
  type = "payment.paid"
  createdAtUtc = (Get-Date).ToUniversalTime().ToString("o")
  data = @{
    orderNumber = $orderNumber
    paymentReference = "manual-local-paid-001"
    amount = 4200
    currencyCode = "INR"
  }
} | ConvertTo-Json -Depth 5 -Compress)

$secret = $env:SHOP_DRAFT_WEBHOOK_SECRET
$signature = node -e "const c=require('crypto');const body=process.argv[1];const secret=process.argv[2];process.stdout.write(c.createHmac('sha256',secret).update(body,'utf8').digest('hex'))" $body $secret

Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:3000/api/shop/webhooks/payment" `
  -Headers @{ "x-shop-signature" = $signature } `
  -ContentType "application/json" `
  -Body $body
```

Expected:
- webhook returns `processed`
- order/payment transition to paid state
- protected order detail shows paid/finalized state

### 4.2 Simulate failure (`payment.failed`)

Reuse the same pattern, but set:
- `type = "payment.failed"`
- new event id and payment reference

Expected:
- webhook returns `processed`
- order/payment move to failed/cancelled flow
- member order detail shows clear failure state and next step

### 4.3 Verify invalid signature rejection

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:3000/api/shop/webhooks/payment" `
  -Headers @{ "x-shop-signature" = "invalid-signature" } `
  -ContentType "application/json" `
  -Body '{"id":"evt_bad","type":"payment.paid","data":{"orderNumber":"NC-INVALID"}}'
```

Expected:
- HTTP `401`
- `outcome: "invalid-signature"`

## 5) Production Smoke Checklist

Run these after deploy:

1. `GET /api/health` returns `200`.
2. Checkout init endpoint responds correctly:
   - valid payload -> `201`
   - invalid payload -> safe `400` with structured error body.
3. Webhook endpoint rejects invalid signatures (`401`).
4. Verified webhook success/failure transitions are visible in:
   - protected member order list/detail
   - admin order review surfaces.
5. No server exceptions in Vercel runtime logs during:
   - checkout init
   - webhook processing
   - order detail rendering.

## 6) Rollback Strategy

If production behavior degrades:

1. **Rollback deployment quickly**
   - Vercel Dashboard -> Deployments -> promote previous healthy production deployment.
   - or CLI: `vercel rollback <deployment-url>`

2. **Contain checkout traffic (temporary)**
   - Apply a Vercel Firewall/edge rule to block or rate-limit `POST /api/shop/checkout/init`.
   - Keep read-only order surfaces online for member support visibility.

3. **Contain webhook ingestion (temporary)**
   - Rotate `SHOP_DRAFT_WEBHOOK_SECRET` and redeploy.
   - Only webhooks signed with the new secret will be accepted.

4. **Stabilize and redeploy**
   - validate with local simulation first
   - redeploy once smoke checklist passes.

## 7) End-to-End Verification (Developer Quick Path)

1. `npm run build`
2. `npm run start`
3. create checkout (`/api/shop/checkout/init`)
4. send signed webhook (`/api/shop/webhooks/payment`)
5. verify order status in:
   - `/dashboard/orders`
   - `/dashboard/orders/[orderNumber]`
   - admin order route(s)
