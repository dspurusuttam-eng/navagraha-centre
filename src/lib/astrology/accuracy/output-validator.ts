import type { AstrologyAssistantStructuredResponse } from "@/modules/ask-chart/assistant-response-engine";
import type { ChartInterpretationResult } from "@/modules/ai/types";
import { assessPredictionPolicy } from "@/lib/astrology/accuracy/prediction-policy";
import { assessRemedySafety } from "@/lib/astrology/accuracy/remedy-safety";

export type OutputValidationIssue = {
  rule: string;
  message: string;
  severity: "high" | "medium" | "low";
};

export type OutputValidationResult = {
  valid: boolean;
  issues: OutputValidationIssue[];
};

function issue(
  rule: string,
  message: string,
  severity: "high" | "medium" | "low"
): OutputValidationIssue {
  return {
    rule,
    message,
    severity,
  };
}

function hasMostlyScript(
  text: string,
  scriptRegex: RegExp,
  threshold = 0.08
): boolean {
  const letters = text.match(/[A-Za-z\u0900-\u097F\u0980-\u09FF]+/g) ?? [];
  const content = letters.join("");

  if (!content) {
    return true;
  }

  const scriptChars = content.match(scriptRegex)?.length ?? 0;

  return scriptChars / content.length >= threshold;
}

function validateLocaleTone(text: string, locale: string): OutputValidationIssue[] {
  const normalized = locale.toLowerCase();

  if (normalized === "hi" && !hasMostlyScript(text, /[\u0900-\u097F]/g)) {
    return [
      issue(
        "LOCALE_MISMATCH_HI",
        "Requested Hindi output appears to be in a different language/script.",
        "medium"
      ),
    ];
  }

  if (normalized === "as" && !hasMostlyScript(text, /[\u0980-\u09FF]/g)) {
    return [
      issue(
        "LOCALE_MISMATCH_AS",
        "Requested Assamese output appears to be in a different language/script.",
        "medium"
      ),
    ];
  }

  return [];
}

function validateLength(text: string) {
  if (text.length > 2400) {
    return issue(
      "OUTPUT_TOO_LONG",
      "AI output is excessively long for the expected structured response.",
      "medium"
    );
  }

  return null;
}

export function validateAssistantStructuredOutput(input: {
  output: AstrologyAssistantStructuredResponse;
  locale: string;
}): OutputValidationResult {
  const issues: OutputValidationIssue[] = [];
  const answer = input.output.answer.trim();
  const reasoning = input.output.reasoning.trim();
  const combined = `${answer}\n${reasoning}`.trim();

  if (!answer) {
    issues.push(issue("MISSING_ANSWER", "Assistant answer section is missing.", "high"));
  }

  if (!reasoning) {
    issues.push(
      issue("MISSING_REASONING", "Assistant reasoning section is missing.", "high")
    );
  }

  if (answer && answer.length < 20) {
    issues.push(
      issue(
        "ANSWER_TOO_SHORT",
        "Assistant answer is too short to be astrologer-grade guidance.",
        "medium"
      )
    );
  }

  const lengthIssue = validateLength(combined);

  if (lengthIssue) {
    issues.push(lengthIssue);
  }

  const policy = assessPredictionPolicy(combined);
  const remedySafety = assessRemedySafety(combined);

  for (const violation of policy.violations) {
    issues.push(issue(violation.rule, violation.message, violation.severity));
  }

  for (const violation of remedySafety.violations) {
    issues.push(issue(violation.rule, violation.message, violation.severity));
  }

  issues.push(...validateLocaleTone(combined, input.locale));

  return {
    valid: !issues.some((item) => item.severity === "high"),
    issues,
  };
}

export function validateChartInterpretationOutput(input: {
  output: ChartInterpretationResult;
  locale: string;
}): OutputValidationResult {
  const issues: OutputValidationIssue[] = [];
  const sectionsText = input.output.sections.map((section) => section.body).join("\n");
  const fullText = [input.output.summary, sectionsText, input.output.caution]
    .join("\n")
    .trim();

  if (!input.output.summary.trim()) {
    issues.push(issue("MISSING_SUMMARY", "Report summary is missing.", "high"));
  }

  if (!input.output.caution.trim()) {
    issues.push(issue("MISSING_CAUTION", "Report caution section is missing.", "high"));
  }

  if (
    input.output.sections.length < 4 ||
    input.output.sections.some((section) => !section.body.trim())
  ) {
    issues.push(
      issue(
        "INCOMPLETE_REPORT_SECTIONS",
        "Report interpretation sections are incomplete.",
        "high"
      )
    );
  }

  const policy = assessPredictionPolicy(fullText);
  const remedySafety = assessRemedySafety(fullText);

  for (const violation of policy.violations) {
    issues.push(issue(violation.rule, violation.message, violation.severity));
  }

  for (const violation of remedySafety.violations) {
    issues.push(issue(violation.rule, violation.message, violation.severity));
  }

  issues.push(...validateLocaleTone(fullText, input.locale));

  return {
    valid: !issues.some((item) => item.severity === "high"),
    issues,
  };
}
