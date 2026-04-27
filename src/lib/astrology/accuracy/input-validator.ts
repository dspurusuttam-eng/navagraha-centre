import { validateBirthDetails } from "@/modules/astrology/validation";
import type { BirthDetailsInput } from "@/modules/astrology/types";
import { normalizeLocaleCode } from "@/modules/localization/config";

export type AccuracyValidationSeverity = "error" | "warning";

export type AccuracyValidationIssue = {
  field: string;
  code: string;
  message: string;
  severity: AccuracyValidationSeverity;
};

export type AccuracyValidationResult<T> =
  | {
      ok: true;
      data: T;
      issues: AccuracyValidationIssue[];
    }
  | {
      ok: false;
      issues: AccuracyValidationIssue[];
    };

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const hhMmTimePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
const supportedRashifalSigns = new Set([
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
]);

function issue(
  field: string,
  code: string,
  message: string,
  severity: AccuracyValidationSeverity = "error"
): AccuracyValidationIssue {
  return {
    field,
    code,
    message,
    severity,
  };
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function pushApproximateBirthTimeWarning(
  issues: AccuracyValidationIssue[],
  timeLocal: string
) {
  if (timeLocal === "00:00" || timeLocal === "12:00") {
    issues.push(
      issue(
        "birthDetails.timeLocal",
        "APPROXIMATE_BIRTH_TIME",
        "Birth time appears approximate. Confidence should be reduced for house-specific predictions.",
        "warning"
      )
    );
  }
}

export function validateAstrologyBirthInput(
  input: BirthDetailsInput
): AccuracyValidationResult<BirthDetailsInput> {
  const baseIssues: AccuracyValidationIssue[] = [];
  const validated = validateBirthDetails(input);

  if (!validated.success) {
    for (const item of validated.issues) {
      baseIssues.push(issue(item.field, item.code, item.message, "error"));
    }

    return {
      ok: false,
      issues: baseIssues,
    };
  }

  pushApproximateBirthTimeWarning(baseIssues, validated.data.timeLocal);

  return {
    ok: true,
    data: {
      dateLocal: validated.data.dateLocal,
      timeLocal: validated.data.timeLocal,
      timezone: validated.data.timezone,
      place: {
        city: validated.data.place.city,
        region: validated.data.place.region,
        country: validated.data.place.country,
        latitude: validated.data.place.latitude,
        longitude: validated.data.place.longitude,
      },
    },
    issues: baseIssues,
  };
}

export function validateAssistantQuestionInput(input: {
  question: string;
  locale?: string | null;
  maxLength: number;
}): AccuracyValidationResult<{ question: string; locale: string }> {
  const issues: AccuracyValidationIssue[] = [];
  const question = normalizeText(input.question).replace(/\s+/g, " ");
  const locale = normalizeLocaleCode(input.locale) ?? "en";

  if (!question) {
    issues.push(
      issue(
        "question",
        "MISSING_QUESTION",
        "Enter a chart question before requesting AI guidance."
      )
    );
  }

  if (question.length > input.maxLength) {
    issues.push(
      issue(
        "question",
        "QUESTION_TOO_LONG",
        `Keep each question within ${input.maxLength} characters.`
      )
    );
  }

  if (issues.some((item) => item.severity === "error")) {
    return {
      ok: false,
      issues,
    };
  }

  return {
    ok: true,
    data: {
      question,
      locale,
    },
    issues,
  };
}

export function validateRashifalInput(input: {
  sign: string;
  date: string;
  locale?: string | null;
}): AccuracyValidationResult<{ sign: string; date: string; locale: string }> {
  const issues: AccuracyValidationIssue[] = [];
  const sign = normalizeText(input.sign).toLowerCase();
  const date = normalizeText(input.date);
  const locale = normalizeLocaleCode(input.locale) ?? "en";

  if (!supportedRashifalSigns.has(sign)) {
    issues.push(
      issue(
        "sign",
        "INVALID_SIGN",
        "Zodiac sign is invalid for daily rashifal generation."
      )
    );
  }

  if (!isoDatePattern.test(date)) {
    issues.push(
      issue(
        "date",
        "INVALID_DATE",
        "Date must use YYYY-MM-DD format for rashifal generation."
      )
    );
  }

  if (issues.length > 0) {
    return {
      ok: false,
      issues,
    };
  }

  return {
    ok: true,
    data: { sign, date, locale },
    issues,
  };
}

export function validatePanchangRequestInput(input: {
  date: string;
  place: string;
  timezone?: string | null;
}): AccuracyValidationResult<{
  date: string;
  place: string;
  timezone: string | null;
}> {
  const issues: AccuracyValidationIssue[] = [];
  const date = normalizeText(input.date);
  const place = normalizeText(input.place);
  const timezone = normalizeText(input.timezone);

  if (!date) {
    issues.push(issue("date", "MISSING_DATE", "Date is required."));
  } else if (!isoDatePattern.test(date)) {
    issues.push(
      issue("date", "INVALID_DATE", "Date must be in YYYY-MM-DD format.")
    );
  }

  if (!place) {
    issues.push(issue("place", "MISSING_PLACE", "Place is required."));
  } else if (place.length > 160) {
    issues.push(
      issue("place", "INVALID_PLACE_LENGTH", "Place exceeds allowed length.")
    );
  }

  if (timezone && !isValidTimeZone(timezone)) {
    issues.push(
      issue("timezone", "INVALID_TIMEZONE", "Timezone must be a valid IANA zone.")
    );
  }

  if (issues.some((item) => item.severity === "error")) {
    return {
      ok: false,
      issues,
    };
  }

  return {
    ok: true,
    data: {
      date,
      place,
      timezone: timezone || null,
    },
    issues,
  };
}

export function validateNumerologyRequestInput(input: {
  dateOfBirth: string;
  fullName?: string | null;
  method?: string | null;
}): AccuracyValidationResult<{
  dateOfBirth: string;
  fullName: string | null;
  method: string;
}> {
  const issues: AccuracyValidationIssue[] = [];
  const dateOfBirth = normalizeText(input.dateOfBirth);
  const fullName = normalizeText(input.fullName);
  const method = normalizeText(input.method) || "Pythagorean";

  if (!dateOfBirth) {
    issues.push(
      issue("dateOfBirth", "MISSING_DATE_OF_BIRTH", "Date of birth is required.")
    );
  } else if (!isoDatePattern.test(dateOfBirth)) {
    issues.push(
      issue(
        "dateOfBirth",
        "INVALID_DATE_OF_BIRTH",
        "Date of birth must use YYYY-MM-DD format."
      )
    );
  }

  if (fullName && fullName.length > 160) {
    issues.push(
      issue(
        "fullName",
        "INVALID_NAME_LENGTH",
        "Name exceeds allowed length for numerology."
      )
    );
  }

  if (issues.length > 0) {
    return {
      ok: false,
      issues,
    };
  }

  return {
    ok: true,
    data: {
      dateOfBirth,
      fullName: fullName || null,
      method,
    },
    issues,
  };
}

export function validateCompatibilityRequestInput(input: {
  firstDateOfBirth: string;
  secondDateOfBirth: string;
  firstTimeOfBirth?: string | null;
  secondTimeOfBirth?: string | null;
  firstPlace?: string | null;
  secondPlace?: string | null;
}): AccuracyValidationResult<{
  firstDateOfBirth: string;
  secondDateOfBirth: string;
}> {
  const issues: AccuracyValidationIssue[] = [];
  const firstDateOfBirth = normalizeText(input.firstDateOfBirth);
  const secondDateOfBirth = normalizeText(input.secondDateOfBirth);
  const firstTime = normalizeText(input.firstTimeOfBirth);
  const secondTime = normalizeText(input.secondTimeOfBirth);
  const firstPlace = normalizeText(input.firstPlace);
  const secondPlace = normalizeText(input.secondPlace);

  if (!firstDateOfBirth || !secondDateOfBirth) {
    issues.push(
      issue(
        "dates",
        "MISSING_REQUIRED_FIELDS",
        "Both birth dates are required for compatibility analysis."
      )
    );
  }

  if (firstDateOfBirth && !isoDatePattern.test(firstDateOfBirth)) {
    issues.push(
      issue(
        "firstDateOfBirth",
        "INVALID_DATE",
        "First birth date must use YYYY-MM-DD format."
      )
    );
  }

  if (secondDateOfBirth && !isoDatePattern.test(secondDateOfBirth)) {
    issues.push(
      issue(
        "secondDateOfBirth",
        "INVALID_DATE",
        "Second birth date must use YYYY-MM-DD format."
      )
    );
  }

  if (firstTime && !hhMmTimePattern.test(firstTime)) {
    issues.push(
      issue(
        "firstTimeOfBirth",
        "INVALID_TIME",
        "First birth time must use HH:MM format."
      )
    );
  }

  if (secondTime && !hhMmTimePattern.test(secondTime)) {
    issues.push(
      issue(
        "secondTimeOfBirth",
        "INVALID_TIME",
        "Second birth time must use HH:MM format."
      )
    );
  }

  if (!firstTime || !secondTime || !firstPlace || !secondPlace) {
    issues.push(
      issue(
        "context",
        "PARTIAL_MATCH_CONTEXT",
        "Compatibility confidence is lower because one or more birth times/places are missing.",
        "warning"
      )
    );
  }

  if (issues.some((item) => item.severity === "error")) {
    return {
      ok: false,
      issues,
    };
  }

  return {
    ok: true,
    data: {
      firstDateOfBirth,
      secondDateOfBirth,
    },
    issues,
  };
}

export function getFirstAccuracyErrorMessage(
  issues: AccuracyValidationIssue[],
  fallbackMessage: string
) {
  return issues.find((item) => item.severity === "error")?.message ?? fallbackMessage;
}
