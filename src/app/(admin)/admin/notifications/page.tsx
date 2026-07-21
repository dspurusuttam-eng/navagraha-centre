// Founder notifications console: subscriber count, broadcast history, test send.
import type { Metadata } from "next";
import { getPrisma } from "@/lib/prisma";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { hasAdminAccess } from "@/modules/admin/permissions";
import { TestNotificationButton } from "@/modules/admin/notifications/notification-controls";

export const metadata: Metadata = {
  title: "Notifications — Admin Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatWhen(value: Date) {
  return value.toISOString().slice(0, 16).replace("T", " ") + " UTC";
}

export default async function AdminNotificationsPage() {
  const session = await getAdminPageSessionOrNull();
  const isFounder = hasAdminAccess(session?.adminRoles ?? [], ["founder"]);

  if (!isFounder) {
    return (
      <section className="mx-auto max-w-3xl space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-neutral-600">Founder access required.</p>
      </section>
    );
  }

  const prisma = getPrisma();
  const [subscriberCount, staleCount, sends] = await Promise.all([
    prisma.pushSubscription.count(),
    prisma.pushSubscription.count({ where: { failCount: { gt: 0 } } }),
    prisma.notificationSend.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Push announcements for newly published Desk articles. Readers opt in
          from the bell in the public header; each article can be announced once,
          from its edit page.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Subscribers
          </p>
          <p className="mt-1 text-2xl font-semibold">{subscriberCount}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Flaky (will self-clean)
          </p>
          <p className="mt-1 text-2xl font-semibold">{staleCount}</p>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold">Test</h2>
        <p className="mb-3 mt-1 text-sm text-neutral-600">
          Sends only to this device&apos;s own subscription — never to readers.
        </p>
        <TestNotificationButton />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold">Broadcast history</h2>
        {sends.length === 0 ? (
          <p className="text-sm text-neutral-600">No announcements sent yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {sends.map((send) => (
              <li key={send.id} className="py-2.5">
                <p className="text-sm font-semibold text-neutral-900">{send.title}</p>
                <p className="mt-0.5 text-xs text-neutral-600">
                  {formatWhen(send.createdAt)} · sent {send.total} · delivered {send.succeeded} · failed {send.failed}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
