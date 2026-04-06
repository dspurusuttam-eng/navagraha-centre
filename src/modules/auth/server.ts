import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import {
  hasAdminAccess,
  type AdminRoleKey,
  type AdminRoleSummary,
} from "@/modules/admin/permissions";

export async function getSession() {
  return getAuth().api.getSession({
    headers: await headers(),
  });
}

export async function requireUserSession() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function redirectIfAuthenticated(destination = "/dashboard") {
  const session = await getSession();

  if (session) {
    redirect(destination);
  }
}

type RequireAdminSessionOptions = {
  allowedRoles?: readonly AdminRoleKey[];
  fallbackPath?: string;
};

export async function requireAdminSession(
  options: RequireAdminSessionOptions = {}
) {
  const session = await requireUserSession();
  const assignments = await getPrisma().adminRoleAssignment.findMany({
    where: { userId: session.user.id },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      role: {
        select: {
          key: true,
          name: true,
        },
      },
    },
  });

  const adminRoles: AdminRoleSummary[] = assignments.map(
    (assignment) => assignment.role
  );

  if (!adminRoles.length) {
    redirect(options.fallbackPath ?? "/dashboard");
  }

  if (
    options.allowedRoles?.length &&
    !hasAdminAccess(adminRoles, options.allowedRoles)
  ) {
    redirect(options.fallbackPath ?? "/admin");
  }

  return {
    ...session,
    adminRole: adminRoles[0],
    adminRoles,
  };
}

export type AppSession = NonNullable<Awaited<ReturnType<typeof getSession>>>;
export type AdminSession = Awaited<ReturnType<typeof requireAdminSession>>;
