/**
 * Card 8B — Premium Daily Horoscope Engine V1 deterministic QA.
 *
 * Ephemeris-free: gochar + panchang are injected as deterministic snapshots so
 * the whole aggregation (dedup, precedence, gate, band, confidence) is verified
 * on any Node version. The live ephemeris-backed adapter path (real panchang +
 * real gochar) is exercised by the Node 22 CI workflow.
 */

import {
  buildDailyHoroscopeSnapshot,
  buildHoroscopeChartContext,
  evaluateCategory,
  dedupeTokens,
  detectContradictions,
  resolveBand,
  applyBavGate,
  RULE_REGISTRY,
  CATEGORY_SIGNIFICATORS,
  HOROSCOPE_CATEGORY_KEYS,
  type DailyHoroscopeSnapshot,
  type EvidenceToken,
  type EvidenceTier,
  type HoroscopeCategoryKey,
} from "@/modules/astrology/horoscope";
import type { HoroscopeChartContext } from "@/modules/astrology/horoscope/context";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";
import {
  GOCHAR_AYANAMSA,
  GOCHAR_NODE_MODEL,
  GOCHAR_GRAHAS,
  houseFromLagna,
  houseFromMoon,
  isRetrograde,
  isSadeSatiActive,
  rashiIndex,
  resolveVedhaStatus,
  sadeSatiPhase,
  saturnAffliction,
  transitResultFlag,
  type GocharGraha,
  type GocharSnapshot,
} from "@/modules/astrology/gochar";
import {
  buildAshtakavargaSnapshot,
  type AshtakavargaSnapshot,
} from "@/modules/astrology/ashtakavarga";
import { buildVimshottariActiveLineageForChartContext } from "@/modules/astrology/vimshottari-dasha";
import type { VimshottariActiveLineage } from "@/lib/astrology/rules/dasha";
import type { PanchangContextResult, PanchangContextOutput } from "@/modules/panchang";
import { zodiacSigns } from "@/modules/astrology/constants";
import { nakshatraCatalog, nakshatraSpanDegrees } from "@/lib/astrology/constants";

const CLASSICAL7 = ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"] as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

// --- Fixture builders --------------------------------------------------------

function nakshatraNameFor(longitude: number): string {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / nakshatraSpanDegrees) % nakshatraCatalog.length;
  return nakshatraCatalog[index].name;
}

function makeChart(opts: {
  lagnaLongitude: number;
  planets: Record<string, number>;
  verified?: boolean;
  birthUtc?: string;
}): UnifiedSiderealChart {
  const lagnaRashi = rashiIndex(opts.lagnaLongitude);
  const planets = Object.entries(opts.planets).map(([name, longitude]) => {
    const sign = rashiIndex(longitude);
    const degree = longitude % 30;
    return {
      name,
      longitude,
      sign: zodiacSigns[sign],
      degree_in_sign: degree,
      nakshatra: nakshatraNameFor(longitude),
      pada: (Math.floor((longitude % nakshatraSpanDegrees) / (nakshatraSpanDegrees / 4)) + 1) as 1 | 2 | 3 | 4,
      is_retrograde: false,
      is_combust: false,
      house: (((sign - lagnaRashi + 12) % 12) + 1),
    };
  });

  return {
    birth_context: {
      date_local: "1990-01-01",
      time_local: "12:00",
      place: "Test",
      latitude: 26.14,
      longitude: 91.73,
      timezone: "Asia/Kolkata",
      birth_utc: opts.birthUtc ?? "1990-01-01T06:30:00.000Z",
    },
    settings: { zodiac: "sidereal", ayanamsha: "LAHIRI", house_system: "whole_sign" },
    lagna: {
      longitude: opts.lagnaLongitude,
      sign: zodiacSigns[lagnaRashi],
      degree_in_sign: opts.lagnaLongitude % 30,
    },
    houses: Array.from({ length: 12 }, (_, i) => ({
      house: i + 1,
      sign: zodiacSigns[(lagnaRashi + i) % 12],
    })),
    planets,
    verification: {
      is_verified_for_chart_logic: opts.verified ?? true,
      verification_status: (opts.verified ?? true) ? "VERIFIED" : "FAILED",
      warnings: [],
      errors: [],
    },
  } as UnifiedSiderealChart;
}

function makeGocharSnapshot(opts: {
  moonLongitude: number;
  lagnaLongitude: number;
  grahaLongitudes: Record<GocharGraha, number>;
  retrograde?: Set<GocharGraha>;
}): GocharSnapshot {
  const transits = GOCHAR_GRAHAS.map((graha) => {
    const longitude = opts.grahaLongitudes[graha];
    const hM = houseFromMoon(longitude, opts.moonLongitude);
    return {
      graha,
      longitude,
      rashi: rashiIndex(longitude),
      houseFromMoon: hM,
      houseFromLagna: houseFromLagna(longitude, opts.lagnaLongitude),
      retrograde: isRetrograde(graha, opts.retrograde?.has(graha) ? -1 : 1),
      transitResult: transitResultFlag(graha, hM),
      nextIngress: null,
    };
  });
  const satHouseFromMoon = houseFromMoon(opts.grahaLongitudes.SATURN, opts.moonLongitude);
  const active = isSadeSatiActive(satHouseFromMoon);

  return {
    queryInstant: "2026-07-10T00:41:00.000Z",
    ayanamsa: GOCHAR_AYANAMSA,
    referenceMoonRashi: rashiIndex(opts.moonLongitude),
    referenceLagnaRashi: rashiIndex(opts.lagnaLongitude),
    transits,
    sadeSati: {
      active,
      phase: active ? sadeSatiPhase(satHouseFromMoon) : null,
      saturnHouseFromMoon: satHouseFromMoon,
      firstEntryUtc: null,
      finalSettledEntryUtc: null,
      finalExitUtc: null,
      retrogradeReEntry: false,
    },
    saturnAffliction: saturnAffliction(satHouseFromMoon),
    flags: {
      ayanamsa: GOCHAR_AYANAMSA,
      nodeModel: GOCHAR_NODE_MODEL,
      enableVedha: false,
      vedha: resolveVedhaStatus(false),
      sarvaBindu: null,
    },
  };
}

function makeWindow(startUtc: string, endUtc: string) {
  return {
    start_local_time: "06:00",
    end_local_time: "06:48",
    start_utc: startUtc,
    end_utc: endUtc,
    duration_minutes: 48,
  };
}

function makePanchang(opts: { dailyTone: string; sunriseUtc: string }): PanchangContextResult {
  const data = {
    dailyTone: opts.dailyTone,
    sunrise: { utc: opts.sunriseUtc, local_time: "06:00" },
    sunset: { utc: opts.sunriseUtc, local_time: "18:00" },
    advanced_timings: {
      rahu_kaal: makeWindow("2026-07-10T03:00:00.000Z", "2026-07-10T04:30:00.000Z"),
      gulika_kaal: makeWindow("2026-07-10T05:00:00.000Z", "2026-07-10T06:30:00.000Z"),
      yamaganda: makeWindow("2026-07-10T07:00:00.000Z", "2026-07-10T08:30:00.000Z"),
      abhijit_muhurta: makeWindow("2026-07-10T06:30:00.000Z", "2026-07-10T07:00:00.000Z"),
      brahma_muhurta: makeWindow("2026-07-10T00:00:00.000Z", "2026-07-10T00:48:00.000Z"),
    },
  };

  return { success: true, data: data as unknown as PanchangContextOutput };
}

const LOCATION = {
  displayName: "Guwahati",
  latitude: 26.14,
  longitude: 91.73,
  timezoneIana: "Asia/Kolkata",
};

// Base natal + transit fixtures.
const BASE_NATAL: Record<string, number> = {
  SUN: 100,
  MOON: 45,
  MARS: 200,
  MERCURY: 110,
  JUPITER: 250,
  VENUS: 80,
  SATURN: 300,
  RAHU: 160,
  KETU: 340,
};

// Transit set with Saturn giving house 3 from Moon (benefic, no Sade Sati).
const BASE_TRANSIT: Record<GocharGraha, number> = {
  SUN: 20,
  MOON: 130,
  MARS: 55,
  MERCURY: 25,
  JUPITER: 95,
  VENUS: 15,
  SATURN: 100,
  RAHU: 200,
  KETU: 20,
};

function baseSnapshot(overrides?: {
  transit?: Partial<Record<GocharGraha, number>>;
  tone?: string;
  verified?: boolean;
}): DailyHoroscopeSnapshot {
  const chart = makeChart({
    lagnaLongitude: 15,
    planets: BASE_NATAL,
    verified: overrides?.verified ?? true,
  });
  const grahaLongitudes = { ...BASE_TRANSIT, ...(overrides?.transit ?? {}) };
  const gocharSnapshot = makeGocharSnapshot({
    moonLongitude: BASE_NATAL.MOON,
    lagnaLongitude: 15,
    grahaLongitudes,
  });

  return buildDailyHoroscopeSnapshot({
    chart,
    localDate: "2026-07-10",
    location: LOCATION,
    asOfInstant: "2026-07-10T00:41:00.000Z",
    injected: {
      panchang: makePanchang({ dailyTone: overrides?.tone ?? "supportive", sunriseUtc: "2026-07-10T00:41:00.000Z" }),
      gocharSnapshot,
    },
  });
}

// --- Hand-built context for forced-condition unit tests ----------------------

function makeDeep(level: 1 | 2 | 3 | 4 | 5, planet: string, lineage: string[]) {
  const names = ["MAHADASHA", "ANTARDASHA", "PRATYANTARDASHA", "SOOKSHMA", "PRANA"] as const;
  return {
    level,
    levelName: names[level - 1],
    planet,
    startAtUtc: "2020-01-01T00:00:00.000Z",
    endAtUtc: "2030-01-01T00:00:00.000Z",
    durationYears: 10,
    isActive: true,
    lineage,
    lineagePath: lineage.join(" > "),
  };
}

function makeLineage(lords: [string, string, string, string, string]): VimshottariActiveLineage {
  const [m, a, p, s, pr] = lords;
  return {
    asOfDateUtc: "2026-07-10T00:41:00.000Z",
    levels: [
      makeDeep(1, m, [m]),
      makeDeep(2, a, [m, a]),
      makeDeep(3, p, [m, a, p]),
      makeDeep(4, s, [m, a, p, s]),
      makeDeep(5, pr, [m, a, p, s, pr]),
    ],
    mahadasha: makeDeep(1, m, [m]),
    antardasha: makeDeep(2, a, [m, a]),
    pratyantardasha: makeDeep(3, p, [m, a, p]),
    sookshma: makeDeep(4, s, [m, a, p, s]),
    prana: makeDeep(5, pr, [m, a, p, s, pr]),
  } as VimshottariActiveLineage;
}

function makeAv(opts: {
  savByHouse?: Record<number, number>;
  bav?: Record<string, number[]>;
}): AshtakavargaSnapshot {
  const byHouse = Array.from({ length: 12 }, (_, i) => ({
    house: i + 1,
    sign: i,
    bindus: opts.savByHouse?.[i + 1] ?? 28,
  }));
  const bav = CLASSICAL7.map((planet) => ({
    planet,
    signBindus: opts.bav?.[planet] ?? Array<number>(12).fill(4),
    total: 0,
    prastara: [] as number[][],
    referenceOrder: [] as string[],
  }));

  return {
    sav: { signBindus: Array<number>(12).fill(0), total: 337, byHouse },
    bav,
  } as unknown as AshtakavargaSnapshot;
}

function makeCtx(opts: {
  lagnaSign?: number;
  moonSign?: number;
  planetHouseFromLagna?: Record<string, number>;
  houseSign?: number[];
  lineage?: VimshottariActiveLineage | null;
  gochar?: GocharSnapshot | null;
  av?: AshtakavargaSnapshot | null;
  panchangTone?: string | null;
}): HoroscopeChartContext {
  const lagnaSign = opts.lagnaSign ?? 0;
  const moonSign = opts.moonSign ?? 1;
  const houseSign = opts.houseSign ?? Array.from({ length: 12 }, (_, i) => (lagnaSign + i) % 12);
  const ready = (v: unknown) => (v ? "ready" : "unavailable") as "ready" | "unavailable";

  return {
    chartContextStatus: "verified",
    localDate: "2026-07-10",
    timezone: "Asia/Kolkata",
    location: LOCATION,
    queryInstant: "2026-07-10T00:41:00.000Z",
    dayInstantFallback: false,
    natal: {
      lagnaSign,
      lagnaLongitude: lagnaSign * 30 + 15,
      moonSign,
      moonLongitude: moonSign * 30 + 15,
      planetSign: {},
      planetHouseFromLagna: opts.planetHouseFromLagna ?? {},
      houseSign,
    },
    dasha: opts.lineage
      ? { ready: true, data: opts.lineage, provenance: "card5" }
      : { ready: false, code: "X", reason: "n/a" },
    ashtakavarga: opts.av
      ? { ready: true, data: opts.av, provenance: "card7" }
      : { ready: false, code: "X", reason: "n/a" },
    gochar: opts.gochar
      ? { ready: true, data: opts.gochar, provenance: "card6" }
      : { ready: false, code: "X", reason: "n/a" },
    panchang:
      opts.panchangTone != null
        ? { ready: true, data: { dailyTone: opts.panchangTone } as unknown as PanchangContextOutput, provenance: "card2" }
        : { ready: false, code: "X", reason: "n/a" },
    divisional: {},
    sourceSystems: {
      natal: "ready",
      vimshottari: ready(opts.lineage),
      gocharFromMoon: ready(opts.gochar),
      gocharFromLagna: ready(opts.gochar),
      sadeSati: ready(opts.gochar),
      ashtakavargaBAV: ready(opts.av),
      ashtakavargaSAV: ready(opts.av),
      panchang: ready(opts.panchangTone != null),
      divisional: "unavailable",
    },
    unavailableReasons: [],
    provenance: {},
  };
}

function tok(input: {
  sourceSystem: EvidenceToken["sourceSystem"];
  tier: EvidenceTier;
  ruleId?: string;
  conditionKey?: string;
  category?: HoroscopeCategoryKey;
}): EvidenceToken {
  return {
    evidenceId: `${input.ruleId ?? "R"}:${input.conditionKey ?? Math.random()}`,
    ruleId: input.ruleId ?? "DASHA_LORD_IS_KARAKA",
    sourceSystem: input.sourceSystem,
    category: input.category ?? "career_work",
    tier: input.tier,
    basis: "test",
    classicalOrProduct: "classical",
    reference: { frame: "lagna" },
    conditionKey: input.conditionKey ?? `k:${Math.random()}`,
    calculationReference: "test",
  };
}

// --- Forbidden wording -------------------------------------------------------

const FORBIDDEN = [
  "remedy",
  "remedies",
  "gemstone",
  "mantra",
  "donation",
  "guaranteed",
  "fatal",
  "death",
  "accident",
  "divorce",
  "disease",
  "diagnos",
  "you will",
  "certain loss",
];

function walkNumbers(value: unknown, path: string, onNumber: (n: number, p: string) => void) {
  if (typeof value === "number") {
    onNumber(value, path);
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => walkNumbers(item, `${path}[${i}]`, onNumber));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      walkNumbers(v, `${path}.${k}`, onNumber);
    }
  }
}

// --- QA groups ---------------------------------------------------------------

const groups: Array<{ name: string; run: () => void }> = [
  {
    name: "QA1 determinism: same input twice -> identical output",
    run: () => {
      const a = JSON.stringify(baseSnapshot());
      const b = JSON.stringify(baseSnapshot());
      assert(a === b, "outputs differ across identical runs");
    },
  },
  {
    name: "QA2/3 all seven categories present with significator mapping",
    run: () => {
      const snap = baseSnapshot();
      assert(snap.categories.length === 7, "expected 7 categories");
      for (const key of HOROSCOPE_CATEGORY_KEYS) {
        assert(
          snap.categories.some((c) => c.category === key),
          `missing category ${key}`
        );
        const sig = CATEGORY_SIGNIFICATORS[key];
        assert(sig.primaryHouses.length >= 1, `${key} lacks primary houses`);
        assert(sig.karakas.length >= 1, `${key} lacks karakas`);
      }
      assert(snap.generalDayQuality?.category === "general_day_quality", "generalDayQuality missing");
    },
  },
  {
    name: "QA4 every evidence token has all required fields",
    run: () => {
      const snap = baseSnapshot();
      const tokens = snap.categories.flatMap((c) => [
        ...c.supportiveEvidence,
        ...c.cautionEvidence,
        ...c.neutralEvidence,
      ]);
      assert(tokens.length > 0, "no tokens produced by base fixture");
      for (const t of tokens) {
        for (const field of [
          "evidenceId",
          "ruleId",
          "sourceSystem",
          "category",
          "basis",
          "classicalOrProduct",
          "reference",
          "conditionKey",
          "calculationReference",
        ] as const) {
          assert(t[field] !== undefined && t[field] !== null && t[field] !== "", `token missing ${field}`);
        }
        assert(t.classicalOrProduct === "classical" || t.classicalOrProduct === "product", "bad provenance");
      }
    },
  },
  {
    name: "QA5 all rule IDs unique and registered",
    run: () => {
      const ids = RULE_REGISTRY.map((r) => r.ruleId);
      assert(new Set(ids).size === ids.length, "duplicate ruleId in registry");
      const snap = baseSnapshot();
      const used = new Set(
        snap.categories.flatMap((c) => [...c.supportiveEvidence, ...c.cautionEvidence, ...c.neutralEvidence]).map((t) => t.ruleId)
      );
      for (const id of used) {
        assert(ids.includes(id), `token used unregistered rule ${id}`);
      }
    },
  },
  {
    name: "QA6 no duplicate conditionKey counted twice",
    run: () => {
      const deduped = dedupeTokens([
        tok({ sourceSystem: "gocharFromMoon", tier: 1, conditionKey: "gochar:VENUS:relationships" }),
        tok({ sourceSystem: "gocharFromLagna", tier: 1, conditionKey: "gochar:VENUS:relationships" }),
      ]);
      assert(deduped.length === 1, "duplicate conditionKey not collapsed");
      // net contribution counts once
      const snap = baseSnapshot();
      for (const c of snap.categories) {
        const keys = [...c.supportiveEvidence, ...c.cautionEvidence, ...c.neutralEvidence].map((t) => t.conditionKey);
        assert(new Set(keys).size === keys.length, `category ${c.category} has duplicate conditionKey in evidence`);
      }
    },
  },
  {
    name: "QA7 tiers stay within -2..+2",
    run: () => {
      const snap = baseSnapshot();
      const tokens = snap.categories.flatMap((c) => [...c.supportiveEvidence, ...c.cautionEvidence, ...c.neutralEvidence]);
      for (const t of tokens) {
        assert(Number.isInteger(t.tier) && t.tier >= -2 && t.tier <= 2, `tier out of range: ${t.tier}`);
      }
    },
  },
  {
    name: "QA8 all five rating bands are reachable",
    run: () => {
      const sig = CATEGORY_SIGNIFICATORS.career_work;
      const strong = resolveBand({ netTier: 4, tokens: [tok({ sourceSystem: "vimshottari", tier: 2 }), tok({ sourceSystem: "gocharFromMoon", tier: 1 }), tok({ sourceSystem: "ashtakavargaSAV", tier: 1 })], contradiction: false, significator: sig, confidenceLevel: "moderate" });
      const supp = resolveBand({ netTier: 2, tokens: [tok({ sourceSystem: "vimshottari", tier: 1 }), tok({ sourceSystem: "gocharFromMoon", tier: 1 })], contradiction: false, significator: sig, confidenceLevel: "moderate" });
      const mixed = resolveBand({ netTier: 0, tokens: [tok({ sourceSystem: "vimshottari", tier: 1 }), tok({ sourceSystem: "gocharFromMoon", tier: -1 })], contradiction: false, significator: sig, confidenceLevel: "moderate" });
      const caut = resolveBand({ netTier: -2, tokens: [tok({ sourceSystem: "gocharFromMoon", tier: -1 }), tok({ sourceSystem: "ashtakavargaSAV", tier: -1 })], contradiction: false, significator: sig, confidenceLevel: "moderate" });
      const strongCaut = resolveBand({ netTier: -4, tokens: [tok({ sourceSystem: "sadeSati", tier: -2 }), tok({ sourceSystem: "gocharFromMoon", tier: -2 })], contradiction: false, significator: sig, confidenceLevel: "moderate" });
      assert(strong === "strongly_supportive", `expected strongly_supportive, got ${strong}`);
      assert(supp === "supportive", `expected supportive, got ${supp}`);
      assert(mixed === "mixed", `expected mixed, got ${mixed}`);
      assert(caut === "cautionary", `expected cautionary, got ${caut}`);
      assert(strongCaut === "strongly_cautionary", `expected strongly_cautionary, got ${strongCaut}`);
    },
  },
  {
    name: "QA9 dasha-support + gochar-caution contradiction preserved",
    run: () => {
      const tokens = [tok({ sourceSystem: "vimshottari", tier: 2 }), tok({ sourceSystem: "gocharFromMoon", tier: -1 })];
      const flags = detectContradictions(tokens);
      assert(flags.includes("PHASE_VS_WINDOW"), "phase-vs-window contradiction not detected");
      const band = resolveBand({ netTier: 1, tokens, contradiction: true, significator: CATEGORY_SIGNIFICATORS.career_work, confidenceLevel: "high" });
      assert(band === "mixed", `contradiction should force mixed, got ${band}`);
    },
  },
  {
    name: "QA10 gochar gated correctly by BAV",
    run: () => {
      assert(applyBavGate(1, 5) === 1, "BAV>=5 should keep +1");
      assert(applyBavGate(1, 3) === 0, "BAV 3 should reduce +1 to 0");
      assert(applyBavGate(1, 2) === 0, "BAV<=2 should cap +1 to 0");
      assert(applyBavGate(-1, 2) === -1, "BAV<=2 should keep -1");
      assert(applyBavGate(2, 4) === 1, "BAV 4 should reduce +2 to +1");
      assert(applyBavGate(-2, 3) === -1, "BAV 3 should reduce -2 to -1");
    },
  },
  {
    name: "QA11 strong SAV does not independently create a positive rating",
    run: () => {
      // Lone +1 SAV token -> netTier 1 -> mixed (never supportive).
      const band = resolveBand({ netTier: 1, tokens: [tok({ sourceSystem: "ashtakavargaSAV", tier: 1 })], contradiction: false, significator: CATEGORY_SIGNIFICATORS.career_work, confidenceLevel: "high" });
      assert(band === "mixed", `lone SAV should be mixed, got ${band}`);
      // With only ashtakavarga ready (no dasha/gochar) the category is unavailable.
      const ctx = makeCtx({ av: makeAv({}) });
      const result = evaluateCategory(ctx, "career_work");
      assert(result.status === "unavailable", "career should be unavailable with only SAV");
    },
  },
  {
    name: "QA12 Sade Sati does not automatically force a negative result",
    run: () => {
      // Venus is 7th lord and occupies 7th (owns+occupies -> +2), Saturn at peak.
      const houseSign = Array.from({ length: 12 }, (_, i) => i);
      houseSign[6] = 6; // house 7 sign = LIBRA (ruled by Venus)
      const moonSign = 1;
      const grahaLongitudes = { ...BASE_TRANSIT, SATURN: (moonSign * 30 + 5) }; // Saturn in Moon sign -> peak
      const gochar = makeGocharSnapshot({ moonLongitude: moonSign * 30 + 15, lagnaLongitude: 15, grahaLongitudes });
      const ctx = makeCtx({
        lagnaSign: 0,
        moonSign,
        houseSign,
        planetHouseFromLagna: { VENUS: 7 },
        lineage: makeLineage(["VENUS", "VENUS", "MOON", "SUN", "MARS"]),
        gochar,
        av: makeAv({}),
      });
      const result = evaluateCategory(ctx, "relationships");
      assert(result.status === "available", "relationships should be available");
      assert(result.ratingBand === "mixed", `Sade Sati peak + strong support should be mixed, got ${result.ratingBand}`);
      assert(result.cautionEvidence.some((t) => t.ruleId === "SADE_SATI_PEAK"), "Sade Sati caution not preserved");
      assert(result.supportiveEvidence.some((t) => t.tier === 2), "strong dasha support not preserved");
    },
  },
  {
    name: "QA13 missing verified natal chart -> unavailable",
    run: () => {
      const snap = baseSnapshot({ verified: false });
      assert(snap.status === "unavailable", "unverified chart should be unavailable");
      assert(snap.chartContextStatus === "unverified", "status should be unverified");
      assert(snap.categories.every((c) => c.status === "unavailable"), "all categories should be unavailable");
    },
  },
  {
    name: "QA14/15 missing Dasha+Gochar -> categories unavailable; missing AV degrades",
    run: () => {
      // Only panchang -> no dasha, no gochar -> unavailable.
      const ctxNoPhase = makeCtx({ panchangTone: "supportive" });
      assert(evaluateCategory(ctxNoPhase, "general_day_quality").status === "unavailable", "no phase -> unavailable");
      // Dasha present, ashtakavarga absent -> career needs SAV (critical) -> unavailable (honest degrade).
      const ctxNoAv = makeCtx({ lineage: makeLineage(["SUN", "MOON", "MARS", "MERCURY", "JUPITER"]) });
      const career = evaluateCategory(ctxNoAv, "career_work");
      assert(career.status === "unavailable", "career without SAV should be unavailable");
      assert(career.confidence.missingCriticalSystems.includes("ashtakavargaSAV"), "should report missing SAV");
    },
  },
  {
    name: "QA16 missing Panchang -> no fabricated time windows",
    run: () => {
      const chart = makeChart({ lagnaLongitude: 15, planets: BASE_NATAL });
      const gochar = makeGocharSnapshot({ moonLongitude: BASE_NATAL.MOON, lagnaLongitude: 15, grahaLongitudes: BASE_TRANSIT });
      // Explicitly inject an UNAVAILABLE Panchang source so the assertion is
      // deterministic on every runtime (never relying on the ambient absence of
      // Swiss Ephemeris — the real Panchang succeeds on Node 22 CI).
      const failingPanchang = {
        success: false as const,
        missingReason: "simulated unavailable",
        error: { code: "MISSING_LOCATION", message: "simulated unavailable" },
      } as unknown as PanchangContextResult;
      const snap = buildDailyHoroscopeSnapshot({
        chart,
        localDate: "2026-07-10",
        location: LOCATION,
        asOfInstant: "2026-07-10T00:41:00.000Z",
        injected: { gocharSnapshot: gochar, panchang: failingPanchang },
      });
      assert(snap.timeWindows.length === 0, "no windows should be fabricated without Panchang");
      assert(snap.sourceSystems.panchang === "unavailable", "panchang should be unavailable");
    },
  },
  {
    name: "QA17 confidence never exceeds completeness",
    run: () => {
      const snap = baseSnapshot();
      for (const c of snap.categories) {
        if (c.status === "available") {
          assert(c.confidence.value <= c.confidence.completenessRatio + 1e-9, `${c.category} confidence exceeds completeness`);
          assert(c.confidence.value >= 0 && c.confidence.value <= 1, "confidence out of [0,1]");
        }
      }
    },
  },
  {
    name: "QA18 health category never emits diagnosis/clinical language",
    run: () => {
      const snap = baseSnapshot();
      const health = snap.categories.find((c) => c.category === "health_routine")!;
      const text = JSON.stringify(health).toLowerCase();
      for (const term of ["diagnos", "disease", "death", "fatal"]) {
        assert(!text.includes(term), `health output contains forbidden term ${term}`);
      }
    },
  },
  {
    name: "QA19 travel category respects its supportive cap",
    run: () => {
      const band = resolveBand({ netTier: 6, tokens: [tok({ sourceSystem: "vimshottari", tier: 2 }), tok({ sourceSystem: "gocharFromMoon", tier: 2 }), tok({ sourceSystem: "ashtakavargaSAV", tier: 2 })], contradiction: false, significator: CATEGORY_SIGNIFICATORS.travel_mobility, confidenceLevel: "high" });
      assert(band === "supportive", `travel should cap at supportive, got ${band}`);
    },
  },
  {
    name: "QA20 relationships uses Venus-only karaka (no Jupiter as primary)",
    run: () => {
      assert(
        CATEGORY_SIGNIFICATORS.relationships.karakas.length === 1 &&
          CATEGORY_SIGNIFICATORS.relationships.karakas[0] === "VENUS",
        "relationships primary karaka must be Venus-only in V1"
      );
    },
  },
  {
    name: "QA21 timezone/date-boundary: sunrise vs fallback instant",
    run: () => {
      const chart = makeChart({ lagnaLongitude: 15, planets: BASE_NATAL });
      // Panchang sunrise -> queryInstant = sunrise.
      const withPanchang = buildHoroscopeChartContext({
        chart,
        localDate: "2026-07-10",
        location: LOCATION,
        injected: { panchang: makePanchang({ dailyTone: "supportive", sunriseUtc: "2026-07-10T00:41:00.000Z" }) },
      });
      assert(withPanchang.queryInstant === "2026-07-10T00:41:00.000Z", "should use sunrise instant");
      assert(withPanchang.dayInstantFallback === false, "no fallback expected");
      // No panchang, no asOf -> flagged fallback.
      const fallback = buildHoroscopeChartContext({ chart, localDate: "2026-07-10", location: LOCATION, injected: { panchang: { success: false, missingReason: "x", error: { code: "MISSING_DATE", message: "x" } } as PanchangContextResult } });
      assert(fallback.dayInstantFallback === true, "fallback flag should be set");
      assert(typeof fallback.queryInstant === "string" && !Number.isNaN(new Date(fallback.queryInstant).getTime()), "fallback instant invalid");
    },
  },
  {
    name: "QA22 leap-year date builds cleanly",
    run: () => {
      const chart = makeChart({ lagnaLongitude: 15, planets: BASE_NATAL });
      const gochar = makeGocharSnapshot({ moonLongitude: BASE_NATAL.MOON, lagnaLongitude: 15, grahaLongitudes: BASE_TRANSIT });
      const snap = buildDailyHoroscopeSnapshot({
        chart,
        localDate: "2024-02-29",
        location: LOCATION,
        injected: { panchang: makePanchang({ dailyTone: "balanced", sunriseUtc: "2024-02-29T00:41:00.000Z" }), gocharSnapshot: gochar },
      });
      assert(snap.localDate === "2024-02-29", "leap date not preserved");
      assert(snap.queryInstant === "2024-02-29T00:41:00.000Z", "leap sunrise instant wrong");
    },
  },
  {
    name: "QA23 dasha boundary transition changes active lineage",
    run: () => {
      const chart = makeChart({ lagnaLongitude: 15, planets: BASE_NATAL });
      const before = buildVimshottariActiveLineageForChartContext({ chart, asOfDateUtc: "2010-01-01T00:00:00.000Z" });
      const after = buildVimshottariActiveLineageForChartContext({ chart, asOfDateUtc: "2035-01-01T00:00:00.000Z" });
      assert(before.success && after.success, "lineage should resolve at both instants");
      assert(
        before.data.mahadasha.planet !== after.data.mahadasha.planet ||
          before.data.antardasha.planet !== after.data.antardasha.planet,
        "lineage should differ across a 25-year gap"
      );
    },
  },
  {
    name: "QA24 gochar ingress/retrograde boundary reflected in consumption",
    run: () => {
      const g1 = makeGocharSnapshot({ moonLongitude: 45, lagnaLongitude: 15, grahaLongitudes: { ...BASE_TRANSIT, JUPITER: 29 } });
      const g2 = makeGocharSnapshot({ moonLongitude: 45, lagnaLongitude: 15, grahaLongitudes: { ...BASE_TRANSIT, JUPITER: 31 } });
      const j1 = g1.transits.find((t) => t.graha === "JUPITER")!;
      const j2 = g2.transits.find((t) => t.graha === "JUPITER")!;
      assert(j1.rashi !== j2.rashi, "ingress across sign boundary should change rashi");
      const gr = makeGocharSnapshot({ moonLongitude: 45, lagnaLongitude: 15, grahaLongitudes: BASE_TRANSIT, retrograde: new Set(["MARS"] as GocharGraha[]) });
      assert(gr.transits.find((t) => t.graha === "MARS")!.retrograde === true, "retrograde flag not reflected");
    },
  },
  {
    name: "QA25 Sade Sati rising/peak/setting cases detected",
    run: () => {
      const moonSign = 3; // Cancer
      const moonLong = moonSign * 30 + 15;
      const mk = (satSign: number) =>
        makeGocharSnapshot({ moonLongitude: moonLong, lagnaLongitude: 15, grahaLongitudes: { ...BASE_TRANSIT, SATURN: satSign * 30 + 5 } }).sadeSati;
      assert(mk((moonSign + 11) % 12).phase === "rising", "12th-from-Moon should be rising");
      assert(mk(moonSign).phase === "peak", "Moon sign should be peak");
      assert(mk((moonSign + 1) % 12).phase === "setting", "2nd-from-Moon should be setting");
    },
  },
  {
    name: "QA26/27 BAV low/high and SAV low/high tokens behave",
    run: () => {
      // SAV low (<=24) -> weak token; high (>=30) -> strong token.
      const low = evaluateCategory(
        makeCtx({ lineage: makeLineage(["SUN", "MOON", "MARS", "MERCURY", "JUPITER"]), av: makeAv({ savByHouse: { 10: 20 } }), gochar: makeGocharSnapshot({ moonLongitude: 45, lagnaLongitude: 15, grahaLongitudes: BASE_TRANSIT }) }),
        "career_work"
      );
      assert(low.cautionEvidence.some((t) => t.ruleId === "SAV_WEAK_HOUSE"), "low SAV should emit weak token");
      const high = evaluateCategory(
        makeCtx({ lineage: makeLineage(["SUN", "MOON", "MARS", "MERCURY", "JUPITER"]), av: makeAv({ savByHouse: { 10: 34 } }), gochar: makeGocharSnapshot({ moonLongitude: 45, lagnaLongitude: 15, grahaLongitudes: BASE_TRANSIT }) }),
        "career_work"
      );
      assert(high.supportiveEvidence.some((t) => t.ruleId === "SAV_STRONG_HOUSE"), "high SAV should emit strong token");
      // BAV gate emits an informational neutral token when gochar + AV present.
      assert(high.neutralEvidence.some((t) => t.ruleId === "BAV_GATE_APPLIED"), "BAV gate token expected");
    },
  },
  {
    name: "QA28 contradiction penalty lowers confidence",
    run: () => {
      const tokens = [tok({ sourceSystem: "vimshottari", tier: 2 }), tok({ sourceSystem: "gocharFromMoon", tier: -1 })];
      const flags = detectContradictions(tokens);
      assert(flags.length >= 1, "expected a contradiction flag for penalty");
    },
  },
  {
    name: "QA29 stable JSON schema + version",
    run: () => {
      const snap = baseSnapshot();
      assert(snap.contractVersion === "1.0.0", "contract version drift");
      assert(snap.periodType === "DAILY", "periodType must be DAILY");
      const expectedKeys = [
        "status", "contractVersion", "periodType", "queryInstant", "timezone", "localDate",
        "conventions", "sourceSystems", "chartContextStatus", "dashaContext", "sadeSati",
        "generalDayQuality", "categories", "timeWindows", "confidence", "unavailableReasons",
        "calculationReferences", "flags", "disclaimer",
      ].sort();
      assert(JSON.stringify(Object.keys(snap).sort()) === JSON.stringify(expectedKeys), "top-level schema keys changed");
      assert(snap.conventions.ayanamsa === "LAHIRI" && snap.conventions.nodeModel === "TRUE_NODE", "convention metadata drift");
    },
  },
  {
    name: "QA30 forbidden-wording scan over full output",
    run: () => {
      const text = JSON.stringify(baseSnapshot()).toLowerCase();
      for (const term of FORBIDDEN) {
        assert(!text.includes(term), `forbidden term present in output: "${term}"`);
      }
    },
  },
  {
    name: "QA31 no NaN/Infinity/out-of-range numbers",
    run: () => {
      const snap = baseSnapshot();
      walkNumbers(snap, "root", (n, p) => {
        assert(Number.isFinite(n), `non-finite number at ${p}: ${n}`);
      });
      for (const c of snap.categories) {
        if (c.internalNetTier !== null) {
          assert(Math.abs(c.internalNetTier) <= 20, `netTier unbounded at ${c.category}`);
        }
      }
    },
  },
  {
    name: "QA32 regression: adapter consumes dependency outputs unchanged",
    run: () => {
      const chart = makeChart({ lagnaLongitude: 15, planets: BASE_NATAL });
      const ctx = buildHoroscopeChartContext({
        chart,
        localDate: "2026-07-10",
        location: LOCATION,
        asOfInstant: "2026-07-10T00:41:00.000Z",
        injected: { panchang: makePanchang({ dailyTone: "supportive", sunriseUtc: "2026-07-10T00:41:00.000Z" }) },
      });
      const av = buildAshtakavargaSnapshot({ chart });
      assert(av.success && ctx.ashtakavarga.ready, "ashtakavarga should be ready");
      assert(ctx.ashtakavarga.data.sav.total === 337, "SAV checksum must remain 337");
      assert(av.data.sav.total === ctx.ashtakavarga.data.sav.total, "adapter altered SAV output");
      const dasha = buildVimshottariActiveLineageForChartContext({ chart, asOfDateUtc: "2026-07-10T00:41:00.000Z" });
      assert(dasha.success && ctx.dasha.ready, "dasha should be ready");
      assert(dasha.data.mahadasha.planet === ctx.dasha.data.mahadasha.planet, "adapter altered dasha lineage");
    },
  },
];

function main() {
  const passed: string[] = [];
  const failed: Array<{ name: string; message: string }> = [];

  for (const group of groups) {
    try {
      group.run();
      passed.push(group.name);
    } catch (error) {
      failed.push({ name: group.name, message: (error as Error).message });
    }
  }

  console.log("horoscope daily QA:");
  for (const name of passed) {
    console.log(`  ✓ ${name}`);
  }
  for (const failure of failed) {
    console.log(`  ✗ ${failure.name} -- ${failure.message}`);
  }
  console.log(
    `\nhoroscope daily QA summary: ${passed.length} passed, ${failed.length} failed (of ${groups.length}).`
  );

  if (failed.length > 0) {
    process.exit(1);
  }
}

main();
