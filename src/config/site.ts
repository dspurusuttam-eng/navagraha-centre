import { getPublicEnvironment } from "@/config/env";
import {
  globalFooterCopy,
  globalNavigationCopy,
} from "@/modules/localization/copy";

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
  { href: "/", label: globalNavigationCopy.home },
  { href: "/from-the-desk", label: "Desk" },
  { href: "/consultation", label: globalNavigationCopy.consultation },
  { href: "/dashboard", label: globalNavigationCopy.account },
] satisfies SiteNavItem[];

const appNav = [
  { href: "/dashboard", label: globalNavigationCopy.dashboard },
  { href: "/dashboard/onboarding", label: globalNavigationCopy.onboarding },
  { href: "/dashboard/ask-my-chart", label: globalNavigationCopy.askMyChart },
  { href: "/dashboard/consultations", label: globalNavigationCopy.consultations },
  { href: "/dashboard/orders", label: globalNavigationCopy.orders },
  { href: "/dashboard/chart", label: globalNavigationCopy.chart },
  { href: "/dashboard/report", label: globalNavigationCopy.report },
  { href: "/settings", label: globalNavigationCopy.settings },
] satisfies SiteNavItem[];

const adminNav = [{ href: "/admin", label: globalNavigationCopy.admin }] satisfies SiteNavItem[];

const foundationNav = [
  { href: "/style-guide", label: globalNavigationCopy.styleGuide },
] satisfies SiteNavItem[];

const offeringsNav = [
  { href: "/consultation", label: globalNavigationCopy.consultation },
  { href: "/joy-prakash-sarmah", label: "Acharya" },
  { href: "/from-the-desk", label: "Desk" },
  { href: "/learn", label: "Learn" },
  { href: "/methodology", label: "Methodology" },
  { href: "/sign-in", label: globalNavigationCopy.login },
  { href: "/sign-in", label: globalNavigationCopy.account },
  { href: "/support", label: "Support" },
  { href: "/contact", label: globalFooterCopy.links.contact },
  { href: "/privacy", label: globalFooterCopy.links.privacy },
  { href: "/terms", label: globalFooterCopy.links.terms },
  { href: "/disclaimer", label: globalFooterCopy.links.disclaimer },
  { href: "/refund", label: globalFooterCopy.links.refundPolicy },
] satisfies SiteNavItem[];

const profileNav = [
  { href: "/joy-prakash-sarmah", label: "Joy Prakash Sarmah" },
] satisfies SiteNavItem[];

const supportNav = [
  { href: "/sign-in", label: globalNavigationCopy.login },
  { href: "/sign-in", label: globalNavigationCopy.account },
  { href: "/contact", label: globalFooterCopy.links.contact },
  { href: "/privacy", label: globalFooterCopy.links.privacy },
  { href: "/terms", label: globalFooterCopy.links.terms },
  { href: "/disclaimer", label: globalFooterCopy.links.disclaimer },
  { href: "/refund", label: globalFooterCopy.links.refundPolicy },
  { href: "/forgot-password", label: globalNavigationCopy.passwordReset },
] satisfies SiteNavItem[];

export const siteConfig = {
  name: siteName,
  url: siteUrl,
  description:
    "Consultation-first Vedic astrology guidance, Desk articles, methodology and support from NAVAGRAHA CENTRE.",
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
