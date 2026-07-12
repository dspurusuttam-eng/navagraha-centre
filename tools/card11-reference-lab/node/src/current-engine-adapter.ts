// Card 11.R1 — CURRENT ENGINE ADAPTER (read-only; calls UNMODIFIED production functions).
//
// This file is the lab's source-of-record for how the production engine is invoked.
// Because the production functions use the "@/" path alias and the native swisseph
// binary, this adapter is executed inside the production project context (Node 22)
// via a temporary, untracked bootstrap that is removed afterward — the production
// tree is left byte-clean (proven in the report). The production application NEVER
// imports this file.
//
// Production function called (UNCHANGED — the real accuracy-bearing engine):
//   - calculateCoreGrahaSiderealLongitudesAtUtc (@/lib/astrology/swiss-planetary-service)
//                                                                     [hard SWIEPH planetary engine]
// Instrumentation (same swisseph dependency, not a production formula fork):
//   - swe_get_ayanamsa_ut under SE_SIDM_LAHIRI  [reads the ayanamsa the SEFLG_SIDEREAL path subtracts]
// Civil->UTC: the production owner convertZonedBirthToUtcDate lives in ephemeris.ts,
// which imports the Next-only virtual module "server-only" and therefore cannot load
// under plain tsx. We reproduce its EXACT Intl.DateTimeFormat two-pass algorithm below
// (standard IANA/ICU civil-time handling — not an astronomical formula). Documented in report.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { calculateCoreGrahaSiderealLongitudesAtUtc } from "@/lib/astrology/swiss-planetary-service";

// --- Reproduction of production convertZonedBirthToUtcDate (ephemeris.ts:93-192) ---
function tzOffsetMs(date: Date, timeZone: string): number {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = fmt.formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - date.getTime();
}
function convertZonedBirthToUtcDate(dateLocal: string, timeLocal: string, timezone: string): Date {
  const [year, month, day] = dateLocal.split("-").map(Number);
  const [hour, minute] = timeLocal.split(":").map(Number);
  const naiveUtcMs = Date.UTC(year!, month! - 1, day!, hour!, minute!, 0);
  const initialOffset = tzOffsetMs(new Date(naiveUtcMs), timezone);
  let utcMs = naiveUtcMs - initialOffset;
  const correctedOffset = tzOffsetMs(new Date(utcMs), timezone);
  if (correctedOffset !== initialOffset) utcMs = naiveUtcMs - correctedOffset;
  return new Date(utcMs);
}

const require = createRequire(import.meta.url);
const swisseph = require("swisseph") as typeof import("swisseph");

const LAB = process.env.LAB_DIR;
if (!LAB) throw new Error("LAB_DIR env var is required (absolute path to card11-reference-lab).");

const BODIES = ["SUN", "MOON", "MERCURY", "VENUS", "MARS", "JUPITER", "SATURN"] as const;

function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

type Fixture = {
  id: string;
  kind: string;
  dateLocal: string;
  timeLocal: string;
  timezone: string;
  latitude: number;
  longitude: number;
  tags: string[];
};

function loadFixtures(): Fixture[] {
  const files = ["fixtures/reference-cases.json", "fixtures/boundary-cases.json"];
  const all: Fixture[] = [];
  for (const rel of files) {
    const parsed = JSON.parse(readFileSync(join(LAB, rel), "utf-8")) as { fixtures: Fixture[] };
    all.push(...parsed.fixtures);
  }
  const ids = new Set<string>();
  for (const f of all) {
    if (ids.has(f.id)) throw new Error(`Duplicate fixture id: ${f.id}`);
    ids.add(f.id);
  }
  return all;
}

function main() {
  const fixtures = loadFixtures();
  swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

  const results: Record<string, unknown> = {};
  const instants: Record<string, { utcInstant: string; julianDayUt: number }> = {};
  let ephemerisMode = "UNKNOWN";

  for (const f of fixtures) {
    const utcDate = convertZonedBirthToUtcDate(f.dateLocal, f.timeLocal, f.timezone);
    const utcInstant = utcDate.toISOString();
    const calc = calculateCoreGrahaSiderealLongitudesAtUtc({ asOfUtc: utcInstant });
    if (!calc.success) {
      results[f.id] = { error: calc.issue };
      continue;
    }
    ephemerisMode = calc.data.ephemeris_mode;
    const jd = calc.data.julian_day_ut;
    // NOTE (lab observation): the production planetary call leaves the process-global
    // swisseph sidereal mode in a NON-Lahiri state on return (global-state side effect;
    // it does not affect that call's own correct Lahiri output). We therefore re-assert
    // Lahiri immediately before reading the ayanamsa scalar. This is lab instrumentation,
    // not a production change. See report Discrepancy Register (global-state observation).
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
    const ayan = swisseph.swe_get_ayanamsa_ut(jd);
    instants[f.id] = { utcInstant, julianDayUt: jd };

    const byGraha = new Map(calc.data.planets.map((p) => [p.graha, p]));
    const bodies: Record<string, unknown> = {};
    for (const b of BODIES) {
      const p = byGraha.get(b);
      if (!p) continue;
      bodies[b] = {
        siderealLon: p.sidereal_longitude,
        tropicalLon: norm360(p.sidereal_longitude + ayan),
        lonSpeed: p.longitude_speed,
        retrograde: p.longitude_speed < 0,
        eclLat: null,
        distanceAu: null,
      };
    }
    const rahu = byGraha.get("RAHU");
    const ketu = byGraha.get("KETU");
    if (rahu) {
      bodies.RAHU = {
        siderealLon: rahu.sidereal_longitude,
        tropicalLon: norm360(rahu.sidereal_longitude + ayan),
        lonSpeed: rahu.longitude_speed,
        retrograde: rahu.longitude_speed < 0,
      };
    }
    if (ketu) {
      bodies.KETU = {
        siderealLon: ketu.sidereal_longitude,
        tropicalLon: norm360(ketu.sidereal_longitude + ayan),
        lonSpeed: ketu.longitude_speed,
        retrograde: ketu.longitude_speed < 0,
      };
    }

    results[f.id] = { utcInstant, julianDayUt: jd, ayanamsa: ayan, bodies };
  }

  const out = {
    provider: "current-engine",
    providerVersion: {
      swisseph: "0.5.17",
      seVersion: "2.09.03",
      productionFunction: "calculateCoreGrahaSiderealLongitudesAtUtc",
      ephemerisMode,
    },
    meta: {
      frame: "geocentric apparent, ecliptic of date (swisseph default)",
      ayanamsa: "LAHIRI (SE_SIDM_LAHIRI); ayanamsa scalar via swe_get_ayanamsa_ut",
      node: "SE_TRUE_NODE; Ketu = Rahu+180 (production convention, unchanged)",
    },
    results,
  };

  // Gate G2 support: production Lahiri ayanamsa sweep 1900..2100 (Jan 1 12:00 UTC).
  const sweep: Array<{ year: number; jd: number; ayanamsa: number }> = [];
  swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
  for (let year = 1900; year <= 2100; year += 1) {
    const jd = swisseph.swe_julday(year, 1, 1, 12, swisseph.SE_GREG_CAL);
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
    sweep.push({ year, jd, ayanamsa: swisseph.swe_get_ayanamsa_ut(jd) });
  }

  mkdirSync(join(LAB, "reports"), { recursive: true });
  writeFileSync(join(LAB, "reports", "current-engine-results.json"), JSON.stringify(out, null, 2));
  writeFileSync(join(LAB, "reports", "resolved-instants.json"), JSON.stringify(instants, null, 2));
  writeFileSync(
    join(LAB, "reports", "production-ayanamsa-sweep.json"),
    JSON.stringify({ mode: "LAHIRI", source: "swe_get_ayanamsa_ut", points: sweep }, null, 2)
  );
  console.log(
    `current-engine adapter: ${Object.keys(results).length} fixtures, ephemerisMode=${ephemerisMode}, ayanamsaSweep=${sweep.length}`
  );
}

main();
