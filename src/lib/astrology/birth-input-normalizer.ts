export type BirthInputNormalizationStatus = "NORMALIZED" | "INVALID";

export type BirthInputNormalizationField =
  | "date_local"
  | "time_local"
  | "place_text";

export type BirthInputNormalizationIssue = {
  field: BirthInputNormalizationField;
  code: string;
  message: string;
  rawValue: string;
};

export type NormalizedBirthContextInput = {
  date_local_normalized: string;
  time_local_normalized: string;
  place_text_original: string;
  place_query_normalized: string;
  normalization_status: "NORMALIZED";
  quality: {
    date_input_format:
      | "YMD_DASH"
      | "YMD_SLASH"
      | "YMD_DOT"
      | "DMY_DASH"
      | "DMY_SLASH"
      | "DMY_DOT";
    time_input_format:
      | "H24_HH_MM"
      | "H24_HH_MM_SS"
      | "H12_AM_PM"
      | "H12_AM_PM_MINUTES";
    place_token_count: number;
  };
};

export type BirthInputNormalizationResult =
  | {
      success: true;
      data: NormalizedBirthContextInput;
    }
  | {
      success: false;
      normalization_status: "INVALID";
      issues: BirthInputNormalizationIssue[];
      partial: {
        date_local_normalized: string | null;
        time_local_normalized: string | null;
        place_text_original: string;
        place_query_normalized: string | null;
      };
    };

export class BirthInputNormalizationError extends Error {
  constructor(readonly issues: BirthInputNormalizationIssue[]) {
    super("Birth input normalization failed.");
    this.name = "BirthInputNormalizationError";
  }
}

type DateNormalizationOutput = {
  value: string | null;
  format:
    | "YMD_DASH"
    | "YMD_SLASH"
    | "YMD_DOT"
    | "DMY_DASH"
    | "DMY_SLASH"
    | "DMY_DOT"
    | null;
};

type TimeNormalizationOutput = {
  value: string | null;
  format:
    | "H24_HH_MM"
    | "H24_HH_MM_SS"
    | "H12_AM_PM"
    | "H12_AM_PM_MINUTES"
    | null;
};

type PlaceNormalizationOutput = {
  original: string;
  query: string | null;
  tokenCount: number;
};

function trimToSingleSpaces(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function toTwoDigits(value: number) {
  return value.toString().padStart(2, "0");
}

function isRealCalendarDate(year: number, month: number, day: number) {
  const candidate = new Date(Date.UTC(year, month - 1, day));

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

function normalizeDateInput(
  input: string,
  issues: BirthInputNormalizationIssue[]
): DateNormalizationOutput {
  const raw = trimToSingleSpaces(input);

  if (!raw) {
    issues.push({
      field: "date_local",
      code: "REQUIRED_DATE",
      message: "Birth date is required.",
      rawValue: input,
    });

    return {
      value: null,
      format: null,
    };
  }

  const ymdMatch = raw.match(/^(\d{4})([-/.])(\d{1,2})\2(\d{1,2})$/);

  if (ymdMatch) {
    const year = Number(ymdMatch[1]);
    const month = Number(ymdMatch[3]);
    const day = Number(ymdMatch[4]);

    if (!isRealCalendarDate(year, month, day)) {
      issues.push({
        field: "date_local",
        code: "INVALID_DATE",
        message: "Birth date must represent a real calendar date.",
        rawValue: input,
      });

      return { value: null, format: null };
    }

    const separator = ymdMatch[2];

    return {
      value: `${year}-${toTwoDigits(month)}-${toTwoDigits(day)}`,
      format:
        separator === "-"
          ? "YMD_DASH"
          : separator === "/"
            ? "YMD_SLASH"
            : "YMD_DOT",
    };
  }

  const dmyMatch = raw.match(/^(\d{1,2})([-/.])(\d{1,2})\2(\d{4})$/);

  if (dmyMatch) {
    const day = Number(dmyMatch[1]);
    const month = Number(dmyMatch[3]);
    const year = Number(dmyMatch[4]);
    const separator = dmyMatch[2];

    if (separator === "/" && day <= 12 && month <= 12) {
      issues.push({
        field: "date_local",
        code: "AMBIGUOUS_DATE_FORMAT",
        message:
          "Ambiguous birth date format. Use YYYY-MM-DD to avoid day/month confusion.",
        rawValue: input,
      });

      return { value: null, format: null };
    }

    if (!isRealCalendarDate(year, month, day)) {
      issues.push({
        field: "date_local",
        code: "INVALID_DATE",
        message: "Birth date must represent a real calendar date.",
        rawValue: input,
      });

      return { value: null, format: null };
    }

    return {
      value: `${year}-${toTwoDigits(month)}-${toTwoDigits(day)}`,
      format:
        separator === "-"
          ? "DMY_DASH"
          : separator === "/"
            ? "DMY_SLASH"
            : "DMY_DOT",
    };
  }

  issues.push({
    field: "date_local",
    code: "UNSUPPORTED_DATE_FORMAT",
    message:
      "Unsupported birth date format. Use YYYY-MM-DD or DMY formats like DD-MM-YYYY.",
    rawValue: input,
  });

  return {
    value: null,
    format: null,
  };
}

function normalizeTimeInput(
  input: string,
  issues: BirthInputNormalizationIssue[]
): TimeNormalizationOutput {
  const raw = trimToSingleSpaces(input);

  if (!raw) {
    issues.push({
      field: "time_local",
      code: "REQUIRED_TIME",
      message: "Birth time is required.",
      rawValue: input,
    });

    return {
      value: null,
      format: null,
    };
  }

  const normalizedSeparators = raw.replace(/\./g, ":");
  const h24Match = normalizedSeparators.match(
    /^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/
  );

  if (h24Match) {
    const hour = Number(h24Match[1]);
    const minute = Number(h24Match[2]);
    const seconds = h24Match[3];

    return {
      value: `${toTwoDigits(hour)}:${toTwoDigits(minute)}`,
      format: seconds ? "H24_HH_MM_SS" : "H24_HH_MM",
    };
  }

  const h12Match = normalizedSeparators.match(
    /^(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*([AaPp])\.?\s*[Mm]\.?$/
  );

  if (h12Match) {
    const hour12 = Number(h12Match[1]);
    const minute = h12Match[2] ? Number(h12Match[2]) : 0;
    const meridian = h12Match[3].toUpperCase();
    const hour24 =
      meridian === "P"
        ? hour12 === 12
          ? 12
          : hour12 + 12
        : hour12 === 12
          ? 0
          : hour12;

    return {
      value: `${toTwoDigits(hour24)}:${toTwoDigits(minute)}`,
      format: h12Match[2] ? "H12_AM_PM_MINUTES" : "H12_AM_PM",
    };
  }

  issues.push({
    field: "time_local",
    code: "UNSUPPORTED_TIME_FORMAT",
    message:
      "Unsupported birth time format. Use HH:mm (24-hour) or h:mm AM/PM.",
    rawValue: input,
  });

  return {
    value: null,
    format: null,
  };
}

function normalizePlaceTextInput(
  input: string,
  issues: BirthInputNormalizationIssue[]
): PlaceNormalizationOutput {
  const original = input;
  let cleaned = trimToSingleSpaces(input);

  if (!cleaned) {
    issues.push({
      field: "place_text",
      code: "REQUIRED_PLACE_TEXT",
      message: "Birth place text is required.",
      rawValue: input,
    });

    return {
      original,
      query: null,
      tokenCount: 0,
    };
  }

  cleaned = cleaned
    .replace(/^(?:born in|birth place|birthplace|place of birth|place|at)\s*[:,-]?\s*/i, "")
    .replace(/\s*[,;|/]\s*/g, ", ")
    .replace(/,+/g, ",")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ", ")
    .replace(/^,\s*|\s*,$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    issues.push({
      field: "place_text",
      code: "INVALID_PLACE_TEXT",
      message: "Birth place text could not be normalized safely.",
      rawValue: input,
    });

    return {
      original,
      query: null,
      tokenCount: 0,
    };
  }

  const tokenCount = cleaned
    .split(/[,\s]+/)
    .map((token) => token.trim())
    .filter(Boolean).length;

  return {
    original,
    query: cleaned,
    tokenCount,
  };
}

export function normalizeBirthContextInput(input: {
  dateLocalInput: string;
  timeLocalInput: string;
  placeTextInput: string;
}): BirthInputNormalizationResult {
  const issues: BirthInputNormalizationIssue[] = [];
  const date = normalizeDateInput(input.dateLocalInput, issues);
  const time = normalizeTimeInput(input.timeLocalInput, issues);
  const place = normalizePlaceTextInput(input.placeTextInput, issues);

  if (issues.length > 0 || !date.value || !time.value || !place.query) {
    return {
      success: false,
      normalization_status: "INVALID",
      issues,
      partial: {
        date_local_normalized: date.value,
        time_local_normalized: time.value,
        place_text_original: place.original,
        place_query_normalized: place.query,
      },
    };
  }

  return {
    success: true,
    data: {
      date_local_normalized: date.value,
      time_local_normalized: time.value,
      place_text_original: place.original,
      place_query_normalized: place.query,
      normalization_status: "NORMALIZED",
      quality: {
        date_input_format: date.format!,
        time_input_format: time.format!,
        place_token_count: place.tokenCount,
      },
    },
  };
}

export function assertNormalizedBirthContextInput(input: {
  dateLocalInput: string;
  timeLocalInput: string;
  placeTextInput: string;
}) {
  const result = normalizeBirthContextInput(input);

  if (!result.success) {
    throw new BirthInputNormalizationError(result.issues);
  }

  return result.data;
}
