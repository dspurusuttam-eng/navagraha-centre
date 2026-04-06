import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  consultationHost,
  formatDateTimeInTimeZone,
  formatSlotWindow,
} from "@/modules/consultations";
import type { ConsultationAdminBoard } from "@/modules/consultations/service";

type AdminConsultationBoardProps = {
  board: ConsultationAdminBoard;
  adminLabel: string;
};

export function AdminConsultationBoard({
  board,
  adminLabel,
}: Readonly<AdminConsultationBoardProps>) {
  return (
    <Container className="space-y-8 py-[var(--space-8)] sm:py-[var(--space-10)]">
      <Card tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="accent">Admin Booking Desk</Badge>
          <Badge tone="neutral">{adminLabel}</Badge>
        </div>
        <div className="space-y-2">
          <h1
            className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-lg)] text-[color:var(--color-foreground)]"
            style={{ letterSpacing: "var(--tracking-display)" }}
          >
            Consultation management for Joy Prakash Sarmah.
          </h1>
          <p className="max-w-3xl text-[length:var(--font-size-body-lg)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            This first admin-facing surface keeps consultation demand, upcoming
            reservations, and open slots together without introducing broader
            CRM or calendar sync complexity.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Open Slots
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {board.metrics.openSlots}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Confirmed
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {board.metrics.confirmedBookings}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Requests
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {board.metrics.requestedBookings}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Completed
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {board.metrics.completedBookings}
          </p>
        </Card>
      </div>

      <Section
        eyebrow="Upcoming Bookings"
        title="The next reserved consultations."
        description="A narrow operational view that prioritizes timing, confirmation codes, and intake context."
        tone="transparent"
        className="pt-0"
      >
        <div className="grid gap-4">
          {board.upcomingBookings.length ? (
            board.upcomingBookings.map((consultation) => (
              <Card key={consultation.id} className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone="accent">{consultation.status}</Badge>
                  <Badge tone="neutral">{consultation.confirmationCode}</Badge>
                </div>
                <div className="space-y-2">
                  <h2 className="text-[length:var(--font-size-body-lg)] font-medium text-[color:var(--color-foreground)]">
                    {consultation.serviceLabel}
                  </h2>
                  <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                    {consultation.topicFocus ?? "No topic focus recorded yet."}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                      Client Timezone
                    </p>
                    <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                      {consultation.clientTimezone ?? "Pending"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                      Scheduled
                    </p>
                    <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                      {consultation.scheduledForUtc &&
                      consultation.scheduledEndUtc
                        ? formatSlotWindow(
                            consultation.scheduledForUtc,
                            consultation.scheduledEndUtc,
                            consultation.clientTimezone ??
                              consultationHost.timezone
                          )
                        : "Pending"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                      Joy&apos;s Calendar
                    </p>
                    <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                      {consultation.scheduledForUtc &&
                      consultation.scheduledEndUtc
                        ? formatSlotWindow(
                            consultation.scheduledForUtc,
                            consultation.scheduledEndUtc,
                            consultationHost.timezone
                          )
                        : "Pending"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                      Reserved On
                    </p>
                    <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                      {formatDateTimeInTimeZone(
                        consultation.createdAtUtc,
                        consultationHost.timezone
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="space-y-3">
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                No consultation requests or confirmed bookings are stored yet.
              </p>
            </Card>
          )}
        </div>
      </Section>

      <Section
        eyebrow="Availability"
        title="Open slots on Joy Prakash Sarmah's calendar."
        description="Slots are stored in UTC and managed against Joy's explicit operating timezone."
        tone="transparent"
        className="pt-0"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {board.openSlots.length ? (
            board.openSlots.map((slot) => (
              <Card key={slot.id} className="space-y-3">
                <Badge tone="outline">{slot.status}</Badge>
                <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                  {formatSlotWindow(
                    slot.startsAtUtc,
                    slot.endsAtUtc,
                    consultationHost.timezone
                  )}
                </p>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  Host timezone: {slot.timezone}
                </p>
                {slot.note ? (
                  <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                    {slot.note}
                  </p>
                ) : null}
              </Card>
            ))
          ) : (
            <Card className="space-y-3">
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                No open slots are stored yet. Seed or create availability before
                opening member bookings.
              </p>
            </Card>
          )}
        </div>
      </Section>
    </Container>
  );
}
