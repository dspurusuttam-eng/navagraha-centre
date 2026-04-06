import { consultationHost } from "@/modules/consultations/catalog";

export function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function getTimeZoneName(timeZone: string, value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short",
  }).formatToParts(date);

  return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone;
}

export function formatDateTimeInTimeZone(
  value: Date | string,
  timeZone: string,
  locale = "en-IN"
) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatSlotWindow(
  startsAt: Date | string,
  endsAt: Date | string,
  timeZone: string,
  locale = "en-IN"
) {
  const start = typeof startsAt === "string" ? new Date(startsAt) : startsAt;
  const end = typeof endsAt === "string" ? new Date(endsAt) : endsAt;

  const dayLabel = new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(start);

  const startTime = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(start);

  const endTime = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(end);

  return `${dayLabel}, ${startTime} - ${endTime}`;
}

export function formatDualTimeZoneSlot(
  startsAt: Date | string,
  endsAt: Date | string,
  clientTimeZone: string
) {
  const clientZone = isValidTimeZone(clientTimeZone)
    ? clientTimeZone
    : consultationHost.timezone;

  return {
    clientLabel: `${formatSlotWindow(startsAt, endsAt, clientZone)} (${getTimeZoneName(
      clientZone,
      startsAt
    )})`,
    hostLabel: `${formatSlotWindow(
      startsAt,
      endsAt,
      consultationHost.timezone
    )} (${consultationHost.timezoneLabel})`,
  };
}
