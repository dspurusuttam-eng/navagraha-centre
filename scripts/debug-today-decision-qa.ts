import assert from "node:assert/strict";

import {
  buildBestActionGuidance,
  buildTodayDecisionContext,
  buildTodayDecisionDisclaimer,
  computeCtaFlags,
  computeDecisionRating,
  todayDecisionCategories,
  validateTodayDecisionInput,
  type TodayDecisionCategory,
  type TodayDecisionRating,
} from "@/modules/astrology/today-decision";

// --- 1. Validation ----------------------------------------------------------

const validInput = validateTodayDecisionInput({
  latitude: 26.1445,
  longitude: 91.7362,
  timezone: "Asia/Kolkata",
  date: "2026-07-06",
  decisionCategory: "travel",
  locale: "en",
});
assert.equal(validInput.ok, true);
if (validInput.ok) {
  assert.equal(validInput.data.category, "travel");
  assert.equal(validInput.data.dateLocal, "2026-07-06");
  assert.equal(validInput.data.timezone, "Asia/Kolkata");
}

// Missing/invalid required fields
assert.equal(
  validateTodayDecisionInput({ longitude: 91, timezone: "Asia/Kolkata" }).ok,
  false
);
assert.equal(
  validateTodayDecisionInput({ latitude: 200, longitude: 91, timezone: "Asia/Kolkata" }).ok,
  false
);
assert.equal(
  validateTodayDecisionInput({ latitude: 26, longitude: 400, timezone: "Asia/Kolkata" }).ok,
  false
);
assert.equal(
  validateTodayDecisionInput({ latitude: 26, longitude: 91, timezone: "Not/AZone" }).ok,
  false
);
assert.equal(
  validateTodayDecisionInput({ latitude: 26, longitude: 91 }).ok,
  false
);
assert.equal(
  validateTodayDecisionInput({
    latitude: 26,
    longitude: 91,
    timezone: "Asia/Kolkata",
    date: "06-07-2026",
  }).ok,
  false
);
assert.equal(
  validateTodayDecisionInput({
    latitude: 26,
    longitude: 91,
    timezone: "Asia/Kolkata",
    decisionCategory: "gambling",
  }).ok,
  false
);

// Defaults: no date -> today in tz; no category -> general
const defaulted = validateTodayDecisionInput({
  latitude: 26,
  longitude: 91,
  timezone: "Asia/Kolkata",
});
assert.equal(defaulted.ok, true);
if (defaulted.ok) {
  assert.match(defaulted.data.dateLocal, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(defaulted.data.category, "general");
  assert.equal(defaulted.data.locale, "en");
}

// String-numeric coordinates accepted
const stringCoords = validateTodayDecisionInput({
  latitude: "26.14",
  longitude: "91.73",
  timezone: "Asia/Kolkata",
});
assert.equal(stringCoords.ok, true);

// --- 2. Decision rating matrix (pure) ---------------------------------------

const sensitive: TodayDecisionCategory[] = [
  "travel",
  "purchase",
  "business",
  "career",
  "family",
];
const light: TodayDecisionCategory[] = ["general", "puja"];

for (const category of todayDecisionCategories) {
  assert.equal(
    computeDecisionRating({ dailyTone: "Supportive", category }),
    "favourable"
  );
  assert.equal(
    computeDecisionRating({ dailyTone: "Balanced", category }),
    "mixed"
  );
}
for (const category of sensitive) {
  assert.equal(
    computeDecisionRating({ dailyTone: "Reflective", category }),
    "consult_recommended"
  );
}
for (const category of light) {
  assert.equal(
    computeDecisionRating({ dailyTone: "Reflective", category }),
    "avoid_for_now"
  );
}

// --- 3. CTA flags (pure) ----------------------------------------------------

// askNI always true
for (const category of todayDecisionCategories) {
  for (const rating of [
    "favourable",
    "mixed",
    "avoid_for_now",
    "consult_recommended",
  ] as TodayDecisionRating[]) {
    const flags = computeCtaFlags({ rating, category });
    assert.equal(flags.askNI, true, "askNI must always be true");
    assert.equal(typeof flags.consultAcharya, "boolean");
    assert.equal(typeof flags.downloadReport, "boolean");
    assert.equal(typeof flags.bookPurohit, "boolean");
  }
}
// puja -> bookPurohit true
assert.equal(
  computeCtaFlags({ rating: "favourable", category: "puja" }).bookPurohit,
  true
);
// consult_recommended -> consultAcharya + bookPurohit true
const consultFlags = computeCtaFlags({
  rating: "consult_recommended",
  category: "business",
});
assert.equal(consultFlags.consultAcharya, true);
assert.equal(consultFlags.bookPurohit, true);
assert.equal(consultFlags.downloadReport, true);
// general favourable -> consultAcharya false, downloadReport false
const generalFlags = computeCtaFlags({ rating: "favourable", category: "general" });
assert.equal(generalFlags.consultAcharya, false);
assert.equal(generalFlags.downloadReport, false);

// --- 4. Guidance + disclaimer safety wording --------------------------------

const guidance = buildBestActionGuidance({
  category: "business",
  rating: "consult_recommended",
  goodBlockLabels: ["Abhijit Muhurta: 11:40 AM - 12:28 PM"],
  avoidBlockLabels: ["Rahu Kaal: 09:00 AM - 10:30 AM"],
});
assert.ok(guidance.length >= 2);
const guidanceText = guidance.join(" ").toLowerCase();
assert.ok(guidanceText.includes("consult"), "sensitive caution should suggest consult");
// No unsafe / guaranteed wording anywhere in generated guidance
const forbidden = [
  "guaranteed",
  "100%",
  "will definitely",
  "certain to",
  "cure",
  "never fail",
];
for (const category of todayDecisionCategories) {
  for (const rating of [
    "favourable",
    "mixed",
    "avoid_for_now",
    "consult_recommended",
  ] as TodayDecisionRating[]) {
    const text = buildBestActionGuidance({
      category,
      rating,
      goodBlockLabels: ["Abhijit Muhurta: 11:40 AM - 12:28 PM"],
      avoidBlockLabels: ["Rahu Kaal: 09:00 AM - 10:30 AM"],
    })
      .join(" ")
      .toLowerCase();
    for (const term of forbidden) {
      assert.ok(!text.includes(term), `guidance must not contain "${term}"`);
    }
  }
}

const disclaimer = buildTodayDecisionDisclaimer("en");
assert.ok(disclaimer.toLowerCase().includes("consult"));
assert.ok(disclaimer.length > 40);

// --- 5. Live engine check (best-effort; skips if ephemeris unavailable) ------

let liveStatus = "not-run";
const live = buildTodayDecisionContext({
  dateLocal: "2026-07-06",
  latitude: 26.1445,
  longitude: 91.7362,
  timezone: "Asia/Kolkata",
  category: "travel",
  locale: "en",
  locationLabel: "Guwahati, Assam, India",
});

if (live.success) {
  liveStatus = "ran";
  const d = live.data;
  assert.equal(d.panchang.available, true);
  assert.ok(d.rahuKaal.start_local_time && d.rahuKaal.end_local_time);
  assert.ok(d.yamaganda.start_local_time && d.gulika.start_local_time);
  assert.equal(d.hora.available, false);
  assert.equal(d.hora.current, null);
  assert.ok(d.goodTimeBlocks.length >= 1);
  assert.equal(d.avoidTimeBlocks.length, 3);
  assert.ok(
    ["favourable", "mixed", "avoid_for_now", "consult_recommended"].includes(
      d.decisionRating
    )
  );
  assert.equal(d.ctaFlags.askNI, true);
  assert.ok(d.disclaimer.length > 40);
} else if (
  live.error.code === "PANCHANG_CALCULATION_FAILED" &&
  /Swiss Ephemeris/i.test(live.error.message)
) {
  liveStatus = "skipped (swisseph unavailable in this environment)";
} else {
  throw new Error(
    `Live engine check failed unexpectedly: ${live.error.code} - ${live.error.message}`
  );
}

console.log(
  `today-decision QA: validation + decision-layer checks passed. Live engine: ${liveStatus}.`
);
