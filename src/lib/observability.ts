import { sendOpsAlert } from "@/lib/ops-alerts";

export type ObservabilityLevel = "info" | "warning" | "error";

type ObservabilityContext = Record<string, unknown>;

function getConsoleMethod(level: ObservabilityLevel) {
  switch (level) {
    case "warning":
      return console.warn;
    case "error":
      return console.error;
    default:
      return console.info;
  }
}

function serializeContext(context: ObservabilityContext) {
  try {
    return JSON.stringify(context);
  } catch {
    return JSON.stringify({
      serialization: "failed",
    });
  }
}

function shouldEscalate(level: ObservabilityLevel) {
  if (level === "error") {
    return true;
  }

  return level === "warning" && process.env.OPS_ALERT_ON_WARNINGS === "true";
}

export function trackServerEvent(
  event: string,
  context: ObservabilityContext = {},
  level: ObservabilityLevel = "info"
) {
  const logger = getConsoleMethod(level);

  logger(
    `[observability:${level}] ${event}`,
    serializeContext({
      timestamp: new Date().toISOString(),
      ...context,
    })
  );

  if (typeof window === "undefined" && shouldEscalate(level)) {
    void sendOpsAlert({
      title: `Server ${level}: ${event}`,
      message: `Observed ${level} event in server runtime.`,
      severity: level === "error" ? "critical" : "warning",
      source: "observability",
      dedupeKey: `observability:${level}:${event}`,
      cooldownMs: 2 * 60 * 1_000,
      context,
    });
  }
}

export function captureException(
  error: unknown,
  context: ObservabilityContext = {}
) {
  const normalizedError =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : {
          message: String(error),
        };

  trackServerEvent(
    "exception",
    {
      ...context,
      error: normalizedError,
    },
    "error"
  );
}

export function isAnalyticsEnabled() {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
}

export function getObservabilityEndpoint() {
  return (
    process.env.NEXT_PUBLIC_OBSERVABILITY_ENDPOINT ||
    "/api/observability/web-vitals"
  );
}

type BrowserMetric = {
  name: string;
  value: number;
  rating?: string;
  id?: string;
  label?: string;
  navigationType?: string;
  pathname?: string;
};

export function trackBrowserMetric(metric: BrowserMetric) {
  if (!isAnalyticsEnabled() || typeof window === "undefined") {
    return;
  }

  const payload = JSON.stringify({
    ...metric,
    pathname: metric.pathname ?? window.location.pathname,
    timestamp: new Date().toISOString(),
  });
  const endpoint = getObservabilityEndpoint();

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    navigator.sendBeacon(endpoint, payload);
    return;
  }

  void fetch(endpoint, {
    method: "POST",
    body: payload,
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
