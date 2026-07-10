import type { LocationTimezoneResult } from "@/lib/location-timezone/types";

const SEARCH_WINDOW_MINUTES = 36 * 60;
const MINUTE_MS = 60_000;

export type CivilTimeDisambiguation = "earlier" | "later";

export type CivilTimeResolution = {
  localDateTime: string;
  utcDateTime: string;
  utcOffsetMinutes: number;
  timezone: string;
  ambiguous: boolean;
  candidates: Array<{
    utcDateTime: string;
    utcOffsetMinutes: number;
  }>;
};

type LocalDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function formatUtcOffsetMinutes(totalMinutes: number) {
  const sign = totalMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(totalMinutes);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;

  return `UTC${sign}${pad(hours)}:${pad(minutes)}`;
}

function readLocalDateTime(dateLocal: string, timeLocal: string) {
  const dateMatch = dateLocal.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = timeLocal.match(/^(\d{2}):(\d{2})$/);

  if (!dateMatch || !timeMatch) {
    return null;
  }

  const parts: LocalDateTimeParts = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
  };

  const dateCheck = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));

  if (
    dateCheck.getUTCFullYear() !== parts.year ||
    dateCheck.getUTCMonth() !== parts.month - 1 ||
    dateCheck.getUTCDate() !== parts.day ||
    parts.hour < 0 ||
    parts.hour > 23 ||
    parts.minute < 0 ||
    parts.minute > 59
  ) {
    return null;
  }

  return parts;
}

function getTimeZoneParts(date: Date, timeZone: string): LocalDateTimeParts & {
  second: number;
} {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value ?? "0"),
    month: Number(parts.find((part) => part.type === "month")?.value ?? "1"),
    day: Number(parts.find((part) => part.type === "day")?.value ?? "1"),
    hour: Number(parts.find((part) => part.type === "hour")?.value ?? "0"),
    minute: Number(parts.find((part) => part.type === "minute")?.value ?? "0"),
    second: Number(parts.find((part) => part.type === "second")?.value ?? "0"),
  };
}

export function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return Math.round((asUtc - date.getTime()) / MINUTE_MS);
}

function partsMatch(left: LocalDateTimeParts, right: LocalDateTimeParts) {
  return (
    left.year === right.year &&
    left.month === right.month &&
    left.day === right.day &&
    left.hour === right.hour &&
    left.minute === right.minute
  );
}

function toLocalDateTimeString(parts: LocalDateTimeParts) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(
    parts.hour
  )}:${pad(parts.minute)}:00`;
}

function buildCandidates(parts: LocalDateTimeParts, timeZone: string) {
  const naiveUtcMs = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    0
  );
  const matches: number[] = [];

  for (
    let offsetMinutes = -SEARCH_WINDOW_MINUTES;
    offsetMinutes <= SEARCH_WINDOW_MINUTES;
    offsetMinutes += 1
  ) {
    const utcMs = naiveUtcMs + offsetMinutes * MINUTE_MS;
    const candidateDate = new Date(utcMs);
    const candidateParts = getTimeZoneParts(candidateDate, timeZone);

    if (candidateParts.second === 0 && partsMatch(parts, candidateParts)) {
      matches.push(utcMs);
    }
  }

  return [...new Set(matches)]
    .sort((left, right) => left - right)
    .map((utcMs) => {
      const utcDate = new Date(utcMs);

      return {
        utcDateTime: utcDate.toISOString(),
        utcOffsetMinutes: getTimeZoneOffsetMinutes(utcDate, timeZone),
      };
    });
}

export function resolveCivilTimeToUtc(input: {
  dateLocal: string;
  timeLocal: string;
  timeZone: string;
  disambiguation?: CivilTimeDisambiguation;
}): LocationTimezoneResult<CivilTimeResolution> {
  const timeZone = input.timeZone.trim();

  if (!isValidTimeZone(timeZone)) {
    return {
      success: false,
      issue: {
        code: "INVALID_TIMEZONE",
        message: "Timezone must be a valid IANA timezone identifier.",
      },
    };
  }

  const parts = readLocalDateTime(input.dateLocal, input.timeLocal);

  if (!parts) {
    return {
      success: false,
      issue: {
        code: "MISSING_DATE_TIME",
        message: "Select a valid local date and birth time before resolving UTC.",
      },
    };
  }

  const candidates = buildCandidates(parts, timeZone);

  if (candidates.length === 0) {
    return {
      success: false,
      issue: {
        code: "LOCAL_TIME_NONEXISTENT",
        message:
          "This local time does not exist in the selected timezone because of a daylight-saving transition.",
      },
    };
  }

  if (candidates.length > 1 && !input.disambiguation) {
    return {
      success: false,
      issue: {
        code: "LOCAL_TIME_AMBIGUOUS",
        message:
          "This local time occurs twice in the selected timezone. Choose the earlier or later occurrence.",
        details: { candidates },
      },
    };
  }

  const selected =
    candidates.length > 1 && input.disambiguation === "later"
      ? candidates[candidates.length - 1]
      : candidates[0];

  return {
    success: true,
    data: {
      localDateTime: toLocalDateTimeString(parts),
      utcDateTime: selected.utcDateTime,
      utcOffsetMinutes: selected.utcOffsetMinutes,
      timezone: timeZone,
      ambiguous: candidates.length > 1,
      candidates,
    },
  };
}
