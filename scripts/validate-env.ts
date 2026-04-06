import "dotenv/config";
import {
  formatEnvironmentValidation,
  validateLaunchEnvironment,
} from "../src/config/env";

const validation = validateLaunchEnvironment();

if (validation.issues.length) {
  console.log(formatEnvironmentValidation(validation));
} else {
  console.log("Environment validation passed.");
}

if (!validation.valid) {
  process.exitCode = 1;
}
