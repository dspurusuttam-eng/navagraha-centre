import assert from "node:assert/strict";
import {
  buildKundliSignInHref,
  claimPendingKundliRequest,
  clearPendingKundliDraft,
  createPendingKundliDraft,
  pendingKundliDraftKey,
  readPendingKundliDraft,
  releasePendingKundliRequest,
  resolveKundliGenerateAction,
  storePendingKundliDraft,
  validatePendingKundliDraft,
  type KundliRequestPayload,
  type StorageLike,
} from "../src/lib/kundli/pending-kundli-draft";
import { resolveTrustedOriginsForAuth } from "../src/lib/auth";

class MemoryStorage implements StorageLike {
  private readonly data = new Map<string, string>();

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }

  removeItem(key: string) {
    this.data.delete(key);
  }
}

const now = Date.UTC(2026, 6, 10, 8, 0, 0);
const payload: KundliRequestPayload = {
  name: "QA Person",
  dateLocal: "1990-01-15",
  timeLocal: "10:30",
  gender: "Female",
  chartStyle: "North",
  language: "EN",
  location: {
    displayName: "Guwahati, Assam, India",
    city: "Guwahati",
    district: "Kamrup Metropolitan",
    state: "Assam",
    country: "India",
    countryCode: "IN",
    latitude: 26.1445,
    longitude: 91.7362,
    timezone: "Asia/Kolkata",
    utcOffsetMinutes: 330,
    localDateTime: "1990-01-15T10:30:00",
    utcDateTime: "1990-01-15T05:00:00.000Z",
    locationSource: "search",
    accuracyMeters: null,
    timezoneResolution: "coordinate",
  },
};

const draft = createPendingKundliDraft(payload, {
  now,
  requestId: "qa-request-0001",
});
assert.equal(validatePendingKundliDraft(draft, now).status, "ready");
assert.equal(draft.payload.timeLocal, "10:30");
assert.equal(draft.payload.location.locationSource, "search");

const manualDraft = createPendingKundliDraft(
  {
    ...payload,
    location: {
      ...payload.location,
      locationSource: "manual",
      timezoneResolution: "manual",
    },
  },
  { now, requestId: "qa-request-manual" }
);
assert.equal(validatePendingKundliDraft(manualDraft, now).status, "ready");
assert.equal(manualDraft.payload.location.latitude, payload.location.latitude);
assert.equal(manualDraft.payload.location.timezone, "Asia/Kolkata");

const expired = validatePendingKundliDraft(draft, now + 30 * 60 * 1_000);
assert.equal(expired.status, "expired");

assert.equal(
  validatePendingKundliDraft({ ...draft, version: 2 }, now).status,
  "invalid"
);
assert.equal(
  validatePendingKundliDraft(
    {
      ...draft,
      payload: {
        ...payload,
        location: { ...payload.location, utcDateTime: new Date().toISOString() },
      },
    },
    now
  ).status,
  "invalid"
);

const storage = new MemoryStorage();
storePendingKundliDraft(storage, draft);
assert.deepEqual(readPendingKundliDraft(storage, now), {
  status: "ready",
  draft,
});
assert.equal(claimPendingKundliRequest(storage, draft.requestId, now), true);
assert.equal(claimPendingKundliRequest(storage, draft.requestId, now + 1), false);
releasePendingKundliRequest(storage);
assert.equal(claimPendingKundliRequest(storage, draft.requestId, now + 2), true);
clearPendingKundliDraft(storage);
assert.equal(storage.getItem(pendingKundliDraftKey), null);
assert.equal(readPendingKundliDraft(storage, now).status, "missing");

const signInHref = buildKundliSignInHref();
assert.equal(
  signInHref,
  "/sign-in?intent=generate-kundli&next=%2Fkundli%3Fresume%3D1"
);
for (const sensitiveValue of [
  payload.name,
  payload.dateLocal,
  payload.timeLocal,
  String(payload.location.latitude),
  payload.location.timezone,
]) {
  assert.equal(signInHref.includes(sensitiveValue), false);
}
assert.throws(() =>
  buildKundliSignInHref({ callbackPath: "https://example.com/steal" })
);
assert.throws(() => buildKundliSignInHref({ callbackPath: "//example.com" }));

const previewTrustedOrigins = resolveTrustedOriginsForAuth({
  VERCEL: "1",
  VERCEL_ENV: "preview",
  VERCEL_URL:
    "navagraha-centre-git-fix-kun-415795-dspurusuttam-7119s-projects.vercel.app",
  VERCEL_BRANCH_URL:
    "navagraha-centre-git-fix-kun-415795-dspurusuttam-7119s-projects.vercel.app",
  VERCEL_PROJECT_PRODUCTION_URL: "www.navagrahacentre.com",
  BETTER_AUTH_URL: "https://www.navagrahacentre.com",
  NEXT_PUBLIC_SITE_URL: "https://www.navagrahacentre.com",
});
assert.ok(
  previewTrustedOrigins.includes(
    "https://navagraha-centre-git-fix-kun-415795-dspurusuttam-7119s-projects.vercel.app"
  )
);
assert.equal(
  previewTrustedOrigins.some((origin) => origin.includes("*")),
  false
);

assert.equal(
  resolveKundliGenerateAction({
    isAuthenticated: true,
    hasValidPayload: true,
    hasSessionStorage: false,
  }),
  "generate"
);
assert.equal(
  resolveKundliGenerateAction({
    isAuthenticated: false,
    hasValidPayload: true,
    hasSessionStorage: true,
  }),
  "sign-in"
);
assert.equal(
  resolveKundliGenerateAction({
    isAuthenticated: false,
    hasValidPayload: false,
    hasSessionStorage: true,
  }),
  "validation-error"
);
assert.equal(
  resolveKundliGenerateAction({
    isAuthenticated: false,
    hasValidPayload: true,
    hasSessionStorage: false,
  }),
  "storage-error"
);

console.log("Kundli auth-resume deterministic QA passed.");
