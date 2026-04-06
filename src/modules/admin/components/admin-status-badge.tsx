import { Badge, type BadgeTone } from "@/components/ui/badge";

type AdminStatusBadgeProps = {
  status: string;
};

const accentStatuses = new Set([
  "ACTIVE",
  "PUBLISHED",
  "CONFIRMED",
  "READY",
  "OPEN",
  "REVIEW",
  "FEATURED",
  "CURRENT",
  "FOUNDER",
  "EDITOR",
  "SUPPORT",
  "EMAIL VERIFIED",
]);

const outlineStatuses = new Set([
  "ARCHIVED",
  "CANCELLED",
  "COMPLETED",
  "BOOKED",
  "EMAIL PENDING",
  "HELD",
]);

function getBadgeTone(status: string): BadgeTone {
  const normalizedStatus = formatStatusLabel(status).toUpperCase();

  if (accentStatuses.has(normalizedStatus)) {
    return "accent";
  }

  if (outlineStatuses.has(normalizedStatus)) {
    return "outline";
  }

  return "neutral";
}

function formatStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AdminStatusBadge({ status }: Readonly<AdminStatusBadgeProps>) {
  return <Badge tone={getBadgeTone(status)}>{formatStatusLabel(status)}</Badge>;
}
