import Link from "next/link";
import { NavigationLink } from "@/components/site/navigation-link";
import {
  SiteDrawer,
  type SiteDrawerGroup,
  type SiteDrawerItem,
} from "@/components/site/site-drawer";
import { Container } from "@/components/ui/container";
import type { NavagrahaIconRegistryKey } from "@/components/icons/navagraha-icon-registry";
import {
  featureStatusRegistry,
  primaryNavigationFeatures,
  type FeatureStatusRegistryEntry,
} from "@/config/feature-status-registry";
import { defaultLocale } from "@/modules/localization/config";
import { getGlobalCopyBundleForLocale } from "@/modules/localization/copy";
import {
  getRequestLocale,
  hasExplicitLocalePrefixInRequest,
} from "@/modules/localization/request";
import { getLocalizedRoutePath } from "@/modules/localization/routes";

type NavigationItem = {
  href: string;
  label: string;
};

function getFeature(featureKey: string) {
  return featureStatusRegistry.find(
    (feature) => feature.featureKey === featureKey
  );
}

function getFeatureRoute(featureKey: string) {
  return getFeature(featureKey)?.route ?? "/";
}

function toDrawerItem(
  feature: FeatureStatusRegistryEntry,
  localizeHref: (href: string) => string
): SiteDrawerItem | null {
  if (feature.visibility !== "LIVE" || !feature.runtimeEnabled) {
    return null;
  }

  return {
    href: localizeHref(feature.route),
    iconName:
      feature.iconKey === "text-fallback"
        ? null
        : (feature.iconKey as NavagrahaIconRegistryKey),
    label: feature.label,
  };
}

function getDrawerItems(
  featureKeys: readonly string[],
  localizeHref: (href: string) => string,
  labelOverrides?: Partial<Record<string, string>>
) {
  return featureKeys.flatMap((featureKey) => {
    const feature = getFeature(featureKey);
    const item = feature ? toDrawerItem(feature, localizeHref) : null;

    return item
      ? [{ ...item, label: labelOverrides?.[featureKey] ?? item.label }]
      : [];
  });
}

export async function Header() {
  const requestLocale = await getRequestLocale();
  const hasExplicitLocalePrefix = await hasExplicitLocalePrefixInRequest();
  const copy = await getGlobalCopyBundleForLocale(requestLocale);

  const localizeHref = (href: string) =>
    getLocalizedRoutePath(requestLocale, href, {
      forcePrefix: hasExplicitLocalePrefix || requestLocale !== defaultLocale,
    });

  const desktopNavigationPrimary: readonly NavigationItem[] =
    primaryNavigationFeatures
      .filter((feature) => ["desk", "consult"].includes(feature.featureKey))
      .map((feature) => ({
        href: localizeHref(feature.route),
        label: feature.label,
      }));

  const drawerGroups: readonly SiteDrawerGroup[] = [
    {
      title: "MAIN",
      items: getDrawerItems(
        ["home", "desk", "consult", "acharya"],
        localizeHref
      ),
    },
    {
      title: "DISCOVER",
      items: getDrawerItems(
        ["search", "learn", "methodology"],
        localizeHref,
        { methodology: "Methodology" }
      ),
    },
    {
      title: "SUPPORT",
      items: getDrawerItems(["support", "contact"], localizeHref),
    },
    {
      title: "LEGAL",
      items: getDrawerItems(
        ["privacy", "terms", "disclaimer", "refund-cancellation"],
        localizeHref
      ),
    },
  ];
  const drawerAccountItems = getDrawerItems(["account"], localizeHref);

  const searchHref = localizeHref(getFeatureRoute("search"));
  const accountHref = localizeHref(getFeatureRoute("account"));

  return (
    <header
      data-nosnippet
      className="sticky top-0 z-50 bg-white xl:bg-transparent"
    >
      <div className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(185,139,70,0.16)] bg-white shadow-[0_1px_0_rgba(17,17,17,0.05),0_8px_20px_rgba(17,17,17,0.06)] xl:hidden">
        <Container className="!px-[10px] py-1.5 min-[390px]:!px-3 sm:!px-8">
          <div className="flex min-h-[3.5rem] w-full items-center justify-between gap-1.5 min-[390px]:gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 min-[390px]:gap-2">
              <SiteDrawer
                accountItems={drawerAccountItems}
                currentLocale={requestLocale}
                groups={drawerGroups}
                triggerClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(17,17,17,0.08)] bg-white text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_8px_rgba(17,17,17,0.06)] transition hover:border-[rgba(185,139,70,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
                triggerContent={
                  <span
                    aria-hidden="true"
                    className="text-[1.4rem] leading-none text-[#111111]"
                  >
                    {"\u2630"}
                  </span>
                }
                triggerLabel={copy.navigation.menu}
              />

              <Link
                href={localizeHref("/")}
                className="flex min-h-11 min-w-0 flex-1 items-center gap-1.5 transition [transition-duration:var(--motion-duration-base)] hover:opacity-90"
              >
                <span className="block min-w-0 truncate whitespace-nowrap text-[13px] font-bold uppercase leading-none tracking-[0.02em] text-[#111111] min-[390px]:text-[14px] min-[430px]:text-[15px] min-[430px]:tracking-[0.04em] sm:text-[16px] sm:tracking-[0.06em]">
                  NAVAGRAHA
                </span>
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Link
                href={searchHref}
                aria-label="Search"
                className="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[rgba(185,139,70,0.22)] bg-white px-2.5 text-[12px] font-bold uppercase tracking-[0.02em] text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(17,17,17,0.07)] transition hover:border-[rgba(185,139,70,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] min-[390px]:px-3 min-[430px]:text-[13px]"
              >
                Search
              </Link>

              <Link
                href={accountHref}
                aria-label="Account"
                className="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[rgba(76,187,23,0.24)] bg-white px-2.5 text-[12px] font-bold uppercase tracking-[0.02em] text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(17,17,17,0.07)] transition hover:border-[rgba(76,187,23,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] min-[390px]:px-3 min-[430px]:text-[13px]"
              >
                Account
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <div className="h-[3.75rem] xl:hidden" aria-hidden="true" />

      <Container className="!px-3 py-2 sm:!px-8 lg:!px-10 xl:pb-4 xl:pt-2">
        <div className="hidden xl:flex">
          <div className="flex w-full items-center justify-between gap-5 rounded-[1.7rem] border border-[rgba(185,139,70,0.18)] bg-white px-5 py-3.5 shadow-[0_1px_0_rgba(17,17,17,0.04),0_14px_30px_rgba(17,17,17,0.055)] 2xl:px-6">
            <SiteDrawer
              accountItems={drawerAccountItems}
              currentLocale={requestLocale}
              groups={drawerGroups}
              triggerClassName="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-[rgba(185,139,70,0.22)] bg-white px-4 text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-ink-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(17,17,17,0.05)] transition hover:border-[rgba(185,139,70,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)]"
              triggerContent="Menu"
              triggerLabel={copy.navigation.menu}
            />

            <Link
              href={localizeHref("/")}
              className="flex min-h-11 min-w-0 shrink-0 items-center gap-3 pr-4 transition [transition-duration:var(--motion-duration-base)] hover:opacity-90"
            >
              <span className="block min-w-0 whitespace-nowrap">
                <span className="block text-[1.05rem] font-bold uppercase leading-none tracking-[0.2em] text-[#050505] xl:text-[1.08rem] 2xl:text-[1.14rem]">
                  NAVAGRAHA CENTRE
                </span>
              </span>
            </Link>

            <nav
              aria-label="Primary navigation"
              className="flex min-w-0 flex-1 items-center justify-end gap-1.5 2xl:gap-2"
            >
              {desktopNavigationPrimary.map((item) => (
                <NavigationLink
                  key={item.href}
                  href={item.href}
                  className="min-h-11 rounded-full border border-transparent bg-transparent px-3 text-[0.68rem] font-semibold tracking-[0.08em] !text-[color:var(--color-ink-strong)] shadow-none hover:border-[rgba(185,139,70,0.22)] hover:bg-[rgba(185,139,70,0.06)] hover:!text-black 2xl:px-4"
                  activeClassName="rounded-full border-[rgba(185,139,70,0.28)] bg-white !text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(17,17,17,0.06)]"
                >
                  {item.label}
                </NavigationLink>
              ))}
              <Link
                href={searchHref}
                aria-label="Search"
                className="inline-flex min-h-11 items-center rounded-full border border-transparent bg-transparent px-3 text-[0.68rem] font-semibold tracking-[0.08em] !text-[color:var(--color-ink-strong)] shadow-none transition hover:border-[rgba(185,139,70,0.22)] hover:bg-[rgba(185,139,70,0.06)] hover:!text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-ring)] 2xl:px-4"
              >
                Search
              </Link>
              <NavigationLink
                href={accountHref}
                className="min-h-11 rounded-full border border-[rgba(76,187,23,0.22)] bg-white px-3 text-[0.68rem] font-semibold tracking-[0.08em] !text-[color:var(--color-ink-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(17,17,17,0.05)] hover:border-[rgba(76,187,23,0.38)] hover:!text-black 2xl:px-4"
                activeClassName="rounded-full border-[rgba(76,187,23,0.38)] bg-white !text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(17,17,17,0.06)]"
              >
                Account
              </NavigationLink>
            </nav>
          </div>
        </div>
      </Container>
    </header>
  );
}
