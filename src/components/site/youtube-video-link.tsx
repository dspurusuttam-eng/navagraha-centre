"use client";

import { trackEvent } from "@/lib/analytics/track-event";
import type { YoutubeVideo } from "@/lib/youtube/channel-feed";

/**
 * One rail card: fixed-size lazy thumbnail (width/height reserved — no layout
 * shift), opens the video on YouTube. Click is recorded anonymously.
 */
export function YoutubeVideoLink({
  video,
  index,
}: Readonly<{ video: YoutubeVideo; index: number }>) {
  return (
    <a
      className="w-52 shrink-0 overflow-hidden rounded-[var(--ui-radius-xl)] border border-[color:var(--ui-color-border-subtle)] bg-white shadow-[var(--ui-shadow-sm)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-color-focus)] motion-reduce:hover:translate-y-0"
      href={video.watchUrl}
      rel="noreferrer"
      target="_blank"
      onClick={() =>
        trackEvent(
          "youtube_video_click",
          { source: video.videoId, section: "home-rail" },
          { dispatch: "idle" }
        )
      }
    >
      {/* hqdefault thumbnails are 480x360; the box reserves 16:9 of the 208px card */}
      <span className="block h-[117px] w-52 overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element -- external
            YouTube thumbnail; a fixed-size lazy <img> avoids widening the
            next/image remote-host allowlist for one host */}
        <img
          alt=""
          className="h-full w-full object-cover"
          decoding="async"
          height={117}
          loading={index < 2 ? "eager" : "lazy"}
          src={video.thumbnailUrl}
          width={208}
        />
      </span>
      <span className="block px-3 py-2.5 text-[0.78rem] font-semibold leading-5 text-[#111111] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
        {video.title}
      </span>
    </a>
  );
}
