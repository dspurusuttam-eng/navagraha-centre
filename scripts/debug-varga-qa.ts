import assert from "node:assert/strict";

import {
  buildVargaChart,
  calculateVargaPlacement,
  vargaCodes,
  type VargaCode,
} from "@/modules/astrology/divisional/varga-engine";
import { buildDivisionalChartReadiness } from "@/modules/astrology/divisional/foundation";
import { zodiacSigns } from "@/modules/astrology/constants";

function sign(longitude: number, code: VargaCode) {
  const placement = calculateVargaPlacement(longitude, code);
  assert.ok(placement, `placement must exist for ${longitude} ${code}`);
  return placement.sign;
}

// --- 1. Golden table (hand-computed from the Card 4A BPHS contract) ---------

const golden: Record<string, Record<VargaCode, string>> = {
  // Cancer 10deg30' (S=3 even/movable/watery)
  "100.5": {
    D1: "CANCER", D2: "CANCER", D3: "SCORPIO", D4: "LIBRA", D7: "PISCES",
    D9: "LIBRA", D10: "GEMINI", D12: "SCORPIO", D16: "VIRGO", D20: "SCORPIO",
    D24: "PISCES", D27: "LIBRA", D30: "VIRGO", D40: "SAGITTARIUS",
    D45: "CANCER", D60: "ARIES",
  },
  // 0deg Aries (S=0 odd/movable/fiery, all part indexes 0)
  "0": {
    D1: "ARIES", D2: "LEO", D3: "ARIES", D4: "ARIES", D7: "ARIES",
    D9: "ARIES", D10: "ARIES", D12: "ARIES", D16: "ARIES", D20: "ARIES",
    D24: "LEO", D27: "ARIES", D30: "ARIES", D40: "ARIES", D45: "ARIES",
    D60: "ARIES",
  },
  // Pisces 29deg59'00" (S=11 even/dual/watery, near wrap-around)
  "359.9833333333333": {
    D1: "PISCES", D2: "LEO", D3: "SCORPIO", D4: "SAGITTARIUS", D7: "PISCES",
    D9: "PISCES", D10: "LEO", D12: "AQUARIUS", D16: "PISCES", D20: "PISCES",
    D24: "GEMINI", D27: "PISCES", D30: "SCORPIO", D40: "CAPRICORN",
    D45: "LEO", D60: "AQUARIUS",
  },
};

for (const [longitudeText, expectedByCode] of Object.entries(golden)) {
  const longitude = Number(longitudeText);

  for (const code of vargaCodes) {
    assert.equal(
      sign(longitude, code),
      expectedByCode[code],
      `golden ${longitudeText} ${code}`
    );
  }
}

// --- 2. Boundary matrix (exact part boundary belongs to the NEXT part) ------

// D9 Aries 3deg20' boundary
assert.equal(sign(12000 / 3600, "D9"), "TAURUS");
assert.equal(sign(11999 / 3600, "D9"), "ARIES");
assert.equal(sign(12001 / 3600, "D9"), "TAURUS");
// D2 15deg boundary (odd sign: Leo -> Cancer)
assert.equal(sign(15.0, "D2"), "CANCER");
assert.equal(sign(53999 / 3600, "D2"), "LEO");
// D4 7deg30' boundary
assert.equal(sign(7.5, "D4"), "CANCER");
assert.equal(sign(26999 / 3600, "D4"), "ARIES");
// D7 irrational boundary (30/7 deg = 15428.57...") — arc-second determinism
assert.equal(sign(15428 / 3600, "D7"), "ARIES");
assert.equal(sign(15429 / 3600, "D7"), "TAURUS");
// D60 0deg30' boundary
assert.equal(sign(0.5, "D60"), "TAURUS");
assert.equal(sign(1799 / 3600, "D60"), "ARIES");
// Wrap-around normalization
assert.equal(sign(360, "D1"), "ARIES");
assert.equal(sign(-0.5 / 3600, "D1"), "ARIES"); // rounds up across 360 -> 0

// --- 3. D30 Trimshamsha breakpoints (unequal bands) --------------------------

// Odd sign (Aries): 5/10/18/25 boundaries
assert.equal(sign(17999 / 3600, "D30"), "ARIES");
assert.equal(sign(5.0, "D30"), "AQUARIUS");
assert.equal(sign(10.0, "D30"), "SAGITTARIUS");
assert.equal(sign(18.0, "D30"), "GEMINI");
assert.equal(sign(25.0, "D30"), "LIBRA");
assert.equal(sign(29.999, "D30"), "LIBRA");
// Even sign (Taurus, +30): 5/12/20/25 boundaries
assert.equal(sign(30 + 17999 / 3600, "D30"), "TAURUS"); // 4deg59'59" into Taurus
assert.equal(sign(34.999, "D30"), "TAURUS");
assert.equal(sign(35.0, "D30"), "VIRGO");
assert.equal(sign(42.0, "D30"), "PISCES");
assert.equal(sign(50.0, "D30"), "CAPRICORN");
assert.equal(sign(55.0, "D30"), "SCORPIO");
assert.equal(sign(59.999, "D30"), "SCORPIO");

// --- 4. Class-rule cross-checks across all 12 signs --------------------------

for (let signIndex = 0; signIndex < 12; signIndex += 1) {
  const start = signIndex * 30 + 0.001; // just inside the sign, part 0
  const odd = signIndex % 2 === 0;
  const modality = signIndex % 3 === 0 ? "movable" : signIndex % 3 === 1 ? "fixed" : "dual";

  // D9 start: movable -> itself, fixed -> 9th, dual -> 5th
  const d9Expected =
    modality === "movable"
      ? signIndex
      : modality === "fixed"
        ? (signIndex + 8) % 12
        : (signIndex + 4) % 12;
  assert.equal(sign(start, "D9"), zodiacSigns[d9Expected], `D9 start S=${signIndex}`);

  // D3 decans: same, 5th, 9th
  assert.equal(sign(start, "D3"), zodiacSigns[signIndex]);
  assert.equal(sign(signIndex * 30 + 10.001, "D3"), zodiacSigns[(signIndex + 4) % 12]);
  assert.equal(sign(signIndex * 30 + 20.001, "D3"), zodiacSigns[(signIndex + 8) % 12]);

  // D7 part 0: odd -> itself, even -> 7th
  assert.equal(
    sign(start, "D7"),
    zodiacSigns[odd ? signIndex : (signIndex + 6) % 12],
    `D7 start S=${signIndex}`
  );

  // D10 part 0: odd -> itself, even -> 9th
  assert.equal(
    sign(start, "D10"),
    zodiacSigns[odd ? signIndex : (signIndex + 8) % 12],
    `D10 start S=${signIndex}`
  );

  // D16 / D45 modality starts: Aries / Leo / Sagittarius
  const d16Start = modality === "movable" ? 0 : modality === "fixed" ? 4 : 8;
  assert.equal(sign(start, "D16"), zodiacSigns[d16Start], `D16 start S=${signIndex}`);
  assert.equal(sign(start, "D45"), zodiacSigns[d16Start], `D45 start S=${signIndex}`);

  // D20 modality starts: Aries / Sagittarius / Leo
  const d20Start = modality === "movable" ? 0 : modality === "fixed" ? 8 : 4;
  assert.equal(sign(start, "D20"), zodiacSigns[d20Start], `D20 start S=${signIndex}`);

  // D24 parity starts: odd -> Leo, even -> Cancer
  assert.equal(sign(start, "D24"), zodiacSigns[odd ? 4 : 3], `D24 start S=${signIndex}`);

  // D40 parity starts: odd -> Aries, even -> Libra
  assert.equal(sign(start, "D40"), zodiacSigns[odd ? 0 : 6], `D40 start S=${signIndex}`);

  // D12 / D60 count from the sign itself
  assert.equal(sign(start, "D12"), zodiacSigns[signIndex]);
  assert.equal(sign(start, "D60"), zodiacSigns[signIndex]);
}

// --- 5. Invalid input never fabricates ---------------------------------------

assert.equal(calculateVargaPlacement(Number.NaN, "D9"), null);
assert.equal(calculateVargaPlacement(Number.POSITIVE_INFINITY, "D60"), null);

// --- 6. Node behavior --------------------------------------------------------

// Nodes 180deg apart remain opposite in D9 (structural invariant)...
const rahuD9 = calculateVargaPlacement(100.5, "D9");
const ketuD9 = calculateVargaPlacement(280.5, "D9");
assert.ok(rahuD9 && ketuD9);
assert.equal((rahuD9.signIndex - ketuD9.signIndex + 12) % 12, 6);
// ...but NOT necessarily opposite in every varga (correct classical behavior):
// D30 of 41deg (Taurus 11) and 221deg (Scorpio 11) both land in Virgo.
assert.equal(sign(41, "D30"), "VIRGO");
assert.equal(sign(221, "D30"), "VIRGO");

// --- 7. Varga chart assembly + readiness integration ------------------------

const sourceChart = {
  lagna: { sign: "CANCER", longitude: 100.5, degree_in_sign: 10.5 },
  houses: Array.from({ length: 12 }, (_, index) => ({
    house: (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
    sign: zodiacSigns[(3 + index) % 12],
  })),
  planets: [
    {
      name: "Sun",
      sign: "ARIES",
      longitude: 1.0,
      degree_in_sign: 1.0,
      nakshatra: "Ashwini",
      pada: 1,
      is_retrograde: false,
      house: 10 as const,
    },
    {
      name: "Moon",
      sign: "CANCER",
      longitude: 100.5,
      degree_in_sign: 10.5,
      nakshatra: "Pushya",
      pada: 3,
      is_retrograde: false,
      house: 1 as const,
    },
    {
      name: "Rahu",
      sign: "TAURUS",
      longitude: 41.0,
      degree_in_sign: 11.0,
      nakshatra: "Rohini",
      pada: 1,
      is_retrograde: true,
      house: 11 as const,
    },
    {
      name: "Ketu",
      sign: "SCORPIO",
      longitude: 221.0,
      degree_in_sign: 11.0,
      nakshatra: "Anuradha",
      pada: 3,
      is_retrograde: true,
      house: 5 as const,
    },
    {
      name: "Uranus",
      sign: "LIBRA",
      longitude: 200.0,
      degree_in_sign: 20.0,
      nakshatra: "Vishakha",
      pada: 1,
      is_retrograde: false,
      house: 4 as const,
    },
  ],
};

const d9Chart = buildVargaChart(sourceChart, "D9");
assert.ok(d9Chart);
if (d9Chart) {
  assert.equal(d9Chart.ascendant.sign, "LIBRA");
  assert.equal(d9Chart.houses[0].sign, "LIBRA");
  assert.equal(d9Chart.houses.length, 12);
  const sun = d9Chart.planets.find((planet) => planet.body === "Sun");
  const moon = d9Chart.planets.find((planet) => planet.body === "Moon");
  assert.ok(sun && moon);
  assert.equal(sun?.sign, "ARIES"); // 1deg Aries -> first navamsha -> Aries
  assert.equal(sun?.house, 7); // Aries is 7th from Libra ascendant
  assert.equal(moon?.sign, "LIBRA");
  assert.equal(moon?.house, 1);
  // Outer planet excluded from varga charts (classical bodies only)
  assert.equal(
    d9Chart.planets.some((planet) => planet.body.toUpperCase() === "URANUS"),
    false
  );
}

const readiness = buildDivisionalChartReadiness(sourceChart);
assert.equal(readiness.length, 16);
assert.deepEqual(
  readiness.map((entry) => entry.code),
  [...vargaCodes]
);
for (const entry of readiness) {
  assert.equal(entry.status, "available", `${entry.code} must be available`);
  assert.ok(entry.chart, `${entry.code} chart must exist`);
}

// D1 preserves legacy behavior: full planet list (incl. Uranus) + nakshatra kept.
const d1Entry = readiness.find((entry) => entry.code === "D1");
assert.ok(d1Entry?.chart);
assert.equal(d1Entry?.chart?.planets.length, 5);
assert.equal(d1Entry?.chart?.planets[0]?.nakshatra, "Ashwini");
assert.equal(d1Entry?.chart?.ascendantSign, "CANCER");

// Non-D1 charts: classical bodies only, nakshatra/pada never fabricated.
const d10Entry = readiness.find((entry) => entry.code === "D10");
assert.ok(d10Entry?.chart);
assert.equal(d10Entry?.chart?.planets.length, 4);
assert.ok(d10Entry?.chart?.planets.every((planet) => planet.nakshatra === null));

// Vargottama meta on the D9 entry: Sun at 1deg Aries is vargottama.
const d9Entry = readiness.find((entry) => entry.code === "D9");
assert.ok(d9Entry?.meta?.vargottamaBodies?.includes("SUN"));
assert.equal(d9Entry?.meta?.vargottamaBodies?.includes("MOON"), false);

// Missing chart context -> 16 honest unavailable entries, no fabrication.
const unavailable = buildDivisionalChartReadiness(null);
assert.equal(unavailable.length, 16);
for (const entry of unavailable) {
  assert.equal(entry.status, "unavailable");
  assert.equal(entry.chart, null);
}

console.log(
  "varga QA: golden table, boundaries, D30 bands, class rules, nodes, assembly, and readiness checks passed for all 16 vargas."
);
