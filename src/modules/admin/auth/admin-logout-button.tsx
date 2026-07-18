"use client";

// Claude Admin Console C3A1 — admin sign-out button (client).
import { adminSignOutAction } from "@/modules/admin/auth/actions";

export function AdminLogoutButton({ className }: Readonly<{ className?: string }>) {
  return (
    <form action={adminSignOutAction}>
      <button type="submit" className={className ?? "text-sm underline underline-offset-2"}>
        Sign out
      </button>
    </form>
  );
}
