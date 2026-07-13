import {
  buildPremiumPanchangAdapterSnapshot,
  isPremiumPanchangAdapterRequested,
  PREMIUM_PANCHANG_ADAPTER_VERSION,
} from "@/modules/panchang/premium/server-adapter";
import type {
  RiseSetProvider,
  SunMoonSampler,
} from "@/modules/panchang/premium/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function norm(value: number) {
  const normalized = value % 360;

  return normalized < 0 ? normalized + 360 : normalized;
}

const SUN_RATE = 0.9856473;
const MOON_RATE = 13.1763968;
const EPOCH_MS = Date.parse("2026-07-05T00:30:00.000Z");

const location = {
  latitude: 26.1445,
  longitude: 91.7362,
  timezoneIana: "Asia/Kolkata",
};

function linearSampler(sun0: number, moon0: number): SunMoonSampler {
  return (utc) => {
    const days = (utc.getTime() - EPOCH_MS) / 86_400_000;

    return {
      sunLongitude: norm(sun0 + SUN_RATE * days),
      moonLongitude: norm(moon0 + MOON_RATE * days),
    };
  };
}

const fixedRiseSet: RiseSetProvider = ({ dateLocal }) => {
  const [year, month, day] = dateLocal.split("-").map(Number);
  const sunrise = Date.UTC(year, month - 1, day, 0, 30, 0);
  const sunset = Date.UTC(year, month - 1, day, 12, 30, 0);
  const nextSunrise = Date.UTC(year, month - 1, day + 1, 0, 30, 0);

  return {
    sunriseUtc: new Date(sunrise).toISOString(),
    sunsetUtc: new Date(sunset).toISOString(),
    nextSunriseUtc: new Date(nextSunrise).toISOString(),
    moonriseUtc: new Date(Date.UTC(year, month - 1, day, 6, 0, 0)).toISOString(),
    moonsetUtc: new Date(Date.UTC(year, month - 1, day, 18, 0, 0)).toISOString(),
  };
};

const noSunRiseSet: RiseSetProvider = () => ({
  sunriseUtc: null,
  sunsetUtc: null,
  nextSunriseUtc: null,
  moonriseUtc: null,
  moonsetUtc: null,
});

const groups: Array<{ name: string; run: () => void }> = [
  {
    name: "ADAPTER1 explicit version gate only",
    run: () => {
      assert(
        isPremiumPanchangAdapterRequested({
          adapterVersion: PREMIUM_PANCHANG_ADAPTER_VERSION,
        }),
        "current adapter version should opt in"
      );
      assert(!isPremiumPanchangAdapterRequested(true), "boolean must not opt in");
      assert(!isPremiumPanchangAdapterRequested({}), "empty object must not opt in");
      assert(
        !isPremiumPanchangAdapterRequested({ adapterVersion: "legacy" }),
        "wrong version must not opt in"
      );
    },
  },
  {
    name: "ADAPTER2 success returns typed premium snapshot payload",
    run: () => {
      const result = buildPremiumPanchangAdapterSnapshot({
        localDate: "2026-07-08",
        location,
        injected: {
          sampler: linearSampler(100, 150),
          riseSet: fixedRiseSet,
        },
      });

      assert(result.success, "adapter should succeed with deterministic providers");
      assert(
        result.payload.adapterVersion === PREMIUM_PANCHANG_ADAPTER_VERSION,
        "adapter version mismatch"
      );
      assert(result.payload.data.status === "ok", "expected ok snapshot");
      assert(result.payload.data.horas.length === 24, "expected 24 horas");
      assert(result.payload.data.choghadiyaDay.length === 8, "expected 8 day choghadiya");
      assert(
        result.payload.data.choghadiyaNight.length === 8,
        "expected 8 night choghadiya"
      );
      assert(
        result.payload.data.sourceSystemReadiness.sunEvents === "ready",
        "sun events should be ready"
      );
    },
  },
  {
    name: "ADAPTER3 degraded state does not fabricate missing timing structures",
    run: () => {
      const result = buildPremiumPanchangAdapterSnapshot({
        localDate: "2026-07-08",
        queryInstant: "2026-07-08T06:00:00.000Z",
        location,
        injected: {
          sampler: linearSampler(100, 150),
          riseSet: noSunRiseSet,
        },
      });

      assert(result.success, "adapter should return honest degraded snapshot");
      assert(result.payload.data.status === "degraded", "expected degraded status");
      assert(result.payload.data.horas.length === 0, "no horas may be fabricated");
      assert(
        result.payload.data.choghadiyaDay.length === 0 &&
          result.payload.data.choghadiyaNight.length === 0,
        "no choghadiya may be fabricated"
      );
      assert(
        result.payload.data.unavailableReasons.some(
          (reason) => reason.system === "dailyPeriods"
        ),
        "dailyPeriods reason should explain missing timing structures"
      );
    },
  },
  {
    name: "ADAPTER4 validation failures map to safe route status",
    run: () => {
      const result = buildPremiumPanchangAdapterSnapshot({
        localDate: "2026-07-08",
        location: {
          ...location,
          timezoneIana: "Invalid/Zone",
        },
        injected: {
          sampler: linearSampler(100, 150),
          riseSet: fixedRiseSet,
        },
      });

      assert(!result.success, "invalid timezone should fail");
      assert(result.error.code === "INVALID_TIMEZONE", "expected invalid timezone code");
      assert(result.error.statusCode === 422, "expected 422 for validation failure");
    },
  },
];

function main() {
  const passed: string[] = [];
  const failed: Array<{ name: string; message: string }> = [];

  for (const group of groups) {
    try {
      group.run();
      passed.push(group.name);
    } catch (error) {
      failed.push({ name: group.name, message: (error as Error).message });
    }
  }

  console.log("panchang premium adapter QA:");
  for (const name of passed) console.log(`  PASS ${name}`);
  for (const failure of failed) {
    console.log(`  FAIL ${failure.name} -- ${failure.message}`);
  }
  console.log(
    `\npanchang premium adapter QA summary: ${passed.length} passed, ${failed.length} failed (of ${groups.length}).`
  );

  if (failed.length > 0) {
    process.exit(1);
  }
}

main();
