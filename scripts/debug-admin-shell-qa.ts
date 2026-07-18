/**
 * Claude Admin Console C3B1 — mobile admin shell QA (pure + static source checks).
 * Covers nav config, active-state resolution, accessibility invariants, placeholder
 * pages, and admin absence from public navigation / sitemap / PWA shortcuts.
 */
import { readFileSync } from "node:fs";
import { ADMIN_NAV_ITEMS, resolveActiveNavKey } from "@/modules/admin/shell/nav";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");

type Group = { name: string; run: () => void };
const groups: Group[] = [
  {
    name: "NAV1 nav config: Dashboard/Desk/Consultation/Media/Settings, unique, under /admin",
    run: () => {
      const labels = ADMIN_NAV_ITEMS.map((i) => i.label);
      assert(JSON.stringify(labels) === JSON.stringify(["Dashboard", "Desk", "Consultation", "Media", "Settings"]), `labels ${labels}`);
      const hrefs = ADMIN_NAV_ITEMS.map((i) => i.href);
      assert(new Set(hrefs).size === 5 && new Set(ADMIN_NAV_ITEMS.map((i) => i.key)).size === 5, "unique keys/hrefs");
      for (const item of ADMIN_NAV_ITEMS) assert(item.href === "/admin" || item.href.startsWith("/admin/"), `href ${item.href}`);
    },
  },
  {
    name: "NAV2 active-state resolution (exact + prefix + trailing slash)",
    run: () => {
      assert(resolveActiveNavKey("/admin") === "dashboard", "/admin → dashboard");
      assert(resolveActiveNavKey("/admin/") === "dashboard", "trailing slash");
      assert(resolveActiveNavKey("/admin/desk") === "desk", "/admin/desk");
      assert(resolveActiveNavKey("/admin/desk/new") === "desk", "prefix");
      assert(resolveActiveNavKey("/admin/consultation") === "consultation", "consultation");
      assert(resolveActiveNavKey("/admin/media") === "media", "media");
      assert(resolveActiveNavKey("/admin/settings") === "settings", "settings");
      assert(resolveActiveNavKey("/admin/articles") === null, "non-nav → null");
      assert(resolveActiveNavKey("/admin/login") === null, "login not in nav");
    },
  },
  {
    name: "A11Y mobile shell: menu button, landmark, active state, skip link, touch targets, logout",
    run: () => {
      const src = read("src/modules/admin/shell/admin-mobile-shell.tsx");
      assert(src.includes("aria-expanded"), "hamburger aria-expanded");
      assert(src.includes("aria-controls") && src.includes('id="admin-nav-drawer"'), "aria-controls target");
      assert(src.includes('aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}'), "menu button label");
      assert(src.includes('aria-label="Admin navigation"'), "nav landmark label");
      assert(src.includes('aria-current={active ? "page" : undefined}'), "active aria-current");
      assert(src.includes("Skip to content") && src.includes('href="#admin-main"') && src.includes('id="admin-main"'), "skip link + target");
      assert(src.includes("min-h-11"), "touch targets >=44px");
      assert(src.includes("{logout}"), "logout rendered");
    },
  },
  {
    name: "PAGES all admin routes are real (no placeholders left) and noindex",
    run: () => {
      // Every shell route now has a real page: /admin dashboard (C3B2), /admin/desk list
      // (C4A), /admin/consultation (C5A), /admin/settings (C5B), /admin/media (C6A).
      const realPages = [
        "src/app/(admin)/admin/page.tsx",
        "src/app/(admin)/admin/desk/page.tsx",
        "src/app/(admin)/admin/consultation/page.tsx",
        "src/app/(admin)/admin/settings/page.tsx",
        "src/app/(admin)/admin/media/page.tsx",
      ];
      for (const page of realPages) {
        const src = read(page);
        assert(!src.includes("AdminPlaceholder"), `${page} is a real page (no AdminPlaceholder)`);
        assert(src.includes("index: false"), `${page} is noindex`);
      }
    },
  },
  {
    name: "ISO admin absent from sitemap, PWA manifest, and public navigation",
    run: () => {
      assert(!read("src/app/sitemap.ts").includes("/admin"), "sitemap has no /admin");
      assert(!read("src/app/manifest.ts").includes("/admin"), "PWA manifest has no /admin");
      for (const navFile of ["src/components/site/header.tsx", "src/components/site/site-drawer.tsx", "src/components/site/mobile-bottom-action-bar.tsx"]) {
        assert(!read(navFile).includes('"/admin"') && !read(navFile).includes("'/admin'"), `${navFile} has no /admin link`);
      }
    },
  },
];

function main() {
  console.log("Admin Console C3B1 — mobile admin shell QA (pure + static):");
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
  console.log(`\nadmin shell QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

main();
