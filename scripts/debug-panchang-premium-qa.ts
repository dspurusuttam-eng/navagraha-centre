/**
 * Card 9.2 — Premium Panchang/Hora/Choghadiya PURE deterministic QA.
 *
 * Ephemeris-free: Sun/Moon longitudes come from a synthetic linear-motion
 * sampler and rise/set events from an injected fixed provider, so every group
 * runs identically on any Node version. The element math under test is Card 2's
 * authoritative implementation (reused, not reimplemented). Real Swiss
 * Ephemeris behaviour is proven by the separate integration harness on Node 22.
 */

import {
  getKarana,
  getNakshatra,
  getTithi,
  getYoga,
} from "@/modules/panchang/engine";
import {
  buildPremiumPanchangSnapshot,
  horaLordAt,
  enumerateTransitions,
  makeKeysResolver,
  solveElementEnd,
  HORA_SEQUENCE,
  WEEKDAY_LORDS,
  CHOGHADIYA_BY_PLANET,
  CHOGHADIYA_DAY_TABLE,
  CHOGHADIYA_NIGHT_TABLE,
  CHOGHADIYA_CLASSIFICATION,
  RAHU_KAAL_SEGMENTS_BY_WEEKDAY,
  GULIKA_KAAL_SEGMENTS_BY_WEEKDAY,
  YAMAGANDA_SEGMENTS_BY_WEEKDAY,
  PREMIUM_RULE_REGISTRY,
  type PremiumPanchangSnapshot,
  type RiseSetProvider,
  type SunMoonSampler,
} from "@/modules/panchang/premium";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function norm(value: number): number {
  const normalized = value % 360;

  return normalized < 0 ? normalized + 360 : normalized;
}

// --- Synthetic deterministic providers ----------------------------------------

const SUN_RATE = 0.9856473; // deg/day
const MOON_RATE = 13.1763968; // deg/day
const EPOCH_MS = Date.parse("2026-07-05T00:30:00.000Z");

function linearSampler(sun0: number, moon0: number): SunMoonSampler {
  return (utc) => {
    const days = (utc.getTime() - EPOCH_MS) / 86_400_000;

    return {
      sunLongitude: norm(sun0 + SUN_RATE * days),
      moonLongitude: norm(moon0 + MOON_RATE * days),
    };
  };
}

/** Sunrise 00:30Z / sunset 12:30Z per date; next sunrise 00:30Z next day. */
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

const GUWAHATI = {
  latitude: 26.1445,
  longitude: 91.7362,
  timezoneIana: "Asia/Kolkata",
};

// 2026-07-05 is a Sunday; ..-11 is Saturday.
const WEEK_DATES = [
  "2026-07-05",
  "2026-07-06",
  "2026-07-07",
  "2026-07-08",
  "2026-07-09",
  "2026-07-10",
  "2026-07-11",
] as const;

function snapshotFor(dateLocal: string, sampler?: SunMoonSampler): PremiumPanchangSnapshot {
  const result = buildPremiumPanchangSnapshot({
    localDate: dateLocal,
    ...GUWAHATI,
    injected: { sampler: sampler ?? linearSampler(100, 150), riseSet: fixedRiseSet },
  });

  assert(result.success, `snapshot failed for ${dateLocal}: ${!result.success ? result.error.message : ""}`);

  return result.data;
}

const FORBIDDEN = [
  "remedy", "gemstone", "mantra", "donation", "guaranteed", "fatal", "death",
  "accident", "divorce", "disease", "diagnos", "you will", "festival",
  "prediction", "lucky", "unlucky",
];

function walkNumbers(value: unknown, path: string, onNumber: (n: number, p: string) => void) {
  if (typeof value === "number") {
    onNumber(value, path);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => walkNumbers(item, `${path}[${index}]`, onNumber));
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      walkNumbers(child, `${path}.${key}`, onNumber);
    }
  }
}

function assertContiguous(intervals: Array<{ startUtc: string; endUtc: string }>, spanStartIso: string, spanEndIso: string, label: string) {
  assert(intervals.length > 0, `${label}: empty`);
  assert(intervals[0].startUtc === spanStartIso, `${label}: first start != span start`);
  assert(intervals[intervals.length - 1].endUtc === spanEndIso, `${label}: last end != span end`);
  let durationSum = 0;

  for (let index = 0; index < intervals.length; index += 1) {
    const start = Date.parse(intervals[index].startUtc);
    const end = Date.parse(intervals[index].endUtc);

    assert(end > start, `${label}[${index}]: non-positive duration`);
    durationSum += end - start;

    if (index > 0) {
      assert(
        intervals[index].startUtc === intervals[index - 1].endUtc,
        `${label}[${index}]: gap/overlap at boundary`
      );
    }
  }

  const span = Date.parse(spanEndIso) - Date.parse(spanStartIso);

  assert(durationSum === span, `${label}: durations (${durationSum}) != span (${span})`);
}

// --- QA groups -----------------------------------------------------------------

const groups: Array<{ name: string; run: () => void }> = [
  {
    name: "QA1 all 30 tithis + Paksha mapping + Purnima/Amavasya",
    run: () => {
      for (let k = 0; k < 30; k += 1) {
        const tithi = getTithi({ sunLongitude: 0, moonLongitude: norm(12 * k + 6) });

        assert(tithi.index === k + 1, `tithi index at phase ${12 * k + 6}`);
        assert(tithi.paksha === (k + 1 <= 15 ? "Shukla" : "Krishna"), `paksha at index ${k + 1}`);
      }
      assert(getTithi({ sunLongitude: 0, moonLongitude: 174 }).name === "Purnima", "index 15 must be Purnima");
      assert(getTithi({ sunLongitude: 0, moonLongitude: 354 }).name === "Amavasya", "index 30 must be Amavasya");
    },
  },
  {
    name: "QA2 all 27 nakshatras + 4 padas + boundary inclusion",
    run: () => {
      const span = 360 / 27;

      for (let k = 0; k < 27; k += 1) {
        assert(getNakshatra(k * span + span / 2).index === k + 1, `nakshatra index ${k + 1}`);
      }
      for (let pada = 1; pada <= 4; pada += 1) {
        assert(getNakshatra((pada - 1) * (span / 4) + 0.1).pada === pada, `pada ${pada}`);
      }
      // Exact boundary belongs to the next nakshatra (start-inclusive).
      assert(getNakshatra(span).index === 2, "exact 13deg20min boundary -> index 2");
      assert(getNakshatra(0).index === 1, "0deg -> index 1");
    },
  },
  {
    name: "QA3 all 27 yogas + modulo wrap",
    run: () => {
      const span = 360 / 27;

      for (let k = 0; k < 27; k += 1) {
        assert(
          getYoga({ sunLongitude: 0, moonLongitude: k * span + span / 2 }).index === k + 1,
          `yoga index ${k + 1}`
        );
      }
      // Wrap: sum 350+20=370 -> 10deg -> index 1.
      assert(getYoga({ sunLongitude: 350, moonLongitude: 20 }).index === 1, "yoga modulo wrap");
    },
  },
  {
    name: "QA4 all 60 karanas: fixed + repeating sequence + boundaries",
    run: () => {
      const repeating = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];

      for (let half = 1; half <= 60; half += 1) {
        const karana = getKarana(6 * (half - 1) + 3);
        const expected =
          half === 1
            ? "Kimstughna"
            : half === 58
              ? "Shakuni"
              : half === 59
                ? "Chatushpada"
                : half === 60
                  ? "Naga"
                  : repeating[(half - 2) % 7];

        assert(karana.index === half, `karana index ${half}`);
        assert(karana.name === expected, `karana ${half}: expected ${expected}, got ${karana.name}`);
      }
      // Exact 6deg boundary belongs to the next karana.
      assert(getKarana(6).index === 2, "exact 6deg boundary -> index 2");
      // Krishna Chaturdashi second half -> Shakuni onward (sequence around Amavasya).
      assert(getKarana(342 + 3).name === "Shakuni", "half 58 = Shakuni");
      assert(getKarana(348 + 3).name === "Chatushpada", "half 59 = Chatushpada");
      assert(getKarana(354 + 3).name === "Naga", "half 60 = Naga");
      assert(getKarana(0 + 3).name === "Kimstughna", "half 1 = Kimstughna");
      assert(getKarana(6 + 3).name === "Bava", "half 2 = Bava (repeating restart)");
    },
  },
  {
    name: "QA5 all 7 vara cases + pre-sunrise vara + preSunriseInstant flag",
    run: () => {
      WEEK_DATES.forEach((date, weekday) => {
        const snapshot = snapshotFor(date);

        assert(snapshot.vara?.index === weekday, `vara index for ${date}`);
        assert(snapshot.vara?.panchangDayDate === date, `panchang day for ${date}`);
      });

      // Instant before sunrise (00:00Z < 00:30Z sunrise) on 2026-07-08 (Wed)
      // belongs to 2026-07-07 (Tue) Panchang day.
      const result = buildPremiumPanchangSnapshot({
        queryInstant: "2026-07-08T00:00:00.000Z",
        ...GUWAHATI,
        injected: { sampler: linearSampler(100, 150), riseSet: fixedRiseSet },
      });

      assert(result.success, "pre-sunrise snapshot failed");
      assert(result.data.vara?.index === 2, "pre-sunrise vara must be Tuesday");
      assert(result.data.localDate === "2026-07-07", "pre-sunrise panchang day must shift back");
      assert(result.data.flags.preSunriseInstant === true, "preSunriseInstant flag must be set");
    },
  },
  {
    name: "QA6 hora: 12+12, all 7 weekday sequences, cycle, boundaries",
    run: () => {
      WEEK_DATES.forEach((date, weekday) => {
        const snapshot = snapshotFor(date);

        assert(snapshot.horas.length === 24, `${date}: expected 24 horas`);
        const day = snapshot.horas.filter((hora) => hora.half === "day");
        const night = snapshot.horas.filter((hora) => hora.half === "night");

        assert(day.length === 12 && night.length === 12, `${date}: 12 day + 12 night`);
        assert(day[0].lord === WEEKDAY_LORDS[weekday], `${date}: first hora = weekday lord`);

        // Full cyclic sequence.
        const startPosition = HORA_SEQUENCE.indexOf(WEEKDAY_LORDS[weekday]);

        snapshot.horas.forEach((hora, index) => {
          assert(
            hora.lord === HORA_SEQUENCE[(startPosition + index) % 7],
            `${date}: hora ${index + 1} lord mismatch`
          );
        });

        assertContiguous(day, snapshot.sunrise!.utc, snapshot.sunset!.utc, `${date} day horas`);
        assertContiguous(night, snapshot.sunset!.utc, snapshot.nextSunrise!.utc, `${date} night horas`);
      });
    },
  },
  {
    name: "QA7 25th hora invariant: next sunrise begins next weekday's lord",
    run: () => {
      for (let weekday = 0; weekday < 7; weekday += 1) {
        assert(
          horaLordAt(weekday, 25) === WEEKDAY_LORDS[(weekday + 1) % 7],
          `25th hora after weekday ${weekday} must be next weekday lord`
        );
      }
    },
  },
  {
    name: "QA8 choghadiya pinned tables: integrity + derivation consistency",
    run: () => {
      // Row(1) == row(8) in all 14 rows; all keys valid.
      for (const table of [CHOGHADIYA_DAY_TABLE, CHOGHADIYA_NIGHT_TABLE]) {
        for (let weekday = 0; weekday < 7; weekday += 1) {
          const row = table[weekday];

          assert(row.length === 8, "row must have 8 entries");
          assert(row[0] === row[7], `row(1) must equal row(8) for weekday ${weekday}`);
        }
      }
      // Day rows derive from the hora cycle starting at the weekday lord.
      for (let weekday = 0; weekday < 7; weekday += 1) {
        const startPosition = HORA_SEQUENCE.indexOf(WEEKDAY_LORDS[weekday]);

        for (let segment = 0; segment < 8; segment += 1) {
          const planet = HORA_SEQUENCE[(startPosition + segment) % 7];

          assert(
            CHOGHADIYA_DAY_TABLE[weekday][segment] === CHOGHADIYA_BY_PLANET[planet],
            `day table weekday ${weekday} segment ${segment} != hora-cycle derivation`
          );
        }
      }
      // Night rows all follow ONE successor order (derived from Sunday's row).
      const successor = new Map<string, string>();

      for (let segment = 0; segment < 7; segment += 1) {
        successor.set(CHOGHADIYA_NIGHT_TABLE[0][segment], CHOGHADIYA_NIGHT_TABLE[0][segment + 1]);
      }
      for (let weekday = 1; weekday < 7; weekday += 1) {
        for (let segment = 0; segment < 7; segment += 1) {
          assert(
            successor.get(CHOGHADIYA_NIGHT_TABLE[weekday][segment]) ===
              CHOGHADIYA_NIGHT_TABLE[weekday][segment + 1],
            `night successor order inconsistent at weekday ${weekday} segment ${segment}`
          );
        }
      }
    },
  },
  {
    name: "QA9 choghadiya schedules: 8+8, exact sequence, boundaries, classification",
    run: () => {
      WEEK_DATES.forEach((date, weekday) => {
        const snapshot = snapshotFor(date);

        assert(snapshot.choghadiyaDay.length === 8, `${date}: 8 day segments`);
        assert(snapshot.choghadiyaNight.length === 8, `${date}: 8 night segments`);
        snapshot.choghadiyaDay.forEach((segment, index) => {
          assert(segment.key === CHOGHADIYA_DAY_TABLE[weekday][index], `${date} day segment ${index + 1}`);
          assert(segment.classification === CHOGHADIYA_CLASSIFICATION[segment.key], "classification mapping");
        });
        snapshot.choghadiyaNight.forEach((segment, index) => {
          assert(segment.key === CHOGHADIYA_NIGHT_TABLE[weekday][index], `${date} night segment ${index + 1}`);
        });
        assertContiguous(snapshot.choghadiyaDay, snapshot.sunrise!.utc, snapshot.sunset!.utc, `${date} day choghadiya`);
        assertContiguous(snapshot.choghadiyaNight, snapshot.sunset!.utc, snapshot.nextSunrise!.utc, `${date} night choghadiya`);
      });
    },
  },
  {
    name: "QA10 Rahu/Yamaganda/Gulika weekday tables + segment placement",
    run: () => {
      WEEK_DATES.forEach((date, weekday) => {
        const snapshot = snapshotFor(date);
        const sunriseMs = Date.parse(snapshot.sunrise!.utc);
        const spanMs = Date.parse(snapshot.sunset!.utc) - sunriseMs;
        const expectStart = (segment: number) =>
          new Date(Math.round(sunriseMs + ((segment - 1) * spanMs) / 8)).toISOString();

        assert(
          snapshot.rahuKaal?.startUtc === expectStart(RAHU_KAAL_SEGMENTS_BY_WEEKDAY[weekday]),
          `${date}: rahu kaal segment start`
        );
        assert(
          snapshot.yamaganda?.startUtc === expectStart(YAMAGANDA_SEGMENTS_BY_WEEKDAY[weekday]),
          `${date}: yamaganda segment start`
        );
        assert(
          snapshot.gulika?.startUtc === expectStart(GULIKA_KAAL_SEGMENTS_BY_WEEKDAY[weekday]),
          `${date}: gulika segment start`
        );
      });
    },
  },
  {
    name: "QA11 Abhijit midday formula + Brahma fixed-48min convention",
    run: () => {
      const snapshot = snapshotFor("2026-07-08"); // Wednesday
      const sunriseMs = Date.parse(snapshot.sunrise!.utc);
      const sunsetMs = Date.parse(snapshot.sunset!.utc);
      const dayMs = sunsetMs - sunriseMs;
      const middayMs = sunriseMs + dayMs / 2;

      assert(
        Date.parse(snapshot.abhijit!.startUtc) === Math.round(middayMs - dayMs / 30),
        "abhijit start = midday - day/30"
      );
      assert(
        Date.parse(snapshot.abhijit!.endUtc) === Math.round(middayMs + dayMs / 30),
        "abhijit end = midday + day/30"
      );
      assert(snapshot.abhijit!.wednesdayExclusionConvention === true, "wednesday flag factual-only");
      assert(snapshotFor("2026-07-09").abhijit!.wednesdayExclusionConvention === false, "non-wednesday flag false");

      assert(
        Date.parse(snapshot.brahmaMuhurta!.startUtc) === sunriseMs - 96 * 60_000,
        "brahma start = sunrise - 96min"
      );
      assert(
        Date.parse(snapshot.brahmaMuhurta!.endUtc) === sunriseMs - 48 * 60_000,
        "brahma end = sunrise - 48min"
      );
      assert(snapshot.brahmaMuhurta!.convention === "FIXED_48MIN_MUHURTA", "brahma convention pinned");
    },
  },
  {
    name: "QA12 transition solver: analytic accuracy <= 1 s (tithi + karana)",
    run: () => {
      // phase0 = norm(150-100) = 50deg at EPOCH. Next tithi boundary at 60deg,
      // next karana boundary at 54deg. Relative rate = MOON_RATE - SUN_RATE.
      const sampler = linearSampler(100, 150);
      const keysAt = makeKeysResolver(sampler);
      const rate = MOON_RATE - SUN_RATE;
      const tithiAnalyticMs = EPOCH_MS + ((60 - 50) / rate) * 86_400_000;
      const karanaAnalyticMs = EPOCH_MS + ((54 - 50) / rate) * 86_400_000;
      const tithiSolved = solveElementEnd({ keysAt, factor: "tithi", atMs: EPOCH_MS });
      const karanaSolved = solveElementEnd({ keysAt, factor: "karana", atMs: EPOCH_MS });

      assert(tithiSolved !== null && Math.abs(tithiSolved - tithiAnalyticMs) <= 1_000, `tithi boundary off by ${tithiSolved !== null ? Math.abs(tithiSolved - tithiAnalyticMs) : "null"} ms`);
      assert(karanaSolved !== null && Math.abs(karanaSolved - karanaAnalyticMs) <= 1_000, "karana boundary beyond 1 s tolerance");
    },
  },
  {
    name: "QA13 full-day transition enumeration: complete, ordered, no misses",
    run: () => {
      const snapshot = snapshotFor("2026-07-06");
      const startMs = Date.parse(snapshot.panchangDay!.startUtc);
      const endMs = Date.parse(snapshot.panchangDay!.endUtc);

      assert(snapshot.transitions.length > 0, "expected transitions in a full day");
      let previous = 0;

      for (const transition of snapshot.transitions) {
        const at = Date.parse(transition.atUtc);

        assert(at >= startMs && at < endMs, "transition outside the panchang day");
        assert(at >= previous, "transitions must be ordered");
        previous = at;
      }
      // Karana (~11.4 deg/day relative / 6 deg span) must transition at least once.
      assert(
        snapshot.transitions.some((transition) => transition.element === "karana"),
        "at least one karana transition expected"
      );
      // Cross-check against a direct enumeration call.
      const sampler = linearSampler(100, 150);
      const direct = enumerateTransitions({
        keysAt: makeKeysResolver(sampler),
        fromMs: startMs,
        toMs: endMs,
      });

      assert(direct !== null && direct.length === snapshot.transitions.length, "engine vs direct enumeration mismatch");
    },
  },
  {
    name: "QA14 element start/end bracket the query instant; next identity correct",
    run: () => {
      const snapshot = snapshotFor("2026-07-06");
      const queryMs = Date.parse(snapshot.queryInstant!);

      for (const element of [snapshot.tithi, snapshot.nakshatra, snapshot.yoga, snapshot.karana]) {
        assert(element, "element missing");
        const start = Date.parse(element!.startUtc);
        const end = Date.parse(element!.endUtc);

        assert(start <= queryMs && queryMs < end, `element does not bracket instant`);
        assert(element!.next.index !== element!.index, "next element must differ");
      }
      // Tithi next index must be current+1 (mod 30).
      assert(
        snapshot.tithi!.next.index === (snapshot.tithi!.index % 30) + 1,
        "tithi next index must increment"
      );
    },
  },
  {
    name: "QA15 unavailable sunrise: nothing fabricated, honest reasons",
    run: () => {
      const noSun: RiseSetProvider = () => ({
        sunriseUtc: null,
        sunsetUtc: null,
        nextSunriseUtc: null,
        moonriseUtc: null,
        moonsetUtc: null,
      });
      // Explicit instant -> degraded with elements, no periods/horas/choghadiya.
      const degraded = buildPremiumPanchangSnapshot({
        queryInstant: "2026-07-08T06:00:00.000Z",
        ...GUWAHATI,
        injected: { sampler: linearSampler(100, 150), riseSet: noSun },
      });

      assert(degraded.success, "degraded snapshot should build");
      assert(degraded.data.status === "degraded", `expected degraded, got ${degraded.data.status}`);
      assert(degraded.data.horas.length === 0, "no horas may be fabricated");
      assert(degraded.data.choghadiyaDay.length === 0 && degraded.data.choghadiyaNight.length === 0, "no choghadiya fabricated");
      assert(!degraded.data.rahuKaal && !degraded.data.yamaganda && !degraded.data.gulika, "no segment periods fabricated");
      assert(!degraded.data.abhijit && !degraded.data.brahmaMuhurta, "no muhurta fabricated");
      assert(degraded.data.tithi !== null, "elements remain calculable");
      assert(degraded.data.unavailableReasons.some((reason) => reason.system === "dailyPeriods"), "reason must identify dailyPeriods");

      // No instant + no sunrise -> unavailable.
      const unavailable = buildPremiumPanchangSnapshot({
        localDate: "2026-07-08",
        ...GUWAHATI,
        injected: { sampler: linearSampler(100, 150), riseSet: noSun },
      });

      assert(unavailable.success && unavailable.data.status === "unavailable", "no anchor -> unavailable");

      // Missing nextSunrise only -> day-only structures + degraded.
      const noNext: RiseSetProvider = (request) => ({
        ...fixedRiseSet(request),
        nextSunriseUtc: null,
      });
      const dayOnly = buildPremiumPanchangSnapshot({
        localDate: "2026-07-08",
        ...GUWAHATI,
        injected: { sampler: linearSampler(100, 150), riseSet: noNext },
      });

      assert(dayOnly.success && dayOnly.data.status === "degraded", "missing night span -> degraded");
      assert(dayOnly.data.horas.length === 12, "day horas only");
      assert(dayOnly.data.choghadiyaNight.length === 0, "no night choghadiya");
      assert(dayOnly.data.flags.nightSpanUnavailable === true, "nightSpanUnavailable flag");
    },
  },
  {
    name: "QA16 input validation: coordinates, timezone, dates, mismatch, range",
    run: () => {
      const base = { injected: { sampler: linearSampler(100, 150), riseSet: fixedRiseSet } };
      const bad = (input: Record<string, unknown>, code: string) => {
        const result = buildPremiumPanchangSnapshot({ ...GUWAHATI, ...base, ...input } as never);

        assert(!result.success && result.error.code === code, `expected ${code}`);
      };

      bad({ localDate: "2026-07-08", latitude: 91 }, "INVALID_COORDINATES");
      bad({ localDate: "2026-07-08", timezoneIana: "Invalid/Zone" }, "INVALID_TIMEZONE");
      bad({ localDate: "2026-02-30" }, "INVALID_DATE");
      bad({}, "MISSING_DATE_OR_INSTANT");
      bad({ queryInstant: "not-a-date" }, "INVALID_QUERY_INSTANT");
      bad({ localDate: "1899-12-31" }, "UNSUPPORTED_DATE_RANGE");
      bad({ localDate: "2101-01-01" }, "UNSUPPORTED_DATE_RANGE");
      // Instant on Jul 8 vs declared localDate Jul 9 -> mismatch.
      bad(
        { localDate: "2026-07-09", queryInstant: "2026-07-08T06:00:00.000Z" },
        "DATE_INSTANT_MISMATCH"
      );
    },
  },
  {
    name: "QA17 repeatability: identical input -> byte-identical output",
    run: () => {
      const a = JSON.stringify(snapshotFor("2026-07-09"));
      const b = JSON.stringify(snapshotFor("2026-07-09"));

      assert(a === b, "outputs differ across identical runs");
    },
  },
  {
    name: "QA18 rule registry: unique, immutable, every emitted ruleId registered",
    run: () => {
      const ids = PREMIUM_RULE_REGISTRY.map((rule) => rule.ruleId);

      assert(new Set(ids).size === ids.length, "duplicate ruleId in registry");

      const snapshot = snapshotFor("2026-07-10");
      const emitted = new Set<string>();
      const collect = (value: unknown) => {
        if (Array.isArray(value)) {
          value.forEach(collect);
        } else if (value && typeof value === "object") {
          const record = value as Record<string, unknown>;

          if (typeof record.ruleId === "string") {
            emitted.add(record.ruleId);
          }
          Object.values(record).forEach(collect);
        }
      };

      collect(snapshot);
      assert(emitted.size >= 10, "expected many emitted rule ids");
      for (const id of emitted) {
        assert(ids.includes(id), `emitted unregistered ruleId ${id}`);
      }
    },
  },
  {
    name: "QA19 schema stability, no NaN/Infinity, forbidden-text scan",
    run: () => {
      const snapshot = snapshotFor("2026-07-11");
      const expectedKeys = [
        "status", "contractVersion", "conventions", "queryInstant", "localDate",
        "timezone", "coordinates", "panchangDay", "sunrise", "sunset",
        "nextSunrise", "moonrise", "moonset", "vara", "paksha", "tithi",
        "nakshatra", "yoga", "karana", "transitions", "rahuKaal", "yamaganda",
        "gulika", "abhijit", "brahmaMuhurta", "horas", "choghadiyaDay",
        "choghadiyaNight", "sourceSystemReadiness", "calculationReferences",
        "unavailableReasons", "flags",
      ].sort();

      assert(
        JSON.stringify(Object.keys(snapshot).sort()) === JSON.stringify(expectedKeys),
        "top-level schema keys changed"
      );
      assert(snapshot.contractVersion === "1.0.0", "contract version drift");
      walkNumbers(snapshot, "root", (n, p) => {
        assert(Number.isFinite(n), `non-finite number at ${p}`);
      });
      const text = JSON.stringify(snapshot).toLowerCase();

      for (const term of FORBIDDEN) {
        assert(!text.includes(term), `forbidden term in output: "${term}"`);
      }
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

  console.log("panchang premium QA (pure, deterministic):");
  for (const name of passed) console.log(`  ✓ ${name}`);
  for (const failure of failed) console.log(`  ✗ ${failure.name} -- ${failure.message}`);
  console.log(
    `\npanchang premium QA summary: ${passed.length} passed, ${failed.length} failed (of ${groups.length}).`
  );

  if (failed.length > 0) {
    process.exit(1);
  }
}

main();
