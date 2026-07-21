"use client";

import { useState, useTransition } from "react";
import {
  notifyReadersOfArticle,
  sendTestNotification,
  type NotifyState,
} from "@/modules/admin/notifications/notification-actions";

const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-60";

function StatusLine({ state }: Readonly<{ state: NotifyState | null }>) {
  if (!state) return null;
  return (
    <p
      className={`text-sm font-medium ${state.ok ? "text-green-700" : "text-red-700"}`}
      role="status"
    >
      {state.message}
    </p>
  );
}

/** "Notify readers" for a published article, with a confirm step (dedupe is server-side). */
export function NotifyReadersButton({ articleId }: Readonly<{ articleId: string }>) {
  const [confirming, setConfirming] = useState(false);
  const [state, setState] = useState<NotifyState | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-2">
      {confirming ? (
        <div className="grid gap-2 rounded-md border border-amber-300 bg-amber-50 p-3">
          <p className="text-sm text-amber-900">
            Send a push notification about this article to every subscriber?
            This can be done only once per article.
          </p>
          <div className="flex gap-2">
            <button
              className={buttonClass}
              disabled={pending}
              type="button"
              onClick={() =>
                startTransition(async () => {
                  setState(await notifyReadersOfArticle(articleId));
                  setConfirming(false);
                })
              }
            >
              {pending ? "Sending…" : "Yes, notify readers"}
            </button>
            <button
              className={buttonClass}
              disabled={pending}
              type="button"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className={buttonClass} type="button" onClick={() => setConfirming(true)}>
          Notify readers (push)
        </button>
      )}
      <StatusLine state={state} />
    </div>
  );
}

/** Sends a test push to THIS device's own subscription (never to readers). */
export function TestNotificationButton() {
  const [state, setState] = useState<NotifyState | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker?.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        if (!subscription) {
          setState({
            ok: false,
            message:
              "This device is not subscribed. Open the bell in the public header and tap Enable Notifications first.",
          });
          return;
        }
        setState(await sendTestNotification(subscription.endpoint));
      } catch {
        setState({ ok: false, message: "Could not read this device's subscription." });
      }
    });
  }

  return (
    <div className="grid gap-2">
      <button className={buttonClass} disabled={pending} type="button" onClick={run}>
        {pending ? "Sending…" : "Send test notification to this device"}
      </button>
      <StatusLine state={state} />
    </div>
  );
}
