type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
};

export type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
};

declare global {
  var __navagrahaRateLimitStore__: RateLimitStore | undefined;
}

function getRateLimitStore() {
  if (!globalThis.__navagrahaRateLimitStore__) {
    globalThis.__navagrahaRateLimitStore__ = new Map();
  }

  return globalThis.__navagrahaRateLimitStore__;
}

function cleanExpiredEntries(store: RateLimitStore, now: number) {
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function buildRateLimitKey(
  parts: ReadonlyArray<string | number | null | undefined>
) {
  return parts
    .filter((part) => part !== null && part !== undefined && part !== "")
    .join(":");
}

export function getClientAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "anonymous";
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "anonymous"
  );
}

export function checkRateLimit({
  key,
  limit,
  windowMs,
  now = Date.now(),
}: RateLimitOptions): RateLimitResult {
  const store = getRateLimitStore();

  cleanExpiredEntries(store, now);

  const currentEntry = store.get(key);

  if (!currentEntry || currentEntry.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - 1),
      resetAt: now + windowMs,
      retryAfterMs: 0,
    };
  }

  currentEntry.count += 1;
  store.set(key, currentEntry);

  const allowed = currentEntry.count <= limit;

  return {
    allowed,
    limit,
    remaining: Math.max(0, limit - currentEntry.count),
    resetAt: currentEntry.resetAt,
    retryAfterMs: allowed ? 0 : Math.max(0, currentEntry.resetAt - now),
  };
}

export function assertRateLimit(
  options: RateLimitOptions & {
    message?: string;
  }
) {
  const result = checkRateLimit(options);

  if (!result.allowed) {
    const seconds = Math.max(1, Math.ceil(result.retryAfterMs / 1_000));
    throw new Error(
      options.message ??
        `Too many requests. Please wait about ${seconds} seconds and try again.`
    );
  }

  return result;
}

export function getRateLimitHeaders(result: RateLimitResult) {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1_000)),
  };

  if (result.retryAfterMs > 0) {
    headers["Retry-After"] = String(
      Math.max(1, Math.ceil(result.retryAfterMs / 1_000))
    );
  }

  return headers;
}

export function resetRateLimitStore() {
  getRateLimitStore().clear();
}
