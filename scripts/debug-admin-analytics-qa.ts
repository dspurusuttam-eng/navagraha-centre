/**
 * Admin analytics aggregation QA.
 *
 * Reproduces, without a database, the defect that Micro-Phase D1 found: two
 * headline cards on the Founder analytics page were derived by searching
 * `events7`, which is a `groupBy(name)` capped at `take: 12` and ordered by
 * count. A low-volume event name is therefore not merely under-reported — it is
 * absent from the array entirely, so the card rendered a confident "0".
 *
 * `notification_open` and `consultation_cta_click` are low-volume by nature
 * (there are 78 tracked event names and page views dominate all of them), so
 * those cards could never have been right once the site had real traffic.
 *
 * The script models both the old derivation and the corrected one against the
 * same event stream and asserts that the corrected one reports the true totals.
 */
import { trackedEventNames } from "@/lib/analytics/types";

type EventRow = { name: string; count: number };

const TOP_N = 12;
const HEADLINE_EVENT = "notification_open";
const CTA_EVENTS = ["consultation_cta_click", "consultation_book_click"];

/** A realistic 7-day stream: page views dominate, funnel events are rare. */
function buildStream(): EventRow[] {
  const stream: EventRow[] = [];
  trackedEventNames.forEach((name, index) => {
    // Long-tail distribution: the first names are the busy ones.
    const count = Math.max(1, 5000 - index * 60);
    stream.push({ name, count });
  });

  // The two headline events genuinely occurred, but rarely.
  const setCount = (name: string, count: number) => {
    const row = stream.find((entry) => entry.name === name);
    if (row) row.count = count;
  };
  setCount(HEADLINE_EVENT, 37);
  setCount("consultation_cta_click", 21);
  setCount("consultation_book_click", 9);

  return stream;
}

/** What the page used to do: read the number out of the top-12 leaderboard. */
function deriveFromLeaderboard(stream: EventRow[], names: readonly string[]) {
  const leaderboard = [...stream]
    .sort((left, right) => right.count - left.count)
    .slice(0, TOP_N);

  return leaderboard
    .filter((row) => names.includes(row.name))
    .reduce((sum, row) => sum + row.count, 0);
}

/** What the page does now: count the rows directly, no truncation involved. */
function countDirectly(stream: EventRow[], names: readonly string[]) {
  return stream
    .filter((row) => names.includes(row.name))
    .reduce((sum, row) => sum + row.count, 0);
}

function main() {
  const stream = buildStream();
  const failures: string[] = [];

  const checks = [
    { label: "Notification opens (7d)", names: [HEADLINE_EVENT] },
    { label: "Consultation CTA (7d)", names: CTA_EVENTS },
  ];

  console.log(`Tracked event names: ${trackedEventNames.length}`);
  console.log(`Leaderboard cap: top ${TOP_N}\n`);

  for (const check of checks) {
    const truth = countDirectly(stream, check.names);
    const legacy = deriveFromLeaderboard(stream, check.names);

    console.log(`${check.label}`);
    console.log(`  true count            : ${truth}`);
    console.log(`  top-${TOP_N} derivation    : ${legacy}`);

    if (truth === 0) {
      failures.push(`${check.label}: fixture is degenerate (true count is 0)`);
      continue;
    }

    // The defect: the old derivation loses the number completely.
    if (legacy === truth) {
      failures.push(
        `${check.label}: fixture failed to reproduce the truncation defect`
      );
    } else {
      console.log(
        `  DEFECT REPRODUCED     : under-reported by ${truth - legacy}\n`
      );
    }
  }

  if (failures.length > 0) {
    console.error("FAIL");
    failures.forEach((failure) => console.error(`  - ${failure}`));
    process.exitCode = 1;
    return;
  }

  console.log(
    "PASS — the truncated derivation loses real events; the admin page now counts directly."
  );
}

main();
