# Project Recovery: Scattered Folder Consolidation

## Real Root
- `D:\PPDS\PDS BDS\navagraha-centre`

## Duplicate Source Folders Checked
- `D:\PDS BDS\navagraha-centre`
- `D:\PPDS\PDS BDS\_tmp\navagraha-centre-19.2B`
- `D:\PPDS\PDS BDS\navagraha-centre-build-verify-2`
- `D:\PPDS\PDS BDS\navagraha-centre-build-verify-3`

## Files Merged
- No bulk copy was required during recovery.
- The real root already contained the phase 20 and phase 21 source/docs work.
- Recovery work stayed inside the real root and focused on compatibility fixes for the canonical dashboard ecosystem contract.

## Files Skipped
- `node_modules`
- `.next`
- `.vercel`
- `.env*`
- temporary build verification folders
- other build artifacts
- duplicate package files
- unrelated snapshot-only folders

## Conflicts Found
- No destructive overwrite was performed.
- The copied phase-21 dashboard hub contract differed from the real root's canonical `dashboard-ecosystem` contract.
- Resolution: extend the canonical dashboard hub and ecosystem types in place instead of replacing the existing dashboard ecosystem implementation.

## Package File Comparison
- `package.json` exists in the real root.
- No alternate `package.json` from a duplicate source folder was copied over.
- `package-lock.json` remains comparison-only and was not overwritten.

## Phase 20 Presence
- Phase 20 docs are present in the real root.
- Phase 20 report foundation, intelligence, formatter, gating, QA, safety, and deploy-readiness documentation are present.

## Phase 21 Presence
- Phase 21 docs are present in the real root.
- Dashboard foundation, saved Kundli, Dasha/today guidance, reports/unlock history, and AI history docs are present.

## Final Validation
- Correct project root verified: `D:\PPDS\PDS BDS\navagraha-centre`
- `package.json` confirmed in the real root.
- `.next` lock was cleared manually from PowerShell.
- Dashboard dynamic route typing was fixed for:
  - `src/app/(app)/dashboard/ai-history/[id]/page.tsx`
  - `src/app/(app)/dashboard/kundli/[id]/page.tsx`
  - `src/app/(app)/dashboard/report/[id]/page.tsx`
  - `src/app/(app)/dashboard/reports/[id]/page.tsx`
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- The Next route typing blocker is fixed and the workspace is now build-ready from the real root.

## Remaining Risk Notes
- The real root should be used for all future work.
- It is safe to continue Phase 21 development from the real root.
- The project is build-ready from the real root.
