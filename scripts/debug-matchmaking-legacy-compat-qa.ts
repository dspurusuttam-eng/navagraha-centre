/**
 * Card 10.2 — Legacy matchmaking consumer compatibility QA.
 *
 * Proves the existing `buildGunaMilanFoundation` contract still holds after the
 * foundation was rewired to delegate to the premium engine, AND that consumers
 * now receive CORRECTED Bhakoot/Nadi/Gana values (no old formula path remains).
 * Charts carry real Moon longitudes (the numeric adapter requires them).
 */

import assert from "node:assert/strict";

import {
  buildGunaMilanFoundation,
  type MatchmakingFoundationSnapshot,
} from "@/modules/astrology/matchmaking";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";

function makeChart(moonLongitude: number, marsSign: number): UnifiedSiderealChart {
  const mk = (name: string, longitude: number) => ({
    name,
    longitude,
    sign: "ARIES",
    degree_in_sign: longitude % 30,
    nakshatra: "IGNORED",
    pada: 1,
    is_retrograde: false,
    is_combust: false,
    house: 1,
  });

  return {
    birth_context: {
      date_local: "1990-01-01", time_local: "12:00", place: "Test",
      latitude: 26, longitude: 91, timezone: "Asia/Kolkata",
      birth_utc: "1990-01-01T06:30:00.000Z",
    },
    settings: { zodiac: "sidereal", ayanamsha: "LAHIRI", house_system: "whole_sign" },
    lagna: { longitude: 15, sign: "ARIES", degree_in_sign: 15 },
    houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: "ARIES" })),
    planets: [
      mk("MOON", moonLongitude),
      mk("MARS", marsSign * 30 + 15),
      mk("VENUS", 15),
    ],
    verification: {
      is_verified_for_chart_logic: true,
      verification_status: "VERIFIED",
      warnings: [],
      errors: [],
    },
  } as UnifiedSiderealChart;
}

function data(snapshot: MatchmakingFoundationSnapshot) {
  assert.ok(snapshot.data, "foundation data must be present");
  return snapshot.data!;
}

// Person A Moon in Aries (sign 0), Person B Moon in Taurus (sign 1).
// Distance 2/12 -> Bhakoot dosha (raw 0). The OLD code used abs(0-1)=1 which
// was ALSO in its dosha set, but the old code additionally (wrongly) flagged
// same-sign; the corrected engine flags 2/12 correctly and same-sign never.
const chartA = makeChart(15, 0); // Aries 15 -> Ashwini
const chartB = makeChart(45, 3); // Taurus 15 -> Krittika region

const result = buildGunaMilanFoundation({
  personA: { chart: chartA, savedKundliId: "saved-kundli-a", label: "Person A" },
  personB: { chart: chartB, savedKundliId: "saved-kundli-b", label: "Person B" },
  asOfDateUtc: new Date("2026-05-09T00:00:00.000Z"),
});

// --- Contract shape unchanged --------------------------------------------------
assert.equal(result.status, "partial", "legacy status remains partial (Varna needs roles)");
const d = data(result);
assert.equal(d.kootaBreakdown.length, 8, "8 kootas present");
assert.equal(d.comparisonType, "GUNA_MILAN");
assert.equal(d.personA.chartAvailable, true);
assert.equal(d.personA.savedKundliId, "saved-kundli-a");
assert.equal(d.personB.savedKundliId, "saved-kundli-b");
assert.ok((d.matchScore ?? -1) >= 0, "matchScore present");
assert.ok((d.maxScore ?? 0) > 0, "maxScore present");
assert.equal(typeof d.compatibilityInsights.emotionalCompatibility, "string");
assert.equal(typeof d.compatibilityInsights.reportSummary, "string");
assert.equal(d.manglikAnalysis.personA.status, "ready");
assert.equal(d.manglikAnalysis.personA.lagnaCheck.status, "ready");

// --- Corrected calculations reach the consumer --------------------------------
const bhakoot = d.kootaBreakdown.find((k) => k.key === "BHAKOOT")!;
assert.equal(bhakoot.status, "ready");
assert.equal(bhakoot.score, 0, "corrected Bhakoot: Aries/Taurus (2/12) is a dosha -> 0");

const nadi = d.kootaBreakdown.find((k) => k.key === "NADI")!;
assert.equal(nadi.status, "ready", "Nadi now computed via corrected 3x9 table");
assert.ok(nadi.score === 0 || nadi.score === 8, "Nadi raw is 0 or 8");

const gana = d.kootaBreakdown.find((k) => k.key === "GANA")!;
assert.equal(gana.status, "ready", "Gana computed via corrected 9/9/9 map");

// Vashya + Yoni are now populated (were pending in the old foundation).
const vashya = d.kootaBreakdown.find((k) => k.key === "VASHYA")!;
const yoni = d.kootaBreakdown.find((k) => k.key === "YONI")!;
assert.equal(vashya.status, "ready", "Vashya now populated (was pending)");
assert.equal(yoni.status, "ready", "Yoni now populated (was pending)");

// Varna remains pending in the role-less legacy contract (documented limitation).
const varna = d.kootaBreakdown.find((k) => k.key === "VARNA")!;
assert.equal(varna.status, "pending", "Varna pending (directional; needs roles)");

// --- Same-sign is NOT a Bhakoot dosha (the old bug) ---------------------------
const sameSign = buildGunaMilanFoundation({
  personA: { chart: makeChart(15, 0), label: "A" },
  personB: { chart: makeChart(20, 0), label: "B" }, // both Aries Moon
});
const sameSignBhakoot = data(sameSign).kootaBreakdown.find((k) => k.key === "BHAKOOT")!;
assert.equal(sameSignBhakoot.score, 7, "same Moon sign must NOT be Bhakoot dosha (old bug fixed)");

// --- No forbidden prose --------------------------------------------------------
const text = JSON.stringify(d).toLowerCase();
for (const term of ["guaranteed", "will divorce", "infertil", "caste", "gemstone", "perfect match"]) {
  assert.ok(!text.includes(term), `forbidden term in legacy output: ${term}`);
}

process.stdout.write(
  JSON.stringify(
    {
      status: result.status,
      matchScore: d.matchScore,
      maxScore: d.maxScore,
      bhakoot: bhakoot.score,
      nadi: nadi.score,
      gana: gana.score,
      vashya: vashya.score,
      yoni: yoni.score,
      varnaStatus: varna.status,
      sameSignBhakoot: sameSignBhakoot.score,
      manglikA: d.manglikAnalysis.personA.overallStatus,
      legacyCompat: "PASS",
    },
    null,
    2
  ) + "\n"
);
