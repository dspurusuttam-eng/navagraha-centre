import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

type SiteSection = "marketing" | "app" | "admin";

export function SiteChrome({
  section,
  children,
}: Readonly<{
  section: SiteSection;
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar section={section} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
