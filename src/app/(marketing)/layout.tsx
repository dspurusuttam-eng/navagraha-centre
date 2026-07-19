import { MobileBottomActionBar } from "@/components/site/mobile-bottom-action-bar";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();

  // Dock clearance lives once, on the footer's bottom padding — no duplicate spacer here.
  return (
    <div className="min-h-dvh">
      <div className="min-w-0">{children}</div>
      <MobileBottomActionBar
        locale={locale}
        hasExplicitLocalePrefix={hasExplicitLocalePrefix}
      />
    </div>
  );
}
