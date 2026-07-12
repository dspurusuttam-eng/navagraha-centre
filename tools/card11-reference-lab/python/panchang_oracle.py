"""Card 11.R3 — Panchang & sunrise/sunset oracle (Skyfield + DE440s; VALIDATION ONLY).
Generates >=100 geo/date fixtures and computes independent references for sunrise, sunset,
Tithi/Nakshatra/Yoga/Karana transition instants (root-found), and high-latitude unavailable
cases. Never imported by production."""
from __future__ import annotations

import datetime as dt
import json
import math
import os

import numpy as np
from skyfield import almanac
from skyfield.api import load, load_file, wgs84

from kernel_manifest import verify as verify_kernel

HERE = os.path.dirname(os.path.abspath(__file__))
LAB = os.path.dirname(HERE)
FIX = os.path.join(LAB, "fixtures")
REPORTS = os.path.join(LAB, "reports")
KERNEL = os.path.join(LAB, "cache", "de440s.bsp")

LAHIRI_ANCHOR = 23.85709235
NAK = 360.0 / 27.0


def norm360(x): return x % 360.0
def prec_deg(jd_tt):
    t = (jd_tt - 2451545.0) / 36525.0
    return (5028.796195 * t + 1.1054348 * t * t + 0.00007964 * t**3 - 0.000023857 * t**4 - 0.0000000383 * t**5) / 3600.0
def cand_lahiri(jd_tt): return LAHIRI_ANCHOR + prec_deg(jd_tt)

LOCATIONS = [
    ("London", 51.5074, -0.1278, 0), ("NewYork", 40.7128, -74.0060, 0), ("Delhi", 28.6139, 77.2090, 0),
    ("Tokyo", 35.6762, 139.6503, 0), ("Sydney", -33.8688, 151.2093, 0), ("Kathmandu", 27.7172, 85.3240, 1400),
    ("SaoPaulo", -23.5505, -46.6333, 0), ("Cairo", 30.0444, 31.2357, 0), ("Moscow", 55.7558, 37.6173, 0),
    ("Nairobi", -1.2921, 36.8219, 1795), ("Reykjavik", 64.1466, -21.9426, 0), ("Fiji", -18.1416, 178.4419, 0),
    ("Quito", -0.1807, -78.4678, 2850), ("Tromso", 69.6496, 18.9560, 0), ("McMurdo", -77.8419, 166.6863, 0),
    ("Anchorage", 61.2181, -149.9003, 0), ("Kiritimati", 1.8721, -157.4278, 0), ("Singapore", 1.3521, 103.8198, 0),
]
DATES = ["2000-03-20", "2010-06-21", "2015-09-23", "2020-12-21", "2023-07-15", "2024-01-14"]


class Oracle:
    def __init__(self):
        self.k = verify_kernel()
        self.ts = load.timescale(builtin=True)
        self.eph = load_file(KERNEL)
        self.earth = self.eph["earth"]
        self.sun = self.eph["sun"]
        self.moon = self.eph["moon"]

    def trop(self, body, when):
        t = self.ts.from_datetime(when)
        _, lon, _ = self.earth.at(t).observe(body).apparent().ecliptic_latlon(epoch="date")
        return norm360(lon.degrees)

    def elong(self, when):  # Moon - Sun (ayanamsa-independent)
        return norm360(self.trop(self.moon, when) - self.trop(self.sun, when))

    def moon_sid(self, when):
        t = self.ts.from_datetime(when)
        return norm360(self.trop(self.moon, when) - cand_lahiri(t.tt))

    def yoga_sum(self, when):
        t = self.ts.from_datetime(when)
        lah = cand_lahiri(t.tt)
        return norm360((self.trop(self.sun, when) - lah) + (self.trop(self.moon, when) - lah))

    def sun_rise_set(self, lat, lon, elev, day_start_utc):
        obs = wgs84.latlon(lat, lon, elevation_m=elev)
        t0 = self.ts.from_datetime(day_start_utc)
        t1 = self.ts.from_datetime(day_start_utc + dt.timedelta(days=1))
        try:
            rt, ry = almanac.find_risings(self.earth + obs, self.sun, t0, t1)
            st, sy = almanac.find_settings(self.earth + obs, self.sun, t0, t1)
        except Exception:
            return None, None
        rise = None
        for tt, yy in zip(rt, ry):
            if yy:
                rise = tt.utc_iso(); break
        setr = None
        for tt, yy in zip(st, sy):
            if yy:
                setr = tt.utc_iso(); break
        return rise, setr


def find_next_index_change(index_fn, t0, step_min, max_hours):
    """Next instant where a discrete index changes (monotonic-increasing quantity)."""
    i0 = index_fn(t0)
    t = t0
    step = dt.timedelta(minutes=step_min)
    end = t0 + dt.timedelta(hours=max_hours)
    while t < end:
        tn = t + step
        if index_fn(tn) != i0:
            a, b = t, tn
            for _ in range(60):
                m = a + (b - a) / 2
                if index_fn(m) != i0:
                    b = m
                else:
                    a = m
            return (a + (b - a) / 2)
        t = tn
    return None


def main():
    oc = Oracle()
    fixtures, results = [], {}
    idx = 0
    for (name, lat, lon, elev) in LOCATIONS:
        for d in DATES:
            y, m, dd = map(int, d.split("-"))
            # local day start approximated by UTC midnight of the civil date (deterministic window)
            day0 = dt.datetime(y, m, dd, 0, 0, tzinfo=dt.timezone.utc)
            noon = dt.datetime(y, m, dd, 12, 0, tzinfo=dt.timezone.utc)
            fid = f"PAN-{idx:04d}"
            idx += 1
            fixtures.append({"id": fid, "location": name, "latitude": lat, "longitude": lon, "elevationM": elev,
                             "civilDate": d, "dayStartUtc": day0.isoformat(), "noonUtc": noon.isoformat(),
                             "requested": ["SUNRISE", "SUNSET", "TITHI", "NAKSHATRA", "YOGA", "KARANA"],
                             "highLatitude": abs(lat) >= 66.5})
            rise, setr = oc.sun_rise_set(lat, lon, elev, day0)
            tithi_i = lambda w: int(oc.elong(w) // 12)
            nak_i = lambda w: int(oc.moon_sid(w) // NAK)
            yoga_i = lambda w: int(oc.yoga_sum(w) // NAK)
            kar_i = lambda w: int(oc.elong(w) // 6)
            results[fid] = {
                "sunriseUtc": rise, "sunsetUtc": setr,
                "sunriseAvailable": rise is not None, "sunsetAvailable": setr is not None,
                "tithiIndex": tithi_i(noon), "nakshatraIndex": nak_i(noon), "yogaIndex": yoga_i(noon), "karanaIndex": kar_i(noon),
                "tithiNextUtc": _iso(find_next_index_change(tithi_i, noon, 20, 30)),
                "nakshatraNextUtc": _iso(find_next_index_change(nak_i, noon, 15, 30)),
                "yogaNextUtc": _iso(find_next_index_change(yoga_i, noon, 15, 30)),
                "karanaNextUtc": _iso(find_next_index_change(kar_i, noon, 10, 20)),
            }
    meta = {"provider": "skyfield-de440s", "skyfield": __import__("skyfield").__version__, "kernelSha256": oc.k["sha256"],
            "note": "sunrise/sunset via Skyfield almanac topocentric; tithi/nak/yoga/karana via Sun/Moon root-finding"}
    with open(os.path.join(FIX, "panchang-fixtures.json"), "w") as f:
        json.dump({"schema": "card11-panchang-fixtures-v1", "count": len(fixtures), "fixtures": fixtures}, f, indent=2, sort_keys=True)
    with open(os.path.join(REPORTS, "oracle-panchang.json"), "w") as f:
        json.dump({"meta": meta, "results": results}, f, indent=2, sort_keys=True)
    hi = sum(1 for fx in fixtures if fx["highLatitude"])
    print(f"panchang oracle: {len(fixtures)} fixtures ({hi} high-latitude) -> oracle-panchang.json")


def _iso(x):
    return x.astimezone(dt.timezone.utc).isoformat() if x is not None else None


if __name__ == "__main__":
    main()
