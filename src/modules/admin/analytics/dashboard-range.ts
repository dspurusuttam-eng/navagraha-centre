// Pure analytics range and metric logic.
//
// Deliberately free of `server-only` and of any database import so the accuracy
// rules -- IST day boundaries, like-for-like comparison windows, and the
// No-data-versus-measured-zero contract -- can be executed directly in CI
// instead of being verified by eye on a phone.

/** NAVAGRAHA CENTRE operates from Assam; every reported boundary is IST. */
export const CENTRE_TIME_ZONE = "Asia/Kolkata";

/** A term must occur at least this often before the console will display it. */
export const SEARCH_TERM_MIN_COUNT = 3;

export const RANGE_KEYS = ["today", "7d", "30d", "90d"] as const;
export type RangeKey = (typeof RANGE_KEYS)[number];

export const RANGE_LABELS: Record<RangeKey, string> = {
  today: "Today",
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

export const DAY_MS = 24 * 60 * 60 * 1000;

export function isRangeKey(value: unknown): value is RangeKey {
  return typeof value === "string" && (RANGE_KEYS as readonly string[]).includes(value);
}

export function zoneOffsetMs(instant: Date, timeZone: string): number {
  const asUtc = new Date(instant.toLocaleString("en-US", { timeZone: "UTC" }));
  const asZone = new Date(instant.toLocaleString("en-US", { timeZone }));
  return asZone.getTime() - asUtc.getTime();
}

/**
 * Midnight IST as an absolute instant, independent of the server's own zone
 * (Vercel runs UTC, a developer laptop may not). Reading the calendar date with
 * `getUTC*` after shifting into the zone is what makes that true.
 */
export function startOfDayInCentreZone(instant: Date = new Date()): Date {
  const offsetMs = zoneOffsetMs(instant, CENTRE_TIME_ZONE);
  const zoned = new Date(instant.getTime() + offsetMs);
  const midnight = Date.UTC(
    zoned.getUTCFullYear(),
    zoned.getUTCMonth(),
    zoned.getUTCDate()
  );
  return new Date(midnight - offsetMs);
}

export type ResolvedRange = {
  key: RangeKey;
  label: string;
  /** Inclusive start of the selected window. */
  from: Date;
  /** Exclusive end of the selected window. */
  to: Date;
  /** Inclusive start of the immediately preceding window of equal length. */
  previousFrom: Date;
  /** Number of whole IST days the window spans (1 for "today"). */
  days: number;
};

/**
 * Resolve a range key to absolute instants. Windows end at "now" rather than at
 * the end of today, so a partial current day is never compared against a full
 * previous day — the comparison window is the same span immediately before.
 */
export function resolveRange(key: RangeKey, now: Date = new Date()): ResolvedRange {
  const startToday = startOfDayInCentreZone(now);
  const days = key === "today" ? 1 : Number(key.replace("d", ""));
  const from = key === "today" ? startToday : new Date(startToday.getTime() - (days - 1) * DAY_MS);
  const to = now;
  const spanMs = to.getTime() - from.getTime();

  return {
    key,
    label: RANGE_LABELS[key],
    from,
    to,
    previousFrom: new Date(from.getTime() - spanMs),
    days,
  };
}

/** A headline number plus its like-for-like comparison. */
export type Metric = {
  /** null means "nothing recorded", which the UI must render as No data. */
  value: number | null;
  previous: number | null;
  /** Percent change, or null when a comparison would be meaningless. */
  changePct: number | null;
};

export function toMetric(value: number, previous: number, hasAnyData: boolean): Metric {
  if (!hasAnyData) {
    return { value: null, previous: null, changePct: null };
  }
  // A jump from zero is not "infinity percent"; it has no defensible ratio, so
  // the UI shows the raw numbers instead of a fabricated percentage.
  const changePct = previous > 0 ? ((value - previous) / previous) * 100 : null;
  return { value, previous, changePct };
}

export type NamedCount = { label: string; count: number };
export type TrendPoint = { day: string; count: number };

export type ArticlePerformanceRow = {
  slug: string;
  title: string;
  publishedAt: string | null;
  views: number;
  likes: number;
  shares: number;
  /** Likes per view, only when views are high enough for the ratio to mean anything. */
  engagementPct: number | null;
};

