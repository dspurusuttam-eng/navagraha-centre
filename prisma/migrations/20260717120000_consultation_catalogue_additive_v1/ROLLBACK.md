# Rollback / recovery — `20260717120000_consultation_catalogue_additive_v1`

Additive Consultation-catalogue migration (Claude C10A). It creates three brand-new tables
(`consultation_tier`, `consultation_utility`, `consultation_utility_mode`) and three new
enums (`ConsultationPriceType`, `ConsultationAvailabilityStatus`,
`ConsultationPublicationState`). **No forward data loss is possible**: it performs no
UPDATE/DELETE/INSERT, adds no column to any existing table, and alters no existing type. The
only two foreign keys reference the new catalogue tables themselves, never an existing table.

## Ordering
Timestamped `20260717120000`, i.e. **after** `20260716130000_admin_console_additive_v1`.
Prisma applies migrations in lexicographic folder order, so every prior migration
(Subscription, Admin console additive) always runs first. Do not renumber it below that
timestamp.

## Before applying
1. Take a database snapshot/backup (standard practice, even though this migration is additive).
2. Confirm the server is **PostgreSQL** (target 12+; verified schema style against 17.10).
3. Apply with `prisma migrate deploy` (never `migrate dev`, which may reset, and never `db push`).

> Note: this migration is **not executed in the C10A phase**. Seeding and activation are
> deliberately deferred to later cards.

## Recovery if the migration FAILS mid-apply
Prisma runs the migration in a transaction, so a failure rolls the whole statement set back
and the migration is recorded as failed in `_prisma_migrations`. To recover:

```bash
npx prisma migrate status

# After fixing the cause, mark the failed attempt rolled back, then re-deploy
npx prisma migrate resolve --rolled-back 20260717120000_consultation_catalogue_additive_v1
npx prisma migrate deploy
```

## Manual reversal (destructive — only for a deliberate rollback)
This **drops the entire Consultation catalogue** stored in the three new tables. Restore from
snapshot instead if that data matters. It touches no other table.

```sql
BEGIN;

-- Drop in FK-dependency order (mode -> utility -> tier). DROP TABLE removes the table's own
-- indexes and inbound/outbound FK constraints automatically.
DROP TABLE IF EXISTS "consultation_utility_mode";
DROP TABLE IF EXISTS "consultation_utility";
DROP TABLE IF EXISTS "consultation_tier";

DROP TYPE IF EXISTS "ConsultationPublicationState";
DROP TYPE IF EXISTS "ConsultationAvailabilityStatus";
DROP TYPE IF EXISTS "ConsultationPriceType";

COMMIT;
```

Then deregister the migration:

```bash
npx prisma migrate resolve --rolled-back 20260717120000_consultation_catalogue_additive_v1
```

## Safest rollback overall
Restore the pre-migration snapshot. The manual reversal above exists for environments where
that is not an option. A rollback of this migration must never touch any table outside the
three catalogue tables and three enums listed above.
