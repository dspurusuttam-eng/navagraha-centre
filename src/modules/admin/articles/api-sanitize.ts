// Claude C8B3 — Admin API response sanitisation (pure).
//
// The structured sidecar stored inside `Article.body` is an internal storage detail. It is
// stripped from every Admin API response so a consumer only ever sees the human-readable
// body. This is safe for round-trips: the article service reattaches the stored sidecar on
// every write, so a client that never sees the sidecar also cannot lose it.
//
// Pure (no `server-only`) so the guarantee is directly testable.
import { inspectDeskBody } from "@/modules/desk-sidecar/sidecar";

/**
 * Recursively strip the sidecar from any `body` string in an API payload.
 * Handles a single article, a paged list payload (`items`), and a bare array.
 */
export function withoutSidecar<T>(value: T): T {
  if (!value || typeof value !== "object") return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((item) => withoutSidecar(item)) as unknown as T;
  const record = value as Record<string, unknown>;
  if (Array.isArray(record.items)) {
    return { ...record, items: record.items.map((item) => withoutSidecar(item)) } as T;
  }
  if (typeof record.body === "string") {
    return { ...record, body: inspectDeskBody(record.body).visibleBody } as T;
  }
  return value;
}
