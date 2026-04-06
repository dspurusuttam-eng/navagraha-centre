export function formatAdminDate(value: Date | string | null) {
  if (!value) {
    return "Not set";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

export function formatAdminDateTime(
  value: Date | string | null,
  timeZone = "Asia/Kolkata"
) {
  if (!value) {
    return "Not scheduled";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

export function formatAdminCurrency(
  value: number | null,
  currencyCode = "INR"
) {
  if (value === null) {
    return "On request";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value / 100);
}
