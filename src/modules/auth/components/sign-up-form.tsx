"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { trackEvent } from "@/lib/analytics/track-event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignUpForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await signUp.email({
        name: formData.get("name")?.toString() ?? "",
        email: formData.get("email")?.toString() ?? "",
        password: formData.get("password")?.toString() ?? "",
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setErrorMessage(
          result.error.message ?? "Unable to create your account."
        );
        return;
      }

      trackEvent("user_signup", {
        page: "/sign-up",
        feature: "auth-signup",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create your account."
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <h2
          className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
          style={{ letterSpacing: "var(--tracking-display)" }}
        >
          Create a calm, private member account
        </h2>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          Start your protected workspace now, then complete your profile and
          future astrological records from inside the dashboard shell.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="sign-up-name"
            className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
          >
            Full Name
          </label>
          <Input
            id="sign-up-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="sign-up-email"
            className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
          >
            Email
          </label>
          <Input
            id="sign-up-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="sign-up-password"
            className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
          >
            Password
          </label>
          <Input
            id="sign-up-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Choose a secure password"
            required
          />
        </div>
      </div>

      {errorMessage ? (
        <p
          aria-live="polite"
          className="rounded-[var(--radius-lg)] border border-[rgba(205,143,143,0.35)] bg-[rgba(90,30,30,0.2)] px-4 py-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]"
        >
          {errorMessage}
        </p>
      ) : null}

      <Button fullWidth size="lg" type="submit" disabled={isPending}>
        {isPending ? "Creating Account..." : "Create Account"}
      </Button>

      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
        Already have access?{" "}
        <Link
          href="/sign-in"
          className="text-[color:var(--color-accent)] transition hover:text-[color:var(--color-foreground)]"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
