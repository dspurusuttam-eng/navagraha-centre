/**
 * Claude Admin Console C3A1 — admin auth/session/security QA (pure).
 * Covers login rate limiting, safe redirect handling, page-access decisions, and a
 * static check that every Claude /api/admin/* route uses requireAdminApi. No DB/route.
 */
import { readFileSync } from "node:fs";
import { createLoginRateLimiter } from "@/modules/admin/auth/rate-limit";
import { sanitizeAdminRedirect } from "@/modules/admin/auth/redirect";
import {
  evaluateAdminPageAccess,
  isApprovedAdmin,
  ADMIN_LOGIN_PATH,
  ADMIN_DENIED_PATH,
} from "@/modules/admin/auth/access";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

type Group = { name: string; run: () => void };
const groups: Group[] = [
  {
    name: "RL1 login rate limiter: allow → block → unblock (deterministic clock)",
    run: () => {
      const rl = createLoginRateLimiter({ maxAttempts: 3, windowMs: 1000, blockMs: 5000 });
      const key = "1.2.3.4";
      assert(rl.check(key, 0).allowed && rl.check(key, 0).remaining === 3, "initially allowed, 3 remaining");
      rl.recordFailure(key, 0);
      rl.recordFailure(key, 100);
      assert(rl.check(key, 200).allowed && rl.check(key, 200).remaining === 1, "2 failures → 1 remaining");
      rl.recordFailure(key, 200); // 3rd failure → block
      const blocked = rl.check(key, 300);
      assert(!blocked.allowed && blocked.retryAfterMs > 0, "blocked after maxAttempts");
      assert(!rl.check(key, 5199).allowed, "still blocked before blockMs elapses");
      assert(rl.check(key, 5200).allowed, "unblocked once blockMs elapses");
    },
  },
  {
    name: "RL2 rate limiter: window expiry + reset",
    run: () => {
      const rl = createLoginRateLimiter({ maxAttempts: 3, windowMs: 1000, blockMs: 5000 });
      const key = "9.9.9.9";
      rl.recordFailure(key, 0);
      rl.recordFailure(key, 100);
      assert(rl.check(key, 1101).allowed && rl.check(key, 1101).remaining === 3, "old failures expire after window");
      rl.recordFailure(key, 2000);
      rl.reset(key);
      assert(rl.check(key, 2000).remaining === 3, "reset clears attempts");
    },
  },
  {
    name: "RD1 safe redirect: allow internal admin paths",
    run: () => {
      assert(sanitizeAdminRedirect("/admin") === "/admin", "/admin");
      assert(sanitizeAdminRedirect("/admin/articles") === "/admin/articles", "/admin/articles");
      assert(sanitizeAdminRedirect("/admin/foo-bar/baz") === "/admin/foo-bar/baz", "hyphens allowed");
    },
  },
  {
    name: "RD2 safe redirect: reject external / unsafe / loops → fallback",
    run: () => {
      for (const bad of ["https://evil.com", "//evil.com", "http://x", "/dashboard", "/adminfoo", "/admin/login", "/admin/denied", null, undefined, "   ", "/admin/x y", "/admin\\..\\etc"]) {
        assert(sanitizeAdminRedirect(bad as string) === "/admin", `rejected: ${String(bad)}`);
      }
    },
  },
  {
    name: "PA1 page access: unauthenticated → login; non-admin → denied; admin → ok",
    run: () => {
      const anon = evaluateAdminPageAccess({ authenticated: false, adminRoles: [] });
      assert(!anon.ok && anon.redirectTo === ADMIN_LOGIN_PATH, "anon → login");
      const nonAdmin = evaluateAdminPageAccess({ authenticated: true, adminRoles: [] });
      assert(!nonAdmin.ok && nonAdmin.redirectTo === ADMIN_DENIED_PATH, "non-admin → denied");
      assert(evaluateAdminPageAccess({ authenticated: true, adminRoles: [{ key: "founder" }] }).ok, "founder ok");
      const scoped = evaluateAdminPageAccess({ authenticated: true, adminRoles: [{ key: "editor" }], allowedRoles: ["founder"] });
      assert(!scoped.ok && scoped.redirectTo === ADMIN_DENIED_PATH, "editor→founder-only denied");
      assert(evaluateAdminPageAccess({ authenticated: true, adminRoles: [{ key: "founder" }], allowedRoles: ["support"] }).ok, "founder superuser");
      assert(isApprovedAdmin([{ key: "support" }]) && !isApprovedAdmin([]), "isApprovedAdmin");
    },
  },
  {
    name: "SEC1 every Claude /api/admin/* route uses requireAdminApi",
    run: () => {
      const routes = [
        "src/app/api/admin/health/route.ts",
        "src/app/api/admin/articles/route.ts",
        "src/app/api/admin/articles/[id]/route.ts",
        "src/app/api/admin/articles/[id]/publish/route.ts",
        "src/app/api/admin/articles/[id]/unpublish/route.ts",
        "src/app/api/admin/articles/[id]/archive/route.ts",
        "src/app/api/admin/consultation/route.ts",
        "src/app/api/admin/settings/brand/route.ts",
        "src/app/api/admin/media/route.ts",
        "src/app/api/admin/media/[id]/route.ts",
      ];
      for (const route of routes) {
        const source = readFileSync(route, "utf8");
        assert(source.includes("requireAdminApi"), `${route} must use requireAdminApi`);
      }
    },
  },
];

function main() {
  console.log("Admin Console C3A1 — auth/session/security QA (pure):");
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
  console.log(`\nadmin auth QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

main();
