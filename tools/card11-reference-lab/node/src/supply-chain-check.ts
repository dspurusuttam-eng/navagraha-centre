// Card 11.R5 — supply-chain & production-isolation proof (VALIDATION-ONLY).
// Fails closed (exit 1) if any isolation invariant is violated.
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const LAB = join(HERE, "..", "..");
const ROOT = join(LAB, "..", "..");
let pass = 0, fail = 0;
const ok = (n: string, c: boolean, x = "") => { if (c) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n} ${x}`); } };

// 1. validation deps NOT in the root production dependency graph
const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8"));
const rootDeps = { ...(rootPkg.dependencies || {}), ...(rootPkg.devDependencies || {}) };
const forbidden = ["astronomy-engine", "skyfield", "jplephem"];
ok("validation deps absent from root package.json", forbidden.every((d) => !(d in rootDeps)), Object.keys(rootDeps).filter((d) => forbidden.includes(d)).join(","));

// 2. lab node subproject has its OWN manifest (separate graph)
ok("lab node subproject has its own package.json", existsSync(join(LAB, "node", "package.json")) && JSON.parse(readFileSync(join(LAB, "node", "package.json"), "utf-8")).name !== rootPkg.name);

// 3. no production source imports the lab
let labImports = "";
try { labImports = execSync(`grep -rn "card11-reference-lab" "${join(ROOT, "src")}" "${join(ROOT, "next.config.ts")}" || true`, { shell: "/bin/bash" }).toString().trim(); } catch { labImports = ""; }
ok("no production source imports the lab", labImports === "", labImports.slice(0, 120));

// 4. kernel gitignored + not tracked
let ignored = false;
try { execSync(`git check-ignore "${join(LAB, "cache", "de440s.bsp")}"`, { cwd: ROOT }); ignored = true; } catch { ignored = false; }
ok("JPL kernel is gitignored (local-only)", ignored);

// 5. kernel / lab not referenced by the Vercel bundle config
const nextCfg = existsSync(join(ROOT, "next.config.ts")) ? readFileSync(join(ROOT, "next.config.ts"), "utf-8") : "";
ok("next.config.ts does not reference kernel/lab", !/de440|reference-lab|card11/i.test(nextCfg));

// 6. no validation API/public route (lab has no app/ or route files)
ok("no validation route in lab", !existsSync(join(LAB, "node", "src", "route.ts")) && !existsSync(join(LAB, "app")));

// 7. licence notices recorded
const notices = existsSync(join(LAB, "LICENSE-NOTICES.md")) ? readFileSync(join(LAB, "LICENSE-NOTICES.md"), "utf-8") : "";
ok("licence notices present (MIT/BSD/public domain recorded)", /MIT/.test(notices) && /BSD/.test(notices) && /public domain/i.test(notices));

// 8. deterministic no-network: kernel present locally (no runtime download required)
ok("kernel present locally (no live network needed for validation)", existsSync(join(LAB, "cache", "de440s.bsp")));

console.log(`\nsupply-chain isolation: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
