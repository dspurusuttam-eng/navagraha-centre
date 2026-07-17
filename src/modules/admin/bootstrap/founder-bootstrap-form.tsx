"use client";

// Claude C9C1C — Preview-only founder bootstrap form (client).
// The email is fixed server-side in the action; this form never collects or submits it.
import { useActionState } from "react";
import { bootstrapFounderAction, type FounderBootstrapState } from "@/modules/admin/bootstrap/founder-bootstrap-actions";

const INITIAL_STATE: FounderBootstrapState = { status: "idle", error: null };

export function FounderBootstrapForm({ email }: Readonly<{ email: string }>) {
  const [state, formAction, pending] = useActionState(bootstrapFounderAction, INITIAL_STATE);

  if (state.status === "success") {
    return (
      <p role="status" className="text-sm text-green-700">
        Founder account created. This setup step is now disabled — sign in at{" "}
        <a href="/admin/login" className="underline">
          /admin/login
        </a>
        .
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-1">
        <span className="block text-sm font-medium">Founder account</span>
        <p className="text-sm text-neutral-600">{email}</p>
      </div>
      <div className="space-y-1">
        <label htmlFor="bootstrap-password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="bootstrap-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border px-3 py-2"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="bootstrap-confirm-password" className="block text-sm font-medium">
          Confirm password
        </label>
        <input
          id="bootstrap-confirm-password"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border px-3 py-2"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create founder account"}
      </button>
    </form>
  );
}
