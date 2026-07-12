// Card 11.R1 — Astronomy Engine SECONDARY comparator (isolated lab; MIT; pure JS).
// Reads the shared resolved instants and emits geocentric apparent ecliptic-of-date
// longitudes. NOT production truth; a triangulation/disagreement detector only.

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as Astronomy from "astronomy-engine";

const HERE = dirname(fileURLToPath(import.meta.url));
const LAB = join(HERE, "..", "..");
const REPORTS = join(LAB, "reports");
const DT = 0.02; // days, for speed finite-difference

const BODY: Record<string, Astronomy.Body> = {
  SUN: Astronomy.Body.Sun,
  MOON: Astronomy.Body.Moon,
  MERCURY: Astronomy.Body.Mercury,
  VENUS: Astronomy.Body.Venus,
  MARS: Astronomy.Body.Mars,
  JUPITER: Astronomy.Body.Jupiter,
  SATURN: Astronomy.Body.Saturn,
};

const RAD = 180 / Math.PI;
function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

/** Geocentric apparent ecliptic-of-date lon/lat/dist for a body at a JS Date. */
function eclOfDate(bodyName: string, when: Date): { lon: number; lat: number; dist: number } {
  const body = BODY[bodyName]!;
  const time = Astronomy.MakeTime(when);
  const vecEqj = Astronomy.GeoVector(body, time, true); // aberration + light-time, EQJ
  const rot = Astronomy.Rotation_EQJ_ECT(time); // EQJ -> ecliptic true of date
  const v = Astronomy.RotateVector(rot, vecEqj);
  const lon = norm360(Math.atan2(v.y, v.x) * RAD);
  const lat = Math.atan2(v.z, Math.hypot(v.x, v.y)) * RAD;
  const dist = Math.hypot(v.x, v.y, v.z);
  return { lon, lat, dist };
}

function main() {
  const instants = JSON.parse(readFileSync(join(REPORTS, "resolved-instants.json"), "utf-8")) as Record<
    string,
    { utcInstant: string; julianDayUt: number }
  >;

  const out = {
    provider: "astronomy-engine",
    providerVersion: { astronomyEngine: "2.1.19" },
    meta: {
      frame: "geocentric apparent, ecliptic true of date (Rotation_EQJ_ECT)",
      corrections: "light-time + aberration (GeoVector aberration=true); precession+nutation (ECT)",
      note: "Secondary comparator only; documented +/-1 arcminute design accuracy.",
    },
    results: {} as Record<string, unknown>,
  };

  for (const [fid, inst] of Object.entries(instants)) {
    const when = new Date(inst.utcInstant);
    const whenP = new Date(when.getTime() + DT * 86400000);
    const whenM = new Date(when.getTime() - DT * 86400000);
    const bodies: Record<string, unknown> = {};
    for (const name of Object.keys(BODY)) {
      const c = eclOfDate(name, when);
      const lonP = eclOfDate(name, whenP).lon;
      const lonM = eclOfDate(name, whenM).lon;
      const d = ((lonP - lonM + 540) % 360) - 180;
      const speed = d / (2 * DT);
      bodies[name] = {
        tropicalLon: c.lon,
        eclLat: c.lat,
        distanceAu: c.dist,
        lonSpeed: speed,
        retrograde: speed < 0,
      };
    }
    out.results[fid] = { utcInstant: inst.utcInstant, bodies };
  }

  writeFileSync(join(REPORTS, "astronomy-engine-results.json"), JSON.stringify(out, null, 2));
  console.log(`astronomy-engine adapter: ${Object.keys(out.results).length} fixtures`);
}

main();
