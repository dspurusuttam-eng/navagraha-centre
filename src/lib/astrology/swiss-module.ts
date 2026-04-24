import { createRequire } from "node:module";

type SwissEphModule = typeof import("swisseph");

let cachedSwissModule: SwissEphModule | null = null;

export function getSwissEphModule(): SwissEphModule {
  if (cachedSwissModule) {
    return cachedSwissModule;
  }

  const require = createRequire(import.meta.url);
  cachedSwissModule = require("swisseph") as SwissEphModule;

  return cachedSwissModule;
}
