import { redirectIfAuthenticated } from "@/modules/auth/server";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await redirectIfAuthenticated();

  return children;
}
