// Claude Admin Console C3B1 — protected placeholder section body (pure/server-safe).
import type { ReactNode } from "react";

export function AdminPlaceholder({
  title,
  description,
  children,
}: Readonly<{ title: string; description: string; children?: ReactNode }>) {
  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-prose text-sm text-neutral-600">{description}</p>
      </header>
      <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
        This section is a protected placeholder. Management tools for it arrive in a later phase.
      </div>
      {children}
    </section>
  );
}
