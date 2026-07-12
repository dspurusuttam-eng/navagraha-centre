"""Card 11.R1 — Skyfield + JPL DE440s primary independent oracle (VALIDATION ONLY).

Reads the shared resolved-instants file (UTC instants resolved by the production
tz owner) and emits geocentric apparent ecliptic-of-date longitudes for the seven
classical bodies, plus an INDEPENDENT osculating True Node derived from the Moon's
geocentric state vector (Gate G1 reference).

Never imported by, installed into, or deployed with the production application.
No network access at runtime (uses the local cached kernel + Skyfield builtin timescale).
"""
from __future__ import annotations

import json
import math
import os
import sys

import numpy as np
from skyfield.api import load, load_file

from kernel_manifest import verify as verify_kernel

HERE = os.path.dirname(os.path.abspath(__file__))
LAB = os.path.dirname(HERE)
REPORTS = os.path.join(LAB, "reports")
KERNEL = os.path.join(LAB, "cache", "de440s.bsp")

BODY_TARGETS = {
    "SUN": ["sun"],
    "MOON": ["moon"],
    "MERCURY": ["mercury", "mercury barycenter"],
    "VENUS": ["venus", "venus barycenter"],
    "MARS": ["mars", "mars barycenter"],
    "JUPITER": ["jupiter barycenter", "jupiter"],
    "SATURN": ["saturn barycenter", "saturn"],
}

DT_DAYS = 0.02  # finite-difference step for longitudinal speed


def norm360(x: float) -> float:
    return x % 360.0


def mean_obliquity_deg(jd_tt: float) -> float:
    """IAU 1980 mean obliquity of date (arcsec poly), degrees."""
    t = (jd_tt - 2451545.0) / 36525.0
    eps_arcsec = 84381.448 - 46.8150 * t - 0.00059 * t * t + 0.001813 * t * t * t
    return eps_arcsec / 3600.0


def precession_lon_deg(jd_tt: float) -> float:
    """IAU 2006 accumulated general precession in longitude from J2000, degrees.
    Converts a J2000-equinox ecliptic longitude to the equinox OF DATE."""
    t = (jd_tt - 2451545.0) / 36525.0
    arcsec = (
        5028.796195 * t
        + 1.1054348 * t * t
        + 0.00007964 * t ** 3
        - 0.000023857 * t ** 4
        - 0.0000000383 * t ** 5
    )
    return arcsec / 3600.0


def resolve_body(eph, names):
    last = None
    for n in names:
        try:
            return eph[n]
        except Exception as e:  # noqa: BLE001
            last = e
    raise KeyError(f"none of {names} in kernel: {last}")


def ecl_lonlat_of_date(earth, body, t):
    """Geocentric apparent ecliptic-of-date lon/lat/dist (deg, deg, AU)."""
    app = (earth.at(t)).observe(body).apparent()
    lat, lon, dist = app.ecliptic_latlon(epoch="date")
    return norm360(lon.degrees), lat.degrees, dist.au


def osculating_true_node_lon(moon, earth, t, jd_tt) -> float:
    """Independent osculating ascending-node longitude (ecliptic-of-date, tropical).

    Method: geocentric Moon state (r, v) in ICRF equatorial -> rotate to ecliptic of
    date by mean obliquity -> angular momentum h = r x v -> ascending-node direction
    n = zhat x h = (-h_y, h_x, 0) -> Omega = atan2(h_x, -h_y). Nutation-in-obliquity
    (<~10") is neglected in this prototype (documented limitation).
    """
    geo = (moon - earth).at(t)
    r = geo.position.au  # ICRF equatorial xyz
    v = geo.velocity.au_per_d
    eps = math.radians(mean_obliquity_deg(jd_tt))
    ce, se = math.cos(eps), math.sin(eps)
    # rotate equatorial -> ecliptic about x-axis by -eps
    def to_ecl(vec):
        x, y, z = vec
        return np.array([x, y * ce + z * se, -y * se + z * ce])
    r_e = to_ecl(r)
    v_e = to_ecl(v)
    h = np.cross(r_e, v_e)
    omega = math.atan2(h[0], -h[1])
    # omega is referenced to the J2000 equinox (ICRF x-axis); precess the origin to
    # the equinox OF DATE so it is directly comparable to swisseph SE_TRUE_NODE (of date).
    return norm360(math.degrees(omega) + precession_lon_deg(jd_tt))


def main():
    kinfo = verify_kernel()
    instants_path = os.path.join(REPORTS, "resolved-instants.json")
    if not os.path.exists(instants_path):
        raise FileNotFoundError(
            "resolved-instants.json missing. Run the current-engine adapter first."
        )
    with open(instants_path, "r", encoding="utf-8") as f:
        instants = json.load(f)

    ts = load.timescale(builtin=True)  # no network; bundled Delta-T
    eph = load_file(KERNEL)
    earth = resolve_body(eph, ["earth"])
    bodies = {name: resolve_body(eph, targets) for name, targets in BODY_TARGETS.items()}
    moon = bodies["MOON"]

    out = {
        "provider": "skyfield-de440s",
        "providerVersion": {
            "skyfield": __import__("skyfield").__version__,
            "numpy": np.__version__,
            "kernel": "de440s.bsp",
            "kernelSha256": kinfo["sha256"],
        },
        "meta": {
            "frame": "geocentric apparent, ecliptic of date",
            "corrections": "light-time + aberration + deflection (apparent); precession+nutation (of date)",
            "timeScale": "UTC->TT via Skyfield builtin Delta-T",
            "nodeMethod": "osculating ascending node from geocentric Moon state vector (mean obliquity of date)",
        },
        "results": {},
    }

    for fid, inst in instants.items():
        iso = inst["utcInstant"]
        # parse ISO (…Z)
        import datetime as _dt

        dt = _dt.datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(_dt.timezone.utc)
        t = ts.from_datetime(dt)
        tp = ts.tt_jd(t.tt + DT_DAYS)
        tm = ts.tt_jd(t.tt - DT_DAYS)
        rec = {"utcInstant": iso, "julianDayTt": t.tt, "bodies": {}}
        for name, body in bodies.items():
            lon, lat, dist = ecl_lonlat_of_date(earth, body, t)
            lon_p, _, _ = ecl_lonlat_of_date(earth, body, tp)
            lon_m, _, _ = ecl_lonlat_of_date(earth, body, tm)
            # unwrap for speed
            d = ((lon_p - lon_m + 540.0) % 360.0) - 180.0
            speed = d / (2 * DT_DAYS)
            rec["bodies"][name] = {
                "tropicalLon": float(lon),
                "eclLat": float(lat),
                "distanceAu": float(dist),
                "lonSpeed": float(speed),
                "retrograde": bool(speed < 0),
            }
        node = osculating_true_node_lon(moon, earth, t, t.tt)
        rec["rahuTrueNodeTropicalLon"] = float(node)
        rec["ketuTropicalLon"] = float(norm360(node + 180.0))
        out["results"][fid] = rec

    os.makedirs(REPORTS, exist_ok=True)
    dst = os.path.join(REPORTS, "skyfield-oracle-results.json")
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, sort_keys=True)
    print(f"skyfield oracle: wrote {len(out['results'])} fixtures -> {dst}")
    print(f"kernel sha256={kinfo['sha256']} range JD {kinfo['coveredJdStart']}..{kinfo['coveredJdEnd']}")


if __name__ == "__main__":
    sys.exit(main())
