// Card 13.2B1 — Muhurat factor engine barrel (internal, engine-only).
// Only Panchang eligibility + Tara Bala + Chandra Bala + Dosha are delivered here.
// Lagna/planetary/segment factors and the ranker/orchestrator arrive in Card 13.2B2+.

export {
  makeEvidenceId,
  type MuhuratFactorResult,
} from "@/modules/muhurta/premium/factors/factor-types";
export {
  buildPanchangFactor,
  type PanchangFactorInput,
} from "@/modules/muhurta/premium/factors/panchang-factor";
export {
  buildTaraBalaFactor,
  computeTaraIndex,
  type TaraBalaFactorInput,
} from "@/modules/muhurta/premium/factors/tara-bala-factor";
export {
  buildChandraBalaFactor,
  computeChandraBalaHouse,
  type ChandraBalaFactorInput,
} from "@/modules/muhurta/premium/factors/chandra-bala-factor";
export {
  buildDoshaFactor,
  type DoshaFactorInput,
  type DoshaExternalSignals,
} from "@/modules/muhurta/premium/factors/dosha-factor";
// Card 13.2B2 — Lagna / planetary / segment factors
export {
  buildLagnaFactor,
  type LagnaFactorInput,
} from "@/modules/muhurta/premium/factors/lagna-factor";
export {
  buildPlanetaryFactor,
  type PlanetaryFactorInput,
  type KarakaState,
} from "@/modules/muhurta/premium/factors/planetary-factor";
export {
  buildSegmentFactor,
  type SegmentFactorInput,
} from "@/modules/muhurta/premium/factors/segment-factor";
