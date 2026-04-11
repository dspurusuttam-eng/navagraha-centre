import { getPublicEnvironment } from "@/config/env";

export type SiteNavItem = {
  href: string;
  label: string;
};

export type SiteLinkGroup = {
  title: string;
  links: readonly SiteNavItem[];
};

function normalizeSiteUrl(url: string) {
  return url.replace(/\/+$/, "");
}

const publicEnvironment = getPublicEnvironment();
const siteUrl = normalizeSiteUrl(publicEnvironment.siteUrl);
const siteName = publicEnvironment.siteName;

const marketingNav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/insights", label: "Insights" },
  { href: "/shop", label: "Shop" },
  { href: "/joy-prakash-sarmah", label: "Astrologer" },
  { href: "/contact", label: "Contact" },
] satisfies SiteNavItem[];

const appNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/onboarding", label: "Onboarding" },
  { href: "/dashboard/ask-my-chart", label: "Ask My Chart" },
  { href: "/dashboard/consultations", label: "Consultations" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/chart", label: "Chart" },
  { href: "/dashboard/report", label: "Report" },
  { href: "/settings", label: "Settings" },
] satisfies SiteNavItem[];

const adminNav = [{ href: "/admin", label: "Admin" }] satisfies SiteNavItem[];

const foundationNav = [
  { href: "/style-guide", label: "Style Guide" },
] satisfies SiteNavItem[];

const offeringsNav = [
  { href: "/consultation", label: "Consultation" },
  { href: "/shop", label: "Shop" },
] satisfies SiteNavItem[];

const profileNav = [
  { href: "/joy-prakash-sarmah", label: "Joy Prakash Sarmah" },
] satisfies SiteNavItem[];

export const siteConfig = {
  name: siteName,
  url: siteUrl,
  description:
    "Luxury astrology consultations, remedy guidance, and spiritual commerce shaped with calm, clarity, and Joy Prakash Sarmah's visible authority.",
  marketingNav,
  appNav,
  adminNav,
  foundationNav,
  footerGroups: [
    { title: "Explore", links: marketingNav },
    { title: "Offerings", links: offeringsNav },
    { title: "Astrologer", links: profileNav },
  ] satisfies SiteLinkGroup[],
} as const;
