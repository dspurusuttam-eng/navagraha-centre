import { calculateNumerologyContext } from "@/modules/numerology";

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

async function main() {
  const dateOfBirth = readArg("--dob") ?? "1996-04-12";
  const fullName = readArg("--name") ?? "Joy Prakash Sarmah";
  const forceInvalidDate = hasFlag("--invalid-date");
  const skipName = hasFlag("--skip-name");
  const forceMissingDob = hasFlag("--missing-dob");

  const primaryResult = calculateNumerologyContext({
    dateOfBirth: forceMissingDob
      ? ""
      : forceInvalidDate
        ? "1996-15-40"
        : dateOfBirth,
    fullName: skipName ? null : fullName,
  });

  const invalidNameResult = calculateNumerologyContext({
    dateOfBirth,
    fullName: "12345",
  });

  console.log(
    JSON.stringify(
      {
        input: {
          dateOfBirth: forceMissingDob
            ? ""
            : forceInvalidDate
              ? "1996-15-40"
              : dateOfBirth,
          fullName: skipName ? null : fullName,
        },
        primaryResult,
        invalidNameResult,
        preview:
          primaryResult.success
            ? {
                core_numbers: primaryResult.data.coreNumbers,
                compound_numbers: primaryResult.data.compoundNumbers,
                dominant_number:
                  primaryResult.data.premiumSummary.dominantNumber.number,
                interpretation: primaryResult.data.interpretation,
                premium_summary: primaryResult.data.premiumSummary,
              }
            : null,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
