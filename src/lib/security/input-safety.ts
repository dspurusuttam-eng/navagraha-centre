import { isSupportedLocale, type SupportedLocale } from "@/modules/localization/config";
import { securityConfig } from "@/lib/security/security-config";

export type SafetyIssue = {
  code: string;
  message: string;
};

export type SafetyResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      issue: SafetyIssue;
    };

const htmlPattern = /<[^>]+>/g;
const controlCharsPattern = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeSafeText(
  value: unknown,
  options: {
    maxLength: number;
    fieldName: string;
    allowEmpty?: boolean;
    collapseWhitespace?: boolean;
  }
): SafetyResult<string> {
  if (typeof value !== "string") {
    return {
      ok: false,
      issue: {
        code: "INVALID_TYPE",
        message: `${options.fieldName} must be a text value.`,
      },
    };
  }

  const withoutControlChars = value.replace(controlCharsPattern, "");
  const normalized = options.collapseWhitespace === false
    ? withoutControlChars.trim()
    : normalizeWhitespace(withoutControlChars);

  if (!normalized && !options.allowEmpty) {
    return {
      ok: false,
      issue: {
        code: "EMPTY_FIELD",
        message: `${options.fieldName} is required.`,
      },
    };
  }

  if (normalized.length > options.maxLength) {
    return {
      ok: false,
      issue: {
        code: "MAX_LENGTH_EXCEEDED",
        message: `${options.fieldName} must be within ${options.maxLength} characters.`,
      },
    };
  }

  return {
    ok: true,
    data: normalized,
  };
}

export function stripUnsafeMarkup(value: string) {
  return value.replace(htmlPattern, "").trim();
}

export function containsUnsafeMarkup(value: string) {
  return /<[^>]+>/.test(value);
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPhone(value: string) {
  return /^[0-9+\-()\s]{7,20}$/.test(value);
}

export function isValidLatitude(value: number) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: number) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

export function isValidTimezone(value: string) {
  try {
    Intl.DateTimeFormat("en-US", {
      timeZone: value,
    }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function validateSupportedLocale(
  value: unknown
): SafetyResult<SupportedLocale> {
  if (typeof value !== "string") {
    return {
      ok: false,
      issue: {
        code: "INVALID_LOCALE",
        message: "Locale must be a string.",
      },
    };
  }

  const normalized = value.trim();

  if (!isSupportedLocale(normalized)) {
    return {
      ok: false,
      issue: {
        code: "UNSUPPORTED_LOCALE",
        message: `Unsupported locale "${normalized}".`,
      },
    };
  }

  return {
    ok: true,
    data: normalized,
  };
}

export function validatePayloadSize(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (!Number.isFinite(contentLength) || contentLength <= 0) {
    return {
      ok: true,
      bytes: 0,
    };
  }

  if (contentLength > securityConfig.payload.maxJsonBytes) {
    return {
      ok: false,
      issue: {
        code: "PAYLOAD_TOO_LARGE",
        message: `Payload exceeds the ${securityConfig.payload.maxJsonBytes} byte limit.`,
      },
    } as const;
  }

  return {
    ok: true,
    bytes: contentLength,
  } as const;
}

export function sanitizeForStorage(value: string) {
  return stripUnsafeMarkup(value).replace(controlCharsPattern, "");
}

export function normalizeSlugInput(value: unknown, maxLength = 120): SafetyResult<string> {
  const normalized = normalizeSafeText(value, {
    fieldName: "Slug",
    maxLength,
  });

  if (!normalized.ok) {
    return normalized;
  }

  if (!/^[a-z0-9-_/]+$/i.test(normalized.data)) {
    return {
      ok: false,
      issue: {
        code: "INVALID_SLUG",
        message: "Slug contains unsupported characters.",
      },
    };
  }

  return normalized;
}
