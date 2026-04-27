import type { NatalChartResponse } from "@/modules/astrology/types";
import type { UnifiedSiderealChart } from "@/modules/astrology/chart-contract-types";

export type AstrologyDataIssue = {
  field: string;
  code: string;
  message: string;
  severity: "error" | "warning";
};

export type AstrologyDataValidationResult = {
  isComplete: boolean;
  issues: AstrologyDataIssue[];
  missingFields: string[];
};

type UnknownRecord = Record<string, unknown>;

function issue(
  field: string,
  code: string,
  message: string,
  severity: "error" | "warning" = "error"
): AstrologyDataIssue {
  return {
    field,
    code,
    message,
    severity,
  };
}

function resultFromIssues(issues: AstrologyDataIssue[]): AstrologyDataValidationResult {
  return {
    isComplete: !issues.some((item) => item.severity === "error"),
    issues,
    missingFields: issues
      .filter((item) => item.severity === "error")
      .map((item) => item.field),
  };
}

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

export function validateKundliChartCompleteness(
  chart: UnifiedSiderealChart | null | undefined
): AstrologyDataValidationResult {
  const issues: AstrologyDataIssue[] = [];

  if (!chart) {
    return resultFromIssues([
      issue("chart", "MISSING_CHART", "Chart context is unavailable."),
    ]);
  }

  if (!chart.birth_context?.birth_utc) {
    issues.push(
      issue(
        "chart.birth_context.birth_utc",
        "MISSING_BIRTH_UTC",
        "Birth UTC timestamp is missing."
      )
    );
  }

  if (!chart.birth_context?.timezone) {
    issues.push(
      issue(
        "chart.birth_context.timezone",
        "MISSING_TIMEZONE",
        "Timezone source is missing from chart context."
      )
    );
  }

  if (!chart.lagna?.sign) {
    issues.push(issue("chart.lagna.sign", "MISSING_LAGNA", "Lagna sign is missing."));
  }

  if (!Array.isArray(chart.houses) || chart.houses.length !== 12) {
    issues.push(
      issue(
        "chart.houses",
        "INVALID_HOUSE_MAP",
        "Whole-sign house map is incomplete."
      )
    );
  }

  if (!Array.isArray(chart.planets) || chart.planets.length < 9) {
    issues.push(
      issue(
        "chart.planets",
        "MISSING_PLANETS",
        "Planetary positions are incomplete for safe prediction."
      )
    );
  }

  const moon = chart.planets.find((planet) => planet.name === "Moon");

  if (!moon) {
    issues.push(
      issue(
        "chart.planets.Moon",
        "MISSING_MOON",
        "Moon placement is required for predictive timing."
      )
    );
  } else if (!moon.nakshatra) {
    issues.push(
      issue(
        "chart.planets.Moon.nakshatra",
        "MISSING_MOON_NAKSHATRA",
        "Moon nakshatra is missing."
      )
    );
  }

  if (!chart.verification?.is_verified_for_chart_logic) {
    issues.push(
      issue(
        "chart.verification",
        "UNVERIFIED_CHART",
        "Chart verification status is below safe prediction threshold.",
        "warning"
      )
    );
  }

  return resultFromIssues(issues);
}

export function validateNatalReportCompleteness(
  chart: NatalChartResponse | null | undefined
): AstrologyDataValidationResult {
  const issues: AstrologyDataIssue[] = [];

  if (!chart) {
    return resultFromIssues([
      issue("report.chart", "MISSING_CHART", "Natal chart payload is unavailable."),
    ]);
  }

  if (!chart.ascendantSign) {
    issues.push(
      issue(
        "report.chart.ascendantSign",
        "MISSING_ASCENDANT",
        "Ascendant sign is missing in natal report context."
      )
    );
  }

  if (!Array.isArray(chart.planets) || chart.planets.length < 9) {
    issues.push(
      issue(
        "report.chart.planets",
        "MISSING_PLANETS",
        "Natal planetary placements are incomplete."
      )
    );
  }

  if (!Array.isArray(chart.houses) || chart.houses.length < 12) {
    issues.push(
      issue(
        "report.chart.houses",
        "MISSING_HOUSES",
        "Natal house placements are incomplete."
      )
    );
  }

  const moon = chart.planets.find((planet) => planet.body === "MOON");

  if (!moon) {
    issues.push(
      issue(
        "report.chart.planets.MOON",
        "MISSING_MOON",
        "Moon sign data is required for grounded interpretation."
      )
    );
  }

  return resultFromIssues(issues);
}

function checkRequiredString(
  source: UnknownRecord | null,
  key: string,
  fieldLabel: string,
  issues: AstrologyDataIssue[]
) {
  const value = source?.[key];

  if (typeof value !== "string" || !value.trim()) {
    issues.push(
      issue(fieldLabel, "MISSING_FIELD", `${fieldLabel} is missing in panchang output.`)
    );
  }
}

export function validatePanchangOutputCompleteness(
  payload: unknown
): AstrologyDataValidationResult {
  const issues: AstrologyDataIssue[] = [];
  const data = asRecord(payload);

  if (!data) {
    return resultFromIssues([
      issue("panchang", "INVALID_PAYLOAD", "Panchang payload is invalid."),
    ]);
  }

  checkRequiredString(data, "as_of_date", "panchang.as_of_date", issues);
  checkRequiredString(data, "vara", "panchang.vara", issues);
  checkRequiredString(data, "paksha", "panchang.paksha", issues);
  checkRequiredString(data, "moon_sign", "panchang.moon_sign", issues);

  const tithi = asRecord(data.tithi);
  const nakshatra = asRecord(data.nakshatra);
  const yoga = asRecord(data.yoga);
  const karana = asRecord(data.karana);
  const sunrise = asRecord(data.sunrise);
  const sunset = asRecord(data.sunset);

  checkRequiredString(tithi, "name", "panchang.tithi.name", issues);
  checkRequiredString(nakshatra, "name", "panchang.nakshatra.name", issues);
  checkRequiredString(yoga, "name", "panchang.yoga.name", issues);
  checkRequiredString(karana, "name", "panchang.karana.name", issues);
  checkRequiredString(sunrise, "utc", "panchang.sunrise.utc", issues);
  checkRequiredString(sunset, "utc", "panchang.sunset.utc", issues);

  const transitions = asRecord(data.transitions);

  if (!transitions) {
    issues.push(
      issue(
        "panchang.transitions",
        "MISSING_TRANSITIONS",
        "Panchang transitions block is missing."
      )
    );
  } else {
    checkRequiredString(
      asRecord(transitions.next_tithi_change),
      "utc",
      "panchang.transitions.next_tithi_change.utc",
      issues
    );
    checkRequiredString(
      asRecord(transitions.next_nakshatra_change),
      "utc",
      "panchang.transitions.next_nakshatra_change.utc",
      issues
    );
    checkRequiredString(
      asRecord(transitions.next_yoga_change),
      "utc",
      "panchang.transitions.next_yoga_change.utc",
      issues
    );
    checkRequiredString(
      asRecord(transitions.next_karana_change),
      "utc",
      "panchang.transitions.next_karana_change.utc",
      issues
    );
  }

  return resultFromIssues(issues);
}

export function validateMuhurtaLiteOutputCompleteness(
  payload: unknown
): AstrologyDataValidationResult {
  const issues: AstrologyDataIssue[] = [];
  const data = asRecord(payload);

  if (!data) {
    return resultFromIssues([
      issue("muhurtaLite", "INVALID_PAYLOAD", "Muhurta-lite payload is invalid."),
    ]);
  }

  checkRequiredString(data, "as_of_date", "muhurtaLite.as_of_date", issues);
  checkRequiredString(
    asRecord(data.sunrise),
    "utc",
    "muhurtaLite.sunrise.utc",
    issues
  );
  checkRequiredString(
    asRecord(data.sunset),
    "utc",
    "muhurtaLite.sunset.utc",
    issues
  );

  const timingKeys = [
    "rahu_kaal",
    "gulika_kaal",
    "yamaganda",
    "abhijit_muhurta",
  ] as const;

  for (const key of timingKeys) {
    const timing = asRecord(data[key]);
    checkRequiredString(
      timing,
      "start_utc",
      `muhurtaLite.${key}.start_utc`,
      issues
    );
    checkRequiredString(
      timing,
      "end_utc",
      `muhurtaLite.${key}.end_utc`,
      issues
    );
    checkRequiredString(
      timing,
      "start_local_time",
      `muhurtaLite.${key}.start_local_time`,
      issues
    );
    checkRequiredString(
      timing,
      "end_local_time",
      `muhurtaLite.${key}.end_local_time`,
      issues
    );
  }

  return resultFromIssues(issues);
}

export function validateCompatibilityDataCompleteness(input: {
  firstDateOfBirth?: string | null;
  secondDateOfBirth?: string | null;
  firstTimeOfBirth?: string | null;
  secondTimeOfBirth?: string | null;
  firstPlace?: string | null;
  secondPlace?: string | null;
}): AstrologyDataValidationResult {
  const issues: AstrologyDataIssue[] = [];
  const firstDate = input.firstDateOfBirth?.trim();
  const secondDate = input.secondDateOfBirth?.trim();
  const firstTime = input.firstTimeOfBirth?.trim();
  const secondTime = input.secondTimeOfBirth?.trim();
  const firstPlace = input.firstPlace?.trim();
  const secondPlace = input.secondPlace?.trim();

  if (!firstDate || !secondDate) {
    issues.push(
      issue(
        "compatibility.dates",
        "MISSING_DATES",
        "Both birth dates are required."
      )
    );
  }

  if (!firstTime || !secondTime || !firstPlace || !secondPlace) {
    issues.push(
      issue(
        "compatibility.precision",
        "PARTIAL_COMPATIBILITY_CONTEXT",
        "Compatibility result is based on partial birth context.",
        "warning"
      )
    );
  }

  return resultFromIssues(issues);
}

export function getIncompleteDataMessage(input: {
  context: "kundli" | "report" | "panchang" | "compatibility";
  locale?: string | null;
}): string {
  const locale = (input.locale ?? "en").toLowerCase();

  if (locale === "as") {
    return "কিছুমান প্ৰয়োজনীয় জ্যোতিষ তথ্য অসম্পূৰ্ণ আছে। উপলব্ধ তথ্যৰ ভিত্তিত সীমিত বিশ্লেষণ দেখুওৱা হৈছে।";
  }

  if (locale === "hi") {
    return "कुछ आवश्यक ज्योतिषीय डेटा अपूर्ण है। उपलब्ध डेटा के आधार पर सीमित विश्लेषण दिखाया जा रहा है।";
  }

  if (input.context === "kundli") {
    return "Some required birth-chart fields are incomplete. Showing only safe, grounded guidance from available data.";
  }

  if (input.context === "panchang") {
    return "Panchang data is partially incomplete for this date/location. Showing only validated factors.";
  }

  return "Some required astrology data is incomplete. The output is limited to validated sections only.";
}
