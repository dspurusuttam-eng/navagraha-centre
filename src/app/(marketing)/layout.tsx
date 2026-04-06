import { SiteChrome } from "@/components/layout/site-chrome";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteChrome section="marketing">{children}</SiteChrome>;
}
