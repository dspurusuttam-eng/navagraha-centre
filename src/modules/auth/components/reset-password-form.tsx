"use client";

import Link from "next/link";
import { useState } from "react";
import { resetPassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ResetPasswordFormProps = {
  token: string | null;
  resetError: string | null;
};

export function ResetPasswordForm({
  token,
  resetError,
}: Readonly<ResetPasswordFormProps>) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!token) {
      setErrorMessage(
        "Reset token is missing. Please request a new password reset link."
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get("newPassword")?.toString() ?? "";
    const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

    if (newPassword !== confirmPassword) {
      setErrorMessage("Password confirmation does not match.");
      return;
    }

    setIsPending(true);

    try {
      const result = await resetPassword({
        token,
        newPassword,
      });

      if (result.error) {
        setErrorMessage(
          result.error.message ?? "Password reset could not be completed."
        );
        return;
      }

      setSuccessMessage(
        "Password reset completed. You can now sign in with your new password."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Password reset could not be completed."
      );
    } finally {
      setIsPending(false);
    }
  }

  const currentErrorMessage =
    errorMessage ??
    (resetError === "INVALID_TOKEN"
      ? "This reset link is invalid or expired. Request a new one."
      : null);

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <h2
          className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
          style={{ letterSpacing: "var(--tracking-display)" }}
        >
          Set a new password
        </h2>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          Complete account recovery by setting a secure new password.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="reset-password-new"
            className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
          >
            New Password
          </label>
          <Input
            id="reset-password-new"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="reset-password-confirm"
            className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
          >
            Confirm New Password
          </label>
          <Input
            id="reset-password-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
      </div>

      {currentErrorMessage ? (
        <p
          aria-live="polite"
          className="rounded-[var(--radius-lg)] border border-[rgba(205,143,143,0.35)] bg-[rgba(90,30,30,0.2)] px-4 py-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]"
        >
          {currentErrorMessage}
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

      <Button
        fullWidth
        size="lg"
        type="submit"
        disabled={isPending || !token || Boolean(successMessage)}
      >
        {isPending ? "Resetting Password..." : "Reset Password"}
      </Button>

      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
        Back to{" "}
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

