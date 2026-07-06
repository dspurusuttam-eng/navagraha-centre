import assert from "node:assert/strict";

import {
  decisionDeskErrorStatus,
  decisionRecordRatings,
  decisionRecordStatuses,
  validateDecisionRecordListQuery,
  validateDecisionRecordWriteInput,
} from "@/modules/decision-desk/validation";

function expectField(
  result: ReturnType<typeof validateDecisionRecordWriteInput>,
  field: string
) {
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error.code, "INVALID_INPUT");
    const details = result.error.details as { fieldErrors: Record<string, string> };
    assert.ok(
      details.fieldErrors[field],
      `expected field error "${field}", got ${JSON.stringify(details.fieldErrors)}`
    );
  }
}

// 1. Valid create
const validCreate = validateDecisionRecordWriteInput(
  {
    title: "  Sign the lease  ",
    decisionCategory: "purchase",
    date: "2026-07-06",
    timezone: "Asia/Kolkata",
    latitude: 26.1445,
    longitude: 91.7362,
    decisionRating: "favourable",
    status: "planned",
    locationLabel: "Guwahati",
    panchangSnapshot: { tithi: "Shashthi" },
    goodTimeBlocks: [{ label: "Abhijit" }],
    avoidTimeBlocks: [{ label: "Rahu Kaal" }],
    horaAvailable: false,
    userNote: "morning preferred",
    followUpDate: "2026-07-10",
  },
  "create"
);
assert.equal(validCreate.ok, true);
if (validCreate.ok) {
  assert.equal(validCreate.data.title, "Sign the lease");
  assert.equal(validCreate.data.decisionCategory, "purchase");
  assert.equal(validCreate.data.status, "planned");
  assert.equal(validCreate.data.decisionRating, "favourable");
  assert.equal(validCreate.data.latitude, 26.1445);
}

// 2. Missing required create fields
expectField(validateDecisionRecordWriteInput({}, "create"), "title");
expectField(validateDecisionRecordWriteInput({}, "create"), "decisionCategory");
expectField(validateDecisionRecordWriteInput({}, "create"), "date");
expectField(validateDecisionRecordWriteInput({}, "create"), "timezone");
expectField(validateDecisionRecordWriteInput({ title: "x", decisionCategory: "general", date: "2026-07-06", timezone: "Asia/Kolkata" }, "create"), "latitude");

// 3. Invalid enums / values
expectField(
  validateDecisionRecordWriteInput(
    { title: "x", decisionCategory: "gambling", date: "2026-07-06", timezone: "Asia/Kolkata", latitude: 1, longitude: 1 },
    "create"
  ),
  "decisionCategory"
);
expectField(
  validateDecisionRecordWriteInput(
    { title: "x", decisionCategory: "general", date: "2026-13-40", timezone: "Asia/Kolkata", latitude: 1, longitude: 1 },
    "create"
  ),
  "date"
);
expectField(
  validateDecisionRecordWriteInput(
    { title: "x", decisionCategory: "general", date: "2026-07-06", timezone: "Not/AZone", latitude: 1, longitude: 1 },
    "create"
  ),
  "timezone"
);
expectField(
  validateDecisionRecordWriteInput(
    { title: "x", decisionCategory: "general", date: "2026-07-06", timezone: "Asia/Kolkata", latitude: 999, longitude: 1 },
    "create"
  ),
  "latitude"
);
expectField(
  validateDecisionRecordWriteInput({ status: "maybe" }, "update"),
  "status"
);
expectField(
  validateDecisionRecordWriteInput({ decisionRating: "great" }, "update"),
  "decisionRating"
);
expectField(
  validateDecisionRecordWriteInput({ goodTimeBlocks: "notarray" }, "update"),
  "goodTimeBlocks"
);
expectField(
  validateDecisionRecordWriteInput({ panchangSnapshot: [1, 2, 3] }, "update"),
  "panchangSnapshot"
);
expectField(
  validateDecisionRecordWriteInput({ horaAvailable: "yes" }, "update"),
  "horaAvailable"
);
expectField(
  validateDecisionRecordWriteInput({ followUpDate: "2026/07/10" }, "update"),
  "followUpDate"
);

// 4. Update partial: single field OK; unknown-only body -> still ok object but empty (service enforces EMPTY_UPDATE)
const partial = validateDecisionRecordWriteInput({ status: "done", outcomeNote: "went well" }, "update");
assert.equal(partial.ok, true);
if (partial.ok) {
  assert.equal(partial.data.status, "done");
  assert.equal(partial.data.outcomeNote, "went well");
}
const emptyish = validateDecisionRecordWriteInput({ unknownField: 1 }, "update");
assert.equal(emptyish.ok, true);
if (emptyish.ok) {
  assert.equal(Object.keys(emptyish.data).length, 0, "unknown fields are dropped");
}

// 5. Nullable clears
const nulls = validateDecisionRecordWriteInput(
  { decisionRating: null, locationLabel: null, userNote: null, followUpDate: null },
  "update"
);
assert.equal(nulls.ok, true);
if (nulls.ok) {
  assert.equal(nulls.data.decisionRating, null);
  assert.equal(nulls.data.locationLabel, null);
  assert.equal(nulls.data.followUpDate, null);
}

// 6. List query validation
const q1 = validateDecisionRecordListQuery(new URLSearchParams(""));
assert.equal(q1.ok, true);
if (q1.ok) {
  assert.equal(q1.data.page, 1);
  assert.equal(q1.data.pageSize, 20);
  assert.equal(q1.data.status, null);
  assert.equal(q1.data.decisionCategory, null);
}
const q2 = validateDecisionRecordListQuery(
  new URLSearchParams("page=2&pageSize=10&status=done&decisionCategory=travel")
);
assert.equal(q2.ok, true);
if (q2.ok) {
  assert.equal(q2.data.page, 2);
  assert.equal(q2.data.pageSize, 10);
  assert.equal(q2.data.status, "done");
  assert.equal(q2.data.decisionCategory, "travel");
}
assert.equal(validateDecisionRecordListQuery(new URLSearchParams("page=0")).ok, false);
assert.equal(validateDecisionRecordListQuery(new URLSearchParams("pageSize=999")).ok, false);
assert.equal(validateDecisionRecordListQuery(new URLSearchParams("status=nope")).ok, false);
assert.equal(
  validateDecisionRecordListQuery(new URLSearchParams("decisionCategory=nope")).ok,
  false
);

// 7. Error-code -> HTTP status mapping
assert.equal(decisionDeskErrorStatus("INVALID_INPUT"), 422);
assert.equal(decisionDeskErrorStatus("NOT_FOUND"), 404);
assert.equal(decisionDeskErrorStatus("EMPTY_UPDATE"), 400);
assert.equal(decisionDeskErrorStatus("INVALID_REQUEST"), 400);

// 8. Enum surfaces are as contracted
assert.deepEqual([...decisionRecordStatuses], ["planned", "done", "skipped"]);
assert.deepEqual(
  [...decisionRecordRatings],
  ["favourable", "mixed", "avoid_for_now", "consult_recommended"]
);

console.log("decision-desk QA: validation, list-query, mapping, and enum checks passed.");
