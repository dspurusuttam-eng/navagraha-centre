import { getPublicEnvironment } from "@/config/env";
import {
  globalCtaCopy,
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
  { href: "/kundli", label: globalNavigationCopy.kundli },
  { href: "/compatibility", label: globalNavigationCopy.compatibility },
  { href: "/rashifal", label: globalNavigationCopy.rashifal },
  { href: "/tools", label: globalNavigationCopy.tools },
  { href: "/panchang", label: globalNavigationCopy.panchang },
  { href: "/muhurta", label: globalNavigationCopy.timeTools },
  { href: "/ai", label: globalNavigationCopy.ai },
  { href: "/numerology", label: globalFooterCopy.links.numerology },
  { href: "/calculators", label: globalNavigationCopy.calculators },
  { href: "/reports", label: globalNavigationCopy.reports },
  { href: "/consultation", label: globalNavigationCopy.consultation },
  { href: "/shop", label: globalNavigationCopy.shop },
  { href: "/insights", label: globalNavigationCopy.insights },
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
  { href: "/sign-up", label: globalCtaCopy.generateKundli },
  { href: "/marriage-compatibility", label: globalNavigationCopy.compatibility },
  { href: "/daily-rashifal", label: globalNavigationCopy.dailyRashifal },
  { href: "/tools", label: globalFooterCopy.links.allTools },
  { href: "/panchang", label: globalNavigationCopy.panchang },
  { href: "/muhurta", label: globalNavigationCopy.timeTools },
  { href: "/numerology", label: globalFooterCopy.links.numerology },
  { href: "/calculators", label: globalNavigationCopy.calculators },
  { href: "/career-report", label: globalNavigationCopy.reports },
  { href: "/consultation", label: globalNavigationCopy.consultation },
  { href: "/kundli-ai", label: globalNavigationCopy.ai },
  { href: "/sign-in", label: globalNavigationCopy.login },
  { href: "/dashboard", label: globalNavigationCopy.account },
  { href: "/contact", label: globalFooterCopy.links.contact },
  { href: "/about", label: globalFooterCopy.links.about },
  { href: "/services", label: globalNavigationCopy.services },
  { href: "/privacy", label: globalFooterCopy.links.privacy },
  { href: "/terms", label: globalFooterCopy.links.terms },
  { href: "/disclaimer", label: globalFooterCopy.links.disclaimer },
  { href: "/refund-cancellation", label: globalFooterCopy.links.refundPolicy },
  { href: "/pricing", label: globalNavigationCopy.plans },
  { href: "/shop", label: globalNavigationCopy.shop },
  { href: "/insights", label: globalNavigationCopy.insights },
] satisfies SiteNavItem[];

const profileNav = [
  { href: "/joy-prakash-sarmah", label: "Joy Prakash Sarmah" },
] satisfies SiteNavItem[];

const supportNav = [
  { href: "/sign-in", label: globalNavigationCopy.login },
  { href: "/dashboard", label: globalNavigationCopy.account },
  { href: "/contact", label: globalFooterCopy.links.contact },
  { href: "/privacy", label: globalFooterCopy.links.privacy },
  { href: "/terms", label: globalFooterCopy.links.terms },
  { href: "/disclaimer", label: globalFooterCopy.links.disclaimer },
  { href: "/refund-cancellation", label: globalFooterCopy.links.refundPolicy },
  { href: "/forgot-password", label: globalNavigationCopy.passwordReset },
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
