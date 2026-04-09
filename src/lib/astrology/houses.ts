import "server-only";

import { signRulerMap } from "@/lib/astrology/constants";
import {
  buildJulianDayFromLocal,
  calculateHouseCuspsRaw,
  getZodiacSignFromLongitude,
  normalizeLongitude,
} from "@/lib/astrology/ephemeris";
import type { HousePlacement, HouseSystem } from "@/modules/astrology/types";

export type HouseComputation = {
  houses: HousePlacement[];
  houseCusps: number[];
  ascendantLongitude: number;
  mcLongitude: number;
};

export function calculateHouses(
  dateLocal: string,
  timeLocal: string,
  latitude: number,
  longitude: number,
  timezone = "UTC",
  houseSystem: HouseSystem = "WHOLE_SIGN"
): HouseComputation {
  const { julianDayUt } = buildJulianDayFromLocal(
    dateLocal,
    timeLocal,
    timezone
  );
  const rawHouses = calculateHouseCuspsRaw(
    julianDayUt,
    latitude,
    longitude,
    houseSystem
  );
  const houseCusps = rawHouses.house.slice(0, 12).map(normalizeLongitude);

  return {
    houses: houseCusps.map((cuspLongitude, index) => {
      const sign = getZodiacSignFromLongitude(cuspLongitude);

      return {
        house: (index + 1) as HousePlacement["house"],
        sign,
        ruler: signRulerMap[sign],
        cuspLongitude,
        nextCuspLongitude: houseCusps[(index + 1) % 12],
      };
    }),
    houseCusps,
    ascendantLongitude: normalizeLongitude(rawHouses.ascendant),
    mcLongitude: normalizeLongitude(rawHouses.mc),
  };
}
