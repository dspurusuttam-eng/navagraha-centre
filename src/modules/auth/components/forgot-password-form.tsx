"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString().trim() ?? "";
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : "/reset-password";

    try {
      const result = await requestPasswordReset({
        email,
        redirectTo,
      });

      if (result.error) {
        setErrorMessage(
          result.error.message ??
            "We couldn't start password recovery. Please try again."
        );
        return;
      }

      setSuccessMessage(
        "If this email exists in your account records, a reset link has been sent."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't start password recovery. Please try again."
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
          Recover account access
        </h2>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          Enter your account email to receive a secure password reset link.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="forgot-password-email"
          className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
        >
          Email
        </label>
        <Input
          id="forgot-password-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      {errorMessage ? (
        <p
          aria-live="polite"
          className="rounded-[var(--radius-lg)] border border-[rgba(205,143,143,0.35)] bg-[rgba(90,30,30,0.2)] px-4 py-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]"
        >
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p
          aria-live="polite"
          className="rounded-[var(--radius-lg)] border border-[rgba(215,187,131,0.25)] bg-[rgba(215,187,131,0.08)] px-4 py-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]"
        >
          {successMessage}
        </p>
      ) : null}

      <Button fullWidth size="lg" type="submit" disabled={isPending}>
        {isPending ? "Sending Reset Link..." : "Send Reset Link"}
      </Button>

      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
        Return to{" "}
        <Link
          href="/sign-in"
          className="text-[color:var(--color-accent)] transition hover:text-[color:var(--color-foreground)]"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}

