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
] satisfies SiteNavItem[];

const appNav = [] satisfies SiteNavItem[];

const adminNav = [] satisfies SiteNavItem[];

const foundationNav = [] satisfies SiteNavItem[];

const offeringsNav = [
  { href: "/consultation", label: globalNavigationCopy.consultation },
  { href: "/joy-prakash-sarmah", label: "Acharya" },
  { href: "/from-the-desk", label: "Desk" },
  { href: "/methodology", label: "Methodology" },
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
  { href: "/contact", label: globalFooterCopy.links.contact },
  { href: "/privacy", label: globalFooterCopy.links.privacy },
  { href: "/terms", label: globalFooterCopy.links.terms },
  { href: "/disclaimer", label: globalFooterCopy.links.disclaimer },
  { href: "/refund", label: globalFooterCopy.links.refundPolicy },
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
