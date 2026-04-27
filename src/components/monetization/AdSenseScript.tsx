import Script from "next/script";
import { monetizationConfig } from "@/lib/monetization/monetization-config";

export function AdSenseScript() {
  if (!monetizationConfig.enableAdsense || !monetizationConfig.adsensePublisherId) {
    return null;
  }

  return (
    <Script
      id="adsense-loader"
      strategy="afterInteractive"
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(monetizationConfig.adsensePublisherId)}`}
    />
  );
}

