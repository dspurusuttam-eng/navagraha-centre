import "server-only";

import { calculateHouses } from "@/lib/astrology/houses";
import {
  getDegreeMinute,
  getNakshatraPlacement,
  getZodiacSignFromLongitude,
} from "@/lib/astrology/ephemeris";
import type { HouseSystem, LagnaDetails } from "@/modules/astrology/types";

export function calculateAscendant(
  dateLocal: string,
  timeLocal: string,
  latitude: number,
  longitude: number,
  timezone = "UTC",
  houseSystem: HouseSystem = "WHOLE_SIGN"
): LagnaDetails {
  const { ascendantLongitude } = calculateHouses(
    dateLocal,
    timeLocal,
    latitude,
    longitude,
    timezone,
    houseSystem
  );
  const { degree, minute } = getDegreeMinute(ascendantLongitude);

  return {
    sign: getZodiacSignFromLongitude(ascendantLongitude),
    longitude: ascendantLongitude,
    degree,
    minute,
    nakshatra: getNakshatraPlacement(ascendantLongitude),
  };
}
