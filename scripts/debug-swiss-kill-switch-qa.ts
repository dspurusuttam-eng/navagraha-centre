import assert from "node:assert/strict";

import {
  featureDisabledCode,
  productModeContract,
} from "../src/config/product-mode";
import { getSwissEphModule } from "../src/lib/astrology/swiss-module";

assert.equal(productModeContract.SWISS_RUNTIME_ENABLED, false);

assert.throws(
  () => getSwissEphModule(),
  (error) => {
    assert.ok(error instanceof Error);
    assert.equal((error as Error & { code?: string }).code, featureDisabledCode);
    assert.match(error.message, /Swiss Ephemeris module is disabled/);
    return true;
  }
);

console.log("Swiss kill-switch QA passed.");
