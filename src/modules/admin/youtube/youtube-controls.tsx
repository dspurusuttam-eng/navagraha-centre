"use client";

import { useState, useTransition } from "react";
import {
  refreshYoutubeFeed,
  setYoutubeRailEnabled,
  type YoutubeActionState,
} from "@/modules/admin/youtube/youtube-actions";

const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-60";

export function YoutubeControls({ enabled }: Readonly<{ enabled: boolean }>) {
  const [state, setState] = useState<YoutubeActionState | null>(null);
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          className={buttonClass}
          disabled={pending}
          type="button"
          onClick={() =>
            startTransition(async () => setState(await refreshYoutubeFeed()))
          }
        >
          {pending ? "Working…" : "Refresh YouTube now"}
        </button>
        <button
          className={buttonClass}
          disabled={pending}
          type="button"
          onClick={() =>
            startTransition(async () => {
              const next = !isEnabled;
              const result = await setYoutubeRailEnabled(next);
              if (result.ok) setIsEnabled(next);
              setState(result);
            })
          }
        >
          {isEnabled ? "Hide rail on homepage" : "Show rail on homepage"}
        </button>
      </div>
      {state ? (
        <p
          className={`text-sm font-medium ${state.ok ? "text-green-700" : "text-red-700"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
