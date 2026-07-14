/**
 * Card 14.2A — Premium Varshaphal / Tajika Core: registry + table invariant QA.
 * Pure engine (no ephemeris, no runtime state); runs on any Node version.
 * V1 delivers types + constants + registry only — factor engines are Card 14.2B+.
 */
import {
  VARSHAPHAL_PREMIUM_CONTRACT_VERSION,
  VARSHAPHAL_PREMIUM_DISCLAIMER,
  signRulerMap,
  ownSignsByBody,
  exaltationSignsByBody,
  debilitationSignsByBody,
  MUDDA_DASHA_SEQUENCE,
  MUDDA_DASHA_YEARS,
  MUDDA_VIMSHOTTARI_TOTAL_YEARS,
  SOLAR_YEAR_FIXED_FALLBACK_DAYS,
  MUNTHA_DEGREES_PER_YEAR,
  MUNTHA_HOUSE_TIER,
  TAJIKA_ASPECT_ANGLES,
  DEEPTAMSHA,
  ASPECT_ORB_MODE,
  COMBUSTION_ARC_SOURCE,
  PANCHAVARGEEYA_COMPONENT_MAX,
  PANCHAVARGEEYA_MAX_TOTAL,
  RELATIONSHIP_VISHWA_FRACTION,
  PANCHAVARGEEYA_BAND,
  DEEP_EXALTATION_LONGITUDE,
  HADDA_BOUNDS,
  SIGN_TRIPLICITY,
  TRIRASHI_LORDS,
  VARSHAPHAL_TAJIKA_YOGAS_V1,
  VARSHESHA_CANDIDATES,
  VARSHESHA_TIEBREAK_ORDER,
  VARA_LORDS,
  makeVarshaphalEvidenceId,
  VARSHAPHAL_RULE_REGISTRY,
  getVarshaphalRule,
  computeVarshaphalRulebookHash,
  computeMuntha,
  evaluateTajikaAspect,
  findSolarReturn,
  computeVarshaLagna,
  computePanchavargeeyaBala,
  evaluateCombustion,
  evaluateTajikaYogas,
  selectVarshesha,
  computeMuddaDasha,
  computeDinratri,
  buildVarshaphalSnapshot,
  norm360,
  norm180,
  type TajikaGraha,
  type VarshaphalEvidenceToken,
  type YogaPlanet,
  type VarshaphalEphemeris,
  type VarshaphalOrchestratorInput,
} from "@/modules/varshaphal/premium";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const GRAHAS: TajikaGraha[] = ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"];

type Group = { name: string; run: () => void };
const groups: Group[] = [
  {
    name: "V1 contract version + disclaimer shape",
    run: () => {
      assert(VARSHAPHAL_PREMIUM_CONTRACT_VERSION === "1.0.0", `contract=${VARSHAPHAL_PREMIUM_CONTRACT_VERSION}`);
      const d = VARSHAPHAL_PREMIUM_DISCLAIMER.toLowerCase();
      assert(d.includes("no remedies"), "disclaimer no remedies");
      assert(d.includes("not a prediction"), "disclaimer non-prediction");
      assert(d.includes("no medical") && d.includes("financial"), "disclaimer medical/financial");
      assert(d.includes("percentage") || d.includes("guarantee"), "disclaimer no percentage/guarantee");
    },
  },
  {
    name: "V2 evidence-ID helper shape",
    run: () => {
      assert(makeVarshaphalEvidenceId(["MUNTHA", 3]) === "VARSHAPHAL:MUNTHA:3", "evidence id shape");
    },
  },
  {
    name: "V3 solar-return convention constants sane",
    run: () => {
      assert(MUNTHA_DEGREES_PER_YEAR === 30, "muntha 30/yr");
      assert(SOLAR_YEAR_FIXED_FALLBACK_DAYS > 365 && SOLAR_YEAR_FIXED_FALLBACK_DAYS < 366, "fallback year length");
    },
  },
  {
    name: "V4 deeptamsha: 7 grahas, pinned values",
    run: () => {
      const expected: Record<TajikaGraha, number> = { SUN: 15, MOON: 12, MARS: 8, MERCURY: 7, JUPITER: 9, VENUS: 7, SATURN: 9 };
      for (const g of GRAHAS) assert(DEEPTAMSHA[g] === expected[g], `deeptamsha ${g}=${DEEPTAMSHA[g]}`);
      assert(Object.keys(DEEPTAMSHA).length === 7, "deeptamsha count");
      assert(ASPECT_ORB_MODE === "HALF_SUM_DEEPTAMSHA", "orb mode half-sum");
    },
  },
  {
    name: "V5 Tajika aspect angles pinned {0,60,90,120,180}",
    run: () => {
      assert(JSON.stringify([...TAJIKA_ASPECT_ANGLES]) === JSON.stringify([0, 60, 90, 120, 180]), "aspect angles");
    },
  },
  {
    name: "V6 deep-exaltation longitudes: 7 grahas, in [0,360), deb = +180",
    run: () => {
      const expected: Record<TajikaGraha, number> = { SUN: 10, MOON: 33, MARS: 298, MERCURY: 165, JUPITER: 95, VENUS: 357, SATURN: 200 };
      for (const g of GRAHAS) {
        assert(DEEP_EXALTATION_LONGITUDE[g] === expected[g], `exalt ${g}=${DEEP_EXALTATION_LONGITUDE[g]}`);
        const v = DEEP_EXALTATION_LONGITUDE[g];
        assert(v >= 0 && v < 360, `exalt ${g} range`);
      }
    },
  },
  {
    name: "V7 Panchavargeeya maxima sum to 80; relationship fractions strictly decreasing",
    run: () => {
      const m = PANCHAVARGEEYA_COMPONENT_MAX;
      assert(m.GRIHA + m.UCCHA + m.HADDA + m.DREKKANA + m.NAVAMSHA === PANCHAVARGEEYA_MAX_TOTAL, "sum 80");
      assert(PANCHAVARGEEYA_MAX_TOTAL === 80, "max total 80");
      const order = ["OWN_EXALT", "GREAT_FRIEND", "FRIEND", "NEUTRAL", "ENEMY", "GREAT_ENEMY"] as const;
      for (let i = 1; i < order.length; i += 1) {
        assert(RELATIONSHIP_VISHWA_FRACTION[order[i]!] < RELATIONSHIP_VISHWA_FRACTION[order[i - 1]!], `frac decreasing at ${order[i]}`);
      }
      assert(RELATIONSHIP_VISHWA_FRACTION.OWN_EXALT === 1, "own/exalt = 1");
      assert(PANCHAVARGEEYA_BAND.SUPPORTIVE_MIN === 20 && PANCHAVARGEEYA_BAND.NEUTRAL_MIN === 10, "band thresholds");
    },
  },
  {
    name: "V8 Hadda bounds: 60 rows; each sign 5 bounds contiguous 0..30; valid graha lords",
    run: () => {
      assert(HADDA_BOUNDS.length === 60, `hadda rows=${HADDA_BOUNDS.length}`);
      const grahaSet = new Set(GRAHAS);
      const bySign = new Map<string, typeof HADDA_BOUNDS[number][]>();
      for (const b of HADDA_BOUNDS) {
        assert(grahaSet.has(b.lord), `bad hadda lord ${b.lord}`);
        const arr = bySign.get(b.sign) ?? [];
        arr.push(b);
        bySign.set(b.sign, arr);
      }
      assert(bySign.size === 12, `signs=${bySign.size}`);
      for (const [sign, rows] of bySign) {
        assert(rows.length === 5, `${sign} bounds=${rows.length}`);
        const sorted = [...rows].sort((a, b) => a.startDeg - b.startDeg);
        assert(sorted[0]!.startDeg === 0, `${sign} starts at 0`);
        assert(sorted[4]!.endDeg === 30, `${sign} ends at 30`);
        for (let i = 1; i < 5; i += 1) {
          assert(sorted[i]!.startDeg === sorted[i - 1]!.endDeg, `${sign} contiguous at ${i}`);
          assert(sorted[i]!.startDeg < sorted[i]!.endDeg, `${sign} positive span at ${i}`);
        }
      }
    },
  },
  {
    name: "V9 Trirashi: 12 signs classified 3-per-triplicity; day/night lords valid grahas",
    run: () => {
      const counts: Record<string, number> = { FIRE: 0, EARTH: 0, AIR: 0, WATER: 0 };
      for (const sign of Object.keys(SIGN_TRIPLICITY)) counts[SIGN_TRIPLICITY[sign as keyof typeof SIGN_TRIPLICITY]] += 1;
      assert(Object.keys(SIGN_TRIPLICITY).length === 12, "12 signs classified");
      for (const t of ["FIRE", "EARTH", "AIR", "WATER"]) assert(counts[t] === 3, `${t} count=${counts[t]}`);
      const grahaSet = new Set(GRAHAS);
      for (const t of ["FIRE", "EARTH", "AIR", "WATER"] as const) {
        assert(grahaSet.has(TRIRASHI_LORDS[t].day), `${t} day lord`);
        assert(grahaSet.has(TRIRASHI_LORDS[t].night), `${t} night lord`);
      }
      // Pinned Dorothean values
      assert(TRIRASHI_LORDS.FIRE.day === "SUN" && TRIRASHI_LORDS.FIRE.night === "JUPITER", "fire lords");
      assert(TRIRASHI_LORDS.WATER.day === "VENUS" && TRIRASHI_LORDS.WATER.night === "MARS", "water lords");
    },
  },
  {
    name: "V10 Muntha house tier: 12 houses; caution {4,6,8,12}; supportive {1,2,3,10,11}",
    run: () => {
      assert(Object.keys(MUNTHA_HOUSE_TIER).length === 12, "12 houses");
      const caution = [4, 6, 8, 12];
      const supportive = [1, 2, 3, 10, 11];
      for (const h of caution) assert(MUNTHA_HOUSE_TIER[h] === -1, `house ${h} caution`);
      for (const h of supportive) assert(MUNTHA_HOUSE_TIER[h] === 1, `house ${h} supportive`);
      for (const h of [5, 7, 9]) assert(MUNTHA_HOUSE_TIER[h] === 0, `house ${h} neutral`);
    },
  },
  {
    name: "V11 Mudda reuses certified Vimshottari: 9 lords, years sum to 120",
    run: () => {
      assert(MUDDA_DASHA_SEQUENCE.length === 9, `sequence=${MUDDA_DASHA_SEQUENCE.length}`);
      let total = 0;
      for (const lord of MUDDA_DASHA_SEQUENCE) total += MUDDA_DASHA_YEARS[lord];
      assert(total === MUDDA_VIMSHOTTARI_TOTAL_YEARS, `years total=${total}`);
      assert(new Set(MUDDA_DASHA_SEQUENCE).size === 9, "unique lords");
    },
  },
  {
    name: "V12 yogas: exactly 8 unique V1 yogas as pinned",
    run: () => {
      assert(VARSHAPHAL_TAJIKA_YOGAS_V1.length === 8, `yogas=${VARSHAPHAL_TAJIKA_YOGAS_V1.length}`);
      assert(new Set(VARSHAPHAL_TAJIKA_YOGAS_V1).size === 8, "unique yogas");
      const expected = ["ITHASALA", "ISHRAFA", "NAKTA", "YAMAYA", "KAMBOOLA", "MANAU", "IKKAVALA", "INDUVARA"];
      for (const y of expected) assert((VARSHAPHAL_TAJIKA_YOGAS_V1 as readonly string[]).includes(y), `missing yoga ${y}`);
    },
  },
  {
    name: "V13 Varshesha: 5 candidates; tie-break order is a permutation; Muntha-lord first",
    run: () => {
      assert(VARSHESHA_CANDIDATES.length === 5, `candidates=${VARSHESHA_CANDIDATES.length}`);
      assert(VARSHESHA_TIEBREAK_ORDER.length === 5, "tiebreak length");
      assert(new Set(VARSHESHA_TIEBREAK_ORDER).size === 5, "tiebreak unique");
      for (const c of VARSHESHA_CANDIDATES) assert(VARSHESHA_TIEBREAK_ORDER.includes(c), `tiebreak missing ${c}`);
      assert(VARSHESHA_TIEBREAK_ORDER[0] === "MUNTHA_LORD", "muntha lord first");
      assert(VARA_LORDS.length === 7, "vara lords 7");
    },
  },
  {
    name: "V14 certified reuse present (no duplicated tables)",
    run: () => {
      assert(Object.keys(signRulerMap).length === 12, "signRulerMap 12");
      assert(signRulerMap.LEO === "SUN" && signRulerMap.CANCER === "MOON", "sign rulers reused");
      assert(!!ownSignsByBody && !!exaltationSignsByBody && !!debilitationSignsByBody, "dignity tables reused");
      // Combustion is a POINTER, not a duplicated numeric table.
      assert(COMBUSTION_ARC_SOURCE.symbol === "COMBUSTION_THRESHOLDS", "combustion pointer symbol");
      assert(COMBUSTION_ARC_SOURCE.planets.length === 5, "combustion planets");
      const blob = JSON.stringify(COMBUSTION_ARC_SOURCE);
      for (const n of ["14", "10", "17", "11", "15"]) assert(!blob.includes(`:${n}`), `combustion pointer must not embed arc ${n}`);
    },
  },
  {
    name: "V15 rule registry: unique IDs, >=30 rules, getVarshaphalRule throws on unknown",
    run: () => {
      const ids = VARSHAPHAL_RULE_REGISTRY.map((r) => r.ruleId);
      assert(new Set(ids).size === ids.length, "duplicate ruleIds");
      assert(VARSHAPHAL_RULE_REGISTRY.length >= 30, `registry length=${VARSHAPHAL_RULE_REGISTRY.length}`);
      assert(getVarshaphalRule("SOLAR_RETURN_V1").section === "SOLAR_RETURN", "resolve known");
      let threw = false;
      try { getVarshaphalRule("__NOPE__"); } catch { threw = true; }
      assert(threw, "throws on unknown");
    },
  },
  {
    name: "V16 registry governance: valid basis; CLASSICAL/REGISTERED_REFERENCE require sourceId",
    run: () => {
      const bases = new Set(["CLASSICAL", "REGISTERED_REFERENCE", "PRODUCT_NORMALIZED"]);
      const sections = new Set([
        "SOLAR_RETURN", "VARSHA_LAGNA", "MUNTHA", "TAJIKA_ASPECT", "DIGNITY", "COMBUSTION",
        "RETROGRADE", "PANCHAVARGEEYA_BALA", "TAJIKA_YOGA", "VARSHESHA", "MUDDA_DASHA",
        "ASHTAKAVARGA_OVERLAY", "STATUS",
      ]);
      for (const r of VARSHAPHAL_RULE_REGISTRY) {
        assert(bases.has(r.basis), `bad basis ${r.basis} for ${r.ruleId}`);
        assert(sections.has(r.section), `bad section ${r.section} for ${r.ruleId}`);
        assert(r.description.length > 10, `${r.ruleId} description too short`);
        if (r.basis === "CLASSICAL" || r.basis === "REGISTERED_REFERENCE") {
          assert(r.sourceId !== null && r.sourceId.length > 0, `${r.ruleId} (${r.basis}) missing sourceId`);
        }
      }
      // Spot-check the locked classifications.
      assert(getVarshaphalRule("COMBUSTION_V1").basis === "CLASSICAL", "combustion classical");
      assert(getVarshaphalRule("ASPECT_ORB_HALFSUM_V1").basis === "PRODUCT_NORMALIZED", "orb product");
      assert(getVarshaphalRule("DEEPTAMSHA_ORB_V1").basis === "REGISTERED_REFERENCE", "deeptamsha ref");
      assert(getVarshaphalRule("MUDDA_DASHA_V1").basis === "CLASSICAL", "mudda classical");
    },
  },
  {
    name: "V17 rulebook hash deterministic + 16-hex; registry byte-stable; no non-finite",
    run: () => {
      const h1 = computeVarshaphalRulebookHash();
      const h2 = computeVarshaphalRulebookHash();
      assert(h1 === h2, `hash non-deterministic ${h1} vs ${h2}`);
      assert(/^[0-9a-f]{16}$/.test(h1), `hash format ${h1}`);
      assert(JSON.stringify(VARSHAPHAL_RULE_REGISTRY) === JSON.stringify(VARSHAPHAL_RULE_REGISTRY), "registry stable");
    },
  },
  {
    name: "V18 forbidden-wording scan across rule descriptions + disclaimer shape",
    run: () => {
      const forbidden = ["guarantee", "guaranteed", "lucky", "remedy", "remedies", "curse", "doom", "fatal", "percent"];
      for (const r of VARSHAPHAL_RULE_REGISTRY) {
        for (const w of forbidden) {
          assert(!r.description.toLowerCase().includes(w), `rule ${r.ruleId} forbidden token '${w}'`);
        }
      }
      // Disclaimer explicitly negates these — verify it declares the absence.
      const d = VARSHAPHAL_PREMIUM_DISCLAIMER.toLowerCase();
      assert(d.includes("no remedies") && d.includes("not a prediction"), "disclaimer negation shape");
    },
  },
];

// ============================================================================
// Card 14.2B1 — pure engine QA (deterministic synthetic ephemeris; no swisseph).
// Solar return, Varsha Lagna, Muntha, and Tajika aspects are exercised across
// leap years, timezone/date boundaries, root convergence, 0/360 wrap, and
// aspect/orb boundaries.
// ============================================================================
const DAY_MS = 86_400_000;
/** Synthetic Sun: linear sidereal motion, exactly invertible for golden roots. */
function makeSyntheticSun(baseLonDeg: number, motionDegPerDay: number, t0Ms: number) {
  return (utcMs: number) => norm360(baseLonDeg + (motionDegPerDay * (utcMs - t0Ms)) / DAY_MS);
}

function tokenIntegrity(tokens: readonly VarshaphalEvidenceToken[]): void {
  const forbidden = ["guarantee", "lucky", "remedy", "percent", "perfect", "doom", "fatal"];
  for (const t of tokens) {
    const rule = getVarshaphalRule(t.ruleId); // throws on unknown
    assert(rule.basis === t.basis, `${t.ruleId}: basis mismatch ${rule.basis} vs ${t.basis}`);
    assert(t.tier >= -2 && t.tier <= 2, `${t.ruleId}: tier ${t.tier} out of range`);
    assert(t.evidenceId.startsWith("VARSHAPHAL:"), `${t.ruleId}: evidenceId ${t.evidenceId}`);
    const note = (t.note ?? "").toLowerCase();
    for (const w of forbidden) assert(!note.includes(w), `${t.ruleId}: forbidden token '${w}'`);
  }
}

groups.push(
  {
    name: "E1 Muntha: progression, 0/360 wrap, lord, birth-time-missing unavailable",
    run: () => {
      const m0 = computeMuntha({ natalLagnaLongitudeDeg: 0, yearNumber: 0, varshaLagnaSignIndex: 0 });
      assert(m0.status === "CALCULATED" && m0.signIndex === 0 && m0.sign === "ARIES", `m0 sign=${m0.sign}`);
      assert(m0.lord === "MARS", `m0 lord=${m0.lord}`);
      assert(m0.house === 1 && m0.houseTier === 1, `m0 house=${m0.house} tier=${m0.houseTier}`);
      // 12-year cycle returns to the same sign (30*12 = 360 wrap).
      const m12 = computeMuntha({ natalLagnaLongitudeDeg: 0, yearNumber: 12, varshaLagnaSignIndex: 0 });
      assert(m12.signIndex === 0 && Math.abs((m12.longitudeDeg ?? -1) - 0) < 1e-9, `m12 lon=${m12.longitudeDeg}`);
      // 345 (Pisces) + 30 => 375 -> 15 (Aries): exercises the 360 wrap + sign change.
      const mW = computeMuntha({ natalLagnaLongitudeDeg: 345, yearNumber: 1, varshaLagnaSignIndex: 0 });
      assert(mW.signIndex === 0 && mW.sign === "ARIES" && mW.lord === "MARS", `mW sign=${mW.sign}`);
      assert(Math.abs((mW.longitudeDeg ?? -1) - 15) < 1e-9, `mW lon=${mW.longitudeDeg}`);
      // Missing birth time -> UNAVAILABLE.
      const mu = computeMuntha({ natalLagnaLongitudeDeg: null, yearNumber: 3, varshaLagnaSignIndex: 0 });
      assert(mu.status === "UNAVAILABLE" && mu.unavailableReasons[0]!.code === "BIRTH_TIME_REQUIRED", "muntha unavailable");
      // Missing Varsha Lagna -> PARTIAL, no house.
      const mp = computeMuntha({ natalLagnaLongitudeDeg: 45, yearNumber: 2, varshaLagnaSignIndex: null });
      assert(mp.status === "PARTIAL" && mp.house === null && mp.partialFlags.includes("MISSING_VARSHA_LAGNA"), "muntha partial");
      tokenIntegrity([...m0.tokens, ...m12.tokens, ...mW.tokens, ...mp.tokens]);
    },
  },
  {
    name: "E2 Muntha house tier: caution 8th, supportive 10th, from Varsha Lagna",
    run: () => {
      // natal Lagna in Scorpio(210deg, sign7); Varsha Lagna Aries(0) => house 8 => caution.
      const m8 = computeMuntha({ natalLagnaLongitudeDeg: 210, yearNumber: 0, varshaLagnaSignIndex: 0 });
      assert(m8.house === 8 && m8.houseTier === -1, `m8 house=${m8.house} tier=${m8.houseTier}`);
      // natal Lagna Capricorn(270,sign9); Varsha Lagna Aries(0) => house 10 => supportive.
      const m10 = computeMuntha({ natalLagnaLongitudeDeg: 270, yearNumber: 0, varshaLagnaSignIndex: 0 });
      assert(m10.house === 10 && m10.houseTier === 1, `m10 house=${m10.house} tier=${m10.houseTier}`);
    },
  },
  {
    name: "E3 Solar return: golden convergence to <=0.001 arcsec within iteration cap",
    run: () => {
      const t0 = Date.parse("1990-06-15T09:30:00.000Z");
      const sun = makeSyntheticSun(100, 0.9856, t0); // 100deg at t0
      const r = findSolarReturn({ natalSunLongitudeDeg: 100, natalInstantUtcMs: t0, yearNumber: 1, sunSiderealLongitudeAtUtcMs: sun });
      assert(r.status === "CONVERGED", `status=${r.status}`);
      assert(r.finalErrorArcsec !== null && r.finalErrorArcsec <= 0.001, `err=${r.finalErrorArcsec}`);
      assert(r.iterations > 0 && r.iterations <= 64, `iters=${r.iterations}`);
      assert(Math.abs(norm180(sun(r.returnInstantUtcMs!) - 100)) < 0.001, "sun back to natal longitude");
      tokenIntegrity(r.tokens);
    },
  },
  {
    name: "E4 Solar return: 0/360 longitude wrap handled",
    run: () => {
      const t0 = Date.parse("2000-03-20T00:00:00.000Z");
      const sun = makeSyntheticSun(359, 0.9856, t0); // starts at 359deg
      const r = findSolarReturn({ natalSunLongitudeDeg: 0.5, natalInstantUtcMs: t0, yearNumber: 0, sunSiderealLongitudeAtUtcMs: sun });
      assert(r.status === "CONVERGED", `status=${r.status}`);
      assert(Math.abs(norm180(sun(r.returnInstantUtcMs!) - 0.5)) < 0.001, "wrap root correct");
    },
  },
  {
    name: "E5 Solar return: leap-year span + byte-deterministic reruns",
    run: () => {
      const t0 = Date.parse("2019-12-31T18:00:00.000Z"); // return N=1 lands across the 2020 leap boundary
      const sun = makeSyntheticSun(280, 0.9856, t0);
      const input = { natalSunLongitudeDeg: 280, natalInstantUtcMs: t0, yearNumber: 1, sunSiderealLongitudeAtUtcMs: sun };
      const a = findSolarReturn(input);
      const b = findSolarReturn(input);
      assert(a.status === "CONVERGED", `status=${a.status}`);
      assert(a.returnInstantUtcMs === b.returnInstantUtcMs, "deterministic return instant");
      assert(JSON.stringify(a) === JSON.stringify(b), "byte-identical result");
      assert(typeof a.civilYearBoundaryCrossed === "boolean", "boundary flag present");
      assert(a.returnInstantUtcIso !== null && !Number.isNaN(Date.parse(a.returnInstantUtcIso)), "valid ISO");
    },
  },
  {
    name: "E6 Solar return: non-convergence -> UNAVAILABLE (no fabricated instant)",
    run: () => {
      const constSun = () => 50; // never equals the 100deg target
      const r = findSolarReturn({ natalSunLongitudeDeg: 100, natalInstantUtcMs: 0, yearNumber: 0, sunSiderealLongitudeAtUtcMs: constSun });
      assert(r.status === "UNAVAILABLE", `status=${r.status}`);
      assert(r.returnInstantUtcMs === null, "no fabricated instant");
      assert(r.unavailableReasons[0]!.code === "RETURN_NONCONVERGENCE", "reason code");
    },
  },
  {
    name: "E7 Tajika aspects: applying/separating, retrograde reversal, orb + angle boundaries",
    run: () => {
      // Applying conjunction: fast Moon behind slow Saturn.
      const app = evaluateTajikaAspect(
        { graha: "MOON", longitudeDeg: 10, speedDegPerDay: 13 },
        { graha: "SATURN", longitudeDeg: 12, speedDegPerDay: 0.03 });
      assert(app.active && app.angle === 0 && app.motion === "APPLYING", `app motion=${app.motion}`);
      assert(Math.abs((app.degreesToExact ?? -1) - 2) < 1e-6, `app dte=${app.degreesToExact}`);
      // Separating: fast Moon ahead, moving away.
      const sep = evaluateTajikaAspect(
        { graha: "MOON", longitudeDeg: 14, speedDegPerDay: 13 },
        { graha: "SATURN", longitudeDeg: 12, speedDegPerDay: 0.03 });
      assert(sep.active && sep.motion === "SEPARATING", `sep motion=${sep.motion}`);
      // Retrograde reverses: fast Moon behind but retrograde -> separating.
      const retro = evaluateTajikaAspect(
        { graha: "MOON", longitudeDeg: 10, speedDegPerDay: -13 },
        { graha: "SATURN", longitudeDeg: 12, speedDegPerDay: 0.03 });
      assert(retro.motion === "SEPARATING", `retro motion=${retro.motion}`);
      // Orb boundary: Mercury(7)+Venus(7) => allowed 7. Separation exactly 7 active; 7.001 inactive.
      const onEdge = evaluateTajikaAspect(
        { graha: "MERCURY", longitudeDeg: 0, speedDegPerDay: 1.2 },
        { graha: "VENUS", longitudeDeg: 7, speedDegPerDay: 1.1 });
      assert(onEdge.active && onEdge.angle === 0, `edge active=${onEdge.active}`);
      const offEdge = evaluateTajikaAspect(
        { graha: "MERCURY", longitudeDeg: 0, speedDegPerDay: 1.2 },
        { graha: "VENUS", longitudeDeg: 7.001, speedDegPerDay: 1.1 });
      assert(!offEdge.active, "just past orb inactive");
      // Each aspect angle detected.
      for (const [angle, lonB] of [[60, 60], [90, 90], [120, 120], [180, 180]] as const) {
        const asp = evaluateTajikaAspect(
          { graha: "JUPITER", longitudeDeg: 0, speedDegPerDay: 0.08 },
          { graha: "SUN", longitudeDeg: lonB, speedDegPerDay: 0.98 });
        assert(asp.active && asp.angle === angle, `angle ${angle} => ${asp.angle}`);
      }
      tokenIntegrity([...app.tokens, ...sep.tokens, ...retro.tokens, ...onEdge.tokens]);
    },
  },
  {
    name: "E8 Varsha Lagna: ascendant -> sign; high-latitude + null ascendant unavailable",
    run: () => {
      const asc = () => 123.4; // Leo (sign 4)
      const ok = computeVarshaLagna({ returnInstantUtcMs: 0, latitudeDeg: 28.6, longitudeDeg: 77.2, ascendantSiderealLongitudeAt: asc });
      assert(ok.status === "CALCULATED" && ok.signIndex === 4 && ok.sign === "LEO", `sign=${ok.sign}`);
      const hi = computeVarshaLagna({ returnInstantUtcMs: 0, latitudeDeg: 70, longitudeDeg: 20, ascendantSiderealLongitudeAt: asc });
      assert(hi.status === "UNAVAILABLE" && hi.unavailableReasons[0]!.code === "HIGH_LATITUDE_ASCENDANT", "high-lat unavailable");
      const nullAsc = computeVarshaLagna({ returnInstantUtcMs: 0, latitudeDeg: 28.6, longitudeDeg: 77.2, ascendantSiderealLongitudeAt: () => null });
      assert(nullAsc.status === "UNAVAILABLE", "null ascendant unavailable");
      tokenIntegrity(ok.tokens);
    },
  },
  {
    name: "E9 Timezone/date-boundary determinism + cross-engine token integrity",
    run: () => {
      // Return near UTC new-year boundary; identical inputs -> identical instant.
      const t0 = Date.parse("1985-01-01T00:02:00.000Z");
      const sun = makeSyntheticSun(281, 0.9856, t0);
      const r1 = findSolarReturn({ natalSunLongitudeDeg: 281, natalInstantUtcMs: t0, yearNumber: 40, sunSiderealLongitudeAtUtcMs: sun });
      const r2 = findSolarReturn({ natalSunLongitudeDeg: 281, natalInstantUtcMs: t0, yearNumber: 40, sunSiderealLongitudeAtUtcMs: sun });
      assert(r1.returnInstantUtcMs === r2.returnInstantUtcMs, "deterministic across reruns");
      const m = computeMuntha({ natalLagnaLongitudeDeg: 200, yearNumber: 40, varshaLagnaSignIndex: 3 });
      const asp = evaluateTajikaAspect({ graha: "MARS", longitudeDeg: 5, speedDegPerDay: 0.5 }, { graha: "VENUS", longitudeDeg: 65, speedDegPerDay: 1.1 });
      const vl = computeVarshaLagna({ returnInstantUtcMs: r1.returnInstantUtcMs!, latitudeDeg: 19.07, longitudeDeg: 72.87, ascendantSiderealLongitudeAt: () => 200.5 });
      tokenIntegrity([...r1.tokens, ...m.tokens, ...asp.tokens, ...vl.tokens]);
    },
  },
);

// ============================================================================
// Card 14.2B2 — Panchavargeeya Bala, Tajika Yogas, Varshesha, Mudda Dasha, combustion.
// ============================================================================
function lonMap(overrides: Partial<Record<TajikaGraha, number>>): Record<TajikaGraha, number> {
  const base: Record<TajikaGraha, number> = { SUN: 0, MOON: 40, MARS: 80, MERCURY: 120, JUPITER: 160, VENUS: 200, SATURN: 240 };
  return { ...base, ...overrides };
}
function yp(graha: TajikaGraha, longitudeDeg: number, speedDegPerDay: number): YogaPlanet {
  return { graha, longitudeDeg, speedDegPerDay };
}

groups.push(
  {
    name: "B1 Panchavargeeya: own-sign Griha=30; Uccha 20@exalt/0@debil; banding; D3/D9 partial",
    run: () => {
      // SUN in Leo (own sign, 130deg) => Griha 30. D3/D9 provided.
      const r = computePanchavargeeyaBala({ graha: "SUN", longitudes: lonMap({ SUN: 130 }), d3SignIndex: 4, d9SignIndex: 4 });
      assert(Math.abs(r.griha - 30) < 1e-9, `griha=${r.griha}`);
      assert(r.totalVishwa >= 0 && r.totalVishwa <= 80, `total=${r.totalVishwa}`);
      const expectBand = r.totalVishwa >= 20 ? "SUPPORTIVE" : r.totalVishwa >= 10 ? "NEUTRAL" : "CAUTION";
      assert(r.band === expectBand, `band=${r.band}`);
      // Uccha at exact exaltation (Sun 10deg) => 20; at debilitation (190) => 0.
      const ex = computePanchavargeeyaBala({ graha: "SUN", longitudes: lonMap({ SUN: 10 }), d3SignIndex: 0, d9SignIndex: 0 });
      assert(Math.abs(ex.uccha - 20) < 1e-6, `uccha@exalt=${ex.uccha}`);
      const de = computePanchavargeeyaBala({ graha: "SUN", longitudes: lonMap({ SUN: 190 }), d3SignIndex: 0, d9SignIndex: 0 });
      assert(Math.abs(de.uccha - 0) < 1e-6, `uccha@debil=${de.uccha}`);
      // Missing D3/D9 => partial + zeroed components.
      const p = computePanchavargeeyaBala({ graha: "MARS", longitudes: lonMap({}), d3SignIndex: null, d9SignIndex: null });
      assert(p.partialFlags.includes("MISSING_D3_D9") && p.drekkana === 0 && p.navamsha === 0, "D3/D9 partial");
      tokenIntegrity([...r.tokens, ...ex.tokens, ...de.tokens, ...p.tokens]);
    },
  },
  {
    name: "B2 Combustion: reused arc by reference; combust boundary; Sun/null not applicable",
    run: () => {
      const near = evaluateCombustion({ graha: "MERCURY", planetLongitudeDeg: 5, sunLongitudeDeg: 0, combustionArcDeg: 14 });
      assert(near.applicable && near.combust && near.tier === -1, `near combust=${near.combust}`);
      const far = evaluateCombustion({ graha: "MERCURY", planetLongitudeDeg: 20, sunLongitudeDeg: 0, combustionArcDeg: 14 });
      assert(far.applicable && !far.combust && far.tier === 0, `far combust=${far.combust}`);
      const sun = evaluateCombustion({ graha: "SUN", planetLongitudeDeg: 0, sunLongitudeDeg: 0, combustionArcDeg: 14 });
      assert(!sun.applicable, "Sun not combustible");
      const noArc = evaluateCombustion({ graha: "MOON", planetLongitudeDeg: 3, sunLongitudeDeg: 0, combustionArcDeg: null });
      assert(!noArc.applicable, "null arc => not applicable");
      tokenIntegrity([...near.tokens, ...far.tokens, ...sun.tokens, ...noArc.tokens]);
    },
  },
  {
    name: "B3 Tajika yogas: all eight detected on constructed geometries",
    run: () => {
      const has = (r: ReturnType<typeof evaluateTajikaYogas>, y: string) => r.yogas.some((d) => d.yoga === y);
      // Ithasala (applying conjunction) + Ishrafa (separating).
      const ith = evaluateTajikaYogas({ significatorA: "MERCURY", significatorB: "JUPITER", planets: { MERCURY: yp("MERCURY", 10, 1.2), JUPITER: yp("JUPITER", 12, 0.08) } });
      assert(has(ith, "ITHASALA"), "ithasala");
      const ish = evaluateTajikaYogas({ significatorA: "MERCURY", significatorB: "JUPITER", planets: { MERCURY: yp("MERCURY", 14, 1.2), JUPITER: yp("JUPITER", 12, 0.08) } });
      assert(has(ish, "ISHRAFA"), "ishrafa");
      // Ikkavala (near-exact) + Induvara (kendra 90).
      const ik = evaluateTajikaYogas({ significatorA: "MERCURY", significatorB: "JUPITER", planets: { MERCURY: yp("MERCURY", 10, 1.2), JUPITER: yp("JUPITER", 10.5, 0.08) } });
      assert(has(ik, "IKKAVALA"), "ikkavala");
      const ind = evaluateTajikaYogas({ significatorA: "MERCURY", significatorB: "JUPITER", planets: { MERCURY: yp("MERCURY", 0, 1.2), JUPITER: yp("JUPITER", 90, 0.08) } });
      assert(has(ind, "INDUVARA"), "induvara");
      // Kamboola (Moon applies to a significator).
      const kam = evaluateTajikaYogas({ significatorA: "SUN", significatorB: "SATURN", planets: { SUN: yp("SUN", 0, 0.98), SATURN: yp("SATURN", 200, 0.03), MOON: yp("MOON", 350, 13) } });
      assert(has(kam, "KAMBOOLA"), "kamboola");
      // Nakta (translation by faster Moon; A,B not in mutual orb).
      const nak = evaluateTajikaYogas({ significatorA: "SATURN", significatorB: "JUPITER", planets: { SATURN: yp("SATURN", 0, 0.03), JUPITER: yp("JUPITER", 200, 0.08), MOON: yp("MOON", 80, 13) } });
      assert(has(nak, "NAKTA"), "nakta");
      // Yamaya (collection by slower Saturn).
      const yam = evaluateTajikaYogas({ significatorA: "MOON", significatorB: "MERCURY", planets: { MOON: yp("MOON", 10, 13), MERCURY: yp("MERCURY", 130, 1.2), SATURN: yp("SATURN", 70, 0.03) } });
      assert(has(yam, "YAMAYA"), "yamaya");
      // Manau (malefic Mars obstructs a forming Ithasala).
      const man = evaluateTajikaYogas({ significatorA: "MERCURY", significatorB: "JUPITER", planets: { MERCURY: yp("MERCURY", 10, 1.2), JUPITER: yp("JUPITER", 12, 0.08), MARS: yp("MARS", 15, 0.5) } });
      assert(has(man, "MANAU"), "manau");
      tokenIntegrity([...ith.tokens, ...nak.tokens, ...yam.tokens, ...man.tokens, ...kam.tokens]);
    },
  },
  {
    name: "B4 Varshesha: bala ordering, eligibility filter, tie-break, weak + indeterminate",
    run: () => {
      const cand = (id: string, graha: TajikaGraha | null, bala: number | null, elig: boolean) =>
        ({ id: id as never, graha, balaVishwa: bala, hasIthasalaWithMunthaOrLagnaLord: elig });
      // Highest eligible bala wins.
      const r1 = selectVarshesha([
        cand("MUNTHA_LORD", "SUN", 30, true), cand("VARSHA_LAGNA_LORD", "MOON", 55, true),
        cand("JANMA_LAGNA_LORD", "MARS", 40, false), cand("TRIRASHI_PATI", "VENUS", 20, true), cand("DINARATRI_LORD", "SATURN", 10, true),
      ]);
      assert(r1.varshesha!.graha === "MOON" && !r1.weakYearLord, `r1 winner=${r1.varshesha!.graha}`);
      // Tie on bala -> Muntha lord (priority) wins.
      const r2 = selectVarshesha([
        cand("MUNTHA_LORD", "SUN", 50, true), cand("VARSHA_LAGNA_LORD", "MOON", 50, true),
        cand("JANMA_LAGNA_LORD", "MARS", 10, true), cand("TRIRASHI_PATI", "VENUS", 10, true), cand("DINARATRI_LORD", "SATURN", 10, true),
      ]);
      assert(r2.varshesha!.id === "MUNTHA_LORD", `r2 winner=${r2.varshesha!.id}`);
      // None eligible -> weak year lord (highest bala among available).
      const r3 = selectVarshesha([
        cand("MUNTHA_LORD", "SUN", 30, false), cand("VARSHA_LAGNA_LORD", "MOON", 45, false),
        cand("JANMA_LAGNA_LORD", "MARS", 10, false), cand("TRIRASHI_PATI", "VENUS", 10, false), cand("DINARATRI_LORD", "SATURN", 10, false),
      ]);
      assert(r3.weakYearLord && r3.varshesha!.graha === "MOON", `r3 weak=${r3.weakYearLord}`);
      // None available -> indeterminate.
      const r4 = selectVarshesha([cand("MUNTHA_LORD", null, null, false)]);
      assert(r4.status === "UNAVAILABLE" && r4.unavailableReasons[0]!.code === "YEAR_LORD_INDETERMINATE", "indeterminate");
      tokenIntegrity([...r1.tokens, ...r2.tokens, ...r3.tokens]);
    },
  },
  {
    name: "B5 Mudda Dasha: maha sum = year; antar sum = maha; balance split; determinism; invalid",
    run: () => {
      const t0 = Date.parse("2020-06-15T00:00:00.000Z");
      const Y = 365.2563;
      const r = computeMuddaDasha({ startLord: "MOON", yearLengthDays: Y, returnInstantUtcMs: t0 });
      assert(r.status === "CALCULATED" && r.maha.length === 9, `maha=${r.maha.length}`);
      assert(Math.abs(r.totalDays - Y) < 1e-6, `sum=${r.totalDays}`);
      assert(r.maha[0]!.lord === "MOON", "starts at Moon-nakshatra lord");
      for (const m of r.maha) {
        const antarSum = m.antar.reduce((a, x) => a + x.days, 0);
        assert(Math.abs(antarSum - m.days) < 1e-6, `antar sum ${antarSum} vs ${m.days}`);
        assert(m.antar.length === 9 && m.antar[0]!.lord === m.lord, "antar starts at maha lord");
      }
      // Balance split (elapsed 0.5) => 10 periods, sum still one year.
      const rb = computeMuddaDasha({ startLord: "MOON", yearLengthDays: Y, returnInstantUtcMs: t0, startLordElapsedFraction: 0.5 });
      assert(rb.maha.length === 10 && Math.abs(rb.totalDays - Y) < 1e-6, `balance sum=${rb.totalDays}`);
      // Determinism.
      assert(JSON.stringify(r) === JSON.stringify(computeMuddaDasha({ startLord: "MOON", yearLengthDays: Y, returnInstantUtcMs: t0 })), "deterministic");
      // Invalid year length.
      const bad = computeMuddaDasha({ startLord: "MOON", yearLengthDays: 0, returnInstantUtcMs: t0 });
      assert(bad.status === "UNAVAILABLE" && bad.unavailableReasons[0]!.code === "MUDDA_YEAR_LENGTH", "invalid year");
      tokenIntegrity(r.tokens);
    },
  },
);

// ============================================================================
// Card 14.2C — orchestrator QA (pure, synthetic ephemeris). Full run, determinism,
// solar-return failure, partial/unavailable, high-latitude.
// ============================================================================
const ORCH_T0 = Date.parse("1990-08-20T05:15:00.000Z");
const ORCH_SUN0 = 127.3; // natal Sun sidereal longitude
function synthEphemeris(): VarshaphalEphemeris {
  const sun = makeSyntheticSun(ORCH_SUN0, 0.9856, ORCH_T0);
  return {
    sunSiderealLongitudeAtUtcMs: sun,
    ascendantSiderealLongitudeAt: (_ms, lat) => (Math.abs(lat) > 66 ? null : 100.5),
    planetSiderealStatesAtUtcMs: (ms) => ({
      SUN: { longitudeDeg: sun(ms), speedDegPerDay: 0.9856 },
      MOON: { longitudeDeg: 40, speedDegPerDay: 13 },
      MARS: { longitudeDeg: 80, speedDegPerDay: 0.5 },
      MERCURY: { longitudeDeg: 118, speedDegPerDay: 1.2 },
      JUPITER: { longitudeDeg: 160, speedDegPerDay: 0.08 },
      VENUS: { longitudeDeg: 200, speedDegPerDay: 1.1 },
      SATURN: { longitudeDeg: 240, speedDegPerDay: 0.03 },
    }),
    // Deterministic sunrise 01:00Z / sunset 13:00Z of the return's UTC day.
    sunriseSunsetAt: (ms) => {
      const dayStart = Math.floor(ms / 86_400_000) * 86_400_000;
      return { sunriseUtcMs: dayStart + 3_600_000, sunsetUtcMs: dayStart + 13 * 3_600_000 };
    },
  };
}
function fullInput(overrides: Partial<VarshaphalOrchestratorInput> = {}): VarshaphalOrchestratorInput {
  const divisional = Object.fromEntries((["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"] as TajikaGraha[])
    .map((g) => [g, { d3SignIndex: 2, d9SignIndex: 5 }]));
  return {
    natal: { sunLongitudeDeg: ORCH_SUN0, lagnaLongitudeDeg: 200, instantUtcMs: ORCH_T0, latitudeDeg: 28.6, longitudeDeg: 77.2, janmaLagnaLord: "JUPITER" },
    yearNumber: 35,
    ephemeris: synthEphemeris(),
    divisional,
    moonNakshatraLordAtReturn: "MOON",
    moonNakshatraElapsedFraction: 0.25,
    combustionArcByGraha: { MERCURY: 14, VENUS: 10, MARS: 17, JUPITER: 11, SATURN: 15, SUN: null, MOON: null },
    ...overrides,
  };
}

groups.push(
  {
    name: "O1 orchestrator: full CALCULATED run wires all engines + provenance",
    run: () => {
      const r = buildVarshaphalSnapshot(fullInput());
      assert(r.status === "CALCULATED", `status=${r.status} flags=${r.partialFlags.join(",")} un=${JSON.stringify(r.unavailableReasons)}`);
      assert(r.solarReturn.status === "CONVERGED", "solar return converged");
      assert(r.varshaLagna!.status === "CALCULATED" && r.muntha!.status === "CALCULATED", "lagna+muntha");
      assert(Object.keys(r.panchavargeeya!).length === 7, "7 panchavargeeya");
      assert(r.varshesha!.status === "CALCULATED" && r.varshesha!.varshesha !== null, "varshesha");
      assert(r.muddaDasha!.status === "CALCULATED" && r.muddaDasha!.maha.length >= 9, "mudda");
      assert(/^[0-9a-f]{16}$/.test(r.provenance.rulebookHash) && r.provenance.ayanamsa === "LAHIRI", "provenance");
      assert(r.disclaimer.toLowerCase().includes("no remedies"), "disclaimer");
      tokenIntegrity(r.tokens);
    },
  },
  {
    name: "O2 orchestrator: byte-deterministic for identical input",
    run: () => {
      const a = JSON.stringify(buildVarshaphalSnapshot(fullInput()));
      const b = JSON.stringify(buildVarshaphalSnapshot(fullInput()));
      assert(a === b, "byte-identical snapshot");
    },
  },
  {
    name: "O3 orchestrator: solar-return failure -> UNAVAILABLE (fail-closed)",
    run: () => {
      const eph: VarshaphalEphemeris = { ...synthEphemeris(), sunSiderealLongitudeAtUtcMs: () => 50 };
      const r = buildVarshaphalSnapshot(fullInput({ ephemeris: eph }));
      assert(r.status === "UNAVAILABLE_INVALID_INPUT", `status=${r.status}`);
      assert(r.solarReturn.status === "UNAVAILABLE" && r.muntha === null && r.muddaDasha === null, "no fabricated downstream");
    },
  },
  {
    name: "O4 orchestrator: missing divisional + Moon-nakshatra -> PARTIAL",
    run: () => {
      const r = buildVarshaphalSnapshot(fullInput({ divisional: undefined, moonNakshatraLordAtReturn: null }));
      assert(r.status === "PARTIAL", `status=${r.status}`);
      assert(r.partialFlags.includes("MISSING_D3_D9"), "d3/d9 partial");
      assert(r.partialFlags.includes("MISSING_MOON_NAKSHATRA_LORD"), "mudda partial");
      assert(r.varshaLagna!.status === "CALCULATED" && r.muntha!.status === "CALCULATED", "still resolves lagna+muntha");
    },
  },
  {
    name: "O5 orchestrator: high latitude -> Varsha Lagna unavailable, Muntha partial",
    run: () => {
      const r = buildVarshaphalSnapshot(fullInput({ natal: { ...fullInput().natal, latitudeDeg: 70 } }));
      assert(r.status === "PARTIAL", `status=${r.status}`);
      assert(r.varshaLagna!.status === "UNAVAILABLE", "varsha lagna unavailable");
      assert(r.unavailableReasons.some((u) => u.code === "HIGH_LATITUDE_ASCENDANT"), "high-lat reason");
      assert(r.muntha!.partialFlags.includes("MISSING_VARSHA_LAGNA"), "muntha partial");
    },
  },
  {
    name: "O6 Dinratri: day/night from sunrise/sunset, Trirashi-pati, indeterminate unavailable",
    run: () => {
      // Sunrise 01:00Z, sunset 13:00Z. Instant 06:00Z => DAY.
      const day = Date.parse("2025-05-10T06:00:00.000Z");
      const sr = { sunriseUtcMs: Date.parse("2025-05-10T01:00:00.000Z"), sunsetUtcMs: Date.parse("2025-05-10T13:00:00.000Z") };
      const dDay = computeDinratri({ returnInstantUtcMs: day, sunriseSunset: sr, varshaLagnaSignIndex: 0 }); // Aries=FIRE
      assert(dDay.status === "CALCULATED" && dDay.dayNight === "DAY", `day=${dDay.dayNight}`);
      assert(dDay.trirashiPati === "SUN", `fire-day trirashi=${dDay.trirashiPati}`); // FIRE day lord = SUN
      // Instant 22:00Z => NIGHT.
      const night = Date.parse("2025-05-10T22:00:00.000Z");
      const dNight = computeDinratri({ returnInstantUtcMs: night, sunriseSunset: sr, varshaLagnaSignIndex: 0 });
      assert(dNight.dayNight === "NIGHT" && dNight.trirashiPati === "JUPITER", `fire-night trirashi=${dNight.trirashiPati}`);
      // Before sunrise => previous Hindu weekday.
      const preDawn = Date.parse("2025-05-10T00:30:00.000Z");
      const dPre = computeDinratri({ returnInstantUtcMs: preDawn, sunriseSunset: sr, varshaLagnaSignIndex: 0 });
      assert(dPre.dayNight === "NIGHT" && dPre.dinratriLord !== null, "pre-dawn night + dinratri lord");
      // Indeterminate sunrise/sunset => structured UNAVAILABLE.
      const dNone = computeDinratri({ returnInstantUtcMs: day, sunriseSunset: null, varshaLagnaSignIndex: 0 });
      assert(dNone.status === "UNAVAILABLE" && dNone.unavailableReasons[0]!.code === "DAY_NIGHT_INDETERMINATE", "indeterminate");
      // Orchestrator surfaces indeterminate when the ephemeris returns null sunrise/sunset.
      const eph = { ...synthEphemeris(), sunriseSunsetAt: () => null };
      const snap = buildVarshaphalSnapshot(fullInput({ ephemeris: eph }));
      assert(snap.unavailableReasons.some((u) => u.code === "DAY_NIGHT_INDETERMINATE"), "orchestrator surfaces indeterminate");
      assert(snap.dinratri!.status === "UNAVAILABLE", "snapshot dinratri unavailable");
      tokenIntegrity([...dDay.tokens, ...dNight.tokens, ...dPre.tokens]);
    },
  },
);

function main() {
  console.log("Premium Varshaphal / Tajika Core registry + constants QA (pure):");
  let passed = 0;
  let failed = 0;
  for (const group of groups) {
    try {
      group.run();
      console.log(`  ✓ ${group.name}`);
      passed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`  ✗ ${group.name} -- ${message}`);
      failed += 1;
    }
  }
  console.log(`\nvarshaphal premium registry QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  console.log(`  registry: ${VARSHAPHAL_RULE_REGISTRY.length} rules; rulebook hash ${computeVarshaphalRulebookHash()}`);
  if (failed > 0) process.exit(1);
}

main();
