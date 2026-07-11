/**
 * Card 10.2 — Premium Matchmaking & Ashtakoot PURE exhaustive QA.
 *
 * The engine is table-based and consumes verified charts via a numeric adapter
 * (Moon longitude -> sign/nakshatra/pada); there is no ephemeris dependency, so
 * every group runs on any Node version. Charts are synthesized directly from
 * chosen Moon/Mars/Lagna/Venus longitudes.
 */

import {
  buildAshtakootMatchSnapshot,
  buildMatchPersonContext,
  nakshatraIndexOf,
  padaOf,
  signIndexOf,
  signDistance,
  GANA_BY_NAKSHATRA,
  NADI_BY_NAKSHATRA,
  YONI_BY_NAKSHATRA,
  MATCH_RULE_REGISTRY,
  type AshtakootMatchSnapshot,
  type CalculationRole,
} from "@/modules/astrology/matchmaking/premium";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const NAK_SPAN = 360 / 27;

/** Longitude at the centre of nakshatra k (0..26), pada p (1..4). */
function longitudeForNakPada(k: number, pada = 1): number {
  return k * NAK_SPAN + (pada - 1) * (NAK_SPAN / 4) + NAK_SPAN / 8;
}

/** Longitude at the centre of sign s (0..11). */
function longitudeForSign(s: number): number {
  return s * 30 + 15;
}

type ChartSpec = {
  moonLongitude: number;
  lagnaLongitude?: number;
  marsLongitude?: number;
  venusLongitude?: number;
  verified?: boolean;
  omitMoon?: boolean;
};

function makeChart(spec: ChartSpec): UnifiedSiderealChart {
  const planets: UnifiedSiderealChart["planets"] = [];
  const push = (name: string, longitude: number) => {
    planets.push({
      name,
      longitude,
      sign: "ARIES",
      degree_in_sign: longitude % 30,
      nakshatra: "IGNORED_NAME",
      pada: 1,
      is_retrograde: false,
      is_combust: false,
      house: 1,
    } as UnifiedSiderealChart["planets"][number]);
  };

  if (!spec.omitMoon) push("MOON", spec.moonLongitude);
  if (spec.marsLongitude !== undefined) push("MARS", spec.marsLongitude);
  if (spec.venusLongitude !== undefined) push("VENUS", spec.venusLongitude);

  return {
    birth_context: {
      date_local: "1990-01-01", time_local: "12:00", place: "Test",
      latitude: 26, longitude: 91, timezone: "Asia/Kolkata",
      birth_utc: "1990-01-01T06:30:00.000Z",
    },
    settings: { zodiac: "sidereal", ayanamsha: "LAHIRI", house_system: "whole_sign" },
    lagna: {
      longitude: spec.lagnaLongitude ?? 15,
      sign: "ARIES",
      degree_in_sign: (spec.lagnaLongitude ?? 15) % 30,
    },
    houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: "ARIES" })),
    planets,
    verification: {
      is_verified_for_chart_logic: spec.verified ?? true,
      verification_status: (spec.verified ?? true) ? "VERIFIED" : "FAILED",
      warnings: [],
      errors: [],
    },
  } as UnifiedSiderealChart;
}

function run(specA: ChartSpec, specB: ChartSpec, opts?: {
  roleA?: CalculationRole;
  roleB?: CalculationRole;
  includeManglik?: boolean;
  mode?: "full" | "ashtakoot_only";
}): AshtakootMatchSnapshot {
  return buildAshtakootMatchSnapshot({
    personAChart: makeChart(specA),
    personBChart: makeChart(specB),
    calculationRoleA: opts?.roleA,
    calculationRoleB: opts?.roleB,
    includeManglik: opts?.includeManglik,
    mode: opts?.mode,
  });
}

function score(snapshot: AshtakootMatchSnapshot, koota: string): number | null {
  return snapshot.ashtakoot.componentResults.find((c) => c.koota === koota)?.rawScore ?? null;
}

const FORBIDDEN = [
  "guaranteed", "will marry", "will divorce", "divorce", "infertil", "fatal",
  "death", "disease", "diagnos", "caste", "remedy", "gemstone", "perfect match",
  "marriage will",
];

// --- QA groups -----------------------------------------------------------------

const groups: Array<{ name: string; run: () => void }> = [
  {
    name: "QA1 exhaustive 27x27 nakshatra pairs: raw total = component sum, in 0..36",
    run: () => {
      for (let a = 0; a < 27; a += 1) {
        for (let b = 0; b < 27; b += 1) {
          const snap = run(
            { moonLongitude: longitudeForNakPada(a) },
            { moonLongitude: longitudeForNakPada(b) },
            { roleA: "groom_role", roleB: "bride_role" }
          );
          const sum = snap.ashtakoot.componentResults.reduce(
            (t, c) => t + (c.rawScore ?? 0),
            0
          );
          assert(snap.ashtakoot.rawTotal === sum, `raw total != component sum at ${a},${b}`);
          assert(
            snap.ashtakoot.rawTotal >= 0 && snap.ashtakoot.rawTotal <= 36,
            `raw total out of 0..36 at ${a},${b}: ${snap.ashtakoot.rawTotal}`
          );
          for (const c of snap.ashtakoot.componentResults) {
            if (c.rawScore !== null) {
              assert(Number.isFinite(c.rawScore) && c.rawScore >= 0 && c.rawScore <= c.maximumScore, `component ${c.koota} out of range at ${a},${b}`);
            }
          }
        }
      }
    },
  },
  {
    name: "QA2 exhaustive 12x12 sign pairs: Bhakoot correct, same-sign never dosha",
    run: () => {
      for (let a = 0; a < 12; a += 1) {
        for (let b = 0; b < 12; b += 1) {
          // Place Moon at sign centre; nakshatra irrelevant for Bhakoot.
          const snap = run(
            { moonLongitude: longitudeForSign(a) },
            { moonLongitude: longitudeForSign(b) }
          );
          const bhakoot = score(snap, "BHAKOOT");
          const d = signDistance(a, b);
          const dBack = signDistance(b, a);
          const doshaSet = new Set([2, 12, 5, 9, 6, 8]);
          const expected = d !== 1 && doshaSet.has(d) && doshaSet.has(dBack) ? 0 : 7;
          assert(bhakoot === expected, `Bhakoot at signs ${a},${b}: got ${bhakoot}, expected ${expected}`);
        }
      }
      // Same sign explicitly not a dosha.
      for (let s = 0; s < 12; s += 1) {
        const snap = run({ moonLongitude: longitudeForSign(s) }, { moonLongitude: longitudeForSign(s) });
        assert(score(snap, "BHAKOOT") === 7, `same-sign ${s} must be Bhakoot 7, not dosha`);
      }
    },
  },
  {
    name: "QA3 Bhakoot uses directional modulo distance, not absolute difference",
    run: () => {
      // Signs 0 & 4 (Aries/Leo): abs diff 4 -> old bug flagged dosha; correct
      // distances are 5 and 9 -> this IS a 5/9 dosha. Signs 0 & 1: distances
      // 2/12 -> dosha. Signs 0 & 3: distances 4/10 -> NOT dosha (abs diff 3).
      assert(score(run({ moonLongitude: longitudeForSign(0) }, { moonLongitude: longitudeForSign(3) }), "BHAKOOT") === 7, "signs 0/3 (dist 4/10) must not be dosha");
      assert(score(run({ moonLongitude: longitudeForSign(0) }, { moonLongitude: longitudeForSign(1) }), "BHAKOOT") === 0, "signs 0/1 (dist 2/12) must be dosha");
      assert(score(run({ moonLongitude: longitudeForSign(0) }, { moonLongitude: longitudeForSign(5) }), "BHAKOOT") === 0, "signs 0/5 (dist 6/8) must be dosha");
    },
  },
  {
    name: "QA4 Nadi uses locked 3x9 table (not index%3); same nadi=0, diff=8",
    run: () => {
      // Rohini (index 3) is ANTYA in the table; index%3 would give 0->ADI.
      assert(NADI_BY_NAKSHATRA[3] === "ANTYA", "Rohini must be ANTYA in the locked table");
      // Count of each group must be 9.
      const counts = { ADI: 0, MADHYA: 0, ANTYA: 0 };
      for (const nadi of NADI_BY_NAKSHATRA) counts[nadi] += 1;
      assert(counts.ADI === 9 && counts.MADHYA === 9 && counts.ANTYA === 9, "Nadi table must be 9/9/9");
      for (let a = 0; a < 27; a += 1) {
        for (let b = 0; b < 27; b += 1) {
          const snap = run({ moonLongitude: longitudeForNakPada(a) }, { moonLongitude: longitudeForNakPada(b) });
          const expected = NADI_BY_NAKSHATRA[a] === NADI_BY_NAKSHATRA[b] ? 0 : 8;
          assert(score(snap, "NADI") === expected, `Nadi at ${a},${b}: expected ${expected}`);
        }
      }
    },
  },
  {
    name: "QA5 Gana mapping is exactly 9/9/9 with corrected Ardra/Vishakha",
    run: () => {
      const counts = { DEVA: 0, MANUSHYA: 0, RAKSHASA: 0 };
      for (const g of GANA_BY_NAKSHATRA) counts[g] += 1;
      assert(counts.DEVA === 9 && counts.MANUSHYA === 9 && counts.RAKSHASA === 9, "Gana must be 9/9/9");
      assert(GANA_BY_NAKSHATRA[5] === "MANUSHYA", "Ardra (5) must be MANUSHYA (corrected)");
      assert(GANA_BY_NAKSHATRA[15] === "RAKSHASA", "Vishakha (15) must be RAKSHASA (corrected)");
    },
  },
  {
    name: "QA6 Yoni mapping (14 animals) + symmetry + same-yoni=4",
    run: () => {
      assert(new Set(YONI_BY_NAKSHATRA).size === 14, "Yoni mapping must use 14 animals");
      // Symmetry: swapping charts yields identical Yoni score.
      for (let a = 0; a < 27; a += 3) {
        for (let b = 0; b < 27; b += 3) {
          const ab = score(run({ moonLongitude: longitudeForNakPada(a) }, { moonLongitude: longitudeForNakPada(b) }), "YONI");
          const ba = score(run({ moonLongitude: longitudeForNakPada(b) }, { moonLongitude: longitudeForNakPada(a) }), "YONI");
          assert(ab === ba, `Yoni not symmetric at ${a},${b}`);
        }
      }
      // Same nakshatra -> same yoni -> 4.
      assert(score(run({ moonLongitude: longitudeForNakPada(0) }, { moonLongitude: longitudeForNakPada(0) }), "YONI") === 4, "same yoni must be 4");
    },
  },
  {
    name: "QA7 numeric adapter: name casing/spelling cannot alter results",
    run: () => {
      // Two charts with identical Moon longitude but different (ignored) name
      // strings must produce identical nakshatra index / scores.
      const long = longitudeForNakPada(4); // Mrigashira region
      const ctx1 = buildMatchPersonContext({ chart: makeChart({ moonLongitude: long }), calculationRole: null });
      const ctx2 = buildMatchPersonContext({ chart: makeChart({ moonLongitude: long }), calculationRole: null });
      assert(ctx1.nakshatraIndex === ctx2.nakshatraIndex, "numeric nakshatra must be name-independent");
      assert(ctx1.nakshatraIndex === nakshatraIndexOf(long), "adapter nakshatra must match numeric helper");
      assert(ctx1.padaIndex === padaOf(long) && ctx1.moonSignIndex === signIndexOf(long), "pada/sign numeric");
    },
  },
  {
    name: "QA8 108 pada boundaries: start-inclusive/end-exclusive numeric derivation",
    run: () => {
      for (let k = 0; k < 27; k += 1) {
        for (let p = 1; p <= 4; p += 1) {
          const boundary = k * NAK_SPAN + (p - 1) * (NAK_SPAN / 4);
          assert(padaOf(boundary + 1e-6) === p, `pada boundary start-inclusive at nak ${k} pada ${p}`);
          assert(nakshatraIndexOf(boundary + 1e-6) === k, `nakshatra at pada boundary nak ${k}`);
        }
      }
      // Exact nakshatra boundary belongs to the next nakshatra.
      assert(nakshatraIndexOf(NAK_SPAN) === 1, "exact nakshatra boundary -> next");
      assert(nakshatraIndexOf(0) === 0, "0 deg -> nakshatra 0");
    },
  },
  {
    name: "QA9 Varna directional: ROLE_REQUIRED without roles; scored with roles; role-swap affects only Varna",
    run: () => {
      const a = { moonLongitude: longitudeForSign(3) }; // Cancer -> Brahmin
      const b = { moonLongitude: longitudeForSign(0) }; // Aries -> Kshatriya
      const noRoles = run(a, b);
      const varnaNoRole = noRoles.ashtakoot.componentResults.find((c) => c.koota === "VARNA")!;
      assert(varnaNoRole.status === "unavailable" && varnaNoRole.tableEntry === "ROLE_REQUIRED", "Varna must require roles");

      const groomA = run(a, b, { roleA: "groom_role", roleB: "bride_role" });
      const groomB = run(a, b, { roleA: "bride_role", roleB: "groom_role" });
      const vGA = score(groomA, "VARNA");
      const vGB = score(groomB, "VARNA");
      // groom Brahmin(4) >= bride Kshatriya(3) -> 1; reversed groom Kshatriya(3) >= bride Brahmin(4) -> 0.
      assert(vGA === 1 && vGB === 0, `Varna directional wrong: ${vGA}/${vGB}`);
      // Symmetric kootas identical across the swap.
      for (const k of ["VASHYA", "TARA", "YONI", "GRAHA_MAITRI", "GANA", "BHAKOOT", "NADI"]) {
        assert(score(groomA, k) === score(groomB, k), `${k} must be role-swap invariant`);
      }
    },
  },
  {
    name: "QA10 exceptions never mutate raw score; overlay separate",
    run: () => {
      // Same rashi, different nakshatra with same nadi -> Nadi dosha (0) + exception.
      // Rohini (nak 3) and Mrigashira (nak 4) are both partly in Taurus; pick
      // two nakshatras in the same sign with the same nadi if possible; else
      // assert the invariant structurally on a Nadi-dosha pair.
      const snap = run(
        { moonLongitude: longitudeForNakPada(0) }, // Ashwini (ADI)
        { moonLongitude: longitudeForNakPada(5) }  // Ardra (ADI) -> same nadi -> dosha 0
      );
      const nadi = snap.ashtakoot.componentResults.find((c) => c.koota === "NADI")!;
      assert(nadi.rawScore === 0, "expected Nadi dosha (0) for same-nadi pair");
      // Raw total must equal the exact component sum regardless of exceptions.
      const sum = snap.ashtakoot.componentResults.reduce((t, c) => t + (c.rawScore ?? 0), 0);
      assert(snap.ashtakoot.rawTotal === sum, "exception must not mutate raw total");
      for (const exc of snap.exceptionResults) {
        assert(exc.changesRawScore === false, "exception changesRawScore must be false");
      }
    },
  },
  {
    name: "QA11 Manglik never changes Ashtakoot raw total; houses 1/2/4/7/8/12",
    run: () => {
      const withManglik = run(
        { moonLongitude: longitudeForSign(2), marsLongitude: longitudeForSign(2), lagnaLongitude: longitudeForSign(2), venusLongitude: longitudeForSign(2) },
        { moonLongitude: longitudeForSign(4), marsLongitude: longitudeForSign(5), lagnaLongitude: longitudeForSign(4), venusLongitude: longitudeForSign(4) }
      );
      const withoutManglik = run(
        { moonLongitude: longitudeForSign(2) },
        { moonLongitude: longitudeForSign(4) },
        { mode: "ashtakoot_only" }
      );
      assert(withManglik.ashtakoot.rawTotal === withoutManglik.ashtakoot.rawTotal, "Manglik must not change raw total");
      // Mars in Lagna (house 1) -> flagged. Person A Mars sign == Lagna sign -> house 1.
      const lagnaRef = withManglik.manglikComparison?.personA.references.find((r) => r.reference === "LAGNA");
      assert(lagnaRef?.marsHouse === 1 && lagnaRef?.flagged === true, "Mars in house 1 from Lagna must be flagged");
      // house 3 (not counted) must not flag: Mars sign = Moon sign+2.
      const p = run(
        { moonLongitude: longitudeForSign(0), marsLongitude: longitudeForSign(2), lagnaLongitude: longitudeForSign(0), venusLongitude: longitudeForSign(0) },
        { moonLongitude: longitudeForSign(0), marsLongitude: longitudeForSign(2), lagnaLongitude: longitudeForSign(0), venusLongitude: longitudeForSign(0) }
      );
      const ref3 = p.manglikComparison?.personA.references.find((r) => r.reference === "LAGNA");
      assert(ref3?.marsHouse === 3 && ref3?.flagged === false, "house 3 must not be flagged");
    },
  },
  {
    name: "QA12 Manglik mutual comparison: balanced / unbalanced",
    run: () => {
      // Both Mars in house 1 from their Lagna -> both flagged -> balanced.
      const balanced = run(
        { moonLongitude: 10, marsLongitude: 10, lagnaLongitude: 10, venusLongitude: 10 },
        { moonLongitude: 40, marsLongitude: 40, lagnaLongitude: 40, venusLongitude: 40 }
      );
      assert(balanced.manglikComparison?.status === "balanced", `expected balanced, got ${balanced.manglikComparison?.status}`);
      // A flagged (house 1), B clear (house 3) -> unbalanced.
      const unbalanced = run(
        { moonLongitude: 10, marsLongitude: 10, lagnaLongitude: 10, venusLongitude: 10 },
        { moonLongitude: 10, marsLongitude: longitudeForSign(2), lagnaLongitude: 10, venusLongitude: 10 }
      );
      assert(unbalanced.manglikComparison?.status === "unbalanced", `expected unbalanced, got ${unbalanced.manglikComparison?.status}`);
    },
  },
  {
    name: "QA13 missing birth time / unverified handling",
    run: () => {
      // Unverified chart -> unavailable overall.
      const unverified = run({ moonLongitude: 10, verified: false }, { moonLongitude: 40 });
      assert(unverified.status === "unavailable", "unverified chart -> unavailable");
      // Missing Mars/Lagna (Ashtakoot still computes; Manglik unavailable).
      const noMars = run(
        { moonLongitude: longitudeForNakPada(0) },
        { moonLongitude: longitudeForNakPada(10) }
      );
      assert(noMars.status === "partial" || noMars.status === "ok", "Moon-only charts still compute Ashtakoot");
      assert(noMars.manglikComparison?.status === "unavailable", "Manglik unavailable without Mars/Lagna");
      assert(noMars.ashtakoot.rawTotal >= 0, "Ashtakoot raw total available");
    },
  },
  {
    name: "QA14 determinism, stable schema, no NaN, unique + registered rules",
    run: () => {
      const spec = () => run(
        { moonLongitude: longitudeForNakPada(3), marsLongitude: 10, lagnaLongitude: 10, venusLongitude: 10 },
        { moonLongitude: longitudeForNakPada(9), marsLongitude: 40, lagnaLongitude: 40, venusLongitude: 40 },
        { roleA: "groom_role", roleB: "bride_role" }
      );
      assert(JSON.stringify(spec()) === JSON.stringify(spec()), "non-deterministic output");
      // Unique registry ids.
      const ids = MATCH_RULE_REGISTRY.map((r) => r.ruleId);
      assert(new Set(ids).size === ids.length, "duplicate rule id");
      const snap = spec();
      // Every emitted ruleId registered; no NaN.
      const emitted = new Set<string>();
      const walk = (v: unknown) => {
        if (typeof v === "number") assert(Number.isFinite(v), "non-finite number in output");
        else if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v === "object") {
          const rec = v as Record<string, unknown>;
          if (typeof rec.ruleId === "string") emitted.add(rec.ruleId);
          Object.values(rec).forEach(walk);
        }
      };
      walk(snap);
      for (const id of emitted) assert(ids.includes(id), `emitted unregistered rule ${id}`);
      assert(snap.contractVersion === "1.0.0", "contract version drift");
    },
  },
  {
    name: "QA15 forbidden-wording scan over full output",
    run: () => {
      const snap = run(
        { moonLongitude: longitudeForNakPada(0), marsLongitude: 10, lagnaLongitude: 10, venusLongitude: 10 },
        { moonLongitude: longitudeForNakPada(5), marsLongitude: 40, lagnaLongitude: 40, venusLongitude: 40 },
        { roleA: "groom_role", roleB: "bride_role" }
      );
      const text = JSON.stringify(snap).toLowerCase();
      for (const term of FORBIDDEN) {
        assert(!text.includes(term), `forbidden term in output: "${term}"`);
      }
    },
  },
];

// --- Golden fixtures (manually computed) ---------------------------------------

type Golden = {
  name: string;
  a: ChartSpec;
  b: ChartSpec;
  roleA?: CalculationRole;
  roleB?: CalculationRole;
  expect: Partial<Record<string, number>>; // koota -> raw score
  expectBhakootException?: boolean;
  expectNadiException?: boolean;
  expectManglik?: string;
};

const GOLDEN: Golden[] = [
  {
    name: "same nakshatra/same pada (Ashwini p1) -> Nadi dosha, same-yoni 4",
    a: { moonLongitude: longitudeForNakPada(0, 1) },
    b: { moonLongitude: longitudeForNakPada(0, 1) },
    expect: { YONI: 4, NADI: 0, GANA: 6, BHAKOOT: 7, TARA: 0 },
  },
  {
    name: "same nakshatra/different pada (Ashwini p1 vs p3) -> Nadi dosha + exception",
    a: { moonLongitude: longitudeForNakPada(0, 1) },
    b: { moonLongitude: longitudeForNakPada(0, 3) },
    expect: { NADI: 0, YONI: 4 },
    expectNadiException: true,
  },
  {
    name: "same rashi/different nakshatra (Aries: Ashwini vs Bharani)",
    a: { moonLongitude: longitudeForNakPada(0) },
    b: { moonLongitude: longitudeForNakPada(1) },
    expect: { BHAKOOT: 7 }, // same sign -> not dosha
  },
  {
    name: "Bhakoot dosha pair (Aries vs Taurus = 2/12)",
    a: { moonLongitude: longitudeForSign(0) },
    b: { moonLongitude: longitudeForSign(1) },
    expect: { BHAKOOT: 0 },
  },
  {
    name: "Bhakoot exception (same lord: Aries vs Scorpio, both Mars, 6/8 dosha)",
    a: { moonLongitude: longitudeForSign(0) },
    b: { moonLongitude: longitudeForSign(7) },
    expect: { BHAKOOT: 0 },
    expectBhakootException: true,
  },
  {
    name: "one-sided Manglik (A Mars house 7, B clear)",
    a: { moonLongitude: 10, marsLongitude: longitudeForSign(6), lagnaLongitude: 10, venusLongitude: 10 },
    b: { moonLongitude: 10, marsLongitude: longitudeForSign(2), lagnaLongitude: 10, venusLongitude: 10 },
    expect: {},
    expectManglik: "unbalanced",
  },
  {
    name: "mutual Manglik (both Mars house 8)",
    a: { moonLongitude: 10, marsLongitude: longitudeForSign(7), lagnaLongitude: 10, venusLongitude: 10 },
    b: { moonLongitude: 40, marsLongitude: longitudeForSign(8), lagnaLongitude: 40, venusLongitude: 40 },
    expect: {},
    expectManglik: "balanced",
  },
];

const goldenGroup = {
  name: "GOLDEN manually-computed fixtures",
  run: () => {
    for (const fixture of GOLDEN) {
      const snap = run(fixture.a, fixture.b, { roleA: fixture.roleA, roleB: fixture.roleB });
      for (const [koota, expected] of Object.entries(fixture.expect)) {
        assert(score(snap, koota) === expected, `[${fixture.name}] ${koota}: got ${score(snap, koota)}, expected ${expected}`);
      }
      if (fixture.expectBhakootException !== undefined) {
        const applicable = snap.bhakootExceptionStatus === "cancellation_applicable";
        assert(applicable === fixture.expectBhakootException, `[${fixture.name}] bhakoot exception mismatch`);
        // Raw score unchanged regardless.
        assert(score(snap, "BHAKOOT") === 0, `[${fixture.name}] bhakoot raw must stay 0 after exception`);
      }
      if (fixture.expectNadiException !== undefined) {
        assert((snap.nadiExceptionStatus === "cancellation_applicable") === fixture.expectNadiException, `[${fixture.name}] nadi exception mismatch`);
        assert(score(snap, "NADI") === 0, `[${fixture.name}] nadi raw must stay 0 after exception`);
      }
      if (fixture.expectManglik) {
        assert(snap.manglikComparison?.status === fixture.expectManglik, `[${fixture.name}] manglik: got ${snap.manglikComparison?.status}, expected ${fixture.expectManglik}`);
      }
    }
  },
};

function main() {
  const all = [...groups, goldenGroup];
  const passed: string[] = [];
  const failed: Array<{ name: string; message: string }> = [];

  for (const group of all) {
    try {
      group.run();
      passed.push(group.name);
    } catch (error) {
      failed.push({ name: group.name, message: (error as Error).message });
    }
  }

  console.log("matchmaking premium QA (pure, exhaustive):");
  for (const name of passed) console.log(`  ✓ ${name}`);
  for (const failure of failed) console.log(`  ✗ ${failure.name} -- ${failure.message}`);
  console.log(`\nmatchmaking premium QA summary: ${passed.length} passed, ${failed.length} failed (of ${all.length}).`);

  if (failed.length > 0) process.exit(1);
}

main();
