import assert from "node:assert/strict";

import {
  BENEFIC_HOUSES_FROM_MOON,
  GOCHAR_GRAHAS,
  buildGocharSnapshot,
  distanceToRashiBoundaryDegrees,
  enumerateSadeSatiWindow,
  findNextIngress,
  houseFromMoon,
  isRetrograde,
  isSadeSatiActive,
  rashiIndex,
  resolveVedhaStatus,
  sadeSatiPhase,
  saturnAffliction,
  swissEphemerisSampler,
  transitResultFlag,
  INGRESS_BOUNDARY_TOLERANCE_DEG,
  INGRESS_TOLERANCE_MS,
  type GocharGraha,
  type GocharSample,
  type GocharSampler,
  type HouseNumber1To12,
} from "@/modules/astrology/gochar";
import { calculateCoreGrahaSiderealLongitudesAtUtc } from "@/lib/astrology/swiss-planetary-service";

const MS_PER_DAY = 86_400_000;
const QUERY = new Date("2026-07-08T00:00:00.000Z");

/** Deterministic analytic sampler: linear motion, no ephemeris. */
function makeLinearSampler(
  spec: Partial<Record<GocharGraha, { at: number; degPerDay: number }>>,
  epoch: Date = QUERY
): GocharSampler {
  return (instant: Date) => {
    const days = (instant.getTime() - epoch.getTime()) / MS_PER_DAY;
    const samples = {} as Record<GocharGraha, GocharSample>;

    for (const graha of GOCHAR_GRAHAS) {
      const cfg = spec[graha] ?? { at: 0, degPerDay: 0 };
      const raw = cfg.at + cfg.degPerDay * days;
      const norm = ((raw % 360) + 360) % 360;
      samples[graha] = { longitude: norm, speed: cfg.degPerDay };
    }

    return samples;
  };
}

/** Places every graha at a chosen house-from-Moon offset. */
function samplerAtHousesFromMoon(
  natalMoonLongitude: number,
  houses: Record<GocharGraha, HouseNumber1To12>
): GocharSampler {
  const moonRashi = rashiIndex(natalMoonLongitude);
  const spec: Partial<Record<GocharGraha, { at: number; degPerDay: number }>> = {};

  for (const graha of GOCHAR_GRAHAS) {
    const targetRashi = (moonRashi + (houses[graha] - 1)) % 12;
    spec[graha] = { at: targetRashi * 30 + 15, degPerDay: 0 };
  }

  return makeLinearSampler(spec);
}

const allHouses = (h: HouseNumber1To12) =>
  Object.fromEntries(GOCHAR_GRAHAS.map((g) => [g, h])) as Record<
    GocharGraha,
    HouseNumber1To12
  >;

const results: string[] = [];
const blocked: string[] = [];

// ============================================================================
// QA 1 — Determinism: same inputs twice -> identical output
// ============================================================================
{
  const sampler = makeLinearSampler({
    SUN: { at: 100, degPerDay: 1 },
    MOON: { at: 200, degPerDay: 13 },
    SATURN: { at: 10, degPerDay: 0.03 },
  });
  const input = {
    natalMoonLongitude: 100.5,
    natalLagnaLongitude: 12.25,
    queryInstant: QUERY,
    sampler,
  };
  const a = buildGocharSnapshot(input);
  const b = buildGocharSnapshot(input);
  assert.equal(a.success, true);
  assert.equal(b.success, true);
  if (a.success && b.success) {
    assert.deepEqual(a.data, b.data, "same inputs must yield identical output");
    assert.equal(JSON.stringify(a.data), JSON.stringify(b.data));
  }
  results.push("QA1 determinism");
}

// ============================================================================
// QA 2 — houseFromMoon math across all 12 offsets (and 0/360 wrap)
// ============================================================================
{
  for (let moonRashi = 0; moonRashi < 12; moonRashi += 1) {
    const moonLong = moonRashi * 30 + 7.5;

    for (let offset = 0; offset < 12; offset += 1) {
      const planetLong = ((moonRashi + offset) % 12) * 30 + 22.5;
      assert.equal(
        houseFromMoon(planetLong, moonLong),
        offset + 1,
        `moonRashi=${moonRashi} offset=${offset}`
      );
    }
  }
  // wrap-around: 359.99 deg and 0.0 deg
  assert.equal(rashiIndex(359.999), 11);
  assert.equal(rashiIndex(0), 0);
  assert.equal(houseFromMoon(0, 359.999), 2, "Pisces->Aries is 2nd");
  assert.equal(houseFromMoon(359.999, 0), 12, "Aries->Pisces is 12th");
  results.push("QA2 house-from-Moon across 12 offsets");
}

// ============================================================================
// QA 3 — Benefic table: force placements, assert flags for every graha
// ============================================================================
{
  const natalMoon = 100.5; // Cancer
  for (let house = 1 as HouseNumber1To12; house <= 12; house += 1) {
    const h = house as HouseNumber1To12;
    const snap = buildGocharSnapshot({
      natalMoonLongitude: natalMoon,
      natalLagnaLongitude: 0,
      queryInstant: QUERY,
      sampler: samplerAtHousesFromMoon(natalMoon, allHouses(h)),
      resolveIngress: false,
      resolveSadeSatiWindow: false,
    });
    assert.equal(snap.success, true);
    if (!snap.success) throw new Error("unreachable");

    for (const entry of snap.data.transits) {
      assert.equal(entry.houseFromMoon, h, `${entry.graha} placed in house ${h}`);
      const expected = BENEFIC_HOUSES_FROM_MOON[entry.graha].includes(h)
        ? "benefic"
        : "non_benefic";
      assert.equal(
        entry.transitResult,
        expected,
        `${entry.graha} in ${h} from Moon -> ${expected}`
      );
    }
  }
  // spot-check the table itself matches the contract
  assert.deepEqual([...BENEFIC_HOUSES_FROM_MOON.SUN], [3, 6, 10, 11]);
  assert.deepEqual([...BENEFIC_HOUSES_FROM_MOON.MOON], [1, 3, 6, 7, 10, 11]);
  assert.deepEqual([...BENEFIC_HOUSES_FROM_MOON.MARS], [3, 6, 11]);
  assert.deepEqual([...BENEFIC_HOUSES_FROM_MOON.MERCURY], [2, 4, 6, 8, 10, 11]);
  assert.deepEqual([...BENEFIC_HOUSES_FROM_MOON.JUPITER], [2, 5, 7, 9, 11]);
  assert.deepEqual([...BENEFIC_HOUSES_FROM_MOON.VENUS], [1, 2, 3, 4, 5, 8, 9, 11, 12]);
  assert.deepEqual([...BENEFIC_HOUSES_FROM_MOON.SATURN], [3, 6, 11]);
  assert.deepEqual([...BENEFIC_HOUSES_FROM_MOON.RAHU], [3, 6, 11]);
  assert.deepEqual([...BENEFIC_HOUSES_FROM_MOON.KETU], [3, 6, 11]);
  assert.equal(transitResultFlag("SATURN", 3), "benefic");
  assert.equal(transitResultFlag("SATURN", 1), "non_benefic");
  results.push("QA3 benefic table for all 9 grahas x 12 houses");
}

// ============================================================================
// QA 4 — Sade Sati activation: Moon in each of 12 signs; Saturn 12/1/2 active
// ============================================================================
{
  const expectedPhase: Record<number, string> = { 12: "rising", 1: "peak", 2: "setting" };

  for (let moonRashi = 0; moonRashi < 12; moonRashi += 1) {
    const natalMoon = moonRashi * 30 + 10;

    for (let house = 1 as HouseNumber1To12; house <= 12; house += 1) {
      const h = house as HouseNumber1To12;
      const saturnRashi = (moonRashi + (h - 1)) % 12;
      const sampler = makeLinearSampler({
        SATURN: { at: saturnRashi * 30 + 15, degPerDay: 0 },
      });
      const snap = buildGocharSnapshot({
        natalMoonLongitude: natalMoon,
        natalLagnaLongitude: 0,
        queryInstant: QUERY,
        sampler,
        resolveIngress: false,
        resolveSadeSatiWindow: false,
      });
      assert.equal(snap.success, true);
      if (!snap.success) throw new Error("unreachable");

      const ss = snap.data.sadeSati;
      assert.equal(ss.saturnHouseFromMoon, h);

      if (h === 12 || h === 1 || h === 2) {
        assert.equal(ss.active, true, `moon ${moonRashi}, saturn house ${h} active`);
        assert.equal(ss.phase, expectedPhase[h]);
      } else {
        assert.equal(ss.active, false, `moon ${moonRashi}, saturn house ${h} inactive`);
        assert.equal(ss.phase, null);
      }
    }
  }
  assert.equal(isSadeSatiActive(12), true);
  assert.equal(isSadeSatiActive(3), false);
  assert.equal(sadeSatiPhase(1), "peak");
  results.push("QA4 Sade Sati activation (12 moon signs x 12 saturn houses)");
}

// ============================================================================
// QA 5 — Kantaka/Ashtama: Saturn in 4th/8th -> affliction, Sade Sati inactive
// ============================================================================
{
  const natalMoon = 100.5;
  const check = (house: HouseNumber1To12, expected: string) => {
    const saturnRashi = (rashiIndex(natalMoon) + (house - 1)) % 12;
    const snap = buildGocharSnapshot({
      natalMoonLongitude: natalMoon,
      natalLagnaLongitude: 0,
      queryInstant: QUERY,
      sampler: makeLinearSampler({ SATURN: { at: saturnRashi * 30 + 5, degPerDay: 0 } }),
      resolveIngress: false,
      resolveSadeSatiWindow: false,
    });
    assert.equal(snap.success, true);
    if (!snap.success) throw new Error("unreachable");
    assert.equal(snap.data.saturnAffliction, expected, `house ${house}`);
    if (house === 4 || house === 8) {
      assert.equal(snap.data.sadeSati.active, false, "affliction != Sade Sati");
    }
  };

  check(4, "kantaka_4th");
  check(8, "ashtama_8th");
  check(1, "none");
  check(12, "none");
  check(2, "none");
  check(6, "none");
  // affliction is independent of Sade Sati
  assert.equal(saturnAffliction(4), "kantaka_4th");
  assert.equal(saturnAffliction(8), "ashtama_8th");
  assert.equal(saturnAffliction(1), "none");
  results.push("QA5 kantaka_4th / ashtama_8th independent of Sade Sati");
}

// ============================================================================
// QA 6 — Ingress accuracy: recompute longitude at returned instant ~= boundary
// ============================================================================
{
  // Direct motion: Sun crosses 120 deg (Leo) boundary.
  const direct = makeLinearSampler({ SUN: { at: 118.0, degPerDay: 1.0 } });
  const ing = findNextIngress({ sampler: direct, graha: "SUN", from: QUERY });
  assert.equal(ing.success, true);
  if (!ing.success) throw new Error("unreachable");
  assert.equal(ing.data.fromRashi, 3);
  assert.equal(ing.data.toRashi, 4);
  assert.equal(ing.data.retrograde, false);

  const at = new Date(ing.data.atUtc);
  const recomputed = direct(at)!.SUN.longitude;
  const distanceToBoundary = Math.abs(recomputed - 120);
  assert.ok(
    distanceToBoundary <= INGRESS_BOUNDARY_TOLERANCE_DEG,
    `boundary within ${INGRESS_BOUNDARY_TOLERANCE_DEG} deg, got ${distanceToBoundary}`
  );
  // bracket tightness implies <= 60 s of true crossing
  const trueCrossing = QUERY.getTime() + 2.0 * MS_PER_DAY;
  assert.ok(
    Math.abs(at.getTime() - trueCrossing) <= INGRESS_TOLERANCE_MS,
    "ingress instant within 60 s"
  );

  // Retrograde motion: Mars moves backwards across the 90 deg boundary.
  const retro = makeLinearSampler({ MARS: { at: 90.5, degPerDay: -0.4 } });
  const retroIng = findNextIngress({ sampler: retro, graha: "MARS", from: QUERY });
  assert.equal(retroIng.success, true);
  if (!retroIng.success) throw new Error("unreachable");
  assert.equal(retroIng.data.fromRashi, 3, "starts in Cancer");
  assert.equal(retroIng.data.toRashi, 2, "retrogrades into Gemini");
  assert.equal(retroIng.data.retrograde, true);
  const retroLong = retro(new Date(retroIng.data.atUtc))!.MARS.longitude;
  assert.ok(Math.abs(retroLong - 90) <= INGRESS_BOUNDARY_TOLERANCE_DEG);

  // 0/360 wrap: Moon crosses Pisces -> Aries.
  const wrap = makeLinearSampler({ MOON: { at: 359.0, degPerDay: 13.0 } });
  const wrapIng = findNextIngress({ sampler: wrap, graha: "MOON", from: QUERY });
  assert.equal(wrapIng.success, true);
  if (!wrapIng.success) throw new Error("unreachable");
  assert.equal(wrapIng.data.fromRashi, 11);
  assert.equal(wrapIng.data.toRashi, 0);

  // Stationary graha never ingresses -> honest failure, no fabrication.
  const stationary = makeLinearSampler({ SATURN: { at: 15, degPerDay: 0 } });
  const none = findNextIngress({
    sampler: stationary,
    graha: "SATURN",
    from: QUERY,
    horizonDays: 30,
  });
  assert.equal(none.success, false);
  if (!none.success) assert.equal(none.issue.code, "NO_INGRESS_IN_HORIZON");

  // Fast body must ALSO satisfy the ANGULAR tolerance, not just the 60 s
  // bracket. At ~15.4 deg/day the Moon covers ~0.011 deg in 60 s, so a
  // time-only stop condition misses the 0.001 deg boundary requirement.
  // (Regression guard: this exact case failed on the real ephemeris in CI.)
  for (const degPerDay of [15.4, -15.4, 13.2]) {
    const fastMoon = makeLinearSampler({ MOON: { at: 89.0, degPerDay } });
    const fastIng = findNextIngress({ sampler: fastMoon, graha: "MOON", from: QUERY });
    assert.equal(fastIng.success, true, `fast Moon ingress at ${degPerDay} deg/day`);
    if (!fastIng.success) throw new Error("unreachable");
    const fastLong = fastMoon(new Date(fastIng.data.atUtc))!.MOON.longitude;
    const off = distanceToRashiBoundaryDegrees(fastLong);
    assert.ok(
      off <= INGRESS_BOUNDARY_TOLERANCE_DEG,
      `fast Moon (${degPerDay} deg/day) must land within ${INGRESS_BOUNDARY_TOLERANCE_DEG} deg of the boundary (off by ${off})`
    );
  }

  results.push(
    "QA6 ingress accuracy (direct, retrograde, wrap, stationary, fast-body angular tolerance)"
  );
}

// ============================================================================
// QA 7 — Retrograde re-entry: constructed window -> retrogradeReEntry = true
// ============================================================================
{
  const natalMoon = 100.5; // Cancer (rashi 3) -> Sade Sati houses 12,1,2 = rashi 2,3,4
  const entryBoundary = 60; // Gemini starts at 60 deg = 12th from Cancer Moon
  const isActive = (saturnLongitude: number) =>
    isSadeSatiActive(houseFromMoon(saturnLongitude, natalMoon));

  // Saturn: crosses into Gemini, retrogrades back to Taurus, then re-enters.
  // Piecewise-linear, deterministic.
  const t0 = QUERY.getTime();
  const day = (d: number) => t0 + d * MS_PER_DAY;
  const saturnLongitudeAt = (instant: Date): number => {
    const d = (instant.getTime() - t0) / MS_PER_DAY;
    if (d < 100) return 59.0 + d * 0.02; // 59.0 -> 61.0 : enters Gemini ~day 50
    if (d < 200) return 61.0 - (d - 100) * 0.03; // 61.0 -> 58.0 : exits ~day 133
    return 58.0 + (d - 200) * 0.02; // 58.0 -> ... : re-enters ~day 300
  };
  const sampler: GocharSampler = (instant: Date) => {
    const prev = saturnLongitudeAt(new Date(instant.getTime() - 3600_000));
    const now = saturnLongitudeAt(instant);
    const samples = {} as Record<GocharGraha, GocharSample>;
    for (const g of GOCHAR_GRAHAS) {
      samples[g] = { longitude: 0, speed: 0 };
    }
    samples.SATURN = { longitude: now, speed: (now - prev) * 24 };
    return samples;
  };

  const win = enumerateSadeSatiWindow({
    sampler,
    from: QUERY,
    to: new Date(day(500)),
    isActive,
  });
  assert.equal(win.success, true);
  if (!win.success) throw new Error("unreachable");

  assert.equal(win.data.retrogradeReEntry, true, "two entries => retrograde re-entry");
  const entries = win.data.transitions.filter((t) => t.kind === "entry");
  const exits = win.data.transitions.filter((t) => t.kind === "exit");
  assert.equal(entries.length, 2, "first entry + re-entry");
  assert.equal(exits.length, 1, "one retrograde exit");
  assert.ok(win.data.firstEntryUtc && win.data.finalSettledEntryUtc);
  assert.notEqual(
    win.data.firstEntryUtc,
    win.data.finalSettledEntryUtc,
    "first entry differs from settled entry"
  );
  // ordering: firstEntry < exit < settledEntry
  assert.ok(
    Date.parse(win.data.firstEntryUtc!) < Date.parse(exits[0]!.atUtc) &&
      Date.parse(exits[0]!.atUtc) < Date.parse(win.data.finalSettledEntryUtc!)
  );
  // boundary accuracy at each crossing
  for (const t of win.data.transitions) {
    const lon = saturnLongitudeAt(new Date(t.atUtc));
    assert.ok(
      Math.abs(lon - entryBoundary) <= INGRESS_BOUNDARY_TOLERANCE_DEG,
      `crossing at ${t.atUtc} sits on the 60 deg boundary (got ${lon})`
    );
  }
  // the exit is retrograde-flagged (negative speed)
  assert.equal(exits[0]!.retrograde, true);

  // Single clean entry -> retrogradeReEntry false
  const clean = makeLinearSampler({ SATURN: { at: 59.0, degPerDay: 0.02 } });
  const cleanWin = enumerateSadeSatiWindow({
    sampler: clean,
    from: QUERY,
    to: new Date(day(200)),
    isActive,
  });
  assert.equal(cleanWin.success, true);
  if (cleanWin.success) {
    assert.equal(cleanWin.data.retrogradeReEntry, false);
    assert.equal(cleanWin.data.firstEntryUtc, cleanWin.data.finalSettledEntryUtc);
  }
  results.push("QA7 retrograde re-entry (entries/exits, settled dates, boundaries)");
}

// ============================================================================
// Output-shape + safety invariants (contract section 8)
// ============================================================================
{
  const snap = buildGocharSnapshot({
    natalMoonLongitude: 100.5,
    natalLagnaLongitude: 12.25,
    queryInstant: QUERY,
    sampler: makeLinearSampler({ SATURN: { at: 15, degPerDay: 0.03 } }),
    resolveIngress: false,
    resolveSadeSatiWindow: false,
  });
  assert.equal(snap.success, true);
  if (!snap.success) throw new Error("unreachable");
  const d = snap.data;

  assert.deepEqual(Object.keys(d).sort(), [
    "ayanamsa",
    "flags",
    "queryInstant",
    "referenceLagnaRashi",
    "referenceMoonRashi",
    "sadeSati",
    "saturnAffliction",
    "transits",
  ]);
  assert.equal(d.queryInstant, QUERY.toISOString(), "UTC ISO-8601");
  assert.equal(d.ayanamsa, "LAHIRI");
  assert.equal(d.flags.nodeModel, "TRUE_NODE");
  assert.equal(d.flags.sarvaBindu, null, "stable additive slot for Card 7");
  assert.equal(d.transits.length, 9, "all nine grahas present");
  assert.deepEqual(d.transits.map((t) => t.graha), [...GOCHAR_GRAHAS]);
  for (const t of d.transits) {
    assert.ok(t.rashi >= 0 && t.rashi <= 11, "rashi 0..11");
    assert.ok(t.houseFromMoon >= 1 && t.houseFromMoon <= 12, "house 1..12");
    assert.ok(t.houseFromLagna >= 1 && t.houseFromLagna <= 12, "house 1..12");
  }
  // Nodes always retrograde, excluded from speed test
  assert.equal(isRetrograde("RAHU", +0.05), true, "node retro regardless of +speed");
  assert.equal(isRetrograde("KETU", +0.05), true);
  assert.equal(isRetrograde("SATURN", +0.05), false);
  assert.equal(isRetrograde("SATURN", -0.05), true);

  // No interpretation/prediction/remedy text anywhere in the payload
  const serialized = JSON.stringify(d).toLowerCase();
  for (const banned of [
    "remedy", "remedies", "gemstone", "mantra", "donation", "prediction",
    "predict", "guaranteed", "severity", "danger", "misfortune", "suffer",
    "malefic effect", "you will", "verdict",
  ]) {
    assert.ok(!serialized.includes(banned), `payload must not contain "${banned}"`);
  }
  results.push("QA-shape section 8 fields, ranges, node retro, no-interpretation scan");
}

// ============================================================================
// Vedha deferral
// ============================================================================
{
  const off = resolveVedhaStatus(false);
  assert.equal(off.enabled, false);
  assert.equal(off.status, "disabled");
  assert.equal(off.pairs, null);

  const on = resolveVedhaStatus(true);
  assert.equal(on.enabled, true);
  assert.equal(on.status, "unavailable");
  assert.equal(on.pairs, null, "never fabricate vedha pairs");
  if (on.enabled) {
    assert.equal(on.code, "VEDHA_TABLE_NOT_CONFIGURED");
  }

  const snap = buildGocharSnapshot({
    natalMoonLongitude: 100.5,
    natalLagnaLongitude: 0,
    queryInstant: QUERY,
    enableVedha: true,
    sampler: makeLinearSampler({}),
    resolveIngress: false,
    resolveSadeSatiWindow: false,
  });
  assert.equal(snap.success, true);
  if (snap.success) {
    assert.equal(snap.data.flags.vedha.status, "unavailable");
    assert.equal(snap.data.flags.vedha.pairs, null);
  }
  results.push("QA-vedha deferred: VEDHA_TABLE_NOT_CONFIGURED, no guessed pairs");
}

// ============================================================================
// Honest failures (no fabrication)
// ============================================================================
{
  const badInstant = buildGocharSnapshot({
    natalMoonLongitude: 100,
    natalLagnaLongitude: 0,
    queryInstant: "not-a-date",
    sampler: makeLinearSampler({}),
  });
  assert.equal(badInstant.success, false);
  if (!badInstant.success) assert.equal(badInstant.issue.code, "INVALID_QUERY_INSTANT");

  const badMoon = buildGocharSnapshot({
    natalMoonLongitude: Number.NaN,
    natalLagnaLongitude: 0,
    queryInstant: QUERY,
    sampler: makeLinearSampler({}),
  });
  assert.equal(badMoon.success, false);
  if (!badMoon.success) {
    assert.equal(badMoon.issue.code, "INVALID_NATAL_MOON_LONGITUDE");
  }

  const noEphemeris = buildGocharSnapshot({
    natalMoonLongitude: 100,
    natalLagnaLongitude: 0,
    queryInstant: QUERY,
    sampler: () => null,
  });
  assert.equal(noEphemeris.success, false);
  if (!noEphemeris.success) {
    assert.equal(noEphemeris.issue.code, "EPHEMERIS_UNAVAILABLE");
  }
  results.push("QA-honest-failure invalid inputs + unavailable ephemeris");
}

// ============================================================================
// QA 8 + QA 9 — ephemeris-backed (require Swiss Ephemeris)
// ============================================================================
const ephemerisProbe = calculateCoreGrahaSiderealLongitudesAtUtc({ asOfUtc: QUERY });
const ephemerisAvailable = ephemerisProbe.success;

if (!ephemerisAvailable) {
  const reason = ephemerisProbe.success
    ? "unknown"
    : ephemerisProbe.issue.message.split("\n")[0];
  blocked.push(`QA8 ayanamsa consistency — ENV-BLOCKED (${reason})`);
  blocked.push(`QA9 reference chart Sade Sati window — ENV-BLOCKED (${reason})`);
} else {
  // QA 8 — Ayanamsa consistency: transit rashi == natal-engine rashi for the
  // same instant + ayanamsa (both read LAHIRI sidereal from the same service).
  assert.equal(ephemerisProbe.data.sidereal_mode, "LAHIRI");
  assert.equal(ephemerisProbe.data.zodiac_mode, "SIDEREAL");

  const natalLike = new Map(
    ephemerisProbe.data.planets.map((p) => [p.graha, p.sidereal_longitude] as const)
  );
  const samples = swissEphemerisSampler(QUERY);
  assert.ok(samples, "swiss sampler must produce samples when ephemeris is available");

  for (const graha of GOCHAR_GRAHAS) {
    const fromService = natalLike.get(graha);
    assert.ok(fromService !== undefined, `${graha} present in ephemeris output`);
    assert.equal(
      rashiIndex(samples![graha].longitude),
      rashiIndex(fromService!),
      `${graha} transit rashi matches natal-engine rashi (same instant/ayanamsa)`
    );
    assert.ok(
      Math.abs(samples![graha].longitude - fromService!) < 1e-9,
      `${graha} longitude identical to source service`
    );
  }
  // Ketu is exactly opposite Rahu (true-node model)
  const rahu = samples!.RAHU.longitude;
  const ketu = samples!.KETU.longitude;
  assert.ok(
    Math.abs((((ketu - rahu) % 360) + 360) % 360 - 180) < 1e-6,
    "Ketu = Rahu + 180 (true node model)"
  );
  results.push("QA8 ayanamsa/node consistency vs natal engine (LAHIRI, TRUE_NODE)");

  // QA 9 — Reference chart: full snapshot over the real ephemeris.
  const refMoon = 100.5;
  const refLagna = 12.25;
  const snap = buildGocharSnapshot({
    natalMoonLongitude: refMoon,
    natalLagnaLongitude: refLagna,
    queryInstant: QUERY,
  });
  assert.equal(snap.success, true, "reference chart snapshot must build");
  if (!snap.success) throw new Error("unreachable");

  assert.equal(snap.data.transits.length, 9);
  assert.equal(snap.data.ayanamsa, "LAHIRI");
  assert.equal(snap.data.sadeSati.saturnHouseFromMoon, houseFromMoon(
    samples!.SATURN.longitude,
    refMoon
  ));
  assert.equal(
    snap.data.sadeSati.active,
    isSadeSatiActive(snap.data.sadeSati.saturnHouseFromMoon)
  );
  // Every nextIngress must actually land on a 30 deg boundary.
  for (const t of snap.data.transits) {
    if (!t.nextIngress) continue;
    const s = swissEphemerisSampler(new Date(t.nextIngress.atUtc));
    assert.ok(s, "sampler at ingress instant");
    const lon = s![t.graha].longitude;
    const dist = Math.min(lon % 30, 30 - (lon % 30));
    assert.ok(
      dist <= INGRESS_BOUNDARY_TOLERANCE_DEG,
      `${t.graha} ingress ${t.nextIngress.atUtc} sits on a boundary (off by ${dist} deg)`
    );
    assert.equal(rashiIndex(lon), t.nextIngress.toRashi);
  }
  // If Sade Sati is active, boundary dates must be resolvable and ordered.
  const ss = snap.data.sadeSati;
  if (ss.firstEntryUtc && ss.finalExitUtc) {
    assert.ok(Date.parse(ss.firstEntryUtc) < Date.parse(ss.finalExitUtc));
  }
  if (ss.firstEntryUtc && ss.finalSettledEntryUtc) {
    assert.ok(Date.parse(ss.firstEntryUtc) <= Date.parse(ss.finalSettledEntryUtc));
    assert.equal(
      ss.retrogradeReEntry,
      ss.firstEntryUtc !== ss.finalSettledEntryUtc
    );
  }
  results.push("QA9 reference chart over real ephemeris (ingress on boundaries)");
}

// ============================================================================

console.log("gochar/sade-sati QA — PASSED:");
for (const r of results) console.log(`  ✓ ${r}`);

if (blocked.length > 0) {
  console.log("\nENVIRONMENT-BLOCKED (not a source defect; run in preview/CI on Node 22):");
  for (const b of blocked) console.log(`  ⏸ ${b}`);
}

console.log(
  `\ngochar QA summary: ${results.length} groups passed, ${blocked.length} environment-blocked.`
);
