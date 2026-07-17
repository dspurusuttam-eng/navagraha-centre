"use server";

// Claude C9C1C — Preview-only founder bootstrap server action.
// Re-validates every gate condition here (never trusts the page-load check), creates the
// account through Better Auth's own signUpEmail (no direct identity-table insert), then
// creates one idempotent founder assignment. Never logs the password.
import { getAuth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { checkFounderBootstrapEligible, FOUNDER_BOOTSTRAP_EMAIL } from "@/modules/admin/bootstrap/founder-bootstrap-gate";

export type FounderBootstrapState = { status: "idle" | "error" | "success"; error: string | null };

export async function bootstrapFounderAction(
  _prev: FounderBootstrapState,
  formData: FormData,
): Promise<FounderBootstrapState> {
  const gate = await checkFounderBootstrapEligible();
  if (!gate.eligible) {
    return { status: "error", error: "This setup step is no longer available." };
  }

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { status: "error", error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { status: "error", error: "Passwords do not match." };
  }

  const auth = getAuth();
  const prisma = getPrisma();

  try {
    await auth.api.signUpEmail({
      body: { email: FOUNDER_BOOTSTRAP_EMAIL, password, name: "Navagraha Centre" },
    });
  } catch {
    return { status: "error", error: "Could not create the account. Please try again." };
  }

  const user = await prisma.user.findFirst({ where: { email: FOUNDER_BOOTSTRAP_EMAIL } });
  if (!user) {
    return { status: "error", error: "Account creation did not complete. Please try again." };
  }

  const role = await prisma.adminRole.findFirst({ where: { key: "founder" } });
  if (!role) {
    return { status: "error", error: "The founder role is not configured." };
  }

  await prisma.adminRoleAssignment.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    create: { userId: user.id, roleId: role.id },
    update: {},
  });

  return { status: "success", error: null };
}
