export const astrologyCalculatorKeys = [
  "nakshatra",
  "moon-sign",
  "lagna",
  "birth-number",
  "compatibility-quick",
  "date-check",
] as const;

export type AstrologyCalculatorKey = (typeof astrologyCalculatorKeys)[number];

export type AstrologyCalculatorInputSummary = {
  label: string;
  value: string;
};

export type AstrologyCalculatorDetail = {
  label: string;
  value: string;
};

export type AstrologyCalculatorResult = {
  calculator: AstrologyCalculatorKey;
  inputSummary: AstrologyCalculatorInputSummary[];
  mainResult: {
    title: string;
    value: string;
    accent?: string;
  };
  supportingDetails: AstrologyCalculatorDetail[];
  summary: {
    headline: string;
    points: string[];
    note?: string;
  };
};

export type AstrologyCalculatorSuccess = {
  success: true;
  data: {
    generatedAtUtc: string;
    result: AstrologyCalculatorResult;
  };
};

export type AstrologyCalculatorErrorCode =
  | "INVALID_REQUEST"
  | "INVALID_CALCULATOR"
  | "MISSING_REQUIRED_FIELDS"
  | "INVALID_FIELD_LENGTH"
  | "INVALID_INPUT"
  | "NORMALIZATION_FAILED"
  | "PLACE_RESOLUTION_FAILED"
  | "CALCULATION_FAILED";

export type AstrologyCalculatorFailure = {
  success: false;
  error: {
    code: AstrologyCalculatorErrorCode;
    message: string;
  };
};

export type AstrologyCalculatorExecutionResult =
  | AstrologyCalculatorSuccess
  | AstrologyCalculatorFailure;
