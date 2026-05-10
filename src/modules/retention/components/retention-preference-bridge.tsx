"use client";

import { useEffect } from "react";
import {
  writeRetentionPreferenceSnapshot,
  type RetentionSurfaceKey,
} from "@/modules/retention/preferences";

type RetentionPreferenceBridgeProps = {
  section: RetentionSurfaceKey;
  preferredSignSlug?: string | null;
};

export function RetentionPreferenceBridge({
  section,
  preferredSignSlug = null,
}: Readonly<RetentionPreferenceBridgeProps>) {
  useEffect(() => {
    writeRetentionPreferenceSnapshot({
      lastSection: section,
      preferredSignSlug,
      lastVisitedSignSlug: preferredSignSlug,
    });
  }, [preferredSignSlug, section]);

  return null;
}
