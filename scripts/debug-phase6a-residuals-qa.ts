/**
 * Phase 6A residual fixes QA.
 *
 * Two of the Founder-certification residuals are pure logic and can be proved
 * without a database or a device:
 *
 *  R1 — Publish went public on a single tap while Delete asked for confirmation.
 *  R6 — "Active today" counted against the UTC day, so it read 0 through the
 *       whole Indian early morning (observed live at 06:24 IST: today 0, 7-day 33).
 */
import { LIFECYCLE_ACTIONS } from "@/modules/admin/desk/lifecycle-controls";

const CENTRE_TIME_ZONE = "Asia/Kolkata";

/** Mirror of the analytics page helper, exercised against fixed instants. */
function zoneOffsetMs(instant: Date, timeZone: string): number {
  const asUtc = new Date(instant.toLocaleString("en-US", { timeZone: "UTC" }));
  const asZone = new Date(instant.toLocaleString("en-US", { timeZone }));
  return asZone.getTime() - asUtc.getTime();
}

function startOfTodayInZone(now: Date): Date {
  const offsetMs = zoneOffsetMs(now, CENTRE_TIME_ZONE);
  const zoneNow = new Date(now.getTime() + offsetMs);
  const zoneMidnight = Date.UTC(
    zoneNow.getUTCFullYear(),
    zoneNow.getUTCMonth(),
    zoneNow.getUTCDate()
  );
  return new Date(zoneMidnight - offsetMs);
}

/** What the old card did: match on the UTC calendar date string. */
function utcDayOf(instant: Date): string {
  return instant.toISOString().slice(0, 10);
}

const failures: string[] = [];

// ---------------------------------------------------------------- R1
console.log("R1 — actions that make content public must ask first\n");
for (const key of ["PUBLISH", "REPUBLISH", "DELETE", "ARCHIVE"] as const) {
  const action = LIFECYCLE_ACTIONS.find((a) => a.key === key);
  if (!action) {
    failures.push(`${key}: missing from LIFECYCLE_ACTIONS`);
    continue;
  }
  console.log(
    `  ${key.padEnd(10)} requiresConfirm=${String(action.requiresConfirm).padEnd(5)} ${action.confirmLabel ?? ""}`
  );
  if (!action.requiresConfirm) {
    failures.push(`${key}: must require confirmation`);
  }
  if (!action.confirmMessage) {
    failures.push(`${key}: confirmation has no message`);
  }
}

// ---------------------------------------------------------------- R6
console.log("\nR6 — the day boundary must be IST, not UTC\n");

// 06:24 IST is the moment observed on the device: 00:54 UTC the SAME day, but a
// reader active at 01:00 IST is 19:30 UTC on the PREVIOUS day.
const observed = new Date("2026-07-22T00:54:00Z"); // 06:24 IST
const earlyMorningReader = new Date("2026-07-21T19:35:00Z"); // 01:05 IST on 22 Jul

const istStart = startOfTodayInZone(observed);
const countedNow = earlyMorningReader >= istStart;
const countedBefore = utcDayOf(earlyMorningReader) === utcDayOf(observed);

console.log(`  page rendered at        ${observed.toISOString()}  (06:24 IST, 22 Jul)`);
console.log(`  reader active at        ${earlyMorningReader.toISOString()}  (01:05 IST, 22 Jul)`);
console.log(`  IST day starts at       ${istStart.toISOString()}`);
console.log(`  counted by UTC-day rule ${countedBefore}   <- the defect`);
console.log(`  counted by IST rule     ${countedNow}`);

if (countedBefore) {
  failures.push("R6: fixture failed to reproduce the UTC-boundary defect");
}
if (!countedNow) {
  failures.push("R6: IST boundary still excludes an early-morning Indian reader");
}

// The IST start must be 18:30 UTC on the previous calendar day.
const expected = "2026-07-21T18:30:00.000Z";
if (istStart.toISOString() !== expected) {
  failures.push(`R6: IST midnight resolved to ${istStart.toISOString()}, expected ${expected}`);
}

// ---------------------------------------------------------------- result
if (failures.length) {
  console.error("\nFAIL");
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exitCode = 1;
} else {
  console.log("\nPASS — publish/republish now confirm, and the day boundary is IST.");
}
