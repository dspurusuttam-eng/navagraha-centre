# Database Backup And Restore Runbook

Use this runbook before production migrations and for incident recovery.

## 1. Backup (Neon/PostgreSQL)

1. Export a backup snapshot:

```bash
pg_dump "%DATABASE_URL%" --format=custom --file=backup/navagraha-$(Get-Date -Format yyyyMMdd-HHmm).dump
```

2. Verify the dump file exists and has non-zero size.
3. Store the dump in a secure location (encrypted storage + restricted access).

## 2. Restore Drill (recommended before launch)

1. Create a temporary restore database in Neon (or local PostgreSQL).
2. Restore the dump:

```bash
pg_restore --clean --if-exists --no-owner --dbname="%RESTORE_DATABASE_URL%" backup/<dump-file>.dump
```

3. Validate core tables exist (`User`, `UserProfile`, `Account`, `Session`, `AstrologyChart`, `Product`, `Consultation`, AI tables).
4. Run app checks against restored DB:

```bash
npm run env:check
npm run db:generate
npm run build
```

## 3. Recovery Sequence

1. Put the app in maintenance mode (or pause write traffic).
2. Restore latest verified backup to target database.
3. Run `npm run db:migrate:deploy` if schema migrations are pending.
4. Run targeted seed only if required for missing reference data (`npm run db:seed:launch`).
5. Verify:
   - `/api/health` returns `200`
   - sign-in works
   - `/dashboard`, `/dashboard/report`, `/dashboard/ask-my-chart` load
6. Remove maintenance mode and monitor logs/errors for at least 15 minutes.

## 4. Minimum Backup Policy

- Keep at least 7 daily backups and 4 weekly backups.
- Run a restore drill at least once per month.
- Record backup timestamp, operator, and restore verification result.
