import {
  calculateCoreNumerologyContext,
  calculateNumerologyContext,
} from "@/modules/numerology";

type QaResult = {
  name: string;
  status: "ready" | "unavailable";
  missingReason: string | null;
  coreCount: number;
  luckyCount: number;
  firstCalculation: string | null;
  hasNameFallback: boolean;
};

function summarize(
  name: string,
  result: ReturnType<typeof calculateCoreNumerologyContext>
): QaResult {
  if (!result.success) {
    return {
      name,
      status: "unavailable",
      missingReason: result.error.message,
      coreCount: 0,
      luckyCount: 0,
      firstCalculation: null,
      hasNameFallback: false,
    };
  }

  return {
    name,
    status: "ready",
    missingReason: result.data.missingReason,
    coreCount: result.data.coreCalculations.length,
    luckyCount: result.data.luckyNumbers.length,
    firstCalculation: result.data.coreCalculations[0]?.calculationType ?? null,
    hasNameFallback: result.data.coreCalculations.some(
      (item) => item.missingReason !== null
    ),
  };
}

function main() {
  const valid = summarize(
    "valid",
    calculateCoreNumerologyContext({
      dateOfBirth: "1996-04-12",
      fullName: "Joy Prakash Sarmah",
    })
  );

  const invalidDob = summarize(
    "invalid-dob",
    calculateCoreNumerologyContext({
      dateOfBirth: "1996-02-30",
      fullName: "Joy Prakash Sarmah",
    })
  );

  const emptyName = summarize(
    "empty-name",
    calculateCoreNumerologyContext({
      dateOfBirth: "1996-04-12",
      fullName: "",
    })
  );

  const assameseName = summarize(
    "assamese-name",
    calculateCoreNumerologyContext({
      dateOfBirth: "1996-04-12",
      fullName: "জয় প্ৰকাশ শৰ্মা",
    })
  );

  const legacy = calculateNumerologyContext({
    dateOfBirth: "1996-04-12",
    fullName: null,
  });

  console.log(
    JSON.stringify(
      {
        cases: [valid, invalidDob, emptyName, assameseName],
        legacy: legacy.success
          ? {
              coreCount: legacy.data.coreCalculations.length,
              luckyCount: legacy.data.luckyNumbers.length,
            }
          : {
              error: legacy.error.message,
            },
      },
      null,
      2
    )
  );
}

main();
