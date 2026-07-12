# Card 11.R1 Reference Lab — Licence Notices

All components below are used for **internal validation only** and are **not** shipped
in the proprietary NAVAGRAHA CENTRE production application. Licences verified from
primary sources during Card 11.R0 / R1.

| Component | Version | Licence | Copyright | Classification |
|-----------|---------|---------|-----------|----------------|
| astronomy-engine | 2.1.19 | MIT | Don Cross (2019–2025) | VERIFIED_PROPRIETARY_SAFE_ZERO_COST |
| skyfield | 1.54 | MIT | Brandon Rhodes | VERIFIED_PROPRIETARY_SAFE_ZERO_COST (validation-only) |
| jplephem | 2.24 | MIT | Brandon Rhodes | VERIFIED (validation-only) |
| numpy | 2.5.1 | BSD-3-Clause | NumPy Developers | VERIFIED_PROPRIETARY_SAFE_ZERO_COST |
| sgp4 | 2.27 | MIT | Brandon Rhodes | VERIFIED (validation-only) |
| certifi | 2026.6.17 | MPL-2.0 (CA bundle) | Kenneth Reitz / PSF | VERIFIED (validation-only; CA data) |
| tsx / typescript / @types/node | 4.23.0 / 7.0.2 / 26.1.1 | MIT / Apache-2.0 / MIT | resp. | VERIFIED (dev tooling) |
| JPL DE440s kernel | de440s.bsp | Public domain (US Gov work, NASA/JPL/Caltech) | — | VERIFIED (public domain; validation-only, not redistributed) |
| Node.js 22.23.1 (portable) | 22.23.1 | MIT (+ deps) | Node.js contributors | VERIFIED (dev runtime to load Node-22-ABI swisseph) |

Notes:
- The production astronomy engine (swisseph / Swiss Ephemeris, dual GPL-or-paid) is the
  **protected production baseline** and is NOT changed by Card 11. Its licensing posture
  is tracked separately (Card 11.0 / 11.R0). No provider cutover is authorized here.
- No AGPL, no paid API, no live NASA/JPL network dependency enters production.
- Attribution for the validation harness (if ever distributed): retain the MIT/BSD
  notices above and acknowledge NASA/JPL/NAIF for DE440s.
