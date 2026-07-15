import assert from "node:assert/strict";
import { NextRequest } from "next/server";

import {
  arePublicAccountsEnabled,
  canEnablePrivateAdminAccessWithoutReopeningPublicSurfaces,
  classifyTwoUtilityPath,
  featureDisabledCode,
  isPrivateAdminAuthEnabled,
  isPrivateAdminConsoleEnabled,
  isPublicAuthRegistrationEnabled,
  isPublicCalculationEnginesEnabled,
  isSwissRuntimeEnabled,
  productModeContract,
} from "../src/config/product-mode";
import { proxy } from "../src/proxy";

function request(pathname: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(new URL(pathname, "https://www.navagrahacentre.com"), init);
}

async function expectFeatureDisabledApi(pathname: string) {
  const response = proxy(request(pathname, { method: "POST" }));
  assert.equal(response.status, 403, `${pathname} should be blocked as feature-disabled`);
  const payload = await response.json();
  assert.equal(payload.code, featureDisabledCode);
}

async function main() {
  assert.equal(productModeContract.PUBLIC_PRODUCT_MODE, "DESK_CONSULTATION");
assert.equal(arePublicAccountsEnabled(), false);
assert.equal(isPublicAuthRegistrationEnabled(), false);
assert.equal(isPrivateAdminConsoleEnabled(), false);
assert.equal(isPrivateAdminAuthEnabled(), false);
assert.equal(isPublicCalculationEnginesEnabled(), false);
assert.equal(isSwissRuntimeEnabled(), false);
assert.equal(canEnablePrivateAdminAccessWithoutReopeningPublicSurfaces(), false);

for (const path of ["/admin", "/admin/users", "/api/admin/users", "/api/auth/sign-in/email"]) {
  assert.equal(classifyTwoUtilityPath(path), "RESERVED_PRIVATE_ADMIN", path);
}

for (const path of ["/kundli", "/panchang", "/rashifal", "/shop", "/dashboard", "/sign-in"]) {
  assert.notEqual(classifyTwoUtilityPath(path), "RESERVED_PRIVATE_ADMIN", path);
}

for (const path of ["/", "/from-the-desk", "/consultation", "/as/consultation", "/hi/from-the-desk/sample"]) {
  const response = proxy(request(path));
  assert.notEqual(response.status, 404, `${path} should remain available`);
}

for (const path of ["/admin", "/api/admin/users"]) {
  const response = proxy(request(path));
  assert.equal(response.status, path.startsWith("/api/") ? 403 : 404, `${path} should be unavailable publicly`);
}

await expectFeatureDisabledApi("/api/auth/sign-up/email");
await expectFeatureDisabledApi("/api/auth/sign-in/email");
await expectFeatureDisabledApi("/api/astrology/chart");
await expectFeatureDisabledApi("/api/astrology/panchang");

  console.log("Admin reservation compatibility QA passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


