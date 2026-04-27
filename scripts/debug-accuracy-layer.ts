import {
  assessPredictionPolicy,
  assessRemedySafety,
  getFirstAccuracyErrorMessage,
  validateAssistantQuestionInput,
  validateCompatibilityRequestInput,
  validateNumerologyRequestInput,
  validatePanchangOutputCompleteness,
  validatePanchangRequestInput,
} from "@/lib/astrology/accuracy";

type ScenarioResult = {
  name: string;
  pass: boolean;
  detail: string;
};

function scenario(name: string, pass: boolean, detail: string): ScenarioResult {
  return {
    name,
    pass,
    detail,
  };
}

function runScenarios(): ScenarioResult[] {
  const assistantInput = validateAssistantQuestionInput({
    question: "What does my lagna placement indicate this month?",
    locale: "en",
    maxLength: 700,
  });
  const missingBirthTimeCompatibility = validateCompatibilityRequestInput({
    firstDateOfBirth: "1992-03-15",
    secondDateOfBirth: "1994-11-20",
    firstPlace: "Guwahati",
    secondPlace: "Delhi",
  });
  const invalidCoordinatesLikePanchang = validatePanchangRequestInput({
    date: "2026-04-26",
    place: "",
  });
  const numerologyValid = validateNumerologyRequestInput({
    dateOfBirth: "1991-07-03",
    fullName: "Joy Prakash Sarmah",
  });
  const policyUnsafe = assessPredictionPolicy(
    "This will surely happen and it is 100% guaranteed."
  );
  const remedyUnsafe = assessRemedySafety(
    "You must buy an expensive gemstone immediately for guaranteed success."
  );
  const partialPanchangCompleteness = validatePanchangOutputCompleteness({
    as_of_date: "2026-04-26",
    vara: "Sunday",
    paksha: "Shukla",
    moon_sign: "Aries",
    tithi: { name: "Pratipada" },
    nakshatra: { name: "Ashwini" },
    yoga: { name: "Shobhana" },
    karana: { name: "Bava" },
    sunrise: { utc: "2026-04-26T00:00:00.000Z" },
    sunset: { utc: "2026-04-26T12:00:00.000Z" },
  });

  return [
    scenario(
      "valid-assistant-question",
      assistantInput.ok,
      assistantInput.ok ? "accepted" : "rejected"
    ),
    scenario(
      "missing-birth-time-compatibility-warning",
      missingBirthTimeCompatibility.ok,
      missingBirthTimeCompatibility.ok
        ? "accepted with warning-capable model"
        : getFirstAccuracyErrorMessage(
            missingBirthTimeCompatibility.issues,
            "invalid"
          )
    ),
    scenario(
      "invalid-panchang-place",
      !invalidCoordinatesLikePanchang.ok,
      invalidCoordinatesLikePanchang.ok
        ? "unexpectedly accepted"
        : getFirstAccuracyErrorMessage(
            invalidCoordinatesLikePanchang.issues,
            "invalid"
          )
    ),
    scenario(
      "valid-numerology-input",
      numerologyValid.ok,
      numerologyValid.ok ? "accepted" : "rejected"
    ),
    scenario(
      "policy-banned-phrase-detected",
      !policyUnsafe.passed,
      policyUnsafe.violations[0]?.rule ?? "no-violation"
    ),
    scenario(
      "unsafe-remedy-detected",
      !remedyUnsafe.passed,
      remedyUnsafe.violations[0]?.rule ?? "no-violation"
    ),
    scenario(
      "partial-panchang-detected",
      !partialPanchangCompleteness.isComplete,
      partialPanchangCompleteness.missingFields[0] ?? "no-missing-fields"
    ),
  ];
}

const results = runScenarios();
const passed = results.filter((item) => item.pass).length;

for (const result of results) {
  const marker = result.pass ? "PASS" : "FAIL";
  console.log(`${marker} ${result.name} :: ${result.detail}`);
}

console.log(`\nAccuracy checks: ${passed}/${results.length} scenarios passed.`);

if (passed !== results.length) {
  process.exitCode = 1;
}
