import "dotenv/config";
import assert from "node:assert/strict";

type CriticalFlowCheck = {
  name: string;
  path: string;
  mode: "public" | "auth-or-redirect";
};

const checks: CriticalFlowCheck[] = [
  { name: "home", path: "/", mode: "public" },
  { name: "auth", path: "/sign-in", mode: "public" },
  { name: "dashboard", path: "/dashboard", mode: "auth-or-redirect" },
  { name: "report", path: "/dashboard/report", mode: "auth-or-redirect" },
  {
    name: "ask-my-chart",
    path: "/dashboard/ask-my-chart",
    mode: "auth-or-redirect",
  },
];

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function getBaseUrl() {
  return normalizeBaseUrl(
    process.env.SMOKE_BASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      "http://localhost:3000"
  );
}

function isRedirectStatus(status: number) {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

function isSignInRedirect(location: string | null) {
  return Boolean(location && location.includes("/sign-in"));
}

async function runCheck(baseUrl: string, check: CriticalFlowCheck) {
  const url = `${baseUrl}${check.path}`;
  const response = await fetch(url, {
    method: "GET",
    redirect: "manual",
    cache: "no-store",
  });

  if (check.mode === "public") {
    assert.equal(
      response.status,
      200,
      `[${check.name}] expected HTTP 200 for ${url}, received ${response.status}`
    );

    return;
  }

  if (response.status === 200) {
    return;
  }

  if (isRedirectStatus(response.status)) {
    const location = response.headers.get("location");
    assert.equal(
      isSignInRedirect(location),
      true,
      `[${check.name}] redirect for ${url} must point to /sign-in. Received location: ${location ?? "null"}`
    );

    return;
  }

  assert.fail(
    `[${check.name}] expected 200 or redirect for ${url}, received ${response.status}`
  );
}

async function runCriticalFlowSmokeTests() {
  const baseUrl = getBaseUrl();

  for (const check of checks) {
    await runCheck(baseUrl, check);
  }

  console.log(
    `Critical flow smoke tests passed against ${baseUrl} (${checks.length} checks).`
  );
}

runCriticalFlowSmokeTests().catch((error) => {
  console.error("Critical flow smoke tests failed.", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
});
