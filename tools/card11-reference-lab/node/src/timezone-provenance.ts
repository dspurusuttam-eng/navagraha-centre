// Card 11.R3 — deterministic timezone/DST provenance (VALIDATION-ONLY, pure Intl/ICU).
// Records runtime provenance and classifies civil-time status. Ambiguous (DST fall-back
// overlap) and nonexistent (spring-forward gap) civil times FAIL EXPLICITLY — never guessed.
// Not imported by production; provides a spec + tests for a future additive production guard.

export type CivilStatus = "OK" | "AMBIGUOUS" | "NONEXISTENT";

export type RuntimeProvenance = {
  node: string;
  icu: string | undefined;
  tzdata: string | undefined;
  cldr: string | undefined;
  unicode: string | undefined;
};

export function runtimeProvenance(): RuntimeProvenance {
  const v = process.versions as Record<string, string | undefined>;
  return { node: process.version, icu: v.icu, tzdata: v.tz, cldr: v.cldr, unicode: v.unicode };
}

function partsOffsetMs(dateMs: number, timeZone: string): number {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  });
  const p = fmt.formatToParts(new Date(dateMs));
  const g = (t: string) => Number(p.find((x) => x.type === t)?.value ?? "0");
  const asUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
  return asUtc - dateMs;
}

/** Standard vs DST offset for the zone in the given year (DST offset is the larger). */
function janJulOffsets(year: number, tz: string) {
  const jan = partsOffsetMs(Date.UTC(year, 0, 15, 12), tz);
  const jul = partsOffsetMs(Date.UTC(year, 6, 15, 12), tz);
  return { standard: Math.min(jan, jul), dst: Math.max(jan, jul), observesDst: jan !== jul };
}

/**
 * Resolve a civil local datetime in an IANA zone to a UTC instant, with explicit
 * AMBIGUOUS / NONEXISTENT detection (no silent guessing).
 */
export function resolveCivil(iso: string, timeZone: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) throw new Error(`Invalid civil datetime: ${iso}`);
  const [year, mon, day, hh, mm, ss] = m.slice(1).map((x) => Number(x ?? 0));
  const naiveUtc = Date.UTC(year!, mon! - 1, day!, hh!, mm!, ss ?? 0);
  // candidate offsets around the naive instant
  const offBefore = partsOffsetMs(naiveUtc - 12 * 3600000, timeZone);
  const offAfter = partsOffsetMs(naiveUtc + 12 * 3600000, timeZone);
  const candidates = Array.from(new Set([offBefore, offAfter]));
  const valid: number[] = [];
  for (const off of candidates) {
    const utc = naiveUtc - off;
    // round-trip: does this UTC instant format back to the requested civil time?
    if (partsOffsetMs(utc, timeZone) === off) valid.push(utc);
  }
  const { standard, dst, observesDst } = janJulOffsets(year!, timeZone);
  let status: CivilStatus;
  let resolvedUtc: number | null;
  if (valid.length === 1) { status = "OK"; resolvedUtc = valid[0]!; }
  else if (valid.length >= 2) { status = "AMBIGUOUS"; resolvedUtc = null; } // fall-back overlap
  else { status = "NONEXISTENT"; resolvedUtc = null; } // spring-forward gap
  // UTC offset (minutes) = local wall time - UTC (e.g. IST = +330, EDT = -240)
  const offsetMinutes = resolvedUtc != null ? (naiveUtc - resolvedUtc) / 60000 : null;
  const dstActive = resolvedUtc != null && observesDst ? partsOffsetMs(resolvedUtc, timeZone) === dst : false;
  return {
    iana: timeZone, civilLocal: iso, status,
    resolvedUtc: resolvedUtc != null ? new Date(resolvedUtc).toISOString() : null,
    offsetMinutes, dstActive, observesDst,
    standardOffsetMinutes: standard / 60000, dstOffsetMinutes: dst / 60000,
    validInstantCount: valid.length,
  };
}
