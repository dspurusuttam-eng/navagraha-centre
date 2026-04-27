import "server-only";

import { normalizeBirthContextInput } from "@/lib/astrology/birth-input-normalizer";
import { resolveAstronomyReadyBirthContext } from "@/lib/astrology/birth-context-engine";
import { buildSiderealBirthChart } from "@/lib/astrology/chart-builder";
import {
  getFirstAccuracyErrorMessage,
  validateCompatibilityRequestInput,
  validateNumerologyRequestInput,
  validatePanchangRequestInput,
} from "@/lib/astrology/accuracy";
import { calculateNumerologyContext } from "@/modules/numerology";
import { calculateDailyPanchangContext } from "@/modules/panchang";
import type {
  AstrologyCalculatorExecutionResult,
  AstrologyCalculatorFailure,
  AstrologyCalculatorKey,
  AstrologyCalculatorResult,
} from "@/modules/calculators/types";

type SharedDateTimePlaceInput = {
  date: string;
  time: string;
  place: string;
};

type BirthNumberInput = {
  dateOfBirth: string;
};

type CompatibilityQuickInput = {
  firstDateOfBirth: string;
  secondDateOfBirth: string;
};

type DateCheckInput = {
  date: string;
  place: string;
};

type CalculatorExecutionRequest =
  | {
      calculator: "nakshatra";
      input: SharedDateTimePlaceInput;
    }
  | {
      calculator: "moon-sign";
      input: SharedDateTimePlaceInput;
    }
  | {
      calculator: "lagna";
      input: SharedDateTimePlaceInput;
    }
  | {
      calculator: "birth-number";
      input: BirthNumberInput;
    }
  | {
      calculator: "compatibility-quick";
      input: CompatibilityQuickInput;
    }
  | {
      calculator: "date-check";
      input: DateCheckInput;
    };

function fail(
  code: AstrologyCalculatorFailure["error"]["code"],
  message: string
): AstrologyCalculatorFailure {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

function clampScore(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeInputText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function resolveBirthContext(input: SharedDateTimePlaceInput) {
  const date = normalizeInputText(input.date);
  const time = normalizeInputText(input.time);
  const place = normalizeInputText(input.place);

  if (!date || !time || !place) {
    return fail(
      "MISSING_REQUIRED_FIELDS",
      "Date, time, and place are required for this calculator."
    );
  }

  if (date.length > 32 || time.length > 32 || place.length > 160) {
    return fail(
      "INVALID_FIELD_LENGTH",
      "Date, time, or place exceeds allowed length."
    );
  }

  const normalized = normalizeBirthContextInput({
    dateLocalInput: date,
    timeLocalInput: time,
    placeTextInput: place,
  });

  if (!normalized.success) {
    return fail(
      "NORMALIZATION_FAILED",
      normalized.issues[0]?.message ??
        "Birth input normalization failed for this calculator."
    );
  }

  return {
    success: true as const,
    data: {
      date,
      time,
      place,
      normalized: normalized.data,
    },
  };
}

async function resolveBirthContextAsync(input: SharedDateTimePlaceInput) {
  const prepared = resolveBirthContext(input);

  if (!prepared.success) {
    return prepared;
  }

  const resolved = await resolveAstronomyReadyBirthContext(
    prepared.data.normalized
  );

  if (!resolved.success) {
    return fail(
      "PLACE_RESOLUTION_FAILED",
      resolved.issue.message ||
        "Birthplace resolution failed for this calculator."
    );
  }

  return {
    success: true as const,
    data: {
      ...prepared.data,
      resolved: resolved.data,
    },
  };
}

function buildChartResult(input: {
  calculator: AstrologyCalculatorKey;
  date: string;
  time: string;
  place: string;
  mainTitle: string;
  mainValue: string;
  accent?: string;
  supportingDetails: AstrologyCalculatorResult["supportingDetails"];
  summary: AstrologyCalculatorResult["summary"];
}): AstrologyCalculatorResult {
  return {
    calculator: input.calculator,
    inputSummary: [
      { label: "Date", value: input.date },
      { label: "Time", value: input.time },
      { label: "Place", value: input.place },
    ],
    mainResult: {
      title: input.mainTitle,
      value: input.mainValue,
      accent: input.accent,
    },
    supportingDetails: input.supportingDetails,
    summary: input.summary,
  };
}

async function runNakshatraCalculator(
  input: SharedDateTimePlaceInput
): Promise<AstrologyCalculatorExecutionResult> {
  const context = await resolveBirthContextAsync(input);

  if (!context.success) {
    return context;
  }

  const chart = buildSiderealBirthChart(context.data.resolved);

  if (!chart.success) {
    return fail("CALCULATION_FAILED", chart.issue.message);
  }

  const moon = chart.data.planets.find((planet) => planet.name === "Moon");

  if (!moon) {
    return fail(
      "CALCULATION_FAILED",
      "Moon position is unavailable for nakshatra calculation."
    );
  }

  return {
    success: true,
    data: {
      generatedAtUtc: new Date().toISOString(),
      result: buildChartResult({
        calculator: "nakshatra",
        date: context.data.date,
        time: context.data.time,
        place: chart.data.birth_context.place,
        mainTitle: "Moon Nakshatra",
        mainValue: `${moon.nakshatra} (Pada ${moon.pada})`,
        accent: `Moon in ${moon.sign}`,
        supportingDetails: [
          { label: "Moon Sign", value: moon.sign },
          { label: "Moon Degree", value: `${moon.degree_in_sign.toFixed(2)} deg` },
          { label: "Birth UTC", value: chart.data.birth_context.birth_utc },
        ],
        summary: {
          headline: "Nakshatra and pada derived from sidereal Moon longitude.",
          points: [
            "Result is deterministic and location-aware.",
            "Moon placement can be reused for deeper chart interpretation.",
          ],
          note: "Use this as structural guidance, not deterministic certainty.",
        },
      }),
    },
  };
}

async function runMoonSignCalculator(
  input: SharedDateTimePlaceInput
): Promise<AstrologyCalculatorExecutionResult> {
  const context = await resolveBirthContextAsync(input);

  if (!context.success) {
    return context;
  }

  const chart = buildSiderealBirthChart(context.data.resolved);

  if (!chart.success) {
    return fail("CALCULATION_FAILED", chart.issue.message);
  }

  const moon = chart.data.planets.find((planet) => planet.name === "Moon");

  if (!moon) {
    return fail(
      "CALCULATION_FAILED",
      "Moon position is unavailable for moon sign calculation."
    );
  }

  return {
    success: true,
    data: {
      generatedAtUtc: new Date().toISOString(),
      result: buildChartResult({
        calculator: "moon-sign",
        date: context.data.date,
        time: context.data.time,
        place: chart.data.birth_context.place,
        mainTitle: "Moon Sign (Rashi)",
        mainValue: moon.sign,
        accent: `${moon.nakshatra} - Pada ${moon.pada}`,
        supportingDetails: [
          { label: "Moon Nakshatra", value: moon.nakshatra },
          { label: "Moon Pada", value: String(moon.pada) },
          { label: "Moon Degree", value: `${moon.degree_in_sign.toFixed(2)} deg` },
        ],
        summary: {
          headline: "Moon sign calculated from sidereal Moon placement.",
          points: [
            "Rashi is sensitive to exact date, time, and place.",
            "Use with full chart context for deeper decisions.",
          ],
          note: "Interpretation should be combined with practical judgment.",
        },
      }),
    },
  };
}

async function runLagnaCalculator(
  input: SharedDateTimePlaceInput
): Promise<AstrologyCalculatorExecutionResult> {
  const context = await resolveBirthContextAsync(input);

  if (!context.success) {
    return context;
  }

  const chart = buildSiderealBirthChart(context.data.resolved);

  if (!chart.success) {
    return fail("CALCULATION_FAILED", chart.issue.message);
  }

  return {
    success: true,
    data: {
      generatedAtUtc: new Date().toISOString(),
      result: buildChartResult({
        calculator: "lagna",
        date: context.data.date,
        time: context.data.time,
        place: chart.data.birth_context.place,
        mainTitle: "Ascendant / Lagna",
        mainValue: chart.data.lagna.sign,
        accent: `${chart.data.lagna.degree_in_sign.toFixed(2)} deg`,
        supportingDetails: [
          {
            label: "Lagna Degree",
            value: `${chart.data.lagna.degree_in_sign.toFixed(2)} deg`,
          },
          { label: "Ayanamsha", value: chart.data.settings.ayanamsha },
          { label: "House System", value: "Whole Sign" },
        ],
        summary: {
          headline: "Lagna sign and degree from sidereal chart foundation.",
          points: [
            "Lagna is location and time sensitive.",
            "Useful starting point for house-based interpretation.",
          ],
          note: "For deeper guidance, continue with full chart and AI layers.",
        },
      }),
    },
  };
}

function runBirthNumberCalculator(
  input: BirthNumberInput
): AstrologyCalculatorExecutionResult {
  const inputValidation = validateNumerologyRequestInput({
    dateOfBirth: normalizeInputText(input.dateOfBirth),
  });

  if (!inputValidation.ok) {
    return fail(
      "INVALID_INPUT",
      getFirstAccuracyErrorMessage(
        inputValidation.issues,
        "Date of birth is required for the birth number calculator."
      )
    );
  }

  const numerology = calculateNumerologyContext({
    dateOfBirth: inputValidation.data.dateOfBirth,
    fullName: null,
  });

  if (!numerology.success) {
    return fail("INVALID_INPUT", numerology.error.message);
  }

  return {
    success: true,
    data: {
      generatedAtUtc: new Date().toISOString(),
      result: {
        calculator: "birth-number",
        inputSummary: [
          { label: "Date of Birth", value: inputValidation.data.dateOfBirth },
        ],
        mainResult: {
          title: "Birth Number / Destiny Number",
          value: `${numerology.data.birthNumber.number} / ${numerology.data.destinyNumber.number}`,
          accent: `${numerology.data.birthNumber.label} + ${numerology.data.destinyNumber.label}`,
        },
        supportingDetails: [
          {
            label: "Birth Number Label",
            value: numerology.data.birthNumber.label,
          },
          {
            label: "Destiny Number Label",
            value: numerology.data.destinyNumber.label,
          },
          {
            label: "Core Traits",
            value: numerology.data.interpretation.coreIdentity.slice(0, 3).join(", "),
          },
        ],
        summary: {
          headline: "Quick numerology snapshot built from DOB.",
          points: [
            "Birth number reflects core style.",
            "Destiny number reflects broader life-path tendency.",
          ],
          note: "For richer numerology interpretation, open the full Numerology tool.",
        },
      },
    },
  };
}

function runCompatibilityQuickCalculator(
  input: CompatibilityQuickInput
): AstrologyCalculatorExecutionResult {
  const validation = validateCompatibilityRequestInput({
    firstDateOfBirth: normalizeInputText(input.firstDateOfBirth),
    secondDateOfBirth: normalizeInputText(input.secondDateOfBirth),
  });

  if (!validation.ok) {
    return fail(
      "INVALID_INPUT",
      getFirstAccuracyErrorMessage(
        validation.issues,
        "Both dates of birth are required for compatibility quick score."
      )
    );
  }

  const first = calculateNumerologyContext({
    dateOfBirth: validation.data.firstDateOfBirth,
    fullName: null,
  });
  const second = calculateNumerologyContext({
    dateOfBirth: validation.data.secondDateOfBirth,
    fullName: null,
  });

  if (!first.success) {
    return fail("INVALID_INPUT", `First profile: ${first.error.message}`);
  }

  if (!second.success) {
    return fail("INVALID_INPUT", `Second profile: ${second.error.message}`);
  }

  const birthGap = Math.abs(first.data.birthNumber.number - second.data.birthNumber.number);
  const destinyGap = Math.abs(
    first.data.destinyNumber.number - second.data.destinyNumber.number
  );
  const gapPenalty = birthGap * 6 + destinyGap * 4;
  const alignmentBonus =
    (first.data.birthNumber.number === second.data.birthNumber.number ? 10 : 0) +
    (first.data.destinyNumber.number === second.data.destinyNumber.number ? 10 : 0) +
    (first.data.birthNumber.isMasterNumber || second.data.birthNumber.isMasterNumber
      ? 5
      : 0);
  const rawScore = 50 + alignmentBonus - gapPenalty;
  const compatibilityScore = clampScore(rawScore, 20, 95);
  const compatibilitySignal =
    compatibilityScore >= 78
      ? "Strongly Supportive"
      : compatibilityScore >= 58
        ? "Balanced Potential"
        : "Growth-Oriented";

  return {
    success: true,
    data: {
      generatedAtUtc: new Date().toISOString(),
      result: {
        calculator: "compatibility-quick",
        inputSummary: [
          { label: "Profile A DOB", value: validation.data.firstDateOfBirth },
          { label: "Profile B DOB", value: validation.data.secondDateOfBirth },
        ],
        mainResult: {
          title: "Quick Compatibility Score",
          value: `${compatibilityScore} / 100`,
          accent: compatibilitySignal,
        },
        supportingDetails: [
          {
            label: "Profile A Numbers",
            value: `${first.data.birthNumber.number} / ${first.data.destinyNumber.number}`,
          },
          {
            label: "Profile B Numbers",
            value: `${second.data.birthNumber.number} / ${second.data.destinyNumber.number}`,
          },
          {
            label: "Score Basis",
            value: "Birth and destiny number alignment with conservative weighting.",
          },
        ],
        summary: {
          headline: "A quick compatibility signal, not a full relationship report.",
          points: [
            "Higher alignment indicates smoother baseline rhythm.",
            "Growth-oriented scores can still improve with communication and context.",
          ],
          note: "Use full compatibility and consultation pathways for deeper guidance.",
        },
      },
    },
  };
}

async function runDateCheckCalculator(
  input: DateCheckInput
): Promise<AstrologyCalculatorExecutionResult> {
  const validation = validatePanchangRequestInput({
    date: normalizeInputText(input.date),
    place: normalizeInputText(input.place),
  });

  if (!validation.ok) {
    return fail(
      "INVALID_INPUT",
      getFirstAccuracyErrorMessage(
        validation.issues,
        "Date and place are required for date suitability check."
      )
    );
  }

  const context = await resolveBirthContextAsync({
    date: validation.data.date,
    time: "12:00",
    place: validation.data.place,
  });

  if (!context.success) {
    return context;
  }

  const panchang = calculateDailyPanchangContext({
    dateLocal: context.data.normalized.date_local_normalized,
    location: {
      displayName: context.data.resolved.normalized_place.display_name,
      latitude: context.data.resolved.normalized_place.latitude,
      longitude: context.data.resolved.normalized_place.longitude,
      timezoneIana: context.data.resolved.timezone.iana,
      countryCode: context.data.resolved.normalized_place.country_code,
      countryName: context.data.resolved.normalized_place.country_name,
      region: context.data.resolved.normalized_place.region,
      city: context.data.resolved.normalized_place.city,
    },
  });

  if (!panchang.success) {
    return fail("CALCULATION_FAILED", panchang.error.message);
  }

  const suitabilitySignal =
    panchang.data.guidance.day_feel === "Supportive"
      ? "Supportive Day"
      : panchang.data.guidance.day_feel === "Balanced"
        ? "Balanced Day"
        : "Reflective Day";

  return {
    success: true,
    data: {
      generatedAtUtc: new Date().toISOString(),
      result: {
        calculator: "date-check",
        inputSummary: [
          { label: "Date", value: panchang.data.as_of_date },
          { label: "Place", value: panchang.data.location.display_name },
        ],
        mainResult: {
          title: "Daily Suitability Signal",
          value: suitabilitySignal,
          accent: panchang.data.guidance.daily_quality,
        },
        supportingDetails: [
          { label: "Tithi", value: panchang.data.tithi.name },
          { label: "Nakshatra", value: panchang.data.nakshatra.name },
          { label: "Yoga", value: panchang.data.yoga.name },
          {
            label: "Suggested Focus",
            value:
              panchang.data.guidance.suitable_focus[0] ??
              "Proceed with practical pacing.",
          },
          {
            label: "Caution",
            value:
              panchang.data.guidance.caution_areas[0] ??
              "Use measured judgment for important choices.",
          },
        ],
        summary: {
          headline: "Date-check uses Panchang context for a practical timing view.",
          points: [
            "The output is conservative and structure-first.",
            "Combine with Kundli and consultation for deeper decision context.",
          ],
          note: "Astrology provides guidance support, not guaranteed outcomes.",
        },
      },
    },
  };
}

export async function runAstrologyCalculator(
  request: CalculatorExecutionRequest
): Promise<AstrologyCalculatorExecutionResult> {
  switch (request.calculator) {
    case "nakshatra":
      return runNakshatraCalculator(request.input);
    case "moon-sign":
      return runMoonSignCalculator(request.input);
    case "lagna":
      return runLagnaCalculator(request.input);
    case "birth-number":
      return runBirthNumberCalculator(request.input);
    case "compatibility-quick":
      return runCompatibilityQuickCalculator(request.input);
    case "date-check":
      return runDateCheckCalculator(request.input);
    default:
      return fail("INVALID_CALCULATOR", "Unsupported calculator type.");
  }
}
