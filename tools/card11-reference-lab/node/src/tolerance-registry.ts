// Card 11.R1 — quantity-specific tolerance registry (pure). Isolated validation lab only.
//
// Each tolerance is justified by provider-model differences, transformation
// precision, or boundary risk. NO single universal tolerance is used.
// Tolerances are for CURRENT-ENGINE (swisseph SWIEPH) vs independent references.

export type Tolerance = {
  quantity: string;
  value: number;
  unit: string;
  justification: string;
  source: string;
};

export const TOLERANCES: Record<string, Tolerance> = {
  planetLongitude: {
    quantity: "planetLongitude",
    value: 60,
    unit: "arcsec",
    justification:
      "swisseph SWIEPH (sub-arcsec vs DE) vs DE440s(Skyfield) should agree well under 1'; Jupiter/Saturn use DE440s barycenter (few-arcsec offset from planet center).",
    source: "Swiss Ephemeris accuracy notes; JPL DE440 documentation",
  },
  moonLongitude: {
    quantity: "moonLongitude",
    value: 30,
    unit: "arcsec",
    justification:
      "Lunar theory agreement swisseph vs DE440s is well under 30\" for modern dates.",
    source: "Swiss Ephemeris / DE440 lunar accuracy",
  },
  astronomyEngineLongitude: {
    quantity: "astronomyEngineLongitude",
    value: 90,
    unit: "arcsec",
    justification:
      "Astronomy Engine documents +/-1 arcminute design accuracy; comparator tolerance = 1.5' to absorb its model truncation.",
    source: "cosinekitty/astronomy documentation ('accurate to within +/-1 arcminute')",
  },
  eclipticLatitude: {
    quantity: "eclipticLatitude",
    value: 60,
    unit: "arcsec",
    justification: "Latitude agreement swisseph vs DE440s; secondary quantity.",
    source: "DE440 documentation",
  },
  distanceAu: {
    quantity: "distanceAu",
    value: 1e-4,
    unit: "AU",
    justification: "Geocentric distance agreement; informational.",
    source: "DE440 documentation",
  },
  longitudeSpeed: {
    quantity: "longitudeSpeed",
    value: 0.02,
    unit: "deg/day",
    justification:
      "Speed via finite difference differs by numerical-step error; sign (retrograde) is the decisive discrete quantity.",
    source: "numerical differentiation error bound",
  },
  ayanamsaContinuity: {
    quantity: "ayanamsaContinuity",
    value: 1,
    unit: "arcsec",
    justification:
      "Gate G2 continuity target: candidate Lahiri must reproduce production SE Lahiri within 1\" over 1900-2100.",
    source: "Card 11.R0 continuity requirement",
  },
  trueNode: {
    quantity: "trueNode",
    value: 120,
    unit: "arcsec",
    justification:
      "Gate G1: independent osculating node (mean-obliquity prototype, nutation-in-obliquity neglected ~<10\") vs SE_TRUE_NODE; 2' allowance for the prototype's neglected nutation and osculating-method nuances.",
    source: "Card 11.R0 True Node design; osculating-node theory",
  },
  ketuOpposition: {
    quantity: "ketuOpposition",
    value: 1e-6,
    unit: "deg",
    justification: "Ketu = Rahu+180 is an exact identity; only floating-point noise permitted.",
    source: "definition",
  },
};

/** Guard-band half-widths: within these of a boundary => BOUNDARY_SENSITIVE. */
export const GUARD_BANDS = {
  // Set to the astronomy-engine comparator accuracy (1.5') so a coarse comparator
  // can never silently decide a discrete Vedic classification near a cusp.
  rashiDeg: 90 / 3600,
  nakshatraDeg: 90 / 3600,
  padaDeg: 90 / 3600,
  stationSpeedDegPerDay: 0.01, // near-zero longitudinal speed => station-sensitive
  wraparoundDeg: 0.01, // within 0.01° of 0/360
};

export function tolerancesComplete(required: string[]): { complete: boolean; missing: string[] } {
  const missing = required.filter((q) => !(q in TOLERANCES));
  return { complete: missing.length === 0, missing };
}
