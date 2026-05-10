import Script from "next/script";
import { monetizationConfig } from "@/lib/monetization/monetization-config";
import { hasAdvertisingConsentFromRequest } from "@/lib/consent";

export async function AdSenseScript() {
  const canRenderAds = await hasAdvertisingConsentFromRequest().catch(() => false);

  if (
    !canRenderAds ||
    !monetizationConfig.enableAdsense ||
    !monetizationConfig.adsensePublisherId
  ) {
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
