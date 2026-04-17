import { config as loadDotenv } from "dotenv";
import { buildBirthContextDebugPayload } from "../src/lib/astrology/birth-context-debug";

const envFiles = [
  ".env",
  ".env.local",
  ".env.development.local",
  ".env.development",
];

for (const envFile of envFiles) {
  loadDotenv({ path: envFile, override: false });
}

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function getDebugInput() {
  return {
    dateLocalInput: readArg("--date") ?? "1996-04-12",
    timeLocalInput: readArg("--time") ?? "19:30",
    placeTextInput:
      readArg("--place") ?? "North Lakhimpur, Assam, India",
  };
}

async function main() {
  const payload = await buildBirthContextDebugPayload(getDebugInput());

  console.log(JSON.stringify(payload, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
