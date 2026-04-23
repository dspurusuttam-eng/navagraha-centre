# NAVAGRAHA CENTRE Phase 10 Launch + Scale Checklist

This checklist is focused on final optimization, public launch confidence, and post-launch scale operations.

## 1) Route Health and UX Safety

Verify these routes load without broken states:

- `/`
- `/ai`
- `/rashifal`
- `/rashifal/[sign]` (sample at least 3 signs)
- `/insights`
- `/insights/[slug]` (sample at least 2 articles)
- `/reports`
- `/consultation`
- `/shop`
- `/dashboard`
- `/dashboard/ask-my-chart`
- `/dashboard/report`
- `/sign-up`
- `/sign-in`
- `/forgot-password`
- `/privacy`
- `/terms`
- `/disclaimer`
- `/refund-cancellation`

## 2) SEO and Metadata Validation

Confirm for major public routes:

- title and meta description are present
- canonical is set
- Open Graph fields are present
- heading structure starts with one H1
- noindex is enforced on private/auth routes (`/dashboard*`, `/settings`, `/sign-*`, `/forgot-password`, `/reset-password`)

Also confirm:

- `/sitemap.xml` includes public launch routes (including legal pages)
- `/robots.txt` disallows protected routes and allows public pages

## 3) Analytics and Funnel Events

Confirm `/api/analytics/event` accepts and records:

- `page_view`
- `page_visit`
- `cta_click`
- `generate_kundli_click`
- `signup_completed`
- `kundli_completed`
- `ai_opened`
- `ai_question_submitted`
- `rashifal_page_view`
- `report_preview_opened`
- `report_view`
- `consultation_started`
- `consultation_click`
- `shop_interaction`
- `payment_success`

Verify summary endpoint:

- `/api/analytics/summary` includes funnel + conversion groups

## 4) AdSense-Readiness Structure (No Live Ads)

Confirm ad-safe placeholders render in:

- insights listing pages
- insight detail pages
- rashifal listing page
- rashifal sign pages

Confirm:

- no live ad scripts are injected
- layout remains stable with placeholders
- `public/ads.txt` is reachable at `/ads.txt`

## 5) Legal and Trust Completeness

Confirm public access and internal linking for:

- Privacy Policy (`/privacy`)
- Terms (`/terms`)
- Disclaimer (`/disclaimer`)
- Refund and Cancellation (`/refund-cancellation`)
- Contact (`/contact`)

## 6) Performance and Rendering Checks

Validate:

- route-level skeleton loaders display on slow transitions
- no text-only loader remnants
- header renders immediately without shell flicker
- no critical layout shift in hero/primary sections
- mobile pages avoid overflow and clipping

## 7) Full Funnel Smoke Sequence

1. Open homepage and click primary CTA -> `/kundli` path.
2. Complete sign-up -> verify `signup_completed`.
3. Complete onboarding chart generation -> verify `kundli_completed`.
4. Open Ask My Chart and submit question -> verify `ai_opened` and `ai_question_submitted`.
5. Open rashifal routes -> verify `rashifal_page_view`.
6. Open reports route and report preview CTA -> verify `report_view` and `report_preview_opened`.
7. Open consultation and booking-start CTA -> verify `consultation_click` and `consultation_started`.
8. Open shop and interact with product/card/cart links -> verify `shop_interaction`.

## 8) Scale Readiness Operations

Daily:

- publish/update Rashifal sign content
- monitor analytics conversion counts
- review assistant usage and error logs

Weekly:

- publish at least one insight article per priority category
- review report and consultation conversion drop-off
- validate sitemap freshness

Pre-pricing activation:

- replace free-access labels and unlock premium copy by plan state
- confirm payment webhooks and upgrade analytics continuity
- update policy copy if monetization terms change

