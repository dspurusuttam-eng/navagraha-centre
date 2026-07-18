# Rollback / recovery — `20260716130000_admin_console_additive_v1`

Additive Admin Console migration, regenerated in C7B on top of the rebased
post-Subscription main. **No forward data loss is possible**: it only adds an enum value,
adds nullable/defaulted columns to `article`, and creates three standalone tables. It
performs no UPDATE/DELETE/INSERT and touches no table outside the Admin surface.

## Ordering
This migration is timestamped `20260716130000`, i.e. **after**
`20260716120000_phase12b_subscription_backfill`. Prisma applies migrations in lexicographic
folder order, so the Codex Subscription migration always runs first. Do not renumber this
migration below that timestamp.

## Before applying
1. Take a database snapshot/backup (standard practice, even though this migration is additive).
2. Confirm the server is **PostgreSQL 12+** — `ALTER TYPE ... ADD VALUE` is only
   transaction-safe from 12 onward. Verified against PostgreSQL 17.10.
3. Apply with `prisma migrate deploy` (never `migrate dev`, which may reset, and never `db push`).

## Recovery if the migration FAILS mid-apply
Prisma runs the migration in a transaction, so a failure rolls the whole statement set back
and the migration is recorded as failed in `_prisma_migrations`. To recover:

```bash
npx prisma migrate status

# After fixing the cause, mark the failed attempt rolled back, then re-deploy
npx prisma migrate resolve --rolled-back 20260716130000_admin_console_additive_v1
npx prisma migrate deploy
```

If the transaction did partially persist (only possible on PostgreSQL < 12, where
`ALTER TYPE ... ADD VALUE` cannot be transactional), apply the manual reversal below and
then `migrate resolve --rolled-back`.

## Manual reversal (destructive — only for a deliberate rollback)
This **drops the Admin data** stored in the three new tables and the new `article` columns.
Restore from snapshot instead if that data matters. It does **not** touch `subscription`.

```sql
BEGIN;

-- 1. Drop the new indexes on the existing article table
DROP INDEX IF EXISTS "article_language_status_idx";
DROP INDEX IF EXISTS "article_status_isFeatured_displayOrder_idx";

-- 2. Drop the standalone Admin tables (no FKs point at them; safe in any order)
DROP TABLE IF EXISTS "brand_settings";
DROP TABLE IF EXISTS "consultation_settings";
DROP TABLE IF EXISTS "media_asset";
DROP TYPE  IF EXISTS "MediaAssetKind";

-- 3. Drop the additive article columns
ALTER TABLE "article"
  DROP COLUMN IF EXISTS "archivedAt",
  DROP COLUMN IF EXISTS "category",
  DROP COLUMN IF EXISTS "coverImageAssetId",
  DROP COLUMN IF EXISTS "displayOrder",
  DROP COLUMN IF EXISTS "isFeatured",
  DROP COLUMN IF EXISTS "language",
  DROP COLUMN IF EXISTS "readingTimeMinutes",
  DROP COLUMN IF EXISTS "summary",
  DROP COLUMN IF EXISTS "unpublishedAt";

COMMIT;
```

Then deregister the migration:

```bash
npx prisma migrate resolve --rolled-back 20260716130000_admin_console_additive_v1
```

## The `ArticleStatus.UNPUBLISHED` enum value cannot be dropped cleanly
PostgreSQL has no `ALTER TYPE ... DROP VALUE`. Removing it requires recreating the type:

```sql
BEGIN;
-- Any article still in UNPUBLISHED must first be moved to a value that survives.
UPDATE "article" SET "status" = 'DRAFT' WHERE "status" = 'UNPUBLISHED';

ALTER TYPE "ArticleStatus" RENAME TO "ArticleStatus_old";
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');
ALTER TABLE "article"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "ArticleStatus" USING ("status"::text::"ArticleStatus"),
  ALTER COLUMN "status" SET DEFAULT 'DRAFT';
DROP TYPE "ArticleStatus_old";
COMMIT;
```

**Leaving the extra enum value in place is harmless and is the recommended course** — an
unused enum value costs nothing, and this recreation rewrites the column. Only do it if a
rollback must restore the type definition exactly.

## Safest rollback overall
Restore the pre-migration snapshot. The manual reversal above exists for environments where
that is not an option. Under no circumstance should a rollback of this migration touch the
`subscription` table, which is owned by a separate, earlier migration.
