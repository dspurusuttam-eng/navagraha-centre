import assert from "node:assert/strict";

import {
  ASHTAKAVARGA_PLANETS,
  ASHTAKAVARGA_REFERENCES,
  BAV_CHECKSUMS,
  BENEFIC_HOUSES,
  SAV_CHECKSUM,
  SIGNS_IN_ZODIAC,
  buildAshtakavargaSnapshot,
  computeBhinnashtakavarga,
  computeSarvashtakavarga,
  houseFromLagnaSign,
  normalizeSignIndex,
  rashiIndexFromLongitude,
  signFromHouse,
  type AshtakavargaChartContext,
  type AshtakavargaReference,
} from "@/modules/astrology/ashtakavarga";

const results: string[] = [];

function makeReferenceSigns(
  overrides: Partial<Record<AshtakavargaReference, number>> = {}
): Record<AshtakavargaReference, number> {
  const base = {} as Record<AshtakavargaReference, number>;
  for (const ref of ASHTAKAVARGA_REFERENCES) {
    base[ref] = 0;
  }
  return { ...base, ...overrides };
}

/** Build a minimal verified chart context placing each body at a chosen sign. */
function makeChart(
  signByName: Record<string, number>,
  lagnaSign: number
): AshtakavargaChartContext {
  return {
    birth_context: { birth_utc: "1990-01-01T00:00:00.000Z" },
    lagna: { longitude: lagnaSign * 30 + 5, sign: "" },
    verification: { is_verified_for_chart_logic: true },
    planets: Object.entries(signByName).map(([name, sign]) => ({
      name,
      longitude: sign * 30 + 10,
    })),
  };
}

// ============================================================================
// Table integrity (checksums) — the strongest correctness net
// ============================================================================
{
  let savFromTables = 0;
  for (const planet of ASHTAKAVARGA_PLANETS) {
    let planetTotal = 0;
    for (const ref of ASHTAKAVARGA_REFERENCES) {
      const houses = BENEFIC_HOUSES[planet][ref];
      // every house in 1..12, no duplicates
      const unique = new Set(houses);
      assert.equal(unique.size, houses.length, `${planet}/${ref} has duplicate houses`);
      for (const h of houses) {
        assert.ok(h >= 1 && h <= 12, `${planet}/${ref} house ${h} out of range`);
      }
      planetTotal += houses.length;
    }
    assert.equal(
      planetTotal,
      BAV_CHECKSUMS[planet],
      `${planet} table total ${planetTotal} != checksum ${BAV_CHECKSUMS[planet]}`
    );
    savFromTables += planetTotal;
  }
  assert.equal(savFromTables, SAV_CHECKSUM, "sum of planet tables must equal 337");
  assert.equal(
    Object.values(BAV_CHECKSUMS).reduce((a, b) => a + b, 0),
    337
  );
  results.push("table integrity: per-planet totals + SAV 337 (checksum-pinned)");
}

// ============================================================================
// QA1 — determinism
// ============================================================================
{
  const chart = makeChart(
    { Sun: 3, Moon: 6, Mars: 0, Mercury: 4, Jupiter: 8, Venus: 2, Saturn: 9 },
    11
  );
  const a = buildAshtakavargaSnapshot({ chart });
  const b = buildAshtakavargaSnapshot({ chart });
  assert.equal(a.success, true);
  assert.equal(b.success, true);
  if (a.success && b.success) {
    assert.equal(JSON.stringify(a.data), JSON.stringify(b.data));
  }
  results.push("QA1 determinism");
}

// ============================================================================
// QA2 — all 7 classical planets produce a BAV; QA3 nodes excluded;
// QA4 12 slots; QA5 per-planet checksums; QA6 SAV = 337
// ============================================================================
{
  // Randomized-but-valid placements: totals are placement-INDEPENDENT.
  let seed = 12345;
  const rng = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % 12;
  };

  for (let trial = 0; trial < 200; trial += 1) {
    const referenceSigns = makeReferenceSigns();
    for (const ref of ASHTAKAVARGA_REFERENCES) {
      referenceSigns[ref] = rng();
    }

    const bavs = ASHTAKAVARGA_PLANETS.map((p) =>
      computeBhinnashtakavarga(p, referenceSigns)
    );

    // QA2 + QA4 + QA5
    assert.equal(bavs.length, 7, "exactly 7 BAVs");
    for (const bav of bavs) {
      assert.equal(bav.signBindus.length, SIGNS_IN_ZODIAC, "12 sign slots");
      for (const cell of bav.signBindus) {
        assert.ok(cell >= 0 && cell <= 8, `BAV cell ${cell} out of 0..8`);
      }
      assert.equal(
        bav.total,
        BAV_CHECKSUMS[bav.planet],
        `${bav.planet} total must equal checksum regardless of placement`
      );
    }

    // QA6
    const sav = computeSarvashtakavarga(bavs);
    assert.equal(sav.signBindus.length, 12);
    for (const cell of sav.signBindus) {
      assert.ok(cell >= 0 && cell <= 56, `SAV cell ${cell} out of 0..56`);
    }
    assert.equal(sav.total, SAV_CHECKSUM, "SAV total must equal 337");
  }

  // QA3 — Rahu/Ketu excluded from planets and references
  assert.equal((ASHTAKAVARGA_PLANETS as readonly string[]).includes("RAHU"), false);
  assert.equal((ASHTAKAVARGA_PLANETS as readonly string[]).includes("KETU"), false);
  assert.equal((ASHTAKAVARGA_REFERENCES as readonly string[]).includes("RAHU"), false);
  assert.equal((ASHTAKAVARGA_REFERENCES as readonly string[]).includes("KETU"), false);
  results.push(
    "QA2/3/4/5/6 — 7 planets, nodes excluded, 12 slots, checksums, SAV 337 (200 placements)"
  );
}

// ============================================================================
// QA7 — Prastara matrix dimensions + contribution sums
// ============================================================================
{
  const referenceSigns = makeReferenceSigns({
    SUN: 2, MOON: 5, MARS: 7, MERCURY: 1, JUPITER: 9, VENUS: 3, SATURN: 11, LAGNA: 0,
  });

  for (const planet of ASHTAKAVARGA_PLANETS) {
    const bav = computeBhinnashtakavarga(planet, referenceSigns);
    assert.equal(bav.prastara.length, 8, `${planet} prastara has 8 rows`);

    let matrixSum = 0;
    bav.prastara.forEach((row, index) => {
      const ref = ASHTAKAVARGA_REFERENCES[index];
      assert.equal(row.reference, ref, "row reference order matches");
      assert.equal(row.contributions.length, 12, "12 columns");
      for (const cell of row.contributions) {
        assert.ok(cell === 0 || cell === 1, "prastara cells are {0,1}");
      }
      const rowSum = row.contributions.reduce((a, b) => a + b, 0);
      assert.equal(
        rowSum,
        BENEFIC_HOUSES[planet][ref].length,
        `${planet}/${ref} row sum equals benefic-house count`
      );
      matrixSum += rowSum;
    });

    assert.equal(matrixSum, bav.total, `${planet} prastara sum equals BAV total`);
    // signBindus is the column-sum of prastara
    for (let sign = 0; sign < 12; sign += 1) {
      const colSum = bav.prastara.reduce((a, row) => a + row.contributions[sign], 0);
      assert.equal(colSum, bav.signBindus[sign], `${planet} sign ${sign} column sum`);
    }
  }
  results.push("QA7 prastara 8x12 {0,1}, row sums = benefic counts, columns = BAV");
}

// ============================================================================
// QA8 — Lagna reference handling (index math + house rotation + Lagna counted)
// ============================================================================
{
  // signFromHouse wrap-around
  assert.equal(signFromHouse(11, 2), 0, "Pisces + 2nd house wraps to Aries");
  assert.equal(signFromHouse(0, 1), 0, "1st house from Aries is Aries");
  assert.equal(signFromHouse(0, 12), 11, "12th from Aries is Pisces");
  assert.equal(normalizeSignIndex(-1), 11);
  assert.equal(normalizeSignIndex(12), 0);

  // house-from-lagna rotation
  assert.equal(houseFromLagnaSign(0, 0), 1, "lagna sign is house 1");
  assert.equal(houseFromLagnaSign(3, 0), 4);
  assert.equal(houseFromLagnaSign(0, 3), 10);

  // Lagna genuinely contributes: dropping its row reduces each planet total by
  // exactly the Lagna row size.
  const refs = makeReferenceSigns({ SUN: 1, MOON: 2, MARS: 3, MERCURY: 4, JUPITER: 5, VENUS: 6, SATURN: 7, LAGNA: 8 });
  for (const planet of ASHTAKAVARGA_PLANETS) {
    const bav = computeBhinnashtakavarga(planet, refs);
    const lagnaRow = bav.prastara.find((r) => r.reference === "LAGNA")!;
    const lagnaRowSum = lagnaRow.contributions.reduce((a, b) => a + b, 0);
    assert.equal(
      lagnaRowSum,
      BENEFIC_HOUSES[planet].LAGNA.length,
      `${planet} lagna contribution present`
    );
  }

  // SAV byHouse rotates correctly: house 1 sign == lagnaSign
  const chart = makeChart(
    { Sun: 3, Moon: 6, Mars: 0, Mercury: 4, Jupiter: 8, Venus: 2, Saturn: 9 },
    5
  );
  const snap = buildAshtakavargaSnapshot({ chart });
  assert.equal(snap.success, true);
  if (snap.success) {
    const house1 = snap.data.sav.byHouse.find((h) => h.house === 1)!;
    assert.equal(house1.sign, 5, "house 1 sign equals lagna sign");
    assert.equal(snap.data.sav.byHouse.length, 12);
    assert.equal(snap.data.flags.lagnaAsReference, true);
  }
  results.push("QA8 lagna reference: index math, house rotation, lagna counted");
}

// ============================================================================
// QA9 — missing/incomplete natal payload returns unavailable honestly
// ============================================================================
{
  assert.equal(buildAshtakavargaSnapshot({ chart: null }).success, false);

  const unverified = buildAshtakavargaSnapshot({
    chart: {
      lagna: { longitude: 10 },
      planets: [{ name: "Sun", longitude: 10 }],
      verification: { is_verified_for_chart_logic: false },
    },
  });
  assert.equal(unverified.success, false);
  if (!unverified.success) assert.equal(unverified.error.code, "UNVERIFIED_CHART_CONTEXT");

  const noLagna = buildAshtakavargaSnapshot({
    chart: {
      lagna: {},
      planets: ASHTAKAVARGA_PLANETS.map((p, i) => ({ name: p, longitude: i * 30 })),
      verification: { is_verified_for_chart_logic: true },
    },
  });
  assert.equal(noLagna.success, false);
  if (!noLagna.success) assert.equal(noLagna.error.code, "MISSING_LAGNA_SIGN");

  const missingMars = buildAshtakavargaSnapshot({
    chart: {
      lagna: { longitude: 10 },
      planets: [
        { name: "Sun", longitude: 10 },
        { name: "Moon", longitude: 40 },
        // Mars omitted
        { name: "Mercury", longitude: 100 },
        { name: "Jupiter", longitude: 130 },
        { name: "Venus", longitude: 160 },
        { name: "Saturn", longitude: 190 },
      ],
      verification: { is_verified_for_chart_logic: true },
    },
  });
  assert.equal(missingMars.success, false);
  if (!missingMars.success) assert.equal(missingMars.error.code, "MISSING_PLANET_SIGN");
  results.push("QA9 honest unavailable: null, unverified, missing lagna, missing planet");
}

// ============================================================================
// QA10 — no interpretation/prediction/remedy/fear text in output
// ============================================================================
{
  const chart = makeChart(
    { Sun: 3, Moon: 6, Mars: 0, Mercury: 4, Jupiter: 8, Venus: 2, Saturn: 9 },
    5
  );
  const snap = buildAshtakavargaSnapshot({ chart });
  assert.equal(snap.success, true);
  if (snap.success) {
    // shape
    assert.equal(snap.data.system, "ASHTAKAVARGA");
    assert.equal(snap.data.status, "complete");
    assert.equal(snap.data.reduction, "none");
    assert.equal(snap.data.ayanamsa, "LAHIRI");
    assert.equal(snap.data.bav.length, 7);
    assert.equal(snap.data.sav.total, 337);
    assert.equal(snap.data.totals.savTotal, 337);
    assert.equal(snap.data.sarvaBindu.total, 337);
    assert.deepEqual(snap.data.sarvaBindu.signBindus, snap.data.sav.signBindus);
    assert.equal(snap.data.flags.checksumsVerified, true);
    assert.equal(snap.data.flags.nodesIncluded, false);

    const serialized = JSON.stringify(snap.data).toLowerCase();
    for (const banned of [
      "prediction", "predict", "remedy", "remedies", "gemstone", "mantra",
      "donation", "fear", "guaranteed", "misfortune", "suffer", "verdict",
      "auspicious", "inauspicious", "malefic effect", "you will", "good luck",
    ]) {
      assert.ok(!serialized.includes(banned), `output must not contain "${banned}"`);
    }
  }
  results.push("QA10 output shape + no-interpretation scan");
}

// ============================================================================
// rashiIndexFromLongitude — sign boundary behavior
// ============================================================================
{
  assert.equal(rashiIndexFromLongitude(0), 0);
  assert.equal(rashiIndexFromLongitude(29.999), 0);
  assert.equal(rashiIndexFromLongitude(30), 1);
  assert.equal(rashiIndexFromLongitude(359.999), 11);
  assert.equal(rashiIndexFromLongitude(360), 0);
  assert.equal(rashiIndexFromLongitude(-0.001), 11);
  results.push("sign-boundary indexing (0/30/360 wrap)");
}

console.log("ashtakavarga QA — PASSED:");
for (const r of results) console.log(`  ✓ ${r}`);
console.log(`\nashtakavarga QA summary: ${results.length} groups passed.`);
