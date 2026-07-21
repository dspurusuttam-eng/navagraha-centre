// Official NAVAGRAHA CENTRE channel feed — keyless architecture.
//
// YouTube publishes a stable per-channel RSS feed that requires no API key and
// no quota. The channel ID below is the PERMANENT id resolved from the official
// handle @NAVAGRAHAASTROLOGICALCENTRE (the page's own externalId + its own RSS
// link both name it); handles can change, channel IDs cannot. The feed is
// fetched server-side inside unstable_cache (1 h revalidate + tag), so the
// homepage never waits on YouTube: failures degrade to an empty rail.
import "server-only";

import { unstable_cache } from "next/cache";
import { getPrisma } from "@/lib/prisma";

export const YOUTUBE_CHANNEL_ID = "UCjBs9jMONNxIjCUEEsmHMmQ";
export const YOUTUBE_CHANNEL_URL =
  "https://www.youtube.com/@NAVAGRAHAASTROLOGICALCENTRE";
export const YOUTUBE_FEED_TAG = "youtube-feed";

const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
const MAX_VIDEOS = 8;

export type YoutubeVideo = {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  watchUrl: string;
};

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Minimal, dependency-free parse of the fixed-shape YouTube RSS document. */
function parseFeed(xml: string): YoutubeVideo[] {
  const videos: YoutubeVideo[] = [];
  const entryPattern = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;
  while ((match = entryPattern.exec(xml)) !== null && videos.length < MAX_VIDEOS) {
    const entry = match[1];
    const videoId = /<yt:videoId>([A-Za-z0-9_-]{5,20})<\/yt:videoId>/.exec(entry)?.[1];
    const title = /<title>([\s\S]*?)<\/title>/.exec(entry)?.[1];
    const publishedAt = /<published>([^<]+)<\/published>/.exec(entry)?.[1];
    if (!videoId || !title) continue;
    videos.push({
      videoId,
      title: decodeEntities(title.trim()).slice(0, 200),
      publishedAt: publishedAt ?? "",
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    });
  }
  return videos;
}

async function fetchFeed(): Promise<YoutubeVideo[]> {
  const response = await fetch(FEED_URL, {
    headers: { "user-agent": "NavagrahaCentre/1.0 (+https://www.navagrahacentre.com)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`feed status ${response.status}`);
  }
  const videos = parseFeed(await response.text());
  if (!videos.length) {
    throw new Error("feed parsed to zero videos");
  }
  return videos;
}

/** Record the sync outcome for the Admin app (best-effort). */
async function recordSync(error: string | null): Promise<void> {
  try {
    await getPrisma().youtubeRailState.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", lastSyncAt: new Date(), lastError: error },
      update: { lastSyncAt: new Date(), lastError: error },
    });
  } catch {
    /* status recording must never break the rail */
  }
}

// Failures are NOT cached: the error is thrown inside the cached fn, so
// unstable_cache stores nothing and the next request retries.
const readFeedCached = unstable_cache(
  async (): Promise<YoutubeVideo[]> => fetchFeed(),
  ["youtube-channel-feed", YOUTUBE_CHANNEL_ID],
  { tags: [YOUTUBE_FEED_TAG], revalidate: 3600 }
);

/** Rail data: latest videos, or [] when sync fails (rail hides gracefully). */
export async function getYoutubeRailVideos(): Promise<YoutubeVideo[]> {
  try {
    const videos = await readFeedCached();
    await recordSync(null);
    return videos;
  } catch (error) {
    await recordSync(error instanceof Error ? error.message.slice(0, 300) : "unknown error");
    return [];
  }
}

/** Founder toggle (defaults to enabled when the row does not exist yet). */
export async function isYoutubeRailEnabled(): Promise<boolean> {
  try {
    const state = await getPrisma().youtubeRailState.findUnique({ where: { id: "singleton" } });
    return state?.enabled ?? true;
  } catch {
    return false;
  }
}
