import { config as loadDotenv } from "dotenv";
import { buildSiderealChartContractForUser } from "@/modules/astrology/chart-contract";

const envFiles = [
  ".env",
  ".env.local",
  ".env.development.local",
  ".env.development",
];

for (const envFile of envFiles) {
  loadDotenv({ path: envFile, override: false, quiet: true });
}

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

async function main() {
  const userId = readArg("--user-id");

  if (!userId) {
    console.log(
      JSON.stringify(
        {
          success: false,
          error: {
            code: "MISSING_USER_ID",
            message:
              'Pass a user id with --user-id. Example: npm run debug:chart-contract -- --user-id "<user-id>"',
          },
        },
        null,
        2
      )
    );
    return;
  }

  const result = await buildSiderealChartContractForUser(userId);

  console.log(
    JSON.stringify(
      {
        userId,
        result,
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
