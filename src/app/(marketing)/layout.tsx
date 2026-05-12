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

  return (
    <div className="min-h-dvh pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="min-w-0">{children}</div>
      <MobileBottomActionBar
        locale={locale}
        hasExplicitLocalePrefix={hasExplicitLocalePrefix}
      />
    </div>
  );
}
