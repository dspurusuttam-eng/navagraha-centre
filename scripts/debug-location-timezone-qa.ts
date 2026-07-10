import assert from "node:assert/strict";

import {
  resolveCivilTimeToUtc,
  type CivilTimeDisambiguation,
} from "@/lib/location-timezone/civil-time";
import { resolveCanonicalLocationDateTime } from "@/lib/location-timezone/resolver";
import type {
  LocationProvider,
  LocationSearchResult,
  LocationTimezoneIssue,
  LocationTimezoneResult,
  ProviderPlaceCandidate,
} from "@/lib/location-timezone/types";

function failIssue(
  code: LocationTimezoneIssue["code"],
  message: string = code
): LocationTimezoneResult<never> {
  return {
    success: false,
    issue: { code, message },
  };
}

function assertCivilOffset(input: {
  label: string;
  dateLocal: string;
  timeLocal: string;
  timeZone: string;
  expectedOffsetMinutes: number;
  disambiguation?: CivilTimeDisambiguation;
}) {
  const result = resolveCivilTimeToUtc({
    dateLocal: input.dateLocal,
    timeLocal: input.timeLocal,
    timeZone: input.timeZone,
    disambiguation: input.disambiguation,
  });

  assert.equal(result.success, true, input.label);
  if (result.success) {
    assert.equal(
      result.data.utcOffsetMinutes,
      input.expectedOffsetMinutes,
      input.label
    );
    assert.equal(result.data.localDateTime, `${input.dateLocal}T${input.timeLocal}:00`);
  }
}

function assertCivilIssue(input: {
  label: string;
  dateLocal: string;
  timeLocal: string;
  timeZone: string;
  expectedCode: LocationTimezoneIssue["code"];
}) {
  const result = resolveCivilTimeToUtc({
    dateLocal: input.dateLocal,
    timeLocal: input.timeLocal,
    timeZone: input.timeZone,
  });

  assert.equal(result.success, false, input.label);
  if (!result.success) {
    assert.equal(result.issue.code, input.expectedCode, input.label);
  }
}

const guwahatiPlace: ProviderPlaceCandidate = {
  id: "guwahati",
  displayName: "Guwahati, Kamrup Metropolitan, Assam, India",
  city: "Guwahati",
  district: "Kamrup Metropolitan",
  state: "Assam",
  country: "India",
  countryCode: "IN",
  latitude: 26.1445,
  longitude: 91.7362,
  timezone: "Asia/Kolkata",
  provider: "qa",
  timezoneResolution: "provider",
};

function makeProvider(options: {
  searchResults?: LocationSearchResult[];
  reverseResult?: ProviderPlaceCandidate | null;
  timezone?: string | null;
  timezoneFailure?: LocationTimezoneIssue["code"];
} = {}): LocationProvider {
  return {
    async searchPlaces() {
      return {
        success: true,
        data: options.searchResults ?? [guwahatiPlace],
      };
    },
    async reverseGeocode() {
      if (options.reverseResult === null) {
        return failIssue(
          "PLACE_NOT_FOUND",
          "Detected coordinates could not be converted into a readable place."
        );
      }

      return {
        success: true,
        data: options.reverseResult ?? guwahatiPlace,
      };
    },
    async resolveTimezone(input) {
      if (options.timezoneFailure) {
        return failIssue(options.timezoneFailure, "Timezone lookup failed.");
      }

      const timezone = options.timezone ?? input.providerTimezone ?? "Asia/Kolkata";

      return {
        success: true,
        data: {
          timezone,
          resolution: input.providerTimezone ? "provider" : "coordinate",
        },
      };
    },
  };
}

// Civil-time and historical UTC offset coverage.
assertCivilOffset({
  label: "India has no DST at birth time",
  dateLocal: "1990-01-15",
  timeLocal: "12:00",
  timeZone: "Asia/Kolkata",
  expectedOffsetMinutes: 330,
});
assertCivilOffset({
  label: "New York summer DST offset",
  dateLocal: "2020-07-01",
  timeLocal: "12:00",
  timeZone: "America/New_York",
  expectedOffsetMinutes: -240,
});
assertCivilOffset({
  label: "New York winter standard offset",
  dateLocal: "2020-01-01",
  timeLocal: "12:00",
  timeZone: "America/New_York",
  expectedOffsetMinutes: -300,
});
assertCivilIssue({
  label: "London spring-forward nonexistent local time",
  dateLocal: "2024-03-31",
  timeLocal: "01:30",
  timeZone: "Europe/London",
  expectedCode: "LOCAL_TIME_NONEXISTENT",
});
assertCivilIssue({
  label: "London fall-back ambiguous local time",
  dateLocal: "2024-10-27",
  timeLocal: "01:30",
  timeZone: "Europe/London",
  expectedCode: "LOCAL_TIME_AMBIGUOUS",
});
assertCivilOffset({
  label: "London fall-back earlier occurrence",
  dateLocal: "2024-10-27",
  timeLocal: "01:30",
  timeZone: "Europe/London",
  disambiguation: "earlier",
  expectedOffsetMinutes: 60,
});
assertCivilOffset({
  label: "London fall-back later occurrence",
  dateLocal: "2024-10-27",
  timeLocal: "01:30",
  timeZone: "Europe/London",
  disambiguation: "later",
  expectedOffsetMinutes: 0,
});
assertCivilOffset({
  label: "Nepal quarter-hour base offset",
  dateLocal: "2024-02-01",
  timeLocal: "08:15",
  timeZone: "Asia/Kathmandu",
  expectedOffsetMinutes: 345,
});
assertCivilOffset({
  label: "Adelaide half-hour DST offset",
  dateLocal: "2024-01-15",
  timeLocal: "12:00",
  timeZone: "Australia/Adelaide",
  expectedOffsetMinutes: 630,
});
assertCivilOffset({
  label: "Chatham quarter-hour DST offset",
  dateLocal: "2024-01-15",
  timeLocal: "12:00",
  timeZone: "Pacific/Chatham",
  expectedOffsetMinutes: 825,
});
assertCivilIssue({
  label: "New York spring-forward nonexistent local time",
  dateLocal: "2024-03-10",
  timeLocal: "02:30",
  timeZone: "America/New_York",
  expectedCode: "LOCAL_TIME_NONEXISTENT",
});
assertCivilIssue({
  label: "New York fall-back ambiguous local time",
  dateLocal: "2024-11-03",
  timeLocal: "01:30",
  timeZone: "America/New_York",
  expectedCode: "LOCAL_TIME_AMBIGUOUS",
});

async function main() {
  // Canonical contract paths with injected providers, no external network.
  {
    const provider = makeProvider();
    const search = await provider.searchPlaces("Guwahati, Assam");
    assert.equal(search.success, true);
    if (search.success) {
      assert.equal(search.data.length, 1);
    }
  }

  {
    const result = await resolveCanonicalLocationDateTime({
      source: "search",
      dateLocal: "1990-01-15",
      timeLocal: "12:00",
      place: guwahatiPlace,
      provider: makeProvider(),
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.locationSource, "search");
      assert.equal(result.data.timezoneResolution, "provider");
      assert.equal(result.data.utcOffsetMinutes, 330);
      assert.equal(result.data.countryCode, "IN");
    }
  }

  {
    const result = await resolveCanonicalLocationDateTime({
      source: "browser",
      dateLocal: "1990-01-15",
      timeLocal: "12:00",
      latitude: 26.1445,
      longitude: 91.7362,
      accuracyMeters: 25,
      provider: makeProvider({
        reverseResult: {
          ...guwahatiPlace,
          timezone: null,
          timezoneResolution: "coordinate",
        },
      }),
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.locationSource, "browser");
      assert.equal(result.data.accuracyMeters, 25);
      assert.equal(result.data.timezoneResolution, "coordinate");
    }
  }

  {
    const result = await resolveCanonicalLocationDateTime({
      source: "manual",
      dateLocal: "1990-01-15",
      timeLocal: "12:00",
      displayName: "Manual Guwahati",
      country: "India",
      countryCode: "IN",
      latitude: "26.1445",
      longitude: "91.7362",
      timezone: "Asia/Kolkata",
      provider: makeProvider(),
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.locationSource, "manual");
      assert.equal(result.data.timezoneResolution, "manual");
      assert.equal(result.data.utcOffsetMinutes, 330);
    }
  }

  {
    const result = await resolveCanonicalLocationDateTime({
      source: "manual",
      dateLocal: "1990-01-15",
      timeLocal: "12:00",
      country: "India",
      latitude: 200,
      longitude: 91.7362,
      timezone: "Asia/Kolkata",
      provider: makeProvider(),
    });
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.issue.code, "INVALID_COORDINATES");
    }
  }

  {
    const result = await resolveCanonicalLocationDateTime({
      source: "browser",
      dateLocal: "1990-01-15",
      timeLocal: "12:00",
      latitude: 26.1445,
      longitude: 91.7362,
      provider: makeProvider({ reverseResult: null }),
    });
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.issue.code, "PLACE_NOT_FOUND");
    }
  }

  {
    const result = await resolveCanonicalLocationDateTime({
      source: "search",
      dateLocal: "1990-01-15",
      timeLocal: "12:00",
      place: { ...guwahatiPlace, timezone: null },
      provider: makeProvider({ timezoneFailure: "TIMEZONE_PROVIDER_ERROR" }),
    });
    assert.equal(result.success, false);
    if (!result.success) {
      assert.equal(result.issue.code, "TIMEZONE_PROVIDER_ERROR");
    }
  }

  {
    const provider = makeProvider({ searchResults: [] });
    const search = await provider.searchPlaces("No such place");
    assert.equal(search.success, true);
    if (search.success) {
      assert.equal(search.data.length, 0);
    }
  }

  console.log("debug-location-timezone-qa: PASS");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
