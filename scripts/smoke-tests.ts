import assert from "node:assert/strict";
import { validateLaunchEnvironment } from "../src/config/env";
import {
  adminRouteCatalog,
  getVisibleAdminRoutes,
  hasAdminAccess,
} from "../src/modules/admin/permissions";
import { checkRateLimit, resetRateLimitStore } from "../src/lib/rate-limit";

function runEnvironmentSmokeTest() {
  const validation = validateLaunchEnvironment({
    DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/navagraha",
    BETTER_AUTH_SECRET: "secret",
    BETTER_AUTH_URL: "https://navagraha.example.com",
    NEXT_PUBLIC_SITE_URL: "https://navagraha.example.com",
    NEXT_PUBLIC_SITE_NAME: "NAVAGRAHA CENTRE",
    AI_PROVIDER: "openai-responses",
    OPENAI_API_KEY: "openai-key",
    OPENAI_MODEL: "gpt-5.4",
  });

  assert.equal(validation.valid, true);
}

function runPermissionsSmokeTest() {
  const founderRoutes = getVisibleAdminRoutes([{ key: "founder" }]);
  const supportRoutes = getVisibleAdminRoutes([{ key: "support" }]);

  assert.equal(founderRoutes.length, adminRouteCatalog.length);
  assert.equal(
    supportRoutes.some((route) => route.href === "/admin/consultations"),
    true
  );
  assert.equal(
    supportRoutes.some((route) => route.href === "/admin/products"),
    false
  );
  assert.equal(hasAdminAccess([{ key: "editor" }], ["editor"]), true);
}

function runRateLimitSmokeTest() {
  resetRateLimitStore();

  const first = checkRateLimit({
    key: "smoke:test",
    limit: 2,
    windowMs: 1_000,
    now: 1_000,
  });
  const second = checkRateLimit({
    key: "smoke:test",
    limit: 2,
    windowMs: 1_000,
    now: 1_100,
  });
  const blocked = checkRateLimit({
    key: "smoke:test",
    limit: 2,
    windowMs: 1_000,
    now: 1_200,
  });

  assert.equal(first.allowed, true);
  assert.equal(second.allowed, true);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterMs > 0, true);
}

runEnvironmentSmokeTest();
runPermissionsSmokeTest();
runRateLimitSmokeTest();

console.log("Smoke tests passed.");
