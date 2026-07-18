/**
 * Claude C8B — legacy Desk content import runner.
 *
 *   npx tsx scripts/debug-desk-import.ts            DRY RUN (default) — reads only, writes nothing
 *   npx tsx scripts/debug-desk-import.ts --apply    EXECUTE — creates/updates Admin Articles
 *
 * Safety:
 *   * Dry run is the default. `--apply` must be passed explicitly and is announced loudly.
 *   * Idempotent by slug: a rerun writes nothing and can never create a duplicate.
 *   * The static source content is only ever READ; this script never modifies it.
 *   * All decision logic lives in the pure `desk-import-core`; this file only binds Prisma.
 *
 * NOT for Preview or Production in this card — run it against a local/disposable database
 * that already has the Admin migration applied.
 */
import { curatedContentEntries } from "@/modules/content/catalog";
import { getPrisma } from "@/lib/prisma";
import {
  buildDeskImportPlan,
  runDeskImport,
  type DeskImportRepo,
  type ExistingArticle,
} from "@/modules/content/desk-import-core";

/** Prisma binding for the injected import repository. */
function createPrismaImportRepo(): DeskImportRepo {
  const db = getPrisma();
  return {
    async findArticleBySlug(slug) {
      const row = await db.article.findUnique({
        where: { slug },
        select: {
          id: true, slug: true, title: true, excerpt: true, summary: true, body: true,
          language: true, category: true, status: true, seoTitle: true, seoDescription: true,
          readingTimeMinutes: true, isFeatured: true, displayOrder: true, publishedAt: true,
          coverImageAssetId: true,
        },
      });
      return (row as ExistingArticle | null) ?? null;
    },
    async createArticle(payload) {
      const created = await db.article.create({
        data: {
          slug: payload.slug,
          title: payload.title,
          excerpt: payload.excerpt,
          summary: payload.summary,
          body: payload.body,
          language: payload.language,
          category: payload.category,
          status: payload.status,
          seoTitle: payload.seoTitle,
          seoDescription: payload.seoDescription,
          readingTimeMinutes: payload.readingTimeMinutes,
          isFeatured: payload.isFeatured,
          displayOrder: payload.displayOrder,
          publishedAt: payload.publishedAt,
          coverImageAssetId: payload.coverImageAssetId,
        },
        select: { id: true },
      });
      return created.id;
    },
    async updateArticle(id, payload) {
      await db.article.update({
        where: { id },
        data: {
          title: payload.title,
          excerpt: payload.excerpt,
          summary: payload.summary,
          body: payload.body,
          language: payload.language,
          category: payload.category,
          status: payload.status,
          seoTitle: payload.seoTitle,
          seoDescription: payload.seoDescription,
          readingTimeMinutes: payload.readingTimeMinutes,
          isFeatured: payload.isFeatured,
          displayOrder: payload.displayOrder,
          publishedAt: payload.publishedAt,
          coverImageAssetId: payload.coverImageAssetId,
        },
      });
    },
    async findMediaByUrl(url) {
      const row = await db.mediaAsset.findFirst({ where: { url }, select: { id: true } });
      return row?.id ?? null;
    },
    async createMedia(input) {
      const created = await db.mediaAsset.create({
        data: { kind: "IMAGE", url: input.url, altText: input.altText },
        select: { id: true },
      });
      return created.id;
    },
  };
}

async function main() {
  const apply = process.argv.includes("--apply");
  const plan = buildDeskImportPlan(curatedContentEntries);

  console.log("Claude C8B - legacy Desk content import");
  console.log(apply ? "MODE: APPLY - writes will be performed" : "MODE: DRY RUN - nothing will be written (pass --apply to execute)");
  console.log(`Planned articles: ${plan.length}\n`);

  // Even a dry run needs READ access: created/updated/skipped can only be determined by
  // comparing the plan against what is already stored. Fail clearly rather than crashing.
  let report;
  try {
    report = await runDeskImport(plan, createPrismaImportRepo(), { apply });
  } catch (error) {
    const detail = error instanceof Error ? error.message.split("\n")[0] : String(error);
    console.error("Could not reach a database.");
    console.error("Even a dry run needs read access to report created/updated/skipped totals.");
    console.error("Point DATABASE_URL at a local/disposable database with the Admin migration applied, then re-run.");
    console.error(`Detail: ${detail}`);
    console.error("\nNothing was written.");
    process.exitCode = 1;
    return;
  }

  for (const result of report.results) {
    const media = result.mediaOutcome === "none" ? "" : `  [media: ${result.mediaOutcome}${result.mediaId ? ` ${result.mediaId}` : ""}]`;
    console.log(`  ${result.outcome.toUpperCase().padEnd(8)} ${result.url}${media}`);
    if (result.reason) console.log(`           reason: ${result.reason}`);
  }

  const { created, updated, skipped, conflict } = report.totals;
  console.log("\nTotals:");
  console.log(`  created  : ${created}`);
  console.log(`  updated  : ${updated}`);
  console.log(`  skipped  : ${skipped}`);
  console.log(`  conflict : ${conflict}`);
  console.log(`  total    : ${report.results.length}`);

  if (!apply) {
    console.log("\nDRY RUN - no rows were written. Re-run with --apply against a migrated database to execute.");
  }
  if (conflict > 0) {
    console.log("\nConflicts were reported and NOT written. Resolve them before re-running.");
    process.exitCode = 1;
  }
}

void main().finally(async () => {
  try {
    await getPrisma().$disconnect();
  } catch {
    // Nothing to disconnect (e.g. the client never connected in a dry run).
  }
});
