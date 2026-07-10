// Card 9.2 — Premium Panchang / Hora / Choghadiya engine (internal, engine-only).
// No public route, no persistence, no interpretation content.

export {
  buildPremiumPanchangSnapshot,
  realRiseSetProvider,
  realSunMoonSampler,
  civilDateOf,
  type BuildPremiumPanchangInput,
} from "@/modules/panchang/premium/engine";
export {
  HORA_SEQUENCE,
  WEEKDAY_LORDS,
  VARA_NAMES,
  CHOGHADIYA_BY_PLANET,
  CHOGHADIYA_DAY_TABLE,
  CHOGHADIYA_NIGHT_TABLE,
  CHOGHADIYA_CLASSIFICATION,
  CHOGHADIYA_DISPLAY_NAMES,
  RAHU_KAAL_SEGMENTS_BY_WEEKDAY,
  GULIKA_KAAL_SEGMENTS_BY_WEEKDAY,
  YAMAGANDA_SEGMENTS_BY_WEEKDAY,
  PREMIUM_RULE_REGISTRY,
  getPremiumRule,
  type PremiumRule,
} from "@/modules/panchang/premium/constants";
export { buildHoraSchedule, horaLordAt } from "@/modules/panchang/premium/hora";
export {
  buildDayChoghadiya,
  buildNightChoghadiya,
} from "@/modules/panchang/premium/choghadiya";
export { buildDailyPeriods } from "@/modules/panchang/premium/daily-periods";
export {
  enumerateTransitions,
  solveElementStart,
  solveElementEnd,
  makeKeysResolver,
  FACTOR_KEYS,
  type FactorKey,
  type FactorTransition,
} from "@/modules/panchang/premium/transitions";
export { resolveVara } from "@/modules/panchang/premium/panchang-elements";
export {
  PREMIUM_PANCHANG_CONTRACT_VERSION,
  PREMIUM_PANCHANG_CONVENTIONS,
  type PremiumPanchangInput,
  type PremiumPanchangResult,
  type PremiumPanchangSnapshot,
  type PremiumTimedPeriod,
  type HoraInterval,
  type ChoghadiyaInterval,
  type PremiumElementState,
  type PremiumNakshatraState,
  type PremiumTransition,
  type PremiumVara,
  type SunMoonSampler,
  type RiseSetProvider,
  type RiseSetBundle,
  type HoraPlanet,
  type ChoghadiyaKey,
  type ChoghadiyaClassification,
} from "@/modules/panchang/premium/types";
