import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import {
  consultationHost,
  formatDateTimeInTimeZone,
  formatDualTimeZoneSlot,
} from "@/modules/consultations";
import type { ConsultationDetail } from "@/modules/consultations/service";

type ConsultationConfirmationProps = {
  consultation: ConsultationDetail;
};

export function ConsultationConfirmation({
  consultation,
}: Readonly<ConsultationConfirmationProps>) {
  const dualTime =
    consultation.scheduledForUtc && consultation.scheduledEndUtc
      ? formatDualTimeZoneSlot(
          consultation.scheduledForUtc,
          consultation.scheduledEndUtc,
          consultation.clientTimezone ?? consultationHost.timezone
        )
      : null;

  return (
    <Section
      eyebrow="Booking Confirmation"
      title="Your consultation is now reserved."
      description="The protected confirmation keeps the package, time, intake context, and Joy Prakash Sarmah details in one place."
      tone="transparent"
      className="pt-0"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <Card tone="accent" className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="accent">{consultation.status}</Badge>
            <Badge tone="neutral">{consultation.confirmationCode}</Badge>
          </div>
          <div className="space-y-3">
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              {consultation.serviceLabel}
            </h2>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              {consultation.packageDescription ??
                "The consultation has been recorded and reserved in the protected dashboard."}
            </p>
          </div>

          {dualTime ? (
            <div className="space-y-3">
              <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                Your calendar
              </p>
              <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                {dualTime.clientLabel}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                Joy&apos;s calendar: {dualTime.hostLabel}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/consultations"
              className={buttonStyles({ size: "lg" })}
            >
              View All Consultations
            </Link>
            <Link
              href="/dashboard/consultations/book"
              className={buttonStyles({ tone: "secondary", size: "lg" })}
            >
              Book Another Session
            </Link>
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Confirmation Details
            </p>
            <h3
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              Clear and explicit scheduling.
            </h3>
          </div>
          <div className="space-y-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            <p>
              Astrologer:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {consultation.astrologerName}
              </span>
            </p>
            <p>
              Preferred language:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {consultation.preferredLanguage ?? "Not recorded"}
              </span>
            </p>
            <p>
              Birth profile:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {consultation.birthProfileLabel ?? "Not attached"}
              </span>
            </p>
            <p>
              Reserved on:{" "}
              <span className="text-[color:var(--color-foreground)]">
                {formatDateTimeInTimeZone(
                  consultation.createdAtUtc,
                  consultationHost.timezone
                )}
              </span>
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Topic Focus
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-foreground)]">
            {consultation.topicFocus ?? "No topic focus was provided."}
          </p>
        </Card>

        <Card className="space-y-4">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Intake Summary
          </p>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            {consultation.intakeSummary ??
              "No intake summary was provided for this consultation."}
          </p>
        </Card>
      </div>
    </Section>
  );
}
