/**
 * Card 9.2 — Premium Panchang/Hora/Choghadiya REAL ephemeris integration QA.
 *
 * Drives the real Swiss Ephemeris path (no injected sampler / rise-set) across
 * representative world fixtures, and cross-checks the premium engine against
 * the authoritative Card 2 `calculateDailyPanchangContext` for the same
 * date/location (identical conventions -> element names/indices and rise/set
 * must agree; this is the independent internal reference proof).
 *
 * On a host without the swisseph native binary (local Node 24) the groups are
 * reported ENVIRONMENT-BLOCKED — never silently passed. The Node 22 CI runs
 * everything and hard-gates 0 failed / 0 environment-blocked.
 */

import { createRequire } from "node:module";

import {
  buildPremiumPanchangSnapshot,
  type PremiumPanchangSnapshot,
} from "@/modules/panchang/premium";
import { calculateDailyPanchangContext } from "@/modules/panchang";

const require = createRequire(import.meta.url);

function swissephAvailable(): boolean {
  try {
    const swisseph = require("swisseph");

    return typeof swisseph.swe_calc_ut === "function";
  } catch {
    return false;
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

class EnvironmentBlocked extends Error {}

function blocked(reason: string): never {
  throw new EnvironmentBlocked(reason);
}

type Fixture = {
  name: string;
  dateLocal: string;
  latitude: number;
  longitude: number;
  timezoneIana: string;
  note: string;
};

const FIXTURES: Fixture[] = [
  { name: "guwahati", dateLocal: "2026-07-10", latitude: 26.1445, longitude: 91.7362, timezoneIana: "Asia/Kolkata", note: "base" },
  { name: "delhi", dateLocal: "2026-07-10", latitude: 28.6139, longitude: 77.209, timezoneIana: "Asia/Kolkata", note: "base" },
  { name: "mumbai", dateLocal: "2026-03-29", latitude: 19.076, longitude: 72.8777, timezoneIana: "Asia/Kolkata", note: "transition-boundary window" },
  { name: "chennai", dateLocal: "2026-07-10", latitude: 13.0827, longitude: 80.2707, timezoneIana: "Asia/Kolkata", note: "base" },
  { name: "london-dst-start", dateLocal: "2026-03-29", latitude: 51.5074, longitude: -0.1278, timezoneIana: "Europe/London", note: "DST start (UK clocks forward)" },
  { name: "new-york-dst-end", dateLocal: "2026-11-01", latitude: 40.7128, longitude: -74.006, timezoneIana: "America/New_York", note: "DST end (US clocks back)" },
  { name: "sydney", dateLocal: "2026-07-10", latitude: -33.8688, longitude: 151.2093, timezoneIana: "Australia/Sydney", note: "southern hemisphere winter" },
  { name: "leap-day", dateLocal: "2024-02-29", latitude: 26.1445, longitude: 91.7362, timezoneIana: "Asia/Kolkata", note: "leap year" },
];

const TROMSO: Fixture = {
  name: "tromso-polar-day",
  dateLocal: "2026-06-21",
  latitude: 69.6492,
  longitude: 18.9553,
  timezoneIana: "Europe/Oslo",
  note: "high latitude midsummer (polar day)",
};

function build(fixture: Fixture) {
  return buildPremiumPanchangSnapshot({
    localDate: fixture.dateLocal,
    latitude: fixture.latitude,
    longitude: fixture.longitude,
    timezoneIana: fixture.timezoneIana,
  });
}

function assertContiguous(
  intervals: Array<{ startUtc: string; endUtc: string }>,
  spanStart: string,
  spanEnd: string,
  label: string
) {
  assert(intervals[0].startUtc === spanStart, `${label}: first start != span start`);
  assert(intervals[intervals.length - 1].endUtc === spanEnd, `${label}: last end != span end`);
  for (let index = 1; index < intervals.length; index += 1) {
    assert(
      intervals[index].startUtc === intervals[index - 1].endUtc,
      `${label}: gap/overlap at ${index}`
    );
  }
}

function fullChecks(fixture: Fixture, snapshot: PremiumPanchangSnapshot) {
  const label = fixture.name;

  assert(snapshot.status === "ok", `${label}: expected ok, got ${snapshot.status} (${JSON.stringify(snapshot.unavailableReasons)})`);
  // Rise/set sanity + ordering.
  const sunrise = Date.parse(snapshot.sunrise!.utc);
  const sunset = Date.parse(snapshot.sunset!.utc);
  const nextSunrise = Date.parse(snapshot.nextSunrise!.utc);

  assert(sunrise < sunset && sunset < nextSunrise, `${label}: rise/set ordering`);
  assert(nextSunrise - sunrise > 20 * 3_600_000 && nextSunrise - sunrise < 28 * 3_600_000, `${label}: panchang day span plausible`);

  // Elements present + bracket the anchor instant.
  const queryMs = Date.parse(snapshot.queryInstant!);

  for (const element of [snapshot.tithi, snapshot.nakshatra, snapshot.yoga, snapshot.karana]) {
    assert(element, `${label}: element missing`);
    assert(
      Date.parse(element!.startUtc) <= queryMs && queryMs < Date.parse(element!.endUtc),
      `${label}: element does not bracket sunrise instant`
    );
  }

  // Transitions inside the panchang day, ordered; every element endUtc that
  // falls inside the day must appear as a transition (completeness).
  let previous = 0;

  for (const transition of snapshot.transitions) {
    const at = Date.parse(transition.atUtc);

    assert(at >= sunrise && at < nextSunrise, `${label}: transition outside day`);
    assert(at >= previous, `${label}: transitions unordered`);
    previous = at;
  }
  for (const [factor, element] of [
    ["tithi", snapshot.tithi],
    ["nakshatra", snapshot.nakshatra],
    ["yoga", snapshot.yoga],
    ["karana", snapshot.karana],
  ] as const) {
    const endMs = Date.parse(element!.endUtc);

    if (endMs >= sunrise && endMs < nextSunrise) {
      assert(
        snapshot.transitions.some(
          (transition) =>
            transition.element === factor &&
            Math.abs(Date.parse(transition.atUtc) - endMs) <= 2_000
        ),
        `${label}: ${factor} end missing from day transitions`
      );
    }
  }

  // Hora + choghadiya structure on real spans.
  assert(snapshot.horas.length === 24, `${label}: 24 horas`);
  assertContiguous(
    snapshot.horas.filter((hora) => hora.half === "day"),
    snapshot.sunrise!.utc,
    snapshot.sunset!.utc,
    `${label} day horas`
  );
  assertContiguous(
    snapshot.horas.filter((hora) => hora.half === "night"),
    snapshot.sunset!.utc,
    snapshot.nextSunrise!.utc,
    `${label} night horas`
  );
  assert(snapshot.choghadiyaDay.length === 8 && snapshot.choghadiyaNight.length === 8, `${label}: 8+8 choghadiya`);
  assertContiguous(snapshot.choghadiyaDay, snapshot.sunrise!.utc, snapshot.sunset!.utc, `${label} day choghadiya`);
  assertContiguous(snapshot.choghadiyaNight, snapshot.sunset!.utc, snapshot.nextSunrise!.utc, `${label} night choghadiya`);

  // Daily periods inside the day span.
  for (const period of [snapshot.rahuKaal, snapshot.yamaganda, snapshot.gulika, snapshot.abhijit]) {
    assert(period, `${label}: period missing`);
    assert(
      Date.parse(period!.startUtc) >= sunrise && Date.parse(period!.endUtc) <= sunset,
      `${label}: ${period!.type} outside day span`
    );
  }
  // Local time labels resolvable (timezone conversion sane).
  assert(snapshot.sunrise!.local.length > 0 && snapshot.rahuKaal!.startLocal.length > 0, `${label}: local labels`);
}

const groups: Array<{ name: string; run: () => void }> = [
  ...FIXTURES.map((fixture) => ({
    name: `INT ${fixture.name} (${fixture.note})`,
    run: () => {
      if (!swissephAvailable()) {
        blocked("swisseph native module unavailable on this Node runtime");
      }
      const result = build(fixture);

      assert(result.success, `${fixture.name}: ${!result.success ? result.error.message : ""}`);
      fullChecks(fixture, result.data);
    },
  })),
  {
    name: "INT tromso polar day: honest unavailable/degraded, nothing fabricated",
    run: () => {
      if (!swissephAvailable()) {
        blocked("swisseph native module unavailable on this Node runtime");
      }
      const result = build(TROMSO);

      assert(result.success, "tromso should return a snapshot, not throw");
      const snapshot = result.data;

      if (snapshot.status === "ok") {
        // If the ephemeris does resolve rise/set at 69.6N midsummer, structures must be complete.
        fullChecks(TROMSO, snapshot);
      } else {
        // Honest degradation: no fabricated sunrise-derived structures.
        assert(
          snapshot.horas.length === 0 || snapshot.horas.length === 12 || snapshot.horas.length === 24,
          "hora count must reflect actual available spans"
        );
        if (!snapshot.sunrise || !snapshot.sunset) {
          assert(snapshot.horas.length === 0, "no horas without rise/set");
          assert(snapshot.choghadiyaDay.length === 0, "no day choghadiya without rise/set");
          assert(!snapshot.rahuKaal && !snapshot.abhijit && !snapshot.brahmaMuhurta, "no fabricated periods");
        }
        assert(snapshot.unavailableReasons.length > 0, "reasons must be present");
      }
    },
  },
  {
    name: "INT card2 cross-check: premium equals authoritative Card 2 (same conventions)",
    run: () => {
      if (!swissephAvailable()) {
        blocked("swisseph native module unavailable on this Node runtime");
      }
      const fixture = FIXTURES[0];
      const premium = build(fixture);
      const card2 = calculateDailyPanchangContext({
        dateLocal: fixture.dateLocal,
        location: {
          displayName: "Guwahati, Assam, India",
          latitude: fixture.latitude,
          longitude: fixture.longitude,
          timezoneIana: fixture.timezoneIana,
        },
      });

      assert(premium.success && card2.success, "both engines must succeed");
      const p = premium.data;
      const c = card2.data;

      assert(p.sunrise!.utc === c.sunrise.utc, "sunrise must equal Card 2");
      assert(p.sunset!.utc === c.sunset.utc, "sunset must equal Card 2");
      assert(p.queryInstant === c.as_of_utc, "anchor instant must equal Card 2 (sunrise)");
      assert(p.tithi!.index === c.tithi.index && p.tithi!.name === c.tithi.name, "tithi must equal Card 2");
      assert(p.paksha === c.paksha, "paksha must equal Card 2");
      assert(p.nakshatra!.index === c.nakshatra.index && p.nakshatra!.pada === c.nakshatra.pada, "nakshatra must equal Card 2");
      assert(p.yoga!.index === c.yoga.index, "yoga must equal Card 2");
      assert(p.karana!.index === c.karana.index && p.karana!.name === c.karana.name, "karana must equal Card 2");
      // Daily periods equal Card 2's advanced timings (same tables + rise/set).
      assert(p.rahuKaal!.startUtc === c.advanced_timings.rahu_kaal.start_utc, "rahu kaal must equal Card 2");
      assert(p.yamaganda!.startUtc === c.advanced_timings.yamaganda.start_utc, "yamaganda must equal Card 2");
      assert(p.gulika!.startUtc === c.advanced_timings.gulika_kaal.start_utc, "gulika must equal Card 2");
      assert(p.abhijit!.startUtc === c.advanced_timings.abhijit_muhurta.start_utc, "abhijit must equal Card 2");
      // Premium next-change times: Card 2's next change after sunrise must match
      // the premium element end (both bisect the same math; Card 2 precision 30 s).
      assert(
        Math.abs(Date.parse(p.tithi!.endUtc) - Date.parse(c.transitions.next_tithi_change.utc)) <= 31_000,
        "tithi end must match Card 2 next change within its 30 s precision"
      );
    },
  },
  {
    name: "INT determinism on real path: two runs byte-identical",
    run: () => {
      if (!swissephAvailable()) {
        blocked("swisseph native module unavailable on this Node runtime");
      }
      const a = JSON.stringify(build(FIXTURES[0]));
      const b = JSON.stringify(build(FIXTURES[0]));

      assert(a === b, "real-path output must be deterministic");
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

  console.log(
    `panchang premium INTEGRATION QA (real ephemeris; swisseph=${swiss ? "available" : "unavailable"}):`
  );
  for (const name of passed) console.log(`  ✓ ${name}`);
  for (const item of blockedGroups) console.log(`  ~ ${item.name} [environment-blocked: ${item.reason}]`);
  for (const failure of failed) console.log(`  ✗ ${failure.name} -- ${failure.message}`);
  console.log(
    `\npanchang premium integration QA summary: ${passed.length} passed, ${failed.length} failed, ${blockedGroups.length} environment-blocked (of ${groups.length}).`
  );

  if (swiss && blockedGroups.length > 0) {
    console.log(
      "::error::swisseph is available but integration groups were blocked. They must run on this runner."
    );
    process.exit(1);
  }

  if (failed.length > 0) {
    process.exit(1);
  }
}

main();
