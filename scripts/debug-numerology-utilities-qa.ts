import { calculateNumerologyUtilityContext } from "@/modules/numerology";

type UtilityCase = {
  name: string;
  status: "ready" | "unavailable";
  utilityType: string;
  primaryNumber: number | null;
  supportingCount: number;
  missingReason: string | null;
  numberLabel: string | null;
};

function summarize(
  name: string,
  result: ReturnType<typeof calculateNumerologyUtilityContext>
): UtilityCase {
  if (!result.success) {
    return {
      name,
      status: "unavailable",
      utilityType: "unavailable",
      primaryNumber: null,
      supportingCount: 0,
      missingReason: result.error.message,
      numberLabel: null,
    };
  }

  return {
    name,
    status: "ready",
    utilityType: result.data.utilityType,
    primaryNumber: result.data.primaryNumber,
    supportingCount: result.data.supportingNumbers.length,
    missingReason: result.data.missingReason,
    numberLabel: result.data.numberLabel,
  };
}

function main() {
  const cases: UtilityCase[] = [
    summarize(
      "name",
      calculateNumerologyUtilityContext({
        utilityType: "name_numerology",
        fullName: "Joy Prakash Sarmah",
      })
    ),
    summarize(
      "business",
      calculateNumerologyUtilityContext({
        utilityType: "business_name_numerology",
        businessName: "Navagraha Centre",
      })
    ),
    summarize(
      "vehicle",
      calculateNumerologyUtilityContext({
        utilityType: "vehicle_number_numerology",
        vehicleNumber: "AS01AB1234",
      })
    ),
    summarize(
      "mobile",
      calculateNumerologyUtilityContext({
        utilityType: "mobile_number_numerology",
        mobileNumber: "9876543210",
      })
    ),
    summarize(
      "compatibility",
      calculateNumerologyUtilityContext({
        utilityType: "name_dob_compatibility",
        fullName: "Joy Prakash Sarmah",
        dateOfBirth: "1996-04-12",
      })
    ),
    summarize(
      "assamese-name",
      calculateNumerologyUtilityContext({
        utilityType: "name_numerology",
        fullName: "জয় প্ৰকাশ শৰ্মা",
      })
    ),
    summarize(
      "empty-name",
      calculateNumerologyUtilityContext({
        utilityType: "name_numerology",
        fullName: "",
      })
    ),
    summarize(
      "invalid-mobile",
      calculateNumerologyUtilityContext({
        utilityType: "mobile_number_numerology",
        mobileNumber: "",
      })
    ),
  ];

  console.log(JSON.stringify({ cases }, null, 2));
}

main();
