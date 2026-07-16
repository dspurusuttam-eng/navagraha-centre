"use server";

// Claude Admin Console C3A1 — private admin authentication server actions.
// Uses Better Auth server API (preserved for Admin use) + AdminRoleAssignment gating +
// deterministic login rate limiting. Never re-enables public sign-up / dashboard.
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { sanitizeAdminRedirect } from "@/modules/admin/auth/redirect";
import { createLoginRateLimiter } from "@/modules/admin/auth/rate-limit";

// Module-level limiter: 5 failures / 15 min → 15 min lockout, keyed by client IP.
const loginRateLimiter = createLoginRateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60_000,
  blockMs: 15 * 60_000,
});

export type AdminSignInState = { error: string | null };

async function clientKey(): Promise<string> {
  const hdrs = await headers();
  const forwarded = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || hdrs.get("x-real-ip")?.trim() || "unknown";
}

export async function adminSignInAction(_prev: AdminSignInState, formData: FormData): Promise<AdminSignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = sanitizeAdminRedirect(String(formData.get("redirectTo") ?? "/admin"));
  const key = await clientKey();
  const now = Date.now();

  if (!loginRateLimiter.check(key, now).allowed) {
    return { error: "Too many attempts. Please wait and try again later." };
  }
  if (!email || !password) {
    loginRateLimiter.recordFailure(key, now);
    return { error: "Enter your admin email and password." };
  }

  const hdrs = await headers();
  try {
    await getAuth().api.signInEmail({ body: { email, password }, headers: hdrs });
  } catch {
    loginRateLimiter.recordFailure(key, now);
    return { error: "Invalid credentials." };
  }

  // Verify the signed-in account is an approved admin; otherwise sign back out.
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    loginRateLimiter.recordFailure(key, now);
    return { error: "Invalid credentials." };
  }
  const assignments = await getPrisma().adminRoleAssignment.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!assignments.length) {
    await getAuth().api.signOut({ headers: await headers() });
    return { error: "This account does not have Admin access." };
  }

  loginRateLimiter.reset(key);
  redirect(redirectTo);
}

export async function adminSignOutAction(): Promise<void> {
  await getAuth().api.signOut({ headers: await headers() });
  redirect("/admin/login");
}
