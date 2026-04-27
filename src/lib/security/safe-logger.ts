import { securityConfig } from "@/lib/security/security-config";

export type SecurityLogLevel = "info" | "warning" | "error";

type SecurityLogContext = Record<string, unknown>;

const sensitiveKeyPattern =
  /(password|secret|token|api[_-]?key|authorization|cookie|set-cookie|signature|prompt|response|birth|dob|address|phone|email)/i;

function maskEmail(value: string) {
  const [local, domain] = value.split("@");

  if (!local || !domain) {
    return "***";
  }

  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length < 4) {
    return "***";
  }

  return `***${digits.slice(-4)}`;
}

function sanitizeValue(key: string, value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    if (sensitiveKeyPattern.test(key)) {
      if (key.toLowerCase().includes("email")) {
        return maskEmail(value);
      }

      if (key.toLowerCase().includes("phone")) {
        return maskPhone(value);
      }

      return "[redacted]";
    }

    return value.length > 280 ? `${value.slice(0, 280)}...` : value;
  }

  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.slice(0, 10).map((entry, index) =>
        sanitizeValue(`${key}[${index}]`, entry)
      );
    }

    const sanitized: Record<string, unknown> = {};

    for (const [childKey, childValue] of Object.entries(value)) {
      if (sensitiveKeyPattern.test(childKey)) {
        sanitized[childKey] = "[redacted]";
        continue;
      }

      sanitized[childKey] = sanitizeValue(childKey, childValue);
    }

    return sanitized;
  }

  return value;
}

export function buildSafeLogContext(context: SecurityLogContext = {}) {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    if (sensitiveKeyPattern.test(key)) {
      sanitized[key] = "[redacted]";
      continue;
    }

    sanitized[key] = sanitizeValue(key, value);
  }

  if (!securityConfig.logging.includeDebugContext) {
    delete sanitized.stack;
    delete sanitized.error;
  }

  return sanitized;
}

function getLogMethod(level: SecurityLogLevel) {
  if (level === "error") {
    return console.error;
  }

  if (level === "warning") {
    return console.warn;
  }

  return console.info;
}

export function logSecurityEvent(
  level: SecurityLogLevel,
  event: string,
  context: SecurityLogContext = {}
) {
  const logger = getLogMethod(level);
  const payload = {
    event,
    level,
    timestamp: new Date().toISOString(),
    ...buildSafeLogContext(context),
  };

  logger(`[security:${level}] ${event}`, JSON.stringify(payload));
}
