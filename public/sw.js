/*
 * NAVAGRAHA CENTRE service worker — push notifications only.
 *
 * Deliberately NO fetch/caching logic: content freshness stays owned by the
 * server (tag-invalidated caches) and the browser HTTP cache. This worker only
 * displays pushes and opens the target article on tap.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "NAVAGRAHA CENTRE", body: "", url: "/" };
  try {
    data = { ...data, ...event.data.json() };
  } catch {
    /* malformed payload: show the default */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";
  event.waitUntil(
    (async () => {
      // Anonymous open event (aggregate delivery/open tracking).
      try {
        await fetch("/api/analytics/event", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ event: "notification_open", payload: { route: url, source: "push" } }),
        });
      } catch {
        /* analytics is best-effort */
      }
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of allClients) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            await client.navigate(url);
          }
          return;
        }
      }
      await self.clients.openWindow(url);
    })()
  );
});
