// Card 11.R1 — discrepancy classifier (pure). Never hides or averages contradictions.

export type Classification =
  | "MATCH_WITHIN_TOLERANCE"
  | "INPUT_MISMATCH"
  | "TIMEZONE_MISMATCH"
  | "TIME_SCALE_MISMATCH"
  | "REFERENCE_FRAME_MISMATCH"
  | "CORRECTION_FLAG_MISMATCH"
  | "PROVIDER_MODEL_DIFFERENCE"
  | "AYANAMSA_VARIANT_DIFFERENCE"
  | "ROUNDING_OR_DISPLAY_DIFFERENCE"
  | "BOUNDARY_SENSITIVE"
  | "POSSIBLE_IMPLEMENTATION_DEFECT"
  | "UNRESOLVED_BLOCKER"
  | "NOT_COMPARABLE";

export const ALL_CLASSIFICATIONS: Classification[] = [
  "MATCH_WITHIN_TOLERANCE",
  "INPUT_MISMATCH",
  "TIMEZONE_MISMATCH",
  "TIME_SCALE_MISMATCH",
  "REFERENCE_FRAME_MISMATCH",
  "CORRECTION_FLAG_MISMATCH",
  "PROVIDER_MODEL_DIFFERENCE",
  "AYANAMSA_VARIANT_DIFFERENCE",
  "ROUNDING_OR_DISPLAY_DIFFERENCE",
  "BOUNDARY_SENSITIVE",
  "POSSIBLE_IMPLEMENTATION_DEFECT",
  "UNRESOLVED_BLOCKER",
  "NOT_COMPARABLE",
];

export type ClassifyInput = {
  quantity: string;
  body?: string;
  diff: number; // in the tolerance's unit
  tolerance: number;
  isAyanamsa?: boolean;
  boundarySensitive?: boolean;
  notComparable?: boolean;
  // triangulation: does the current engine disagree with BOTH references while the
  // two independent references agree with each other?
  currentVsPrimaryExceeds?: boolean;
  currentVsSecondaryExceeds?: boolean;
  primaryVsSecondaryAgree?: boolean;
  // known model difference for outer-planet barycenter targets
  barycenterTarget?: boolean;
  secondaryComparator?: boolean; // this comparison is against astronomy-engine (coarse)
};

export function classify(i: ClassifyInput): { status: Classification; reason: string } {
  if (i.notComparable) return { status: "NOT_COMPARABLE", reason: "quantity not produced by one provider" };
  if (i.boundarySensitive)
    return { status: "BOUNDARY_SENSITIVE", reason: "within guard band of a Rashi/Nakshatra/Pada/station/wrap boundary; discrete class not decided by comparator" };
  if (i.diff <= i.tolerance)
    return { status: "MATCH_WITHIN_TOLERANCE", reason: `diff ${i.diff.toPrecision(3)} <= tol ${i.tolerance}` };

  if (i.isAyanamsa) return { status: "AYANAMSA_VARIANT_DIFFERENCE", reason: "ayanamsa candidate differs from production SE Lahiri beyond continuity target" };

  if (i.secondaryComparator)
    return { status: "PROVIDER_MODEL_DIFFERENCE", reason: "astronomy-engine coarse (~1' design accuracy) model difference" };
  if (i.barycenterTarget)
    return { status: "PROVIDER_MODEL_DIFFERENCE", reason: "reference uses planet barycenter vs swisseph planet center" };

  if (i.currentVsPrimaryExceeds && i.currentVsSecondaryExceeds && i.primaryVsSecondaryAgree)
    return {
      status: "POSSIBLE_IMPLEMENTATION_DEFECT",
      reason: "current engine disagrees with BOTH independent references while they agree with each other (report-only; no production change)",
    };

  return { status: "PROVIDER_MODEL_DIFFERENCE", reason: "beyond tolerance; frames/time normalized; residual attributed to provider ephemeris model" };
}
