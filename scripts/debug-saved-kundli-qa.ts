import assert from "node:assert/strict";

import {
  parseManualPlaceText,
  savedKundliErrorStatus,
  validateSavedKundliWriteInput,
} from "@/modules/account/saved-kundli-validation";

function expectFieldError(
  result: ReturnType<typeof validateSavedKundliWriteInput>,
  field: string
) {
  assert.equal(result.success, false);

  if (!result.success) {
    assert.equal(result.error.code, "INVALID_BIRTH_INPUT");
    const details = result.error.details as { fieldErrors: Record<string, string> };
    assert.ok(
      details.fieldErrors[field],
      `expected field error for "${field}", got: ${JSON.stringify(details.fieldErrors)}`
    );
  }
}

// 1. Valid create input passes and is normalized.
const validCreate = validateSavedKundliWriteInput(
  {
    label: "  Mother  ",
    gender: "female",
    dateOfBirth: "1968-03-14",
    timeOfBirth: "06:45",
    birthPlace: "Guwahati, Assam, India",
    notes: "Family record",
  },
  "create"
);

assert.equal(validCreate.success, true);

if (validCreate.success) {
  assert.equal(validCreate.data.label, "Mother");
  assert.equal(validCreate.data.gender, "female");
  assert.equal(validCreate.data.dateOfBirth, "1968-03-14");
  assert.equal(validCreate.data.timeOfBirth, "06:45");
}

// 2. Create without required fields fails per-field.
const missingCreate = validateSavedKundliWriteInput({}, "create");

expectFieldError(missingCreate, "label");
expectFieldError(missingCreate, "dateOfBirth");
expectFieldError(missingCreate, "birthPlace");

// 3. Future date of birth is rejected.
expectFieldError(
  validateSavedKundliWriteInput(
    {
      label: "Test",
      dateOfBirth: "2999-01-01",
      birthPlace: "Guwahati, India",
    },
    "create"
  ),
  "dateOfBirth"
);

// 4. Invalid calendar date is rejected.
expectFieldError(
  validateSavedKundliWriteInput(
    {
      label: "Test",
      dateOfBirth: "1990-02-30",
      birthPlace: "Guwahati, India",
    },
    "create"
  ),
  "dateOfBirth"
);

// 5. Unknown birth time (null / empty) is accepted as null.
const nullTime = validateSavedKundliWriteInput(
  {
    label: "Test",
    dateOfBirth: "1990-01-01",
    timeOfBirth: null,
    birthPlace: "Guwahati, India",
  },
  "create"
);

assert.equal(nullTime.success, true);

if (nullTime.success) {
  assert.equal(nullTime.data.timeOfBirth, null);
}

// 6. Malformed time is rejected.
expectFieldError(
  validateSavedKundliWriteInput(
    {
      label: "Test",
      dateOfBirth: "1990-01-01",
      timeOfBirth: "25:99",
      birthPlace: "Guwahati, India",
    },
    "create"
  ),
  "timeOfBirth"
);

// 7. Manual coordinates require the full trio (lat + lng + timezone).
expectFieldError(
  validateSavedKundliWriteInput(
    {
      label: "Test",
      dateOfBirth: "1990-01-01",
      birthPlace: "Guwahati, India",
      latitude: 26.14,
    },
    "create"
  ),
  "coordinates"
);

const fullManual = validateSavedKundliWriteInput(
  {
    label: "Test",
    dateOfBirth: "1990-01-01",
    birthPlace: "Guwahati, Assam, India",
    latitude: 26.1445,
    longitude: 91.7362,
    timezone: "Asia/Kolkata",
  },
  "create"
);

assert.equal(fullManual.success, true);

// 8. Out-of-range coordinates and invalid timezone are rejected.
expectFieldError(
  validateSavedKundliWriteInput(
    {
      label: "Test",
      dateOfBirth: "1990-01-01",
      birthPlace: "Guwahati, India",
      latitude: 91,
      longitude: 91.73,
      timezone: "Asia/Kolkata",
    },
    "create"
  ),
  "latitude"
);

expectFieldError(
  validateSavedKundliWriteInput(
    {
      label: "Test",
      dateOfBirth: "1990-01-01",
      birthPlace: "Guwahati, India",
      latitude: 26.14,
      longitude: 91.73,
      timezone: "Not/AZone",
    },
    "create"
  ),
  "timezone"
);

// 9. Gender enum is enforced.
expectFieldError(
  validateSavedKundliWriteInput(
    {
      label: "Test",
      dateOfBirth: "1990-01-01",
      birthPlace: "Guwahati, India",
      gender: "unknown-value",
    },
    "create"
  ),
  "gender"
);

// 10. Update mode allows partial payloads (label only).
const partialUpdate = validateSavedKundliWriteInput({ label: "Renamed" }, "update");

assert.equal(partialUpdate.success, true);

if (partialUpdate.success) {
  assert.deepEqual(Object.keys(partialUpdate.data), ["label"]);
}

// 11. Update mode still rejects invalid provided values.
expectFieldError(
  validateSavedKundliWriteInput({ dateOfBirth: "31-12-1990x" }, "update"),
  "dateOfBirth"
);

// 12. Oversized label and notes are rejected.
expectFieldError(
  validateSavedKundliWriteInput(
    {
      label: "x".repeat(81),
      dateOfBirth: "1990-01-01",
      birthPlace: "Guwahati, India",
    },
    "create"
  ),
  "label"
);

expectFieldError(
  validateSavedKundliWriteInput(
    {
      label: "Test",
      dateOfBirth: "1990-01-01",
      birthPlace: "Guwahati, India",
      notes: "x".repeat(501),
    },
    "create"
  ),
  "notes"
);

// 13. Error-code to HTTP status mapping is stable.
assert.equal(savedKundliErrorStatus("INVALID_BIRTH_INPUT"), 422);
assert.equal(savedKundliErrorStatus("GEOCODING_FAILED"), 422);
assert.equal(savedKundliErrorStatus("LIMIT_REACHED"), 409);
assert.equal(savedKundliErrorStatus("PRIMARY_EDIT_VIA_ONBOARDING"), 409);
assert.equal(savedKundliErrorStatus("CANNOT_DELETE_PRIMARY"), 409);
assert.equal(savedKundliErrorStatus("NOT_FOUND"), 404);
assert.equal(savedKundliErrorStatus("EMPTY_UPDATE"), 400);

// 14. Manual place text parsing.
assert.deepEqual(parseManualPlaceText("Guwahati, Assam, India"), {
  city: "Guwahati",
  region: "Assam",
  country: "India",
});
assert.deepEqual(parseManualPlaceText("Guwahati, India"), {
  city: "Guwahati",
  region: null,
  country: "India",
});
assert.deepEqual(parseManualPlaceText("Guwahati"), {
  city: "Guwahati",
  region: null,
  country: "Guwahati",
});
assert.equal(parseManualPlaceText("  ,  "), null);

console.log("saved-kundli QA: all validation and contract checks passed.");
