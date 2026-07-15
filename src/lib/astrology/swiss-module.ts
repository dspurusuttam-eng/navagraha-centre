import { createRequire } from "node:module";
import { assertSwissRuntimeEnabled } from "@/config/product-mode";

type SwissEphModule = typeof import("swisseph");

let cachedSwissModule: SwissEphModule | null = null;

export function getSwissEphModule(): SwissEphModule {
  assertSwissRuntimeEnabled("Swiss Ephemeris module");

  if (cachedSwissModule) {
    return cachedSwissModule;
  }

  const require = createRequire(import.meta.url);
  cachedSwissModule = require("swisseph") as SwissEphModule;

  return cachedSwissModule;
}
