# Card 11.R1 — Isolated Astronomy Reference Laboratory

**Purpose:** compare the UNCHANGED NAVAGRAHA production astronomy engine (swisseph)
against independent references (Skyfield + JPL DE440s primary oracle; Astronomy Engine
secondary comparator) across a deterministic fixture corpus, with quantity-specific
tolerances, boundary guard-bands, and Gates G1 (True Node) and G2 (Lahiri).

**This laboratory is NOT part of the production application.** The production app never
imports anything here. No production behaviour, engine, route, schema, or dependency is
changed. See the phase report for the full isolation proof.

## Layout
```
manifests/    providers.json, kernels.json, conventions.json
fixtures/     reference-cases.json, boundary-cases.json, expected-invariants.json
node/         isolated TS subproject (astronomy-engine comparator, normalizer,
              tolerance registry, discrepancy classifier, comparator, benchmark, lahiri
              candidate, current-engine adapter [source-of-record], tests)
python/       Skyfield oracle + kernel manifest (isolated venv)
cache/        LOCAL-ONLY (gitignored): de440s.bsp kernel, portable Node 22
reports/      generated JSON artifacts (gitignored)
```

## Prerequisites (local-only; never in production)
- Node (any recent) for the isolated `node/` subproject: `cd node && npm install`.
- Python 3 venv for the oracle: `cd python && python -m venv .venv && .venv/Scripts/python -m pip install -r requirements.txt`.
- JPL DE440s kernel in `cache/de440s.bsp` (verified by `python/kernel_manifest.py`).
- Portable **Node 22** in `cache/` — required only to load the Node-22-ABI native
  `swisseph` binary when running the current-engine adapter (see below).

## Run order
1. **Current-engine adapter** (production context, Node 22): the file
   `node/src/current-engine-adapter.ts` calls the UNCHANGED production functions. Because
   those use the `@/` path alias, the Next-only `server-only` virtual module, and the
   native swisseph binary, it is executed inside the production project via a temporary,
   immediately-removed bootstrap (`LAB_DIR` + `SWISSEPH_EPHE_PATH` env). It writes
   `reports/current-engine-results.json`, `reports/resolved-instants.json`, and
   `reports/production-ayanamsa-sweep.json`. The production tree is left byte-clean.
2. **Skyfield oracle** (Python): `cd python && .venv/Scripts/python skyfield_oracle.py`.
3. **Astronomy Engine comparator**: `cd node && npm run astronomy-engine`.
4. **Differential comparator**: `cd node && npm run compare`.
5. **Benchmark**: `cd node && npm run benchmark`. **Tests**: `npm test`. **Typecheck**: `npm run typecheck`.

## Guarantees
- Providers are never averaged. Discrepancies are classified, never hidden.
- A ±1' comparator (astronomy-engine) never decides a discrete Vedic classification near
  a boundary (guard-bands → BOUNDARY_SENSITIVE).
- Deterministic: repeated comparator runs produce byte-identical `differential-report.json`.
