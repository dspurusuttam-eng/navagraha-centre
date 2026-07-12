// Card 11.R1 — performance benchmark (informational only; does NOT authorize any
// production provider selection). Benchmarks the Astronomy Engine comparator and the
// Skyfield oracle here; the current-engine (swisseph, Node 22) timing is measured by
// its own adapter run and recorded in the report. Isolated lab only.

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const _req = createRequire(import.meta.url);
const Astronomy = _req("astronomy-engine") as typeof import("astronomy-engine");

const HERE = dirname(fileURLToPath(import.meta.url));
const REPORTS = join(HERE, "..", "..", "reports");

const BODY = [
  Astronomy.Body.Sun, Astronomy.Body.Moon, Astronomy.Body.Mercury, Astronomy.Body.Venus,
  Astronomy.Body.Mars, Astronomy.Body.Jupiter, Astronomy.Body.Saturn,
];

function oneChart(when: Date): number {
  const time = Astronomy.MakeTime(when);
  const rot = Astronomy.Rotation_EQJ_ECT(time);
  let acc = 0;
  for (const b of BODY) {
    const v = Astronomy.RotateVector(rot, Astronomy.GeoVector(b, time, true));
    acc += Math.atan2(v.y, v.x);
  }
  return acc;
}

function timeIt(n: number): { totalMs: number; perChartMs: number } {
  const base = Date.UTC(2000, 0, 1, 12);
  const t0 = performance.now();
  for (let i = 0; i < n; i++) oneChart(new Date(base + i * 86400000));
  const totalMs = performance.now() - t0;
  return { totalMs, perChartMs: totalMs / n };
}

function main() {
  // warm-up
  timeIt(5);
  const init = (() => {
    const t0 = performance.now();
    Astronomy.MakeTime(new Date());
    return performance.now() - t0;
  })();
  const b1 = timeIt(1);
  const b10 = timeIt(10);
  const b100 = timeIt(100);
  const mem = process.memoryUsage();

  const out = {
    provider: "astronomy-engine",
    node: process.version,
    platform: process.platform,
    initMs: init,
    single: b1,
    batch10: b10,
    batch100: b100,
    rssMB: +(mem.rss / 1048576).toFixed(1),
    heapUsedMB: +(mem.heapUsed / 1048576).toFixed(1),
    note: "Pure in-process JS; no kernel load; informational. Skyfield/current-engine timings recorded separately in the report.",
  };
  writeFileSync(join(REPORTS, "benchmark-astronomy-engine.json"), JSON.stringify(out, null, 2));
  console.log(
    `astronomy-engine bench: init=${init.toFixed(2)}ms single=${b1.perChartMs.toFixed(3)}ms/chart ` +
      `batch100=${b100.perChartMs.toFixed(3)}ms/chart rss=${out.rssMB}MB`
  );
}

main();
