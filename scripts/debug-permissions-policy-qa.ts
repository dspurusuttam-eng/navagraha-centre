import assert from "node:assert/strict";

import nextConfig from "../next.config";

type HeaderEntry = {
  key: string;
  value: string;
};

type HeaderRoute = {
  source: string;
  headers: HeaderEntry[];
};

async function readHeaderRoutes() {
  const headers = nextConfig.headers;

  if (typeof headers !== "function") {
    throw new Error("next.config must expose a headers function");
  }

  return (await headers()) as HeaderRoute[];
}

async function main() {
  const routes = await readHeaderRoutes();
  const allHeaders = routes.flatMap((route) => route.headers);
  const permissionsPolicyHeaders = allHeaders.filter(
    (header) => header.key.toLowerCase() === "permissions-policy"
  );

  assert.equal(
    permissionsPolicyHeaders.length,
    1,
    "exactly one Permissions-Policy header should be configured"
  );

  const permissionsPolicy = permissionsPolicyHeaders[0]?.value ?? "";

  assert.match(
    permissionsPolicy,
    /(?:^|,\s*)geolocation=\(self\)(?:,|$)/,
    "Permissions-Policy must allow same-origin geolocation"
  );
  assert.doesNotMatch(
    permissionsPolicy,
    /(?:^|,\s*)geolocation=\(\)(?:,|$)/,
    "Permissions-Policy must not block geolocation entirely"
  );
  assert.doesNotMatch(
    permissionsPolicy,
    /(?:^|,\s*)geolocation=\*(?:,|$)/,
    "Permissions-Policy must not allow arbitrary geolocation origins"
  );
  assert.match(
    permissionsPolicy,
    /(?:^|,\s*)camera=\(\)(?:,|$)/,
    "camera must remain disabled"
  );
  assert.match(
    permissionsPolicy,
    /(?:^|,\s*)microphone=\(\)(?:,|$)/,
    "microphone must remain disabled"
  );
  assert.match(
    permissionsPolicy,
    /(?:^|,\s*)browsing-topics=\(\)(?:,|$)/,
    "browsing topics must remain disabled"
  );
  assert.match(
    permissionsPolicy,
    /(?:^|,\s*)payment=\(\)(?:,|$)/,
    "payment must remain disabled"
  );

  console.log("debug-permissions-policy-qa: PASS");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
