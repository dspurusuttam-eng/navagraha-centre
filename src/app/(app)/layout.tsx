import { AppShell } from "@/components/app/app-shell";
import { SiteChrome } from "@/components/layout/site-chrome";
import { requireUserSession } from "@/modules/auth/server";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireUserSession();

  return (
    <SiteChrome section="app">
      <AppShell userName={session.user.name} userEmail={session.user.email}>
        {children}
      </AppShell>
    </SiteChrome>
  );
}
