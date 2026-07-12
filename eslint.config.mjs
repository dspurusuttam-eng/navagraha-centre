import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next*/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Card 11: the isolated validation laboratory is never part of the app's
    // compile/lint graph (it has its own pinned tsconfig + package).
    "tools/card11-reference-lab/**",
  ]),
]);

export default eslintConfig;
