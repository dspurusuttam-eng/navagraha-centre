/**
 * Claude C8A/C8B — DRY-RUN import plan for the existing static Desk articles.
 *
 * Prints the exact Admin Article payload each /from-the-desk/* entry WOULD become. The
 * mapping lives in `@/modules/content/desk-import-core` and is the SAME code the import
 * runner executes, so the plan and the execution can never drift apart.
 *
 * Deterministic; performs NO database access and NO writes. Nothing is imported here and
 * the static source content is left untouched.
 *
 * Run:  npx tsx scripts/debug-desk-import-plan.ts          (human summary)
 *       npx tsx scripts/debug-desk-import-plan.ts --json   (machine-readable plan)
 */
import { curatedContentEntries } from "@/modules/content/catalog";
import { deskPathForSlug } from "@/modules/content/desk-article-core";
import { buildDeskImportPlan, sectionsToBody } from "@/modules/content/desk-import-core";

// Re-exported so existing callers/QA keep a single import site for the plan mapping.
export { buildDeskImportPlan, sectionsToBody };
export type { DeskImportItem } from "@/modules/content/desk-import-core";

function main() {
  const plan = buildDeskImportPlan(curatedContentEntries);

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  console.log("Claude C8A/C8B - Desk static -> Admin Article DRY-RUN import plan");
  console.log("(no database access, no writes, no static content removed)\n");
  console.log(`Static Desk articles to import: ${plan.length}\n`);

  for (const item of plan) {
    console.log(`- ${item.url}`);
    console.log(`    slug         : ${item.article.slug}   (URL preserved: ${deskPathForSlug(item.article.slug) === item.url ? "YES" : "NO"})`);
    console.log(`    language     : ${item.article.language}   category: ${item.article.category}   status: ${item.article.status}`);
    console.log(`    publishedAt  : ${item.article.publishedAt.toISOString()}   displayOrder: ${item.article.displayOrder}   featured: ${item.article.isFeatured}`);
    console.log(`    body         : ${item.article.body.length} chars, ${item.article.body.split(/\n\s*\n/).filter(Boolean).length} blocks`);
    console.log(`    cover image  : ${item.coverImage ? item.coverImage.url : "none"}`);
    for (const note of item.notes) console.log(`    note         : ${note}`);
  }

  const urlsPreserved = plan.every((item) => deskPathForSlug(item.article.slug) === item.url);
  const slugs = plan.map((item) => item.article.slug);
  const uniqueSlugs = new Set(slugs);

  console.log("\nPlan summary:");
  console.log(`  every URL preserved : ${urlsPreserved ? "YES" : "NO"}`);
  console.log(`  slugs unique        : ${uniqueSlugs.size === slugs.length ? "YES" : "NO"} (${uniqueSlugs.size}/${slugs.length})`);
  console.log(`  cover images        : ${plan.filter((item) => item.coverImage).length}`);
  console.log(`  items with notes    : ${plan.filter((item) => item.notes.length).length}`);
  console.log("\nDRY RUN ONLY - nothing was written. Execution: npm run debug:desk:import -- --apply");
}

// Only emit the plan when executed directly (importing this module must be side-effect free).
if (process.argv[1] && process.argv[1].includes("debug-desk-import-plan")) {
  main();
}
