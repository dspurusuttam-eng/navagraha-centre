/**
 * Phase 6B analytics accuracy QA.
 *
 * Exercises the pure parts of the dashboard data layer — range maths, the
 * comparison window, the metric/No-data contract and the IST day boundary —
 * with no database and no network, so the accuracy rules are verifiable in CI
 * rather than only by eye on a phone.
 */
import {
  RANGE_KEYS,
  isRangeKey,
  resolveRange,
  startOfDayInCentreZone,
  toMetric,
  type RangeKey,
} from "@/modules/admin/analytics/dashboard-range";

const failures: string[] = [];

function check(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

// 06:24 IST on 22 Jul 2026 == 00:54 UTC the same day.
const NOW = new Date("2026-07-22T00:54:00Z");

console.log("1. IST day boundary\n");
const istMidnight = startOfDayInCentreZone(NOW);
console.log(`   now              ${NOW.toISOString()}  (06:24 IST)`);
console.log(`   IST midnight     ${istMidnight.toISOString()}`);
check(
  istMidnight.toISOString() === "2026-07-21T18:30:00.000Z",
  `IST midnight should be 2026-07-21T18:30:00.000Z, got ${istMidnight.toISOString()}`
);
// An early-morning Indian reader must fall inside "today".
const earlyReader = new Date("2026-07-21T19:35:00Z"); // 01:05 IST, 22 Jul
check(earlyReader >= istMidnight, "01:05 IST reader must count as today");
// The UTC-day rule (the old behaviour) must NOT have counted them.
check(
  earlyReader.toISOString().slice(0, 10) !== NOW.toISOString().slice(0, 10),
  "fixture no longer reproduces the UTC-boundary defect"
);

console.log("\n2. Range resolution and comparison windows\n");
for (const key of RANGE_KEYS) {
  const range = resolveRange(key, NOW);
  const span = range.to.getTime() - range.from.getTime();
  const prevSpan = range.from.getTime() - range.previousFrom.getTime();
  console.log(
    `   ${key.padEnd(6)} days=${String(range.days).padStart(2)}  ` +
      `from=${range.from.toISOString()}  span=${(span / 3_600_000).toFixed(1)}h`
  );

  check(range.to.getTime() === NOW.getTime(), `${key}: window must end at now`);
  check(range.from < range.to, `${key}: from must precede to`);
  // The comparison window must be exactly as long as the selected one, and must
  // sit immediately before it -- otherwise "vs previous" compares unlike spans.
  check(
    Math.abs(prevSpan - span) < 1000,
    `${key}: comparison span ${prevSpan}ms != selected span ${span}ms`
  );
  check(range.previousFrom < range.from, `${key}: comparison window must precede selection`);
}

const today = resolveRange("today", NOW);
check(today.days === 1, "today must span 1 day");
check(
  today.from.toISOString() === istMidnight.toISOString(),
  "today must start at IST midnight"
);
const week = resolveRange("7d", NOW);
check(week.days === 7, "7d must span 7 days");

console.log("\n3. Metric contract (No data vs a measured zero)\n");
const noData = toMetric(0, 0, false);
console.log(`   no events at all -> value=${noData.value} (renders as "No data")`);
check(noData.value === null, "with no data the metric value must be null, not 0");
check(noData.changePct === null, "with no data there must be no percentage");

const measuredZero = toMetric(0, 5, true);
console.log(`   measured zero    -> value=${measuredZero.value} change=${measuredZero.changePct}%`);
check(measuredZero.value === 0, "a measured zero must stay 0, not become null");
check(measuredZero.changePct === -100, "0 after 5 must be -100%");

const fromNothing = toMetric(7, 0, true);
console.log(`   growth from zero -> value=${fromNothing.value} change=${fromNothing.changePct}`);
check(
  fromNothing.changePct === null,
  "growth from a zero baseline has no defensible percentage and must be null"
);

const doubled = toMetric(20, 10, true);
check(doubled.changePct === 100, "10 -> 20 must be +100%");

console.log("\n4. Range key validation\n");
check(isRangeKey("7d"), "'7d' must be a valid range");
check(!isRangeKey("all-time"), "'all-time' must be rejected");
check(!isRangeKey(undefined), "undefined must be rejected");
check(!isRangeKey("<script>"), "injected values must be rejected");
console.log("   valid keys accepted, unknown and hostile values rejected");

const invalid: unknown = "999d";
const fallback: RangeKey = isRangeKey(invalid) ? invalid : "7d";
check(fallback === "7d", "an unknown range must fall back to 7d");

if (failures.length) {
  console.error("\nFAIL");
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exitCode = 1;
} else {
  console.log("\nPASS — IST boundaries, like-for-like comparison windows, and the");
  console.log("No-data contract all behave as specified.");
}
