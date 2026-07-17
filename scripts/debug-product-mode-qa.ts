import assert from "node:assert/strict";

import {
  classifyTwoUtilityPath,
  isTwoUtilityPublicRoute,
  canEnablePrivateAdminAccessWithoutReopeningPublicSurfaces,
  isPrivateAdminAuthApi,
  isPrivateAdminAuthRequestAllowed,
  isPublicAuthRegistrationApi,
  productModeContract,
  twoUtilityDisabledCalculationApis,
  twoUtilityPublicBaseRoutes,
  twoUtilityRequiredPublicContentApis,
  twoUtilitySwissExecutionEntryPoints,
} from "../src/config/product-mode";

const locales = ["", "/en", "/as", "/hi"] as const;

assert.equal(productModeContract.PUBLIC_PRODUCT_MODE, "DESK_CONSULTATION");
assert.equal(productModeContract.SWISS_RUNTIME_ENABLED, false);
assert.equal(productModeContract.PUBLIC_CALCULATION_ENGINES_ENABLED, false);
assert.equal(productModeContract.PUBLIC_ACCOUNTS_ENABLED, false);
assert.equal(productModeContract.PRIVATE_ADMIN_CONSOLE_ENABLED, true);
assert.equal(productModeContract.PRIVATE_ADMIN_AUTH_ENABLED, true);
assert.equal(productModeContract.PUBLIC_AUTH_REGISTRATION_ENABLED, false);
assert.equal(canEnablePrivateAdminAccessWithoutReopeningPublicSurfaces(), true);

for (const route of twoUtilityPublicBaseRoutes) {
  if (route === "/from-the-desk/[slug]") {
    continue;
  }

  for (const locale of locales) {
    const localizedRoute: string = route === "/" ? locale || "/" : `${locale}${route}`;
    assert.equal(classifyTwoUtilityPath(localizedRoute), "PUBLIC_ALLOWLIST", localizedRoute);
    assert.equal(isTwoUtilityPublicRoute(localizedRoute), true, localizedRoute);
  }
}

for (const locale of locales) {
  const articlePath = `${locale}/from-the-desk/sample-article` || "/from-the-desk/sample-article";
  assert.equal(classifyTwoUtilityPath(articlePath), "PUBLIC_ALLOWLIST", articlePath);
  assert.equal(isTwoUtilityPublicRoute(articlePath), true, articlePath);
}

for (const staticRoute of ["/favicon.ico", "/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/_next/static/app.js"]) {
  assert.equal(classifyTwoUtilityPath(staticRoute), "STATIC_METADATA", staticRoute);
}

for (const route of twoUtilityRequiredPublicContentApis) {
  assert.equal(classifyTwoUtilityPath(route), "PUBLIC_CONTENT_API", route);
}

for (const route of twoUtilityDisabledCalculationApis) {
  assert.equal(classifyTwoUtilityPath(route), "DISABLED_CALCULATION_API", route);
  assert.equal(classifyTwoUtilityPath(`${route}/nested`), "DISABLED_CALCULATION_API", `${route}/nested`);
}

for (const route of [
  "/kundli",
  "/panchang",
  "/rashifal",
  "/learn",
  "/shop",
  "/ai",
  "/reports",
  "/tools",
  "/muhurat",
  "/numerology",
  "/hi/kundli",
  "/as/panchang",
]) {
  assert.equal(classifyTwoUtilityPath(route), "HIDDEN", route);
  assert.equal(isTwoUtilityPublicRoute(route), false, route);
}

for (const route of ["/sign-in", "/sign-up", "/dashboard", "/dashboard/chart", "/hi/sign-in"]) {
  assert.equal(classifyTwoUtilityPath(route), "REDIRECT_REQUIRED", route);
}

for (const route of [
  "/admin",
  "/admin/login",
  "/admin/denied",
  "/admin/users",
  "/api/admin",
  "/api/admin/astrologer-copilot/snapshots/1/events",
  "/api/auth/sign-in/email",
  "/api/auth/get-session",
  "/api/auth/sign-out",
]) {
  assert.equal(classifyTwoUtilityPath(route), "RESERVED_PRIVATE_ADMIN", route);
}

for (const route of ["/administrator", "/admin-public", "/api/administrator"]) {
  assert.notEqual(classifyTwoUtilityPath(route), "RESERVED_PRIVATE_ADMIN", route);
}

assert.equal(isPrivateAdminAuthApi("/api/auth/sign-in/email"), true);
assert.equal(isPrivateAdminAuthApi("/api/auth/get-session"), true);
assert.equal(isPrivateAdminAuthApi("/api/auth/sign-out"), true);
assert.equal(isPrivateAdminAuthApi("/api/auth/sign-up/email"), false);
assert.equal(isPublicAuthRegistrationApi("/api/auth/sign-up/email"), true);
assert.equal(isPrivateAdminAuthRequestAllowed("/api/auth/sign-in/email", "POST"), true);
assert.equal(isPrivateAdminAuthRequestAllowed("/api/auth/get-session", "GET"), true);
assert.equal(isPrivateAdminAuthRequestAllowed("/api/auth/sign-out", "POST"), true);
assert.equal(isPrivateAdminAuthRequestAllowed("/api/auth/sign-up/email", "POST"), false);
assert.equal(isPrivateAdminAuthRequestAllowed("/api/auth/sign-in/email", "GET"), false);

const allowedAdminAuthMethods = new Map([
  ["/api/auth/sign-in/email", "POST"],
  ["/api/auth/get-session", "GET"],
  ["/api/auth/sign-out", "POST"],
] as const);
const testedAuthMethods = ["GET", "POST", "HEAD", "OPTIONS", "PUT", "PATCH", "DELETE"] as const;

for (const [route, allowedMethod] of allowedAdminAuthMethods) {
  for (const method of testedAuthMethods) {
    assert.equal(
      isPrivateAdminAuthRequestAllowed(route, method),
      method === allowedMethod,
      `${method} ${route} allowlist mismatch`,
    );
  }
}

for (const signupRoute of ["/api/auth/sign-up", "/api/auth/sign-up/email"]) {
  assert.equal(isPublicAuthRegistrationApi(signupRoute), true, signupRoute);
  for (const method of testedAuthMethods) {
    assert.equal(
      isPrivateAdminAuthRequestAllowed(signupRoute, method),
      false,
      `${method} ${signupRoute} must not be privately allowed`,
    );
  }
}

for (const file of [
  "src/lib/astrology/swiss-module.ts",
  "src/lib/astrology/ephemeris.ts",
  "src/lib/astrology/chart-generator.ts",
  "src/lib/astrology/swiss-planetary-service.ts",
  "src/modules/panchang/premium/engine.ts",
]) {
  assert.ok(
    twoUtilitySwissExecutionEntryPoints.some((entry) => entry.file === file),
    `Missing Swiss execution inventory entry for ${file}`,
  );
}

assert.ok(twoUtilitySwissExecutionEntryPoints.every((entry) => entry.entryPoint && entry.executionPath));

console.log("Product mode contract QA passed.");




