import { getPublicEnvironment } from "@/config/env";
import { globalCtaCopy } from "@/modules/localization/copy";

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
  { href: "/sign-up", label: "Kundli Chart" },
  { href: "/marriage-compatibility", label: "Compatibility" },
  { href: "/daily-rashifal", label: "Daily Rashifal" },
  { href: "/kundli-ai", label: "NAVAGRAHA AI" },
  { href: "/career-report", label: "Reports" },
  { href: "/consultation", label: "Consultation" },
  { href: "/shop", label: "Shop" },
  { href: "/insights", label: "Insights" },
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
  { href: "/sign-up", label: globalCtaCopy.generateKundli },
  { href: "/marriage-compatibility", label: "Compatibility" },
  { href: "/daily-rashifal", label: "Daily Rashifal" },
  { href: "/career-report", label: "Reports" },
  { href: "/consultation", label: "Consultation" },
  { href: "/kundli-ai", label: "NAVAGRAHA AI" },
  { href: "/sign-in", label: "Login" },
  { href: "/dashboard", label: "Account" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Plans" },
  { href: "/shop", label: "Shop" },
  { href: "/insights", label: "Insights" },
] satisfies SiteNavItem[];

const profileNav = [
  { href: "/joy-prakash-sarmah", label: "Joy Prakash Sarmah" },
] satisfies SiteNavItem[];

const supportNav = [
  { href: "/sign-in", label: "Login" },
  { href: "/dashboard", label: "Account" },
  { href: "/contact", label: "Contact" },
  { href: "/forgot-password", label: "Password Reset" },
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
    { title: "Navigation", links: marketingNav },
    { title: "Guidance", links: offeringsNav },
    { title: "Support", links: supportNav },
    { title: "Astrologer", links: profileNav },
  ] satisfies SiteLinkGroup[],
} as const;
