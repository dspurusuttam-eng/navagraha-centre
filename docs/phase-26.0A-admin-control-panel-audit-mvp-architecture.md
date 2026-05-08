# Phase 26.0A Admin Control Panel Audit + MVP Architecture

## Existing Admin Routes Found
- `/admin`
- `/admin/users`
- `/admin/consultations`
- `/admin/orders`
- `/admin/orders/[orderNumber]`
- `/admin/astrologer-copilot`
- `/admin/bookings`
- `/admin/products`
- `/admin/remedies`
- `/admin/articles`
- `/admin/ai-settings`
- `/api/admin/astrologer-copilot/snapshots/[snapshotId]/events`

## Existing Admin Auth / Role Protection Status
- Admin access is enforced server-side through `requireAdminSession()` in `src/modules/auth/server.ts`.
- `requireAdminSession()` first requires a normal user session, then checks `adminRoleAssignment` rows for that user.
- Role gating is based on `founder`, `editor`, and `support` roles from `src/modules/admin/permissions.ts`.
- The admin shell and all current admin pages require the admin session guard before data is fetched.
- The `proxy.ts` file only handles locale routing. It is not the admin authorization layer.
- Normal users should not be able to access admin routes unless they have admin role assignments.

## Existing Admin APIs / Server Actions
- `src/modules/admin/actions.ts`
  - assign/remove admin roles
  - update consultations
  - update order fulfillment notes
  - run follow-up automation
  - update booking slots
  - update products
  - update remedies
  - update articles
  - create and activate AI prompt versions
- `src/app/api/admin/astrologer-copilot/snapshots/[snapshotId]/events/route.ts`
  - admin-only snapshot event tracking
  - auth + role checks + rate limiting + trusted origin checks

## Existing Admin Data Models Found
- `User`
- `ConsultationPackage`
- `ConsultationSlot`
- `Consultation`
- `Product`
- `Order`
- `OrderItem`
- `Article`
- `AdminRole`
- `AdminRoleAssignment`
- AI prompt template/version entities already used by `src/modules/admin/service.ts`

## Admin Surface Readiness by Area

### Blog / From the Desk / Articles
- Partially ready.
- `Article` has admin review/publication controls and the `/admin/articles` page exists.
- Missing for a launch-ready admin MVP:
  - article create/edit UI
  - richer article content editor
  - admin management for `From the Desk` and daily Rashifal entries as first-class content records
  - explicit SEO field editing workflow

### Daily Rashifal
- Not launch-ready as a dedicated admin surface.
- Daily Rashifal is currently driven by the content catalog in `src/modules/content/catalog.ts` and the `ContentEntry.dailyRashifal` structure.
- There is no dedicated admin CRUD flow for daily Rashifal entries yet.
- This should be planned as a controlled content-management surface in 26.0B or a follow-up content phase.

### Users
- Ready for read/role-assignment review.
- `/admin/users` exists and shows:
  - user identity
  - admin assignments
  - chart/consultation/order counts
  - email verification state
- Missing for MVP:
  - user detail page
  - safer admin notes / account status panel
  - structured moderation / support actions

### Saved Kundli / Astrology Data
- No dedicated admin Saved Kundli overview page exists yet.
- The admin dashboard currently surfaces users and consultations, but not a first-class Kundli admin screen.
- MVP will need a safe read-only overview first, then optional moderation tooling.

### Premium Reports
- No dedicated admin premium-report overview page exists yet.
- Admin can infer commerce state through orders, but there is no launch-ready report history/control surface.
- This is a gap if launch operations need report verification or unlock troubleshooting.

### Consultations / Bookings
- Strongest ready area.
- `/admin/consultations` and `/admin/bookings` exist.
- Current capabilities:
  - view consultation requests
  - update consultation status
  - write internal notes
  - view slot inventory and booking state
  - run follow-up automation
- Important privacy boundary:
  - internal notes stay admin-only
  - user-facing booking data should stay separate

### Orders / Payments
- Ready for internal read/update notes.
- `/admin/orders` and `/admin/orders/[orderNumber]` exist.
- Current capabilities:
  - view order status
  - view payment status/provider snapshots
  - view trusted amount snapshots
  - maintain internal fulfillment notes
- Missing for MVP:
  - broader payment reconciliation dashboard
  - clearer summary of failed/cancelled payments
  - dedicated premium report unlock audit if needed

### Shop / Products
- Partially ready.
- `/admin/products` exists and supports status + featured management.
- Missing for launch-ready MVP:
  - product create/edit UX
  - stock movement workflows
  - richer merchandising controls
  - dedicated orders-to-products operations view

### Settings / AI Governance
- `/admin/ai-settings` exists and supports prompt version creation/activation.
- Good foundation for controlled prompt governance.
- Missing for launch-ready MVP:
  - broader site settings panel
  - audit-focused settings overview

## Security / Privacy Risks Found
- Admin access depends on server-side session + role assignment, which is correct. It should remain the primary authorization layer.
- The proxy/middleware layer does not perform admin auth, which is good. Admin protection must remain in server components/actions/routes.
- Internal notes exist on consultation/order admin pages and must never leak to public or member surfaces.
- The daily Rashifal content system is catalog-driven; if admin mutability is added later, it must not expose draft/private records publicly.
- There is no dedicated admin premium-report review surface yet; adding one later must avoid exposing premium content bodies unnecessarily.
- Destructive admin actions should require confirmation UI before mutation.

## Recommended Admin MVP Route Structure
- `/admin` - overview
- `/admin/users` - users and role assignments
- `/admin/users/[id]` - safe user detail
- `/admin/consultations` - consultation queue
- `/admin/consultations/[consultationId]` - consultation detail
- `/admin/bookings` - slot inventory
- `/admin/orders` - payments/orders
- `/admin/orders/[orderNumber]` - order detail
- `/admin/articles` - blog/article governance
- `/admin/articles/[id]` - article detail/edit
- `/admin/content` - content dashboard
- `/admin/content/daily-rashifal` - daily Rashifal governance
- `/admin/products` - shop products
- `/admin/reports` - premium report overview
- `/admin/ai-settings` - AI prompt governance
- `/admin/settings` - site/admin settings

## Recommended Admin MVP Component Structure
- `src/app/(admin)/layout.tsx`
- `src/app/(admin)/admin/page.tsx`
- `src/app/(admin)/users/page.tsx`
- `src/app/(admin)/users/[id]/page.tsx`
- `src/app/(admin)/consultations/page.tsx`
- `src/app/(admin)/consultations/[consultationId]/page.tsx`
- `src/app/(admin)/bookings/page.tsx`
- `src/app/(admin)/orders/page.tsx`
- `src/app/(admin)/orders/[orderNumber]/page.tsx`
- `src/app/(admin)/articles/page.tsx`
- `src/app/(admin)/articles/[id]/page.tsx`
- `src/app/(admin)/content/page.tsx`
- `src/app/(admin)/content/daily-rashifal/page.tsx`
- `src/app/(admin)/products/page.tsx`
- `src/app/(admin)/reports/page.tsx`
- `src/app/(admin)/ai-settings/page.tsx`
- `src/app/(admin)/settings/page.tsx`
- shared components in `src/modules/admin/components/`
- shared data/mutations in `src/modules/admin/service.ts` and `src/modules/admin/actions.ts`

## Launch-Critical vs Post-Launch Admin Features

### Launch-Critical
- Admin overview dashboard
- Users and role assignment
- Consultations and booking management
- Orders and payment visibility
- Articles / From the Desk review and publication workflow
- Daily Rashifal governance
- Products / shop control if the shop is active
- Basic AI prompt governance

### Post-Launch / Follow-Up
- Deep analytics / health dashboard
- Bulk moderation tools
- More advanced user detail pages
- Premium report operational dashboard
- Rich content editor experience
- Content scheduling and draft workflow automation
- Dedicated admin search / filters / exports

## Exact Files To Modify In 26.0B
- `src/app/(admin)/layout.tsx`
- `src/app/(admin)/admin/page.tsx`
- `src/app/(admin)/users/page.tsx`
- `src/app/(admin)/consultations/page.tsx`
- `src/app/(admin)/bookings/page.tsx`
- `src/app/(admin)/orders/page.tsx` or the existing `/admin/orders` route file under `src/app/(admin)/admin/orders/`
- `src/app/(admin)/articles/page.tsx`
- `src/app/(admin)/products/page.tsx`
- `src/app/(admin)/remedies/page.tsx`
- `src/app/(admin)/ai-settings/page.tsx`
- `src/modules/admin/service.ts`
- `src/modules/admin/actions.ts`
- `src/modules/admin/permissions.ts`
- `src/modules/admin/components/admin-shell.tsx`
- `src/modules/admin/components/admin-page-intro.tsx`
- `src/modules/admin/components/admin-status-badge.tsx`
- `src/modules/admin/metadata.ts`
- `src/modules/content/server.ts`
- `src/modules/content/catalog.ts`
- `src/modules/content/types.ts`
- `src/modules/content/from-desk-copy.ts`
- `src/modules/content/hubs.ts`
- `src/modules/content/seo.ts`
- `src/modules/content/insights-authority.ts`
- `src/modules/auth/server.ts` only if admin session shape or authorization helpers need extension

## Validation
- Typecheck, lint, and build should continue to pass before 26.0B implementation starts.
- This audit phase did not change feature code.

## Final Verdict
- The admin system is authenticated and role-protected already, but it is only partially launch-ready from a product-operations perspective.
- The MVP architecture is clear now: the control panel exists, consultations/orders/products/articles/AI governance are in place, but saved Kundli, premium reports, and daily Rashifal need dedicated admin surfaces if they are required for launch operations.

## Next Phase
- Phase 26.0B Admin Control Panel MVP Implementation
