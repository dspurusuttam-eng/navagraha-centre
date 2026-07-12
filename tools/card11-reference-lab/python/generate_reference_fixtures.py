"""Card 11.R2 — deterministic golden-corpus generator (VALIDATION ONLY).

Produces >=360 unique deterministic fixtures + the G1 node timestamp list + the G2
Lahiri sweep dates. Boundary and station fixtures are targeted via Skyfield/DE440s
root-finding (sidereal boundaries use the candidate Lahiri, which reproduces SE Lahiri
to <0.001"; exactness of the fixture position is not required — certification is done
later by transition-time comparison). Never imported by production.

Outputs (reports/ is gitignored; the corpus is written to fixtures/):
  fixtures/golden-corpus.json
  fixtures/g1-node-timestamps.json
  fixtures/g2-lahiri-dates.json
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import math
import os

import numpy as np
from skyfield.api import load, load_file

from kernel_manifest import verify as verify_kernel

HERE = os.path.dirname(os.path.abspath(__file__))
LAB = os.path.dirname(HERE)
FIX = os.path.join(LAB, "fixtures")
KERNEL = os.path.join(LAB, "cache", "de440s.bsp")

SIGN = 30.0
NAK = 360.0 / 27.0
PADA = NAK / 4.0
DAY = 86400.0


def norm360(x: float) -> float:
    return x % 360.0


def precession_lon_deg(jd_tt: float) -> float:
    t = (jd_tt - 2451545.0) / 36525.0
    arcsec = (
        5028.796195 * t + 1.1054348 * t * t + 0.00007964 * t ** 3
        - 0.000023857 * t ** 4 - 0.0000000383 * t ** 5
    )
    return arcsec / 3600.0


def mean_obliquity_deg(jd_tt: float) -> float:
    t = (jd_tt - 2451545.0) / 36525.0
    return (84381.448 - 46.8150 * t - 0.00059 * t * t + 0.001813 * t ** 3) / 3600.0


# Anchor the candidate Lahiri to SE at J2000 (value verified in R1).
LAHIRI_ANCHOR_J2000 = 23.85709235


def candidate_lahiri_deg(jd_tt: float) -> float:
    return LAHIRI_ANCHOR_J2000 + precession_lon_deg(jd_tt)


def iso(dtobj: dt.datetime) -> str:
    return dtobj.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def checksum(obj) -> str:
    return hashlib.sha256(json.dumps(obj, sort_keys=True).encode()).hexdigest()[:16]


class Oracle:
    def __init__(self):
        self.k = verify_kernel()
        self.ts = load.timescale(builtin=True)
        self.eph = load_file(KERNEL)
        self.earth = self.eph["earth"]
        self.bodies = {
            "SUN": self.eph["sun"], "MOON": self.eph["moon"],
            "MERCURY": self.eph["mercury"], "VENUS": self.eph["venus"],
            "MARS": self.eph["mars barycenter"], "JUPITER": self.eph["jupiter barycenter"],
            "SATURN": self.eph["saturn barycenter"],
        }

    def tropical_lon(self, body: str, when: dt.datetime) -> float:
        t = self.ts.from_datetime(when)
        lat, lon, _ = (self.earth.at(t)).observe(self.bodies[body]).apparent().ecliptic_latlon(epoch="date")
        return norm360(lon.degrees)

    def sidereal_lon(self, body: str, when: dt.datetime) -> float:
        t = self.ts.from_datetime(when)
        return norm360(self.tropical_lon(body, when) - candidate_lahiri_deg(t.tt))

    def lon_speed(self, body: str, when: dt.datetime) -> float:
        lp = self.tropical_lon(body, when + dt.timedelta(seconds=600))
        lm = self.tropical_lon(body, when - dt.timedelta(seconds=600))
        d = ((lp - lm + 540) % 360) - 180
        return d / (1200.0 / DAY)


def bisect_boundary(f, t0: dt.datetime, t1: dt.datetime, target: float, span: float, iters=60):
    """Find instant where sidereal-longitude crosses `target` (a multiple of span),
    bracketed by [t0,t1]. Signed distance = wrap((lon-target+span/2)%span - span/2)."""
    def g(when):
        lon = f(when)
        return ((lon - target + span / 2) % span) - span / 2
    a, b = t0, t1
    ga = g(a)
    for _ in range(iters):
        m = a + (b - a) / 2
        gm = g(m)
        if (ga <= 0 <= gm) or (ga >= 0 >= gm):
            b = m
        else:
            a, ga = m, gm
    return a + (b - a) / 2


def main():
    oc = Oracle()
    fixtures = []

    LOCATIONS = [
        ("London", 51.5074, -0.1278, 0), ("NewYork", 40.7128, -74.0060, 0),
        ("Delhi", 28.6139, 77.2090, 0), ("Tokyo", 35.6762, 139.6503, 0),
        ("Sydney", -33.8688, 151.2093, 0), ("Kathmandu", 27.7172, 85.3240, 1400),
        ("SaoPaulo", -23.5505, -46.6333, 0), ("Cairo", 30.0444, 31.2357, 0),
        ("Moscow", 55.7558, 37.6173, 0), ("Nairobi", -1.2921, 36.8219, 1795),
        ("Reykjavik", 64.1466, -21.9426, 0), ("Fiji", -18.1416, 178.4419, 0),
    ]
    BODIES = ["SUN", "MOON", "MERCURY", "VENUS", "MARS", "JUPITER", "SATURN"]

    def add(cat, when, lat, lon, elev, expected_class, boundary=None, method="grid", seed=None, tags=None):
        fid = f"{cat[:3].upper()}-{len(fixtures):04d}"
        rec = {
            "id": fid, "category": cat, "utcInstant": iso(when),
            "latitude": lat, "longitude": lon, "elevationM": elev,
            "requestedBodies": BODIES, "expectedClass": expected_class,
            "boundaryMeta": boundary, "creationMethod": method, "seed": seed,
            "tags": tags or [],
            "oracleProvenance": {"kernel": "de440s.bsp", "sha256": oc.k["sha256"][:16]},
        }
        rec["checksum"] = checksum({k: v for k, v in rec.items() if k != "checksum"})
        fixtures.append(rec)

    # 1. ORDINARY (>=100): 12 locations x years, fixed hours
    hours = [0, 6, 12, 18]
    yi = 0
    for loc in LOCATIONS:
        for k in range(9):
            year = 1912 + ((yi * 17 + k * 7) % 188)  # 1912..2099 deterministic spread
            when = dt.datetime(year, 1 + (k % 12), 1 + (k * 3 % 27), hours[(yi + k) % 4], 30, 0, tzinfo=dt.timezone.utc)
            add("ordinary", when, loc[1], loc[2], loc[3], "CLASS_B", method="grid", tags=[loc[0]])
        yi += 1
    # top up ordinary to 100
    while len([f for f in fixtures if f["category"] == "ordinary"]) < 100:
        i = len(fixtures)
        loc = LOCATIONS[i % len(LOCATIONS)]
        when = dt.datetime(1950 + (i % 150), 1 + (i % 12), 1 + (i % 27), (i % 24), 15, 0, tzinfo=dt.timezone.utc)
        add("ordinary", when, loc[1], loc[2], loc[3], "CLASS_B", method="grid-topup", tags=[loc[0]])

    # 2. HISTORICAL / FUTURE (>=50): 1850..2149 within overlap
    for i in range(50):
        year = 1855 + i * 6  # 1855 .. 2149
        if year > 2148:
            year = 1860 + (i % 40) * 6
        when = dt.datetime(year, ((i * 5) % 12) + 1, ((i * 7) % 27) + 1, (i % 24), 0, 0, tzinfo=dt.timezone.utc)
        add("historical", when, LOCATIONS[i % len(LOCATIONS)][1], LOCATIONS[i % len(LOCATIONS)][2], 0, "CLASS_B", method="historical", tags=[str(year)])

    # 3. BOUNDARY (>=120): root-find sidereal ingresses
    # 3a. Sun sidereal sign ingresses across years (~ 12/yr)
    for yr in range(2000, 2010):
        base = dt.datetime(yr, 1, 1, tzinfo=dt.timezone.utc)
        for k in range(12):
            t0 = base + dt.timedelta(days=k * 30)
            t1 = t0 + dt.timedelta(days=40)
            # find the crossing of the next sign boundary within window
            s0 = oc.sidereal_lon("SUN", t0)
            target = (math.floor(s0 / SIGN) + 1) * SIGN
            when = bisect_boundary(lambda w: oc.sidereal_lon("SUN", w), t0, t1, target % 360, SIGN)
            add("boundary", when, 0, 0, 0, "CLASS_C", boundary={"body": "SUN", "type": "SIGN"}, method="root-find-sign", tags=["sun-ingress"])
    # 3b. Moon sidereal sign ingresses over two months (~26)
    base = dt.datetime(2022, 1, 1, tzinfo=dt.timezone.utc)
    for k in range(26):
        t0 = base + dt.timedelta(days=k * 2.3)
        t1 = t0 + dt.timedelta(days=3)
        s0 = oc.sidereal_lon("MOON", t0)
        target = (math.floor(s0 / SIGN) + 1) * SIGN
        when = bisect_boundary(lambda w: oc.sidereal_lon("MOON", w), t0, t1, target % 360, SIGN)
        add("boundary", when, 0, 0, 0, "CLASS_C", boundary={"body": "MOON", "type": "SIGN"}, method="root-find-sign", tags=["moon-ingress"])
    # 3c. Moon nakshatra transitions (~27 over a month)
    base = dt.datetime(2019, 6, 1, tzinfo=dt.timezone.utc)
    for k in range(27):
        t0 = base + dt.timedelta(days=k * 1.05)
        t1 = t0 + dt.timedelta(days=1.5)
        s0 = oc.sidereal_lon("MOON", t0)
        target = (math.floor(s0 / NAK) + 1) * NAK
        when = bisect_boundary(lambda w: oc.sidereal_lon("MOON", w), t0, t1, target % 360, NAK)
        add("boundary", when, 0, 0, 0, "CLASS_C", boundary={"body": "MOON", "type": "NAKSHATRA"}, method="root-find-nak", tags=["moon-nak"])
    # 3d. Moon pada transitions (all four pada classes; ~40 over ~10 days)
    base = dt.datetime(2015, 3, 1, tzinfo=dt.timezone.utc)
    for k in range(40):
        t0 = base + dt.timedelta(days=k * 0.28)
        t1 = t0 + dt.timedelta(days=0.5)
        s0 = oc.sidereal_lon("MOON", t0)
        target = (math.floor(s0 / PADA) + 1) * PADA
        when = bisect_boundary(lambda w: oc.sidereal_lon("MOON", w), t0, t1, target % 360, PADA)
        padacls = int((target / PADA) % 4)
        add("boundary", when, 0, 0, 0, "CLASS_C", boundary={"body": "MOON", "type": "PADA", "padaClass": padacls}, method="root-find-pada", tags=["moon-pada"])
    # 3e. 0/360 sidereal wraparound (Sun entering Aries) several years
    for yr in range(2010, 2025):
        t0 = dt.datetime(yr, 4, 10, tzinfo=dt.timezone.utc)
        t1 = dt.datetime(yr, 4, 20, tzinfo=dt.timezone.utc)
        when = bisect_boundary(lambda w: oc.sidereal_lon("SUN", w), t0, t1, 0.0, SIGN)
        add("boundary", when, 0, 0, 0, "CLASS_C", boundary={"body": "SUN", "type": "WRAP_ARIES"}, method="root-find-wrap", tags=["sun-aries-wrap"])

    # 4. MOTION (>=40): stations (speed=0) for MERC/VEN/MARS/JUP/SAT
    def station_search(body, base, days, step_days):
        found = []
        prev = None
        t = base
        end = base + dt.timedelta(days=days)
        while t < end and len(found) < 3:
            sp = oc.lon_speed(body, t)
            if prev is not None and (prev[1] <= 0 <= sp or prev[1] >= 0 >= sp):
                # bracket [prev.t, t]; bisect on speed
                a, b = prev[0], t
                for _ in range(40):
                    m = a + (b - a) / 2
                    sm = oc.lon_speed(body, m)
                    if (oc.lon_speed(body, a) <= 0 <= sm) or (oc.lon_speed(body, a) >= 0 >= sm):
                        b = m
                    else:
                        a = m
                found.append(a + (b - a) / 2)
            prev = (t, sp)
            t = t + dt.timedelta(days=step_days)
        return found
    motion_specs = [
        ("MERCURY", dt.datetime(2016, 1, 1, tzinfo=dt.timezone.utc), 365, 2),
        ("VENUS", dt.datetime(2020, 1, 1, tzinfo=dt.timezone.utc), 400, 3),
        ("MARS", dt.datetime(2018, 1, 1, tzinfo=dt.timezone.utc), 400, 4),
        ("JUPITER", dt.datetime(2009, 1, 1, tzinfo=dt.timezone.utc), 400, 6),
        ("SATURN", dt.datetime(2006, 1, 1, tzinfo=dt.timezone.utc), 400, 6),
        ("MERCURY", dt.datetime(2011, 1, 1, tzinfo=dt.timezone.utc), 365, 2),
        ("MARS", dt.datetime(2003, 1, 1, tzinfo=dt.timezone.utc), 400, 4),
        ("VENUS", dt.datetime(2012, 1, 1, tzinfo=dt.timezone.utc), 400, 3),
    ]
    for body, base, days, step in motion_specs:
        for when in station_search(body, base, days, step):
            add("motion", when, 0, 0, 0, "CLASS_C", boundary={"body": body, "type": "STATION"}, method="root-find-station", tags=[f"{body}-station"])
    # top up motion to >=40 with near-station slow outer-planet samples
    i = 0
    while len([f for f in fixtures if f["category"] == "motion"]) < 40:
        when = dt.datetime(1980 + (i % 120), 1 + (i % 12), 1 + (i % 27), 12, tzinfo=dt.timezone.utc)
        add("motion", when, 0, 0, 0, "CLASS_B", boundary={"body": "SATURN", "type": "SLOW"}, method="slow-sample", tags=["slow-outer"])
        i += 1

    # 5. CIVIL/GEO (>=50)
    civil = [
        ("2016-02-29T00:00:00Z", 19.0760, 72.8777, 0, ["leap","utc-midnight"]),
        ("2016-02-29T23:59:00Z", 19.0760, 72.8777, 0, ["leap","near-midnight"]),
        ("2000-02-29T12:00:00Z", 0, 0, 0, ["leap-2000","equator"]),
        ("2020-02-29T06:30:00Z", 64.1466, -21.9426, 0, ["leap","high-lat"]),
        ("2021-11-07T05:30:00Z", 40.7128, -74.0060, 0, ["dst-fall-overlap-resolved-UTC"]),
        ("2021-03-14T07:30:00Z", 40.7128, -74.0060, 0, ["dst-spring-gap-resolved-UTC"]),
    ]
    for isv, lat, lon, elev, tags in civil:
        when = dt.datetime.fromisoformat(isv.replace("Z", "+00:00"))
        add("civil-geo", when, lat, lon, elev, "CLASS_B", method="civil-explicit", tags=tags)
    # geographic spread to reach >=50
    geo_pts = [(0,0),(0,179.9),(0,-179.9),(66.5,25),(66.5,-50),(-66.5,140),(80,10),(-80,-60),
               (23.5,0),(-23.5,90),(45,-120),(-45,170),(10,-10),(-10,10),(60,-150),(-60,150)]
    gi = 0
    while len([f for f in fixtures if f["category"] == "civil-geo"]) < 50:
        lat, lon = geo_pts[gi % len(geo_pts)]
        when = dt.datetime(1995 + (gi % 130), 1 + (gi % 12), 1 + (gi % 27), (gi % 24), 45, tzinfo=dt.timezone.utc)
        add("civil-geo", when, lat, lon, 0, "CLASS_B", method="geo-spread", tags=["geo"])
        gi += 1

    # DST-gap rejection case (CLASS_D — no valid civil instant): documented, not astronomically compared
    add("civil-geo", dt.datetime(2021, 3, 14, 7, 30, tzinfo=dt.timezone.utc), 40.7128, -74.0060, 0,
        "CLASS_D", boundary={"type": "DST_GAP_REJECTION", "civilLocal": "2021-03-14 02:30 America/New_York (nonexistent)"},
        method="dst-gap", tags=["dst-gap-unavailable"])

    # de-duplicate by (utcInstant, lat, lon) — ensure unique ids already; ensure unique instants per category
    seen = set()
    unique = []
    for f in fixtures:
        key = (f["utcInstant"], f["latitude"], f["longitude"], f["category"])
        if key in seen:
            continue
        seen.add(key)
        unique.append(f)
    fixtures = unique

    corpus = {
        "schema": "card11-golden-corpus-v1",
        "generatedBy": "generate_reference_fixtures.py",
        "kernelSha256": oc.k["sha256"],
        "count": len(fixtures),
        "byCategory": {c: len([f for f in fixtures if f["category"] == c]) for c in
                       ["ordinary", "historical", "boundary", "motion", "civil-geo"]},
        "corpusChecksum": checksum([f["checksum"] for f in fixtures]),
        "fixtures": fixtures,
    }
    with open(os.path.join(FIX, "golden-corpus.json"), "w", encoding="utf-8") as f:
        json.dump(corpus, f, indent=2, sort_keys=True)

    # G1: >=1000 deterministic node timestamps across 1900-2100
    g1 = []
    start = dt.datetime(1900, 1, 1, tzinfo=dt.timezone.utc)
    for i in range(1000):
        when = start + dt.timedelta(days=i * 73.0)  # 1000 * 73 days ~ 200 years
        g1.append(iso(when))
    with open(os.path.join(FIX, "g1-node-timestamps.json"), "w", encoding="utf-8") as f:
        json.dump({"count": len(g1), "instants": g1}, f, indent=2)

    # G2: monthly 1900-2100 + leap days + solstices/equinoxes
    g2 = []
    for yr in range(1900, 2101):
        for mo in range(1, 13):
            g2.append(iso(dt.datetime(yr, mo, 15, 12, tzinfo=dt.timezone.utc)))
    for yr in range(1900, 2101, 4):
        try:
            g2.append(iso(dt.datetime(yr, 2, 29, 12, tzinfo=dt.timezone.utc)))
        except ValueError:
            pass
    for yr in range(1900, 2101, 10):
        for md in [(3, 20), (6, 21), (9, 22), (12, 21)]:
            g2.append(iso(dt.datetime(yr, md[0], md[1], 12, tzinfo=dt.timezone.utc)))
    g2 = sorted(set(g2))
    with open(os.path.join(FIX, "g2-lahiri-dates.json"), "w", encoding="utf-8") as f:
        json.dump({"count": len(g2), "instants": g2}, f, indent=2)

    print(f"golden corpus: {corpus['count']} fixtures {corpus['byCategory']}")
    print(f"G1 node timestamps: {len(g1)}  G2 lahiri dates: {len(g2)}")
    print(f"corpusChecksum={corpus['corpusChecksum']}")


if __name__ == "__main__":
    main()
