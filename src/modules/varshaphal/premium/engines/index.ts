// Card 14.2B1 — pure factor engines barrel (no native ephemeris; injectable).
// The swisseph-backed adapter lives in ../ephemeris-adapter.ts and is intentionally
// NOT re-exported here so this barrel (and the registry QA) stays pure/portable.
export {
  norm360,
  norm180,
  minimalSeparation,
  signIndexFromLongitude,
} from "@/modules/varshaphal/premium/engines/geometry";
export { buildToken, type EngineUnavailable } from "@/modules/varshaphal/premium/engines/token";
export {
  computeMuntha,
  type MunthaInput,
  type MunthaResult,
} from "@/modules/varshaphal/premium/engines/muntha";
export {
  evaluateTajikaAspect,
  type AspectBody,
  type TajikaAspectMotion,
  type TajikaAspectResult,
} from "@/modules/varshaphal/premium/engines/tajika-aspects";
export {
  findSolarReturn,
  type SolarReturnInput,
  type SolarReturnResult,
} from "@/modules/varshaphal/premium/engines/solar-return";
export {
  computeVarshaLagna,
  type VarshaLagnaInput,
  type VarshaLagnaResult,
} from "@/modules/varshaphal/premium/engines/varsha-lagna";

// Card 14.2B2 — strength, yogas, year-lord, dasha, combustion.
export {
  naturalFriendship,
  temporaryFriend,
  panchadhaRelationship,
  dignityInSign,
  type DignityInSign,
} from "@/modules/varshaphal/premium/engines/planetary-relationship";
export {
  computePanchavargeeyaBala,
  type PanchavargeeyaInput,
  type PanchavargeeyaResult,
} from "@/modules/varshaphal/premium/engines/panchavargeeya";
export {
  evaluateCombustion,
  type CombustionInput,
  type CombustionResult,
} from "@/modules/varshaphal/premium/engines/combustion";
export {
  evaluateTajikaYogas,
  type YogaPlanet,
  type TajikaYogaInput,
  type DetectedYoga,
  type TajikaYogaResult,
} from "@/modules/varshaphal/premium/engines/tajika-yogas";
export {
  selectVarshesha,
  type VarsheshaCandidateInput,
  type VarsheshaResult,
} from "@/modules/varshaphal/premium/engines/varshesha";
export {
  computeMuddaDasha,
  type MuddaDashaInput,
  type MuddaDashaResult,
  type MuddaMaha,
  type MuddaAntar,
} from "@/modules/varshaphal/premium/engines/mudda-dasha";
export {
  computeDinratri,
  type SunriseSunset,
  type DinratriInput,
  type DinratriResult,
} from "@/modules/varshaphal/premium/engines/dinratri";
