import type { ConsultationPackageDefinition } from "@/modules/consultations/catalog";
import { formatDualTimeZoneSlot } from "@/modules/consultations/time";

export type ConsultationPackageCard = ConsultationPackageDefinition & {
  durationLabel: string;
  priceLabel: string;
};

export type ConsultationBookingData = {
  user: {
    name: string;
    email: string;
  };
  defaults: {
    timezone: string;
    phone: string;
    preferredLanguage: string;
    selectedPackageSlug: string;
    selectedBirthDataId: string;
  };
  packages: ConsultationPackageCard[];
  timezones: string[];
  birthProfiles: {
    id: string;
    label: string;
    summary: string;
  }[];
  slots: {
    id: string;
    startsAtUtc: string;
    endsAtUtc: string;
    timezone: string;
    note: string | null;
  }[];
};

export function formatConsultationPackageMeta(item: ConsultationPackageCard) {
  return `${item.durationLabel} - ${item.priceLabel}`;
}

export function formatConsultationSlotPreview(
  startsAtUtc: string,
  endsAtUtc: string,
  clientTimezone: string
) {
  return formatDualTimeZoneSlot(startsAtUtc, endsAtUtc, clientTimezone);
}
