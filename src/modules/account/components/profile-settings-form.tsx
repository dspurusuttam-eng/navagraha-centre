"use client";

import { useActionState } from "react";
import {
  initialSettingsActionState,
  updateProfileSettings,
} from "@/modules/account/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ProfileSettingsFormProps = {
  defaults: {
    name: string;
    email: string;
    image: string;
    phone: string;
    city: string;
    region: string;
    country: string;
    timezone: string;
    bio: string;
    notes: string;
  };
};

export function ProfileSettingsForm({
  defaults,
}: Readonly<ProfileSettingsFormProps>) {
  const [state, formAction, isPending] = useActionState(
    updateProfileSettings,
    initialSettingsActionState
  );

  return (
    <form action={formAction} className="space-y-6">
      <Card className="space-y-5">
        <div className="space-y-2">
          <h2
            className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
            style={{ letterSpacing: "var(--tracking-display)" }}
          >
            Account Identity
          </h2>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            Keep the primary account record polished and accurate across the
            protected member experience.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="settings-name"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Full Name
            </label>
            <Input
              id="settings-name"
              name="name"
              defaultValue={defaults.name}
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="settings-email"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Email
            </label>
            <Input
              id="settings-email"
              defaultValue={defaults.email}
              readOnly
              aria-readonly="true"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="settings-image"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Image URL
            </label>
            <Input
              id="settings-image"
              name="image"
              type="url"
              defaultValue={defaults.image}
              placeholder="https://..."
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-5">
        <div className="space-y-2">
          <h2
            className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
            style={{ letterSpacing: "var(--tracking-display)" }}
          >
            Profile Settings
          </h2>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            These details prepare the account foundation for future birth data,
            consultation, and commerce workflows.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="settings-phone"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Phone
            </label>
            <Input
              id="settings-phone"
              name="phone"
              type="tel"
              defaultValue={defaults.phone}
              autoComplete="tel"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="settings-timezone"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Timezone
            </label>
            <Input
              id="settings-timezone"
              name="timezone"
              defaultValue={defaults.timezone}
              placeholder="Asia/Kolkata"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="settings-city"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              City
            </label>
            <Input
              id="settings-city"
              name="city"
              defaultValue={defaults.city}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="settings-region"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Region
            </label>
            <Input
              id="settings-region"
              name="region"
              defaultValue={defaults.region}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="settings-country"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Country
            </label>
            <Input
              id="settings-country"
              name="country"
              defaultValue={defaults.country}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="settings-bio"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Short Bio
            </label>
            <Textarea
              id="settings-bio"
              name="bio"
              rows={4}
              defaultValue={defaults.bio}
              placeholder="A concise introduction for your future member-facing profile surfaces."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="settings-notes"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
            >
              Private Notes
            </label>
            <Textarea
              id="settings-notes"
              name="notes"
              rows={4}
              defaultValue={defaults.notes}
              placeholder="Internal profile notes for future manual consultation preparation."
            />
          </div>
        </div>
      </Card>

      {state.message ? (
        <p
          aria-live="polite"
          className="rounded-[var(--radius-lg)] border px-4 py-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]"
          style={{
            borderColor:
              state.status === "error"
                ? "rgba(205,143,143,0.35)"
                : "rgba(215,187,131,0.25)",
            background:
              state.status === "error"
                ? "rgba(90,30,30,0.2)"
                : "rgba(215,187,131,0.08)",
          }}
        >
          {state.message}
        </p>
      ) : null}

      <Button size="lg" type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
