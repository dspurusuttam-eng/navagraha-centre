export type ApiErrorPayload = {
  status: "error";
  code: string;
  message: string;
  error: {
    code: string;
    message: string;
  };
  details?: unknown;
};

export type ApiErrorResponseOptions = {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  headers?: HeadersInit;
};

export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function readJsonObjectBody(
  request: Request
): Promise<Record<string, unknown> | null> {
  const payload = (await request.json().catch(() => null)) as unknown;

  if (!isPlainObject(payload)) {
    return null;
  }

  return payload;
}

export function buildApiErrorPayload(
  code: string,
  message: string,
  details?: unknown
): ApiErrorPayload {
  return {
    status: "error",
    code,
    message,
    error: {
      code,
      message,
    },
    ...(details === undefined ? {} : { details }),
  };
}

export function apiErrorResponse({
  statusCode,
  code,
  message,
  details,
  headers,
}: ApiErrorResponseOptions) {
  return Response.json(buildApiErrorPayload(code, message, details), {
    status: statusCode,
    headers,
  });
}

export function getApiErrorMessage(payload: unknown, fallback: string) {
  if (!isPlainObject(payload)) {
    return fallback;
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  if (isPlainObject(payload.error) && typeof payload.error.message === "string") {
    const nestedMessage = payload.error.message.trim();

    if (nestedMessage) {
      return nestedMessage;
    }
  }

  return fallback;
}
