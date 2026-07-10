/**
 * Card 8B-R1 — Premium Daily Horoscope REAL dependency integration QA.
 *
 * Unlike the unit QA (which injects deterministic Gochar/Panchang snapshots),
 * this harness drives the REAL Cards 2/4/5/6/7 engines end-to-end through the
 * production adapter + orchestrator, with NO mocking of any dependency output.
 *
 * Chart fixture: the repository's authoritative verified UnifiedSiderealChart
 * (scripts/_predictive-chart-fixture.ts), reused as-is (no hand-invented
 * positions).
 *
 * Runtime split (reported honestly):
 *   - Pure layers (Card 4 varga, Card 5 dasha, Card 7 ashtakavarga) run on any
 *     Node version.
 *   - Ephemeris layers (Card 6 gochar, Card 2 panchang) require the swisseph
 *     native binary (Node 22 CI). On a host where it is unavailable, the
 *     ephemeris-backed groups are reported ENVIRONMENT-BLOCKED (never silently
 *     passed, never faked).
 */

import { createRequire } from "node:module";

import { buildKnownValidChartContext } from "./_predictive-chart-fixture";
import {
  buildHoroscopeChartContext,
  buildDailyHoroscopeSnapshot,
  RULE_REGISTRY,
} from "@/modules/astrology/horoscope";
import { buildVimshottariActiveLineageForChartContext } from "@/modules/astrology/vimshottari-dasha";
import { buildAshtakavargaSnapshot } from "@/modules/astrology/ashtakavarga";
import { buildVargaChart, type VargaCode } from "@/modules/astrology/divisional";
import { buildGocharSnapshot } from "@/modules/astrology/gochar";
import { calculateDailyPanchangContext } from "@/modules/panchang";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import type { VargaSourceChart } from "@/modules/astrology/divisional/varga-engine";

const require = createRequire(import.meta.url);

// --- Fixed, deterministic query context --------------------------------------

const CHART: UnifiedSiderealChart = buildKnownValidChartContext();
const LOCAL_DATE = "2026-07-10";
const LOCATION = {
  displayName: "Guwahati, Assam, India",
  latitude: 26.1445,
  longitude: 91.7362,
  timezoneIana: "Asia/Kolkata",
};
const AS_OF_INSTANT = "2026-07-10T00:41:00.000Z";
const CATEGORY_VARGAS: VargaCode[] = ["D10", "D2", "D9", "D24", "D30"];

const FORBIDDEN = [
  "remedy", "remedies", "gemstone", "mantra", "donation", "guaranteed",
  "fatal", "death", "accident", "divorce", "disease", "diagnos",
  "you will", "certain loss",
];

function swissephAvailable(): boolean {
  try {
    const swe = require("swisseph");
    return typeof swe.swe_calc_ut === "function";
  } catch {
    return false;
  }
}

function moonLongitude(chart: UnifiedSiderealChart): number {
  const moon = chart.planets.find((p) => p.name.trim().toUpperCase() === "MOON");
  return moon!.longitude;
}

function stableJson(value: unknown): string {
  return JSON.stringify(value);
}

// --- Assertion + runner ------------------------------------------------------

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

class EnvironmentBlocked extends Error {}

function blocked(reason: string): never {
  throw new EnvironmentBlocked(reason);
}

type Group = { name: string; ephemeris?: boolean; run: () => void };

// Build the real context/snapshot ONCE (deterministic; pure layers always run,
// ephemeris layers resolve live when swisseph is present).
const CTX = buildHoroscopeChartContext({
  chart: CHART,
  localDate: LOCAL_DATE,
  location: LOCATION,
  asOfInstant: AS_OF_INSTANT,
});
const SNAPSHOT = buildDailyHoroscopeSnapshot({
  chart: CHART,
  localDate: LOCAL_DATE,
  location: LOCATION,
  asOfInstant: AS_OF_INSTANT,
});

const groups: Group[] = [
  {
    name: "INT1 verified chart fixture + adapter consumes it (Card natal)",
    run: () => {
      assert(CHART.verification.is_verified_for_chart_logic, "fixture must be verified");
      assert(CTX.chartContextStatus === "verified", "adapter should mark context verified");
      assert(CTX.natal !== null, "adapter should resolve natal");
      assert(typeof CTX.queryInstant === "string", "adapter should resolve a query instant");
    },
  },
  {
    name: "INT2 Card 5 dasha: adapter output equals direct engine (same instant)",
    run: () => {
      assert(CTX.dasha.ready, "dasha must resolve for the verified fixture");
      const direct = buildVimshottariActiveLineageForChartContext({
        chart: CHART,
        asOfDateUtc: CTX.queryInstant!,
      });
      assert(direct.success, "direct dasha call must succeed");
      assert(
        stableJson(direct.data) === stableJson(CTX.dasha.data),
        "adapter dasha lineage differs from direct Card 5 output"
      );
    },
  },
  {
    name: "INT3 Card 7 ashtakavarga: adapter equals direct + SAV 337 + checksums",
    run: () => {
      assert(CTX.ashtakavarga.ready, "ashtakavarga must resolve");
      const direct = buildAshtakavargaSnapshot({ chart: CHART });
      assert(direct.success, "direct ashtakavarga call must succeed");
      assert(
        stableJson(direct.data) === stableJson(CTX.ashtakavarga.data),
        "adapter ashtakavarga differs from direct Card 7 output"
      );
      assert(CTX.ashtakavarga.data.sav.total === 337, "SAV total must be 337");
      const expected: Record<string, number> = {
        SUN: 48, MOON: 49, MARS: 39, MERCURY: 54, JUPITER: 56, VENUS: 52, SATURN: 39,
      };
      for (const bav of CTX.ashtakavarga.data.bav) {
        assert(bav.total === expected[bav.planet], `BAV checksum ${bav.planet} != ${expected[bav.planet]}`);
      }
    },
  },
  {
    name: "INT4 Card 4 vargas: adapter readiness+placements equal direct engine",
    run: () => {
      for (const code of CATEGORY_VARGAS) {
        const state = CTX.divisional[code];
        assert(state && state.ready, `varga ${code} must be ready`);
        const direct = buildVargaChart(CHART as unknown as VargaSourceChart, code);
        assert(direct !== null, `direct varga ${code} must build`);
        assert(
          stableJson(direct) === stableJson(state.data),
          `adapter varga ${code} differs from direct Card 4 output`
        );
      }
    },
  },
  {
    name: "INT5 Card 6 gochar: adapter equals direct (positions + Sade Sati + affliction)",
    ephemeris: true,
    run: () => {
      if (!CTX.gochar.ready) {
        blocked(`gochar unavailable: ${CTX.gochar.reason}`);
      }
      const direct = buildGocharSnapshot({
        natalMoonLongitude: moonLongitude(CHART),
        natalLagnaLongitude: CHART.lagna.longitude,
        queryInstant: CTX.queryInstant!,
        resolveIngress: false,
        resolveSadeSatiWindow: false,
      });
      assert(direct.success, "direct gochar call must succeed on this runner");
      assert(
        stableJson(direct.data.transits) === stableJson(CTX.gochar.data.transits),
        "adapter gochar transits differ from direct Card 6 output"
      );
      assert(
        stableJson(direct.data.sadeSati) === stableJson(CTX.gochar.data.sadeSati),
        "adapter Sade Sati differs from direct Card 6 output"
      );
      assert(
        direct.data.saturnAffliction === CTX.gochar.data.saturnAffliction,
        "adapter Saturn affliction differs from direct Card 6 output"
      );
    },
  },
  {
    name: "INT6 Card 2 panchang: adapter equals direct (sunrise + day windows)",
    ephemeris: true,
    run: () => {
      if (!CTX.panchang.ready) {
        blocked("panchang unavailable on this runner");
      }
      const direct = calculateDailyPanchangContext({
        dateLocal: LOCAL_DATE,
        location: LOCATION,
      });
      assert(direct.success, "direct panchang call must succeed on this runner");
      assert(
        stableJson(direct.data.sunrise) === stableJson(CTX.panchang.data.sunrise),
        "adapter sunrise differs from direct Card 2 output"
      );
      assert(
        stableJson(direct.data.advanced_timings) === stableJson(CTX.panchang.data.advanced_timings),
        "adapter advanced timings differ from direct Card 2 output"
      );
      // queryInstant must equal the real sunrise UTC when Panchang is available.
      assert(
        CTX.queryInstant === CTX.panchang.data.sunrise?.utc,
        "queryInstant must equal Panchang sunrise when available"
      );
    },
  },
  {
    name: "INT7 complete source readiness -> not unavailable, windows present, majority categories available",
    ephemeris: true,
    run: () => {
      if (!(CTX.gochar.ready && CTX.panchang.ready)) {
        blocked("full source readiness requires live gochar + panchang");
      }
      // Complete source readiness = every source system ready.
      for (const system of [
        "natal", "vimshottari", "gocharFromMoon", "gocharFromLagna",
        "sadeSati", "ashtakavargaBAV", "ashtakavargaSAV", "panchang", "divisional",
      ]) {
        assert(SNAPSHOT.sourceSystems[system] === "ready", `source system ${system} not ready under full readiness`);
      }
      // Status must reflect real readiness (never "unavailable" when all sources are ready).
      assert(SNAPSHOT.status !== "unavailable", `status should not be unavailable with full readiness, got ${SNAPSHOT.status}`);
      assert(SNAPSHOT.timeWindows.length > 0, "time windows should be present from real Panchang");
      assert(SNAPSHOT.sadeSati !== null, "Sade Sati context should be present");
      assert(SNAPSHOT.dashaContext !== null, "dasha context should be present");
      const available = SNAPSHOT.categories.filter((c) => c.status === "available").length;
      assert(available >= 6, `expected >= 6 available categories under full readiness, got ${available}`);
    },
  },
  {
    name: "INT8 metadata/convention integrity preserved through adapter",
    run: () => {
      assert(SNAPSHOT.conventions.ayanamsa === "LAHIRI", "ayanamsa drift");
      assert(SNAPSHOT.conventions.houseSystem === "whole_sign", "house system drift");
      assert(SNAPSHOT.conventions.nodeModel === "TRUE_NODE", "node model drift");
      assert(SNAPSHOT.conventions.daysPerDashaYear === 365.2425, "daysPerDashaYear drift");
      assert(SNAPSHOT.conventions.ashtakavargaSavChecksum === 337, "SAV checksum metadata drift");
      assert(SNAPSHOT.contractVersion === "1.0.0", "contract version drift");
      assert(SNAPSHOT.periodType === "DAILY", "periodType must be DAILY");
      assert(SNAPSHOT.timezone === LOCATION.timezoneIana, "timezone not preserved");
      assert(SNAPSHOT.localDate === LOCAL_DATE, "localDate not preserved");
    },
  },
  {
    name: "INT9 final snapshot structural integrity (7 categories, tiers, dedup, rules, no NaN)",
    run: () => {
      assert(SNAPSHOT.categories.length === 7, "expected 7 categories");
      const registeredRuleIds = new Set(RULE_REGISTRY.map((r) => r.ruleId));
      for (const c of SNAPSHOT.categories) {
        const tokens = [...c.supportiveEvidence, ...c.cautionEvidence, ...c.neutralEvidence];
        const keys = tokens.map((t) => t.conditionKey);
        assert(new Set(keys).size === keys.length, `duplicate conditionKey in ${c.category}`);
        for (const t of tokens) {
          assert(registeredRuleIds.has(t.ruleId), `unregistered rule ${t.ruleId}`);
          assert(Number.isInteger(t.tier) && t.tier >= -2 && t.tier <= 2, `tier out of range in ${c.category}`);
          assert(t.tier > 0 ? c.supportiveEvidence.includes(t) : true, "supportive/caution not separated");
        }
        if (c.internalNetTier !== null) {
          assert(Number.isFinite(c.internalNetTier), "netTier non-finite");
        }
        assert(c.confidence.value >= 0 && c.confidence.value <= 1, "confidence out of [0,1]");
      }
    },
  },
  {
    name: "INT10 determinism: two full executions produce identical output",
    run: () => {
      const a = buildDailyHoroscopeSnapshot({ chart: CHART, localDate: LOCAL_DATE, location: LOCATION, asOfInstant: AS_OF_INSTANT });
      const b = buildDailyHoroscopeSnapshot({ chart: CHART, localDate: LOCAL_DATE, location: LOCATION, asOfInstant: AS_OF_INSTANT });
      assert(stableJson(a) === stableJson(b), "non-deterministic output across identical runs");
    },
  },
  {
    name: "INT11 forbidden-wording scan over full real snapshot",
    run: () => {
      const text = stableJson(SNAPSHOT).toLowerCase();
      for (const term of FORBIDDEN) {
        assert(!text.includes(term), `forbidden term in real output: "${term}"`);
      }
    },
  },
  {
    name: "INT12 missing-Panchang safety: no fabricated windows, honest unavailable",
    run: () => {
      // Simulate an unavailable Panchang source (not a mocked output value).
      const failing = {
        success: false as const,
        missingReason: "simulated unavailable",
        error: { code: "MISSING_LOCATION", message: "simulated unavailable" },
      };
      const ctxNoSunrise = buildHoroscopeChartContext({
        chart: CHART,
        localDate: LOCAL_DATE,
        location: LOCATION,
        // no asOfInstant -> must fall back but stay honest
        injected: { panchang: failing as never },
      });
      assert(!ctxNoSunrise.panchang.ready, "panchang must be unavailable");
      assert(ctxNoSunrise.sourceSystems.panchang === "unavailable", "panchang readiness must be unavailable");
      assert(ctxNoSunrise.dayInstantFallback === true, "fallback flag must be set when no sunrise/asOf");
      assert(
        ctxNoSunrise.unavailableReasons.some((r) => r.system === "panchang"),
        "unavailableReasons must identify panchang"
      );

      const snapNoWindows = buildDailyHoroscopeSnapshot({
        chart: CHART,
        localDate: LOCAL_DATE,
        location: LOCATION,
        injected: { panchang: failing as never },
      });
      assert(snapNoWindows.timeWindows.length === 0, "no time windows may be fabricated without Panchang");
      assert(snapNoWindows.sourceSystems.panchang === "unavailable", "snapshot panchang must be unavailable");
      assert(snapNoWindows.flags.dayInstantFallback === true, "snapshot must flag the day-instant fallback");

      // asOf-only path: technical instant accepted, but still no panchang readiness/windows.
      const ctxAsOf = buildHoroscopeChartContext({
        chart: CHART,
        localDate: LOCAL_DATE,
        location: LOCATION,
        asOfInstant: AS_OF_INSTANT,
        injected: { panchang: failing as never },
      });
      assert(ctxAsOf.queryInstant === AS_OF_INSTANT, "asOfInstant should be the technical fallback instant");
      assert(ctxAsOf.dayInstantFallback === false, "asOf technical instant is not a flagged sunrise fallback");
      assert(!ctxAsOf.panchang.ready, "panchang still unavailable with asOf");
    },
  },
];

function main() {
  const swiss = swissephAvailable();
  const passed: string[] = [];
  const failed: Array<{ name: string; message: string }> = [];
  const blockedGroups: Array<{ name: string; reason: string }> = [];

  for (const group of groups) {
    try {
      group.run();
      passed.push(group.name);
    } catch (error) {
      if (error instanceof EnvironmentBlocked) {
        blockedGroups.push({ name: group.name, reason: error.message });
      } else {
        failed.push({ name: group.name, message: (error as Error).message });
      }
    }
  }

  console.log(`horoscope daily INTEGRATION QA (real dependencies; swisseph=${swiss ? "available" : "unavailable"}):`);
  for (const name of passed) console.log(`  ✓ ${name}`);
  for (const b of blockedGroups) console.log(`  ~ ${b.name} [environment-blocked: ${b.reason}]`);
  for (const f of failed) console.log(`  ✗ ${f.name} -- ${f.message}`);

  console.log(
    `\nintegration QA summary: ${passed.length} passed, ${failed.length} failed, ${blockedGroups.length} environment-blocked (of ${groups.length}).`
  );

  // A group may only be environment-blocked when swisseph is genuinely absent.
  // If swisseph is present (Node 22 CI) every ephemeris group must actually run.
  if (swiss && blockedGroups.length > 0) {
    console.log("::error::swisseph is available but ephemeris integration groups were blocked. They must run on this runner.");
    process.exit(1);
  }

  if (failed.length > 0) {
    process.exit(1);
  }
}

main();
