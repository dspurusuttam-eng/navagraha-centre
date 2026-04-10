type OpsAlertSeverity = "info" | "warning" | "critical";

type OpsAlertContext = Record<string, unknown>;

type OpsAlertInput = {
  title: string;
  message: string;
  severity?: OpsAlertSeverity;
  source?: string;
  dedupeKey?: string;
  cooldownMs?: number;
  context?: OpsAlertContext;
};

const defaultCooldownMs = 5 * 60 * 1_000;
const recentAlertByKey = new Map<string, number>();

function getWebhookUrl() {
  const value = process.env.OPS_ALERT_WEBHOOK_URL?.trim();

  return value ? value : null;
}

function isAlertsEnabled() {
  return process.env.OPS_ALERTS_ENABLED === "true";
}

function buildDedupeKey(input: OpsAlertInput) {
  if (input.dedupeKey?.trim()) {
    return input.dedupeKey.trim();
  }

  return `${input.source ?? "app"}:${input.severity ?? "warning"}:${input.title}`;
}

function shouldSendAlert(dedupeKey: string, cooldownMs: number) {
  const now = Date.now();
  const previous = recentAlertByKey.get(dedupeKey);

  if (previous && now - previous < cooldownMs) {
    return false;
  }

  recentAlertByKey.set(dedupeKey, now);

  return true;
}

export async function sendOpsAlert(input: OpsAlertInput) {
  if (typeof window !== "undefined") {
    return false;
  }

  if (!isAlertsEnabled()) {
    return false;
  }

  const webhookUrl = getWebhookUrl();

  if (!webhookUrl) {
    return false;
  }

  const dedupeKey = buildDedupeKey(input);
  const cooldownMs = input.cooldownMs ?? defaultCooldownMs;

  if (!shouldSendAlert(dedupeKey, cooldownMs)) {
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: input.title,
        message: input.message,
        severity: input.severity ?? "warning",
        source: input.source ?? "navagraha-centre",
        dedupeKey,
        timestamp: new Date().toISOString(),
        context: input.context ?? {},
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[ops-alerts] webhook rejected alert", {
        status: response.status,
      });
    }

    return response.ok;
  } catch (error) {
    console.error("[ops-alerts] failed to send alert", {
      message: error instanceof Error ? error.message : String(error),
    });

    return false;
  }
}
