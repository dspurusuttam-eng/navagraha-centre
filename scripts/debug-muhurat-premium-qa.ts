/**
 * Card 13.2A — Premium Muhurat Core: registry + table invariant QA.
 * Pure engine (no ephemeris, no runtime state); runs on any Node version.
 * V1 delivers types + constants + registry only — factor engines are Card 13.2B+.
 */
import {
  MUHURAT_PREMIUM_CONTRACT_VERSION,
  MUHURAT_PREMIUM_CONVENTIONS,
  MUHURAT_PREMIUM_DISCLAIMER,
  MUHURAT_EVENT_CATEGORIES,
  TARA_TABLE,
  CHANDRA_BALA_TABLE,
  TITHI_CLASSIFICATION,
  NAKSHATRA_GANA,
  NAKSHATRA_ACTIVITY_CLASS,
  YOGA_CLASSIFICATION_V1,
  VARA_ELIGIBILITY_V1,
  EVENT_KARAKA_V1,
  RASHI_QUALITY,
  CATEGORY_PREFERRED_LAGNA_QUALITY,
  CATEGORY_UNIVERSAL_PROHIBITIONS,
  HARD_PROHIBITION_BASIS,
  MUHURAT_RANKING_STAGES,
  RIKTA_TITHI_CATEGORY_CAUTION_V1,
  CATEGORY_SUPPORTIVE_OVERLAYS,
  MUHURAT_RULE_REGISTRY,
  getMuhuratRule,
  computeRulebookHash,
  buildPanchangFactor,
  buildTaraBalaFactor,
  computeTaraIndex,
  buildChandraBalaFactor,
  computeChandraBalaHouse,
  buildDoshaFactor,
  type Karaka,
} from "@/modules/muhurta/premium";
import {
  buildLagnaFactor,
  buildPlanetaryFactor,
  buildSegmentFactor,
  buildMuhuratSnapshot,
  mergeBucketsIntoWindows,
  compareWindowsForRank,
  classifyBucketStatus,
  scoreBucketTokens,
  type MuhuratBucketContext,
  type ScoredBucket,
  type MuhuratEvidenceToken,
  type MuhuratSnapshot,
  type MuhuratOrchestratorInput,
} from "@/modules/muhurta/premium";
import type { PremiumPanchangSnapshot, PremiumTimedPeriod } from "@/modules/panchang/premium";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// Minimal Panchang-snapshot builder for factor tests. Values chosen to exercise
// specific rule paths; only fields the factor engines read are populated.
type MakeSnapshotOverrides = {
  varaIndex?: number;
  varaName?: string;
  tithiIndex?: number;
  tithiName?: string;
  paksha?: "Shukla" | "Krishna";
  nakshatraIndex?: number;
  nakshatraName?: string;
  yogaIndex?: number;
  yogaName?: string;
  karanaIndex?: number;
  karanaName?: string;
};
function makeSnapshot(o: MakeSnapshotOverrides = {}): PremiumPanchangSnapshot {
  const iso = "2026-05-10T06:00:00.000Z";
  const stub = (idx: number, name: string) => ({
    index: idx, name, startUtc: iso, endUtc: iso, progressPercent: 0,
    next: { index: (idx + 1) % 27, name: `${name}+1` },
    ruleId: "TEST", calculationReference: "TEST",
  });
  const conv = {} as unknown as PremiumPanchangSnapshot["conventions"];
  const cv = "1.0.0" as unknown as PremiumPanchangSnapshot["contractVersion"];
  return {
    status: "ok" as const, contractVersion: cv, conventions: conv,
    queryInstant: iso, localDate: "2026-05-10", timezone: "Asia/Kolkata",
    coordinates: { latitude: 28.6139, longitude: 77.209 },
    panchangDay: null, sunrise: null, sunset: null, nextSunrise: null, moonrise: null, moonset: null,
    vara: { index: o.varaIndex ?? 3, name: o.varaName ?? "Wednesday",
            panchangDayDate: "2026-05-10", ruleId: "VARA" },
    paksha: o.paksha ?? "Shukla",
    tithi: stub(o.tithiIndex ?? 5, o.tithiName ?? "Panchami"),
    nakshatra: { ...stub(o.nakshatraIndex ?? 0, o.nakshatraName ?? "Ashwini"), pada: 1 as const },
    yoga: stub(o.yogaIndex ?? 15, o.yogaName ?? "Siddhi"),
    karana: stub(o.karanaIndex ?? 0, o.karanaName ?? "Bava"),
    transitions: [], rahuKaal: null, yamaganda: null, gulika: null,
    abhijit: null, brahmaMuhurta: null,
    horas: [], choghadiyaDay: [], choghadiyaNight: [],
    sourceSystemReadiness: {}, calculationReferences: [], unavailableReasons: [],
    flags: { preSunriseInstant: false, moonEventsPartial: false, nightSpanUnavailable: false, elevationApplied: false, timezoneCoordinateSuspect: false },
  };
}

type Group = { name: string; run: () => void };

const groups: Group[] = [
  {
    name: "INT1 contract version pinned",
    run: () => {
      assert(MUHURAT_PREMIUM_CONTRACT_VERSION === "1.0.0", `contract=${MUHURAT_PREMIUM_CONTRACT_VERSION}`);
      assert(MUHURAT_PREMIUM_CONVENTIONS.bucketResolutionMinutes === 5, "bucket 5 min");
      assert(MUHURAT_PREMIUM_CONVENTIONS.chandraBalaMode === "STRICT", "chandra strict");
      assert(MUHURAT_PREMIUM_CONVENTIONS.compatibilityPercentage === "NONE_STRUCTURED_STATUS_ONLY", "no percentage policy");
    },
  },
  {
    name: "INT2 categories: exactly 6 V1 categories, no duplicates",
    run: () => {
      assert(MUHURAT_EVENT_CATEGORIES.length === 6, `categories.length=${MUHURAT_EVENT_CATEGORIES.length}`);
      assert(new Set(MUHURAT_EVENT_CATEGORIES).size === 6, "duplicates present");
      const expected = new Set([
        "GENERAL_DAILY_ACTIVITY","SPIRITUAL_PRACTICE","BUSINESS_WORK_START",
        "TRAVEL_START","VEHICLE_PURCHASE","EDUCATION_START",
      ]);
      for (const c of MUHURAT_EVENT_CATEGORIES) assert(expected.has(c), `unexpected category ${c}`);
    },
  },
  {
    name: "INT3 Tara table: 9 entries, indices 1..9, classical labels, Vadha weight = -2",
    run: () => {
      assert(TARA_TABLE.length === 9, `tara.length=${TARA_TABLE.length}`);
      const expectedNames = ["JANMA","SAMPAT","VIPAT","KSHEMA","PRATYAK","SADHAKA","VADHA","MITRA","ATI_MITRA"];
      for (let i = 0; i < 9; i += 1) {
        const entry = TARA_TABLE[i]!;
        assert(entry.taraIndex === i + 1, `taraIndex[${i}]=${entry.taraIndex}`);
        assert(entry.name === expectedNames[i], `name[${i}]=${entry.name} expected ${expectedNames[i]}`);
      }
      // classical partition: taraIndex 1,3,5,7 inauspicious; 2,4,6,8,9 auspicious
      for (const e of TARA_TABLE) {
        const shouldBeAusp = [2,4,6,8,9].includes(e.taraIndex);
        assert(e.auspicious === shouldBeAusp, `auspicious[${e.taraIndex}]=${e.auspicious}`);
      }
      // weighting: only Vadha (index 7) carries -2; other CAUTION taras -1; SUPPORTIVE +1
      for (const e of TARA_TABLE) {
        if (e.taraIndex === 7) assert(e.tier === -2, `Vadha tier=${e.tier}, expected -2`);
        else if (!e.auspicious) assert(e.tier === -1, `CAUTION tara ${e.taraIndex} tier=${e.tier}`);
        else assert(e.tier === 1, `SUPPORTIVE tara ${e.taraIndex} tier=${e.tier}`);
      }
    },
  },
  {
    name: "INT4 Chandra Bala 12-house partition: FAVORABLE {1,3,6,7,10,11}, CAUTION {4,8,12}, NEUTRAL {2,5,9}",
    run: () => {
      assert(CHANDRA_BALA_TABLE.length === 12, `chandra.length=${CHANDRA_BALA_TABLE.length}`);
      const favorable = new Set([1,3,6,7,10,11]);
      const inauspicious = new Set([4,8,12]);
      const neutral = new Set([2,5,9]);
      // Every house 1..12 present exactly once
      const houses = new Set(CHANDRA_BALA_TABLE.map((e) => e.houseFromJanma));
      assert(houses.size === 12, "houses not unique");
      for (let h = 1; h <= 12; h += 1) assert(houses.has(h as 1), `missing house ${h}`);
      for (const e of CHANDRA_BALA_TABLE) {
        const h = e.houseFromJanma;
        if (favorable.has(h)) {
          assert(e.classification === "FAVORABLE", `h${h} classification=${e.classification}`);
          assert(e.tier === 1, `h${h} tier=${e.tier}`);
        } else if (inauspicious.has(h)) {
          assert(e.classification === "INAUSPICIOUS", `h${h} classification=${e.classification}`);
          assert(e.tier === -1, `h${h} tier=${e.tier}`);
        } else if (neutral.has(h)) {
          assert(e.classification === "NEUTRAL", `h${h} classification=${e.classification}`);
          assert(e.tier === 0, `h${h} tier=${e.tier}`);
        }
      }
    },
  },
  {
    name: "INT5 Tithi classification: 1..15 covered; Rikta = {4,9,14}; Nanda/Bhadra/Jaya/Rikta/Purna exhaustively",
    run: () => {
      const expected: Record<number, string> = {
        1:"NANDA",2:"BHADRA",3:"JAYA",4:"RIKTA",5:"PURNA",
        6:"NANDA",7:"BHADRA",8:"JAYA",9:"RIKTA",10:"PURNA",
        11:"NANDA",12:"BHADRA",13:"JAYA",14:"RIKTA",15:"PURNA",
      };
      for (let t = 1; t <= 15; t += 1) {
        assert(TITHI_CLASSIFICATION[t] === expected[t], `tithi[${t}]=${TITHI_CLASSIFICATION[t]}`);
      }
      // Rikta set exact (numeric sort — not string-lexicographic)
      const rikta = Object.entries(TITHI_CLASSIFICATION).filter(([, v]) => v === "RIKTA").map(([k]) => Number(k)).sort((a, b) => a - b);
      assert(JSON.stringify(rikta) === JSON.stringify([4,9,14]), `rikta=${rikta}`);
    },
  },
  {
    name: "INT6 Nakshatra gana + activity class: 27 entries each; Ganas ∈ {DEVA,MANUSHYA,RAKSHASA}",
    run: () => {
      assert(NAKSHATRA_GANA.length === 27, `gana length=${NAKSHATRA_GANA.length}`);
      assert(NAKSHATRA_ACTIVITY_CLASS.length === 27, `activity length=${NAKSHATRA_ACTIVITY_CLASS.length}`);
      const ganaSet = new Set(["DEVA","MANUSHYA","RAKSHASA"]);
      for (const g of NAKSHATRA_GANA) assert(ganaSet.has(g), `bad gana ${g}`);
      const activitySet = new Set([
        "FIXED_DHRUVA","MOVABLE_CHARA","SOFT_MRIDU",
        "SHARP_TIKSHNA_UGRA","MIXED_MISHRA","SWIFT_KSHIPRA_LAGHU",
      ]);
      for (const a of NAKSHATRA_ACTIVITY_CLASS) assert(activitySet.has(a), `bad activity ${a}`);
    },
  },
  {
    name: "INT7 Yoga classification: 27 entries; only SUPPORTIVE / CAUTION / NEUTRAL",
    run: () => {
      assert(YOGA_CLASSIFICATION_V1.length === 27, `yoga length=${YOGA_CLASSIFICATION_V1.length}`);
      const allowed = new Set(["SUPPORTIVE","CAUTION","NEUTRAL"]);
      for (const t of YOGA_CLASSIFICATION_V1) assert(allowed.has(t), `yoga tier ${t}`);
    },
  },
  {
    name: "INT8 Vara eligibility: all 6 categories × 7 weekdays; only SUPPORTIVE/NEUTRAL/CAUTION",
    run: () => {
      const allowed = new Set(["SUPPORTIVE","NEUTRAL","CAUTION"]);
      for (const cat of MUHURAT_EVENT_CATEGORIES) {
        const row = VARA_ELIGIBILITY_V1[cat];
        assert(row.length === 7, `${cat}: length=${row.length}`);
        for (const v of row) assert(allowed.has(v), `${cat}: bad tier ${v}`);
      }
    },
  },
  {
    name: "INT9 Rashi quality: 12 signs; only MOVABLE/FIXED/DUAL",
    run: () => {
      assert(RASHI_QUALITY.length === 12, `rashi length=${RASHI_QUALITY.length}`);
      const allowed = new Set(["MOVABLE","FIXED","DUAL"]);
      let m = 0, f = 0, d = 0;
      for (const q of RASHI_QUALITY) {
        assert(allowed.has(q), `bad quality ${q}`);
        if (q === "MOVABLE") m += 1;
        if (q === "FIXED") f += 1;
        if (q === "DUAL") d += 1;
      }
      assert(m === 4 && f === 4 && d === 4, `partition m=${m} f=${f} d=${d}`);
    },
  },
  {
    name: "INT10 Category-preferred Lagna quality: matches partition of RASHI_QUALITY",
    run: () => {
      for (const cat of MUHURAT_EVENT_CATEGORIES) {
        const q = CATEGORY_PREFERRED_LAGNA_QUALITY[cat];
        assert(q === null || q === "MOVABLE" || q === "FIXED" || q === "DUAL", `${cat} preferred=${q}`);
      }
    },
  },
  {
    name: "INT11 Event karaka: primary + optional secondary per category; from allowed karaka set",
    run: () => {
      const allowed = new Set(["SUN","MOON","MARS","MERCURY","JUPITER","VENUS","SATURN","KETU"]);
      for (const cat of MUHURAT_EVENT_CATEGORIES) {
        const k = EVENT_KARAKA_V1[cat];
        assert(allowed.has(k.primary), `${cat}: bad primary ${k.primary}`);
        assert(k.secondary === null || allowed.has(k.secondary), `${cat}: bad secondary ${k.secondary}`);
      }
    },
  },
  {
    name: "INT12 Universal prohibitions per category + basis labels",
    run: () => {
      for (const cat of MUHURAT_EVENT_CATEGORIES) {
        const list = CATEGORY_UNIVERSAL_PROHIBITIONS[cat];
        assert(list.length >= 1, `${cat}: no prohibitions`);
        // BHADRA is universal
        assert(list.includes("BHADRA_V1"), `${cat}: missing BHADRA_V1`);
        for (const id of list) assert(id in HARD_PROHIBITION_BASIS, `${cat}: unknown prohibition ${id}`);
      }
      // basis labels honest per Card 13.1A: PANCHAKA + ECLIPSE = PRODUCT_NORMALIZED
      assert(HARD_PROHIBITION_BASIS.PANCHAKA_V1 === "PRODUCT_NORMALIZED", "PANCHAKA basis");
      assert(HARD_PROHIBITION_BASIS.ECLIPSE_DAY_V1 === "PRODUCT_NORMALIZED", "ECLIPSE_DAY basis");
      assert(HARD_PROHIBITION_BASIS.BHADRA_V1 === "classical", "BHADRA classical");
      assert(HARD_PROHIBITION_BASIS.GAND_ANTA_V1 === "classical", "GAND_ANTA classical");
      assert(HARD_PROHIBITION_BASIS.MRITYU_BHAGA_V1 === "classical", "MRITYU_BHAGA classical");
    },
  },
  {
    name: "INT13 Ranking pipeline: exactly 6 stages, ordered as contract §11.2",
    run: () => {
      const expected = [
        "HARD_PROHIBITION_FILTER","SCORE","OUTSIDE_CAUTION_KAAL",
        "APPLICABLE_SUPPORTIVE_OVERLAY","CONTINUITY","EARLIER_UTC",
      ];
      assert(MUHURAT_RANKING_STAGES.length === 6, `stages.length=${MUHURAT_RANKING_STAGES.length}`);
      for (let i = 0; i < 6; i += 1) {
        assert(MUHURAT_RANKING_STAGES[i] === expected[i], `stage[${i}]=${MUHURAT_RANKING_STAGES[i]}`);
      }
    },
  },
  {
    name: "INT14 Rikta Tithi: CAUTION only for BUSINESS/EDUCATION; NEUTRAL for others",
    run: () => {
      assert(RIKTA_TITHI_CATEGORY_CAUTION_V1.BUSINESS_WORK_START === true, "business caution");
      assert(RIKTA_TITHI_CATEGORY_CAUTION_V1.EDUCATION_START === true, "education caution");
      for (const cat of MUHURAT_EVENT_CATEGORIES) {
        if (cat === "BUSINESS_WORK_START" || cat === "EDUCATION_START") continue;
        assert(RIKTA_TITHI_CATEGORY_CAUTION_V1[cat] === false, `${cat} should be neutral`);
      }
    },
  },
  {
    name: "INT15 Category supportive overlays: SPIRITUAL includes BRAHMA_MUHURTA",
    run: () => {
      assert(CATEGORY_SUPPORTIVE_OVERLAYS.SPIRITUAL_PRACTICE.includes("BRAHMA_MUHURTA"), "spiritual→BRAHMA");
      for (const cat of MUHURAT_EVENT_CATEGORIES) {
        const list = CATEGORY_SUPPORTIVE_OVERLAYS[cat];
        for (const o of list) assert(o === "ABHIJIT_MUHURTA" || o === "BRAHMA_MUHURTA", `${cat}: bad overlay ${o}`);
      }
    },
  },
  {
    name: "INT16 Rule registry: unique IDs; getMuhuratRule throws on unknown",
    run: () => {
      const ids = MUHURAT_RULE_REGISTRY.map((r) => r.ruleId);
      assert(new Set(ids).size === ids.length, "duplicate ruleIds");
      // Registry non-empty and >= 25 rules (spec target 35–45)
      assert(MUHURAT_RULE_REGISTRY.length >= 25, `registry length=${MUHURAT_RULE_REGISTRY.length}`);
      // known rule resolves
      const r = getMuhuratRule("BHADRA_V1");
      assert(r.basis === "classical" && r.section === "PANCHANG", "BHADRA_V1 resolves");
      let threw = false;
      try { getMuhuratRule("__DOES_NOT_EXIST__"); } catch { threw = true; }
      assert(threw, "getMuhuratRule must throw on unknown");
    },
  },
  {
    name: "INT17 Rule registry: every rule has valid section/basis + basis-source consistency",
    run: () => {
      const sections = new Set([
        "PANCHANG","TARA","CHANDRA","LAGNA","PLANETARY","DOSHA","SEGMENT","SCORING","STATUS",
      ]);
      const bases = new Set(["classical","PRODUCT_NORMALIZED"]);
      for (const r of MUHURAT_RULE_REGISTRY) {
        assert(sections.has(r.section), `bad section ${r.section} for ${r.ruleId}`);
        assert(bases.has(r.basis), `bad basis ${r.basis} for ${r.ruleId}`);
        // Governance: classical → sourceId non-null; product-normalized → sourceId can be null
        if (r.basis === "classical") {
          assert(r.sourceId !== null && r.sourceId.length > 0, `classical rule ${r.ruleId} missing sourceId`);
        } else {
          // product-normalized may have null sourceId (V1 policy)
          assert(r.sourceId === null || r.sourceId.length > 0, `${r.ruleId} bad sourceId`);
        }
        assert(r.description && r.description.length > 5, `${r.ruleId} description too short`);
      }
    },
  },
  {
    name: "INT18 Rule registry: contract-mandated basis labels (§17.1-3 corrections)",
    run: () => {
      const expectations: Record<string, "classical" | "PRODUCT_NORMALIZED"> = {
        BHADRA_V1: "classical",
        GAND_ANTA_V1: "classical",
        MRITYU_BHAGA_V1: "classical",
        SADE_SATI_PHASE_2_V1: "classical",
        ASHTAMA_SHANI_V1: "classical",
        // Card 13.1A corrections — these MUST be PRODUCT_NORMALIZED
        PANCHAKA_V1: "PRODUCT_NORMALIZED",
        ECLIPSE_DAY_V1: "PRODUCT_NORMALIZED",
        RIKTA_TITHI_CATEGORY_SPECIFIC_V1: "PRODUCT_NORMALIZED",
        // Ashtakavarga overlay = Card 7 dependency, product-normalized modifier
        ASHTAKAVARGA_BALA_PRODUCT_V1: "PRODUCT_NORMALIZED",
        // Ranking pipeline
        MUHURAT_RANKING_V1: "PRODUCT_NORMALIZED",
        // Tara Bala labels are classical; weighting is product-normalized
        TARA_BALA_LABELS_V1: "classical",
        TARA_BALA_WEIGHTING_V1: "PRODUCT_NORMALIZED",
        // Chandra Bala strict mode is classical
        CHANDRA_BALA_STRICT_V1: "classical",
      };
      for (const [id, expected] of Object.entries(expectations)) {
        const r = getMuhuratRule(id);
        assert(r.basis === expected, `${id}: basis=${r.basis} expected ${expected}`);
      }
    },
  },
  {
    name: "INT19 Rule registry: rulebook hash deterministic and stable across runs",
    run: () => {
      const h1 = computeRulebookHash();
      const h2 = computeRulebookHash();
      assert(h1 === h2, `hash not deterministic: ${h1} vs ${h2}`);
      assert(/^[0-9a-f]{16}$/.test(h1), `hash format bad: ${h1}`);
    },
  },
  {
    name: "INT20 Forbidden wording scan across rule descriptions + disclaimer",
    run: () => {
      const forbidden = ["guarantee","guaranteed","lucky number","remedy","remedies","curse","doom","fatal","medical claim","financial advice"];
      // Descriptions must not carry forbidden wording (excludes the disclaimer, which explicitly negates them)
      for (const r of MUHURAT_RULE_REGISTRY) {
        for (const w of forbidden) {
          assert(!r.description.toLowerCase().includes(w), `rule ${r.ruleId} contains forbidden token: ${w}`);
        }
      }
      // Disclaimer explicitly declares the absence of these — verify shape only
      const d = MUHURAT_PREMIUM_DISCLAIMER.toLowerCase();
      assert(d.includes("no remedies"), "disclaimer must declare no remedies");
      assert(d.includes("not a prediction") || d.includes("no prediction"), "disclaimer must declare non-prediction");
      assert(d.includes("no medical") && d.includes("financial"), "disclaimer must declare no medical/financial claim");
    },
  },
  {
    name: "INT21 Byte determinism: repeated JSON.stringify of registry is stable",
    run: () => {
      const a = JSON.stringify(MUHURAT_RULE_REGISTRY);
      const b = JSON.stringify(MUHURAT_RULE_REGISTRY);
      assert(a === b, "registry not stable");
      // no NaN/Infinity in registry
      const scan = (obj: unknown): void => {
        if (typeof obj === "number") assert(Number.isFinite(obj), `non-finite ${obj}`);
        else if (Array.isArray(obj)) obj.forEach(scan);
        else if (obj && typeof obj === "object") Object.values(obj as Record<string, unknown>).forEach(scan);
      };
      scan(MUHURAT_RULE_REGISTRY);
      scan(TARA_TABLE);
      scan(CHANDRA_BALA_TABLE);
      scan(TITHI_CLASSIFICATION);
    },
  },
];

// --- Card 13.2B1 factor engine QA groups ---
groups.push(
  {
    name: "FAC1 Panchang factor: Vara+Tithi+Nakshatra+Yoga+Karana tokens; category-specific Rikta CAUTION",
    run: () => {
      // Rikta tithi (14 Krishna) for BUSINESS should emit RIKTA_TITHI_CATEGORY_SPECIFIC_V1 caution
      const snap = makeSnapshot({
        varaIndex: 3, tithiIndex: 14, tithiName: "Chaturdashi",
        nakshatraIndex: 0, yogaIndex: 15, karanaIndex: 2, karanaName: "Bava", paksha: "Krishna",
      });
      const r = buildPanchangFactor({ snapshot: snap, category: "BUSINESS_WORK_START" });
      assert(r.tokens.length >= 5, `expected ≥5 tokens, got ${r.tokens.length}`);
      const factors = new Set(r.tokens.map((t) => t.factor));
      for (const f of ["VARA","TITHI","NAKSHATRA","YOGA","KARANA"]) assert(factors.has(f), `missing factor ${f}`);
      const rikta = r.tokens.find((t) => t.ruleId === "RIKTA_TITHI_CATEGORY_SPECIFIC_V1");
      assert(!!rikta && rikta.tier === -1 && rikta.status === "CAUTION", `Rikta caution expected for business, got ${JSON.stringify(rikta)}`);

      // Same tithi for SPIRITUAL should NOT emit Rikta CAUTION (per §17.1)
      const r2 = buildPanchangFactor({ snapshot: snap, category: "SPIRITUAL_PRACTICE" });
      const rikta2 = r2.tokens.find((t) => t.ruleId === "RIKTA_TITHI_CATEGORY_SPECIFIC_V1");
      assert(!rikta2, "Rikta must not emit for spiritual practice");
    },
  },
  {
    name: "FAC2 Panchang factor: SHARP Nakshatra emits SHARP_NAKSHATRA_EDUCATION_V1 for EDUCATION",
    run: () => {
      // Ardra (5) is SHARP_TIKSHNA_UGRA
      const snap = makeSnapshot({ nakshatraIndex: 5, nakshatraName: "Ardra" });
      const r = buildPanchangFactor({ snapshot: snap, category: "EDUCATION_START" });
      const sharp = r.tokens.find((t) => t.ruleId === "SHARP_NAKSHATRA_EDUCATION_V1");
      assert(!!sharp && sharp.tier === -1 && sharp.status === "CAUTION", `sharp education caution expected`);
      // For TRAVEL (also sharp), only NAKSHATRA_ACTIVITY_CLASS_V1 emits (not SHARP_NAKSHATRA_EDUCATION_V1)
      const rT = buildPanchangFactor({ snapshot: snap, category: "TRAVEL_START" });
      assert(!rT.tokens.some((t) => t.ruleId === "SHARP_NAKSHATRA_EDUCATION_V1"), "SHARP_NAKSHATRA_EDUCATION_V1 must be education-only");
      const nakCaution = rT.tokens.find((t) => t.factor === "NAKSHATRA" && t.tier === -1);
      assert(!!nakCaution, "sharp nakshatra still caution for travel");
    },
  },
  {
    name: "FAC3 Panchang factor: only registered ruleIds; getMuhuratRule resolves every emitted rule",
    run: () => {
      const snap = makeSnapshot();
      for (const cat of MUHURAT_EVENT_CATEGORIES) {
        const r = buildPanchangFactor({ snapshot: snap, category: cat });
        for (const t of r.tokens) {
          const rule = getMuhuratRule(t.ruleId); // throws on unknown
          assert(rule.basis === t.basis, `${t.ruleId}: basis mismatch ${rule.basis} vs ${t.basis}`);
          assert(t.tier >= -2 && t.tier <= 2, `${t.ruleId}: tier ${t.tier} out of -2..+2`);
          assert(t.evidenceId.startsWith("MUHURAT:"), `${t.ruleId}: evidenceId shape`);
        }
      }
    },
  },
  {
    name: "FAC4 Tara Bala: indexing formula + full 9-Tara cycle across 27 nakshatras",
    run: () => {
      // Formula: taraIndex = ((((m-j) mod 27) + 1 - 1) mod 9) + 1
      // Janma == Moon → count=1 → tara 1 (Janma)
      assert(computeTaraIndex(5, 5).taraIndex === 1, "self → Janma");
      // Janma=0, Moon=1 → count=2 → tara 2 (Sampat)
      assert(computeTaraIndex(0, 1).taraIndex === 2, "next → Sampat");
      // 9 ahead → Janma repeats; 18 ahead → Janma again (3× cycle)
      assert(computeTaraIndex(0, 9).taraIndex === 1, "count=10 → tara 1 (2nd cycle Janma)");
      assert(computeTaraIndex(0, 18).taraIndex === 1, "count=19 → tara 1 (3rd cycle Janma)");
      // Vadha (tara 7) → count 7 or 16 or 25
      assert(computeTaraIndex(0, 6).taraIndex === 7, "count=7 → Vadha");
      assert(computeTaraIndex(0, 15).taraIndex === 7, "count=16 → Vadha");
      assert(computeTaraIndex(0, 24).taraIndex === 7, "count=25 → Vadha");
      // Full cycle sweep — every 27 nakshatras covered
      const counts: number[] = new Array(9).fill(0);
      for (let m = 0; m < 27; m += 1) counts[computeTaraIndex(0, m).taraIndex - 1]! += 1;
      for (let i = 0; i < 9; i += 1) assert(counts[i] === 3, `tara ${i + 1} count=${counts[i]} expected 3`);
    },
  },
  {
    name: "FAC5 Tara Bala factor: Vadha tier=-2; Sampat tier=+1; missing janma → UNAVAILABLE",
    run: () => {
      const vadha = buildTaraBalaFactor({ janmaNakshatraIndex: 0, transitMoonNakshatraIndex: 6, category: "GENERAL_DAILY_ACTIVITY" });
      const wV = vadha.tokens.find((t) => t.ruleId === "TARA_BALA_WEIGHTING_V1");
      assert(!!wV && wV.tier === -2 && wV.status === "CAUTION", `Vadha tier -2 caution, got ${JSON.stringify(wV)}`);
      assert(wV.basis === "PRODUCT_NORMALIZED", `Vadha weighting basis PRODUCT_NORMALIZED, got ${wV.basis}`);

      const sampat = buildTaraBalaFactor({ janmaNakshatraIndex: 0, transitMoonNakshatraIndex: 1, category: "GENERAL_DAILY_ACTIVITY" });
      const wS = sampat.tokens.find((t) => t.ruleId === "TARA_BALA_WEIGHTING_V1");
      assert(!!wS && wS.tier === 1 && wS.status === "SUPPORTIVE", `Sampat tier +1 supportive`);
      // indexing token present + classical
      const idxTok = sampat.tokens.find((t) => t.ruleId === "TARA_BALA_INDEXING_V1");
      assert(!!idxTok && idxTok.basis === "classical", "indexing token classical");

      const missing = buildTaraBalaFactor({ janmaNakshatraIndex: null, transitMoonNakshatraIndex: 5, category: "GENERAL_DAILY_ACTIVITY" });
      assert(missing.tokens.length === 0, "no tokens when janma missing");
      assert(missing.unavailableReasons.length === 1, "unavailable reason emitted");
      assert(missing.partialFlags.includes("MISSING_JANMA_NAKSHATRA"), "partial flag");
    },
  },
  {
    name: "FAC6 Chandra Bala: 12-house partition; house indexing determinism; strict-mode basis classical",
    run: () => {
      assert(computeChandraBalaHouse(0, 0) === 1, "self → house 1");
      assert(computeChandraBalaHouse(0, 5) === 6, "5 ahead → house 6 FAVORABLE");
      assert(computeChandraBalaHouse(0, 7) === 8, "7 ahead → house 8 INAUSPICIOUS");
      assert(computeChandraBalaHouse(0, 11) === 12, "11 ahead → house 12 INAUSPICIOUS");
      // wrap
      assert(computeChandraBalaHouse(5, 3) === 11, "wrap → house 11 FAVORABLE");

      // FAVORABLE house 3 → supportive +1
      const fav = buildChandraBalaFactor({ janmaRashiIndex: 0, transitMoonRashiIndex: 2, category: "GENERAL_DAILY_ACTIVITY" });
      const favStrict = fav.tokens.find((t) => t.ruleId === "CHANDRA_BALA_STRICT_V1");
      assert(!!favStrict && favStrict.tier === 1 && favStrict.status === "SUPPORTIVE", `favorable house 3 → +1`);
      assert(favStrict.basis === "classical", "strict-mode basis classical");

      // NEUTRAL house 2
      const neu = buildChandraBalaFactor({ janmaRashiIndex: 0, transitMoonRashiIndex: 1, category: "GENERAL_DAILY_ACTIVITY" });
      const neuStrict = neu.tokens.find((t) => t.ruleId === "CHANDRA_BALA_STRICT_V1");
      assert(!!neuStrict && neuStrict.tier === 0 && neuStrict.status === "NEUTRAL", "house 2 neutral");

      // INAUSPICIOUS house 8 → -1 caution
      const bad = buildChandraBalaFactor({ janmaRashiIndex: 0, transitMoonRashiIndex: 7, category: "GENERAL_DAILY_ACTIVITY" });
      const badStrict = bad.tokens.find((t) => t.ruleId === "CHANDRA_BALA_STRICT_V1");
      assert(!!badStrict && badStrict.tier === -1 && badStrict.status === "CAUTION", "house 8 caution");

      const missing = buildChandraBalaFactor({ janmaRashiIndex: null, transitMoonRashiIndex: 5, category: "GENERAL_DAILY_ACTIVITY" });
      assert(missing.tokens.length === 0, "no tokens when janma rashi missing");
      assert(missing.partialFlags.includes("MISSING_JANMA_RASHI"), "partial flag");
    },
  },
  {
    name: "FAC7 Dosha factor: BHADRA (karana=Vishti) emits tier=-2 PROHIBITED with classical basis",
    run: () => {
      const snap = makeSnapshot({ karanaIndex: 3, karanaName: "Vishti" });
      const r = buildDoshaFactor({
        snapshot: snap, category: "BUSINESS_WORK_START",
        signals: { eclipseDay: false, panchakaActive: false, sadeSatiPhase2: false, ashtamaShani: false, mrityuBhagaHit: false, gandAnta: false },
      });
      const bhadra = r.tokens.find((t) => t.ruleId === "BHADRA_V1");
      assert(!!bhadra && bhadra.tier === -2 && bhadra.status === "PROHIBITED", `BHADRA tier -2 PROHIBITED, got ${JSON.stringify(bhadra)}`);
      assert(bhadra.basis === "classical", "BHADRA classical basis");

      // Non-Bhadra karana → no BHADRA_V1 token
      const clean = makeSnapshot({ karanaName: "Bava" });
      const r2 = buildDoshaFactor({
        snapshot: clean, category: "BUSINESS_WORK_START",
        signals: { eclipseDay: false, panchakaActive: false, sadeSatiPhase2: false, ashtamaShani: false, mrityuBhagaHit: false, gandAnta: false },
      });
      assert(!r2.tokens.some((t) => t.ruleId === "BHADRA_V1"), "no BHADRA when karana not Vishti");
    },
  },
  {
    name: "FAC8 Dosha factor: PANCHAKA + ECLIPSE_DAY = PRODUCT_NORMALIZED; category-specific applicability",
    run: () => {
      const snap = makeSnapshot();
      // PANCHAKA applies to TRAVEL/VEHICLE; irrelevant to SPIRITUAL
      const rTravel = buildDoshaFactor({
        snapshot: snap, category: "TRAVEL_START",
        signals: { eclipseDay: true, panchakaActive: true, sadeSatiPhase2: false, ashtamaShani: false, mrityuBhagaHit: false, gandAnta: false },
      });
      const panchaka = rTravel.tokens.find((t) => t.ruleId === "PANCHAKA_V1");
      assert(!!panchaka && panchaka.basis === "PRODUCT_NORMALIZED" && panchaka.tier === -2, "PANCHAKA PRODUCT_NORMALIZED tier -2 for TRAVEL");
      const eclipse = rTravel.tokens.find((t) => t.ruleId === "ECLIPSE_DAY_V1");
      assert(!!eclipse && eclipse.basis === "PRODUCT_NORMALIZED" && eclipse.tier === -2, "ECLIPSE_DAY PRODUCT_NORMALIZED tier -2 for TRAVEL");

      const rSpiritual = buildDoshaFactor({
        snapshot: snap, category: "SPIRITUAL_PRACTICE",
        signals: { eclipseDay: true, panchakaActive: true, sadeSatiPhase2: false, ashtamaShani: false, mrityuBhagaHit: false, gandAnta: false },
      });
      assert(!rSpiritual.tokens.some((t) => t.ruleId === "PANCHAKA_V1"), "PANCHAKA not applicable to SPIRITUAL");
      assert(!rSpiritual.tokens.some((t) => t.ruleId === "ECLIPSE_DAY_V1"), "ECLIPSE_DAY not applicable to SPIRITUAL (spiritual has only BHADRA universal)");

      // GAND_ANTA: applies to BUSINESS/TRAVEL/VEHICLE
      const rBiz = buildDoshaFactor({
        snapshot: snap, category: "BUSINESS_WORK_START",
        signals: { eclipseDay: false, panchakaActive: false, sadeSatiPhase2: false, ashtamaShani: false, mrityuBhagaHit: false, gandAnta: true },
      });
      const gand = rBiz.tokens.find((t) => t.ruleId === "GAND_ANTA_V1");
      assert(!!gand && gand.basis === "classical" && gand.tier === -2, "GAND_ANTA classical tier -2");

      // Sade Sati Phase 2 → -1 CAUTION only for BUSINESS
      const rBizSade = buildDoshaFactor({
        snapshot: snap, category: "BUSINESS_WORK_START",
        signals: { eclipseDay: false, panchakaActive: false, sadeSatiPhase2: true, ashtamaShani: false, mrityuBhagaHit: false, gandAnta: false },
      });
      const sade = rBizSade.tokens.find((t) => t.ruleId === "SADE_SATI_PHASE_2_V1");
      assert(!!sade && sade.tier === -1 && sade.status === "CAUTION", "Sade Sati Phase 2 → business CAUTION -1");

      // Unknown signal → partial flag, no fabrication
      const rUnknown = buildDoshaFactor({
        snapshot: snap, category: "BUSINESS_WORK_START",
        signals: { eclipseDay: null, panchakaActive: null, sadeSatiPhase2: null, ashtamaShani: null, mrityuBhagaHit: null, gandAnta: null },
      });
      assert(rUnknown.partialFlags.includes("ECLIPSE_DAY_UNKNOWN"), "partial flag when eclipse unknown");
      assert(rUnknown.partialFlags.includes("GAND_ANTA_UNKNOWN"), "partial flag when gand-anta unknown");
      // No hard prohibition emitted from an unknown signal
      assert(!rUnknown.tokens.some((t) => t.tier === -2 && t.ruleId !== "BHADRA_V1"), "unknown signals must not emit -2 tokens");
    },
  },
);

// --- Card 13.2B2 Lagna / planetary / segment factor QA ---
groups.push(
  {
    name: "FAC9 Lagna factor: quality match + lagna-lord kendra/dusthana + 8th malefic + 7th travel",
    run: () => {
      // TRAVEL prefers MOVABLE (Aries=0). Lagna lord in house 1 (kendra) supportive. 8th malefic caution. 7th benefic supportive.
      const r = buildLagnaFactor({ lagnaSignIndex: 0, lagnaLordHouse: 1, maleficInEighth: true, seventhHouseOccupant: "benefic", category: "TRAVEL_START" });
      const q = r.tokens.find((t) => t.ruleId === "LAGNA_QUALITY_V1");
      assert(!!q && q.tier === 1, "movable lagna supportive for travel");
      const lord = r.tokens.find((t) => t.ruleId === "LAGNA_LORD_PLACEMENT_V1");
      assert(!!lord && lord.tier === 1, "lagna lord kendra supportive");
      const m8 = r.tokens.find((t) => t.ruleId === "EIGHTH_HOUSE_MALEFIC_V1");
      assert(!!m8 && m8.tier === -1, "8th malefic caution");
      const h7 = r.tokens.find((t) => t.ruleId === "SEVENTH_HOUSE_TRAVEL_V1");
      assert(!!h7 && h7.tier === 1 && h7.status === "SUPPORTIVE", "7th benefic supportive travel");
      // dusthana lagna lord → caution
      const r2 = buildLagnaFactor({ lagnaSignIndex: 2, lagnaLordHouse: 8, maleficInEighth: false, seventhHouseOccupant: null, category: "BUSINESS_WORK_START" });
      const lord2 = r2.tokens.find((t) => t.ruleId === "LAGNA_LORD_PLACEMENT_V1");
      assert(!!lord2 && lord2.tier === -1, "dusthana lagna lord caution");
      // 7th-house factor is TRAVEL-only
      assert(!r2.tokens.some((t) => t.ruleId === "SEVENTH_HOUSE_TRAVEL_V1"), "7th factor travel-only");
      // missing chart → partial flag, no fabrication
      const r3 = buildLagnaFactor({ lagnaSignIndex: null, lagnaLordHouse: null, maleficInEighth: null, seventhHouseOccupant: null, category: "BUSINESS_WORK_START" });
      assert(r3.partialFlags.includes("MISSING_NATAL_CHART"), "missing chart partial flag");
    },
  },
  {
    name: "FAC10 Planetary factor: dignity/retro/combust + BAV banding + dasha-lord karaka + mercury-retro-travel",
    run: () => {
      // BUSINESS: karaka Mercury. Exalted dignity supportive; BAV 6 supportive; active dasha lord Mercury supportive.
      const r = buildPlanetaryFactor({
        category: "BUSINESS_WORK_START",
        primaryKaraka: { dignity: "exalted", retrograde: false, combust: false },
        ashtakavargaBav: 6, activeDashaLord: "MERCURY", mercuryRetrograde: null,
      });
      assert(r.tokens.find((t) => t.ruleId === "KARAKA_DIGNITY_V1")!.tier === 1, "exalted dignity +1");
      const bav = r.tokens.find((t) => t.ruleId === "ASHTAKAVARGA_BALA_PRODUCT_V1");
      assert(!!bav && bav.tier === 1 && bav.basis === "PRODUCT_NORMALIZED", "BAV 6 supportive product-normalized");
      const dl = r.tokens.find((t) => t.ruleId === "DASHA_LORD_KARAKA_V1");
      assert(!!dl && dl.tier === 1 && dl.basis === "PRODUCT_NORMALIZED", "dasha lord karaka supportive");
      // debilitated + BAV 1 (caution) + retro business
      const r2 = buildPlanetaryFactor({
        category: "BUSINESS_WORK_START",
        primaryKaraka: { dignity: "debilitated", retrograde: true, combust: true },
        ashtakavargaBav: 1, activeDashaLord: "SATURN", mercuryRetrograde: null,
      });
      assert(r2.tokens.find((t) => t.ruleId === "KARAKA_DIGNITY_V1")!.tier === -1, "debilitated -1");
      assert(r2.tokens.find((t) => t.ruleId === "KARAKA_RETROGRADE_V1")!.tier === -1, "retro -1");
      assert(r2.tokens.find((t) => t.ruleId === "KARAKA_COMBUST_V1")!.tier === -1, "combust -1");
      assert(r2.tokens.find((t) => t.ruleId === "ASHTAKAVARGA_BALA_PRODUCT_V1")!.tier === -1, "BAV 1 caution");
      assert(r2.tokens.find((t) => t.ruleId === "DASHA_LORD_KARAKA_V1")!.tier === 0, "non-karaka dasha lord neutral");
      // Mercury-retro travel (product-normalized) travel-only
      const rT = buildPlanetaryFactor({
        category: "TRAVEL_START",
        primaryKaraka: { dignity: "neutral", retrograde: false, combust: false },
        ashtakavargaBav: 4, activeDashaLord: "MOON", mercuryRetrograde: true,
      });
      const mr = rT.tokens.find((t) => t.ruleId === "MERCURY_RETROGRADE_TRAVEL_V1");
      assert(!!mr && mr.tier === -1 && mr.basis === "PRODUCT_NORMALIZED", "mercury retro travel caution");
      const rB = buildPlanetaryFactor({
        category: "BUSINESS_WORK_START",
        primaryKaraka: { dignity: "neutral", retrograde: false, combust: false },
        ashtakavargaBav: 4, activeDashaLord: "MOON", mercuryRetrograde: true,
      });
      assert(!rB.tokens.some((t) => t.ruleId === "MERCURY_RETROGRADE_TRAVEL_V1"), "mercury-retro-travel not for business");
      // missing upstream → partial flags, no fabrication
      const r3 = buildPlanetaryFactor({
        category: "BUSINESS_WORK_START",
        primaryKaraka: { dignity: null, retrograde: null, combust: null },
        ashtakavargaBav: null, activeDashaLord: null, mercuryRetrograde: null,
      });
      assert(r3.partialFlags.includes("MISSING_ASHTAKAVARGA"), "BAV missing flag");
      assert(r3.partialFlags.includes("MISSING_DASHA_LINEAGE"), "dasha missing flag");
      assert(r3.partialFlags.includes("MISSING_NATAL_CHART"), "chart missing flag");
      assert(r3.tokens.length === 0, "no fabricated tokens when all upstream missing");
    },
  },
  {
    name: "FAC11 Planetary factor: every emitted rule registered; tier ∈ -2..+2; BAV out-of-range → unavailable",
    run: () => {
      for (const cat of MUHURAT_EVENT_CATEGORIES) {
        const r = buildPlanetaryFactor({
          category: cat,
          primaryKaraka: { dignity: "own", retrograde: false, combust: false },
          ashtakavargaBav: 8, activeDashaLord: "JUPITER", mercuryRetrograde: false,
        });
        for (const t of r.tokens) {
          const rule = getMuhuratRule(t.ruleId);
          assert(rule.basis === t.basis, `${t.ruleId} basis mismatch`);
          assert(t.tier >= -2 && t.tier <= 2, `${t.ruleId} tier oob`);
        }
      }
      const bad = buildPlanetaryFactor({
        category: "BUSINESS_WORK_START",
        primaryKaraka: { dignity: "neutral", retrograde: false, combust: false },
        ashtakavargaBav: 99, activeDashaLord: "SUN", mercuryRetrograde: null,
      });
      assert(bad.unavailableReasons.some((u) => u.code === "ASHTAKAVARGA_INVALID"), "BAV oob → unavailable");
    },
  },
  {
    name: "FAC12 Segment factor: Rahu/Gulika/Yamaganda CAUTION overlap; Abhijit supportive; category applicability",
    run: () => {
      const iso = "2026-05-10T09:00:00.000Z";
      const win = (s: string, e: string): PremiumTimedPeriod => ({ type: "x", startUtc: s, endUtc: e, startLocal: s, endLocal: e, timezone: "Asia/Kolkata", status: "available", ruleId: "R", calculationReference: "C" });
      const snap = makeSnapshot();
      snap.rahuKaal = win("2026-05-10T08:30:00.000Z", "2026-05-10T09:30:00.000Z"); // overlaps
      snap.gulika = win("2026-05-10T02:00:00.000Z", "2026-05-10T03:00:00.000Z"); // no
      snap.yamaganda = win("2026-05-10T08:45:00.000Z", "2026-05-10T09:15:00.000Z"); // overlaps
      snap.abhijit = { ...win("2026-05-10T08:50:00.000Z", "2026-05-10T09:10:00.000Z"), wednesdayExclusionConvention: false };
      const r = buildSegmentFactor({ snapshot: snap, queryInstantUtc: iso, category: "GENERAL_DAILY_ACTIVITY" });
      assert(r.tokens.find((t) => t.ruleId === "RAHU_KAAL_V1")!.tier === -1, "rahu overlap caution");
      assert(!r.tokens.some((t) => t.ruleId === "GULIKA_KAAL_V1"), "gulika no overlap");
      assert(r.tokens.find((t) => t.ruleId === "YAMAGANDA_V1")!.tier === -1, "yamaganda overlap caution");
      const abh = r.tokens.find((t) => t.ruleId === "ABHIJIT_MUHURTA_V1");
      assert(!!abh && abh.tier === 1 && abh.status === "SUPPORTIVE", "abhijit supportive (general category)");
      // Abhijit NOT applied to TRAVEL_START (empty overlay list in V1)
      const rT = buildSegmentFactor({ snapshot: snap, queryInstantUtc: iso, category: "TRAVEL_START" });
      assert(!rT.tokens.some((t) => t.ruleId === "ABHIJIT_MUHURTA_V1"), "abhijit not for travel V1");
      // Brahma only for spiritual
      const snapB = makeSnapshot();
      snapB.brahmaMuhurta = { ...win("2026-05-10T00:00:00.000Z", "2026-05-10T00:48:00.000Z"), convention: "FIXED_48MIN_MUHURTA" };
      const rSpir = buildSegmentFactor({ snapshot: snapB, queryInstantUtc: "2026-05-10T00:20:00.000Z", category: "SPIRITUAL_PRACTICE" });
      assert(rSpir.tokens.find((t) => t.ruleId === "BRAHMA_MUHURTA_V1")!.tier === 1, "brahma supportive spiritual");
      const rGen = buildSegmentFactor({ snapshot: snapB, queryInstantUtc: "2026-05-10T00:20:00.000Z", category: "GENERAL_DAILY_ACTIVITY" });
      assert(!rGen.tokens.some((t) => t.ruleId === "BRAHMA_MUHURTA_V1"), "brahma spiritual-only");
    },
  },
  {
    name: "FAC13 Segment factor: Godhuli CAUTION for business/travel near sunset; determinism + invalid instant",
    run: () => {
      const win = (s: string, e: string): PremiumTimedPeriod => ({ type: "x", startUtc: s, endUtc: e, startLocal: s, endLocal: e, timezone: "Asia/Kolkata", status: "available", ruleId: "R", calculationReference: "C" });
      const snap = makeSnapshot();
      snap.sunset = { utc: "2026-05-10T13:00:00.000Z", local: "18:30" };
      void win;
      const near = "2026-05-10T13:10:00.000Z"; // within ±24m
      const rBiz = buildSegmentFactor({ snapshot: snap, queryInstantUtc: near, category: "BUSINESS_WORK_START" });
      assert(rBiz.tokens.find((t) => t.ruleId === "GODHULI_V1")!.tier === -1, "godhuli caution business");
      const rSpir = buildSegmentFactor({ snapshot: snap, queryInstantUtc: near, category: "SPIRITUAL_PRACTICE" });
      assert(!rSpir.tokens.some((t) => t.ruleId === "GODHULI_V1"), "godhuli not for spiritual");
      // determinism
      const a = JSON.stringify(buildSegmentFactor({ snapshot: snap, queryInstantUtc: near, category: "BUSINESS_WORK_START" }));
      const b = JSON.stringify(buildSegmentFactor({ snapshot: snap, queryInstantUtc: near, category: "BUSINESS_WORK_START" }));
      assert(a === b, "segment factor deterministic");
      // invalid instant → unavailable, no tokens
      const bad = buildSegmentFactor({ snapshot: snap, queryInstantUtc: "not-a-date", category: "BUSINESS_WORK_START" });
      assert(bad.unavailableReasons.length === 1 && bad.tokens.length === 0, "invalid instant unavailable");
    },
  },
);

// --- Card 13.2C ranker + orchestrator QA -------------------------------------
function makeBucketContext(
  index: number,
  bucketStartUtcMs: number,
  snapshot: PremiumPanchangSnapshot,
  overrides: Partial<MuhuratBucketContext["natal"]> = {},
  doshaOverrides: Partial<MuhuratBucketContext["doshaSignals"]> = {},
): MuhuratBucketContext {
  const start = new Date(bucketStartUtcMs).toISOString();
  const mid = new Date(bucketStartUtcMs + 2.5 * 60_000).toISOString();
  const end = new Date(bucketStartUtcMs + 5 * 60_000).toISOString();
  return {
    index, bucketStartUtc: start, bucketMidUtc: mid, bucketEndUtc: end,
    panchangSnapshot: snapshot,
    natal: {
      janmaNakshatraIndex: overrides.janmaNakshatraIndex ?? 0,
      janmaRashiIndex: overrides.janmaRashiIndex ?? 0,
      lagnaSignIndex: overrides.lagnaSignIndex ?? 2,
      lagnaLordHouse: overrides.lagnaLordHouse ?? 1,
      maleficInEighth: overrides.maleficInEighth ?? false,
      seventhHouseOccupant: overrides.seventhHouseOccupant ?? "empty",
      primaryKaraka: overrides.primaryKaraka ?? { dignity: "neutral", retrograde: false, combust: false },
      ashtakavargaBav: overrides.ashtakavargaBav ?? 4,
      activeDashaLord: overrides.activeDashaLord ?? "MOON",
      mercuryRetrograde: overrides.mercuryRetrograde ?? false,
      transitMoonNakshatraIndex: overrides.transitMoonNakshatraIndex ?? 1, // Sampat wrt janma 0
      transitMoonRashiIndex: overrides.transitMoonRashiIndex ?? 2,          // house 3 favourable
    },
    doshaSignals: {
      eclipseDay: doshaOverrides.eclipseDay ?? false,
      panchakaActive: doshaOverrides.panchakaActive ?? false,
      sadeSatiPhase2: doshaOverrides.sadeSatiPhase2 ?? false,
      ashtamaShani: doshaOverrides.ashtamaShani ?? false,
      mrityuBhagaHit: doshaOverrides.mrityuBhagaHit ?? false,
      gandAnta: doshaOverrides.gandAnta ?? false,
    },
  };
}

groups.push(
  {
    name: "ORCH1 classify bucket status: score ≥ +2 SUPPORTIVE, ≤ -1 CAUTION, hard-prohibited AVOID",
    run: () => {
      assert(classifyBucketStatus(3, false) === "SUPPORTIVE", "score 3 → SUPPORTIVE");
      assert(classifyBucketStatus(1, false) === "NEUTRAL", "score 1 → NEUTRAL");
      assert(classifyBucketStatus(-1, false) === "CAUTION", "score -1 → CAUTION");
      assert(classifyBucketStatus(5, true) === "AVOID", "any hard-prohibited → AVOID regardless of score");
      // scoreBucketTokens
      const toks: MuhuratEvidenceToken[] = [
        { ruleId: "X", evidenceId: "Y", factor: "F", category: "GENERAL_DAILY_ACTIVITY", tier: 1, basis: "classical", status: "SUPPORTIVE" },
        { ruleId: "X", evidenceId: "Y2", factor: "F", category: "GENERAL_DAILY_ACTIVITY", tier: -1, basis: "classical", status: "CAUTION" },
      ];
      assert(scoreBucketTokens(toks) === 0, "sum of tiers");
    },
  },
  {
    name: "ORCH2 mergeBucketsIntoWindows: adjacent same-status buckets merge; gaps split; deduped tokens",
    run: () => {
      const mkTok = (id: string, tier: number): MuhuratEvidenceToken => ({
        ruleId: id, evidenceId: `E:${id}`, factor: "F", category: "GENERAL_DAILY_ACTIVITY",
        tier: tier as -2 | -1 | 0 | 1 | 2, basis: "classical", status: "NEUTRAL",
      });
      const b = (i: number, status: "SUPPORTIVE" | "CAUTION" | "NEUTRAL" | "AVOID", tokens: MuhuratEvidenceToken[]): ScoredBucket => ({
        index: i, bucketStartUtc: `2026-05-10T${String(i).padStart(2, "0")}:00:00.000Z`,
        bucketEndUtc: `2026-05-10T${String(i).padStart(2, "0")}:05:00.000Z`,
        tokens, partialFlags: [], unavailableReasons: [],
        hardProhibited: status === "AVOID", score: status === "SUPPORTIVE" ? 3 : status === "CAUTION" ? -1 : 0,
        inCautionKaal: false, inSupportiveOverlay: status === "SUPPORTIVE",
        status,
      });
      const buckets: ScoredBucket[] = [
        b(0, "SUPPORTIVE", [mkTok("A", 1)]),
        b(1, "SUPPORTIVE", [mkTok("A", 1), mkTok("B", 1)]), // shares A → dedupe
        b(2, "NEUTRAL",    [mkTok("C", 0)]),
        b(3, "CAUTION",    [mkTok("D", -1)]),
        b(4, "CAUTION",    [mkTok("D", -1)]),   // same status contiguous
        // gap: index 5 missing → next SUPPORTIVE run non-contiguous
        b(6, "SUPPORTIVE", [mkTok("E", 1)]),
      ];
      const windows = mergeBucketsIntoWindows(buckets);
      // Expected windows: [0-1 SUPPORTIVE, 2 NEUTRAL, 3-4 CAUTION, 6 SUPPORTIVE]
      assert(windows.length === 4, `windows.length=${windows.length}, expected 4`);
      assert(windows[0]!.bucketCount === 2 && windows[0]!.status === "SUPPORTIVE", "window 0 supportive 2");
      // dedupe: A appears once, B once
      const w0Rules = new Set(windows[0]!.tokens.map((t) => t.ruleId));
      assert(w0Rules.has("A") && w0Rules.has("B") && windows[0]!.tokens.length === 2, "deduped tokens");
      assert(windows[2]!.bucketCount === 2 && windows[2]!.status === "CAUTION", "window 2 caution 2");
      assert(windows[3]!.bucketCount === 1 && windows[3]!.status === "SUPPORTIVE", "gap splits window");
    },
  },
  {
    name: "ORCH3 compareWindowsForRank: 6-stage pipeline (score → outside kaal → overlay → continuity → earlier UTC)",
    run: () => {
      const w = (
        startUtc: string, score: number, bucketCount: number, kaal: boolean, overlay: boolean,
      ) => ({
        status: "SUPPORTIVE" as const, startUtc, endUtc: startUtc,
        bucketIndices: [0], bucketCount, score, bestBucketScore: score,
        inCautionKaal: kaal, inSupportiveOverlay: overlay,
        tokens: [], partialFlags: [], unavailableReasons: [],
      });
      // Stage 2 dominates: higher score wins
      let a = w("2026-05-10T08:00:00.000Z", 5, 3, true, true);
      let b = w("2026-05-10T07:00:00.000Z", 4, 6, false, true);
      assert(compareWindowsForRank(a, b) < 0, "higher score first");
      // Stage 3 tie-break: outside caution kaal preferred (score tied)
      a = w("2026-05-10T08:00:00.000Z", 4, 2, true, true);
      b = w("2026-05-10T07:00:00.000Z", 4, 2, false, false);
      assert(compareWindowsForRank(a, b) > 0, "outside caution kaal wins tie");
      // Stage 4: applicable supportive overlay wins next
      a = w("2026-05-10T08:00:00.000Z", 4, 2, false, false);
      b = w("2026-05-10T09:00:00.000Z", 4, 2, false, true);
      assert(compareWindowsForRank(a, b) > 0, "overlay wins tie");
      // Stage 5: continuity (larger bucketCount) wins
      a = w("2026-05-10T08:00:00.000Z", 4, 2, false, true);
      b = w("2026-05-10T09:00:00.000Z", 4, 5, false, true);
      assert(compareWindowsForRank(a, b) > 0, "larger continuity wins");
      // Stage 6: earlier UTC as final disambiguator (all else equal → deterministic)
      a = w("2026-05-10T08:00:00.000Z", 4, 3, false, true);
      b = w("2026-05-10T09:00:00.000Z", 4, 3, false, true);
      assert(compareWindowsForRank(a, b) < 0, "earlier UTC first");
    },
  },
  {
    name: "ORCH4 orchestrator: unsupported category → UNSUPPORTED_CATEGORY (fail-closed)",
    run: () => {
      // The orchestrator input accepts `string` for category so callers can be validated
      // fail-closed. "MARRIAGE" is deliberately outside the V1 supported set.
      const r = buildMuhuratSnapshot({ category: "MARRIAGE", buckets: [] });
      assert(r.status === "UNSUPPORTED_CATEGORY", `status=${r.status}`);
      assert(r.supportive.length === 0 && r.caution.length === 0, "no windows");
      assert(r.category === null, "category null on unsupported");
      assert(r.failureCode === "UNSUPPORTED_CATEGORY", "failureCode set");
    },
  },
  {
    name: "ORCH5 orchestrator: end-to-end run on 4 buckets; SUPPORTIVE ranked; provenance + disclaimer present",
    run: () => {
      const snap = makeSnapshot({ varaIndex: 4, tithiIndex: 5, nakshatraIndex: 0, yogaIndex: 15, karanaIndex: 0 });
      // Bucket 0: baseline neutral-to-supportive. Bucket 1: supportive (add Abhijit). Bucket 2: same. Bucket 3: caution overlap Rahu.
      const win = (s: string, e: string): PremiumTimedPeriod => ({
        type: "x", startUtc: s, endUtc: e, startLocal: s, endLocal: e,
        timezone: "Asia/Kolkata", status: "available", ruleId: "R", calculationReference: "C",
      });
      const snapAbh: PremiumPanchangSnapshot = { ...snap,
        abhijit: { ...win("2026-05-10T09:00:00.000Z", "2026-05-10T09:20:00.000Z"), wednesdayExclusionConvention: false } };
      const snapRahu: PremiumPanchangSnapshot = { ...snap,
        rahuKaal: win("2026-05-10T10:00:00.000Z", "2026-05-10T11:00:00.000Z") };
      const t0 = Date.parse("2026-05-10T08:55:00.000Z");
      const buckets: MuhuratBucketContext[] = [
        makeBucketContext(0, t0, snap), // no Abhijit yet, mostly neutral
        makeBucketContext(1, t0 + 5 * 60_000, snapAbh),  // 09:00 — Abhijit overlap
        makeBucketContext(2, t0 + 10 * 60_000, snapAbh), // 09:05 — Abhijit overlap
        makeBucketContext(3, t0 + 65 * 60_000, snapRahu, {}, {}), // 10:00 — Rahu overlap
      ];
      const r = buildMuhuratSnapshot({ category: "GENERAL_DAILY_ACTIVITY", buckets });
      assert(r.category === "GENERAL_DAILY_ACTIVITY", "category preserved");
      assert(r.scoredBuckets.length === 4, "all 4 buckets scored");
      assert(r.contractVersion === "1.0.0", "contract version pinned");
      assert(r.provenance.rulebookHash.length === 16, "rulebookHash present");
      assert(r.disclaimer.toLowerCase().includes("no remedies"), "disclaimer present");
      assert(Array.isArray(r.rankingStages) && r.rankingStages.length === 6, "6-stage pipeline advertised");
      // Windows are ranked; supportive windows must have score ≥ +2 (best-bucket-score)
      for (const w of r.supportive) assert(w.bestBucketScore >= 2, `supportive best score=${w.bestBucketScore}`);
      // Every ranked window's tokens are non-empty and typed
      for (const w of [...r.supportive, ...r.caution]) {
        for (const t of w.tokens) {
          assert(t.tier >= -2 && t.tier <= 2, `tier oob in ${t.ruleId}`);
        }
      }
      // No percentages or lucky claims anywhere
      const blob = JSON.stringify({ ...r, disclaimer: "", provenance: null }).toLowerCase();
      for (const w of ["percent", "lucky", "guarantee", "perfect"]) {
        assert(!blob.includes(w), `forbidden token: ${w}`);
      }
    },
  },
  {
    name: "ORCH6 orchestrator: hard-prohibition (Bhadra karana) → AVOID window; excluded from supportive ranking",
    run: () => {
      const snap = makeSnapshot({ karanaIndex: 3, karanaName: "Vishti" });
      const t0 = Date.parse("2026-05-10T08:00:00.000Z");
      const buckets = [
        makeBucketContext(0, t0, snap),
        makeBucketContext(1, t0 + 5 * 60_000, snap),
        makeBucketContext(2, t0 + 10 * 60_000, snap),
      ];
      const r = buildMuhuratSnapshot({ category: "BUSINESS_WORK_START", buckets });
      assert(r.avoid.length >= 1, "AVOID window present");
      for (const w of r.avoid) assert(w.status === "AVOID", "avoid window status");
      // Not in supportive
      for (const w of r.supportive) assert(w.status === "SUPPORTIVE", "no AVOID in supportive");
      // The AVOID windows carry BHADRA_V1 evidence
      const hasBhadra = r.avoid.some((w) => w.tokens.some((t) => t.ruleId === "BHADRA_V1"));
      assert(hasBhadra, "AVOID windows carry BHADRA_V1 token");
    },
  },
  {
    name: "ORCH7 orchestrator: deterministic — identical input → byte-identical JSON",
    run: () => {
      const snap = makeSnapshot();
      const t0 = Date.parse("2026-05-10T08:00:00.000Z");
      const mkBuckets = () => [
        makeBucketContext(0, t0, snap),
        makeBucketContext(1, t0 + 5 * 60_000, snap),
      ];
      const a = JSON.stringify(buildMuhuratSnapshot({ category: "SPIRITUAL_PRACTICE", buckets: mkBuckets() }));
      const b = JSON.stringify(buildMuhuratSnapshot({ category: "SPIRITUAL_PRACTICE", buckets: mkBuckets() }));
      assert(a === b, "byte-identical snapshot for identical input");
    },
  },
  {
    name: "ORCH8 orchestrator: missing natal chart → PARTIAL status + partial flags surfaced",
    run: () => {
      const snap = makeSnapshot();
      const t0 = Date.parse("2026-05-10T08:00:00.000Z");
      const buckets = [
        makeBucketContext(0, t0, snap, {
          janmaNakshatraIndex: null, janmaRashiIndex: null, lagnaSignIndex: null, lagnaLordHouse: null,
          maleficInEighth: null, seventhHouseOccupant: null,
          primaryKaraka: { dignity: null, retrograde: null, combust: null },
          ashtakavargaBav: null, activeDashaLord: null, mercuryRetrograde: null,
        }),
      ];
      const r = buildMuhuratSnapshot({ category: "BUSINESS_WORK_START", buckets });
      assert(r.status === "PARTIAL", `status=${r.status}, expected PARTIAL`);
      assert(r.partialFlags.some((f) => /MISSING_/.test(f)), `partial flags present: ${r.partialFlags.join(",")}`);
    },
  },
);

// ============================================================================
// Card 13.2D — Deterministic fixture corpus (full-engine, end-to-end proof).
// Each fixture drives buildMuhuratSnapshot end-to-end and asserts a targeted
// behaviour PLUS the corpus-wide invariants enforced by runFixture():
//   byte-determinism (identical input → identical JSON), provenance +
//   rule-ID integrity (every emitted token resolves and basis matches),
//   tier bounds (-2..+2), evidence-ID shape, and a forbidden-wording scan.
// This is QA-only: it changes no formulas, weights, or registered rules.
// ============================================================================
const NON_FIXTURE_GROUPS = groups.length;

const CATS = [
  "GENERAL_DAILY_ACTIVITY", "SPIRITUAL_PRACTICE", "BUSINESS_WORK_START",
  "TRAVEL_START", "VEHICLE_PURCHASE", "EDUCATION_START",
] as const;
type Cat = (typeof CATS)[number];
type NatalOv = Partial<MuhuratBucketContext["natal"]>;
type DoshaOv = Partial<MuhuratBucketContext["doshaSignals"]>;

const T0 = Date.parse("2026-05-10T06:00:00.000Z");
const FORBIDDEN = ["guarantee", "guaranteed", "lucky", "percent", "perfect", "remedy", "remedies", "curse", "doom", "fatal"];

function tp(s: string, e: string): PremiumTimedPeriod {
  return { type: "x", startUtc: s, endUtc: e, startLocal: s, endLocal: e, timezone: "Asia/Kolkata", status: "available", ruleId: "R", calculationReference: "C" };
}

// Snapshot with present, NON-overlapping caution segments + sunset so the segment
// factor reports no missing/partial state → a clean bucket resolves to CALCULATED.
function fullSnap(o: MakeSnapshotOverrides = {}): PremiumPanchangSnapshot {
  const s = makeSnapshot(o);
  s.rahuKaal = tp("2026-05-10T12:00:00.000Z", "2026-05-10T13:00:00.000Z");
  s.gulika = tp("2026-05-10T11:00:00.000Z", "2026-05-10T11:30:00.000Z");
  s.yamaganda = tp("2026-05-10T10:00:00.000Z", "2026-05-10T10:30:00.000Z");
  s.sunset = { utc: "2026-05-10T13:00:00.000Z", local: "18:30" };
  return s;
}

const NULL_NATAL: NatalOv = {
  janmaNakshatraIndex: null, janmaRashiIndex: null, lagnaSignIndex: null, lagnaLordHouse: null,
  maleficInEighth: null, seventhHouseOccupant: null,
  primaryKaraka: { dignity: null, retrograde: null, combust: null },
  ashtakavargaBav: null, activeDashaLord: null, mercuryRetrograde: null,
};

// Per-category neutral weekday + non-preferred Lagna sign so a caution stack
// (Vipat Tara, inauspicious Chandra house, debilitated karaka, low BAV) is not
// diluted by unrelated supportive contributors → deterministic CAUTION.
const NEUTRAL_VARA: Record<Cat, number> = {
  GENERAL_DAILY_ACTIVITY: 0, SPIRITUAL_PRACTICE: 2, BUSINESS_WORK_START: 0,
  TRAVEL_START: 5, VEHICLE_PURCHASE: 0, EDUCATION_START: 2,
};
function cautionNatal(cat: Cat): NatalOv {
  return {
    transitMoonNakshatraIndex: 2, // Vipat Tara (−1) wrt janma 0
    transitMoonRashiIndex: 3,     // house 4 INAUSPICIOUS (−1) wrt janma 0
    lagnaSignIndex: cat === "VEHICLE_PURCHASE" ? 0 : 1, // non-preferred → neutral
    lagnaLordHouse: 3,            // neutral placement
    primaryKaraka: { dignity: "debilitated", retrograde: false, combust: false }, // −1
    ashtakavargaBav: 1,           // BAV band 0..2 → −1
    activeDashaLord: "SATURN",    // never a category karaka → neutral
    mercuryRetrograde: false,
    maleficInEighth: false,
    seventhHouseOccupant: "empty",
  };
}
function cautionSnap(cat: Cat): PremiumPanchangSnapshot {
  return fullSnap({
    varaIndex: NEUTRAL_VARA[cat], varaName: "NeutralDay", tithiIndex: 5, tithiName: "Panchami",
    nakshatraIndex: 2, nakshatraName: "Krittika", yogaIndex: 22, yogaName: "Shukla",
    karanaIndex: 0, karanaName: "Bava", paksha: "Shukla",
  });
}

function mkBuckets(snap: PremiumPanchangSnapshot, natal: NatalOv = {}, dosha: DoshaOv = {}, count = 1, startMs = T0): MuhuratBucketContext[] {
  const out: MuhuratBucketContext[] = [];
  for (let i = 0; i < count; i += 1) out.push(makeBucketContext(i, startMs + i * 5 * 60_000, snap, natal, dosha));
  return out;
}
function mkInput(category: string, buckets: MuhuratBucketContext[]): MuhuratOrchestratorInput {
  return { category, buckets, panchangProvenance: null };
}
function bucketTokens(r: MuhuratSnapshot) {
  return r.scoredBuckets[0]?.tokens ?? [];
}

let FIXTURE_COUNT = 0;
function runFixture(name: string, input: MuhuratOrchestratorInput, check: (r: MuhuratSnapshot) => void): void {
  FIXTURE_COUNT += 1;
  groups.push({
    name: `FX${String(FIXTURE_COUNT).padStart(3, "0")} ${name}`,
    run: () => {
      const r1 = buildMuhuratSnapshot(input);
      const r2 = buildMuhuratSnapshot(input);
      assert(JSON.stringify(r1) === JSON.stringify(r2), "non-deterministic: identical input produced differing JSON");
      // Corpus-wide invariants on every fixture.
      assert(r1.rankingStages.length === 6, "ranking pipeline must advertise 6 stages");
      assert(/^[0-9a-f]{16}$/.test(r1.provenance.rulebookHash), `rulebookHash shape ${r1.provenance.rulebookHash}`);
      assert(r1.disclaimer.toLowerCase().includes("no remedies"), "disclaimer present");
      for (const b of r1.scoredBuckets) {
        for (const t of b.tokens) {
          const rule = getMuhuratRule(t.ruleId); // throws on unknown rule ID
          assert(rule.basis === t.basis, `${t.ruleId}: basis mismatch ${rule.basis} vs ${t.basis}`);
          assert(t.tier >= -2 && t.tier <= 2, `${t.ruleId}: tier ${t.tier} out of -2..+2`);
          assert(t.evidenceId.startsWith("MUHURAT:"), `${t.ruleId}: evidenceId shape ${t.evidenceId}`);
        }
      }
      const blob = JSON.stringify({ ...r1, disclaimer: "", provenance: null }).toLowerCase();
      for (const w of FORBIDDEN) assert(!blob.includes(w), `forbidden wording '${w}' present`);
      check(r1);
    },
  });
}

// --- Core per-category proof: supportive / caution / hard-prohibited / partial / tie ---
for (const cat of CATS) {
  runFixture(`${cat} supportive → CALCULATED`, mkInput(cat, mkBuckets(fullSnap())), (r) => {
    assert(r.status === "CALCULATED", `status ${r.status}`);
    assert(r.supportive.length >= 1, "supportive window present");
    assert(r.supportive[0]!.bestBucketScore >= 2, `bestBucketScore ${r.supportive[0]!.bestBucketScore}`);
  });
  runFixture(`${cat} caution → CALCULATED`, mkInput(cat, mkBuckets(cautionSnap(cat), cautionNatal(cat))), (r) => {
    assert(r.status === "CALCULATED", `status ${r.status}`);
    assert(r.caution.length >= 1, "caution window present");
    assert(r.supportive.length === 0, "no supportive window in a caution fixture");
  });
  runFixture(`${cat} hard-prohibited (Bhadra) → AVOID`, mkInput(cat, mkBuckets(fullSnap({ karanaIndex: 3, karanaName: "Vishti" }))), (r) => {
    assert(r.avoid.length >= 1, "AVOID window present");
    assert(r.avoid.some((w) => w.tokens.some((t) => t.ruleId === "BHADRA_V1" && t.tier === -2)), "AVOID carries BHADRA_V1");
    assert(r.supportive.every((w) => w.status === "SUPPORTIVE"), "AVOID excluded from supportive");
  });
  runFixture(`${cat} partial / unavailable → PARTIAL`, mkInput(cat, mkBuckets(fullSnap(), NULL_NATAL)), (r) => {
    assert(r.status === "PARTIAL", `status ${r.status}`);
    assert(r.partialFlags.some((f) => f.startsWith("MISSING_")), `partial flags: ${r.partialFlags.join(",")}`);
  });
  const tieBuckets = [makeBucketContext(0, T0, fullSnap()), makeBucketContext(2, T0 + 10 * 60_000, fullSnap())];
  runFixture(`${cat} deterministic tie (EARLIER_UTC)`, mkInput(cat, tieBuckets), (r) => {
    assert(r.supportive.length === 2, `expected 2 tied windows, got ${r.supportive.length}`);
    assert(r.supportive[0]!.startUtc < r.supportive[1]!.startUtc, "earlier-UTC window ranks first");
  });
}

// --- Tara Bala boundaries: all 9 taras (Vadha −2 → AVOID) ---
const TARA_TIER = [-1, 1, -1, 1, -1, 1, -2, 1, 1];
for (let m = 0; m < 9; m += 1) {
  runFixture(`Tara boundary tara=${m + 1} tier=${TARA_TIER[m]}`,
    mkInput("GENERAL_DAILY_ACTIVITY", mkBuckets(fullSnap(), { janmaNakshatraIndex: 0, transitMoonNakshatraIndex: m })), (r) => {
      const t = bucketTokens(r).find((x) => x.ruleId === "TARA_BALA_WEIGHTING_V1");
      assert(!!t && t.tier === TARA_TIER[m], `tara tier ${t?.tier} expected ${TARA_TIER[m]}`);
      if (m === 6) assert(r.avoid.length >= 1, "Vadha (−2) → AVOID");
    });
}

// --- Chandra Bala boundaries: 12-house partition ---
const CH_TIER = [1, 0, 1, -1, 0, 1, 1, -1, 0, 1, 1, -1];
for (let h = 1; h <= 12; h += 1) {
  runFixture(`Chandra boundary house=${h} tier=${CH_TIER[h - 1]}`,
    mkInput("GENERAL_DAILY_ACTIVITY", mkBuckets(fullSnap(), { janmaRashiIndex: 0, transitMoonRashiIndex: h - 1 })), (r) => {
      const t = bucketTokens(r).find((x) => x.ruleId === "CHANDRA_BALA_STRICT_V1");
      assert(!!t && t.tier === CH_TIER[h - 1], `chandra tier ${t?.tier} expected ${CH_TIER[h - 1]}`);
    });
}

// --- Card 7 Ashtakavarga BAV banding (0..8) ---
for (let bav = 0; bav <= 8; bav += 1) {
  const expected = bav >= 5 ? 1 : bav <= 2 ? -1 : 0;
  runFixture(`BAV band bindu=${bav} tier=${expected}`,
    mkInput("BUSINESS_WORK_START", mkBuckets(fullSnap(), { ashtakavargaBav: bav })), (r) => {
      const t = bucketTokens(r).find((x) => x.ruleId === "ASHTAKAVARGA_BALA_PRODUCT_V1");
      assert(!!t && t.tier === expected && t.basis === "PRODUCT_NORMALIZED", `BAV tier ${t?.tier} expected ${expected}`);
    });
}

// --- Yoga classification tiers ---
for (const [yidx, tier, label] of [[15, 1, "supportive"], [0, -1, "caution"], [22, 0, "neutral"]] as const) {
  runFixture(`Yoga ${label} idx=${yidx}`,
    mkInput("GENERAL_DAILY_ACTIVITY", mkBuckets(fullSnap({ yogaIndex: yidx, yogaName: `Yoga${yidx}` }))), (r) => {
      const t = bucketTokens(r).find((x) => x.ruleId === "YOGA_CLASSIFICATION_V1");
      assert(!!t && t.tier === tier, `yoga tier ${t?.tier} expected ${tier}`);
    });
}

// --- Nakshatra activity-class category rules ---
runFixture("Nakshatra sharp → CAUTION (general)", mkInput("GENERAL_DAILY_ACTIVITY", mkBuckets(fullSnap({ nakshatraIndex: 5, nakshatraName: "Ardra" }))), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "NAKSHATRA_ACTIVITY_CLASS_V1" && t.tier === -1), "sharp caution");
});
runFixture("Nakshatra sharp → education-specific CAUTION", mkInput("EDUCATION_START", mkBuckets(fullSnap({ nakshatraIndex: 5, nakshatraName: "Ardra" }))), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "SHARP_NAKSHATRA_EDUCATION_V1" && t.tier === -1), "education sharp");
});
runFixture("Nakshatra movable → travel SUPPORTIVE", mkInput("TRAVEL_START", mkBuckets(fullSnap({ nakshatraIndex: 6, nakshatraName: "Punarvasu" }))), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "NAKSHATRA_ACTIVITY_CLASS_V1" && t.tier === 1), "travel movable");
});
runFixture("Nakshatra soft → spiritual SUPPORTIVE", mkInput("SPIRITUAL_PRACTICE", mkBuckets(fullSnap({ nakshatraIndex: 4, nakshatraName: "Mrigashira" }))), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "NAKSHATRA_ACTIVITY_CLASS_V1" && t.tier === 1), "spiritual soft");
});
runFixture("Nakshatra soft → education SUPPORTIVE", mkInput("EDUCATION_START", mkBuckets(fullSnap({ nakshatraIndex: 4, nakshatraName: "Mrigashira" }))), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "NAKSHATRA_ACTIVITY_CLASS_V1" && t.tier === 1), "education soft");
});
runFixture("Nakshatra swift → business SUPPORTIVE", mkInput("BUSINESS_WORK_START", mkBuckets(fullSnap({ nakshatraIndex: 0, nakshatraName: "Ashwini" }))), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "NAKSHATRA_ACTIVITY_CLASS_V1" && t.tier === 1), "business swift");
});

// --- Rikta Tithi: CAUTION only for business/education; neutral otherwise ---
for (const cat of CATS) {
  const expectRikta = cat === "BUSINESS_WORK_START" || cat === "EDUCATION_START";
  runFixture(`Rikta tithi ${cat} ${expectRikta ? "CAUTION" : "neutral"}`,
    mkInput(cat, mkBuckets(fullSnap({ tithiIndex: 4, tithiName: "Chaturthi", paksha: "Shukla" }))), (r) => {
      const has = bucketTokens(r).some((t) => t.ruleId === "RIKTA_TITHI_CATEGORY_SPECIFIC_V1");
      assert(has === expectRikta, `rikta presence ${has} expected ${expectRikta}`);
    });
}

// --- Vara eligibility tiers per category ---
const VARA_CASE: Array<[Cat, number, number]> = [
  ["GENERAL_DAILY_ACTIVITY", 1, 1], ["SPIRITUAL_PRACTICE", 6, 1], ["BUSINESS_WORK_START", 2, -1],
  ["TRAVEL_START", 0, -1], ["VEHICLE_PURCHASE", 6, -1], ["EDUCATION_START", 2, 0],
];
for (const [cat, vidx, tier] of VARA_CASE) {
  runFixture(`Vara ${cat} weekday=${vidx} tier=${tier}`,
    mkInput(cat, mkBuckets(fullSnap({ varaIndex: vidx, varaName: `Weekday${vidx}` }))), (r) => {
      const t = bucketTokens(r).find((x) => x.ruleId === "VARA_ELIGIBILITY_V1");
      assert(!!t && t.tier === tier, `vara tier ${t?.tier} expected ${tier}`);
    });
}

// --- Card 5 Dasha / Gochar caution overlays ---
runFixture("Sade Sati Phase 2 → business CAUTION", mkInput("BUSINESS_WORK_START", mkBuckets(fullSnap(), {}, { sadeSatiPhase2: true })), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "SADE_SATI_PHASE_2_V1" && t.tier === -1), "sade sati");
});
runFixture("Ashtama Shani → business CAUTION", mkInput("BUSINESS_WORK_START", mkBuckets(fullSnap(), {}, { ashtamaShani: true })), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "ASHTAMA_SHANI_V1" && t.tier === -1), "ashtama shani business");
});
runFixture("Ashtama Shani → travel CAUTION", mkInput("TRAVEL_START", mkBuckets(fullSnap(), {}, { ashtamaShani: true })), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "ASHTAMA_SHANI_V1" && t.tier === -1), "ashtama shani travel");
});

// --- Hard prohibitions across applicable categories ---
for (const cat of ["GENERAL_DAILY_ACTIVITY", "BUSINESS_WORK_START", "TRAVEL_START", "VEHICLE_PURCHASE", "EDUCATION_START"] as Cat[]) {
  runFixture(`Eclipse-day → AVOID ${cat}`, mkInput(cat, mkBuckets(fullSnap(), {}, { eclipseDay: true })), (r) => {
    assert(r.avoid.some((w) => w.tokens.some((t) => t.ruleId === "ECLIPSE_DAY_V1" && t.tier === -2)), "eclipse AVOID");
    assert(r.status === "CALCULATED", `status ${r.status}`);
  });
}
runFixture("Eclipse-day NOT applicable to spiritual", mkInput("SPIRITUAL_PRACTICE", mkBuckets(fullSnap(), {}, { eclipseDay: true })), (r) => {
  assert(!bucketTokens(r).some((t) => t.ruleId === "ECLIPSE_DAY_V1"), "no eclipse token for spiritual");
});
for (const cat of ["BUSINESS_WORK_START", "TRAVEL_START", "VEHICLE_PURCHASE"] as Cat[]) {
  runFixture(`Gand-Anta → AVOID ${cat}`, mkInput(cat, mkBuckets(fullSnap(), {}, { gandAnta: true })), (r) => {
    assert(r.avoid.some((w) => w.tokens.some((t) => t.ruleId === "GAND_ANTA_V1" && t.tier === -2)), "gand-anta AVOID");
  });
}
for (const cat of ["TRAVEL_START", "VEHICLE_PURCHASE"] as Cat[]) {
  runFixture(`Panchaka → AVOID ${cat}`, mkInput(cat, mkBuckets(fullSnap(), {}, { panchakaActive: true })), (r) => {
    assert(r.avoid.some((w) => w.tokens.some((t) => t.ruleId === "PANCHAKA_V1" && t.tier === -2 && t.basis === "PRODUCT_NORMALIZED")), "panchaka AVOID");
  });
}
for (const cat of ["BUSINESS_WORK_START", "VEHICLE_PURCHASE"] as Cat[]) {
  runFixture(`Mrityu-Bhaga → AVOID ${cat}`, mkInput(cat, mkBuckets(fullSnap(), {}, { mrityuBhagaHit: true })), (r) => {
    assert(r.avoid.some((w) => w.tokens.some((t) => t.ruleId === "MRITYU_BHAGA_V1" && t.tier === -2)), "mrityu AVOID");
  });
}

// --- Segment overlays: caution kaals, Godhuli, Abhijit, Brahma ---
const rahuOverlap = () => { const s = fullSnap(); s.rahuKaal = tp("2026-05-10T06:00:00.000Z", "2026-05-10T06:10:00.000Z"); return s; };
const gulikaOverlap = () => { const s = fullSnap(); s.gulika = tp("2026-05-10T06:00:00.000Z", "2026-05-10T06:10:00.000Z"); return s; };
const yamaOverlap = () => { const s = fullSnap(); s.yamaganda = tp("2026-05-10T06:00:00.000Z", "2026-05-10T06:10:00.000Z"); return s; };
runFixture("Segment Rahu Kaal overlap → CAUTION", mkInput("GENERAL_DAILY_ACTIVITY", mkBuckets(rahuOverlap())), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "RAHU_KAAL_V1" && t.tier === -1), "rahu overlap");
});
runFixture("Segment Gulika Kaal overlap → CAUTION", mkInput("GENERAL_DAILY_ACTIVITY", mkBuckets(gulikaOverlap())), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "GULIKA_KAAL_V1" && t.tier === -1), "gulika overlap");
});
runFixture("Segment Yamaganda overlap → CAUTION", mkInput("GENERAL_DAILY_ACTIVITY", mkBuckets(yamaOverlap())), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "YAMAGANDA_V1" && t.tier === -1), "yamaganda overlap");
});
const GODHULI_START = Date.parse("2026-05-10T12:57:30.000Z");
const godhuliSnap = () => {
  const s = makeSnapshot();
  s.sunset = { utc: "2026-05-10T13:00:00.000Z", local: "18:30" };
  s.rahuKaal = tp("2026-05-10T02:00:00.000Z", "2026-05-10T03:00:00.000Z");
  s.gulika = tp("2026-05-10T03:00:00.000Z", "2026-05-10T03:30:00.000Z");
  s.yamaganda = tp("2026-05-10T04:00:00.000Z", "2026-05-10T04:30:00.000Z");
  return s;
};
for (const cat of ["BUSINESS_WORK_START", "TRAVEL_START"] as Cat[]) {
  runFixture(`Segment Godhuli twilight → CAUTION ${cat}`, mkInput(cat, mkBuckets(godhuliSnap(), {}, {}, 1, GODHULI_START)), (r) => {
    assert(bucketTokens(r).some((t) => t.ruleId === "GODHULI_V1" && t.tier === -1), "godhuli");
  });
}
const abhSnap = () => { const s = fullSnap(); s.abhijit = { ...tp("2026-05-10T06:00:00.000Z", "2026-05-10T06:10:00.000Z"), wednesdayExclusionConvention: false }; return s; };
for (const cat of ["GENERAL_DAILY_ACTIVITY", "SPIRITUAL_PRACTICE", "BUSINESS_WORK_START", "VEHICLE_PURCHASE", "EDUCATION_START"] as Cat[]) {
  runFixture(`Segment Abhijit overlay → SUPPORTIVE ${cat}`, mkInput(cat, mkBuckets(abhSnap())), (r) => {
    assert(bucketTokens(r).some((t) => t.ruleId === "ABHIJIT_MUHURTA_V1" && t.tier === 1), "abhijit");
  });
}
runFixture("Segment Abhijit NOT applied to travel (V1)", mkInput("TRAVEL_START", mkBuckets(abhSnap())), (r) => {
  assert(!bucketTokens(r).some((t) => t.ruleId === "ABHIJIT_MUHURTA_V1"), "no abhijit for travel");
});
const BRAHMA_START = Date.parse("2026-05-10T00:20:00.000Z");
const brahmaSnap = () => { const s = fullSnap(); s.brahmaMuhurta = { ...tp("2026-05-10T00:00:00.000Z", "2026-05-10T00:48:00.000Z"), convention: "FIXED_48MIN_MUHURTA" }; return s; };
runFixture("Segment Brahma Muhurta → spiritual SUPPORTIVE", mkInput("SPIRITUAL_PRACTICE", mkBuckets(brahmaSnap(), {}, {}, 1, BRAHMA_START)), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "BRAHMA_MUHURTA_V1" && t.tier === 1), "brahma");
});
runFixture("Segment Brahma spiritual-only (absent for general)", mkInput("GENERAL_DAILY_ACTIVITY", mkBuckets(brahmaSnap(), {}, {}, 1, BRAHMA_START)), (r) => {
  assert(!bucketTokens(r).some((t) => t.ruleId === "BRAHMA_MUHURTA_V1"), "no brahma for general");
});

// --- Lagna factor: quality match, lord placement, 8th malefic, 7th travel ---
const LAGNA_Q: Array<[Cat, number]> = [["BUSINESS_WORK_START", 2], ["TRAVEL_START", 0], ["VEHICLE_PURCHASE", 1], ["EDUCATION_START", 2]];
for (const [cat, sign] of LAGNA_Q) {
  runFixture(`Lagna quality match ${cat}`, mkInput(cat, mkBuckets(fullSnap(), { lagnaSignIndex: sign })), (r) => {
    assert(bucketTokens(r).some((t) => t.ruleId === "LAGNA_QUALITY_V1" && t.tier === 1), "lagna quality");
  });
}
for (const [house, tier, lbl] of [[1, 1, "kendra"], [8, -1, "dusthana"], [3, 0, "neutral"]] as const) {
  runFixture(`Lagna lord ${lbl} house=${house}`, mkInput("GENERAL_DAILY_ACTIVITY", mkBuckets(fullSnap(), { lagnaLordHouse: house })), (r) => {
    assert(bucketTokens(r).some((t) => t.ruleId === "LAGNA_LORD_PLACEMENT_V1" && t.tier === tier), "lagna lord");
  });
}
for (const cat of ["BUSINESS_WORK_START", "VEHICLE_PURCHASE", "TRAVEL_START"] as Cat[]) {
  runFixture(`8th-house malefic → CAUTION ${cat}`, mkInput(cat, mkBuckets(fullSnap(), { maleficInEighth: true })), (r) => {
    assert(bucketTokens(r).some((t) => t.ruleId === "EIGHTH_HOUSE_MALEFIC_V1" && t.tier === -1), "8th malefic");
  });
}
runFixture("7th-house travel benefic → SUPPORTIVE", mkInput("TRAVEL_START", mkBuckets(fullSnap(), { seventhHouseOccupant: "benefic" })), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "SEVENTH_HOUSE_TRAVEL_V1" && t.tier === 1), "7th benefic");
});
runFixture("7th-house travel malefic → CAUTION", mkInput("TRAVEL_START", mkBuckets(fullSnap(), { seventhHouseOccupant: "malefic" })), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "SEVENTH_HOUSE_TRAVEL_V1" && t.tier === -1), "7th malefic");
});

// --- Card 5 Dasha-lord karaka overlay per category ---
const DASHA_KARAKA: Array<[Cat, Karaka]> = [
  ["GENERAL_DAILY_ACTIVITY", "MOON"], ["SPIRITUAL_PRACTICE", "JUPITER"], ["BUSINESS_WORK_START", "MERCURY"],
  ["TRAVEL_START", "MERCURY"], ["VEHICLE_PURCHASE", "VENUS"], ["EDUCATION_START", "JUPITER"],
];
for (const [cat, lord] of DASHA_KARAKA) {
  runFixture(`Dasha-lord karaka → SUPPORTIVE ${cat}`, mkInput(cat, mkBuckets(fullSnap(), { activeDashaLord: lord })), (r) => {
    assert(bucketTokens(r).some((t) => t.ruleId === "DASHA_LORD_KARAKA_V1" && t.tier === 1 && t.basis === "PRODUCT_NORMALIZED"), "dasha karaka");
  });
}
runFixture("Dasha-lord non-karaka → neutral", mkInput("GENERAL_DAILY_ACTIVITY", mkBuckets(fullSnap(), { activeDashaLord: "SATURN" })), (r) => {
  assert(bucketTokens(r).some((t) => t.ruleId === "DASHA_LORD_KARAKA_V1" && t.tier === 0), "dasha neutral");
});

// --- Contiguous-window merging per category ---
for (const cat of CATS) {
  runFixture(`Contiguous merge (3 buckets) ${cat}`, mkInput(cat, mkBuckets(fullSnap(), {}, {}, 3)), (r) => {
    assert(r.supportive.length === 1, `merged windows ${r.supportive.length}`);
    assert(r.supportive[0]!.bucketCount === 3, `bucketCount ${r.supportive[0]!.bucketCount}`);
  });
}

// --- Timezone / date-boundary handling ---
runFixture("Date-boundary UTC-midnight merge",
  mkInput("GENERAL_DAILY_ACTIVITY", [makeBucketContext(0, Date.parse("2026-05-10T23:55:00.000Z"), fullSnap()), makeBucketContext(1, Date.parse("2026-05-11T00:00:00.000Z"), fullSnap())]), (r) => {
    assert(r.supportive.length === 1 && r.supportive[0]!.bucketCount === 2, "merge across date boundary");
    assert(r.supportive[0]!.startUtc.includes("2026-05-10T23:55"), "window start preserved");
  });
runFixture("Timezone local-midnight determinism",
  mkInput("SPIRITUAL_PRACTICE", mkBuckets(fullSnap(), {}, {}, 1, Date.parse("2026-05-10T18:30:00.000Z"))), (r) => {
    assert(r.scoredBuckets.length === 1, "single bucket scored");
  });
runFixture("Date-boundary exact-midnight determinism",
  mkInput("GENERAL_DAILY_ACTIVITY", mkBuckets(fullSnap(), {}, {}, 2, Date.parse("2026-05-11T00:00:00.000Z"))), (r) => {
    assert(r.scoredBuckets.length === 2, "two buckets scored");
  });

// --- Deterministic reruns on mixed multi-bucket days ---
runFixture("Deterministic mixed 4-bucket day (business)",
  mkInput("BUSINESS_WORK_START", [
    makeBucketContext(0, T0, fullSnap()),
    makeBucketContext(1, T0 + 5 * 60_000, fullSnap({ karanaIndex: 3, karanaName: "Vishti" })),
    makeBucketContext(2, T0 + 10 * 60_000, cautionSnap("BUSINESS_WORK_START"), cautionNatal("BUSINESS_WORK_START")),
    makeBucketContext(3, T0 + 15 * 60_000, fullSnap()),
  ]), (r) => {
    assert(r.scoredBuckets.length === 4, "4 buckets scored");
    assert(r.avoid.length >= 1 && r.supportive.length >= 1, "mixed supportive + avoid windows");
  });
runFixture("Deterministic 3-bucket day (spiritual)", mkInput("SPIRITUAL_PRACTICE", mkBuckets(fullSnap(), {}, {}, 3)), (r) => {
  assert(r.scoredBuckets.length === 3, "3 buckets scored");
});

// --- Fail-closed, unavailable, high-latitude, provenance, forbidden-wording ---
runFixture("Unsupported category → fail-closed", mkInput("MARRIAGE", []), (r) => {
  assert(r.status === "UNSUPPORTED_CATEGORY" && r.category === null, `status ${r.status}`);
});
runFixture("Empty buckets → UNAVAILABLE_INVALID_DATE", mkInput("GENERAL_DAILY_ACTIVITY", []), (r) => {
  assert(r.status === "UNAVAILABLE_INVALID_DATE", `status ${r.status}`);
});
runFixture("High-latitude segments unavailable → PARTIAL (general)", mkInput("GENERAL_DAILY_ACTIVITY", mkBuckets(makeSnapshot())), (r) => {
  assert(r.status === "PARTIAL", `status ${r.status}`);
  assert(r.unavailableReasons.length > 0, "unavailable reasons surfaced");
});
runFixture("High-latitude segments unavailable → PARTIAL (spiritual)", mkInput("SPIRITUAL_PRACTICE", mkBuckets(makeSnapshot())), (r) => {
  assert(r.status === "PARTIAL", `status ${r.status}`);
});
runFixture("Provenance + rule-ID integrity", mkInput("GENERAL_DAILY_ACTIVITY", mkBuckets(fullSnap(), {}, {}, 2)), (r) => {
  assert(r.provenance.contractVersion === "1.0.0", "provenance contract version");
  assert(r.rankingStages.length === 6, "six-stage pipeline");
});
runFixture("Forbidden-wording corpus scan (vehicle)", mkInput("VEHICLE_PURCHASE", mkBuckets(fullSnap(), {}, {}, 2)), (r) => {
  assert(r.category === "VEHICLE_PURCHASE", "category preserved");
});

function main() {
  console.log("Premium Muhurat Core registry + factor + orchestrator QA (pure, exhaustive):");
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
  console.log(`\nmuhurat premium registry QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  console.log(`  Card 13.2D fixture corpus: ${FIXTURE_COUNT} deterministic fixtures across all 6 categories`);
  console.log(`  (${NON_FIXTURE_GROUPS} registry/factor/orchestrator invariants + ${FIXTURE_COUNT} fixtures).`);
  if (failed > 0) process.exit(1);
}

main();
