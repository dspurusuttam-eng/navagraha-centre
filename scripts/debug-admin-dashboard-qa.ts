/**
 * Claude Admin Console C3B2 — admin dashboard QA (pure loader + static widget checks).
 * Covers per-section data loading, failure isolation, empty state, availability label,
 * and the required widgets/actions/states in the rendered dashboard. No DB/route.
 */
import { readFileSync } from "node:fs";
import {
  loadAdminDashboard,
  availabilityLabel,
  isRecentEmpty,
  type DashboardDeps,
  type DashboardArticleSummary,
} from "@/modules/admin/dashboard/dashboard-core";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");

const RECENT: DashboardArticleSummary[] = [
  { id: "a1", title: "Sade Sati", slug: "sade-sati", status: "PUBLISHED", updatedAt: "2025-01-02T00:00:00.000Z" },
];
function baseDeps(over: Partial<DashboardDeps> = {}): DashboardDeps {
  return {
    countArticlesByStatus: async (status) => (status === "PUBLISHED" ? 4 : 2),
    listRecentArticles: async () => RECENT,
    getConsultation: async () => ({ availabilityStatus: "AVAILABLE", isEnabled: true }),
    ...over,
  };
}
const fail = () => { throw new Error("source down"); };

type Group = { name: string; run: () => Promise<void> | void };
const groups: Group[] = [
  {
    name: "D1 all sources ready → counts + recent + consultation",
    run: async () => {
      const view = await loadAdminDashboard(baseDeps());
      assert(view.articleCounts.state === "ready" && view.articleCounts.data.published === 4 && view.articleCounts.data.draft === 2, "counts");
      assert(view.recentArticles.state === "ready" && view.recentArticles.data.length === 1, "recent");
      assert(view.consultation.state === "ready" && view.consultation.data.availabilityStatus === "AVAILABLE", "consultation");
    },
  },
  {
    name: "D2 failure isolation: one source down → only that section unavailable",
    run: async () => {
      const noCounts = await loadAdminDashboard(baseDeps({ countArticlesByStatus: async () => fail() }));
      assert(noCounts.articleCounts.state === "unavailable" && noCounts.recentArticles.state === "ready" && noCounts.consultation.state === "ready", "counts isolated");
      const noRecent = await loadAdminDashboard(baseDeps({ listRecentArticles: async () => fail() }));
      assert(noRecent.recentArticles.state === "unavailable" && noRecent.articleCounts.state === "ready", "recent isolated");
      const noConsult = await loadAdminDashboard(baseDeps({ getConsultation: async () => fail() }));
      assert(noConsult.consultation.state === "unavailable" && noConsult.articleCounts.state === "ready", "consultation isolated");
    },
  },
  {
    name: "D3 empty recent + availability label",
    run: async () => {
      const view = await loadAdminDashboard(baseDeps({ listRecentArticles: async () => [] }));
      assert(view.recentArticles.state === "ready" && isRecentEmpty(view.recentArticles), "empty recent");
      assert(availabilityLabel("AVAILABLE") === "Available" && availabilityLabel("LIMITED") === "Limited" && availabilityLabel("UNAVAILABLE") === "Unavailable" && availabilityLabel("X") === "Unknown", "labels");
    },
  },
  {
    name: "D4 dashboard widgets + actions + states present",
    run: () => {
      const src = read("src/modules/admin/dashboard/admin-dashboard.tsx");
      for (const needle of ["Published articles", "Draft articles", "Consultation availability", "Recently updated articles", "Create New Article", "Edit Consultation Details"]) {
        assert(src.includes(needle), `widget "${needle}"`);
      }
      assert(src.includes('href="/admin/desk"'), "create article → /admin/desk");
      assert(src.includes('href="/admin/consultation"'), "edit consultation → /admin/consultation");
      assert(src.includes("Temporarily unavailable"), "unavailable state");
      assert(src.includes("No articles yet"), "empty state");
      // Protected: no charts/analytics libs.
      assert(!/recharts|chart\.js|<canvas|BarChart|LineChart/i.test(src), "no charts/analytics");
    },
  },
  {
    name: "D5 page wired to services + noindex; a11y headings + touch targets",
    run: () => {
      const page = read("src/app/(admin)/admin/page.tsx");
      assert(page.includes("loadAdminDashboard") && page.includes("getAdminDashboardDeps"), "wired to services");
      assert(page.includes("index: false"), "noindex");
      const src = read("src/modules/admin/dashboard/admin-dashboard.tsx");
      assert(src.includes("<h1") && src.includes("<h2"), "headings");
      assert(src.includes("min-h-11"), "action touch targets");
      assert(src.includes("truncate"), "long titles truncate (mobile)");
    },
  },
];

async function main() {
  console.log("Admin Console C3B2 — admin dashboard QA (pure + static):");
  let passed = 0;
  let failed = 0;
  for (const group of groups) {
    try {
      await group.run();
      console.log(`  ✓ ${group.name}`);
      passed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`  ✗ ${group.name} -- ${message}`);
      failed += 1;
    }
  }
  console.log(`\nadmin dashboard QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
