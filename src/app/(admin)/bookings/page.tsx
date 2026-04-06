import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageIntro } from "@/modules/admin/components/admin-page-intro";
import { AdminStatusBadge } from "@/modules/admin/components/admin-status-badge";
import { updateBookingSlotAction } from "@/modules/admin/actions";
import { formatAdminDateTime } from "@/modules/admin/format";
import { buildAdminMetadata } from "@/modules/admin/metadata";
import { listAdminBookingSlots } from "@/modules/admin/service";
import { requireAdminSession } from "@/modules/auth/server";

const bookingStatusOptions = ["OPEN", "BOOKED", "CANCELLED"] as const;

export const metadata = buildAdminMetadata({
  title: "Admin Bookings",
  description:
    "Manage booking slots, availability state, and attached consultations for Joy Prakash Sarmah.",
  path: "/admin/bookings",
  keywords: ["booking slots", "availability management", "consultation slots"],
});

export default async function AdminBookingsPage() {
  await requireAdminSession({
    allowedRoles: ["founder", "support"],
  });

  const slots = await listAdminBookingSlots();

  return (
    <div className="space-y-6">
      <AdminPageIntro
        eyebrow="Bookings"
        title="Availability remains explicit, auditable, and readable across time zones."
        description="The slot layer is managed separately from the consultation record so availability can stay clear even when a session has not yet matured into a full internal workflow."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Open Slots
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {slots.filter((slot) => slot.status === "OPEN").length}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Booked Slots
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {slots.filter((slot) => slot.status === "BOOKED").length}
          </p>
        </Card>
        <Card className="space-y-3">
          <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
            Cancelled Slots
          </p>
          <p className="font-[family-name:var(--font-display)] text-5xl text-[color:var(--color-foreground)]">
            {slots.filter((slot) => slot.status === "CANCELLED").length}
          </p>
        </Card>
      </div>

      <div className="space-y-4">
        {slots.map((slot) => (
          <Card
            key={slot.id}
            className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]"
          >
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    Booking Slot
                  </p>
                  <h2
                    className="mt-2 font-[family-name:var(--font-display)] text-[length:var(--font-size-title-sm)] text-[color:var(--color-foreground)]"
                    style={{ letterSpacing: "var(--tracking-display)" }}
                  >
                    {formatAdminDateTime(slot.startsAt, slot.timezone)}
                  </h2>
                </div>
                <AdminStatusBadge status={slot.status} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  <p>
                    Starts:{" "}
                    <span className="text-[color:var(--color-foreground)]">
                      {formatAdminDateTime(slot.startsAt, slot.timezone)}
                    </span>
                  </p>
                  <p>
                    Ends:{" "}
                    <span className="text-[color:var(--color-foreground)]">
                      {formatAdminDateTime(slot.endsAt, slot.timezone)}
                    </span>
                  </p>
                  <p>
                    Time zone:{" "}
                    <span className="text-[color:var(--color-foreground)]">
                      {slot.timezone}
                    </span>
                  </p>
                </div>

                <div className="space-y-2 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                  <p>
                    Linked consultation:{" "}
                    <span className="text-[color:var(--color-foreground)]">
                      {slot.consultation?.confirmationCode ?? "Not attached"}
                    </span>
                  </p>
                  <p>
                    Client:{" "}
                    <span className="text-[color:var(--color-foreground)]">
                      {slot.consultation?.user.name ?? "Open inventory"}
                    </span>
                  </p>
                  <p>
                    Client zone:{" "}
                    <span className="text-[color:var(--color-foreground)]">
                      {slot.consultation?.clientTimezone ?? "Not set"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <form action={updateBookingSlotAction} className="space-y-4">
              <input type="hidden" name="slotId" value={slot.id} />

              <label className="block space-y-2">
                <span className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  Slot status
                </span>
                <Select name="status" defaultValue={slot.status}>
                  {bookingStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="block space-y-2">
                <span className="text-[0.74rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                  Booking note
                </span>
                <Textarea
                  name="note"
                  rows={5}
                  defaultValue={slot.note ?? ""}
                  placeholder="Capture internal notes about slot handling, hold reason, or follow-up context."
                />
              </label>

              <Button size="sm" type="submit">
                Save Slot
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
