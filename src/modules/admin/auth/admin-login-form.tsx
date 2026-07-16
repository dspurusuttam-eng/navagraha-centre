"use client";

// Claude Admin Console C3A1 — private admin login form (client).
import { useActionState } from "react";
import { adminSignInAction, type AdminSignInState } from "@/modules/admin/auth/actions";

const INITIAL_STATE: AdminSignInState = { error: null };

export function AdminLoginForm({ redirectTo }: Readonly<{ redirectTo: string }>) {
  const [state, formAction, pending] = useActionState(adminSignInAction, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="space-y-1">
        <label htmlFor="admin-email" className="block text-sm font-medium">
          Admin email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="w-full rounded-md border px-3 py-2"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="admin-password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
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
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
