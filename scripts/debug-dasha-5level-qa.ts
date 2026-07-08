import assert from "node:assert/strict";

import {
  calculateVimshottariMahadashaTimeline,
  getActiveDashaLineage,
  resolveVimshottariDashaPath,
  vimshottariDashaLevelNames,
} from "@/lib/astrology/rules/dasha";
import {
  dashaSequence,
  dashaYearsByLord,
  daysPerDashaYear,
  nakshatraSpanDegrees,
} from "@/lib/astrology/constants";
import { buildVimshottariActiveLineageForChartContext } from "@/modules/astrology/vimshottari-dasha";

const MS_PER_DAY = 86_400_000;

// Fixed deterministic inputs (no ephemeris, no DB):
// Moon at 100.5deg sidereal -> Pushya (index 7), ruler SATURN (19y),
// birth 1990-01-01T00:00:00Z, as-of 2026-07-07T00:00:00Z.
const MOON_LONGITUDE = 100.5;
const BIRTH_UTC = "1990-01-01T00:00:00.000Z";
const AS_OF_UTC = "2026-07-07T00:00:00.000Z";

function ms(iso: string) {
  return Date.parse(iso);
}

function spanMs(period: { startAtUtc: string; endAtUtc: string }) {
  return ms(period.endAtUtc) - ms(period.startAtUtc);
}

function assertSeamChain(
  parent: { startAtUtc: string; endAtUtc: string },
  children: ReadonlyArray<{ startAtUtc: string; endAtUtc: string }>,
  label: string
) {
  assert.ok(children.length > 0, `${label}: children must exist`);
  assert.equal(
    children[0]!.startAtUtc,
    parent.startAtUtc,
    `${label}: first child must start at parent start`
  );
  assert.equal(
    children[children.length - 1]!.endAtUtc,
    parent.endAtUtc,
    `${label}: last child must end at parent end`
  );

  for (let index = 0; index < children.length - 1; index += 1) {
    assert.equal(
      children[index]!.endAtUtc,
      children[index + 1]!.startAtUtc,
      `${label}: seam ${index} must have no gap/overlap`
    );
  }
}

// --- 0. Cycle invariants ------------------------------------------------------

const totalYears = Object.values(dashaYearsByLord).reduce((sum, y) => sum + y, 0);
assert.equal(totalYears, 120, "Vimshottari cycle must total 120 years");
assert.equal(dashaSequence.length, 9);
assert.equal(daysPerDashaYear, 365.2425, "PO-locked year length");

// --- 1. Golden balance + L1 preservation ---------------------------------------
// Independent recomputation of the documented spec (including the engine's
// 4dp rounding of degreesIntoNakshatra).

const expectedDegreesInto = Number(
  (MOON_LONGITUDE - 7 * nakshatraSpanDegrees).toFixed(4)
);
const expectedFraction = expectedDegreesInto / nakshatraSpanDegrees;
const expectedConsumedYears = 19 * expectedFraction;
const expectedRemainingYears = 19 - expectedConsumedYears;
const expectedFirstMahaEndIso = new Date(
  ms(BIRTH_UTC) + expectedRemainingYears * daysPerDashaYear * MS_PER_DAY
).toISOString();

const timelineResult = calculateVimshottariMahadashaTimeline({
  moonLongitude: MOON_LONGITUDE,
  birthDateUtc: BIRTH_UTC,
  asOfDateUtc: AS_OF_UTC,
});
assert.equal(timelineResult.success, true, "timeline must compute");
if (!timelineResult.success) throw new Error("unreachable");
const timeline = timelineResult.data;

assert.equal(timeline.moonNakshatra.name, "PUSHYA");
assert.equal(timeline.nakshatraLord, "SATURN");
assert.equal(
  timeline.birthBalance.remainingYears,
  Number(expectedRemainingYears.toFixed(6)),
  "birth balance remaining years"
);

const firstMaha = timeline.mahadashaPeriods[0]!;
assert.equal(firstMaha.planet, "SATURN");
assert.equal(firstMaha.startAtUtc, new Date(BIRTH_UTC).toISOString());
assert.equal(firstMaha.endAtUtc, expectedFirstMahaEndIso, "golden first maha end");

// First (birth-clipped) maha: only post-birth antardashas are visible.
assert.deepEqual(
  firstMaha.antardashas.map((a) => a.planet),
  ["SUN", "MOON", "MARS", "RAHU", "JUPITER"],
  "birth maha visible antardashas"
);
assert.equal(firstMaha.antardashas[0]!.startAtUtc, firstMaha.startAtUtc);

// --- 2. L1-L3 seam preservation (no gaps/overlaps at any level) ----------------

for (const maha of timeline.mahadashaPeriods) {
  assertSeamChain(maha, maha.antardashas, `maha ${maha.planet} antars`);

  for (const antar of maha.antardashas) {
    assertSeamChain(
      antar,
      antar.pratyantars,
      `maha ${maha.planet} antar ${antar.planet} pratyantars`
    );
  }
}

// --- 3. parent x childYears / 120 rule on a fully visible maha ----------------

const venusMaha = timeline.mahadashaPeriods.find((m) => m.planet === "VENUS")!;
assert.ok(venusMaha, "Venus maha must exist in first cycle");
assert.equal(venusMaha.antardashas.length, 9);
for (const antar of venusMaha.antardashas.slice(0, -1)) {
  const expectedYears = (20 * dashaYearsByLord[antar.planet]) / 120;
  const actualYears = spanMs(antar) / MS_PER_DAY / daysPerDashaYear;
  assert.ok(
    Math.abs(actualYears - expectedYears) < 1e-6,
    `Venus antar ${antar.planet} duration rule`
  );
}

// --- 4. Boundary: start inclusive / end exclusive ------------------------------

const boundaryIso = firstMaha.endAtUtc;
const atBoundary = calculateVimshottariMahadashaTimeline({
  moonLongitude: MOON_LONGITUDE,
  birthDateUtc: BIRTH_UTC,
  asOfDateUtc: boundaryIso,
});
const beforeBoundary = calculateVimshottariMahadashaTimeline({
  moonLongitude: MOON_LONGITUDE,
  birthDateUtc: BIRTH_UTC,
  asOfDateUtc: new Date(ms(boundaryIso) - 1).toISOString(),
});
assert.ok(atBoundary.success && beforeBoundary.success);
if (atBoundary.success && beforeBoundary.success) {
  assert.equal(
    atBoundary.data.activeMahadasha?.planet,
    "MERCURY",
    "at boundary instant the NEXT period is active (start inclusive)"
  );
  assert.equal(
    beforeBoundary.data.activeMahadasha?.planet,
    "SATURN",
    "1ms before boundary the previous period is active (end exclusive)"
  );
}

// --- 5. Active 5-level lineage --------------------------------------------------

const lineageResult = getActiveDashaLineage({
  moonLongitude: MOON_LONGITUDE,
  birthDateUtc: BIRTH_UTC,
  asOfDateUtc: AS_OF_UTC,
});
assert.equal(lineageResult.success, true, "active lineage must resolve");
if (!lineageResult.success) throw new Error("unreachable");
const lineage = lineageResult.data;

assert.equal(lineage.levels.length, 5);
assert.equal(lineage.mahadasha.planet, "VENUS", "2026-07-07 is in Venus maha");
const asOfMs = ms(AS_OF_UTC);

for (let index = 0; index < 5; index += 1) {
  const node = lineage.levels[index]!;
  assert.equal(node.level, index + 1);
  assert.equal(node.levelName, vimshottariDashaLevelNames[index]);
  assert.equal(node.isActive, true);
  assert.equal(node.lineage.length, index + 1);
  assert.ok(node.lineagePath.startsWith("Venus"), "lineagePath title case");
  assert.equal(
    node.lineagePath,
    node.lineage
      .map((l) => l.charAt(0) + l.slice(1).toLowerCase())
      .join(" > ")
  );
  assert.ok(
    asOfMs >= ms(node.startAtUtc) && asOfMs < ms(node.endAtUtc),
    `asOf inside level ${index + 1} window`
  );

  if (index > 0) {
    const parent = lineage.levels[index - 1]!;
    assert.ok(
      ms(node.startAtUtc) >= ms(parent.startAtUtc) &&
        ms(node.endAtUtc) <= ms(parent.endAtUtc),
      `level ${index + 1} nested inside level ${index}`
    );
    assert.deepEqual(node.lineage.slice(0, -1), parent.lineage);
  }
}

assert.equal(lineage.sookshma.level, 4);
assert.equal(lineage.prana.level, 5);

// --- 6. Path resolver ------------------------------------------------------------

// 6a. Empty lineage -> first-cycle mahadashas (level 1), bounded at 9.
const rootPath = resolveVimshottariDashaPath({
  moonLongitude: MOON_LONGITUDE,
  birthDateUtc: BIRTH_UTC,
  asOfDateUtc: AS_OF_UTC,
  lineage: [],
});
assert.equal(rootPath.success, true);
if (!rootPath.success) throw new Error("unreachable");
assert.equal(rootPath.data.target, null);
assert.equal(rootPath.data.children.length, 9);
assert.deepEqual(
  rootPath.data.children.map((c) => c.planet),
  ["SATURN", "MERCURY", "KETU", "VENUS", "SUN", "MOON", "MARS", "RAHU", "JUPITER"]
);
assert.equal(rootPath.data.children[0]!.startAtUtc, firstMaha.startAtUtc);

// Full cycle duration check: 120 years from the (pre-birth) full start of the
// birth maha to the end of the 9th maha.
const cycleYears =
  (ms(rootPath.data.children[8]!.endAtUtc) -
    ms(timeline.birthBalance.periodStartAtUtc)) /
  MS_PER_DAY /
  daysPerDashaYear;
assert.ok(Math.abs(cycleYears - 120) < 1e-6, "first full cycle spans 120y");

// 6b. Refactor equivalence: path children of the birth maha === timeline antars.
const saturnPath = resolveVimshottariDashaPath({
  moonLongitude: MOON_LONGITUDE,
  birthDateUtc: BIRTH_UTC,
  asOfDateUtc: AS_OF_UTC,
  lineage: ["SATURN"],
});
assert.equal(saturnPath.success, true);
if (!saturnPath.success) throw new Error("unreachable");
assert.equal(saturnPath.data.target?.planet, "SATURN");
assert.equal(saturnPath.data.target?.level, 1);
assert.deepEqual(
  saturnPath.data.children.map((c) => ({
    planet: c.planet,
    startAtUtc: c.startAtUtc,
    endAtUtc: c.endAtUtc,
  })),
  firstMaha.antardashas.map((a) => ({
    planet: a.planet,
    startAtUtc: a.startAtUtc,
    endAtUtc: a.endAtUtc,
  })),
  "path-resolver antars must equal timeline antars (refactor equivalence)"
);

// 6c. Clipped pre-birth branch -> honest PATH_NOT_FOUND (never fabricated).
const clippedPath = resolveVimshottariDashaPath({
  moonLongitude: MOON_LONGITUDE,
  birthDateUtc: BIRTH_UTC,
  asOfDateUtc: AS_OF_UTC,
  lineage: ["SATURN", "VENUS"],
});
assert.equal(clippedPath.success, false);
if (!clippedPath.success) {
  assert.equal(clippedPath.issue.code, "PATH_NOT_FOUND");
}

// 6d. Venus maha children sum exactly to the maha window.
const venusPath = resolveVimshottariDashaPath({
  moonLongitude: MOON_LONGITUDE,
  birthDateUtc: BIRTH_UTC,
  asOfDateUtc: AS_OF_UTC,
  lineage: ["VENUS"],
});
assert.equal(venusPath.success, true);
if (!venusPath.success) throw new Error("unreachable");
assertSeamChain(
  { startAtUtc: venusMaha.startAtUtc, endAtUtc: venusMaha.endAtUtc },
  venusPath.data.children,
  "Venus maha path children"
);

// --- 7. L4 Sookshma + L5 Prana for the active path -------------------------------

const activeLords = lineage.levels.map((node) => node.planet);

// 7a. Sookshma children (level 4) of the active pratyantar.
const sookshmaPath = resolveVimshottariDashaPath({
  moonLongitude: MOON_LONGITUDE,
  birthDateUtc: BIRTH_UTC,
  asOfDateUtc: AS_OF_UTC,
  lineage: activeLords.slice(0, 3),
});
assert.equal(sookshmaPath.success, true);
if (!sookshmaPath.success) throw new Error("unreachable");
assert.equal(sookshmaPath.data.target?.level, 3);
assert.equal(sookshmaPath.data.children.length, 9);
assert.ok(sookshmaPath.data.children.every((c) => c.level === 4));
assertSeamChain(
  sookshmaPath.data.target!,
  sookshmaPath.data.children,
  "sookshma chain"
);
const activeSookshmaFromPath = sookshmaPath.data.children.find((c) => c.isActive);
assert.ok(activeSookshmaFromPath, "active sookshma present");
assert.equal(activeSookshmaFromPath!.planet, lineage.sookshma.planet);
assert.equal(activeSookshmaFromPath!.startAtUtc, lineage.sookshma.startAtUtc);

// 7b. Legacy day-dasha window agreement (active pratyantar is fully visible in
// 2026, so the shipped visible-split equals the full-split sookshma).
const dayDashaPeriods = timeline.currentDayDashaContext?.dayDashaPeriods ?? [];
assert.equal(dayDashaPeriods.length, sookshmaPath.data.children.length);
assert.deepEqual(
  dayDashaPeriods.map((p) => p.planet),
  sookshmaPath.data.children.map((c) => c.planet)
);
assert.deepEqual(
  dayDashaPeriods.map((p) => p.startAtUtc),
  sookshmaPath.data.children.map((c) => c.startAtUtc),
  "legacy day-dasha equals sookshma on a fully-visible pratyantar"
);

// 7c. Prana children (level 5) of the active sookshma + duration rule.
const pranaPath = resolveVimshottariDashaPath({
  moonLongitude: MOON_LONGITUDE,
  birthDateUtc: BIRTH_UTC,
  asOfDateUtc: AS_OF_UTC,
  lineage: activeLords.slice(0, 4),
});
assert.equal(pranaPath.success, true);
if (!pranaPath.success) throw new Error("unreachable");
assert.equal(pranaPath.data.target?.level, 4);
assert.equal(pranaPath.data.children.length, 9);
assert.ok(pranaPath.data.children.every((c) => c.level === 5));
assertSeamChain(pranaPath.data.target!, pranaPath.data.children, "prana chain");

const sookshmaFullYears =
  spanMs(pranaPath.data.target!) / MS_PER_DAY / daysPerDashaYear;
for (const prana of pranaPath.data.children.slice(0, -1)) {
  const expectedMs =
    ((sookshmaFullYears * dashaYearsByLord[prana.planet]) / 120) *
    daysPerDashaYear *
    MS_PER_DAY;
  assert.ok(
    Math.abs(spanMs(prana) - expectedMs) <= 5,
    `prana ${prana.planet} duration rule (parent x years / 120)`
  );
}

const activePrana = pranaPath.data.children.find((c) => c.isActive);
assert.ok(activePrana, "active prana present");
assert.equal(activePrana!.planet, lineage.prana.planet);
assert.equal(activePrana!.startAtUtc, lineage.prana.startAtUtc);
assert.equal(activePrana!.lineage.length, 5);

// --- 8. Payload bounds (no 5-level tree explosion) --------------------------------

assert.ok(
  JSON.stringify(lineage).length < 6000,
  "active lineage payload stays small"
);
assert.ok(
  pranaPath.data.children.every((child) => !("children" in child)),
  "deep periods must be flat (no nested children arrays)"
);
assert.ok(pranaPath.data.children.length <= 9);

// --- 9. Honest failures (no fabrication) ------------------------------------------

const nanLineage = getActiveDashaLineage({
  moonLongitude: Number.NaN,
  birthDateUtc: BIRTH_UTC,
});
assert.equal(nanLineage.success, false);
if (!nanLineage.success) {
  assert.equal(nanLineage.issue.code, "INVALID_MOON_LONGITUDE");
}

const preBirth = getActiveDashaLineage({
  moonLongitude: MOON_LONGITUDE,
  birthDateUtc: BIRTH_UTC,
  asOfDateUtc: "1980-01-01T00:00:00.000Z",
});
assert.equal(preBirth.success, false);
if (!preBirth.success) {
  assert.equal(preBirth.issue.code, "NO_ACTIVE_PERIOD");
}

const badLineage = resolveVimshottariDashaPath({
  moonLongitude: MOON_LONGITUDE,
  birthDateUtc: BIRTH_UTC,
  lineage: ["VENUS", "VENUS", "VENUS", "VENUS", "VENUS"] as never,
});
assert.equal(badLineage.success, false);
if (!badLineage.success) {
  assert.equal(badLineage.issue.code, "INVALID_LINEAGE");
}

const missingMoonChart = buildVimshottariActiveLineageForChartContext({
  chart: {
    birth_context: { birth_utc: BIRTH_UTC },
    planets: [{ name: "Sun", longitude: 10, nakshatra: "ASHWINI" }],
    verification: { is_verified_for_chart_logic: true },
  },
});
assert.equal(missingMoonChart.success, false);
if (!missingMoonChart.success) {
  assert.equal(missingMoonChart.error.code, "MOON_PLANET_MISSING");
}

const nullChart = buildVimshottariActiveLineageForChartContext({ chart: null });
assert.equal(nullChart.success, false);
if (!nullChart.success) {
  assert.equal(nullChart.error.code, "INVALID_CHART_CONTEXT");
}

// --- 10. Wrapper happy path ---------------------------------------------------------

const wrapperLineage = buildVimshottariActiveLineageForChartContext({
  chart: {
    birth_context: { birth_utc: BIRTH_UTC },
    planets: [{ name: "Moon", longitude: MOON_LONGITUDE, nakshatra: "PUSHYA" }],
    verification: { is_verified_for_chart_logic: true },
  },
  asOfDateUtc: AS_OF_UTC,
});
assert.equal(wrapperLineage.success, true);
if (wrapperLineage.success) {
  assert.equal(wrapperLineage.data.prana.planet, lineage.prana.planet);
}

console.log(
  "dasha 5-level QA: cycle invariants, golden balance, L1-L3 preservation, boundaries, active lineage, path resolver, L4 sookshma, L5 prana, payload bounds, and honest-failure checks passed."
);
