/**
 * Claude Admin Console C1A — deterministic validation + lifecycle QA (pure).
 * No DB, no network. Runs on any Node. Exercises the Zod schemas + article
 * lifecycle state machine in src/modules/admin/domain/**.
 */
import {
  createArticleSchema,
  updateArticleSchema,
  articleTransitionSchema,
  estimateReadingTimeMinutes,
  createMediaAssetSchema,
  consultationConfigSchema,
  brandSettingsSchema,
  ARTICLE_LIFECYCLE_TRANSITIONS,
  canTransition,
  resolveTransition,
  transitionTimestampField,
  isPubliclyVisibleState,
  ADMIN_ARTICLE_STATES,
} from "@/modules/admin/domain";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const ok = (r: { success: boolean }) => r.success === true;
const bad = (r: { success: boolean }) => r.success === false;

type Group = { name: string; run: () => void };
const groups: Group[] = [
  {
    name: "A1 Article schema: valid input, defaults, and field coverage",
    run: () => {
      const parsed = createArticleSchema.parse({
        title: "Sade Sati explained",
        slug: "sade-sati-explained",
        summary: "A calm overview.",
        body: "word ".repeat(400),
        category: "astrology",
        coverImageAssetId: "clabc123",
        seoTitle: "Sade Sati",
        readingTimeMinutes: 2,
      });
      assert(parsed.language === "en", "language default en");
      assert(parsed.isFeatured === false && parsed.displayOrder === 0, "featured/order defaults");
      assert(parsed.slug === "sade-sati-explained", "slug preserved");
    },
  },
  {
    name: "A2 Article schema: rejects bad slug, short title, out-of-range reading time",
    run: () => {
      assert(bad(createArticleSchema.safeParse({ title: "Valid title", slug: "Bad Slug!" })), "bad slug rejected");
      assert(bad(createArticleSchema.safeParse({ title: "no", slug: "ok-slug" })), "short title rejected");
      assert(bad(createArticleSchema.safeParse({ title: "Valid title", slug: "ok", readingTimeMinutes: 0 })), "reading time 0 rejected");
      assert(ok(updateArticleSchema.safeParse({ title: "Just a title update" })), "partial update ok");
      assert(ok(updateArticleSchema.safeParse({})), "empty update ok");
    },
  },
  {
    name: "A3 Reading-time estimate deterministic",
    run: () => {
      assert(estimateReadingTimeMinutes(null) === null, "null → null");
      assert(estimateReadingTimeMinutes("") === null, "empty → null");
      assert(estimateReadingTimeMinutes("one two three") === 1, "few words → 1 min");
      assert(estimateReadingTimeMinutes("word ".repeat(400)) === 2, "400 words → 2 min");
      assert(estimateReadingTimeMinutes("word ".repeat(400)) === estimateReadingTimeMinutes("word ".repeat(400)), "deterministic");
    },
  },
  {
    name: "L1 Lifecycle: linear DRAFT→PUBLISHED→UNPUBLISHED→ARCHIVED all legal",
    run: () => {
      assert(canTransition("DRAFT", "PUBLISHED"), "draft→published");
      assert(canTransition("PUBLISHED", "UNPUBLISHED"), "published→unpublished");
      assert(canTransition("UNPUBLISHED", "ARCHIVED"), "unpublished→archived");
      assert(canTransition("ARCHIVED", "DRAFT"), "archived→draft (restore)");
    },
  },
  {
    name: "L2 Lifecycle: illegal transitions rejected",
    run: () => {
      assert(!canTransition("DRAFT", "UNPUBLISHED"), "draft→unpublished illegal");
      assert(!canTransition("ARCHIVED", "PUBLISHED"), "archived→published illegal");
      assert(!canTransition("PUBLISHED", "DRAFT"), "published→draft illegal");
      // every listed target is a valid state
      for (const from of ADMIN_ARTICLE_STATES) {
        for (const to of ARTICLE_LIFECYCLE_TRANSITIONS[from]) {
          assert((ADMIN_ARTICLE_STATES as readonly string[]).includes(to), `target ${to} valid`);
        }
      }
    },
  },
  {
    name: "L3 Lifecycle: resolveTransition actions + timestamp fields",
    run: () => {
      assert(resolveTransition("PUBLISH", "DRAFT").ok, "publish from draft ok");
      const badPub = resolveTransition("PUBLISH", "ARCHIVED");
      assert(!badPub.ok, "publish from archived rejected");
      assert(resolveTransition("REPUBLISH", "UNPUBLISHED").ok, "republish ok");
      assert(resolveTransition("RESTORE", "ARCHIVED").ok, "restore ok");
      assert(transitionTimestampField("PUBLISHED") === "publishedAt", "published→publishedAt");
      assert(transitionTimestampField("UNPUBLISHED") === "unpublishedAt", "unpublished→unpublishedAt");
      assert(transitionTimestampField("ARCHIVED") === "archivedAt", "archived→archivedAt");
      assert(transitionTimestampField("DRAFT") === null, "draft → no stamp");
      assert(isPubliclyVisibleState("PUBLISHED") && !isPubliclyVisibleState("UNPUBLISHED"), "only published public");
      assert(ok(articleTransitionSchema.safeParse({ action: "PUBLISH" })), "transition schema ok");
      assert(bad(articleTransitionSchema.safeParse({ action: "SUBMIT" })), "unknown action rejected");
    },
  },
  {
    name: "M1 Media schema: https + alt text required",
    run: () => {
      assert(ok(createMediaAssetSchema.safeParse({ url: "https://cdn.example.com/a.jpg", altText: "A diagram" })), "valid media");
      assert(bad(createMediaAssetSchema.safeParse({ url: "http://cdn.example.com/a.jpg", altText: "x" })), "http rejected");
      assert(bad(createMediaAssetSchema.safeParse({ url: "https://cdn.example.com/a.jpg" })), "missing alt rejected");
      assert(bad(createMediaAssetSchema.safeParse({ url: "https://cdn.example.com/a.jpg", altText: "a", mimeType: "application/pdf" })), "non-image mime rejected");
      const parsed = createMediaAssetSchema.parse({ url: "https://cdn.example.com/a.jpg", altText: "A", mimeType: "image/png" });
      assert(parsed.kind === "IMAGE", "kind default IMAGE");
    },
  },
  {
    name: "S1 Consultation config schema (canonical)",
    run: () => {
      assert(ok(consultationConfigSchema.safeParse({ availabilityStatus: "AVAILABLE", whatsappNumber: "+919876543210", languages: ["en"] })), "valid config");
      assert(bad(consultationConfigSchema.safeParse({ whatsappNumber: "abc" })), "bad whatsapp rejected");
      assert(bad(consultationConfigSchema.safeParse({ availabilityStatus: "MAYBE" })), "bad status rejected");
      assert(bad(consultationConfigSchema.safeParse({ languages: ["fr"] })), "unsupported language rejected");
      assert(bad(consultationConfigSchema.safeParse({ languages: ["en", "as"] })), "C10A: Assamese rejected (English-only lock)");
      assert(bad(consultationConfigSchema.safeParse({ languages: ["hi"] })), "C10A: Hindi rejected (English-only lock)");
      const d = consultationConfigSchema.parse({});
      assert(d.availabilityStatus === "UNAVAILABLE" && d.isEnabled === false && d.languages[0] === "en", "canonical defaults");
    },
  },
  {
    name: "B1 Brand settings schema (canonical)",
    run: () => {
      assert(ok(brandSettingsSchema.safeParse({ acharyaName: "Acharya J P Sarmah", supportEmail: "help@navagraha.com" })), "valid brand");
      assert(bad(brandSettingsSchema.safeParse({ supportEmail: "nope" })), "bad email rejected");
      assert(bad(brandSettingsSchema.safeParse({ socialLinks: [{ platform: "x", url: "not-a-url" }] })), "bad social url rejected");
      assert(bad(brandSettingsSchema.safeParse({ whatsappNumber: "abc" })), "bad whatsapp rejected");
      const d = brandSettingsSchema.parse({});
      assert(Array.isArray(d.socialLinks) && d.socialLinks.length === 0, "socialLinks default []");
    },
  },
];

function main() {
  console.log("Admin Console C1A — validation + lifecycle QA (pure):");
  let passed = 0;
  let failed = 0;
  for (const group of groups) {
    try {
      group.run();
      console.log(`  ✓ ${group.name}`);
      passed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`  ✗ ${group.name} -- ${message}`);
      failed += 1;
    }
  }
  console.log(`\nadmin validation QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

main();
