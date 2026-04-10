import "dotenv/config";
import { sendOpsAlert } from "../src/lib/ops-alerts";

type HealthIssue = {
  key: string;
  severity: "error" | "warning";
  message: string;
};

type HealthPayload = {
  ok: boolean;
  timestamp?: string;
  issues?: HealthIssue[];
};

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function getHealthUrl() {
  const explicit = process.env.OPS_HEALTHCHECK_URL?.trim();

  if (explicit) {
    return explicit;
  }

  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    "http://127.0.0.1:3000";

  return `${normalizeBaseUrl(base)}/api/health`;
}

function getTimeoutMs() {
  const raw = Number(process.env.OPS_HEALTHCHECK_TIMEOUT_MS ?? "15000");

  if (Number.isFinite(raw) && raw > 0) {
    return raw;
  }

  return 15_000;
}

async function runHealthCheck() {
  const healthUrl = getHealthUrl();
  const response = await fetch(healthUrl, {
    method: "GET",
    cache: "no-store",
    signal: AbortSignal.timeout(getTimeoutMs()),
  });
  const body = (await response.json().catch(() => null)) as HealthPayload | null;
  const isHealthy = response.ok && body?.ok === true;

  if (!isHealthy) {
    await sendOpsAlert({
      title: "Uptime monitor detected failure",
      message: `Health monitor failed for ${healthUrl}.`,
      severity: "critical",
      source: "uptime-monitor",
      dedupeKey: "uptime-monitor:health-failure",
      cooldownMs: 10 * 60 * 1_000,
      context: {
        status: response.status,
        body,
      },
    });

    throw new Error(
      `Health check failed (${response.status}) for ${healthUrl}.`
    );
  }

  console.log(
    `[health-monitor] healthy ${healthUrl} at ${body?.timestamp ?? new Date().toISOString()}`
  );
}

runHealthCheck().catch((error) => {
  console.error("[health-monitor] check failed", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
});
