import { planetLabelMap, zodiacSignLabelMap } from "@/lib/astrology/constants";
import type { HousePlacement } from "@/modules/astrology/types";
import type { AstrologyHousePlacementSummary } from "@/modules/astrology/core/types";

export function buildHousePlacementSummary(
  placement: HousePlacement
): AstrologyHousePlacementSummary {
  return {
    house: placement.house,
    sign: placement.sign,
    ruler: placement.ruler,
    label: `${placement.house} house in ${zodiacSignLabelMap[placement.sign]} ruled by ${planetLabelMap[placement.ruler]}`,
  };
}
