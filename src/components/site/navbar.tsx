import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig, type SiteNavItem } from "@/config/site";
import { ShopCartLink } from "@/modules/shop/components/shop-cart-link";

type SiteSection = "marketing" | "app" | "admin";

const sectionConfig: Record<
  SiteSection,
  {
    label: string;
    description: string;
    navigation: readonly SiteNavItem[];
    action: {
      href: string;
      label: string;
    };
  }
> = {
  marketing: {
    label: "Marketing",
    description:
      "Public pages shaped for calm authority, premium trust, and a polished first impression.",
    navigation: siteConfig.marketingNav,
    action: {
      href: "/consultation",
      label: "Book Consultation",
    },
  },
  app: {
    label: "App",
    description:
      "Protected member surfaces for onboarding, consultation booking, chart review, account identity, and future private journeys.",
    navigation: siteConfig.appNav,
    action: {
      href: "/dashboard/consultations/book",
      label: "Book Consultation",
    },
  },
  admin: {
    label: "Admin",
    description:
      "Internal control panel for member access, consultation operations, catalog governance, editorial review, and AI template stewardship.",
    navigation: siteConfig.adminNav,
    action: {
      href: "/dashboard",
      label: "Member Dashboard",
    },
  },
};

export type NavbarProps = {
  section: SiteSection;
};

export function Navbar({ section }: Readonly<NavbarProps>) {
  const currentSection = sectionConfig[section];

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-[rgba(8,7,6,0.8)] backdrop-blur-xl">
      <Container className="py-3 sm:py-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className="font-[family-name:var(--font-display)] text-[1.75rem] text-[color:var(--color-foreground)] transition [transition-duration:var(--motion-duration-base)] hover:text-[color:var(--color-accent)] sm:text-3xl"
                  style={{ letterSpacing: "0.14em" }}
                >
                  {siteConfig.name}
                </Link>
                <span className="inline-flex rounded-[var(--radius-pill)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-accent-soft)] px-3 py-1 text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                  {currentSection.label}
                </span>
              </div>
              <p className="max-w-3xl text-[0.78rem] leading-[var(--line-height-copy)] text-[color:var(--color-muted)] sm:text-[length:var(--font-size-body-sm)]">
                {currentSection.description}
              </p>
            </div>

            <Link
              href={currentSection.action.href}
              className={buttonStyles({
                size: "sm",
                tone: section === "marketing" ? "accent" : "secondary",
              })}
            >
              {currentSection.action.label}
            </Link>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] p-2">
            <nav
              aria-label={`${currentSection.label} navigation`}
              className="flex flex-wrap items-center gap-1.5"
            >
              {currentSection.navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[var(--radius-pill)] border border-transparent px-3 py-2 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)] transition [transition-duration:var(--motion-duration-base)] [transition-timing-function:var(--ease-standard)] hover:border-[color:var(--color-border)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[color:var(--color-foreground)]"
                >
                  {item.label}
                </Link>
              ))}
              {section === "marketing" ? <ShopCartLink /> : null}
            </nav>
          </div>
        </div>
      </Container>
    </header>
  );
}
