// Claude Admin Console C3A1 — layout for the unauthenticated admin gate (login/denied).
// Deliberately does NOT require an admin session (that would create a redirect loop).
export const dynamic = "force-dynamic";

export default function AdminGateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-neutral-50">{children}</div>;
}
