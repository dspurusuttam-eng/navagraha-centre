import { Suspense } from "react";
import {
  PremiumBentoSection,
  PremiumSectionHeading,
} from "@/components/ui/premium";
import {
  getYoutubeRailVideos,
  isYoutubeRailEnabled,
  YOUTUBE_CHANNEL_URL,
} from "@/lib/youtube/channel-feed";
import { YoutubeVideoLink } from "@/components/site/youtube-video-link";

/**
 * Homepage YouTube rail: thumbnail cards only (no iframes, ever) — tapping a
 * card opens the video on YouTube, which is the "player after interaction"
 * requirement in its least complex form. Wrapped in Suspense by the caller so
 * the homepage never waits on the feed; failure or the Founder's hide toggle
 * renders nothing.
 */
async function YoutubeRailContent() {
  const enabled = await isYoutubeRailEnabled();
  if (!enabled) return null;

  const videos = await getYoutubeRailVideos();
  if (!videos.length) return null;

  return (
    <PremiumBentoSection className="pt-0">
      <PremiumSectionHeading label="From our YouTube channel" />
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
        {videos.map((video, index) => (
          <YoutubeVideoLink key={video.videoId} index={index} video={video} />
        ))}
      </div>
      <p className="mt-1 text-right">
        <a
          className="text-xs font-semibold text-[color:var(--ui-color-text-muted)] underline-offset-2 hover:underline"
          href={YOUTUBE_CHANNEL_URL}
          rel="noreferrer"
          target="_blank"
        >
          View channel →
        </a>
      </p>
    </PremiumBentoSection>
  );
}

export function YoutubeRail() {
  return (
    <Suspense fallback={null}>
      <YoutubeRailContent />
    </Suspense>
  );
}
