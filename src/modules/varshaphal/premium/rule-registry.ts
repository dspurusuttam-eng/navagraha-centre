// Card 14.2A — Premium Varshaphal / Tajika: immutable rule + source registry.
// Every factor the engine (Card 14.2B+) may emit is registered here with a stable
// ruleId, a factor section, a source classification, and a source ID. Governance
// (per Card 13 parity): CLASSICAL and REGISTERED_REFERENCE rules MUST carry a
// non-null sourceId; PRODUCT_NORMALIZED rules may have a null sourceId.
import type { VarshaphalBasis, VarshaphalFactorId } from "@/modules/varshaphal/premium/types";

export type VarshaphalRuleSection = VarshaphalFactorId;

export type VarshaphalRule = {
  ruleId: string;
  section: VarshaphalRuleSection;
  basis: VarshaphalBasis;
  /** Registered source (chapter / table / certified module path); null only for PRODUCT_NORMALIZED. */
  sourceId: string | null;
  description: string;
};

const NEELAKANTHI = "TAJIKA_NEELAKANTHI";
const TRIRASHI_SRC = "DOROTHEAN_TRIPLICITY_TAJIKA";
const EGYPTIAN = "PTOLEMY_EGYPTIAN_TERMS";
const CERT_CHART = "src/lib/astrology/constants.ts";
const CERT_COMBUST = "src/lib/astrology/formatter.ts#COMBUSTION_THRESHOLDS";
const CERT_VIMSHOTTARI = "src/lib/astrology/constants.ts#dashaSequence+dashaYearsByLord";

export const VARSHAPHAL_RULE_REGISTRY: readonly VarshaphalRule[] = [
  // --- Solar return / indexing ---
  { ruleId: "SOLAR_RETURN_V1", section: "SOLAR_RETURN", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Varsha Pravesha: Sun returns to natal sidereal longitude (Lahiri), same revolution." },
  { ruleId: "SOLAR_RETURN_TOLERANCE_V1", section: "SOLAR_RETURN", basis: "PRODUCT_NORMALIZED", sourceId: null,
    description: "Root-finder converges to <=0.001 arcsec and <=1s time delta; else RETURN_NONCONVERGENCE." },
  { ruleId: "YEAR_INDEXING_V1", section: "SOLAR_RETURN", basis: "PRODUCT_NORMALIZED", sourceId: null,
    description: "Solar-year index N = targetYear - birthYear; Nth return within +/-3 days of anniversary." },
  { ruleId: "LOCATION_BIRTHPLACE_V1", section: "SOLAR_RETURN", basis: "PRODUCT_NORMALIZED", sourceId: null,
    description: "Annual chart cast for the natal birthplace + historical timezone (default); residence deferred." },
  // --- Varsha Lagna ---
  { ruleId: "VARSHA_LAGNA_V1", section: "VARSHA_LAGNA", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Sidereal ascendant (Lahiri) at the return instant; whole-sign houses from Varsha Lagna." },
  // --- Muntha ---
  { ruleId: "MUNTHA_PROGRESSION_V1", section: "MUNTHA", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Muntha longitude = (natal Lagna longitude + N*30) mod 360; advances one sign per year." },
  { ruleId: "MUNTHA_LORD_V1", section: "MUNTHA", basis: "CLASSICAL", sourceId: CERT_CHART,
    description: "Muntha lord = sign lord of the Muntha sign (certified signRulerMap)." },
  { ruleId: "MUNTHA_HOUSE_TIER_V1", section: "MUNTHA", basis: "PRODUCT_NORMALIZED", sourceId: null,
    description: "Muntha house tier: supportive 1,2,3,10,11; caution 4,6,8,12; neutral 5,7,9." },
  // --- Tajika aspects ---
  { ruleId: "TAJIKA_ASPECT_ANGLES_V1", section: "TAJIKA_ASPECT", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Tajika aspect angles: 0, 60, 90, 120, 180 degrees (no semi-sextile/quincunx)." },
  { ruleId: "DEEPTAMSHA_ORB_V1", section: "TAJIKA_ASPECT", basis: "REGISTERED_REFERENCE", sourceId: NEELAKANTHI,
    description: "Deeptamsha orbs: Sun15 Moon12 Mars8 Mercury7 Jupiter9 Venus7 Saturn9." },
  { ruleId: "ASPECT_ORB_HALFSUM_V1", section: "TAJIKA_ASPECT", basis: "PRODUCT_NORMALIZED", sourceId: null,
    description: "Aspect active iff |separation - angle| <= (deeptamsha A + deeptamsha B)/2." },
  { ruleId: "ITHASALA_ISHRAFA_V1", section: "TAJIKA_ASPECT", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Applying (Ithasala) vs separating (Ishrafa) by faster planet closing/leaving exact; retrograde reverses." },
  // --- Dignity / combustion / retrograde ---
  { ruleId: "DIGNITY_V1", section: "DIGNITY", basis: "CLASSICAL", sourceId: CERT_CHART,
    description: "Annual dignity (own/exalt/debilitated/neutral) from certified sign tables." },
  { ruleId: "COMBUSTION_V1", section: "COMBUSTION", basis: "CLASSICAL", sourceId: CERT_COMBUST,
    description: "Combustion arcs reused from the certified engine (Me14 Ve10 Ma17 Ju11 Sa15); Sun/Moon/nodes excluded." },
  { ruleId: "RETROGRADE_V1", section: "RETROGRADE", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Retrograde flag from ephemeris speed sign; contextual evidence (Vakra-bala), not an automatic tier." },
  // --- Panchavargeeya Bala ---
  { ruleId: "PANCHAVARGEEYA_GRIHA_V1", section: "PANCHAVARGEEYA_BALA", basis: "REGISTERED_REFERENCE", sourceId: NEELAKANTHI,
    description: "Griha (Kshetra) Bala max 30 vishwa scaled by planet-to-sign-lord relationship." },
  { ruleId: "PANCHAVARGEEYA_UCCHA_V1", section: "PANCHAVARGEEYA_BALA", basis: "REGISTERED_REFERENCE", sourceId: "PARASHARA_UCCHA_BALA",
    description: "Uccha Bala = 20*(180 - arcFromDebilitation)/180; deep-exaltation longitude table." },
  { ruleId: "PANCHAVARGEEYA_HADDA_V1", section: "PANCHAVARGEEYA_BALA", basis: "REGISTERED_REFERENCE", sourceId: EGYPTIAN,
    description: "Hadda Bala max 15 vishwa scaled by planet-to-bound-lord relationship (Egyptian terms)." },
  { ruleId: "PANCHAVARGEEYA_DREKKANA_V1", section: "PANCHAVARGEEYA_BALA", basis: "PRODUCT_NORMALIZED", sourceId: null,
    description: "Drekkana Bala max 10 from planet dignity in its D3 sign (Card 4)." },
  { ruleId: "PANCHAVARGEEYA_NAVAMSHA_V1", section: "PANCHAVARGEEYA_BALA", basis: "PRODUCT_NORMALIZED", sourceId: null,
    description: "Navamsha Bala max 5 from planet dignity in its D9 sign (Card 4)." },
  { ruleId: "HADDA_BOUNDS_TABLE_V1", section: "PANCHAVARGEEYA_BALA", basis: "REGISTERED_REFERENCE", sourceId: EGYPTIAN,
    description: "Egyptian-terms bound table: 12 signs x 5 unequal bounds, contiguous 0..30." },
  { ruleId: "PANCHAVARGEEYA_BAND_V1", section: "PANCHAVARGEEYA_BALA", basis: "PRODUCT_NORMALIZED", sourceId: null,
    description: "Bala banding over 0..80: >=20 supportive, 10..<20 neutral, <10 caution." },
  // --- Tajika yogas (8) ---
  { ruleId: "YOGA_ITHASALA_V1", section: "TAJIKA_YOGA", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Ithasala: applying aspect within orb between significators (promise forming)." },
  { ruleId: "YOGA_ISHRAFA_V1", section: "TAJIKA_YOGA", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Ishrafa: separating aspect within orb (matter waning/past)." },
  { ruleId: "YOGA_NAKTA_V1", section: "TAJIKA_YOGA", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Nakta: a faster third planet in Ithasala with both un-aspecting significators (translation of light)." },
  { ruleId: "YOGA_YAMAYA_V1", section: "TAJIKA_YOGA", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Yamaya: two planets both applying to a slower third that collects (collection of light)." },
  { ruleId: "YOGA_KAMBOOLA_V1", section: "TAJIKA_YOGA", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Kamboola: Moon forms Ithasala reinforcing a significator's own Ithasala." },
  { ruleId: "YOGA_MANAU_V1", section: "TAJIKA_YOGA", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Manau: a malefic within orb obstructs an otherwise forming Ithasala." },
  { ruleId: "YOGA_IKKAVALA_V1", section: "TAJIKA_YOGA", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Ikkavala: significators in near-exact conjunction/aspect (strong union)." },
  { ruleId: "YOGA_INDUVARA_V1", section: "TAJIKA_YOGA", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Induvara: significators in mutual angular (kendra) aspect within orb." },
  // --- Varshesha ---
  { ruleId: "VARSHESHA_SELECTION_V1", section: "VARSHESHA", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Year-lord from five Panchadhikaris; eligible if Ithasala with Muntha/Lagna lord; highest Panchavargeeya Bala wins." },
  { ruleId: "VARSHESHA_TIEBREAK_V1", section: "VARSHESHA", basis: "PRODUCT_NORMALIZED", sourceId: null,
    description: "Bala tie-break order: Muntha > Varsha Lagna > Janma Lagna > Trirashi > Dinaratri lord." },
  { ruleId: "TRIRASHI_PATI_V1", section: "VARSHESHA", basis: "REGISTERED_REFERENCE", sourceId: TRIRASHI_SRC,
    description: "Triplicity day/night lords of the Varsha Lagna sign (Dorothean)." },
  { ruleId: "DINARATRI_LORD_V1", section: "VARSHESHA", basis: "CLASSICAL", sourceId: NEELAKANTHI,
    description: "Dinaratri candidate = Vara (weekday) lord of the return instant." },
  // --- Mudda Dasha ---
  { ruleId: "MUDDA_DASHA_V1", section: "MUDDA_DASHA", basis: "CLASSICAL", sourceId: CERT_VIMSHOTTARI,
    description: "Mudda Maha/Antar = Vimshottari sequence+proportions scaled to the solar year; start = Moon-nakshatra lord at return." },
  { ruleId: "MUDDA_YEAR_LENGTH_V1", section: "MUDDA_DASHA", basis: "PRODUCT_NORMALIZED", sourceId: null,
    description: "Year length = return-to-return interval; fixed 365.2425 only on explicit opt-in; else MUDDA_YEAR_LENGTH unavailable." },
  // --- Overlay ---
  { ruleId: "ASHTAKAVARGA_OVERLAY_V1", section: "ASHTAKAVARGA_OVERLAY", basis: "PRODUCT_NORMALIZED", sourceId: null,
    description: "Optional Card 7 BAV overlay on annual planets: 5..8 supportive, 3..4 neutral, 0..2 caution." },
] as const;

const RULE_BY_ID: ReadonlyMap<string, VarshaphalRule> = new Map(
  VARSHAPHAL_RULE_REGISTRY.map((r) => [r.ruleId, r]),
);

/** Resolve a rule by ID; throws on unknown (fail-closed registry). */
export function getVarshaphalRule(ruleId: string): VarshaphalRule {
  const rule = RULE_BY_ID.get(ruleId);
  if (!rule) throw new Error(`Unknown Varshaphal rule ID: ${ruleId}`);
  return rule;
}

/**
 * Deterministic 64-bit FNV-1a rulebook hash (16 lowercase hex) over the canonical
 * registry serialization. Stable across runs; changes iff a rule is added/edited.
 */
export function computeVarshaphalRulebookHash(): string {
  const serialized = VARSHAPHAL_RULE_REGISTRY
    .map((r) => `${r.ruleId}|${r.section}|${r.basis}|${r.sourceId ?? ""}|${r.description}`)
    .join("\n");
  const fnv32 = (input: string, offset: number): number => {
    let h = (0x811c9dc5 ^ offset) >>> 0;
    for (let i = 0; i < input.length; i += 1) {
      h ^= input.charCodeAt(i) & 0xff;
      // FNV-1a 32-bit prime = 0x01000193
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  };
  const a = fnv32(serialized, 0).toString(16).padStart(8, "0");
  const b = fnv32(serialized.split("").reverse().join(""), 0xdeadbeef).toString(16).padStart(8, "0");
  return (a + b).slice(0, 16);
}
