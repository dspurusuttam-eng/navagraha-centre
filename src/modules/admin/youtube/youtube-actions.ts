"use server";

// Founder-gated controls for the homepage YouTube rail.
import { revalidateTag } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import {
  getYoutubeRailVideos,
  YOUTUBE_FEED_TAG,
} from "@/lib/youtube/channel-feed";
import { getAdminPageSessionOrNull } from "@/modules/admin/auth/page-guard";
import { hasAdminAccess } from "@/modules/admin/permissions";

export type YoutubeActionState = { ok: boolean; message: string };

async function requireFounder(): Promise<boolean> {
  const session = await getAdminPageSessionOrNull();
  return Boolean(session && hasAdminAccess(session.adminRoles, ["founder"]));
}

/** Drop the cached feed and fetch fresh, recording the sync outcome. */
export async function refreshYoutubeFeed(): Promise<YoutubeActionState> {
  if (!(await requireFounder())) return { ok: false, message: "Not authorised." };
  revalidateTag(YOUTUBE_FEED_TAG, "max");
  const videos = await getYoutubeRailVideos();
  if (!videos.length) {
    return { ok: false, message: "Refresh failed — feed unreachable or empty (see status)." };
  }
  return { ok: true, message: `Synchronised ${videos.length} video(s).` };
}

export async function setYoutubeRailEnabled(enabled: boolean): Promise<YoutubeActionState> {
  if (!(await requireFounder())) return { ok: false, message: "Not authorised." };
  await getPrisma().youtubeRailState.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", enabled },
    update: { enabled },
  });
  return {
    ok: true,
    message: enabled ? "Rail is now visible on the homepage." : "Rail is now hidden.",
  };
}
