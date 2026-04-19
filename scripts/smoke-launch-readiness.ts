import "dotenv/config";
import assert from "node:assert/strict";

type JsonObject = Record<string, unknown>;

type LaunchCheck = {
  name: string;
  method: "GET" | "POST";
  path: string;
  body?: JsonObject;
  headers?: Record<string, string>;
  assertResponse: (response: Response, payload: unknown, url: string) => void;
};

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function getBaseUrl() {
  return normalizeBaseUrl(
    process.env.SMOKE_BASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      process.env.BETTER_AUTH_URL?.trim() ||
      "http://localhost:3000"
  );
}

function isRedirectStatus(status: number) {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

async function readPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => "");
}

function assertStructuredError(payload: unknown, expectedCode: string, url: string) {
  assert.equal(
    payload !== null && typeof payload === "object",
    true,
    `Expected JSON object payload for ${url}`
  );

  const objectPayload = payload as Record<string, unknown>;

  assert.equal(
    objectPayload.status,
    "error",
    `Expected structured error status for ${url}`
  );
  assert.equal(
    objectPayload.code,
    expectedCode,
    `Expected error code ${expectedCode} for ${url}`
  );
}

async function runChecks(baseUrl: string) {
  const baseOrigin = new URL(baseUrl).origin;
  const checks: LaunchCheck[] = [
    {
      name: "public-home",
      method: "GET",
      path: "/",
      assertResponse(response, _payload, url) {
        assert.equal(response.status, 200, `Expected HTTP 200 for ${url}`);
      },
    },
    {
      name: "public-kundli-ai",
      method: "GET",
      path: "/kundli-ai",
      assertResponse(response, _payload, url) {
        assert.equal(response.status, 200, `Expected HTTP 200 for ${url}`);
      },
    },
    {
      name: "public-pricing",
      method: "GET",
      path: "/pricing",
      assertResponse(response, _payload, url) {
        assert.equal(response.status, 200, `Expected HTTP 200 for ${url}`);
      },
    },
    {
      name: "auth-sign-up-page",
      method: "GET",
      path: "/sign-up",
      assertResponse(response, _payload, url) {
        assert.equal(response.status, 200, `Expected HTTP 200 for ${url}`);
      },
    },
    {
      name: "auth-sign-in-page",
      method: "GET",
      path: "/sign-in",
      assertResponse(response, _payload, url) {
        assert.equal(response.status, 200, `Expected HTTP 200 for ${url}`);
      },
    },
    {
      name: "auth-forgot-password-page",
      method: "GET",
      path: "/forgot-password",
      assertResponse(response, _payload, url) {
        assert.equal(response.status, 200, `Expected HTTP 200 for ${url}`);
      },
    },
    {
      name: "dashboard-protected-route",
      method: "GET",
      path: "/dashboard",
      assertResponse(response, _payload, url) {
        if (response.status === 200) {
          return;
        }

        if (isRedirectStatus(response.status)) {
          const location = response.headers.get("location");
          assert.equal(
            Boolean(location && location.includes("/sign-in")),
            true,
            `Expected redirect to /sign-in for ${url}`
          );
          return;
        }

        assert.fail(`Expected 200 or redirect for ${url}, got ${response.status}`);
      },
    },
    {
      name: "forgot-password-api",
      method: "POST",
      path: "/api/auth/request-password-reset",
      body: {
        email: "launch-smoke@navagraha.local",
        redirectTo: `${baseOrigin}/reset-password`,
      },
      assertResponse(response, payload, url) {
        assert.equal(
          response.status === 200 || response.status === 429,
          true,
          `Expected 200 or 429 for ${url}, got ${response.status}`
        );

        if (response.status === 429) {
          return;
        }

        assert.equal(
          payload !== null && typeof payload === "object",
          true,
          `Expected JSON object payload for ${url}`
        );
      },
    },
    {
      name: "chart-api-unauthorized",
      method: "POST",
      path: "/api/astrology/chart",
      body: {
        source: "PROFILE",
      },
      assertResponse(response, payload, url) {
        assert.equal(response.status, 401, `Expected HTTP 401 for ${url}`);
        assertStructuredError(payload, "UNAUTHORIZED", url);
      },
    },
    {
      name: "assistant-api-unauthorized",
      method: "POST",
      path: "/api/ai/ask-chart/sessions",
      body: {},
      assertResponse(response, payload, url) {
        assert.equal(response.status, 401, `Expected HTTP 401 for ${url}`);
        assertStructuredError(payload, "UNAUTHORIZED", url);
      },
    },
    {
      name: "premium-checkout-unauthorized",
      method: "POST",
      path: "/api/subscriptions/checkout",
      body: {
        planType: "PREMIUM",
      },
      assertResponse(response, payload, url) {
        assert.equal(response.status, 401, `Expected HTTP 401 for ${url}`);
        assertStructuredError(payload, "UNAUTHORIZED", url);
      },
    },
    {
      name: "premium-report-unauthorized",
      method: "POST",
      path: "/api/report/premium/generate",
      body: {
        reportType: "career",
      },
      assertResponse(response, payload, url) {
        assert.equal(response.status, 401, `Expected HTTP 401 for ${url}`);
        assertStructuredError(payload, "UNAUTHORIZED", url);
      },
    },
    {
      name: "payment-webhook-invalid-signature",
      method: "POST",
      path: "/api/shop/webhooks/payment?provider=draft-order",
      body: {
        id: "evt_launch_smoke_invalid_signature",
        type: "payment.paid",
        data: {
          orderNumber: "NC-LAUNCH-SMOKE",
        },
      },
      assertResponse(response, payload, url) {
        assert.equal(response.status, 401, `Expected HTTP 401 for ${url}`);
        assert.equal(
          payload !== null && typeof payload === "object",
          true,
          `Expected JSON object payload for ${url}`
        );

        const objectPayload = payload as Record<string, unknown>;

        assert.equal(
          objectPayload.outcome,
          "invalid-signature",
          `Expected invalid-signature outcome for ${url}`
        );
      },
    },
  ];

  for (const check of checks) {
    const url = `${baseUrl}${check.path}`;
    const response = await fetch(url, {
      method: check.method,
      redirect: "manual",
      cache: "no-store",
      headers: {
        ...(check.body ? { "content-type": "application/json" } : {}),
        ...(check.headers ?? {}),
      },
      body: check.body ? JSON.stringify(check.body) : undefined,
    });
    const payload = await readPayload(response);

    check.assertResponse(response, payload, url);
  }

  console.log(
    `Launch readiness smoke checks passed against ${baseUrl} (${checks.length} checks).`
  );
}

runChecks(getBaseUrl()).catch((error) => {
  console.error("Launch readiness smoke checks failed.", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
});
