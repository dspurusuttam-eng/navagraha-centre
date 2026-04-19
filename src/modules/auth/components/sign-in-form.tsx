"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SignInFormProps = {
  callbackUrl?: string;
  signUpHref?: string;
};

export function SignInForm({
  callbackUrl = "/dashboard",
  signUpHref = "/sign-up",
}: Readonly<SignInFormProps>) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await signIn.email({
        email: formData.get("email")?.toString() ?? "",
        password: formData.get("password")?.toString() ?? "",
        callbackURL: callbackUrl,
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Unable to sign in.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in."
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
          Sign in to your private workspace
        </h2>
        <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
          Access your account, profile settings, and upcoming application
          features from a protected dashboard foundation.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="sign-in-email"
            className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
          >
            Email
          </label>
          <Input
            id="sign-in-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="sign-in-password"
            className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]"
          >
            Password
          </label>
          <Input
            id="sign-in-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />
          <div className="pt-1 text-right">
            <Link
              href="/forgot-password"
              className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
            >
              Forgot password?
            </Link>
          </div>
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
        {isPending ? "Signing In..." : "Sign In"}
      </Button>

      <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
        New here?{" "}
        <Link
          href={signUpHref}
          className="text-[color:var(--color-accent)] transition hover:text-[color:var(--color-foreground)]"
        >
          Create your account
        </Link>
      </p>
    </form>
  );
}
