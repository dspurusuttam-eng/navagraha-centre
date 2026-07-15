import assert from "node:assert/strict";
import { NextRequest } from "next/server";

import { featureDisabledCode } from "../src/config/product-mode";
import { proxy } from "../src/proxy";

function request(pathname: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(new URL(pathname, "https://www.navagrahacentre.com"), init);
}

async function expectAllowed(pathname: string) {
  const response = proxy(request(pathname));
  assert.notEqual(response.status, 404, `${pathname} should not be blocked`);
  assert.notEqual(response.status, 403, `${pathname} should not be feature-disabled`);
}

function expectBlockedPage(pathname: string) {
  const response = proxy(request(pathname));
  assert.equal(response.status, 404, `${pathname} should be blocked`);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
}

async function expectDisabledApi(pathname: string, method = "POST") {
  const response = proxy(request(pathname, { method }));
  assert.equal(response.status, 403, `${pathname} should return disabled status`);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  const payload = await response.json();
  assert.equal(payload.ok, false);
  assert.equal(payload.code, featureDisabledCode);
  assert.equal(payload.feature, pathname);
}

async function main() {
  await expectAllowed("/");
await expectAllowed("/from-the-desk");
await expectAllowed("/from-the-desk/sample-entry");
await expectAllowed("/consultation");
await expectAllowed("/joy-prakash-sarmah");
await expectAllowed("/methodology");
await expectAllowed("/support");
await expectAllowed("/contact");
await expectAllowed("/privacy");
await expectAllowed("/terms");
await expectAllowed("/disclaimer");
await expectAllowed("/refund");
await expectAllowed("/en/from-the-desk/sample-entry");
await expectAllowed("/as/consultation");
await expectAllowed("/hi/methodology");
await expectAllowed("/api/health");

for (const route of [
  "/kundli",
  "/panchang",
  "/rashifal",
  "/shop",
  "/learn",
  "/ai",
  "/reports",
  "/tools",
  "/dashboard",
  "/sign-in",
  "/sign-up",
  "/admin",
  "/hi/kundli",
  "/as/dashboard",
]) {
  expectBlockedPage(route);
}

for (const apiRoute of [
  "/api/astrology/chart",
  "/api/astrology/panchang",
  "/api/astrology/daily-horoscope",
  "/api/ai/ask-chart/sessions",
  "/api/kundli/saved",
  "/api/platform/location-timezone",
  "/api/shop/checkout/init",
  "/api/subscriptions/checkout",
  "/api/auth/sign-up/email",
  "/api/auth/sign-in/email",
]) {
  await expectDisabledApi(apiRoute);
}

  console.log("Two-utility isolation proxy QA passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



