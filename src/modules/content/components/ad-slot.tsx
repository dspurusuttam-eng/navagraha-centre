import { AdSlot as MonetizationAdSlot } from "@/components/monetization/AdSlot";

type LegacyAdSlotPlacement =
  | "after-intro"
  | "mid-article"
  | "before-related"
  | "sidebar";

type LegacyAdSlotProps = {
  placement: LegacyAdSlotPlacement;
  format?: "banner" | "rectangle" | "responsive";
  className?: string;
};

const placementMap: Record<
  LegacyAdSlotPlacement,
  | "blog_after_intro"
  | "blog_mid_article"
  | "blog_before_related"
  | "sidebar_desktop"
> = {
  "after-intro": "blog_after_intro",
  "mid-article": "blog_mid_article",
  "before-related": "blog_before_related",
  sidebar: "sidebar_desktop",
};

export function AdSlot({
  placement,
  format = "responsive",
  className,
}: Readonly<LegacyAdSlotProps>) {
  return (
    <MonetizationAdSlot
      placement={placementMap[placement]}
      format={format}
      className={className}
      showPlaceholder
    />
  );
}

