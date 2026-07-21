// Founder YouTube rail console: sync status, manual refresh, show/hide.
import type { Metadata } from "next";
import { getPrisma } from "@/lib/prisma";
import {
  YOUTUBE_CHANNEL_ID,
  YOUTUBE_CHANNEL_URL,
} from "@/lib/youtube/channel-feed";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { hasAdminAccess } from "@/modules/admin/permissions";
import { YoutubeControls } from "@/modules/admin/youtube/youtube-controls";

export const metadata: Metadata = {
  title: "YouTube — Admin Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminYoutubePage() {
  const session = await getAdminPageSessionOrNull();
  if (!hasAdminAccess(session?.adminRoles ?? [], ["founder"])) {
    return (
      <section className="mx-auto max-w-3xl space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">YouTube</h1>
        <p className="text-sm text-neutral-600">Founder access required.</p>
      </section>
    );
  }

  const state = await getPrisma()
    .youtubeRailState.findUnique({ where: { id: "singleton" } })
    .catch(() => null);
  const enabled = state?.enabled ?? true;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">YouTube rail</h1>
        <p className="mt-1 text-sm text-neutral-600">
          The homepage rail shows the channel&apos;s newest videos automatically
          (checked at most hourly, no API key). New uploads appear on their own —
          use Refresh only when you want them immediately.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-neutral-500">Channel</dt>
            <dd className="font-semibold">
              <a className="underline-offset-2 hover:underline" href={YOUTUBE_CHANNEL_URL} rel="noreferrer" target="_blank">
                @NAVAGRAHAASTROLOGICALCENTRE
              </a>
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-neutral-500">Channel ID (permanent)</dt>
            <dd className="font-mono text-xs">{YOUTUBE_CHANNEL_ID}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-neutral-500">Rail visibility</dt>
            <dd className="font-semibold">{enabled ? "Visible" : "Hidden"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-neutral-500">Last synchronisation</dt>
            <dd className="font-semibold">
              {state?.lastSyncAt
                ? state.lastSyncAt.toISOString().slice(0, 16).replace("T", " ") + " UTC"
                : "not yet run"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-neutral-500">Last error</dt>
            <dd className={state?.lastError ? "font-semibold text-red-700" : "text-neutral-500"}>
              {state?.lastError ?? "none"}
            </dd>
          </div>
        </dl>
      </div>

      <YoutubeControls enabled={enabled} />
    </section>
  );
}
